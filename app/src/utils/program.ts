import { PublicKey } from '@solana/web3.js';

export const PROGRAM_ID = new PublicKey('4GSUVffLEXNkL6i5TJL2dhSDuuubhagqfaRigo2xwKQt');
export const POOL_STATE_SEED = 'pool_state';
export const INTENT_SEED = 'intent';
export const MARKET_SEED = 'market';

export const RPC_ENDPOINT = 'https://api.devnet.solana.com';

// Program discriminators (calculated from sha256("global:instruction_name"))
export const DISCRIMINATORS = {
  INITIALIZE_POOL: [95, 180, 10, 172, 84, 174, 232, 40],
  INITIALIZE_MARKET: [0, 0, 0, 0, 0, 0, 0, 0], // TODO: Calculate
  SUBMIT_INTENT: [0, 0, 0, 0, 0, 0, 0, 0], // TODO: Calculate
  CANCEL_INTENT: [0, 0, 0, 0, 0, 0, 0, 0], // TODO: Calculate
  EXECUTE_SETTLEMENT: [0, 0, 0, 0, 0, 0, 0, 0], // TODO: Calculate
};

// Simplified program IDL for type safety
export const SHADOWX_IDL = {
  version: "1.0.0",
  name: "shadowx_program",
  instructions: [
    {
      name: "initializePool",
      accounts: [
        { name: "poolState", isMut: true, isSigner: false },
        { name: "admin", isMut: true, isSigner: true },
        { name: "systemProgram", isMut: false, isSigner: false }
      ],
      args: []
    },
    {
      name: "submitIntent",
      accounts: [],
      args: []
    },
    {
      name: "cancelIntent",
      accounts: [],
      args: []
    }
  ],
  accounts: [
    {
      name: "PoolState",
      type: {
        kind: "struct",
        fields: [
          { name: "admin", type: "publicKey" },
          { name: "feeBps", type: "u16" },
          { name: "relayerAuthority", type: "publicKey" },
          { name: "arciumVerifier", type: "publicKey" },
          { name: "minSettlementDelaySlots", type: "u64" },
          { name: "locked", type: "bool" }
        ]
      }
    }
  ]
};
