#!/bin/bash
set -e

echo "=== Building ShadowX Settle (bypassing Anchor CLI) ==="
echo ""

# Step 1: Clear any bad state
echo "Clearing build artifacts..."
rm -rf target .anchor

# Step 2: Build using cargo-build-sbf directly (what Anchor uses internally)
echo "Building Solana program..."
cd programs/shadowx-program

cargo build-sbf --manifest-path Cargo.toml

echo ""
echo "=== Build successful! ==="
echo ""
echo "Program output:"
ls -lh ../../target/deploy/*.so
echo ""
echo "You can now deploy this .so file to Solana"
