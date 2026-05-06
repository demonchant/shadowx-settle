# ShadowX Settle - Quick Start

## 1. Build & Deploy Program

```bash
# Build the Solana program
./build.sh

# Deploy to devnet
solana program deploy target/deploy/shadowx_program.so

# Note the Program ID from the output
```

## 2. Initialize Pool

```bash
# Install dependencies
npm install

# Run initialization script
npm run initialize

# This will:
# - Create pool_state PDA
# - Generate relayer and Arcium verifier keypairs
# - Save keys to keys/ directory
# - Output transaction signature
```

## 3. Launch Landing Page

```bash
# Start local web server
npm run dev:web

# Open browser to:
# http://localhost:8000
```

The landing page will be live at `http://localhost:8000`

## 4. Production Deployment

### Program (Mainnet)
```bash
solana config set --url mainnet-beta
solana program deploy target/deploy/shadowx_program.so
```

### Landing Page
Deploy `apps/web/public/index.html` to:
- Vercel
- Netlify  
- GitHub Pages
- Any static host

## Program Details

**Devnet:**
- Program ID: `4GSUVffLEXNkL6i5TJL2dhSDuuubhagqfaRigo2xwKQt`
- Explorer: https://explorer.solana.com/address/4GSUVffLEXNkL6i5TJL2dhSDuuubhagqfaRigo2xwKQt?cluster=devnet

**Pool Config:**
- Fee: 0.30% (30 bps)
- Min Settlement Delay: 4 slots
- Relayer Authority: Generated in `keys/relayer-authority.json`
- Arcium Verifier: Generated in `keys/arcium-verifier.json`

## Next Steps

1. Initialize markets using `initialize_market`
2. Users can submit intents via the frontend
3. Arcium relayer watches for intents and settles them

## Support

- Documentation: https://docs.shadowx.io
- GitHub: https://github.com/shadowx/settle
- Discord: https://discord.gg/shadowx
