import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Play, ArrowRight } from 'lucide-react';

export function JoinRound() {
  const [accessCode, setAccessCode] = useState('');

  return (
    <div className="max-w-4xl mx-auto w-full flex flex-col items-center justify-center min-h-[70vh] space-y-8">
      
      <div className="text-center space-y-4 max-w-lg">
        <div className="w-16 h-16 rounded-2xl bg-brand-green/20 text-brand-green flex items-center justify-center mx-auto mb-6 shadow-lg shadow-brand-green/10">
          <Play size={32} className="ml-1" />
        </div>
        <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight">Join Live Match</h1>
        <p className="text-gray-400 text-lg">Enter the 6-digit access code provided by your tournament moderator to enter the arena.</p>
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-[#13151A] border border-white/10 p-8 rounded-3xl shadow-2xl relative overflow-hidden"
      >
        {/* Decorative background glow */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-brand-green/20 rounded-full blur-3xl pointer-events-none"></div>

        <div className="space-y-6 relative z-10">
          <div>
            <label className="block text-sm font-bold text-gray-400 mb-2 uppercase tracking-wider">Access Code</label>
            <input 
              type="text" 
              value={accessCode}
              onChange={(e) => setAccessCode(e.target.value.toUpperCase())}
              placeholder="e.g. X7B-9Q2"
              maxLength={7}
              className="w-full bg-[#0A0C10] border border-white/10 focus:border-brand-green focus:ring-1 focus:ring-brand-green rounded-xl px-5 py-4 text-white text-2xl font-black tracking-[0.2em] placeholder:text-gray-600 transition-all outline-none text-center"
            />
          </div>

          <button 
            disabled={accessCode.length < 6}
            className={`w-full flex items-center justify-center gap-2 py-4 rounded-xl font-bold text-lg transition-all ${
              accessCode.length >= 6 
                ? 'bg-brand-green hover:bg-emerald-500 text-[#0D0F14] shadow-lg shadow-brand-green/25' 
                : 'bg-white/5 text-gray-500 cursor-not-allowed'
            }`}
          >
            Enter Arena
            <ArrowRight size={20} />
          </button>
        </div>
      </motion.div>

    </div>
  );
}
