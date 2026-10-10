import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { 
  ArrowRight, Lock, AlertCircle, ArrowLeft, Eye, EyeOff, 
  Users, Crown, Shield, CheckCircle2, Sparkles, User, School 
} from 'lucide-react';
import api from '../../utils/api';

export function Login() {
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') === 'school' ? 'school' : 'member';
  
  // Tab: 'member' (Contestant / Captain) or 'school' (School Admin)
  const [activePortalTab, setActivePortalTab] = useState(initialTab);

  // Contestant / Member Login States
  const [participantId, setParticipantId] = useState('P001245');
  const [memberPin, setMemberPin] = useState('');
  const [memberLoading, setMemberLoading] = useState(false);
  const [memberError, setMemberError] = useState(null);

  // School Admin States
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const [viewState, setViewState] = useState('login'); // 'login', 'forgot', 'reset'
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [successMessage, setSuccessMessage] = useState(null);
  
  const navigate = useNavigate();

  // Handle Team Member / Captain Login
  const handleMemberLogin = async (e, quickId = null) => {
    if (e && e.preventDefault) e.preventDefault();
    const idToUse = (quickId || participantId).trim();
    if (!idToUse) {
      setMemberError("Please enter your Participant ID");
      return;
    }

    setMemberLoading(true);
    setMemberError(null);

    try {
      const response = await api.post('/competition/member-login', {
        participant_id: idToUse,
        pin: memberPin
      });

      const data = response.data;
      if (data.access_token) {
        localStorage.setItem('token', data.access_token);
        localStorage.setItem('user_role', data.role || (data.is_captain ? 'captain' : 'member'));
        localStorage.setItem('is_captain', String(Boolean(data.is_captain)));
        localStorage.setItem('participant_id', data.member?.participant_id || idToUse);
        localStorage.setItem('member_name', data.member?.name || '');
        localStorage.setItem('member_data', JSON.stringify(data.member));
        localStorage.setItem('team_data', JSON.stringify(data.team));

        navigate('/user/dashboard');
      }
    } catch (err) {
      setMemberError(err.response?.data?.detail || "Invalid Participant ID. Please verify your credentials.");
    } finally {
      setMemberLoading(false);
    }
  };

  // Handle School Admin Login
  const handleSchoolLogin = async (e) => {
    e.preventDefault();
    if (!identifier.trim() || !password) return;
    
    setLoading(true);
    setError(null);
    setSuccessMessage(null);
    
    try {
      const response = await api.post(`/user/login`, {
        identifier: identifier.trim(),
        password: password
      });
      
      const token = response.data.access_token;
      localStorage.setItem('token', token);
      localStorage.setItem('user_role', 'school');
      navigate(`/user/dashboard`);
    } catch (err) {
      if (err.response && err.response.status === 401) {
        setError('Invalid username or password.');
      } else {
        setError(err.response?.data?.detail || 'Failed to log in. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!identifier.trim()) {
      setError('Please enter your username or email.');
      return;
    }
    
    setLoading(true);
    setError(null);
    setSuccessMessage(null);
    
    try {
      await api.post(`/user/forgot-password`, {
        identifier: identifier.trim()
      });
      setSuccessMessage('Password reset token sent to your email.');
      setViewState('reset');
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to request password reset. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!resetToken.trim() || !newPassword) return;
    
    setLoading(true);
    setError(null);
    setSuccessMessage(null);
    
    try {
      await api.post(`/user/reset-password`, {
        token: resetToken.trim(),
        new_password: newPassword
      });
      setSuccessMessage('Password reset successfully! You can now log in.');
      setViewState('login');
      setPassword('');
      setResetToken('');
      setNewPassword('');
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to reset password. Token may be invalid or expired.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070B14] flex flex-col font-sans text-gray-100 w-full relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-0 right-1/4 w-[35rem] h-[35rem] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-0 left-1/4 w-[35rem] h-[35rem] bg-amber-500/10 rounded-full blur-[120px] pointer-events-none"></div>
      
      {/* Navigation Header */}
      <nav className="p-6 flex justify-between items-center max-w-7xl mx-auto w-full relative z-10 border-b border-gray-800/60">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-amber-600 rounded-xl flex items-center justify-center text-gray-950 font-black text-lg shadow-lg shadow-amber-500/20">
            🏆
          </div>
          <div>
            <div className="font-extrabold text-lg tracking-tight text-white flex items-center gap-2">
              <span>Global Quiz Challenge</span>
            </div>
            <p className="text-[10px] text-gray-400 tracking-wider uppercase font-semibold">Think • Learn • Win</p>
          </div>
        </Link>
        <Link to="/" className="text-gray-400 hover:text-white flex items-center gap-2 text-sm font-medium transition-colors">
          <ArrowLeft size={16} /> Back to Home
        </Link>
      </nav>

      {/* Main Container */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-8 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md"
        >
          {/* Portal Selector Tabs */}
          <div className="bg-[#111726]/90 border border-gray-800 p-1.5 rounded-2xl mb-6 flex gap-1 shadow-xl">
            <button
              onClick={() => {
                setActivePortalTab('member');
                setMemberError(null);
              }}
              className={`flex-1 py-3 px-3 rounded-xl font-bold text-xs transition flex items-center justify-center gap-2 ${
                activePortalTab === 'member'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 font-extrabold'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Users size={16} />
              <span>Contestant & Captain</span>
            </button>
            <button
              onClick={() => {
                setActivePortalTab('school');
                setError(null);
              }}
              className={`flex-1 py-3 px-3 rounded-xl font-bold text-xs transition flex items-center justify-center gap-2 ${
                activePortalTab === 'school'
                  ? 'bg-[#1C253B] text-white border border-gray-700 shadow-md font-extrabold'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <School size={16} />
              <span>School Admin</span>
            </button>
          </div>

          <div className="bg-[#0F1626]/95 backdrop-blur-2xl border border-gray-800/80 p-8 rounded-3xl shadow-2xl relative overflow-hidden">
            
            {/* ── TAB 1: CONTESTANT & CAPTAIN LOGIN ── */}
            {activePortalTab === 'member' && (
              <div>
                <div className="text-center mb-6">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/15 border border-blue-500/30 text-blue-400 text-[11px] font-bold tracking-wide uppercase mb-3">
                    <Sparkles size={13} className="text-blue-400" />
                    <span>Contestant Portal</span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Team Member Login</h1>
                  <p className="text-gray-400 text-xs mt-1.5 leading-relaxed">
                    Log in with your assigned Participant ID to access your Member or Captain dashboard.
                  </p>
                </div>

                {/* Quick 1-Click Demo Buttons */}
                <div className="mb-6 bg-[#162035]/80 border border-gray-700/60 p-3 rounded-2xl">
                  <div className="text-[11px] font-bold text-gray-300 uppercase tracking-wider mb-2 flex items-center justify-between">
                    <span>⚡ Quick Test Logins:</span>
                    <span className="text-[10px] text-amber-400">1-Click Access</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setParticipantId('P000987');
                        handleMemberLogin(null, 'P000987');
                      }}
                      className="p-2.5 bg-gradient-to-r from-amber-500/20 to-amber-600/10 hover:from-amber-500/30 hover:to-amber-600/20 border border-amber-500/40 rounded-xl text-left transition flex items-center gap-2 group"
                    >
                      <span className="text-base">👑</span>
                      <div className="truncate">
                        <div className="text-xs font-bold text-white group-hover:text-amber-300 truncate">Sarah Johnson</div>
                        <div className="text-[10px] text-amber-400 font-mono">Captain (P000987)</div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setParticipantId('P001245');
                        handleMemberLogin(null, 'P001245');
                      }}
                      className="p-2.5 bg-gradient-to-r from-blue-600/20 to-blue-700/10 hover:from-blue-600/30 hover:to-blue-700/20 border border-blue-500/40 rounded-xl text-left transition flex items-center gap-2 group"
                    >
                      <span className="text-base">👤</span>
                      <div className="truncate">
                        <div className="text-xs font-bold text-white group-hover:text-blue-300 truncate">Daniel Okafor</div>
                        <div className="text-[10px] text-blue-400 font-mono">Member (P001245)</div>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Participant ID Login Form */}
                <form onSubmit={(e) => handleMemberLogin(e)} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                      Participant ID
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-500">
                        <User size={18} />
                      </div>
                      <input 
                        type="text" 
                        value={participantId}
                        onChange={(e) => setParticipantId(e.target.value.toUpperCase())}
                        placeholder="e.g. P001245 or P000987"
                        className="w-full bg-[#0A0F1D] border border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl pl-10 pr-4 py-3.5 text-white font-mono text-base tracking-wider transition outline-none uppercase placeholder:text-gray-600"
                        required
                      />
                    </div>
                    <p className="text-[11px] text-gray-500 mt-1">
                      Case-insensitive. Both Captain and Member IDs are verified automatically.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                      Access Passcode / PIN <span className="text-gray-500 font-normal lowercase">(optional)</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-500">
                        <Lock size={18} />
                      </div>
                      <input 
                        type="password" 
                        value={memberPin}
                        onChange={(e) => setMemberPin(e.target.value)}
                        placeholder="Optional PIN"
                        className="w-full bg-[#0A0F1D] border border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl pl-10 pr-4 py-3 text-white text-sm transition outline-none placeholder:text-gray-600"
                      />
                    </div>
                  </div>

                  {memberError && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 flex items-start gap-2.5 text-xs text-red-400"
                    >
                      <AlertCircle size={16} className="shrink-0 mt-0.5" />
                      <span>{memberError}</span>
                    </motion.div>
                  )}

                  <button 
                    type="submit" 
                    disabled={memberLoading || !participantId.trim()}
                    className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 text-white rounded-xl font-extrabold flex items-center justify-center gap-2 transition shadow-lg shadow-blue-600/30 active:scale-98 mt-2"
                  >
                    {memberLoading ? (
                      <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                    ) : (
                      <>
                        <span>ENTER CONTESTANT PORTAL</span>
                        <ArrowRight size={18} />
                      </>
                    )}
                  </button>
                </form>

                <div className="mt-6 pt-5 border-t border-gray-800/80 text-center text-xs text-gray-500">
                  New participant or haven't registered?{' '}
                  <Link to="/register" className="text-blue-400 hover:text-blue-300 font-bold transition">
                    Register with your team
                  </Link>
                </div>
              </div>
            )}

            {/* ── TAB 2: SCHOOL ADMIN LOGIN ── */}
            {activePortalTab === 'school' && (
              <div>
                <div className="text-center mb-6">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[11px] font-bold tracking-wide uppercase mb-3">
                    <School size={13} className="text-emerald-400" />
                    <span>School Administration</span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">School Admin Login</h1>
                  <p className="text-gray-400 text-xs mt-1.5">Log in with your School Admin credentials to manage your team roster and entries.</p>
                </div>

                {successMessage && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 flex items-start gap-2.5 mb-4 text-xs text-emerald-400"
                  >
                    <CheckCircle2 size={16} className="shrink-0 mt-0.5" />
                    <p>{successMessage}</p>
                  </motion.div>
                )}

                {viewState === 'login' && (
                  <form onSubmit={handleSchoolLogin} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Admin Username or Email</label>
                      <input 
                        type="text" 
                        value={identifier}
                        onChange={(e) => setIdentifier(e.target.value)}
                        placeholder="e.g. admin_kingscollege"
                        className="w-full bg-[#0A0F1D] border border-gray-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl px-4 py-3 text-white text-sm transition outline-none"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Password</label>
                      <div className="relative">
                        <input 
                          type={showPassword ? "text" : "password"} 
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full bg-[#0A0F1D] border border-gray-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl px-4 py-3 pr-10 text-white text-sm transition outline-none"
                          required
                        />
                        <button 
                          type="button" 
                          onClick={() => setShowPassword(!showPassword)} 
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-emerald-400"
                        >
                          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                      <div className="text-right mt-1.5">
                        <button type="button" onClick={() => { setViewState('forgot'); setError(null); }} className="text-xs text-emerald-400 hover:underline">
                          Forgot Password?
                        </button>
                      </div>
                    </div>

                    {error && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 flex items-start gap-2.5 text-xs text-red-400"
                      >
                        <AlertCircle size={16} className="shrink-0 mt-0.5" />
                        <span>{error}</span>
                      </motion.div>
                    )}

                    <button 
                      type="submit" 
                      disabled={loading || !identifier || !password}
                      className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl font-black flex items-center justify-center gap-2 transition shadow-lg shadow-emerald-600/30 mt-2"
                    >
                      {loading ? (
                        <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                      ) : (
                        <>
                          <span>ACCESS ADMIN DASHBOARD</span>
                          <ArrowRight size={18} />
                        </>
                      )}
                    </button>
                  </form>
                )}

                {viewState === 'forgot' && (
                  <form onSubmit={handleForgotPassword} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Username or Email</label>
                      <input 
                        type="text" 
                        value={identifier}
                        onChange={(e) => setIdentifier(e.target.value)}
                        placeholder="admin_kingscollege"
                        className="w-full bg-[#0A0F1D] border border-gray-700 rounded-xl px-4 py-3 text-white text-sm outline-none"
                        required
                      />
                    </div>
                    {error && <div className="text-xs text-red-400">{error}</div>}
                    <button 
                      type="submit" 
                      disabled={loading || !identifier}
                      className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold"
                    >
                      Send Reset Token
                    </button>
                    <button 
                      type="button" 
                      onClick={() => setViewState('login')} 
                      className="w-full text-center text-xs text-gray-400 hover:text-white mt-2"
                    >
                      Back to Login
                    </button>
                  </form>
                )}

                {viewState === 'reset' && (
                  <form onSubmit={handleResetPassword} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Reset Token</label>
                      <input 
                        type="text" 
                        value={resetToken}
                        onChange={(e) => setResetToken(e.target.value.toUpperCase())}
                        placeholder="ABCDEF"
                        maxLength={6}
                        className="w-full bg-[#0A0F1D] border border-gray-700 rounded-xl px-4 py-3 text-white text-sm text-center tracking-widest uppercase font-mono"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">New Password</label>
                      <input 
                        type="password" 
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-[#0A0F1D] border border-gray-700 rounded-xl px-4 py-3 text-white text-sm"
                        required
                      />
                    </div>
                    {error && <div className="text-xs text-red-400">{error}</div>}
                    <button 
                      type="submit" 
                      disabled={loading || !resetToken || !newPassword}
                      className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold"
                    >
                      Reset Password
                    </button>
                  </form>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </main>
    </div>
  );
}

export default Login;
