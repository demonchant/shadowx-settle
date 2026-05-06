import { PublicKey } from '@solana/web3.js';

export interface PoolState {
  admin: PublicKey;
  feeBps: number;
  relayerAuthority: PublicKey;
  arciumVerifier: PublicKey;
  minSettlementDelaySlots: number;
  locked: boolean;
}

export interface Intent {
  owner: PublicKey;
  market: PublicKey;
  side: 'Buy' | 'Sell';
  amount: number;
  limitPrice: number;
  status: 'Pending' | 'Filled' | 'Cancelled';
  createdAt: number;
}

export enum IntentSide {
  Buy = 0,
  Sell = 1
}

export enum IntentStatus {
  Pending = 0,
  Filled = 1,
  Cancelled = 2
}
