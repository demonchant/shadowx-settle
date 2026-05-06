use anchor_lang::prelude::*;
use anchor_lang::solana_program::clock::Clock;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};

use crate::state::*;
use crate::errors::ShadowXError;
use crate::events::*;
use crate::constants::*;

// ════════════════════════════════════════════════════════════════
//  SUBMIT INTENT
// ════════════════════════════════════════════════════════════════

#[derive(Accounts)]
#[instruction(
    encrypted_intent: Vec<u8>,
    intent_iv: [u8; 12],
    commitment: [u8; 32],
    market_id: [u8; 8],
    side: u8,
    deposit_amount: u64,
    expires_at_slot: u64
)]
pub struct SubmitIntent<'info> {
    #[account(mut, seeds = [b"pool_state"], bump = pool_state.bump)]
    pub pool_state: Box<Account<'info, PoolState>>,

    #[account(
        seeds = [b"market", market_id.as_ref()],
        bump = market_config.bump,
        constraint = market_config.initialized @ ShadowXError::InvalidMarket
    )]
    pub market_config: Box<Account<'info, MarketConfig>>,

    #[account(
        init,
        payer = owner,
        space = IntentAccount::LEN,
        seeds = [b"intent", owner.key().as_ref(), &pool_state.intent_count.to_le_bytes()],
        bump
    )]
    pub intent_account: Box<Account<'info, IntentAccount>>,

    #[account(
        init_if_needed,
        payer = owner,
        space = UserStats::LEN,
        seeds = [b"user_stats", owner.key().as_ref()],
        bump
    )]
    pub user_stats: Box<Account<'info, UserStats>>,

    #[account(mut)]
    pub user_token_account: Account<'info, TokenAccount>,

    #[account(mut)]
    pub escrow_vault: Account<'info, TokenAccount>,

    #[account(mut)]
    pub owner: Signer<'info>,

    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

pub fn handler_submit_intent(
    ctx: Context<SubmitIntent>,
    encrypted_intent: Vec<u8>,
    intent_iv: [u8; 12],
    commitment: [u8; 32],
    market_id: [u8; 8],
    side: u8,
    deposit_amount: u64,
    expires_at_slot: u64,
) -> Result<()> {

    require!(!encrypted_intent.is_empty(), ShadowXError::PayloadEmpty);
    require!(encrypted_intent.len() <= MAX_INTENT_PAYLOAD_LEN, ShadowXError::PayloadTooLarge);
    require!(deposit_amount > 0, ShadowXError::InvalidDeposit);

    let side_enum = IntentSide::from_u8(side).ok_or(ShadowXError::InvalidSide)?;

    let clock = Clock::get()?;
    require!(expires_at_slot > clock.slot, ShadowXError::InvalidExpiry);
    require!(
        expires_at_slot <= clock.slot.saturating_add(MAX_INTENT_EXPIRY_SLOTS),
        ShadowXError::InvalidExpiry
    );

    let market = &ctx.accounts.market_config;
    require!(market.market_id == market_id, ShadowXError::InvalidMarket);

    let expected_vault = match side_enum {
        IntentSide::Buy  => market.quote_vault,
        IntentSide::Sell => market.base_vault,
    };
    require_keys_eq!(
        ctx.accounts.escrow_vault.key(),
        expected_vault,
        ShadowXError::VaultMismatch
    );

    let expected_mint = match side_enum {
        IntentSide::Buy  => market.quote_mint,
        IntentSide::Sell => market.base_mint,
    };
    require_keys_eq!(
        ctx.accounts.user_token_account.mint,
        expected_mint,
        ShadowXError::MintMismatch
    );

    // CPI escrow deposit
    token::transfer(
        CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from:      ctx.accounts.user_token_account.to_account_info(),
                to:        ctx.accounts.escrow_vault.to_account_info(),
                authority: ctx.accounts.owner.to_account_info(),
            },
        ),
        deposit_amount,
    )?;

    let pool = &mut ctx.accounts.pool_state;
    let intent_id = pool.intent_count;
    pool.intent_count = pool.intent_count.checked_add(1).ok_or(ShadowXError::MathOverflow)?;

    let intent = &mut ctx.accounts.intent_account;

    intent.owner            = ctx.accounts.owner.key();
    intent.intent_id        = intent_id;
    intent.market_id        = market_id;
    intent.side             = side_enum;
    intent.status           = IntentStatus::Pending;
    intent.encrypted_intent = encrypted_intent;
    intent.intent_iv        = intent_iv;
    intent.commitment       = commitment;
    intent.deposit_amount   = deposit_amount;
    intent.fill_amount      = 0;
    intent.execution_price  = 0;
    intent.created_slot     = clock.slot;
    intent.settled_slot     = 0;
    intent.expires_at_slot  = expires_at_slot;
    intent.nullifier        = [0u8; 32];
    intent.bump             = ctx.bumps.intent_account;

    let stats = &mut ctx.accounts.user_stats;
    if stats.owner == Pubkey::default() {
        stats.owner = ctx.accounts.owner.key();
        stats.bump  = ctx.bumps.user_stats;
    }
    stats.total_intents = stats.total_intents.saturating_add(1);
    stats.open_intents  = stats.open_intents.saturating_add(1);

    emit!(IntentSubmitted {
        intent_pubkey: ctx.accounts.intent_account.key(),
        owner:         ctx.accounts.owner.key(),
        intent_id,
        market_id,
        side,
        deposit_amount,
        commitment,
        created_slot:  clock.slot,
        expires_at_slot,
    });

    Ok(())
}

