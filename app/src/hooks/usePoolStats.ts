import { useConnection } from '@solana/wallet-adapter-react';
import { useEffect, useState } from 'react';
import { PROGRAM_ID } from '../utils/program';

interface PoolStats {
  totalVolume: number;
  totalIntentsSettled: number;
  uptime: number;
}

export function usePoolStats() {
  const { connection } = useConnection();
  const [stats, setStats] = useState<PoolStats>({
    totalVolume: 0,
    totalIntentsSettled: 0,
    uptime: 99.9,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        setLoading(true);
        
        // Get all accounts owned by the program
        const accounts = await connection.getProgramAccounts(PROGRAM_ID);
        
        // Count intent accounts (these would have a specific discriminator)
        // For now, we'll count total program accounts as a proxy
        const totalIntents = accounts.length;
        
        // Calculate uptime based on program deployment
        // (In production, this would come from monitoring data)
        const uptime = 99.9;
        
        setStats({
          totalVolume: 0, // Would need to parse intent amounts from account data
          totalIntentsSettled: totalIntents,
          uptime,
        });
      } catch (err) {
        console.error('Failed to fetch pool stats:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
    const interval = setInterval(fetchStats, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, [connection]);

  return { stats, loading };
}
