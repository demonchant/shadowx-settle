use anchor_lang::prelude::*;

/// The single bundle type carried by `execute_settlement`.
/// This is the ONLY shape allowed for settlement input. No multi arg
/// settlement variants exist anywhere in the program.
#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct SettlementBundle {
    pub bundle_hash:        [u8; 32],
    pub verifier_signature: [u8; 64],
    pub execution_prices:   Vec<u64>,
    pub fill_amounts:       Vec<u64>,
}