// ════════════════════════════════════════════════════════════════
//  CANCEL INTENT
// ════════════════════════════════════════════════════════════════

#[derive(Accounts)]
pub struct CancelIntent<'info> {
    #[account(
        mut,
        has_one = owner @ ShadowXError::UnauthorizedCancellation,
    )]
    pub intent_account: Box<Account<'info, IntentAccount>>,

    #[account(seeds = [b"market", intent_account.market_id.as_ref()], bump = market_config.bump)]
    pub market_config: Box<Account<'info, MarketConfig>>,

    #[account(mut)]
    pub escrow_vault: Account<'info, TokenAccount>,

    #[account(mut)]
    pub user_token_account: Account<'info, TokenAccount>,

    #[account(mut, seeds = [b"user_stats", owner.key().as_ref()], bump)]
    pub user_stats: Box<Account<'info, UserStats>>,

    #[account(mut)]
    pub owner: Signer<'info>,

    pub token_program: Program<'info, Token>,
}

pub fn handler_cancel_intent(ctx: Context<CancelIntent>) -> Result<()> {
    let market = &ctx.accounts.market_config;

    require!(
        ctx.accounts.intent_account.status == IntentStatus::Pending,
        ShadowXError::InvalidIntentState
    );

    let expected_vault = match ctx.accounts.intent_account.side {
        IntentSide::Buy  => market.quote_vault,
        IntentSide::Sell => market.base_vault,
    };
    require_keys_eq!(
        ctx.accounts.escrow_vault.key(),
        expected_vault,
        ShadowXError::VaultMismatch
    );

    // Capture immutable values BEFORE the mutable borrow on intent_account
    let intent_pubkey   = ctx.accounts.intent_account.key();
    let owner_key       = ctx.accounts.owner.key();
    let refunded_amount = ctx.accounts.intent_account.deposit_amount;
    let market_id       = ctx.accounts.intent_account.market_id;
    let market_bump     = market.bump;

    let bump_arr  = [market_bump];
    let seeds_inner: &[&[u8]] = &[b"market", market_id.as_ref(), &bump_arr];
    let signer_seeds = &[seeds_inner];

    token::transfer(
        CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from:      ctx.accounts.escrow_vault.to_account_info(),
                to:        ctx.accounts.user_token_account.to_account_info(),
                authority: ctx.accounts.market_config.to_account_info(),
            },
            signer_seeds,
        ),
        refunded_amount,
    )?;

    let clock = Clock::get()?;

    let intent = &mut ctx.accounts.intent_account;
    intent.status       = IntentStatus::Cancelled;
    intent.settled_slot = clock.slot;

    let stats = &mut ctx.accounts.user_stats;
    stats.open_intents = stats.open_intents.saturating_sub(1);

    emit!(IntentCancelled {
        intent_pubkey,
        owner: owner_key,
        refunded_amount,
        cancelled_slot: clock.slot,
    });

    Ok(())
}

