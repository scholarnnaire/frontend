import { motion } from 'framer-motion';
import { ArrowRight, Trophy, Users, ShieldAlert } from 'lucide-react';
import { Link } from 'react-router-dom';

export function LandingPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-gray-900 w-full">
      <nav className="p-6 flex justify-between items-center max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-brand-green rounded-xl flex items-center justify-center text-white font-bold text-xl">
            M
          </div>
          <span className="font-bold text-xl tracking-tight">Millionaires on Wheels</span>
        </div>
        <div className="hidden md:flex gap-8 items-center font-medium">
          <Link to="/register" className="text-gray-600 hover:text-gray-900">Register</Link>
          <Link to="/ladder" className="text-gray-600 hover:text-gray-900">Leaderboard</Link>
          <Link to="/login" className="px-5 py-2.5 bg-brand-dark text-white rounded-full hover:bg-gray-800 transition-colors">Team Login</Link>
        </div>
      </nav>

      <main className="flex-1 flex flex-col items-center justify-center text-center px-4 max-w-5xl mx-auto mt-12 md:mt-0">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-green/10 text-brand-green font-medium text-sm mb-8"
        >
          <span className="w-2 h-2 rounded-full bg-brand-green animate-pulse"></span>
          Live National Quiz Tournament
        </motion.div>
        
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-5xl md:text-7xl font-bold tracking-tight text-brand-dark mb-6 leading-tight"
        >
          The Ultimate Academic <br className="hidden md:block"/> 
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-green to-emerald-400">Battleground</span>
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-xl text-gray-500 mb-10 max-w-2xl mx-auto"
        >
          Compete with top schools nationwide in real-time. Test your knowledge, climb the ranks, and secure the ultimate prize.
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Link to="/register" className="px-8 py-4 bg-brand-green text-white font-medium rounded-full hover:bg-green-500 transition-colors flex items-center justify-center gap-2 text-lg shadow-lg shadow-green-500/20">
            Register School <ArrowRight size={20} />
          </Link>
          <Link to="/contestant" className="px-8 py-4 bg-white text-brand-dark font-medium rounded-full hover:bg-gray-50 transition-colors border border-gray-200 flex items-center justify-center gap-2 text-lg">
            Enter Arena
          </Link>
        </motion.div>

        {/* Portals Grid */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-24 w-full"
        >
          <div className="p-6 bg-white rounded-2xl border border-gray-100 shadow-sm text-left group hover:border-brand-green/50 transition-colors">
            <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Users size={24} />
            </div>
            <h3 className="font-bold text-lg mb-2">Team Portal</h3>
            <p className="text-gray-500 text-sm mb-4">Manage your school team, view analytics, and track performance.</p>
            <Link to="/login" className="text-blue-500 font-medium text-sm flex items-center gap-1 hover:gap-2 transition-all">Go to Dashboard <ArrowRight size={16} /></Link>
          </div>

          <div className="p-6 bg-white rounded-2xl border border-gray-100 shadow-sm text-left group hover:border-brand-green/50 transition-colors">
            <div className="w-12 h-12 bg-purple-50 text-purple-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <ShieldAlert size={24} />
            </div>
            <h3 className="font-bold text-lg mb-2">Admin Console</h3>
            <p className="text-gray-500 text-sm mb-4">Global system overview, question bank management, and game control.</p>
            <Link to="/admin" className="text-purple-500 font-medium text-sm flex items-center gap-1 hover:gap-2 transition-all">Access Console <ArrowRight size={16} /></Link>
          </div>

          <div className="p-6 bg-white rounded-2xl border border-gray-100 shadow-sm text-left group hover:border-brand-green/50 transition-colors">
            <div className="w-12 h-12 bg-orange-50 text-orange-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Trophy size={24} />
            </div>
            <h3 className="font-bold text-lg mb-2">Moderator View</h3>
            <p className="text-gray-500 text-sm mb-4">Live game moderation, answer verification, and score adjustments.</p>
            <Link to="/moderator" className="text-orange-500 font-medium text-sm flex items-center gap-1 hover:gap-2 transition-all">Launch Moderator <ArrowRight size={16} /></Link>
          </div>
        </motion.div>
      </main>
      
      <footer className="mt-20 py-8 border-t border-gray-200 text-center text-gray-500 text-sm">
        <p>&copy; 2026 Millionaires on Wheels. All rights reserved.</p>
      </footer>
    </div>
  );
}
