import { FC, useState, useEffect } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import toast from 'react-hot-toast';

import PoolInfo from './PoolInfo';
import SubmitIntent from './SubmitIntent';
import MyIntents from './MyIntents';
import { POOL_STATE_ADDRESS } from '../utils/constants';

const Dashboard: FC = () => {
  const { connection } = useConnection();
  const { publicKey, connected } = useWallet();
  const [poolData, setPoolData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadPoolData();
  }, [connection]);

  const loadPoolData = async () => {
    try {
      setLoading(true);
      const accountInfo = await connection.getAccountInfo(POOL_STATE_ADDRESS);
      
      if (!accountInfo) {
        toast.error('Pool not found');
        return;
      }

      // For now, just show that the pool exists
      // In production, you'd deserialize the account data
      setPoolData({
        exists: true,
        address: POOL_STATE_ADDRESS.toBase58(),
      });
    } catch (error) {
      console.error('Error loading pool:', error);
      toast.error('Failed to load pool data');
    } finally {
      setLoading(false);
    }
  };

  if (!connected) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="card text-center py-16">
          <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-primary-600 to-emerald-600 rounded-full flex items-center justify-center">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
            </svg>
          </div>
          
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Welcome to ShadowX Settle
          </h2>
          
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            Connect your Solana wallet to start submitting encrypted intents with zero MEV exposure
          </p>
          
          <div className="space-y-4 max-w-lg mx-auto">
            <div className="flex items-start space-x-3 text-left">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary-100 flex items-center justify-center">
                <span className="text-primary-600 text-sm font-bold">1</span>
              </div>
              <div>
                <p className="font-semibold text-gray-900">Submit Encrypted Intent</p>
                <p className="text-sm text-gray-600">ChaCha20-Poly1305 encryption, on-chain commitment</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3 text-left">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary-100 flex items-center justify-center">
                <span className="text-primary-600 text-sm font-bold">2</span>
              </div>
              <div>
                <p className="font-semibold text-gray-900">Arcium MPC Matching</p>
                <p className="text-sm text-gray-600">Private order matching via secure enclaves</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3 text-left">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary-100 flex items-center justify-center">
                <span className="text-primary-600 text-sm font-bold">3</span>
              </div>
              <div>
                <p className="font-semibold text-gray-900">Atomic Settlement</p>
                <p className="text-sm text-gray-600">Sub-second execution on Solana</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Pool Info */}
      <PoolInfo poolData={poolData} loading={loading} onRefresh={loadPoolData} />
      
      {/* Main Grid */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Submit Intent */}
        <SubmitIntent onSuccess={loadPoolData} />
        
        {/* My Intents */}
        <MyIntents />
      </div>
      
      {/* Info Banner */}
      <div className="card bg-gradient-to-r from-primary-50 to-emerald-50 border-primary-200">
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0">
            <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-gray-900 mb-2">Hackathon Demo Mode</h3>
            <p className="text-sm text-gray-700 mb-3">
              This is a demonstration interface for the Colosseum Solana Frontier Hackathon. 
              The backend settlement logic is fully implemented on-chain, but the Arcium MPC relayer 
              is not running in this demo.
            </p>
            <p className="text-sm text-gray-700">
              <span className="font-semibold">What works:</span> Intent submission, cancellation, and on-chain state management. 
              <span className="font-semibold ml-2">What's simulated:</span> Arcium MPC matching and bundle settlement.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
