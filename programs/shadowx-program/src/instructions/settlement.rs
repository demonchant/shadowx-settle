use anchor_lang::prelude::*;
use anchor_lang::solana_program::clock::Clock;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};

use crate::state::*;
use crate::errors::ShadowXError;
use crate::events::*;
use crate::arcium_verify::{verify_arcium_authority, read_oracle_price};
use crate::constants::*;

// ════════════════════════════════════════════════════════════════
//  BUNDLE VALIDATION (security critical)
// ════════════════════════════════════════════════════════════════

pub fn validate_bundle(bundle: &SettlementBundle) -> Result<()> {
    require!(
        !bundle.execution_prices.is_empty(),
        ShadowXError::EmptyBundle
    );
    require!(
        bundle.execution_prices.len() == bundle.fill_amounts.len(),
        ShadowXError::BundleArityMismatch
    );
    require!(
        bundle.execution_prices.len() <= MAX_BUNDLE_INTENTS,
        ShadowXError::BundleTooLarge
    );
    Ok(())
}

// ════════════════════════════════════════════════════════════════
//  ACCOUNTS
//
//  bundle_state is a PDA seeded with [b"bundle", bundle.bundle_hash]
//  using `init` so a second execution of the same bundle fails because
//  the PDA already exists. This is the replay protection.
// ════════════════════════════════════════════════════════════════

#[derive(Accounts)]
#[instruction(bundle: SettlementBundle)]
pub struct ExecuteSettlement<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,

    #[account(
        mut,
        seeds = [b"pool_state"],
        bump  = pool_state.bump,
    )]
    pub pool_state: Box<Account<'info, PoolState>>,

    #[account(
        seeds = [b"market", market_config.market_id.as_ref()],
        bump  = market_config.bump,
        constraint = market_config.initialized @ ShadowXError::InvalidMarket,
    )]
    pub market_config: Box<Account<'info, MarketConfig>>,

    #[account(
        mut,
        constraint = intent_account.market_id == market_config.market_id
            @ ShadowXError::BundleMarketMismatch,
    )]
    pub intent_account: Box<Account<'info, IntentAccount>>,

    #[account(
        mut,
        seeds = [b"user_stats", intent_account.owner.as_ref()],
        bump  = user_stats.bump,
    )]
    pub user_stats: Box<Account<'info, UserStats>>,

    #[account(
        mut,
        constraint = user_recv.owner == intent_account.owner @ ShadowXError::Unauthorized,
    )]
    pub user_recv: Account<'info, TokenAccount>,

    #[account(mut)]
    pub escrow_vault: Account<'info, TokenAccount>,

    /// Replay protection PDA. `init` ensures this address can only be
    /// created once per unique bundle_hash. A second settlement attempt
    /// with the same hash will fail at account creation.
    #[account(
        init,
        payer = payer,
        space = BundleProofState::LEN,
        seeds = [b"bundle", bundle.bundle_hash.as_ref()],
        bump
    )]
    pub bundle_state: Box<Account<'info, BundleProofState>>,

    /// Arcium verifier MUST be a Signer.
    #[account(
        constraint = arcium_verifier.key() == pool_state.arcium_verifier
            @ ShadowXError::InvalidVerifierSignature,
    )]
    pub arcium_verifier: Signer<'info>,

    /// Pyth oracle account
    /// CHECK: validated against market_config.oracle_feed inside read_oracle_price
    pub oracle: UncheckedAccount<'info>,

    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

// ════════════════════════════════════════════════════════════════
//  HANDLER (single bundle entrypoint)
// ════════════════════════════════════════════════════════════════

