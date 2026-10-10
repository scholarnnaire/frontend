import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Wallet as WalletIcon, 
  ArrowDownLeft, 
  CreditCard, 
  History, 
  RefreshCw, 
  CheckCircle2, 
  X, 
  ShieldCheck, 
  Download,
  PlusCircle
} from 'lucide-react';
import api from '../../utils/api';

const PRESET_AMOUNTS = [1000, 2500, 5000, 10000, 25000, 50000];

export function Wallet() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [walletData, setWalletData] = useState({
    wallet_balance: 0,
    formatted_balance: '₦ 0.00',
    school_name: '',
    transactions: []
  });

  // Modal states
  const [isTopUpOpen, setIsTopUpOpen] = useState(false);
  const [isMethodsOpen, setIsMethodsOpen] = useState(false);
  const [statusNotification, setStatusNotification] = useState(null);

  // Top-Up Form state
  const [topUpAmount, setTopUpAmount] = useState(5000);
  const [isCustomAmount, setIsCustomAmount] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // Fetch Wallet Data from Database
  const fetchWallet = async (isManualRefresh = false) => {
    if (isManualRefresh) setRefreshing(true);
    try {
      const response = await api.get('/payment/wallet');
      setWalletData(response.data);
    } catch (err) {
      console.error('Failed to load wallet data:', err);
    } finally {
      setLoading(false);
      if (isManualRefresh) setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchWallet();
  }, []);

  // Handle Paystack Top-Up
  const handleTopUpSubmit = async (e) => {
    e.preventDefault();
    const amount = Number(topUpAmount);
    if (!amount || amount < 100) {
      alert('Minimum top-up amount is ₦100');
      return;
    }

    setIsProcessingPayment(true);
    try {
      // 1. Initialize on Backend
      const initRes = await api.post('/payment/initialize', {
        amount: amount,
        payment_type: 'wallet_topup',
        description: 'Team Wallet Top-Up'
      });

      const { reference, authorization_url, access_code } = initRes.data;

      // 2. Open Paystack Pop v2 if available
      let popupOpened = false;
      if (window.PaystackPop && access_code) {
        try {
          const popup = new window.PaystackPop();
          if (typeof popup.resumeTransaction === 'function') {
            popup.resumeTransaction(access_code, {
              onSuccess: async (transaction) => {
                const refToVerify = transaction?.reference || reference;
                try {
                  const verifyRes = await api.get(`/payment/verify/${refToVerify}`);
                  if (verifyRes.data.success) {
                    setStatusNotification({
                      type: 'success',
                      title: 'Wallet Credited Successfully!',
                      message: `₦${amount.toLocaleString()} has been added to your available balance.`
                    });
                    setIsTopUpOpen(false);
                    fetchWallet();
                  }
                } catch (vErr) {
                  console.error('Verification error:', vErr);
                  fetchWallet();
                } finally {
                  setIsProcessingPayment(false);
                }
              },
              onCancel: () => {
                setIsProcessingPayment(false);
              }
            });
            popupOpened = true;
          }
        } catch (popupErr) {
          console.warn('Paystack popup instantiation error:', popupErr);
        }
      }

      // 3. Fallback: Seamlessly redirect to Paystack secure checkout page
      if (!popupOpened && authorization_url) {
        window.location.href = authorization_url;
      } else if (!popupOpened) {
        alert('Could not open Paystack checkout. Please check internet connection.');
        setIsProcessingPayment(false);
      }
    } catch (err) {
      console.error('Payment initialization failed:', err);
      const detail = err.response?.data?.detail || err.message || 'Failed to initiate payment. Please try again.';
      alert(detail);
      setIsProcessingPayment(false);
    }
  };

  // Download Statement CSV
  const handleDownloadStatement = () => {
    if (!walletData.transactions || walletData.transactions.length === 0) {
      alert('No transactions available to export yet.');
      return;
    }

    const headers = ['Transaction ID', 'Reference', 'Type', 'Description', 'Amount', 'Date', 'Status'];
    const rows = walletData.transactions.map(t => [
      `"${t.id}"`,
      `"${t.reference}"`,
      `"${t.type}"`,
      `"${t.desc.replace(/"/g, '""')}"`,
      `"${t.amount}"`,
      `"${t.date}"`,
      `"${t.status}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `statement_${walletData.school_name?.toLowerCase().replace(/\s+/g, '_') || 'team'}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-4xl mx-auto w-full space-y-8 pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-white">Team Wallet</h1>
          <p className="text-gray-400 text-base md:text-lg">
            Manage tournament entry fees, top-ups, and track team finances.
          </p>
        </div>
        <button
          onClick={() => fetchWallet(true)}
          disabled={refreshing}
          className="self-start sm:self-auto flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/5 transition-all text-sm font-semibold"
          title="Refresh Balance"
        >
          <RefreshCw size={16} className={refreshing ? 'animate-spin text-brand-green' : ''} />
          {refreshing ? 'Updating...' : 'Sync Balance'}
        </button>
      </div>

      {/* Status Notification Banner */}
      <AnimatePresence>
        {statusNotification && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`p-4 rounded-2xl flex items-start justify-between border ${
              statusNotification.type === 'success' 
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                : 'bg-red-500/10 border-red-500/30 text-red-400'
            }`}
          >
            <div className="flex items-center gap-3">
              <CheckCircle2 size={22} className="shrink-0" />
              <div>
                <h4 className="font-bold text-sm text-white">{statusNotification.title}</h4>
                <p className="text-xs text-gray-300 mt-0.5">{statusNotification.message}</p>
              </div>
            </div>
            <button 
              onClick={() => setStatusNotification(null)}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X size={18} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Section: Balance & Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Balance Card */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gradient-to-br from-brand-green to-emerald-700 p-8 rounded-3xl text-[#0D0F14] relative overflow-hidden shadow-2xl shadow-brand-green/20 flex flex-col justify-between min-h-[220px]"
        >
          <div className="absolute -right-8 -top-8 text-emerald-800/20 pointer-events-none">
            <WalletIcon size={190} />
          </div>
          
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <p className="font-bold text-emerald-950/70 uppercase tracking-wider text-xs font-mono">
                Available Balance
              </p>
              {walletData.school_name && (
                <span className="text-xs bg-black/15 px-2.5 py-1 rounded-full font-bold text-emerald-950">
                  {walletData.school_name}
                </span>
              )}
            </div>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight mt-2 text-[#0D0F14]">
              {loading ? (
                <span className="opacity-50 text-2xl animate-pulse">Loading...</span>
              ) : (
                `₦ ${Number(walletData.wallet_balance || 0).toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
              )}
            </h2>
          </div>
          
          <div className="relative z-10 mt-8">
            <button 
              onClick={() => setIsTopUpOpen(true)}
              className="w-full bg-[#0D0F14] hover:bg-black text-white py-3.5 px-6 rounded-2xl font-bold flex items-center justify-center gap-2.5 transition-all shadow-xl active:scale-[0.98] group"
            >
              <ArrowDownLeft size={20} className="text-brand-green group-hover:-translate-y-0.5 transition-transform" />
              <span className="tracking-wide">Top Up Balance</span>
            </button>
          </div>
        </motion.div>

        {/* Quick Actions */}
        <div className="bg-[#13151A] border border-white/5 rounded-3xl p-6 flex flex-col gap-4 justify-center shadow-xl">
          <button 
            onClick={() => setIsMethodsOpen(true)}
            className="flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 rounded-2xl transition-all border border-white/5 group text-left active:scale-[0.99]"
          >
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 rounded-2xl bg-blue-500/10 text-blue-400 flex items-center justify-center shrink-0">
                <CreditCard size={20} />
              </div>
              <div>
                <h3 className="text-white font-bold text-sm group-hover:text-blue-400 transition-colors">
                  Payment Security & Channels
                </h3>
                <p className="text-gray-400 text-xs mt-0.5">Paystack 3D Secure, Cards, Transfer & USSD</p>
              </div>
            </div>
            <div className="text-gray-500 group-hover:text-white transition-colors shrink-0">
              <ShieldCheck size={18} />
            </div>
          </button>
          
          <button 
            onClick={handleDownloadStatement}
            className="flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 rounded-2xl transition-all border border-white/5 group text-left active:scale-[0.99]"
          >
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 rounded-2xl bg-purple-500/10 text-purple-400 flex items-center justify-center shrink-0">
                <History size={20} />
              </div>
              <div>
                <h3 className="text-white font-bold text-sm group-hover:text-purple-400 transition-colors">
                  Download Statement
                </h3>
                <p className="text-gray-400 text-xs mt-0.5">Export CSV transaction audit report</p>
              </div>
            </div>
            <Download size={18} className="text-gray-500 group-hover:text-white transition-colors shrink-0" />
          </button>
        </div>
      </div>

      {/* Transaction History */}
      <div className="bg-[#13151A] border border-white/5 rounded-3xl p-6 md:p-8 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-white">Recent Transactions</h2>
            <p className="text-xs text-gray-500 mt-1">Real-time ledger synchronized with Paystack payment gateway</p>
          </div>
          <span className="text-xs font-semibold px-3 py-1 bg-white/5 rounded-full text-gray-400 border border-white/5">
            {walletData.transactions.length} Records
          </span>
        </div>

        {loading ? (
          <div className="py-12 text-center text-gray-500 text-sm animate-pulse">
            Loading transaction history...
          </div>
        ) : walletData.transactions.length === 0 ? (
          <div className="py-12 text-center text-gray-500 text-sm">
            <History size={36} className="mx-auto mb-3 opacity-30 text-gray-400" />
            No transactions found yet. Click <strong>Top Up Balance</strong> above to fund your team wallet!
          </div>
        ) : (
          <div className="space-y-4">
            {walletData.transactions.map((tx) => (
              <div 
                key={tx.id} 
                className="flex items-center justify-between pb-4 border-b border-white/5 last:border-0 last:pb-0 hover:bg-white/[0.02] p-2 rounded-xl transition-colors"
              >
                <div className="flex items-center gap-3.5">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs ${
                    tx.color.includes('green') ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
                  }`}>
                    {tx.color.includes('green') ? '+' : '-'}
                  </div>
                  <div>
                    <h4 className="text-white font-bold text-sm">{tx.desc}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-gray-500 text-xs">{tx.date}</span>
                      <span className="text-gray-700">•</span>
                      <span className="text-gray-500 text-xs font-mono">{tx.reference}</span>
                      <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                        tx.status === 'success' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
                      }`}>
                        {tx.status}
                      </span>
                    </div>
                  </div>
                </div>
                <div className={`font-black text-right text-base ${tx.color}`}>
                  {tx.amount}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ======================= TOP-UP MODAL (PAYSTACK) ======================= */}
      <AnimatePresence>
        {isTopUpOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#181A20] border border-white/10 rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl relative"
            >
              <button 
                onClick={() => setIsTopUpOpen(false)}
                className="absolute top-5 right-5 text-gray-400 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>

              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-2xl bg-brand-green/10 text-brand-green flex items-center justify-center font-bold">
                  <PlusCircle size={22} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-white">Top Up Team Wallet</h3>
                  <p className="text-xs text-gray-400">Instant credit powered by Paystack</p>
                </div>
              </div>

              <form onSubmit={handleTopUpSubmit} className="space-y-5">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
                    Select Amount (₦)
                  </label>
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    {PRESET_AMOUNTS.map((amt) => (
                      <button
                        type="button"
                        key={amt}
                        onClick={() => {
                          setTopUpAmount(amt);
                          setIsCustomAmount(false);
                        }}
                        className={`py-2.5 px-3 rounded-xl text-sm font-bold border transition-all ${
                          !isCustomAmount && topUpAmount === amt
                            ? 'bg-brand-green text-[#0D0F14] border-brand-green shadow-lg shadow-brand-green/20'
                            : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10'
                        }`}
                      >
                        ₦{amt.toLocaleString()}
                      </button>
                    ))}
                  </div>

                  <div className="mt-3">
                    <label className="block text-xs text-gray-400 mb-1">Or enter custom amount:</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">₦</span>
                      <input
                        type="number"
                        min="100"
                        step="100"
                        value={topUpAmount}
                        onChange={(e) => {
                          setTopUpAmount(e.target.value);
                          setIsCustomAmount(true);
                        }}
                        placeholder="e.g. 15,000"
                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-3 text-white font-bold focus:outline-none focus:border-brand-green transition-colors"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Gateway Information Badge */}
                <div className="p-3 bg-white/5 rounded-2xl border border-white/5 flex items-center justify-between text-xs text-gray-400">
                  <div className="flex items-center gap-2">
                    <ShieldCheck size={16} className="text-brand-green shrink-0" />
                    <span>Paystack 256-bit Bank Encryption</span>
                  </div>
                  <span className="text-[11px] font-bold text-gray-300">Instant</span>
                </div>

                <button
                  type="submit"
                  disabled={isProcessingPayment}
                  className="w-full bg-brand-green text-[#0D0F14] py-3.5 px-4 rounded-xl font-black flex items-center justify-center gap-2 hover:bg-emerald-400 transition-all shadow-xl shadow-brand-green/20 disabled:opacity-50"
                >
                  {isProcessingPayment ? (
                    <>
                      <RefreshCw size={18} className="animate-spin" />
                      Connecting Paystack...
                    </>
                  ) : (
                    <>Pay ₦{Number(topUpAmount || 0).toLocaleString()} with Paystack</>
                  )}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ======================= MANAGE PAYMENT METHODS MODAL ======================= */}
      <AnimatePresence>
        {isMethodsOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#181A20] border border-white/10 rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl relative"
            >
              <button 
                onClick={() => setIsMethodsOpen(false)}
                className="absolute top-5 right-5 text-gray-400 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>

              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-2xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
                  <CreditCard size={22} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-white">Payment Methods</h3>
                  <p className="text-xs text-gray-400">Secured via Paystack Gateway</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-white/5 rounded-2xl border border-white/10 flex items-start gap-3">
                  <ShieldCheck size={24} className="text-brand-green shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-bold text-white">PCI-DSS Level 1 Certified</h4>
                    <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                      Your debit cards, mastercards, and bank accounts are never stored in raw format on our servers. All transactions use Paystack tokenization and 3D Secure verification with your bank.
                    </p>
                  </div>
                </div>

                <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                  <h5 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Supported Channels</h5>
                  <div className="flex flex-wrap gap-2">
                    {['Mastercard', 'Visa', 'Verve', 'Bank Transfer', 'USSD (*737#, etc)', 'Apple Pay'].map((channel) => (
                      <span key={channel} className="text-xs px-2.5 py-1 bg-white/10 rounded-lg text-gray-200 font-medium">
                        {channel}
                      </span>
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsMethodsOpen(false)}
                  className="w-full bg-white/10 hover:bg-white/20 text-white py-3 rounded-xl font-bold transition-colors"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
