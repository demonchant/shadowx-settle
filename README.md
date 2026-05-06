# ShadowX Settle

**Intent based privacy execution network on Solana powered by Arcium MPC.**

Submit encrypted intents instead of public orders. Arcium's Multi Party Computation cluster matches them privately. Solana settles them atomically with real SPL CPI transfers. Zero MEV by construction.

---

## Architecture

The program is organized into four cleanly separated layers:

```
programs/shadowx-program/src/
├── lib.rs                  Program entrypoints
├── constants.rs            Numeric and timing constants
├── errors.rs               ShadowXError variants
├── events.rs               Event definitions
├── arcium_verify.rs        Oracle and Arcium signature verification
├── state/
│   ├── mod.rs              Re exports
│   ├── accounts.rs         All #[account] storage types
│   └── settlement.rs       SettlementBundle (instruction data type)
└── instructions/
    ├── mod.rs              Re exports
    ├── pool.rs             initialize_pool
    ├── market.rs           initialize_market
    ├── intent.rs           submit / cancel / refund_expired
    └── settlement.rs       execute_settlement (single bundle entrypoint)
```

---

## Settlement Architecture

There is **exactly one** settlement entrypoint in this program:

```rust
pub fn execute_settlement(
    ctx: Context<ExecuteSettlement>,
    bundle: SettlementBundle,
) -> Result<()>
```

`SettlementBundle` is the only instruction-data type accepted:

```rust
pub struct SettlementBundle {
    pub bundle_hash:        [u8; 32],
    pub verifier_signature: [u8; 64],
    pub execution_prices:   Vec<u64>,
    pub fill_amounts:       Vec<u64>,
}
```

No multi argument settlement variants exist. No legacy patterns. No bundle_proof / execution_prices / fill_amounts as separate args anywhere.

---

## Security Properties

| Property | Mechanism |
|---|---|
| Replay protection | `bundle_state` PDA seeded with `[b"bundle", bundle_hash]` and `init` constraint |
| Reentrancy guard | `pool_state.locked` flag set before any external CPI, cleared after |
| Arcium auth | `arcium_verifier: Signer<'info>` validated against `pool_state.arcium_verifier` |
| Oracle validation | Pyth feed read on chain via `read_oracle_price`, age and confidence checked |
| Price deviation | Execution price must be within `max_price_deviation_bps` of oracle |
| Expiry handling | Permissionless `refund_expired_intent` after `expires_at_slot` |

---

## Building

Requires:
- Rust 1.83 or later (Ubuntu apt: `apt install rustc-1.83 cargo-1.83`)
- Anchor CLI 0.30.1 (npm: `npm install -g @coral-xyz/anchor-cli@0.30.1`)
- Solana CLI 1.18.26 (for SBF target)

```bash
cd shadowx-settle
anchor build
```

For a quick syntax verification without the SBF toolchain:

```bash
cargo check --manifest-path programs/shadowx-program/Cargo.toml
```

---

## Network Notes

The included `Cargo.lock` pins multiple transitive dependencies to versions that compile under Rust 1.83. Without these pins, recent crates from the `crates.io` registry (`cpufeatures 0.3`, `indexmap 2.14`, `unicode-segmentation 1.13`, etc.) would fail with `edition2024` errors. Do not regenerate the lockfile unless you have Rust 1.85 or later.

---

## Status

This is the final submission build for the Colosseum Solana Frontier Hackathon. All audit findings from prior rounds are addressed. `cargo check` produces zero errors and zero warnings.
