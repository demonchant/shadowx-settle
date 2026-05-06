import { useConnection } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { useEffect, useState } from 'react';
import { PROGRAM_ID, POOL_STATE_SEED } from '../utils/program';
import { PoolState } from '../types/program';

export function usePoolState() {
  const { connection } = useConnection();
  const [poolState, setPoolState] = useState<PoolState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPoolState() {
      try {
        setLoading(true);
        const [poolStatePDA] = PublicKey.findProgramAddressSync(
          [Buffer.from(POOL_STATE_SEED)],
          PROGRAM_ID
        );

        const accountInfo = await connection.getAccountInfo(poolStatePDA);
        
        if (!accountInfo) {
          setError('Pool not initialized');
          return;
        }

        // Parse pool state (simplified - you'd use Borsh in production)
        const data = accountInfo.data;
        
        setPoolState({
          admin: new PublicKey(data.slice(8, 40)),
          feeBps: data.readUInt16LE(40),
          relayerAuthority: new PublicKey(data.slice(42, 74)),
          arciumVerifier: new PublicKey(data.slice(74, 106)),
          minSettlementDelaySlots: Number(data.readBigUInt64LE(106)),
          locked: data[114] === 1
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch pool state');
      } finally {
        setLoading(false);
      }
    }

    fetchPoolState();
    const interval = setInterval(fetchPoolState, 10000); // Refresh every 10s
    return () => clearInterval(interval);
  }, [connection]);

  return { poolState, loading, error };
}
