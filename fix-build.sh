#!/bin/bash
set -e

echo "=== ShadowX Settle Build Fix Script ==="
echo ""
echo "This script will:"
echo "1. Clear all Cargo cache"
echo "2. Force download of correct dependencies"
echo "3. Build the program"
echo ""
read -p "Press Enter to continue..."

echo ""
echo "Step 1: Clearing Cargo cache..."
rm -rf ~/.cargo/registry/cache
rm -rf ~/.cargo/registry/src
rm -rf ~/.cargo/git

echo "Step 2: Clearing local build artifacts..."
rm -rf target .anchor

echo "Step 3: Verifying Cargo.lock..."
if ! grep -q "proc-macro2" Cargo.lock; then
    echo "ERROR: Cargo.lock is missing or corrupted!"
    echo "Please re-extract the zip file."
    exit 1
fi

PROC_MACRO_VERSION=$(grep -A 1 '^name = "proc-macro2"' Cargo.lock | grep version | cut -d'"' -f2)
echo "Cargo.lock has proc-macro2 version: $PROC_MACRO_VERSION"

if [ "$PROC_MACRO_VERSION" != "1.0.106" ]; then
    echo "ERROR: Wrong proc-macro2 version in Cargo.lock!"
    echo "Expected: 1.0.106"
    echo "Got: $PROC_MACRO_VERSION"
    echo ""
    echo "Your Cargo.lock was regenerated. Please re-extract the zip file."
    exit 1
fi

echo "Step 4: Building..."
anchor build

echo ""
echo "=== Build successful! ==="
