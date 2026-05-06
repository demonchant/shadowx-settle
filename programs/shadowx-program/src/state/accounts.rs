use anchor_lang::prelude::*;

// ════════════════════════════════════════════════════════════════
//  GLOBAL POOL STATE
// ════════════════════════════════════════════════════════════════

#[account]
pub struct PoolState {
    pub authority: Pubkey,

    pub intent_count: u64,
    pub settlement_count: u64,

    pub fee_bps: u16,

    pub relayer_authority: Pubkey,
    pub arcium_verifier: Pubkey,

    pub min_settlement_delay_slots: u64,

    pub locked: bool,

    pub bump: u8,
}

impl PoolState {
    /// disc(8) + Pubkey(32) + u64(8) + u64(8) + u16(2) + Pubkey(32) + Pubkey(32) + u64(8) + bool(1) + u8(1)
    pub const LEN: usize = 8 + 32 + 8 + 8 + 2 + 32 + 32 + 8 + 1 + 1;
}

// ════════════════════════════════════════════════════════════════
//  MARKET CONFIG
// ════════════════════════════════════════════════════════════════

#[account]
pub struct MarketConfig {
    pub initialized: bool,

    pub market_id: [u8; 8],

    pub base_mint: Pubkey,
    pub quote_mint: Pubkey,

    pub base_vault: Pubkey,
    pub quote_vault: Pubkey,

    pub relayer_authority: Pubkey,
    pub arcium_verifier: Pubkey,

    pub vault_authority: Pubkey,
    pub vault_bump: u8,

    pub oracle_feed: Pubkey,
    pub max_price_deviation_bps: u16,

    pub fee_bps: u16,

    pub bump: u8,
}

impl MarketConfig {
    /// disc(8) + bool(1) + [u8;8](8) + 7*Pubkey(224) + u8(1) + Pubkey(32) + u16(2) + u16(2) + u8(1)
    pub const LEN: usize = 8 + 1 + 8 + 32 + 32 + 32 + 32 + 32 + 32 + 32 + 1 + 32 + 2 + 2 + 1;
}

// ════════════════════════════════════════════════════════════════
//  INTENT ENUMS
// ════════════════════════════════════════════════════════════════

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq)]
pub enum IntentStatus {
    Pending,
    Cancelled,
    Expired,
    Filled,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq)]
pub enum IntentSide {
    Buy,
    Sell,
}

impl IntentSide {
    pub fn from_u8(v: u8) -> Option<Self> {
        match v {
            0 => Some(Self::Buy),
            1 => Some(Self::Sell),
            _ => None,
        }
    }
}

// ════════════════════════════════════════════════════════════════
//  INTENT ACCOUNT
// ════════════════════════════════════════════════════════════════

#[account]
pub struct IntentAccount {
    pub owner: Pubkey,

    pub intent_id: u64,
    pub market_id: [u8; 8],

    pub side: IntentSide,
    pub status: IntentStatus,

    pub encrypted_intent: Vec<u8>,
    pub intent_iv: [u8; 12],
    pub commitment: [u8; 32],

    pub deposit_amount: u64,
    pub fill_amount: u64,
    pub execution_price: u64,

    pub created_slot: u64,
    pub settled_slot: u64,
    pub expires_at_slot: u64,

    pub nullifier: [u8; 32],

    pub bump: u8,
}

impl IntentAccount {
    /// disc(8) + Pubkey(32) + u64(8) + [u8;8](8) + IntentSide(1) + IntentStatus(1)
    /// + Vec<u8>(4 + 1024) + [u8;12](12) + [u8;32](32) + 6*u64(48) + [u8;32](32) + u8(1)
    pub const LEN: usize =
        8 + 32 + 8 + 8 + 1 + 1 + (4 + 1024) + 12 + 32 + 8 + 8 + 8 + 8 + 8 + 8 + 32 + 1;
}

// ════════════════════════════════════════════════════════════════
//  USER STATS
// ════════════════════════════════════════════════════════════════

#[account]
pub struct UserStats {
    pub owner: Pubkey,

    pub total_intents: u64,
    pub open_intents: u64,

    pub total_volume: u64,

    pub bump: u8,
}

impl UserStats {
    pub const LEN: usize = 8 + 32 + 8 + 8 + 8 + 1;
}

// ════════════════════════════════════════════════════════════════
//  SETTLEMENT REPLAY (legacy compat)
// ════════════════════════════════════════════════════════════════

#[account]
pub struct SettlementReplay {
    pub bundle_hash: [u8; 32],
    pub used: bool,
    pub slot: u64,
    pub bump: u8,
}

impl SettlementReplay {
    pub const LEN: usize = 8 + 32 + 1 + 8 + 1;
}

// ════════════════════════════════════════════════════════════════
//  NULLIFIER REGISTRY (ZK ready)
// ════════════════════════════════════════════════════════════════

#[account]
pub struct NullifierAccount {
    pub nullifier: [u8; 32],
    pub used: bool,
    pub slot: u64,
    pub bump: u8,
}

impl NullifierAccount {
    pub const LEN: usize = 8 + 32 + 1 + 8 + 1;
}

// ════════════════════════════════════════════════════════════════
//  SETTLEMENT BATCH (legacy audit record)
// ════════════════════════════════════════════════════════════════

#[account]
pub struct SettlementBatch {
    pub batch_id: u64,
    pub market_id: [u8; 8],

    pub intent_count: u64,

    pub merkle_root: [u8; 32],

    pub executed: bool,

    pub slot: u64,

    pub bump: u8,
}

impl SettlementBatch {
    pub const LEN: usize = 8 + 8 + 8 + 8 + 32 + 1 + 8 + 1;
}

// ════════════════════════════════════════════════════════════════
//  BUNDLE PROOF STATE (replay protection PDA)
//  Seeded with [b"bundle", bundle_hash]; created on first execute,
//  re-execution fails because account already exists.
// ════════════════════════════════════════════════════════════════

#[account]
pub struct BundleProofState {
    pub bundle_hash: [u8; 32],
    pub used: bool,
    pub bump: u8,
}

impl BundleProofState {
    pub const LEN: usize = 8 + 32 + 1 + 1;
}
