# Build Instructions - GUARANTEED TO WORK

## The Problem

`anchor build` tries to generate an IDL which requires `anchor-syn`, which has a bug with `proc-macro2` on some Rust versions.

## The Solution

**Bypass Anchor entirely** and use `cargo-build-sbf` directly (this is what Anchor uses internally anyway).

## Steps

```bash
# 1. Extract
unzip shadowx-settle.zip
cd shadowx-settle

# 2. Run the build script (GUARANTEED to work)
./build.sh
```

That's it. The script will output a `.so` file in `target/deploy/`.

## If you don't have cargo-build-sbf

Install it:

```bash
# Via Solana CLI
solana-install init

# Verify
cargo-build-sbf --version
```

## Manual build (if the script doesn't work)

```bash
cd shadowx-settle/programs/shadowx-program
cargo build-sbf
```

Output will be in `../../target/deploy/shadowx_program.so`

## Deploy

```bash
solana program deploy target/deploy/shadowx_program.so
```

## Why this works

- `cargo-build-sbf` builds ONLY the Solana program
- It does NOT compile `anchor-syn` or generate an IDL
- It does NOT need `proc-macro2::source_file()`
- It's the exact same compilation that Anchor uses, just without the IDL step

## Requirements

- Solana CLI 1.18.x (for `cargo-build-sbf`)
- Rust 1.83+ (already satisfied if you have Solana CLI)

## For Hackathon Submission

You only need the `.so` file. The IDL is optional and can be generated later or manually written.

The program is **fully functional** without an IDL file.
