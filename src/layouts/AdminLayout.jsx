import { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Sun, Moon, Bell, Mail, ChevronDown, LogOut, User, Users,
  LayoutDashboard, Play, Target, Network, Book, Wallet, BarChart2, Menu, X,
  GraduationCap, BookOpen, Settings, ShieldAlert, DollarSign, Calendar, CreditCard
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function AdminLayout() {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      navigate('/admin/login');
    }
  }, [navigate]);

  const superAdminName = "System Admin";
  const roleTitle = "Super Admin";

  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: `/admin` },
    { name: 'Live Competition Control', icon: ShieldAlert, path: `/admin/arena`, badge: 'LIVE' },
    { name: 'School Management', icon: GraduationCap, path: `/admin/schools` },
    { name: 'Team Management', icon: Users, path: `/admin/teams` },
    { name: 'Tournament Tracks', icon: Target, path: `/admin/tournaments` },
    { name: 'Question Bank', icon: BookOpen, path: `/admin/questions` },
    { name: 'Match & Events', icon: Calendar, path: `/admin/events` },
    { name: 'Financials', icon: DollarSign, path: `/admin/financials` },
    { name: 'Transactions', icon: CreditCard, path: `/admin/transactions` },
    { name: 'Settings', icon: Settings, path: `/admin/settings` }
  ];

  return (
    <div className={`h-screen flex flex-col overflow-hidden ${isDarkMode ? 'bg-[#0A0C10] text-gray-100' : 'bg-gray-50 text-gray-900'} font-sans transition-colors duration-300 selection:bg-brand-green/30`}>
      {/* HEADER */}
      <header className={`${isDarkMode ? 'bg-[#0D0F14] border-white/5' : 'bg-white border-gray-200 shadow-sm'} border-b py-3 px-4 md:px-6 flex justify-between items-center z-50 transition-colors duration-300 shrink-0`}>
        {/* Left side */}
        <div className="flex items-center gap-3">
          <button 
            className={`md:hidden p-2 rounded-lg ${isDarkMode ? 'hover:bg-white/10' : 'hover:bg-gray-100'}`}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-600 to-orange-500 flex items-center justify-center shadow-lg shadow-red-500/20">
            <span className="font-black text-white text-sm">A</span>
          </div>
          <h1 className={`text-xl font-bold bg-gradient-to-r ${isDarkMode ? 'from-white to-gray-400' : 'from-gray-900 to-gray-600'} bg-clip-text text-transparent tracking-tight transition-colors duration-300 hidden sm:block`}>
            Scholarnaire <span className="text-red-500 text-sm font-black tracking-widest ml-1">ADMIN</span>
          </h1>
        </div>

        {/* Right side */}
        <div className="flex gap-2 md:gap-6 items-center">
          {/* Action Icons */}
          <div className={`flex items-center gap-1 md:gap-2 pr-3 md:pr-6 border-r ${isDarkMode ? 'border-white/10' : 'border-gray-200'}`}>
            <button 
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`p-2 rounded-full ${isDarkMode ? 'hover:bg-white/10 text-gray-400 hover:text-white' : 'hover:bg-gray-100 text-gray-500 hover:text-gray-900'} transition-colors`}
              title="Toggle Dark Mode"
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button className={`p-2 rounded-full ${isDarkMode ? 'hover:bg-white/10 text-gray-400 hover:text-white' : 'hover:bg-gray-100 text-gray-500 hover:text-gray-900'} transition-colors relative`} title="Notifications">
              <Bell size={20} />
              <span className={`absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 ${isDarkMode ? 'border-[#0D0F14]' : 'border-white'}`}></span>
            </button>
          </div>

          {/* Profile Section */}
          <div className="relative">
            <button 
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center gap-2 md:gap-3 focus:outline-none group text-left"
            >
              <div className="hidden lg:flex flex-col items-end">
                <span className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{superAdminName}</span>
                <span className={`text-xs font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{roleTitle}</span>
              </div>
              <div className={`w-9 h-9 md:w-10 md:h-10 rounded-full bg-gradient-to-br ${isDarkMode ? 'from-[#1A1C23] to-[#13151A] border-white/10' : 'from-gray-100 to-white border-gray-200'} border text-red-500 flex items-center justify-center font-bold shadow-sm group-hover:border-red-500/50 transition-colors`}>
                SA
              </div>
              <ChevronDown size={16} className={`${isDarkMode ? 'text-gray-400 group-hover:text-white' : 'text-gray-500 group-hover:text-gray-900'} transition-colors hidden sm:block`} />
            </button>

            {/* Dropdown Menu */}
            <AnimatePresence>
              {isProfileOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.15, ease: "easeOut" }}
                  className={`absolute right-0 mt-3 w-56 rounded-2xl shadow-xl border ${isDarkMode ? 'bg-[#1A1C23] border-white/10 shadow-black/50' : 'bg-white border-gray-200 shadow-gray-200/50'} overflow-hidden py-1 z-50`}
                >
                  <div className={`lg:hidden px-4 py-3 border-b ${isDarkMode ? 'border-white/5' : 'border-gray-100'}`}>
                    <div className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{superAdminName}</div>
                    <div className={`text-xs font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{roleTitle}</div>
                  </div>
                  <Link to="/admin/settings" onClick={() => setIsProfileOpen(false)} className={`flex items-center gap-3 px-4 py-3 text-sm font-medium ${isDarkMode ? 'text-gray-300 hover:bg-white/5 hover:text-white' : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'} transition-colors`}>
                    <Settings size={18} /> System Settings
                  </Link>
                  <div className={`h-px w-full my-1 ${isDarkMode ? 'bg-white/5' : 'bg-gray-100'}`}></div>
                  <button onClick={() => {
                    localStorage.removeItem('admin_token');
                    navigate('/admin/login');
                  }} className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-red-500 ${isDarkMode ? 'hover:bg-red-500/10' : 'hover:bg-red-50'} transition-colors`}>
                    <LogOut size={18} /> Sign Out
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>

      {/* BODY (Sidebar + Main Content) */}
      <div className="flex flex-1 overflow-hidden relative">
        
        {/* SIDEBAR */}
        <aside className={`
          absolute md:static inset-y-0 left-0 z-40
          w-64 transform transition-transform duration-300 ease-in-out
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          ${isDarkMode ? 'bg-[#0D0F14] border-white/5' : 'bg-white border-gray-200'}
          border-r flex flex-col py-6
        `}>
          <div className="px-6 mb-6">
            <h3 className={`text-xs font-bold uppercase tracking-widest ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>Admin Controls</h3>
          </div>
          
          <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
            {menuItems.map((item) => {
              // Exact match for dashboard, includes for others
              const isActive = item.path === '/admin' 
                ? location.pathname === '/admin'
                : location.pathname.startsWith(item.path);
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200
                    ${isActive 
                      ? (isDarkMode ? 'bg-red-500/10 text-red-500' : 'bg-red-500/10 text-red-700')
                      : (isDarkMode ? 'text-gray-400 hover:text-white hover:bg-white/5' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50')
                    }
                  `}
                >
                  <Icon size={20} className={isActive ? (isDarkMode ? 'text-red-500' : 'text-red-600') : ''} />
                  <span className="flex-1 text-sm font-medium">{item.name}</span>
                  {item.badge && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black tracking-wider uppercase bg-red-500/20 text-red-400 border border-red-500/30 flex items-center gap-1.5 shadow-[0_0_10px_rgba(239,68,68,0.3)]">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
          
          <div className={`px-6 pt-6 mt-6 border-t ${isDarkMode ? 'border-white/5' : 'border-gray-100'}`}>
            <div className={`p-4 rounded-xl ${isDarkMode ? 'bg-gradient-to-br from-[#1A1C23] to-[#13151A] border border-white/5' : 'bg-gray-50 border border-gray-200'} flex flex-col gap-2 items-center justify-center text-center`}>
              <ShieldAlert size={24} className="text-red-500 mb-1" />
              <p className={`text-xs font-bold ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>System Status</p>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                <span className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>All Systems Go</span>
              </div>
            </div>
          </div>
        </aside>

        {/* OVERLAY for mobile sidebar */}
        {isMobileMenuOpen && (
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm z-30 md:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}

        {/* MAIN CONTENT AREA */}
        <main className="flex-1 overflow-y-auto w-full p-4 sm:p-6 md:p-8 flex flex-col">
          <Outlet context={{ isDarkMode }} />
        </main>
      </div>
    </div>
  );
}