// ════════════════════════════════════════════════════════════════
//  REFUND EXPIRED INTENT (permissionless)
// ════════════════════════════════════════════════════════════════

#[derive(Accounts)]
pub struct RefundExpiredIntent<'info> {
    #[account(mut)]
    pub intent_account: Box<Account<'info, IntentAccount>>,

    #[account(seeds = [b"market", intent_account.market_id.as_ref()], bump = market_config.bump)]
    pub market_config: Box<Account<'info, MarketConfig>>,

    #[account(mut)]
    pub escrow_vault: Account<'info, TokenAccount>,

    #[account(
        mut,
        constraint = owner_token_account.owner == intent_account.owner @ ShadowXError::Unauthorized,
    )]
    pub owner_token_account: Account<'info, TokenAccount>,

    #[account(
        mut,
        seeds = [b"user_stats", intent_account.owner.as_ref()],
        bump
    )]
    pub user_stats: Box<Account<'info, UserStats>>,

    #[account(mut)]
    pub cleaner: Signer<'info>,

    pub token_program: Program<'info, Token>,
}

pub fn handler_refund_expired_intent(ctx: Context<RefundExpiredIntent>) -> Result<()> {
    let clock = Clock::get()?;

    require!(
        ctx.accounts.intent_account.status == IntentStatus::Pending,
        ShadowXError::InvalidIntentState
    );
    require!(
        clock.slot > ctx.accounts.intent_account.expires_at_slot,
        ShadowXError::IntentNotExpired
    );

    let market = &ctx.accounts.market_config;
    let expected_vault = match ctx.accounts.intent_account.side {
        IntentSide::Buy  => market.quote_vault,
        IntentSide::Sell => market.base_vault,
    };
    require_keys_eq!(
        ctx.accounts.escrow_vault.key(),
        expected_vault,
        ShadowXError::VaultMismatch
    );

    // Capture before mutable borrow
    let intent_pubkey   = ctx.accounts.intent_account.key();
    let intent_owner    = ctx.accounts.intent_account.owner;
    let refunded_amount = ctx.accounts.intent_account.deposit_amount;
    let market_id       = ctx.accounts.intent_account.market_id;
    let market_bump     = market.bump;

    let bump_arr  = [market_bump];
    let seeds_inner: &[&[u8]] = &[b"market", market_id.as_ref(), &bump_arr];
    let signer_seeds = &[seeds_inner];

    token::transfer(
        CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from:      ctx.accounts.escrow_vault.to_account_info(),
                to:        ctx.accounts.owner_token_account.to_account_info(),
                authority: ctx.accounts.market_config.to_account_info(),
            },
            signer_seeds,
        ),
        refunded_amount,
    )?;

    let intent = &mut ctx.accounts.intent_account;
    intent.status       = IntentStatus::Expired;
    intent.settled_slot = clock.slot;

    let stats = &mut ctx.accounts.user_stats;
    stats.open_intents = stats.open_intents.saturating_sub(1);

    emit!(IntentExpiredRefunded {
        intent_pubkey,
        owner:           intent_owner,
        refunded_amount,
        refunded_slot:   clock.slot,
    });

    Ok(())
}
