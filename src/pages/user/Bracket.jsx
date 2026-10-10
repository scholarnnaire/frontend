import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Network, 
  Trophy, 
  Swords, 
  Calendar, 
  ChevronRight, 
  Users, 
  Flame, 
  CheckCircle, 
  Play, 
  Lock, 
  RefreshCw,
  Layers,
  Award,
  ExternalLink
} from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';

export function Bracket() {
  const [tournaments, setTournaments] = useState([]);
  const [selectedTournamentId, setSelectedTournamentId] = useState(null);
  const [bracketData, setBracketData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeStageTab, setActiveStageTab] = useState(0);
  const [currentSchoolId, setCurrentSchoolId] = useState(null);

  // Fetch current user school info
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get('/user/dashboard');
        if (res.data?.school?.id) {
          setCurrentSchoolId(res.data.school.id);
        }
      } catch (err) {
        console.error('Failed to get school profile:', err);
      }
    };
    fetchUser();
  }, []);

  // Fetch all tournaments
  useEffect(() => {
    const fetchTournaments = async () => {
      try {
        const res = await api.get('/tournaments');
        setTournaments(res.data || []);
        if (res.data && res.data.length > 0) {
          // Default to active tournament or first
          const active = res.data.find(t => t.status === 'active') || res.data[0];
          setSelectedTournamentId(active.id);
        }
      } catch (err) {
        console.error('Failed to fetch tournaments:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchTournaments();
  }, []);

  // Fetch bracket for selected tournament
  const fetchBracket = async (isManual = false) => {
    if (!selectedTournamentId) return;
    if (isManual) setRefreshing(true);
    try {
      const res = await api.get(`/tournaments/${selectedTournamentId}/bracket`);
      setBracketData(res.data);
      // Auto-select stage with active or latest matches
      if (res.data?.stages?.length > 0) {
        const activeIdx = res.data.stages.findIndex(s => s.status === 'active' || s.matches?.some(m => m.status === 'active'));
        if (activeIdx !== -1) {
          setActiveStageTab(activeIdx);
        }
      }
    } catch (err) {
      console.error('Failed to fetch bracket data:', err);
    } finally {
      if (isManual) setRefreshing(false);
    }
  };

  useEffect(() => {
    if (selectedTournamentId) {
      fetchBracket();
    }
  }, [selectedTournamentId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full min-h-[60vh]">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-brand-green"></div>
      </div>
    );
  }

  const stages = bracketData?.stages || [];
  const currentStage = stages[activeStageTab] || null;
  const hasMatches = stages.some(s => s.matches && s.matches.length > 0);

  return (
    <div className="max-w-6xl mx-auto w-full space-y-8 pb-12">
      
      {/* Header & Tournament Selector */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div className="space-y-2 max-w-2xl">
          <div className="flex items-center gap-2">
            <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">Tournament Bracket</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase bg-brand-green/10 text-brand-green border border-brand-green/20">
              Live
            </span>
          </div>
          <p className="text-gray-400 text-base md:text-lg">
            View match pairings, qualification rounds, and the path to the National Championship.
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          {/* Tournament Dropdown Selector */}
          {tournaments.length > 1 && (
            <select
              value={selectedTournamentId || ''}
              onChange={(e) => setSelectedTournamentId(Number(e.target.value))}
              className="bg-[#13151A] border border-white/10 rounded-xl px-4 py-2.5 text-sm font-bold text-white focus:outline-none focus:border-brand-green cursor-pointer"
            >
              {tournaments.map((t) => (
                <option key={t.id} value={t.id} className="bg-[#181A20] text-white">
                  {t.name} {t.status === 'active' ? '• (Active)' : ''}
                </option>
              ))}
            </select>
          )}

          <button
            onClick={() => fetchBracket(true)}
            disabled={refreshing}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/5 transition-all text-xs font-semibold"
            title="Refresh Bracket"
          >
            <RefreshCw size={14} className={refreshing ? 'animate-spin text-brand-green' : ''} />
            {refreshing ? 'Updating...' : 'Sync'}
          </button>

          <div className="bg-[#13151A] border border-white/5 px-4 py-2.5 rounded-xl flex items-center gap-2.5 shadow-lg">
            <Calendar size={16} className="text-brand-green" />
            <span className="text-xs md:text-sm font-bold text-white">Season 2026/2027</span>
          </div>
        </div>
      </div>

      {/* Tournament Stats Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-[#13151A] border border-white/5 p-4 rounded-2xl flex items-center gap-3 shadow-lg">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center shrink-0">
            <Swords size={20} />
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase text-gray-400">Total Enrolled</p>
            <h4 className="text-base font-black text-white">{bracketData?.teams?.length || 0} Schools</h4>
          </div>
        </div>

        <div className="bg-[#13151A] border border-white/5 p-4 rounded-2xl flex items-center gap-3 shadow-lg">
          <div className="w-10 h-10 rounded-xl bg-yellow-500/10 text-yellow-400 flex items-center justify-center shrink-0">
            <Trophy size={20} />
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase text-gray-400">Grand Prize</p>
            <h4 className="text-base font-black text-white">{bracketData?.entry_fee === 'Free' ? '₦1,000,000' : '₦1,000,000'}</h4>
          </div>
        </div>

        <div className="bg-[#13151A] border border-white/5 p-4 rounded-2xl flex items-center gap-3 shadow-lg">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center shrink-0">
            <Layers size={20} />
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase text-gray-400">Tournament Stages</p>
            <h4 className="text-base font-black text-white">{stages.length || '3 Rounds'}</h4>
          </div>
        </div>

        <div className="bg-[#13151A] border border-white/5 p-4 rounded-2xl flex items-center gap-3 shadow-lg">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-brand-green flex items-center justify-center shrink-0">
            <Flame size={20} />
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase text-gray-400">Tournament Track</p>
            <h4 className="text-base font-black text-white truncate max-w-[120px]">{bracketData?.track_name || 'National'}</h4>
          </div>
        </div>
      </div>

      {/* Main Bracket Content */}
      {stages.length === 0 || !hasMatches ? (
        // State when matches have not yet been drawn/generated
        <div className="bg-[#13151A] border border-white/5 rounded-3xl p-8 min-h-[460px] flex flex-col items-center justify-center relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-brand-green/5 via-[#13151A] to-[#13151A] pointer-events-none"></div>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative z-10 text-center space-y-5 max-w-md mx-auto"
          >
            <div className="w-20 h-20 rounded-full bg-brand-green/10 border border-brand-green/20 mx-auto flex items-center justify-center shadow-[0_0_50px_rgba(34,197,94,0.2)]">
              <Network size={36} className="text-brand-green" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-white">Bracket Draw In Progress</h2>
              <p className="text-gray-400 text-sm mt-2 leading-relaxed">
                Official seedings and round pairings for <strong>{bracketData?.name}</strong> are being finalized by tournament officials. Matches will unlock automatically here.
              </p>
            </div>
            
            <div className="pt-2 flex flex-wrap justify-center gap-3">
              <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-xl text-xs font-semibold text-gray-300 border border-white/5">
                <Users size={14} className="text-blue-400" />
                {bracketData?.teams?.length || 0} Registered Teams
              </div>
              <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-xl text-xs font-semibold text-gray-300 border border-white/5">
                <Trophy size={14} className="text-yellow-400" />
                ₦1,000,000 Prize Pool
              </div>
            </div>

            {bracketData?.teams?.length > 0 && (
              <div className="pt-4 border-t border-white/5 text-left">
                <p className="text-xs font-bold uppercase text-gray-400 mb-2">Registered Teams in this Bracket:</p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {bracketData.teams.slice(0, 8).map(team => (
                    <span key={team.id} className="text-xs px-2.5 py-1 bg-white/5 border border-white/5 rounded-lg text-gray-300">
                      {team.name}
                    </span>
                  ))}
                  {bracketData.teams.length > 8 && (
                    <span className="text-xs px-2.5 py-1 bg-white/5 rounded-lg text-gray-400">
                      +{bracketData.teams.length - 8} more
                    </span>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        </div>
      ) : (
        // Live / Drawn Interactive Bracket
        <div className="space-y-6">
          
          {/* Stage Progression Navigation Tabs */}
          <div className="flex items-center gap-2 border-b border-white/5 pb-3 overflow-x-auto">
            {stages.map((stage, idx) => {
              const isActive = activeStageTab === idx;
              const stageMatchCount = stage.matches?.length || 0;
              const isLive = stage.matches?.some(m => m.status === 'active');
              
              return (
                <button
                  key={stage.id}
                  onClick={() => setActiveStageTab(idx)}
                  className={`flex items-center gap-2.5 px-5 py-3 rounded-2xl text-sm font-bold transition-all shrink-0 border ${
                    isActive
                      ? 'bg-brand-green text-[#0D0F14] border-brand-green shadow-lg shadow-brand-green/20'
                      : 'bg-[#13151A] text-gray-400 border-white/5 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <span>Stage {stage.order}: {stage.name}</span>
                  {isLive ? (
                    <span className="flex h-2 w-2 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                    </span>
                  ) : (
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      isActive ? 'bg-black/20 text-[#0D0F14]' : 'bg-white/10 text-gray-300'
                    }`}>
                      {stageMatchCount} {stageMatchCount === 1 ? 'Match' : 'Matches'}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Current Stage Match Pairings */}
          {currentStage && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-black text-white flex items-center gap-2">
                    {currentStage.name}
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-white/5 text-gray-400 border border-white/5">
                      Format: {currentStage.format?.toUpperCase() || 'KNOCKOUT'}
                    </span>
                  </h3>
                  <p className="text-xs text-gray-400 mt-1">
                    Teams advance through highest buzzer speed and quiz accuracy on the ladder rung.
                  </p>
                </div>
              </div>

              {/* Match Cards Grid */}
              {currentStage.matches && currentStage.matches.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {currentStage.matches.map((match) => {
                    const isMyMatch = match.participants?.some(p => p.school_id === currentSchoolId);
                    const isLive = match.status === 'active';
                    const isCompleted = match.status === 'completed';

                    return (
                      <motion.div
                        key={match.id}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`bg-[#13151A] rounded-3xl p-6 border transition-all relative overflow-hidden shadow-xl ${
                          isMyMatch 
                            ? 'border-brand-green/60 shadow-brand-green/10 ring-1 ring-brand-green/40' 
                            : 'border-white/5 hover:border-white/10'
                        }`}
                      >
                        {/* Live Top Badge */}
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono font-bold text-gray-400 uppercase tracking-wider">
                              {match.name}
                            </span>
                            {isMyMatch && (
                              <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded-full bg-brand-green text-[#0D0F14]">
                                Your Match
                              </span>
                            )}
                          </div>

                          {isLive ? (
                            <span className="flex items-center gap-1.5 text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-brand-green border border-emerald-500/20">
                              <span className="w-1.5 h-1.5 rounded-full bg-brand-green animate-ping"></span>
                              Live In Arena
                            </span>
                          ) : isCompleted ? (
                            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-white/10 text-gray-400">
                              Completed
                            </span>
                          ) : (
                            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-white/5 text-gray-500">
                              Scheduled
                            </span>
                          )}
                        </div>

                        {/* Participants Container */}
                        <div className="space-y-3 bg-[#0A0C10] p-4 rounded-2xl border border-white/5">
                          {match.participants && match.participants.length > 0 ? (
                            match.participants.map((p, pIdx) => {
                              const isSelf = p.school_id === currentSchoolId;
                              return (
                                <div 
                                  key={p.id || pIdx} 
                                  className={`flex items-center justify-between p-2.5 rounded-xl transition-colors ${
                                    isSelf ? 'bg-brand-green/10 border border-brand-green/30' : 'bg-white/[0.02]'
                                  }`}
                                >
                                  <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center font-bold text-xs text-white uppercase">
                                      {p.school_name ? p.school_name.charAt(0) : 'T'}
                                    </div>
                                    <div>
                                      <h4 className={`text-sm font-bold ${isSelf ? 'text-brand-green' : 'text-white'}`}>
                                        {p.team_name}
                                      </h4>
                                      <p className="text-[11px] text-gray-400">
                                        {p.school_name} {p.school_state ? `(${p.school_state})` : ''}
                                      </p>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-2">
                                    {p.is_qualified && (
                                      <Trophy size={14} className="text-yellow-400" title="Advanced to next stage" />
                                    )}
                                    <span className="text-base font-black font-mono text-white px-2 py-0.5 bg-black/40 rounded-lg">
                                      {p.score}
                                    </span>
                                  </div>
                                </div>
                              );
                            })
                          ) : (
                            <div className="py-4 text-center text-xs text-gray-500">
                              Pairings qualifying from previous round
                            </div>
                          )}
                        </div>

                        {/* Action CTA */}
                        <div className="mt-4 flex items-center justify-between pt-2">
                          <span className="text-xs text-gray-500">
                            {match.match_date ? match.match_date : 'Match time to be announced'}
                          </span>
                          
                          {isLive ? (
                            <Link
                              to="/user/arena"
                              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-green text-[#0D0F14] font-bold text-xs hover:bg-emerald-400 transition-colors shadow-lg shadow-brand-green/20"
                            >
                              <Play size={12} fill="currentColor" />
                              Enter Live Arena
                            </Link>
                          ) : (
                            <button
                              disabled
                              className="text-xs text-gray-600 font-semibold cursor-not-allowed"
                            >
                              Awaiting Start
                            </button>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              ) : (
                // When current stage matches haven't started yet
                <div className="bg-[#13151A] border border-white/5 rounded-3xl p-12 text-center space-y-3">
                  <Lock size={32} className="mx-auto text-gray-600" />
                  <h4 className="text-lg font-bold text-white">Stage Locked</h4>
                  <p className="text-xs text-gray-400 max-w-sm mx-auto">
                    Pairings for {currentStage.name} will be populated once earlier stages conclude.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Full Tournament Progression Tree Overview */}
          <div className="bg-[#13151A] border border-white/5 rounded-3xl p-6 md:p-8 mt-8 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-black text-white">Championship Progression Path</h3>
                <p className="text-xs text-gray-400 mt-1">Full path from Qualification rounds to the Grand Trophy</p>
              </div>
              <div className="flex items-center gap-1 text-xs font-bold text-yellow-400">
                <Award size={16} />
                National Title
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative">
              {stages.map((stage, sIdx) => {
                const isFinal = sIdx === stages.length - 1;
                return (
                  <div 
                    key={stage.id} 
                    className={`p-4 rounded-2xl border transition-all ${
                      activeStageTab === sIdx 
                        ? 'bg-brand-green/5 border-brand-green/30' 
                        : 'bg-[#0A0C10] border-white/5'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
                        Round {stage.order}
                      </span>
                      {isFinal ? (
                        <Trophy size={14} className="text-yellow-400" />
                      ) : (
                        <ChevronRight size={14} className="text-gray-600" />
                      )}
                    </div>
                    <h4 className="text-base font-black text-white">{stage.name}</h4>
                    <p className="text-xs text-gray-500 mt-1">
                      {stage.matches?.length || 0} {stage.matches?.length === 1 ? 'Match' : 'Matches'} scheduled
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
