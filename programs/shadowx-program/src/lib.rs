use anchor_lang::prelude::*;

declare_id!("4GSUVffLEXNkL6i5TJL2dhSDuuubhagqfaRigo2xwKQt");

pub mod state;
pub mod instructions;
pub mod errors;
pub mod events;
pub mod constants;
pub mod arcium_verify;

use instructions::*;
use crate::state::SettlementBundle;

#[program]
pub mod shadowx_program {
    use super::*;

    pub fn initialize_pool(
        ctx: Context<InitializePool>,
        fee_bps: u16,
        relayer_authority: Pubkey,
        arcium_verifier: Pubkey,
        min_settlement_delay_slots: u64,
    ) -> Result<()> {
        handler_initialize_pool(
            ctx, fee_bps, relayer_authority, arcium_verifier, min_settlement_delay_slots,
        )
    }

    pub fn initialize_market(
        ctx: Context<InitializeMarket>,
        market_id: [u8; 8],
        base_mint: Pubkey,
        quote_mint: Pubkey,
        oracle_feed: Pubkey,
    ) -> Result<()> {
        handler_initialize_market(ctx, market_id, base_mint, quote_mint, oracle_feed)
    }

    pub fn submit_intent(
        ctx: Context<SubmitIntent>,
        encrypted_intent: Vec<u8>,
        intent_iv: [u8; 12],
        commitment: [u8; 32],
        market_id: [u8; 8],
        side: u8,
        deposit_amount: u64,
        expires_at_slot: u64,
    ) -> Result<()> {
        handler_submit_intent(
            ctx, encrypted_intent, intent_iv, commitment,
            market_id, side, deposit_amount, expires_at_slot,
        )
    }

    pub fn cancel_intent(ctx: Context<CancelIntent>) -> Result<()> {
        handler_cancel_intent(ctx)
    }

    /// THE ONLY settlement entrypoint. SettlementBundle carries
    /// bundle_hash, verifier_signature, execution_prices, fill_amounts.
    pub fn execute_settlement(
        ctx: Context<ExecuteSettlement>,
        bundle: SettlementBundle,
    ) -> Result<()> {
        handler_execute_settlement(ctx, bundle)
    }

    pub fn refund_expired_intent(ctx: Context<RefundExpiredIntent>) -> Result<()> {
        handler_refund_expired_intent(ctx)
    }
}
