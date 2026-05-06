import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { Shield, Zap, Lock, ExternalLink, TrendingUp, Activity, DollarSign, ChevronRight } from 'lucide-react';
import { usePoolState } from './hooks/usePoolState';
import { useState, useEffect } from 'react';
import { PROGRAM_ID } from './utils/program';

function App() {
  const { connected, publicKey } = useWallet();
  const { connection } = useConnection();
  const { poolState, loading } = usePoolState();
  const [side, setSide] = useState<'buy' | 'sell'>('buy');
  const [amount, setAmount] = useState('');
  const [price, setPrice] = useState('');
  const [activeTab, setActiveTab] = useState<'trade' | 'intents'>('trade');
  
  // Real-time stats
  const [totalIntents, setTotalIntents] = useState(0);
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    async function fetchLiveStats() {
      try {
        setStatsLoading(true);
        const accounts = await connection.getProgramAccounts(PROGRAM_ID);
        setTotalIntents(accounts.length > 0 ? accounts.length - 1 : 0);
      } catch (err) {
        console.error('Stats fetch error:', err);
      } finally {
        setStatsLoading(false);
      }
    }

    fetchLiveStats();
    const interval = setInterval(fetchLiveStats, 30000);
    return () => clearInterval(interval);
  }, [connection]);

  const handleSubmitIntent = async () => {
    if (!connected || !publicKey) {
      alert('Please connect your wallet');
      return;
    }
    alert('Intent submission will be available post-hackathon. This demo shows the UI/UX flow.');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-purple-950 to-black">
      {/* Navbar */}
      <nav className="border-b border-purple-500/20 bg-black/40 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-violet-600 rounded-lg flex items-center justify-center shadow-lg shadow-purple-500/50">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold text-white tracking-wider">SHADOWX</h1>
                <p className="text-xs text-purple-300">Privacy Execution</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <a 
                href="https://explorer.solana.com/address/4GSUVffLEXNkL6i5TJL2dhSDuuubhagqfaRigo2xwKQt?cluster=devnet" 
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-purple-300 hover:text-purple-400 transition flex items-center gap-1"
              >
                Explorer <ExternalLink className="w-3 h-3" />
              </a>
              <WalletMultiButton />
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="bg-purple-900/20 backdrop-blur-sm rounded-2xl p-6 border border-purple-500/30 hover:border-purple-500/50 transition-all">
            <div className="flex items-center justify-between mb-3">
              <Activity className="w-5 h-5 text-purple-400" />
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            </div>
            <div className="text-3xl font-bold text-white mb-1">Devnet</div>
            <div className="text-xs text-purple-300">Network Status</div>
          </div>

          <div className="bg-purple-900/20 backdrop-blur-sm rounded-2xl p-6 border border-purple-500/30 hover:border-purple-500/50 transition-all">
            <div className="flex items-center justify-between mb-3">
              <DollarSign className="w-5 h-5 text-violet-400" />
              <Zap className="w-4 h-4 text-yellow-400" />
            </div>
            <div className="text-3xl font-bold text-white mb-1">
              {loading ? '...' : `${(poolState?.feeBps || 0) / 100}%`}
            </div>
            <div className="text-xs text-purple-300">Trading Fee</div>
          </div>

          <div className="bg-purple-900/20 backdrop-blur-sm rounded-2xl p-6 border border-purple-500/30 hover:border-purple-500/50 transition-all">
            <div className="flex items-center justify-between mb-3">
              <TrendingUp className="w-5 h-5 text-blue-400" />
              <Lock className="w-4 h-4 text-purple-400" />
            </div>
            <div className="text-2xl font-bold text-white mb-1 truncate">
              {loading ? '...' : poolState?.minSettlementDelaySlots || 0}
            </div>
            <div className="text-xs text-purple-300">Min Delay (slots)</div>
          </div>

          <div className="bg-purple-900/20 backdrop-blur-sm rounded-2xl p-6 border border-purple-500/30 hover:border-purple-500/50 transition-all">
            <div className="flex items-center justify-between mb-3">
              <Shield className="w-5 h-5 text-purple-400" />
              <div className={`text-xs px-2 py-1 rounded ${poolState?.locked ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}`}>
                {loading ? '...' : poolState?.locked ? 'Locked' : 'Active'}
              </div>
            </div>
            <div className="text-3xl font-bold text-white mb-1">
              {loading ? '...' : poolState?.locked ? '🔒' : '✨'}
            </div>
            <div className="text-xs text-purple-300">Pool Status</div>
          </div>
        </div>

        {/* Main Trading Interface */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Trading Card */}
          <div className="lg:col-span-2 bg-gradient-to-br from-purple-900/30 to-black/50 backdrop-blur-xl rounded-3xl border border-purple-500/30 p-8 shadow-2xl shadow-purple-500/20">
            {!connected ? (
              <div className="text-center py-20">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-500/20 to-violet-500/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-purple-500/30">
                  <Lock className="w-10 h-10 text-purple-400" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">Connect Your Wallet</h3>
                <p className="text-purple-300 mb-6 max-w-md mx-auto">
                  Connect your Solana wallet to start trading with encrypted intents
                </p>
                <WalletMultiButton />
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h2 className="text-3xl font-bold text-white mb-1">Trade</h2>
                    <p className="text-purple-300">Submit encrypted intent</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setActiveTab('trade')}
                      className={`px-4 py-2 rounded-lg font-medium transition ${
                        activeTab === 'trade'
                          ? 'bg-purple-600 text-white'
                          : 'bg-purple-900/30 text-purple-300 hover:bg-purple-900/50'
                      }`}
                    >
                      Trade
                    </button>
                    <button
                      onClick={() => setActiveTab('intents')}
                      className={`px-4 py-2 rounded-lg font-medium transition ${
                        activeTab === 'intents'
                          ? 'bg-purple-600 text-white'
                          : 'bg-purple-900/30 text-purple-300 hover:bg-purple-900/50'
                      }`}
                    >
                      My Intents
                    </button>
                  </div>
                </div>

                {activeTab === 'trade' ? (
                  <div className="space-y-6">
                    {/* Side Selector */}
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        onClick={() => setSide('buy')}
                        className={`py-4 rounded-xl font-bold text-lg transition-all ${
                          side === 'buy'
                            ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg shadow-green-500/50'
                            : 'bg-purple-900/20 text-purple-300 hover:bg-purple-900/30 border border-purple-500/30'
                        }`}
                      >
                        Buy
                      </button>
                      <button
                        onClick={() => setSide('sell')}
                        className={`py-4 rounded-xl font-bold text-lg transition-all ${
                          side === 'sell'
                            ? 'bg-gradient-to-r from-red-600 to-pink-600 text-white shadow-lg shadow-red-500/50'
                            : 'bg-purple-900/20 text-purple-300 hover:bg-purple-900/30 border border-purple-500/30'
                        }`}
                      >
                        Sell
                      </button>
                    </div>

                    {/* Amount Input */}
                    <div>
                      <label className="block text-sm font-medium text-purple-300 mb-2">Amount</label>
                      <div className="relative">
                        <input
                          type="number"
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                          placeholder="0.00"
                          className="w-full px-6 py-4 bg-purple-900/20 border border-purple-500/30 rounded-xl text-white text-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none transition"
                        />
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-purple-400 text-sm">
                          SOL
                        </div>
                      </div>
                    </div>

                    {/* Price Input */}
                    <div>
                      <label className="block text-sm font-medium text-purple-300 mb-2">
                        Limit Price <span className="text-purple-500">(Optional)</span>
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          value={price}
                          onChange={(e) => setPrice(e.target.value)}
                          placeholder="Market price"
                          className="w-full px-6 py-4 bg-purple-900/20 border border-purple-500/30 rounded-xl text-white text-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none transition"
                        />
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-purple-400 text-sm">
                          USDC
                        </div>
                      </div>
                    </div>

                    {/* Submit Button */}
                    <button 
                      onClick={handleSubmitIntent}
                      className="w-full py-5 bg-gradient-to-r from-purple-600 to-violet-600 text-white font-bold text-lg rounded-xl hover:shadow-2xl hover:shadow-purple-500/50 transition-all flex items-center justify-center gap-2"
                    >
                      Submit Encrypted Intent
                      <ChevronRight className="w-5 h-5" />
                    </button>

                    {/* Privacy Badge */}
                    <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4">
                      <div className="flex items-start gap-3">
                        <Lock className="w-5 h-5 text-purple-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <h4 className="font-semibold text-purple-300 mb-1">End-to-End Privacy</h4>
                          <p className="text-sm text-purple-400 leading-relaxed">
                            Your order is encrypted with ChaCha20-Poly1305. Only Arcium MPC can decrypt and match.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="py-12 text-center">
                    <Activity className="w-16 h-16 text-purple-600 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-white mb-2">No Active Intents</h3>
                    <p className="text-purple-400">Your submitted intents will appear here</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Live Stats */}
            <div className="bg-gradient-to-br from-purple-900/30 to-black/50 backdrop-blur-xl rounded-3xl border border-purple-500/30 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Activity className="w-5 h-5 text-purple-400" />
                  Live Stats
                </h3>
                {!statsLoading && (
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-xs text-purple-400">Live</span>
                  </div>
                )}
              </div>
              
              <div className="space-y-4">
                <div className="bg-purple-900/20 rounded-lg p-4">
                  <div className="text-purple-400 text-xs mb-1">Total Volume</div>
                  <div className="text-2xl font-bold text-white">$0</div>
                </div>
                
                <div className="bg-purple-900/20 rounded-lg p-4">
                  <div className="text-purple-400 text-xs mb-1">Intents Settled</div>
                  <div className="text-2xl font-bold text-white flex items-center gap-2">
                    {statsLoading ? '...' : totalIntents}
                    {!statsLoading && totalIntents === 0 && (
                      <span className="text-xs text-purple-500 font-normal">(Fresh pool)</span>
                    )}
                  </div>
                </div>
              </div>
              
              {totalIntents === 0 && !statsLoading && (
                <div className="mt-4 text-xs text-purple-400 text-center bg-purple-900/20 rounded-lg p-3">
                  Submit the first intent to see live updates ⚡
                </div>
              )}
            </div>
            
            {/* Pool Info */}
            <div className="bg-gradient-to-br from-purple-900/30 to-black/50 backdrop-blur-xl rounded-3xl border border-purple-500/30 p-6">
              <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                <Shield className="w-5 h-5 text-purple-400" />
                Pool Details
              </h3>
              
              {loading ? (
                <div className="text-purple-400 text-sm">Loading pool state...</div>
              ) : poolState ? (
                <div className="space-y-4 text-sm">
                  <div className="bg-purple-900/20 rounded-lg p-3">
                    <div className="text-purple-400 mb-1">Admin</div>
                    <div className="font-mono text-xs text-white break-all">
                      {poolState.admin.toBase58().slice(0, 8)}...{poolState.admin.toBase58().slice(-8)}
                    </div>
                  </div>
                  <div className="bg-purple-900/20 rounded-lg p-3">
                    <div className="text-purple-400 mb-1">Relayer</div>
                    <div className="font-mono text-xs text-white break-all">
                      {poolState.relayerAuthority.toBase58().slice(0, 8)}...{poolState.relayerAuthority.toBase58().slice(-8)}
                    </div>
                  </div>
                  <div className="bg-purple-900/20 rounded-lg p-3">
                    <div className="text-purple-400 mb-1">Arcium Verifier</div>
                    <div className="font-mono text-xs text-white break-all">
                      {poolState.arciumVerifier.toBase58().slice(0, 8)}...{poolState.arciumVerifier.toBase58().slice(-8)}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-red-400 text-sm">Failed to load pool state</div>
              )}
            </div>

            {/* Features */}
            <div className="bg-gradient-to-br from-purple-900/30 to-black/50 backdrop-blur-xl rounded-3xl border border-purple-500/30 p-6">
              <h3 className="text-lg font-bold text-white mb-4">Why ShadowX?</h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Lock className="w-4 h-4 text-purple-400" />
                  </div>
                  <div>
                    <div className="font-semibold text-white">Encrypted</div>
                    <div className="text-purple-400">Zero info leakage</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-violet-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Zap className="w-4 h-4 text-violet-400" />
                  </div>
                  <div>
                    <div className="font-semibold text-white">Fast</div>
                    <div className="text-purple-400">400ms settlement</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Shield className="w-4 h-4 text-purple-400" />
                  </div>
                  <div>
                    <div className="font-semibold text-white">Zero MEV</div>
                    <div className="text-purple-400">Batch fairness</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Badge */}
        <div className="mt-12 text-center">
          <div className="inline-block bg-purple-900/20 backdrop-blur-sm rounded-2xl border border-purple-500/30 px-8 py-4">
            <div className="text-xs text-purple-400 mb-2">BUILT FOR</div>
            <div className="flex items-center gap-4 text-sm">
              <div>
                <div className="font-bold text-purple-400">Colosseum 2026</div>
                <div className="text-xs text-purple-500">Solana Frontier</div>
              </div>
              <div className="text-purple-600">•</div>
              <div>
                <div className="font-bold text-purple-400">Arcium MPC</div>
                <div className="text-xs text-purple-500">Privacy Layer</div>
              </div>
              <div className="text-purple-600">•</div>
              <div className="font-bold text-red-400">May 10, 2026</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
