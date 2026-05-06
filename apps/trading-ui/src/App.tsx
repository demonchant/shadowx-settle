import { FC, useMemo } from 'react';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { PhantomWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets';
import { clusterApiUrl } from '@solana/web3.js';
import { Toaster } from 'react-hot-toast';

import '@solana/wallet-adapter-react-ui/styles.css';
import './index.css';

import Header from './components/Header';
import Dashboard from './components/Dashboard';
import { RPC_ENDPOINT } from './utils/constants';

const App: FC = () => {
  const network = WalletAdapterNetwork.Devnet;
  const endpoint = useMemo(() => RPC_ENDPOINT, []);
  
  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter({ network }),
    ],
    [network]
  );

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <div className="min-h-screen bg-gradient-to-br from-gray-50 to-primary-50">
            <Header />
            <main className="container mx-auto px-4 py-8">
              <Dashboard />
            </main>
            
            {/* Footer */}
            <footer className="border-t border-gray-200 mt-16 py-8">
              <div className="container mx-auto px-4">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                  <div className="text-sm text-gray-600">
                    <p className="font-bold text-gray-900 mb-1">Built For:</p>
                    <ul className="space-y-1">
                      <li>• Colosseum Hackathon 2026</li>
                      <li>• Solana Frontier Track</li>
                      <li>• Arcium MPC Integration</li>
                    </ul>
                  </div>
                  
                  <div className="text-sm text-gray-600">
                    <p className="font-bold text-gray-900 mb-1">Network:</p>
                    <p>Solana Devnet</p>
                    <p className="font-mono text-xs">4GSUVff...xwKQt</p>
                  </div>
                  
                  <div className="text-sm text-gray-600">
                    <p className="font-bold text-gray-900 mb-1">Deadline:</p>
                    <p>May 10, 2026</p>
                  </div>
                </div>
              </div>
            </footer>
            
            <Toaster position="bottom-right" />
          </div>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};

export default App;
