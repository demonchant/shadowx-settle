use anchor_lang::prelude::*;

use crate::state::PoolState;
use crate::errors::ShadowXError;
use crate::constants::{MAX_FEE_BPS, DEFAULT_MIN_SETTLEMENT_DELAY};

#[derive(Accounts)]
pub struct InitializePool<'info> {
    #[account(
        init,
        payer = admin,
        space = PoolState::LEN,
        seeds = [b"pool_state"],
        bump
    )]
    pub pool_state: Account<'info, PoolState>,

    #[account(mut)]
    pub admin: Signer<'info>,

    pub system_program: Program<'info, System>,
}

pub fn handler_initialize_pool(
    ctx: Context<InitializePool>,
    fee_bps: u16,
    relayer_authority: Pubkey,
    arcium_verifier: Pubkey,
    min_settlement_delay_slots: u64,
) -> Result<()> {

    require!(fee_bps <= MAX_FEE_BPS, ShadowXError::FeeTooHigh);

    require_keys_neq!(relayer_authority, Pubkey::default(), ShadowXError::InvalidAccount);
    require_keys_neq!(arcium_verifier,   Pubkey::default(), ShadowXError::InvalidAccount);
    require_keys_neq!(relayer_authority, arcium_verifier,  ShadowXError::InvalidAccount);

    require!(
        min_settlement_delay_slots >= 1 && min_settlement_delay_slots <= 100,
        ShadowXError::InvalidAccount
    );

    let pool = &mut ctx.accounts.pool_state;

    pool.authority         = ctx.accounts.admin.key();
    pool.relayer_authority = relayer_authority;
    pool.arcium_verifier   = arcium_verifier;

    pool.fee_bps = fee_bps;

    pool.min_settlement_delay_slots = if min_settlement_delay_slots > 0 {
        min_settlement_delay_slots
    } else {
        DEFAULT_MIN_SETTLEMENT_DELAY
    };

    pool.intent_count     = 0;
    pool.settlement_count = 0;

    pool.locked = false;
    pool.bump   = ctx.bumps.pool_state;

    msg!("ShadowX pool initialized: fee={}bps", fee_bps);
    Ok(())
}
