// ── Fees ────────────────────────────────────────────────────────
pub const MAX_FEE_BPS: u16 = 500;
pub const MIN_FEE_LAMPORTS: u64 = 1;

// ── Intent payload ──────────────────────────────────────────────
pub const MAX_INTENT_PAYLOAD_LEN: usize = 384;
pub const MAX_BUNDLE_INTENTS: usize = 16;

// ── Timing ──────────────────────────────────────────────────────
/// Min slots between intent submission and settlement eligibility.
/// Prevents relayer from instantly executing for spread extraction.
pub const DEFAULT_MIN_SETTLEMENT_DELAY: u64 = 4;
pub const MAX_INTENT_EXPIRY_SLOTS: u64 = 216_000; // ~24h

// ── Oracle ──────────────────────────────────────────────────────
pub const MAX_PRICE_AGE_SECONDS: i64 = 60;
pub const MAX_CONFIDENCE_RATIO_BPS: u64 = 100; // conf < 1% of price

// ── Price ───────────────────────────────────────────────────────
pub const PRICE_DECIMALS: u32 = 6;
pub const PRICE_SCALE: u64 = 1_000_000;
pub const MIN_REASONABLE_PRICE: u64 = 1;
pub const MAX_REASONABLE_PRICE: u64 = 10_000_000_000_000;

// ── User limits ─────────────────────────────────────────────────
pub const MAX_OPEN_INTENTS_PER_USER: u32 = 100;
