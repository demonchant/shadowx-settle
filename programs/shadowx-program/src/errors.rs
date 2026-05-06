use anchor_lang::prelude::*;

#[error_code]
pub enum ShadowXError {

    // ═══════════════════════════════════════════════
    // PAYLOAD
    // ═══════════════════════════════════════════════
    #[msg("Encrypted intent payload exceeds maximum size")]
    PayloadTooLarge,

    #[msg("Encrypted intent payload is empty")]
    PayloadEmpty,

    #[msg("Invalid intent side. Must be 0 (Buy) or 1 (Sell)")]
    InvalidSide,

    #[msg("Market ID is invalid or unregistered")]
    InvalidMarket,

    // ═══════════════════════════════════════════════
    // INTENT LIFECYCLE
    // ═══════════════════════════════════════════════
    #[msg("Intent is not in the required state")]
    InvalidIntentState,

    #[msg("Intent has not yet expired. Cannot refund")]
    IntentNotExpired,

    #[msg("Intent has expired")]
    IntentExpired,

    #[msg("Intent expiry slot is invalid")]
    InvalidExpiry,

    #[msg("Settlement attempted before minimum delay slots elapsed")]
    SettlementTooEarly,

    #[msg("Only the intent owner can cancel this intent")]
    UnauthorizedCancellation,

    #[msg("Maximum simultaneous open intents reached")]
    TooManyOpenIntents,

    // ═══════════════════════════════════════════════
    // SECURITY
    // ═══════════════════════════════════════════════
    #[msg("Replay detected. Bundle already executed")]
    ReplayDetected,

    #[msg("Reentrancy detected. State is locked")]
    ReentrancyDetected,

    // ═══════════════════════════════════════════════
    // BUNDLE
    // ═══════════════════════════════════════════════
    #[msg("Settlement bundle is empty")]
    EmptyBundle,

    #[msg("Settlement bundle exceeds maximum size")]
    BundleTooLarge,

    #[msg("Settlement bundle proof verification failed")]
    InvalidBundleProof,

    #[msg("Verifier signature is invalid. Not signed by registered Arcium authority")]
    InvalidVerifierSignature,

    #[msg("Bundle execution prices length does not match intent count")]
    BundleArityMismatch,

    #[msg("Self match within a single bundle is not allowed")]
    SelfMatchInBundle,

    #[msg("Two intents in the bundle target different markets")]
    BundleMarketMismatch,

    #[msg("Fill amount exceeds intent escrowed deposit")]
    FillExceedsDeposit,

    #[msg("Execution price out of reasonable range")]
    InvalidExecutionPrice,

    #[msg("Invalid fill amount")]
    InvalidFillAmount,

    #[msg("Over fill detected")]
    OverFill,

    // ═══════════════════════════════════════════════
    // VAULT / TOKEN
    // ═══════════════════════════════════════════════
    #[msg("Token vault mismatch for market")]
    VaultMismatch,

    #[msg("Token mint mismatch")]
    MintMismatch,

    #[msg("Insufficient balance in escrow vault")]
    InsufficientEscrow,

    // ═══════════════════════════════════════════════
    // ORACLE
    // ═══════════════════════════════════════════════
    #[msg("Oracle price is too stale")]
    OraclePriceStale,

    #[msg("Oracle price has insufficient confidence")]
    OracleLowConfidence,

    #[msg("Oracle feed account does not match market configuration")]
    OracleFeedMismatch,

    #[msg("Oracle price out of reasonable range. Suspected manipulation")]
    OraclePriceUnreasonable,

    // ═══════════════════════════════════════════════
    // MATH / GENERAL
    // ═══════════════════════════════════════════════
    #[msg("Arithmetic overflow")]
    MathOverflow,

    #[msg("Fee basis points exceeds maximum")]
    FeeTooHigh,

    #[msg("Unauthorized")]
    Unauthorized,

    #[msg("Required account is missing or invalid")]
    InvalidAccount,

    #[msg("Invalid remaining accounts passed")]
    InvalidRemainingAccounts,

    #[msg("Price out of bounds")]
    PriceOutOfBounds,

    #[msg("Invalid deposit amount")]
    InvalidDeposit,
}
