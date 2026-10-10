import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Book, Bookmark, Compass, Library, History } from 'lucide-react';

export function Scholarpedia() {
  const [searchQuery, setSearchQuery] = useState('');

  const categories = [
    { title: 'Nigerian History', icon: History, count: 142, color: 'text-orange-400', bg: 'bg-orange-400/10' },
    { title: 'World Geography', icon: Compass, count: 89, color: 'text-blue-400', bg: 'bg-blue-400/10' },
    { title: 'Basic Sciences', icon: Book, count: 324, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
    { title: 'Literature & Arts', icon: Library, count: 115, color: 'text-purple-400', bg: 'bg-purple-400/10' }
  ];

  return (
    <div className="max-w-6xl mx-auto w-full space-y-8">
      
      {/* Header & Search */}
      <div className="bg-[#13151A] border border-white/5 rounded-3xl p-6 md:p-10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-green/10 rounded-full blur-3xl"></div>
        
        <div className="relative z-10 max-w-3xl mx-auto text-center space-y-6">
          <h1 className="text-3xl md:text-5xl font-black text-white">Scholarpedia</h1>
          <p className="text-gray-400 text-lg">Your ultimate in-game knowledge base. Search for facts, historical dates, and scientific formulas.</p>
          
          <div className="relative mt-8">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500" size={24} />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search the knowledge base..."
              className="w-full bg-[#0A0C10] border border-white/10 focus:border-brand-green focus:ring-1 focus:ring-brand-green rounded-2xl py-5 pl-14 pr-6 text-white text-lg font-medium placeholder:text-gray-600 transition-all outline-none shadow-inner"
            />
          </div>
        </div>
      </div>

      {/* Categories */}
      <div>
        <h2 className="text-xl font-bold text-white mb-6">Browse by Category</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {categories.map((cat, index) => (
            <motion.div
              key={cat.title}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-[#13151A] border border-white/5 p-5 rounded-2xl hover:bg-white/5 hover:border-white/10 transition-colors cursor-pointer group flex items-start justify-between"
            >
              <div>
                <div className={`w-10 h-10 rounded-xl ${cat.bg} ${cat.color} flex items-center justify-center mb-4`}>
                  <cat.icon size={20} />
                </div>
                <h3 className="font-bold text-white text-sm mb-1">{cat.title}</h3>
                <p className="text-gray-500 text-xs font-semibold">{cat.count} Articles</p>
              </div>
              <Bookmark size={18} className="text-gray-600 group-hover:text-gray-400 transition-colors" />
            </motion.div>
          ))}
        </div>
      </div>

      {/* Recent Articles */}
      <div>
        <h2 className="text-xl font-bold text-white mb-6">Recently Updated</h2>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-[#13151A] border border-white/5 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-white/5 transition-colors cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="w-2 h-2 rounded-full bg-brand-green"></div>
                <div>
                  <h4 className="text-white font-bold text-sm">The Periodic Table of Elements: Group 1 Alkali Metals</h4>
                  <p className="text-gray-500 text-xs mt-1">Basic Sciences • Updated 2 days ago</p>
                </div>
              </div>
              <span className="text-xs font-bold text-brand-green bg-brand-green/10 px-3 py-1 rounded-full self-start sm:self-auto">
                Read Article
              </span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
