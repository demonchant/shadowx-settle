import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { PhantomWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets';
import { RPC_ENDPOINT } from './utils/program';

import '@solana/wallet-adapter-react-ui/styles.css';

const wallets = [
  new PhantomWalletAdapter(),
  new SolflareWalletAdapter(),
];

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ConnectionProvider endpoint={RPC_ENDPOINT}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <App />
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  </React.StrictMode>,
);
