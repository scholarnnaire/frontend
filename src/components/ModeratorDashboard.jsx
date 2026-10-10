import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, Pause, Play, RefreshCw, CheckCircle2, AlertCircle, 
  Clock, Users, Trophy, Volume2, ArrowRight
} from 'lucide-react';
import api from '../utils/api';

export function ModeratorDashboard() {
  const [matchId, setMatchId] = useState(1);
  const [currentHalf, setCurrentHalf] = useState('First Half'); // 'First Half' or 'Second Half'
  const [gameState, setGameState] = useState('active'); // 'waiting', 'active', 'paused', 'finished'
  const [gameTimer, setGameTimer] = useState(30);
  const [isTimerPaused, setIsTimerPaused] = useState(false);
  const [substitutionRequests, setSubstitutionRequests] = useState([]);
  const [activeSubstitution, setActiveSubstitution] = useState(null);
  const [scores, setScores] = useState({ team1: 2400, team2: 1900 });

  // Fetch substitution requests periodically
  const fetchSubstitutions = async () => {
    try {
      const res = await api.get('/competition/live/substitution-requests');
      setSubstitutionRequests(res.data);
    } catch (err) {
      console.error("Failed to fetch substitutions:", err);
    }
  };

  useEffect(() => {
    fetchSubstitutions();
    const interval = setInterval(fetchSubstitutions, 4000);
    return () => clearInterval(interval);
  }, []);

  // Timer simulation
  useEffect(() => {
    if (gameState !== 'active' || isTimerPaused) return;

    const timer = setInterval(() => {
      setGameTimer(prev => {
        if (prev <= 1) return 30;
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameState, isTimerPaused]);

  // Activate Substitution & Enter Pause Mode
  const handleActivateSubstitution = async (request) => {
    try {
      await api.post('/competition/live/activate-substitution', {
        request_id: request.id
      });
      setIsTimerPaused(true);
      setGameState('paused');
      setActiveSubstitution(request);
      fetchSubstitutions();
    } catch (err) {
      alert("Failed to activate substitution");
    }
  };

  // Resume Game after substitution
  const handleResumeGame = async () => {
    if (!activeSubstitution) return;

    try {
      await api.post('/competition/live/resume-game', {
        request_id: activeSubstitution.id
      });
      setIsTimerPaused(false);
      setGameState('active');
      setActiveSubstitution(null);
      fetchSubstitutions();
    } catch (err) {
      alert("Failed to resume game");
    }
  };

  return (
    <div className="min-h-screen bg-[#070a10] text-white font-sans p-6 md:p-10 select-none">
      
      {/* ── TOP HEADER ── */}
      <header className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-gray-800 gap-4 mb-8">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs uppercase font-extrabold tracking-widest text-emerald-400 bg-emerald-950/60 px-2.5 py-1 rounded-md border border-emerald-500/30">
              Live Studio Official Control
            </span>
            <span className="text-gray-500">•</span>
            <span className="text-xs text-gray-400">Moderator Dashboard</span>
          </div>
          <h1 className="text-3xl font-black text-white mt-1">
            Live Studio Game Moderator
          </h1>
        </div>

        {/* Status indicators */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Halves Selector */}
          <div className="flex items-center bg-[#111827] border border-gray-700 rounded-xl p-1 text-xs">
            <button
              onClick={() => setCurrentHalf('First Half')}
              className={`px-3 py-1.5 rounded-lg font-bold transition ${
                currentHalf === 'First Half' ? 'bg-blue-600 text-white' : 'text-gray-400'
              }`}
            >
              First Half
            </button>
            <button
              onClick={() => setCurrentHalf('Second Half')}
              className={`px-3 py-1.5 rounded-lg font-bold transition ${
                currentHalf === 'Second Half' ? 'bg-blue-600 text-white' : 'text-gray-400'
              }`}
            >
              Second Half
            </button>
          </div>

          {/* Game State Badge */}
          <span className={`px-4 py-2 rounded-xl text-xs font-black tracking-wider uppercase flex items-center space-x-2 border ${
            gameState === 'paused' 
              ? 'bg-amber-950/60 text-amber-400 border-amber-500/40 animate-pulse' 
              : gameState === 'active'
              ? 'bg-emerald-950/60 text-emerald-400 border-emerald-500/40'
              : 'bg-gray-800 text-gray-300 border-gray-700'
          }`}>
            <span className={`w-2.5 h-2.5 rounded-full ${gameState === 'paused' ? 'bg-amber-400' : 'bg-emerald-400'}`} />
            <span>{gameState === 'paused' ? 'GAME PAUSED (SUBSTITUTION)' : gameState.toUpperCase()}</span>
          </span>
        </div>
      </header>

      {/* ── PAUSE OVERLAY BANNER (When Substitution Active) ── */}
      <AnimatePresence>
        {gameState === 'paused' && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mb-8 p-6 bg-gradient-to-r from-amber-950/80 via-amber-900/60 to-amber-950/80 border-2 border-amber-500 rounded-3xl shadow-[0_0_50px_rgba(245,158,11,0.25)] flex flex-col md:flex-row items-center justify-between gap-6"
          >
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border-2 border-amber-500 flex items-center justify-center">
                <Pause className="w-8 h-8 text-amber-400" />
              </div>
              <div>
                <span className="text-xs uppercase font-extrabold tracking-widest text-amber-300">
                  Game Frozen • Live Studio Substitution in Progress
                </span>
                <h3 className="text-xl font-black text-white mt-0.5">
                  {activeSubstitution?.team_name || 'Team Substitution'}
                </h3>
                <p className="text-xs text-amber-200 mt-1">
                  All contestant timers and questions are frozen. Outgoing: <strong>{activeSubstitution?.outgoing_members?.join(', ')}</strong> → Incoming: <strong>{activeSubstitution?.incoming_members?.join(', ')}</strong>
                </p>
              </div>
            </div>

            <button
              onClick={handleResumeGame}
              className="flex items-center space-x-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-gray-950 font-black rounded-2xl shadow-xl transition transform active:scale-95 text-sm"
            >
              <Play className="w-5 h-5 fill-current" />
              <span>UNFREEZE & RESUME GAME</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── MAIN DASHBOARD GRID ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Live Match Control & Timers */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Active Teams Status Card */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            
            {/* Team Alpha Card */}
            <div className="bg-[#101726] border border-blue-500/30 rounded-3xl p-6 shadow-xl relative overflow-hidden">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded-md border border-blue-500/20">
                  Team 1 (Alpha)
                </span>
                <span className="text-xs text-emerald-400 font-bold">Connected</span>
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Kings College Academy Team</h2>
              <div className="text-4xl font-black text-white mb-4">
                {scores.team1} <span className="text-xs text-gray-400 font-normal">pts</span>
              </div>
              <div className="text-xs text-gray-400 space-y-1">
                <div>Substitutions: <strong>1 / 1 Available</strong> in {currentHalf}</div>
                <div>Status: <span className="text-emerald-400 font-semibold">Active in Studio</span></div>
              </div>
            </div>

            {/* Team Beta Card */}
            <div className="bg-[#101726] border border-pink-500/30 rounded-3xl p-6 shadow-xl relative overflow-hidden">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-pink-400 bg-pink-500/10 px-2.5 py-1 rounded-md border border-pink-500/20">
                  Team 2 (Beta)
                </span>
                <span className="text-xs text-emerald-400 font-bold">Connected</span>
              </div>
              <h2 className="text-xl font-bold text-white mb-2">St Monica Group of Schools Team</h2>
              <div className="text-4xl font-black text-white mb-4">
                {scores.team2} <span className="text-xs text-gray-400 font-normal">pts</span>
              </div>
              <div className="text-xs text-gray-400 space-y-1">
                <div>Substitutions: <strong>1 / 1 Available</strong> in {currentHalf}</div>
                <div>Status: <span className="text-emerald-400 font-semibold">Active in Studio</span></div>
              </div>
            </div>
          </div>

          {/* Synchronized Studio Timer & Control Center */}
          <div className="bg-[#0e1422] border border-gray-800 rounded-3xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-2">
                <Clock className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-white">Synchronized Studio Timer</h3>
              </div>
              <span className="text-xs text-gray-400">10s Question Clocks • Instant Freezing</span>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-6 bg-[#141b2c] p-6 rounded-2xl border border-gray-800">
              <div className="flex items-center space-x-4">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center font-mono text-3xl font-black border ${
                  isTimerPaused 
                    ? 'bg-amber-950/60 text-amber-400 border-amber-500/40 animate-pulse' 
                    : 'bg-emerald-950/60 text-emerald-400 border-emerald-500/40'
                }`}>
                  {gameTimer}s
                </div>
                <div>
                  <div className="text-sm font-bold text-white">
                    {isTimerPaused ? 'Clock Frozen' : 'Active Clock Running'}
                  </div>
                  <div className="text-xs text-gray-400">
                    {isTimerPaused ? 'No participant losing time during substitution' : 'Synchronized across all contestant screens'}
                  </div>
                </div>
              </div>

              {/* Manual moderator controls */}
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setIsTimerPaused(!isTimerPaused)}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold border transition ${
                    isTimerPaused 
                      ? 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-400' 
                      : 'bg-amber-600 hover:bg-amber-500 text-white border-amber-400'
                  }`}
                >
                  {isTimerPaused ? 'Resume Timer' : 'Manual Pause Clock'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Substitution Requests Queue */}
        <div className="bg-[#0e1422] border border-gray-800 rounded-3xl p-6 shadow-xl flex flex-col">
          <div className="flex items-center justify-between pb-4 border-b border-gray-800 mb-4">
            <div className="flex items-center space-x-2">
              <RefreshCw className="w-5 h-5 text-blue-400" />
              <h3 className="font-bold text-white">Substitution Requests</h3>
            </div>
            <span className="text-xs font-mono text-gray-400 bg-gray-800 px-2 py-0.5 rounded">
              {substitutionRequests.length}
            </span>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto max-h-[500px]">
            {substitutionRequests.length > 0 ? (
              substitutionRequests.map((req) => (
                <div 
                  key={req.id} 
                  className={`p-4 rounded-2xl border text-xs transition ${
                    req.status === 'Pending' 
                      ? 'bg-[#182338] border-blue-500/40 shadow-lg' 
                      : req.status === 'Approved'
                      ? 'bg-amber-950/40 border-amber-500/40'
                      : 'bg-[#121927] border-gray-800 opacity-60'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-white text-sm">{req.team_name}</span>
                    <span className="text-[10px] font-mono text-gray-400">{req.requested_at}</span>
                  </div>

                  <div className="text-[11px] text-gray-300 space-y-1 mb-3">
                    <div>Captain: <strong>{req.captain_name}</strong> ({req.half})</div>
                    <div>Outgoing: <span className="text-red-400 font-semibold">{req.outgoing_members?.join(', ')}</span></div>
                    <div>Incoming: <span className="text-emerald-400 font-semibold">{req.incoming_members?.join(', ')}</span></div>
                  </div>

                  {req.status === 'Pending' && (
                    <button
                      onClick={() => handleActivateSubstitution(req)}
                      className="w-full py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold rounded-xl shadow-md transition"
                    >
                      Verify & Activate Substitution
                    </button>
                  )}

                  {req.status === 'Approved' && (
                    <div className="text-amber-400 font-bold text-center py-1">
                      Active (Game in Pause Mode)
                    </div>
                  )}

                  {req.status === 'Completed' && (
                    <div className="text-emerald-400 font-semibold flex items-center justify-center space-x-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Completed & Unfrozen</span>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="h-64 flex flex-col items-center justify-center text-center text-xs text-gray-500 p-6">
                <Users className="w-10 h-10 mb-2 opacity-30" />
                <span>No active substitution requests.<br />When a Captain requests a substitution, it appears here instantly.</span>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
