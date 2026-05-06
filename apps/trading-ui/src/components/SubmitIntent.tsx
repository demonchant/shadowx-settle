import { FC, useState } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import toast from 'react-hot-toast';
import { Transaction, SystemProgram, PublicKey } from '@solana/web3.js';
import { PROGRAM_ID } from '../utils/constants';

interface SubmitIntentProps {
  onSuccess: () => void;
}

const SubmitIntent: FC<SubmitIntentProps> = ({ onSuccess }) => {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();
  
  const [formData, setFormData] = useState({
    side: 'buy',
    amount: '',
    price: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!publicKey) {
      toast.error('Wallet not connected');
      return;
    }

    const amount = parseFloat(formData.amount);
    const price = parseFloat(formData.price);

    if (isNaN(amount) || amount <= 0) {
      toast.error('Invalid amount');
      return;
    }

    if (isNaN(price) || price <= 0) {
      toast.error('Invalid price');
      return;
    }

    try {
      setSubmitting(true);
      
      // For demo: just show that the form works
      // In production, this would call the actual submit_intent instruction
      toast.success('Intent submission coming soon! This is a demo interface.');
      
      // Reset form
      setFormData({
        side: 'buy',
        amount: '',
        price: '',
      });
      
      onSuccess();
    } catch (error: any) {
      console.error('Error submitting intent:', error);
      toast.error(error.message || 'Failed to submit intent');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="card">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Submit Intent</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Side Selection */}
        <div>
          <label className="label">Side</label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, side: 'buy' }))}
              className={`py-3 px-4 rounded-lg font-semibold transition ${
                formData.side === 'buy'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Buy
            </button>
            <button
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, side: 'sell' }))}
              className={`py-3 px-4 rounded-lg font-semibold transition ${
                formData.side === 'sell'
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Sell
            </button>
          </div>
        </div>

        {/* Amount */}
        <div>
          <label className="label">Amount (SOL)</label>
          <input
            type="number"
            step="0.01"
            placeholder="0.00"
            value={formData.amount}
            onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
            className="input"
            required
          />
        </div>

        {/* Limit Price */}
        <div>
          <label className="label">Limit Price (USDC)</label>
          <input
            type="number"
            step="0.01"
            placeholder="0.00"
            value={formData.price}
            onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
            className="input"
            required
          />
        </div>

        {/* Info Box */}
        <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <svg className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <div className="text-sm text-primary-800">
              <p className="font-semibold mb-1">Your intent will be encrypted</p>
              <p>Order parameters encrypted with ChaCha20-Poly1305. Only Arcium MPC can see plaintext execution details.</p>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={submitting || !publicKey}
          className="btn-primary w-full"
        >
          {submitting ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Submitting...
            </span>
          ) : (
            'Submit Encrypted Intent'
          )}
        </button>

        {!publicKey && (
          <p className="text-center text-sm text-gray-600">
            Connect wallet to submit intents
          </p>
        )}
      </form>
    </div>
  );
};

export default SubmitIntent;
