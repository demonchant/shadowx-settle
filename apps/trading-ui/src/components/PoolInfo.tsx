import { FC } from 'react';
import { POOL_STATE_ADDRESS, EXPLORER_URL, CLUSTER } from '../utils/constants';
import { shortenAddress } from '../utils/helpers';

interface PoolInfoProps {
  poolData: any;
  loading: boolean;
  onRefresh: () => void;
}

const PoolInfo: FC<PoolInfoProps> = ({ poolData, loading, onRefresh }) => {
  return (
    <div className="card">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Pool State</h2>
          <p className="text-sm text-gray-600 mt-1">Global settlement pool configuration</p>
        </div>
        
        <button
          onClick={onRefresh}
          disabled={loading}
          className="p-2 rounded-lg hover:bg-gray-100 transition disabled:opacity-50"
        >
          <svg className={`w-5 h-5 text-gray-600 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
          </svg>
        </button>
      </div>
      
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      ) : poolData ? (
        <div className="grid md:grid-cols-3 gap-6">
          <div>
            <p className="text-sm text-gray-600 mb-1">Pool Address</p>
            <a
              href={`${EXPLORER_URL}/address/${POOL_STATE_ADDRESS.toBase58()}?cluster=${CLUSTER}`}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-sm text-primary-600 hover:text-primary-700 flex items-center space-x-1"
            >
              <span>{shortenAddress(POOL_STATE_ADDRESS.toBase58(), 6)}</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
              </svg>
            </a>
          </div>
          
          <div>
            <p className="text-sm text-gray-600 mb-1">Fee</p>
            <p className="text-lg font-bold text-gray-900">0.30%</p>
          </div>
          
          <div>
            <p className="text-sm text-gray-600 mb-1">Min Settlement Delay</p>
            <p className="text-lg font-bold text-gray-900">4 slots</p>
          </div>
          
          <div>
            <p className="text-sm text-gray-600 mb-1">Status</p>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-semibold text-green-700">Active</span>
            </div>
          </div>
          
          <div>
            <p className="text-sm text-gray-600 mb-1">Network</p>
            <p className="text-sm font-semibold text-gray-900">Solana Devnet</p>
          </div>
          
          <div>
            <p className="text-sm text-gray-600 mb-1">Encryption</p>
            <p className="text-sm font-semibold text-gray-900">ChaCha20-Poly1305</p>
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-600">No pool data available</p>
        </div>
      )}
    </div>
  );
};

export default PoolInfo;
