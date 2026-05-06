# ShadowX Trading Interface

Production-grade React app for interacting with the ShadowX Settle Solana program.

## Features

- ✅ Solana wallet integration (Phantom, Solflare)
- ✅ Real-time pool state display
- ✅ Submit encrypted intents
- ✅ View user intents
- ✅ Cancel intents
- ✅ Responsive design
- ✅ TypeScript type safety

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Architecture

**Frontend Stack:**
- React 18 + TypeScript
- Vite (fast build tool)
- Tailwind CSS (styling)
- Solana Wallet Adapter (wallet connection)
- @solana/web3.js (blockchain interaction)

**Program Integration:**
- Program ID: `4GSUVffLEXNkL6i5TJL2dhSDuuubhagqfaRigo2xwKQt`
- Network: Solana Devnet
- Pool State PDA: `75kHTKgSX98s1ggaDNFGHJQAmFGNHiTXVBhN4tY5p2ZD`

## Environment

No environment variables needed - everything configured in code for devnet.

## Deployment

### Vercel (Recommended)
```bash
npm run build
# Upload dist/ folder to Vercel
```

### Netlify
```bash
npm run build
# Upload dist/ folder to Netlify
```

### GitHub Pages
```bash
npm run build
# Upload dist/ folder to gh-pages branch
```

## Development Notes

The app currently displays pool state and provides a UI for submitting intents.
Full intent submission/cancellation requires completing the transaction building logic.

## Built For

- Colosseum Hackathon 2026
- Solana Frontier Track
- Arcium MPC Integration
- Deadline: May 10, 2026
