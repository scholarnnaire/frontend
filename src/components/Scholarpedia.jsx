import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, BookOpen } from 'lucide-react';
import axios from 'axios';

export function Scholarpedia({ isOpen, onClose, onTimeUp }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState([]);
  const [timeLeft, setTimeLeft] = useState(60);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let timerId;
    if (isOpen) {
      setTimeLeft(60);
      setSearchTerm('');
      setResults([]);
      timerId = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerId);
            onTimeUp();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timerId);
  }, [isOpen, onTimeUp]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchTerm.length >= 3) {
        setIsLoading(true);
        // Using relative path, assumes Vite proxy or full URL configured
        const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
        axios.get(`${baseUrl}/api/scholarpedia/search?q=${searchTerm}`)
          .then(res => setResults(res.data))
          .catch(err => console.error(err))
          .finally(() => setIsLoading(false));
      } else {
        setResults([]);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
      >
        <motion.div 
          initial={{ scale: 0.9, y: 50 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 50 }}
          className="bg-gray-900 border border-gray-700 w-full max-w-4xl rounded-3xl shadow-2xl flex flex-col h-[80vh] overflow-hidden relative"
        >
          {/* Header */}
          <div className="bg-blue-900 text-white p-6 flex justify-between items-center border-b border-blue-700">
            <div className="flex items-center gap-3">
              <BookOpen size={32} className="text-blue-300" />
              <h2 className="text-3xl font-bold tracking-wider uppercase">Scholarpedia</h2>
            </div>
            
            <div className="flex items-center gap-6">
              <div className={`text-2xl font-black bg-black/30 px-6 py-2 rounded-full border ${timeLeft <= 10 ? 'border-red-500 text-red-500 animate-pulse' : 'border-blue-500 text-blue-300'}`}>
                {timeLeft}s
              </div>
              <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full transition-colors">
                <X size={28} />
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="p-6 bg-gray-800">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={24} />
              <input 
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search the archives... (e.g., 'Photosynthesis', 'World War II')"
                className="w-full bg-gray-950 border-2 border-gray-700 text-white text-xl p-4 pl-14 rounded-xl focus:outline-none focus:border-blue-500 transition-colors"
                autoFocus
              />
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto p-6 bg-gray-900">
            {isLoading ? (
              <div className="flex justify-center items-center h-full">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : results.length > 0 ? (
              <div className="space-y-6">
                {results.map((article) => (
                  <div key={article.id} className="bg-gray-800 border border-gray-700 p-6 rounded-2xl">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-2xl font-bold text-blue-400">{article.title}</h3>
                      <span className="text-xs uppercase bg-gray-700 px-3 py-1 rounded-full text-gray-300 font-bold">{article.subject}</span>
                    </div>
                    <p className="text-gray-300 text-lg leading-relaxed">{article.content}</p>
                  </div>
                ))}
              </div>
            ) : searchTerm.length >= 3 ? (
              <div className="flex flex-col justify-center items-center h-full text-gray-500">
                <Search size={64} className="mb-4 opacity-50" />
                <p className="text-xl">No articles found matching "{searchTerm}"</p>
              </div>
            ) : (
              <div className="flex flex-col justify-center items-center h-full text-gray-600">
                <BookOpen size={80} className="mb-6 opacity-30" />
                <p className="text-2xl font-medium text-center max-w-md">
                  Welcome to the Scholarpedia Knowledge Base. Type at least 3 characters to begin your search.
                </p>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
