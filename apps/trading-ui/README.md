# ShadowX Settle - Trading UI

Production-grade React trading interface for ShadowX Settle on Solana.

## Features

✅ **Wallet Integration**
- Phantom & Solflare support
- Auto-connect on return
- Multi-wallet support

✅ **Trading Interface**
- Submit encrypted intents
- View active intents
- Cancel pending orders
- Real-time pool state

✅ **Professional UI**
- Tailwind CSS
- Responsive design
- Toast notifications
- Loading states

## Quick Start

```bash
cd apps/trading-ui

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

The app will run at **http://localhost:5173**

## Tech Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Solana Wallet Adapter** - Wallet connection
- **@solana/web3.js** - Solana interactions

## Deployment

```bash
# Build production bundle
npm run build

# Output: dist/
# Deploy to Vercel, Netlify, or any static host
```

## Configuration

Program constants in `src/utils/constants.ts`:

```typescript
export const PROGRAM_ID = '4GSUVffLEXNkL6i5TJL2dhSDuuubhagqfaRigo2xwKQt';
export const POOL_STATE_ADDRESS = '75kHTKgSX98s1ggaDNFGHJQAmFGNHiTXVBhN4tY5p2ZD';
export const RPC_ENDPOINT = 'https://api.devnet.solana.com';
```

## Built For

- **Colosseum Hackathon 2026**
- **Solana Frontier Track**
- **Arcium MPC Integration**
- **Deadline:** May 10, 2026
