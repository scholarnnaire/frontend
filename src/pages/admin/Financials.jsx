import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { CreditCard, DollarSign, TrendingUp, CheckCircle, XCircle, Search, FileText } from 'lucide-react';
import axios from 'axios';

export function Financials() {
  const { isDarkMode } = useOutletContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('withdrawals');
  const [withdrawals, setWithdrawals] = useState([]);

  useEffect(() => {
    const fetchWithdrawals = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/admin/financials/withdrawals');
        setWithdrawals(response.data);
      } catch (error) {
        console.error("Failed to fetch withdrawals", error);
      }
    };
    fetchWithdrawals();
  }, []);

  return (
    <div className={`rounded-xl border shadow-sm overflow-hidden flex flex-col h-full relative ${isDarkMode ? 'bg-[#1A1C23] border-white/5' : 'bg-white border-gray-200'}`}>
      <div className={`p-6 border-b flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 ${isDarkMode ? 'bg-[#13151A] border-white/5' : 'bg-gray-50/50 border-gray-100'}`}>
        <div>
          <h3 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-brand-dark'}`}>Financials</h3>
          <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Manage wallets, approve withdrawal requests, and oversee platform fees.</p>
        </div>
        
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} size={16} />
            <input 
              type="text" 
              placeholder="Search..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`pl-9 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all w-full shadow-sm ${isDarkMode ? 'bg-[#0A0C10] border-white/10 text-white placeholder-gray-500' : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400'}`}
            />
          </div>
          <button 
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm shrink-0 cursor-pointer ${isDarkMode ? 'bg-[#2A2D35] border-white/10 text-white hover:bg-[#323640]' : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'}`}
          >
            <FileText size={16} /> Export Report
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6">
        {/* Top Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className={`p-5 rounded-2xl border flex items-center justify-between ${isDarkMode ? 'bg-[#13151A] border-white/5 shadow-black/20' : 'bg-white border-gray-100 shadow-sm'}`}>
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isDarkMode ? 'bg-white/5 text-green-400' : 'bg-green-50 text-green-600'}`}>
                <DollarSign size={20} />
              </div>
              <div>
                <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Total Revenue (Fees)</p>
                <h3 className={`text-2xl font-bold tracking-tight ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>₦1.2M</h3>
              </div>
            </div>
          </div>
          
          <div className={`p-5 rounded-2xl border flex items-center justify-between ${isDarkMode ? 'bg-[#13151A] border-white/5 shadow-black/20' : 'bg-white border-gray-100 shadow-sm'}`}>
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isDarkMode ? 'bg-white/5 text-red-500' : 'bg-red-50 text-red-600'}`}>
                <CreditCard size={20} />
              </div>
              <div>
                <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Pending Withdrawals</p>
                <h3 className={`text-2xl font-bold tracking-tight ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>₦100K</h3>
              </div>
            </div>
          </div>
          
          <div className={`p-5 rounded-2xl border flex items-center justify-between ${isDarkMode ? 'bg-[#13151A] border-white/5 shadow-black/20' : 'bg-white border-gray-100 shadow-sm'}`}>
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isDarkMode ? 'bg-white/5 text-blue-400' : 'bg-blue-50 text-blue-600'}`}>
                <TrendingUp size={20} />
              </div>
              <div>
                <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Total Payouts</p>
                <h3 className={`text-2xl font-bold tracking-tight ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>₦4.5M</h3>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className={`flex gap-4 border-b mb-6 ${isDarkMode ? 'border-white/10' : 'border-gray-200'}`}>
          <button 
            onClick={() => setActiveTab('withdrawals')}
            className={`pb-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'withdrawals' ? 'border-red-500 text-red-500' : (isDarkMode ? 'border-transparent text-gray-400 hover:text-white' : 'border-transparent text-gray-500 hover:text-gray-900')}`}
          >
            Withdrawal Requests
          </button>
          <button 
            onClick={() => setActiveTab('wallets')}
            className={`pb-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'wallets' ? 'border-red-500 text-red-500' : (isDarkMode ? 'border-transparent text-gray-400 hover:text-white' : 'border-transparent text-gray-500 hover:text-gray-900')}`}
          >
            Team Wallets
          </button>
        </div>

        {/* Content */}
        {activeTab === 'withdrawals' && (
          <div className={`rounded-xl border overflow-hidden ${isDarkMode ? 'border-white/5' : 'border-gray-200'}`}>
            <table className="w-full text-left border-collapse">
              <thead className={`text-sm uppercase tracking-wider font-semibold border-b ${isDarkMode ? 'bg-[#13151A] text-gray-400 border-white/10' : 'bg-gray-50 text-gray-500 border-gray-200'}`}>
                <tr>
                  <th className="py-4 px-6">ID</th>
                  <th className="py-4 px-6">Team / User</th>
                  <th className="py-4 px-6">Amount</th>
                  <th className="py-4 px-6">Date</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className={`divide-y text-base ${isDarkMode ? 'divide-white/5' : 'divide-gray-100'}`}>
                {withdrawals.map((req) => (
                  <tr key={req.id} className={`transition-colors group ${isDarkMode ? 'hover:bg-white/5' : 'hover:bg-gray-50'}`}>
                    <td className={`py-5 px-6 font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{req.id}</td>
                    <td className={`py-5 px-6 font-bold ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>{req.team ? req.team.name : `Team #${req.team_id}`}</td>
                    <td className={`py-5 px-6 font-bold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>₦{req.amount}</td>
                    <td className={`py-5 px-6 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{new Date(req.created_at).toLocaleDateString()}</td>
                    <td className="py-5 px-6">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold border ${
                        req.status === 'Approved' ? (isDarkMode ? 'bg-green-500/20 text-green-400 border-green-500/20' : 'bg-emerald-50 text-emerald-600 border-emerald-100') :
                        req.status === 'Rejected' ? (isDarkMode ? 'bg-red-500/20 text-red-400 border-red-500/20' : 'bg-red-50 text-red-600 border-red-100') :
                        (isDarkMode ? 'bg-orange-500/20 text-orange-400 border-orange-500/20' : 'bg-amber-50 text-amber-600 border-amber-100')
                      }`}>
                        {req.status}
                      </span>
                    </td>
                    <td className="py-5 px-6 text-right">
                      {req.status === 'Pending' && (
                        <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button className={`p-2 rounded-lg transition-colors cursor-pointer ${isDarkMode ? 'text-green-400 hover:bg-green-400/10' : 'text-emerald-600 hover:bg-emerald-50'}`} title="Approve">
                            <CheckCircle size={18} />
                          </button>
                          <button className={`p-2 rounded-lg transition-colors cursor-pointer ${isDarkMode ? 'text-red-400 hover:bg-red-400/10' : 'text-red-600 hover:bg-red-50'}`} title="Reject">
                            <XCircle size={18} />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
