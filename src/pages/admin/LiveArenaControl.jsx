import React, { useState, useEffect, useRef } from 'react';
import { useOutletContext } from 'react-router-dom';
import { 
  Play, 
  Pause, 
  Snowflake, 
  HelpCircle, 
  Users, 
  UserCheck, 
  CheckCircle2, 
  History, 
  RotateCcw, 
  Radio, 
  AlertCircle, 
  X, 
  Sparkles, 
  Flame, 
  RefreshCw,
  Award,
  ChevronRight,
  ShieldAlert,
  ArrowRightLeft
} from 'lucide-react';
import api from '../../utils/api';

export function LiveArenaControl() {
  const { isDarkMode } = useOutletContext();
  const [liveMatches, setLiveMatches] = useState([]);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [consoleData, setConsoleData] = useState(null);
  const [secondsRemaining, setSecondsRemaining] = useState(7);
  const [actionLoading, setActionLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // Modals state
  const [isSubModalOpen, setIsSubModalOpen] = useState(false);
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [matchLogs, setMatchLogs] = useState([]);
  
  // Substitution Form
  const [subTeam, setSubTeam] = useState('');
  const [outgoingPlayer, setOutgoingPlayer] = useState('');
  const [incomingPlayer, setIncomingPlayer] = useState('');
  const [subReason, setSubReason] = useState('Tactical substitution');

  // Trigger temporary toast
  const showToast = (msg, type = 'info') => {
    setToastMessage({ text: msg, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Fetch all active live matches
  const fetchLiveMatches = async () => {
    try {
      const response = await api.get('/admin/matches/live');
      setLiveMatches(response.data || []);
      if (!selectedMatch && response.data && response.data.length > 0) {
        setSelectedMatch(response.data[0]);
      }
    } catch (error) {
      console.error("Failed to fetch live matches", error);
    }
  };

  // Fetch full live console state for selected match
  const fetchConsoleState = async (matchId) => {
    if (!matchId) return;
    try {
      const res = await api.get(`/arena/matches/${matchId}/live-console`);
      setConsoleData(res.data);
      if (res.data?.state?.time_left !== undefined) {
        setSecondsRemaining(res.data.state.time_left);
      }
      if (res.data?.state?.game_logs) {
        setMatchLogs(res.data.state.game_logs);
      }
      // Preset substitution defaults if empty
      if (res.data?.participants && res.data.participants.length > 0 && !subTeam) {
        setSubTeam(res.data.participants[0].team_name);
      }
    } catch (err) {
      console.error("Failed to fetch console state", err);
    }
  };

  useEffect(() => {
    fetchLiveMatches();
    const interval = setInterval(fetchLiveMatches, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (selectedMatch?.id) {
      fetchConsoleState(selectedMatch.id);
      const timer = setInterval(() => {
        fetchConsoleState(selectedMatch.id);
      }, 1800);
      return () => clearInterval(timer);
    }
  }, [selectedMatch?.id]);

  // Local ticker countdown
  useEffect(() => {
    const isRunning = consoleData?.state?.game_status === 'RUNNING' && 
                      !consoleData?.state?.timers_frozen && 
                      !consoleData?.state?.is_paused;

    if (!isRunning || secondsRemaining <= 0) return;

    const tick = setInterval(() => {
      setSecondsRemaining(prev => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(tick);
  }, [consoleData?.state?.game_status, consoleData?.state?.timers_frozen, consoleData?.state?.is_paused, secondsRemaining]);

  // Handle Pause
  const handlePause = async () => {
    if (!selectedMatch) return;
    setActionLoading(true);
    try {
      await api.post(`/arena/matches/${selectedMatch.id}/pause`, {
        reason: "Administrative pause"
      });
      showToast("Game Paused: Timers stopped", "warning");
      await fetchConsoleState(selectedMatch.id);
    } catch (err) {
      showToast("Failed to pause game", "error");
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Resume
  const handleResume = async () => {
    if (!selectedMatch) return;
    setActionLoading(true);
    try {
      await api.post(`/arena/matches/${selectedMatch.id}/resume`);
      showToast("Game Resumed: Competition live!", "success");
      await fetchConsoleState(selectedMatch.id);
    } catch (err) {
      showToast("Failed to resume game", "error");
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Freeze Timers
  const handleFreezeTimers = async () => {
    if (!selectedMatch) return;
    setActionLoading(true);
    try {
      const res = await api.post(`/arena/matches/${selectedMatch.id}/freeze-timers`);
      const isFrozen = res.data?.timers_frozen;
      showToast(isFrozen ? "Timers Frozen" : "Timers Unfrozen", "info");
      await fetchConsoleState(selectedMatch.id);
    } catch (err) {
      showToast("Failed to toggle timer freeze", "error");
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Freeze Questions
  const handleFreezeQuestions = async () => {
    if (!selectedMatch) return;
    setActionLoading(true);
    try {
      const res = await api.post(`/arena/matches/${selectedMatch.id}/freeze-questions`);
      const isFrozen = res.data?.questions_frozen;
      showToast(isFrozen ? "Questions Frozen: Buzzers disabled" : "Questions Unfrozen", "info");
      await fetchConsoleState(selectedMatch.id);
    } catch (err) {
      showToast("Failed to toggle questions freeze", "error");
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Activate Substitution
  const handleActivateSubstitution = async () => {
    if (!selectedMatch) return;
    setActionLoading(true);
    try {
      await api.post(`/arena/matches/${selectedMatch.id}/substitution/activate`);
      showToast("Substitution Activated on Stage", "success");
      await fetchConsoleState(selectedMatch.id);
    } catch (err) {
      showToast("Failed to activate substitution", "error");
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Confirm Substitution Completion
  const handleConfirmCompletion = async () => {
    if (!selectedMatch) return;
    setActionLoading(true);
    try {
      await api.post(`/arena/matches/${selectedMatch.id}/substitution/confirm`);
      showToast("Substitution Confirmed Completed", "success");
      await fetchConsoleState(selectedMatch.id);
    } catch (err) {
      showToast("Failed to confirm completion", "error");
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Submit Substitution Request
  const handleSubmitSubRequest = async (e) => {
    e.preventDefault();
    if (!selectedMatch) return;
    setActionLoading(true);
    try {
      await api.post(`/arena/matches/${selectedMatch.id}/substitution/request`, {
        team_name: subTeam,
        outgoing_player: outgoingPlayer || "Contestant A",
        incoming_player: incomingPlayer || "Contestant Sub",
        reason: subReason
      });
      showToast("Substitution Request Registered", "success");
      setIsSubModalOpen(false);
      await fetchConsoleState(selectedMatch.id);
    } catch (err) {
      showToast("Failed to request substitution", "error");
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Start Question / Arena
  const handleStartArena = async () => {
    if (!selectedMatch) return;
    setActionLoading(true);
    try {
      await api.post(`/arena/matches/${selectedMatch.id}/start-arena`);
      showToast("Next Question Broadcasted!", "success");
      await fetchConsoleState(selectedMatch.id);
    } catch (err) {
      showToast("Failed to start arena question", "error");
    } finally {
      setActionLoading(false);
    }
  };

  // Format digital time MM:SS
  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  // Helper for status badge presentation
  const getStatusBadge = () => {
    const status = consoleData?.state?.game_status || 'WAITING';
    switch (status) {
      case 'RUNNING':
        return {
          label: 'RUNNING',
          color: 'text-emerald-400',
          ring: 'border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]',
          dot: 'bg-emerald-400'
        };
      case 'PAUSED':
        return {
          label: 'PAUSED',
          color: 'text-rose-500',
          ring: 'border-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.5)]',
          dot: 'bg-rose-500'
        };
      case 'TIMERS FROZEN':
        return {
          label: 'TIMERS FROZEN',
          color: 'text-cyan-400',
          ring: 'border-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.5)]',
          dot: 'bg-cyan-400'
        };
      case 'QUESTIONS FROZEN':
        return {
          label: 'QUESTIONS FROZEN',
          color: 'text-blue-400',
          ring: 'border-blue-400 shadow-[0_0_15px_rgba(96,165,250,0.5)]',
          dot: 'bg-blue-400'
        };
      case 'COMPLETED':
        return {
          label: 'COMPLETED',
          color: 'text-purple-400',
          ring: 'border-purple-400 shadow-[0_0_15px_rgba(192,132,252,0.5)]',
          dot: 'bg-purple-400'
        };
      default:
        return {
          label: 'WAITING',
          color: 'text-amber-400',
          ring: 'border-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.5)]',
          dot: 'bg-amber-400'
        };
    }
  };

  const statusBadge = getStatusBadge();
  const currentQIndex = (consoleData?.state?.current_question_index ?? 0) + 1;
  const totalQ = consoleData?.state?.total_questions || 44;

  // Selected team members for substitution modal
  const selectedTeamData = consoleData?.participants?.find(p => p.team_name === subTeam);

  return (
    <div className={`flex flex-col h-full rounded-2xl border shadow-2xl overflow-hidden ${isDarkMode ? 'bg-[#0B0D13] border-white/10' : 'bg-slate-900 border-slate-700'}`}>
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-xl border backdrop-blur-md shadow-2xl flex items-center gap-3 animate-fade-in ${
          toastMessage.type === 'error' ? 'bg-red-950/90 border-red-500/50 text-red-200' :
          toastMessage.type === 'warning' ? 'bg-amber-950/90 border-amber-500/50 text-amber-200' :
          toastMessage.type === 'success' ? 'bg-emerald-950/90 border-emerald-500/50 text-emerald-200' :
          'bg-blue-950/90 border-blue-500/50 text-blue-200'
        }`}>
          <div className="w-2.5 h-2.5 rounded-full animate-ping bg-current" />
          <span className="text-sm font-bold tracking-wide">{toastMessage.text}</span>
        </div>
      )}

      {/* Top Bar for Arena View Navigation */}
      <div className="px-6 py-4 border-b border-white/10 bg-[#07090E] flex flex-wrap items-center justify-between gap-4 z-10">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 font-bold text-xs tracking-widest uppercase">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            Live Arena Director Console
          </div>
          {selectedMatch && (
            <span className="text-sm font-semibold text-gray-400">
              Active Match: <strong className="text-white">{selectedMatch.name}</strong>
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          {liveMatches.length > 1 && (
            <select
              value={selectedMatch?.id || ''}
              onChange={(e) => {
                const found = liveMatches.find(m => m.id === parseInt(e.target.value));
                if (found) setSelectedMatch(found);
              }}
              className="px-3 py-1.5 rounded-lg bg-white/10 border border-white/20 text-xs font-semibold text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              {liveMatches.map(m => (
                <option key={m.id} value={m.id} className="bg-slate-900 text-white">
                  {m.name} (#{m.id})
                </option>
              ))}
            </select>
          )}

          {consoleData?.state?.phase === 'waiting' && (
            <button
              onClick={handleStartArena}
              disabled={actionLoading}
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-black tracking-wider uppercase flex items-center gap-2 shadow-lg transition-all active:scale-95 cursor-pointer"
            >
              <Play size={14} fill="currentColor" />
              Start Match
            </button>
          )}

          <button
            onClick={() => selectedMatch && fetchConsoleState(selectedMatch.id)}
            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white transition-colors cursor-pointer"
            title="Refresh Console"
          >
            <RefreshCw size={15} className={actionLoading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Main Cockpit Display Frame */}
      <div className="flex-1 p-4 md:p-8 flex items-center justify-center overflow-auto bg-gradient-to-b from-[#0A0D14] via-[#080B12] to-[#04060A]">
        
        {/* Cockpit Shell with Beveled Styling */}
        <div className="w-full max-w-6xl rounded-3xl border-4 border-[#1E2330] bg-[#030611] shadow-[0_20px_60px_rgba(0,0,0,0.9),inset_0_1px_1px_rgba(255,255,255,0.15)] overflow-hidden flex flex-col relative">
          
          {/* Bezel Metallic Accent Line */}
          <div className="h-1.5 w-full bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent opacity-80" />

          {/* Screen Glass Interior */}
          <div className="p-6 md:p-8 bg-gradient-to-br from-[#060D20] via-[#050B1B] to-[#02050E] flex-1 flex flex-col justify-between relative">
            
            {/* Ambient Backlight Glows */}
            <div className="absolute top-0 left-1/4 w-96 h-48 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute top-10 right-1/4 w-96 h-48 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

            {/* SCREEN HEADER: SCHOLARNAIRE LIVE */}
            <div className="relative z-10 flex flex-col items-center justify-center pt-2 pb-6 border-b border-blue-500/15">
              <div className="flex items-center gap-2 mb-1">
                {/* Gold Cap Icon */}
                <div className="p-1 rounded-md bg-amber-400/10 text-[#F59E0B]">
                  <Award size={22} className="text-[#FFD700] drop-shadow-[0_0_8px_rgba(255,215,0,0.6)]" />
                </div>
              </div>
              <h1 className="text-2xl md:text-3xl font-black tracking-[0.25em] uppercase text-transparent bg-clip-text bg-gradient-to-b from-[#FFF2B2] via-[#FFD700] to-[#B38728] drop-shadow-[0_2px_10px_rgba(212,175,55,0.3)]">
                SCHOLARNAIRE
              </h1>
              <div className="text-sm md:text-base font-black tracking-[0.45em] uppercase text-[#FDE047] drop-shadow-[0_0_12px_rgba(253,224,71,0.5)] -mt-0.5">
                LIVE
              </div>

              {/* Status / Audio Badge in Corner */}
              <div className="absolute right-2 top-2 flex items-center gap-2 opacity-80">
                <span className="text-[10px] font-mono tracking-widest text-cyan-400/80 bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-500/20">
                  SYS.ONLINE
                </span>
                <Radio size={14} className="text-cyan-400 animate-pulse" />
              </div>
            </div>

            {/* MAIN DASHBOARD GRID */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 my-6 relative z-10">
              
              {/* LEFT CARD: LIVE GAME STATUS */}
              <div className="lg:col-span-3 flex flex-col justify-between rounded-2xl bg-[#091124]/90 border border-blue-500/20 p-5 shadow-[inset_0_2px_10px_rgba(0,0,0,0.6),0_8px_20px_rgba(0,0,0,0.5)] backdrop-blur-md">
                
                {/* 1. Live Game Status */}
                <div className="mb-5">
                  <div className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 mb-2">
                    LIVE GAME STATUS
                  </div>
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full border-2 ${statusBadge.ring} flex items-center justify-center bg-black/40`}>
                      <div className={`w-3.5 h-3.5 rounded-full ${statusBadge.dot} animate-pulse`} />
                    </div>
                    <span className={`text-xl font-black tracking-wider uppercase ${statusBadge.color} drop-shadow-[0_0_8px_currentColor]`}>
                      {statusBadge.label}
                    </span>
                  </div>
                </div>

                {/* 2. Current Stage */}
                <div className="mb-5">
                  <div className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 mb-1">
                    CURRENT STAGE
                  </div>
                  <div className="text-lg md:text-xl font-bold text-white tracking-wide">
                    {consoleData?.stage_name || 'Group Stage 2'}
                  </div>
                </div>

                {/* 3. Question */}
                <div className="mb-5">
                  <div className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 mb-1">
                    QUESTION
                  </div>
                  <div className="text-2xl md:text-3xl font-black text-white tracking-wider">
                    {currentQIndex} <span className="text-slate-500 text-xl font-medium">/</span> {totalQ}
                  </div>
                </div>

                {/* 4. Time Remaining */}
                <div>
                  <div className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 mb-1">
                    TIME REMAINING
                  </div>
                  <div className="font-mono text-3xl md:text-4xl font-black tracking-widest text-white tabular-nums drop-shadow-[0_0_12px_rgba(255,255,255,0.4)]">
                    {formatTime(secondsRemaining)}
                  </div>
                </div>

              </div>

              {/* MIDDLE COLUMN 1: GAME CONTROLS */}
              <div className="lg:col-span-3 flex flex-col justify-between">
                <div>
                  <div className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 mb-3 pl-1">
                    GAME CONTROLS
                  </div>
                  <div className="flex flex-col gap-3">
                    
                    {/* BUTTON 1: SUBSTITUTION REQUEST */}
                    <button
                      onClick={() => setIsSubModalOpen(true)}
                      disabled={actionLoading}
                      className="w-full py-3.5 px-4 rounded-xl font-bold text-xs md:text-sm text-white tracking-wider uppercase transition-all duration-200 flex items-center gap-3 bg-gradient-to-r from-[#1853D4] via-[#1D60E8] to-[#1E6BFA] hover:from-[#1E60E8] hover:to-[#2B79FF] border border-blue-400/40 shadow-[0_4px_15px_rgba(30,96,232,0.35)] active:scale-[0.98] cursor-pointer"
                    >
                      <div className="w-6 h-6 rounded-lg bg-white/15 flex items-center justify-center">
                        <ArrowRightLeft size={14} className="text-white" />
                      </div>
                      <span className="flex-1 text-left font-black">SUBSTITUTION REQUEST</span>
                    </button>

                    {/* BUTTON 2: PAUSE GAME */}
                    <button
                      onClick={handlePause}
                      disabled={actionLoading || consoleData?.state?.is_paused}
                      className="w-full py-3.5 px-4 rounded-xl font-bold text-xs md:text-sm text-white tracking-wider uppercase transition-all duration-200 flex items-center gap-3 bg-gradient-to-r from-[#D91B42] via-[#E11D48] to-[#F43F5E] hover:from-[#E11D48] hover:to-[#FB7185] border border-rose-400/50 shadow-[0_4px_18px_rgba(225,29,72,0.4)] active:scale-[0.98] cursor-pointer disabled:opacity-60"
                    >
                      <div className="w-6 h-6 rounded-lg bg-white/20 flex items-center justify-center">
                        <Pause size={14} fill="currentColor" className="text-white" />
                      </div>
                      <span className="flex-1 text-left font-black">PAUSE GAME</span>
                    </button>

                    {/* BUTTON 3: FREEZE TIMERS */}
                    <button
                      onClick={handleFreezeTimers}
                      disabled={actionLoading}
                      className={`w-full py-3.5 px-4 rounded-xl font-bold text-xs md:text-sm text-white tracking-wider uppercase transition-all duration-200 flex items-center gap-3 border shadow-[0_4px_15px_rgba(30,96,232,0.3)] active:scale-[0.98] cursor-pointer ${
                        consoleData?.state?.timers_frozen 
                          ? 'bg-gradient-to-r from-cyan-600 to-blue-600 border-cyan-400 ring-2 ring-cyan-400/50' 
                          : 'bg-gradient-to-r from-[#1853D4] via-[#1D60E8] to-[#1E6BFA] hover:from-[#1E60E8] hover:to-[#2B79FF] border-blue-400/40'
                      }`}
                    >
                      <div className="w-6 h-6 rounded-lg bg-white/15 flex items-center justify-center">
                        <Snowflake size={14} className={consoleData?.state?.timers_frozen ? 'animate-spin' : ''} />
                      </div>
                      <span className="flex-1 text-left font-black">
                        {consoleData?.state?.timers_frozen ? 'UNFREEZE TIMERS' : 'FREEZE TIMERS'}
                      </span>
                    </button>

                    {/* BUTTON 4: FREEZE QUESTIONS */}
                    <button
                      onClick={handleFreezeQuestions}
                      disabled={actionLoading}
                      className={`w-full py-3.5 px-4 rounded-xl font-bold text-xs md:text-sm text-white tracking-wider uppercase transition-all duration-200 flex items-center gap-3 border shadow-[0_4px_15px_rgba(30,96,232,0.3)] active:scale-[0.98] cursor-pointer ${
                        consoleData?.state?.questions_frozen 
                          ? 'bg-gradient-to-r from-indigo-600 to-purple-600 border-indigo-400 ring-2 ring-indigo-400/50' 
                          : 'bg-gradient-to-r from-[#1853D4] via-[#1D60E8] to-[#1E6BFA] hover:from-[#1E60E8] hover:to-[#2B79FF] border-blue-400/40'
                      }`}
                    >
                      <div className="w-6 h-6 rounded-lg bg-white/15 flex items-center justify-center">
                        <HelpCircle size={14} />
                      </div>
                      <span className="flex-1 text-left font-black">
                        {consoleData?.state?.questions_frozen ? 'UNFREEZE QUESTIONS' : 'FREEZE QUESTIONS'}
                      </span>
                    </button>

                  </div>
                </div>
              </div>

              {/* MIDDLE COLUMN 2: SUBSTITUTION & GAME CONTROL */}
              <div className="lg:col-span-3 flex flex-col justify-between">
                
                {/* SUB GROUP 1: SUBSTITUTION */}
                <div className="mb-4">
                  <div className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 mb-3 pl-1">
                    SUBSTITUTION
                  </div>
                  <div className="flex flex-col gap-3">
                    
                    {/* BUTTON 1: ACTIVATE SUBSTITUTION */}
                    <button
                      onClick={handleActivateSubstitution}
                      disabled={actionLoading}
                      className="w-full py-3.5 px-4 rounded-xl font-bold text-xs md:text-sm text-white tracking-wider uppercase transition-all duration-200 flex items-center gap-3 bg-gradient-to-r from-[#059669] via-[#10B981] to-[#34D399] hover:from-[#10B981] hover:to-[#6EE7B7] border border-emerald-300/40 shadow-[0_4px_18px_rgba(16,185,129,0.4)] active:scale-[0.98] cursor-pointer"
                    >
                      <div className="w-6 h-6 rounded-lg bg-white/20 flex items-center justify-center">
                        <UserCheck size={14} className="text-white" />
                      </div>
                      <span className="flex-1 text-left font-black">ACTIVATE SUBSTITUTION</span>
                    </button>

                    {/* BUTTON 2: CONFIRM COMPLETION */}
                    <button
                      onClick={handleConfirmCompletion}
                      disabled={actionLoading}
                      className="w-full py-3.5 px-4 rounded-xl font-bold text-xs md:text-sm text-white tracking-wider uppercase transition-all duration-200 flex items-center gap-3 bg-gradient-to-r from-[#1853D4] via-[#1D60E8] to-[#1E6BFA] hover:from-[#1E60E8] hover:to-[#2B79FF] border border-blue-400/40 shadow-[0_4px_15px_rgba(30,96,232,0.3)] active:scale-[0.98] cursor-pointer"
                    >
                      <div className="w-6 h-6 rounded-lg bg-white/15 flex items-center justify-center">
                        <CheckCircle2 size={14} className="text-white" />
                      </div>
                      <span className="flex-1 text-left font-black">CONFIRM COMPLETION</span>
                    </button>

                  </div>
                </div>

                {/* SUB GROUP 2: GAME CONTROL */}
                <div>
                  <div className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 mb-3 pl-1">
                    GAME CONTROL
                  </div>
                  <div className="flex flex-col gap-3">
                    
                    {/* BUTTON 3: RESUME GAME */}
                    <button
                      onClick={handleResume}
                      disabled={actionLoading || consoleData?.state?.game_status === 'RUNNING'}
                      className="w-full py-3.5 px-4 rounded-xl font-bold text-xs md:text-sm text-slate-950 tracking-wider uppercase transition-all duration-200 flex items-center gap-3 bg-gradient-to-r from-[#D97706] via-[#EAB308] to-[#FACC15] hover:from-[#EAB308] hover:to-[#FEF08A] border border-amber-300 shadow-[0_4px_20px_rgba(234,179,8,0.45)] active:scale-[0.98] cursor-pointer disabled:opacity-60"
                    >
                      <div className="w-6 h-6 rounded-lg bg-black/20 flex items-center justify-center">
                        <Play size={14} fill="currentColor" className="text-slate-950" />
                      </div>
                      <span className="flex-1 text-left font-black">RESUME GAME</span>
                    </button>

                    {/* BUTTON 4: LIVE GAME LOG */}
                    <button
                      onClick={() => setIsLogModalOpen(true)}
                      className="w-full py-3.5 px-4 rounded-xl font-bold text-xs md:text-sm text-white tracking-wider uppercase transition-all duration-200 flex items-center gap-3 bg-gradient-to-r from-[#0C152B] via-[#101E3D] to-[#14264F] hover:from-[#14264F] hover:to-[#1B326B] border border-blue-400/25 shadow-[0_4px_12px_rgba(0,0,0,0.5)] active:scale-[0.98] cursor-pointer"
                    >
                      <div className="w-6 h-6 rounded-lg bg-blue-500/20 flex items-center justify-center">
                        <History size={14} className="text-blue-400" />
                      </div>
                      <span className="flex-1 text-left font-black">LIVE GAME LOG</span>
                    </button>

                  </div>
                </div>

              </div>

              {/* RIGHT COLUMN: HARDWARE CONTROL SWITCH PAD */}
              <div className="lg:col-span-3 flex flex-col items-center justify-center">
                
                {/* Physical Bezel Unit Frame */}
                <div className="w-full max-w-[210px] rounded-3xl p-3 bg-gradient-to-b from-[#2E313A] via-[#1F2228] to-[#121417] border-[3px] border-[#D4AF37] shadow-[0_15px_35px_rgba(0,0,0,0.9),inset_0_2px_4px_rgba(255,255,255,0.4)] flex flex-col gap-4">
                  
                  {/* Recessed Switch Bay */}
                  <div className="rounded-2xl p-2.5 bg-black/80 border border-black shadow-[inset_0_6px_15px_rgba(0,0,0,0.9)] flex flex-col gap-4">
                    
                    {/* HARDWARE PAUSE BUTTON */}
                    <button
                      onClick={handlePause}
                      disabled={actionLoading || consoleData?.state?.is_paused}
                      className="group relative w-full h-24 rounded-2xl bg-gradient-to-b from-[#EF4444] via-[#DC2626] to-[#991B1B] border-2 border-[#FCA5A5]/60 shadow-[0_8px_0_#7F1D1D,0_12px_25px_rgba(239,68,68,0.5)] active:translate-y-2 active:shadow-[0_1px_0_#7F1D1D] transition-all flex flex-col items-center justify-center cursor-pointer select-none overflow-hidden"
                    >
                      {/* Top Glass Sheen */}
                      <div className="absolute top-0 left-0 right-0 h-1/2 bg-white/20 rounded-t-2xl pointer-events-none" />
                      
                      <div className="relative z-10 flex flex-col items-center gap-1.5">
                        <Pause size={28} fill="white" className="text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]" />
                        <span className="text-xs font-black tracking-[0.2em] uppercase text-white drop-shadow-[0_2px_3px_rgba(0,0,0,0.8)]">
                          PAUSE
                        </span>
                      </div>
                    </button>

                    {/* HARDWARE RESUME BUTTON */}
                    <button
                      onClick={handleResume}
                      disabled={actionLoading || consoleData?.state?.game_status === 'RUNNING'}
                      className="group relative w-full h-24 rounded-2xl bg-gradient-to-b from-[#10B981] via-[#059669] to-[#065F46] border-2 border-[#6EE7B7]/60 shadow-[0_8px_0_#064E3B,0_12px_25px_rgba(16,185,129,0.5)] active:translate-y-2 active:shadow-[0_1px_0_#064E3B] transition-all flex flex-col items-center justify-center cursor-pointer select-none overflow-hidden"
                    >
                      {/* Top Glass Sheen */}
                      <div className="absolute top-0 left-0 right-0 h-1/2 bg-white/20 rounded-t-2xl pointer-events-none" />
                      
                      <div className="relative z-10 flex flex-col items-center gap-1.5">
                        <Play size={28} fill="white" className="text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]" />
                        <span className="text-xs font-black tracking-[0.2em] uppercase text-white drop-shadow-[0_2px_3px_rgba(0,0,0,0.8)]">
                          RESUME
                        </span>
                      </div>
                    </button>

                  </div>

                  {/* Physical Hardware Screws / Badges */}
                  <div className="flex items-center justify-between px-2 pt-1 text-[9px] font-mono tracking-widest text-[#D4AF37]/70 uppercase">
                    <span>DIR.CTRL</span>
                    <span>HDW.v2</span>
                  </div>

                </div>

              </div>

            </div>

            {/* SCREEN FOOTER: ACTIVE CONTESTANT TEAMS & STATUS */}
            {consoleData?.participants && consoleData.participants.length > 0 && (
              <div className="relative z-10 pt-4 border-t border-blue-500/15 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-6">
                  {consoleData.participants.map((p, idx) => (
                    <div key={p.participant_id} className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${idx === 0 ? 'bg-blue-400' : 'bg-emerald-400'}`} />
                      <div>
                        <div className="text-xs font-bold text-white tracking-wide">{p.team_name}</div>
                        <div className="text-[10px] text-gray-400">Score: <strong className="text-white font-mono text-xs">{p.score}</strong></div>
                      </div>
                    </div>
                  ))}
                </div>

                {consoleData?.state?.substitution_status !== 'none' && (
                  <div className="px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                    <span className="text-xs font-bold text-amber-300 uppercase tracking-wider">
                      Substitution: {consoleData.state.substitution_status}
                    </span>
                  </div>
                )}
              </div>
            )}

          </div>

        </div>

      </div>

      {/* MODAL 1: SUBSTITUTION REQUEST MODAL */}
      {isSubModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-lg rounded-2xl bg-[#0F1422] border border-blue-500/30 shadow-2xl p-6 relative">
            <button
              onClick={() => setIsSubModalOpen(false)}
              className="absolute top-5 right-5 p-1 rounded-lg text-gray-400 hover:text-white bg-white/5 hover:bg-white/10"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
                <ArrowRightLeft size={20} />
              </div>
              <div>
                <h3 className="text-lg font-black text-white uppercase tracking-wider">
                  Request Player Substitution
                </h3>
                <p className="text-xs text-gray-400">
                  Select the contestant and substitute member to swap.
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmitSubRequest} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-1">
                  Target Team
                </label>
                <select
                  value={subTeam}
                  onChange={(e) => setSubTeam(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm font-semibold text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {consoleData?.participants?.map(p => (
                    <option key={p.participant_id} value={p.team_name} className="bg-slate-900 text-white">
                      {p.team_name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-red-300 mb-1">
                    Outgoing Player (Off Stage)
                  </label>
                  {selectedTeamData?.members?.length > 0 ? (
                    <select
                      value={outgoingPlayer}
                      onChange={(e) => setOutgoingPlayer(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                    >
                      <option value="" className="bg-slate-900">Select player...</option>
                      {selectedTeamData.members.map(m => (
                        <option key={m.id} value={m.name} className="bg-slate-900">
                          {m.name} ({m.role})
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      placeholder="e.g. John Doe"
                      value={outgoingPlayer}
                      onChange={(e) => setOutgoingPlayer(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                      required
                    />
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-emerald-300 mb-1">
                    Incoming Player (On Stage)
                  </label>
                  {selectedTeamData?.members?.length > 0 ? (
                    <select
                      value={incomingPlayer}
                      onChange={(e) => setIncomingPlayer(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="" className="bg-slate-900">Select substitute...</option>
                      {selectedTeamData.members.map(m => (
                        <option key={m.id} value={m.name} className="bg-slate-900">
                          {m.name} ({m.role})
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      placeholder="e.g. Jane Smith"
                      value={incomingPlayer}
                      onChange={(e) => setIncomingPlayer(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      required
                    />
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-1">
                  Reason for Substitution
                </label>
                <input
                  type="text"
                  placeholder="e.g. Tactical substitution / Fatigue"
                  value={subReason}
                  onChange={(e) => setSubReason(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsSubModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-sm font-semibold text-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-sm font-bold text-white uppercase tracking-wider shadow-lg active:scale-95 cursor-pointer"
                >
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: LIVE GAME LOG MODAL */}
      {isLogModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-2xl max-h-[80vh] rounded-2xl bg-[#0B101D] border border-blue-500/30 shadow-2xl p-6 flex flex-col relative">
            <button
              onClick={() => setIsLogModalOpen(false)}
              className="absolute top-5 right-5 p-1 rounded-lg text-gray-400 hover:text-white bg-white/5 hover:bg-white/10"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
                <History size={20} />
              </div>
              <div>
                <h3 className="text-lg font-black text-white uppercase tracking-wider">
                  Live Competition Audit Log
                </h3>
                <p className="text-xs text-gray-400">
                  Real-time chronologic record of director controls, pauses, and stage events.
                </p>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2.5 pr-2 my-3">
              {matchLogs.length === 0 ? (
                <div className="py-12 text-center text-gray-500 text-sm">
                  No log entries recorded yet.
                </div>
              ) : (
                [...matchLogs].reverse().map((log, index) => (
                  <div
                    key={log.id || index}
                    className="p-3 rounded-xl bg-white/5 border border-white/5 flex items-start justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-cyan-400 font-semibold">{log.timestamp}</span>
                      <span className={`px-2 py-0.5 rounded font-black tracking-wider text-[10px] uppercase ${
                        log.event_type?.includes('PAUSE') ? 'bg-red-500/20 text-red-300' :
                        log.event_type?.includes('RESUME') ? 'bg-amber-500/20 text-amber-300' :
                        log.event_type?.includes('SUB') ? 'bg-emerald-500/20 text-emerald-300' :
                        log.event_type?.includes('FREEZE') ? 'bg-cyan-500/20 text-cyan-300' :
                        'bg-blue-500/20 text-blue-300'
                      }`}>
                        {log.event_type}
                      </span>
                      <span className="text-gray-200 font-medium">{log.message}</span>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="pt-3 border-t border-white/10 flex items-center justify-between">
              <button
                onClick={async () => {
                  if (selectedMatch) {
                    const res = await api.get(`/arena/matches/${selectedMatch.id}/logs`);
                    setMatchLogs(res.data?.logs || []);
                  }
                }}
                className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-semibold text-gray-300 flex items-center gap-2"
              >
                <RefreshCw size={13} />
                Refresh Logs
              </button>
              <button
                onClick={() => setIsLogModalOpen(false)}
                className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-bold text-white uppercase tracking-wider"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
