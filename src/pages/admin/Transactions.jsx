import React, { useState, useEffect } from 'react';
import { 
  CreditCard, Search, ArrowUpRight, ArrowDownRight, Clock, CheckCircle2, XCircle
} from 'lucide-react';
import { getPaymentTransactions } from '../../utils/api'; // Fix import path

export const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Dark mode hook placeholder if needed, assume standard for now
  const isDarkMode = document.documentElement.classList.contains('dark'); 

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      // We will add getPaymentTransactions to the API service
      const data = await getPaymentTransactions();
      setTransactions(data);
    } catch (error) {
      console.error("Failed to fetch transactions:", error);
    } finally {
      setLoading(false);
    }
  };

  const filtered = transactions.filter(tx => 
    tx.school_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tx.tournament_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tx.reference.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={`p-8 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-black mb-2">Transactions</h1>
          <p className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>
            View and manage all payment transactions across tournaments.
          </p>
        </div>
        <div className={`flex items-center px-4 py-2 rounded-xl border ${isDarkMode ? 'bg-[#13151A] border-white/10' : 'bg-white border-gray-200'}`}>
          <Search size={18} className={isDarkMode ? 'text-gray-500' : 'text-gray-400'} />
          <input 
            type="text" 
            placeholder="Search reference, school..." 
            className={`ml-2 bg-transparent outline-none text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className={`rounded-2xl border overflow-hidden ${isDarkMode ? 'bg-[#13151A] border-white/10' : 'bg-white border-gray-200 shadow-sm'}`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className={`border-b text-xs uppercase tracking-wider ${isDarkMode ? 'border-white/10 text-gray-500' : 'border-gray-200 text-gray-500 bg-gray-50'}`}>
                <th className="px-6 py-4 font-bold">Reference</th>
                <th className="px-6 py-4 font-bold">School</th>
                <th className="px-6 py-4 font-bold">Tournament</th>
                <th className="px-6 py-4 font-bold">Amount</th>
                <th className="px-6 py-4 font-bold">Status</th>
                <th className="px-6 py-4 font-bold">Date</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-gray-500">Loading transactions...</td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-gray-500">No transactions found</td>
                </tr>
              ) : (
                filtered.map((tx) => (
                  <tr key={tx.id} className={`border-b last:border-0 ${isDarkMode ? 'border-white/5 hover:bg-white/5' : 'border-gray-100 hover:bg-gray-50'}`}>
                    <td className="px-6 py-4">
                      <div className="font-mono text-xs">{tx.reference}</div>
                    </td>
                    <td className="px-6 py-4 font-bold">{tx.school_name}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-block px-2 py-1 text-xs rounded-md ${isDarkMode ? 'bg-white/10 text-gray-300' : 'bg-gray-100 text-gray-600'}`}>
                        {tx.tournament_name}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-bold text-green-600">
                      ₦{tx.amount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-bold rounded-full ${
                        tx.status === 'success' 
                          ? (isDarkMode ? 'bg-green-500/10 text-green-400' : 'bg-green-100 text-green-700')
                          : (isDarkMode ? 'bg-red-500/10 text-red-400' : 'bg-red-100 text-red-700')
                      }`}>
                        {tx.status === 'success' ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                        {tx.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {new Date(tx.created_at).toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
