import { FC, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';

const MyIntents: FC = () => {
  const { publicKey } = useWallet();
  const [intents] = useState<any[]>([]);

  if (!publicKey) {
    return (
      <div className="card">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">My Intents</h2>
        <div className="text-center py-12">
          <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
          </svg>
          <p className="text-gray-600">Connect wallet to view your intents</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">My Intents</h2>
          <p className="text-sm text-gray-600 mt-1">Your active and filled intents</p>
        </div>
        
        <div className="flex items-center space-x-2 text-sm">
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <span className="text-gray-600">Pending</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-gray-600">Filled</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span className="text-gray-600">Cancelled</span>
          </div>
        </div>
      </div>

      {intents.length === 0 ? (
        <div className="text-center py-12">
          <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
          </svg>
          <p className="text-gray-600 mb-2">No intents yet</p>
          <p className="text-sm text-gray-500">Submit your first encrypted intent to get started</p>
        </div>
      ) : (
        <div className="space-y-3">
          {intents.map((intent, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4 hover:border-primary-300 transition">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center space-x-3">
                  <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    intent.side === 'buy' 
                      ? 'bg-green-100 text-green-700'
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {intent.side.toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{intent.amount} SOL</p>
                    <p className="text-sm text-gray-600">@ {intent.price} USDC</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${
                    intent.status === 'pending' ? 'bg-yellow-500' :
                    intent.status === 'filled' ? 'bg-green-500' :
                    'bg-red-500'
                  }`}></div>
                  <span className="text-sm text-gray-600 capitalize">{intent.status}</span>
                </div>
              </div>
              
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">{intent.timestamp}</span>
                {intent.status === 'pending' && (
                  <button className="text-red-600 hover:text-red-700 font-semibold">
                    Cancel
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyIntents;