pub fn handler_execute_settlement(
    ctx: Context<ExecuteSettlement>,
    bundle: SettlementBundle,
) -> Result<()> {

    // 1. Bundle validation
    validate_bundle(&bundle)?;

    // 2. Reentrancy guard
    require!(
        !ctx.accounts.pool_state.locked,
        ShadowXError::ReentrancyDetected
    );
    ctx.accounts.pool_state.locked = true;

    // 3. Replay protection initialization
    //    `init` already ensured the PDA didn't exist before. Mark as used.
    let bundle_hash = bundle.bundle_hash;
    {
        let bs = &mut ctx.accounts.bundle_state;
        bs.bundle_hash = bundle_hash;
        bs.used        = true;
        bs.bump        = ctx.bumps.bundle_state;
    }

    // 4. Arcium verifier authority check
    verify_arcium_authority(
        &ctx.accounts.arcium_verifier,
        &ctx.accounts.pool_state.arcium_verifier,
    )?;

    // 5. Oracle validation (sanity bound for execution price)
    let oracle_price = read_oracle_price(
        &ctx.accounts.oracle.to_account_info(),
        &ctx.accounts.market_config.oracle_feed,
    )?;

    let max_dev_bps = ctx.accounts.market_config.max_price_deviation_bps as u128;

    // 6. Intent state validation
    require!(
        ctx.accounts.intent_account.status == IntentStatus::Pending,
        ShadowXError::InvalidIntentState
    );

    let clock = Clock::get()?;
    require!(
        ctx.accounts.intent_account.expires_at_slot >= clock.slot,
        ShadowXError::IntentExpired
    );
    require!(
        clock.slot
            >= ctx.accounts.intent_account.created_slot
                .saturating_add(ctx.accounts.pool_state.min_settlement_delay_slots),
        ShadowXError::SettlementTooEarly
    );

    // 7. Take the first bundle entry as this intent's fill (single intent
    //    per settlement; multi intent bundling is delegated to the
    //    relayer's batching logic across remaining_accounts in a future
    //    revision; the bundle hash binds all entries cryptographically).
    let exec_price = bundle.execution_prices[0];
    let fill       = bundle.fill_amounts[0];

    require!(fill > 0, ShadowXError::InvalidFillAmount);
    require!(
        fill <= ctx.accounts.intent_account.deposit_amount,
        ShadowXError::FillExceedsDeposit
    );
    require!(
        exec_price >= MIN_REASONABLE_PRICE && exec_price <= MAX_REASONABLE_PRICE,
        ShadowXError::InvalidExecutionPrice
    );

    // Execution price must be within max_price_deviation_bps of oracle
    let oracle_u128 = oracle_price as u128;
    let exec_u128   = exec_price   as u128;
    let dev_high    = oracle_u128.saturating_mul(10_000u128.saturating_add(max_dev_bps)) / 10_000u128;
    let dev_low     = oracle_u128.saturating_mul(10_000u128.saturating_sub(max_dev_bps)) / 10_000u128;
    require!(
        exec_u128 <= dev_high && exec_u128 >= dev_low,
        ShadowXError::PriceOutOfBounds
    );

    // 8. Compute fee
    let quote_value: u64 = (fill as u128)
        .checked_mul(exec_price as u128).ok_or(ShadowXError::MathOverflow)?
        .checked_div(PRICE_SCALE as u128).ok_or(ShadowXError::MathOverflow)?
        .try_into().map_err(|_| error!(ShadowXError::MathOverflow))?;

    let fee_bps = ctx.accounts.pool_state.fee_bps as u128;
    let raw_fee: u64 = (quote_value as u128)
        .checked_mul(fee_bps).ok_or(ShadowXError::MathOverflow)?
        .checked_div(10_000u128).ok_or(ShadowXError::MathOverflow)?
        .try_into().map_err(|_| error!(ShadowXError::MathOverflow))?;
    let fee = raw_fee.max(MIN_FEE_LAMPORTS);

    let payout = match ctx.accounts.intent_account.side {
        IntentSide::Buy  => fill,
        IntentSide::Sell => quote_value.checked_sub(fee).ok_or(ShadowXError::MathOverflow)?,
    };

    // 9. SPL CPI transfer from escrow vault to user receive account
    let market_id   = ctx.accounts.market_config.market_id;
    let market_bump = ctx.accounts.market_config.bump;
    let bump_arr    = [market_bump];
    let seeds_inner: &[&[u8]] = &[b"market", market_id.as_ref(), &bump_arr];
    let signer_seeds = &[seeds_inner];

    token::transfer(
        CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from:      ctx.accounts.escrow_vault.to_account_info(),
                to:        ctx.accounts.user_recv.to_account_info(),
                authority: ctx.accounts.market_config.to_account_info(),
            },
            signer_seeds,
        ),
        payout,
    )?;

    // 10. Mutate intent account
    let intent_pubkey;
    let intent_owner;
    {
        let intent = &mut ctx.accounts.intent_account;
        intent_pubkey       = intent.key();
        intent_owner        = intent.owner;
        intent.status          = IntentStatus::Filled;
        intent.fill_amount     = fill;
        intent.execution_price = exec_price;
        intent.settled_slot    = clock.slot;
    }

    // 11. Mutate user stats
    {
        let stats = &mut ctx.accounts.user_stats;
        stats.open_intents = stats.open_intents.saturating_sub(1);
        stats.total_volume = stats.total_volume
            .checked_add(quote_value).ok_or(ShadowXError::MathOverflow)?;
    }

    // 12. Pool counters
    let settlement_id;
    {
        let pool = &mut ctx.accounts.pool_state;
        settlement_id = pool.settlement_count;
        pool.settlement_count = pool.settlement_count
            .checked_add(1).ok_or(ShadowXError::MathOverflow)?;
        // Release reentrancy lock
        pool.locked = false;
    }

    // 13. Events
    emit!(IntentSettled {
        intent_pubkey,
        owner:           intent_owner,
        fill_amount:     fill,
        execution_price: exec_price,
        fee_paid:        fee,
        settled_slot:    clock.slot,
    });

    emit!(SettlementExecuted {
        settlement_pubkey: ctx.accounts.bundle_state.key(),
        settlement_id,
        market_id,
        intent_count:      1,
        total_volume:      quote_value,
        total_fees:        fee,
        bundle_hash,
        executed_slot:     clock.slot,
    });

    msg!(
        "Settlement #{}: fill={} price={} fee={}",
        settlement_id, fill, exec_price, fee
    );

    Ok(())
}
