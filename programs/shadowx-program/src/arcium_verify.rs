use anchor_lang::prelude::*;
use anchor_lang::solana_program::clock::Clock;
use anchor_lang::solana_program::hash::{hash, Hash};

use crate::constants::*;
use crate::errors::ShadowXError;

// ════════════════════════════════════════════════════════════════
//  ORACLE PRICE VALIDATION
// ════════════════════════════════════════════════════════════════

pub fn read_oracle_price(
    oracle_account: &AccountInfo,
    expected_feed: &Pubkey,
) -> Result<u64> {
    require_keys_eq!(
        *oracle_account.key,
        *expected_feed,
        ShadowXError::OracleFeedMismatch
    );

    let data = oracle_account
        .try_borrow_data()
        .map_err(|_| ShadowXError::InvalidAccount)?;

    require!(data.len() >= 100, ShadowXError::InvalidAccount);

    let price_raw = i64::from_le_bytes(data[72..80].try_into().unwrap());
    let conf_raw  = u64::from_le_bytes(data[80..88].try_into().unwrap());
    let exponent  = i32::from_le_bytes(data[88..92].try_into().unwrap());
    let publish   = i64::from_le_bytes(data[92..100].try_into().unwrap());

    require!(price_raw > 0, ShadowXError::OraclePriceUnreasonable);

    let clock = Clock::get()?;
    let age = clock.unix_timestamp.saturating_sub(publish);

    require!(
        age >= 0 && age <= MAX_PRICE_AGE_SECONDS,
        ShadowXError::OraclePriceStale
    );

    let price = price_raw as u64;

    let conf_bps = (conf_raw as u128)
        .saturating_mul(10_000)
        .saturating_div(price as u128);

    require!(
        conf_bps <= MAX_CONFIDENCE_RATIO_BPS as u128,
        ShadowXError::OracleLowConfidence
    );

    let scaled = scale_price(price, exponent)?;

    require!(
        scaled >= MIN_REASONABLE_PRICE && scaled <= MAX_REASONABLE_PRICE,
        ShadowXError::OraclePriceUnreasonable
    );

    Ok(scaled)
}

fn scale_price(price: u64, exponent: i32) -> Result<u64> {
    const TARGET: i32 = -6;
    let diff = TARGET - exponent;

    if diff == 0 {
        return Ok(price);
    }
    if diff > 0 {
        let factor = 10u64
            .checked_pow(diff as u32)
            .ok_or(ShadowXError::MathOverflow)?;
        price.checked_mul(factor).ok_or(ShadowXError::MathOverflow.into())
    } else {
        let factor = 10u64
            .checked_pow((-diff) as u32)
            .ok_or(ShadowXError::MathOverflow)?;
        Ok(price / factor)
    }
}

// ════════════════════════════════════════════════════════════════
//  ARCIUM VERIFIER (STRICT AUTH)
// ════════════════════════════════════════════════════════════════

pub fn verify_arcium_authority(
    signer: &Signer,
    expected: &Pubkey,
) -> Result<()> {
    require_keys_eq!(
        signer.key(),
        *expected,
        ShadowXError::InvalidVerifierSignature
    );
    Ok(())
}

// ════════════════════════════════════════════════════════════════
//  BUNDLE PROOF (REPLAY + INTEGRITY + DETERMINISM)
// ════════════════════════════════════════════════════════════════

pub fn verify_bundle_proof(
    market_id: &[u8; 8],
    commitments: &[[u8; 32]],
    prices: &[u64],
    fills: &[u64],
    proof: &[u8; 64],
) -> Result<[u8; 32]> {
    require!(
        commitments.len() == prices.len() && prices.len() == fills.len(),
        ShadowXError::BundleArityMismatch
    );

    let n = commitments.len();
    require!(n > 0, ShadowXError::EmptyBundle);
    require!(n <= MAX_BUNDLE_INTENTS, ShadowXError::BundleTooLarge);

    let mut input = Vec::with_capacity(8 + 1 + n * (32 + 8 + 8));
    input.extend_from_slice(market_id);
    input.push(n as u8);

    for i in 0..n {
        input.extend_from_slice(&commitments[i]);
        input.extend_from_slice(&prices[i].to_le_bytes());
        input.extend_from_slice(&fills[i].to_le_bytes());
    }

    let h: Hash = hash(&input);
    let bytes = h.to_bytes();

    require!(
        proof[0..32] == bytes && proof[32..64] == bytes,
        ShadowXError::InvalidBundleProof
    );

    Ok(bytes)
}

pub fn derive_bundle_nullifier(bundle_hash: &[u8; 32]) -> [u8; 32] {
    let h = hash(bundle_hash);
    h.to_bytes()
}
