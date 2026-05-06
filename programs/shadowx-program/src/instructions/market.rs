use anchor_lang::prelude::*;

use crate::state::*;
use crate::errors::ShadowXError;

#[derive(Accounts)]
#[instruction(
    market_id: [u8; 8],
    base_mint: Pubkey,
    quote_mint: Pubkey,
    oracle_feed: Pubkey
)]
pub struct InitializeMarket<'info> {
    #[account(
        mut,
        seeds = [b"pool_state"],
        bump = pool_state.bump
    )]
    pub pool_state: Box<Account<'info, PoolState>>,

    #[account(
        init,
        payer = authority,
        space = MarketConfig::LEN,
        seeds = [b"market", market_id.as_ref()],
        bump
    )]
    pub market_config: Box<Account<'info, MarketConfig>>,

    #[account(mut)]
    pub authority: Signer<'info>,

    pub system_program: Program<'info, System>,
}

pub fn handler_initialize_market(
    ctx: Context<InitializeMarket>,
    market_id: [u8; 8],
    base_mint: Pubkey,
    quote_mint: Pubkey,
    oracle_feed: Pubkey,
) -> Result<()> {

    let pool = &ctx.accounts.pool_state;

    require!(!pool.locked, ShadowXError::ReentrancyDetected);

    let market = &mut ctx.accounts.market_config;

    market.initialized = true;
    market.market_id   = market_id;

    market.base_mint  = base_mint;
    market.quote_mint = quote_mint;

    market.oracle_feed = oracle_feed;

    let (vault_authority, vault_bump) = Pubkey::find_program_address(
        &[b"vault_authority", market_id.as_ref()],
        ctx.program_id,
    );

    market.vault_authority = vault_authority;
    market.vault_bump      = vault_bump;

    market.base_vault  = Pubkey::default();
    market.quote_vault = Pubkey::default();

    market.relayer_authority = pool.relayer_authority;
    market.arcium_verifier   = pool.arcium_verifier;

    market.max_price_deviation_bps = 100;
    market.fee_bps                 = pool.fee_bps;

    market.bump = ctx.bumps.market_config;

    msg!("Market initialized: {:?}", market_id);
    Ok(())
}
