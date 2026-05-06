use anchor_lang::prelude::*;

#[event]
pub struct IntentSubmitted {
    pub intent_pubkey: Pubkey,
    pub owner: Pubkey,
    pub intent_id: u64,
    pub market_id: [u8; 8],
    pub side: u8,
    pub deposit_amount: u64,
    pub commitment: [u8; 32],
    pub created_slot: u64,
    pub expires_at_slot: u64,
}

#[event]
pub struct IntentCancelled {
    pub intent_pubkey: Pubkey,
    pub owner: Pubkey,
    pub refunded_amount: u64,
    pub cancelled_slot: u64,
}

#[event]
pub struct IntentExpiredRefunded {
    pub intent_pubkey: Pubkey,
    pub owner: Pubkey,
    pub refunded_amount: u64,
    pub refunded_slot: u64,
}

#[event]
pub struct SettlementExecuted {
    pub settlement_pubkey: Pubkey,
    pub settlement_id: u64,
    pub market_id: [u8; 8],
    pub intent_count: u8,
    pub total_volume: u64,
    pub total_fees: u64,
    pub bundle_hash: [u8; 32],
    pub executed_slot: u64,
}

#[event]
pub struct IntentSettled {
    pub intent_pubkey: Pubkey,
    pub owner: Pubkey,
    pub fill_amount: u64,
    pub execution_price: u64,
    pub fee_paid: u64,
    pub settled_slot: u64,
}
