import { FC } from 'react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

const Header: FC = () => {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-emerald-600 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-emerald-600 bg-clip-text text-transparent">
                ShadowX Settle
              </h1>
              <p className="text-xs text-gray-600">Intent-Based Privacy Execution</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <a 
              href="https://explorer.solana.com/address/4GSUVffLEXNkL6i5TJL2dhSDuuubhagqfaRigo2xwKQt?cluster=devnet"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden md:flex items-center space-x-2 text-sm text-gray-600 hover:text-primary-600 transition"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
              </svg>
              <span>View on Explorer</span>
            </a>
            
            <WalletMultiButton />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
