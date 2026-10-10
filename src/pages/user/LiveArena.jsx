import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Clock, Phone, BookOpen, Globe, CheckCircle, XCircle, Trophy, AlertCircle, Lock, Zap, Star, ChevronUp, ChevronDown } from 'lucide-react';
import api from '../../utils/api';

const RUNG_NAMES = {
  1: "Nursery", 2: "Kindergarten", 3: "Primary", 4: "Secondary",
  5: "Tertiary", 6: "Masters", 7: "Don", 8: "Ph.D.",
  9: "Assoc. Prof", 10: "Professor", 11: "Scholarnnaire"
};

// Static option styles — no dynamic Tailwind class generation
const OPTION_STYLES = [
  {
    base: 'border-blue-500/20 bg-blue-950/30',
    hover: 'hover:border-blue-400/60 hover:bg-blue-500/10',
    selected: 'border-blue-400 bg-blue-500/20 shadow-[0_0_24px_rgba(59,130,246,0.35)]',
    correct: 'border-green-400 bg-green-500/20 shadow-[0_0_24px_rgba(74,222,128,0.4)]',
    wrong: 'border-red-400/50 bg-red-500/10 opacity-60',
    dimmed: 'border-white/5 bg-white/3 opacity-30',
    letter: 'bg-blue-950 text-blue-400 border-blue-500/40',
    letterSelected: 'bg-blue-500 text-white border-blue-400',
  },
  {
    base: 'border-emerald-500/20 bg-emerald-950/30',
    hover: 'hover:border-emerald-400/60 hover:bg-emerald-500/10',
    selected: 'border-emerald-400 bg-emerald-500/20 shadow-[0_0_24px_rgba(52,211,153,0.35)]',
    correct: 'border-green-400 bg-green-500/20 shadow-[0_0_24px_rgba(74,222,128,0.4)]',
    wrong: 'border-red-400/50 bg-red-500/10 opacity-60',
    dimmed: 'border-white/5 bg-white/3 opacity-30',
    letter: 'bg-emerald-950 text-emerald-400 border-emerald-500/40',
    letterSelected: 'bg-emerald-500 text-white border-emerald-400',
  },
  {
    base: 'border-amber-500/20 bg-amber-950/30',
    hover: 'hover:border-amber-400/60 hover:bg-amber-500/10',
    selected: 'border-amber-400 bg-amber-500/20 shadow-[0_0_24px_rgba(251,191,36,0.35)]',
    correct: 'border-green-400 bg-green-500/20 shadow-[0_0_24px_rgba(74,222,128,0.4)]',
    wrong: 'border-red-400/50 bg-red-500/10 opacity-60',
    dimmed: 'border-white/5 bg-white/3 opacity-30',
    letter: 'bg-amber-950 text-amber-400 border-amber-500/40',
    letterSelected: 'bg-amber-500 text-white border-amber-400',
  },
  {
    base: 'border-violet-500/20 bg-violet-950/30',
    hover: 'hover:border-violet-400/60 hover:bg-violet-500/10',
    selected: 'border-violet-400 bg-violet-500/20 shadow-[0_0_24px_rgba(167,139,250,0.35)]',
    correct: 'border-green-400 bg-green-500/20 shadow-[0_0_24px_rgba(74,222,128,0.4)]',
    wrong: 'border-red-400/50 bg-red-500/10 opacity-60',
    dimmed: 'border-white/5 bg-white/3 opacity-30',
    letter: 'bg-violet-950 text-violet-400 border-violet-500/40',
    letterSelected: 'bg-violet-500 text-white border-violet-400',
  },
];

export function LiveArena() {
  const { matchId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState(null);
  const [gameState, setGameState]     = useState(null);
  const [selectedOption, setSelected] = useState(null);
  const [isLocked, setIsLocked]       = useState(false);
  const [submitting, setSubmitting]   = useState(false);
  const lastQIndex = useRef(-1);

  // Reset local selection when question changes
  useEffect(() => {
    if (gameState && gameState.current_question_index !== lastQIndex.current) {
      setSelected(null);
      setIsLocked(false);
      lastQIndex.current = gameState.current_question_index;
    }
  }, [gameState?.current_question_index]);

  // Polling
  useEffect(() => {
    let mounted = true;
    const poll = async () => {
      try {
        const res = await api.get(`/arena/matches/${matchId}/state`);
        if (mounted) { setGameState(res.data); setLoading(false); }
      } catch (err) {
        if (mounted && !gameState) {
          setLoading(false);
          setError(err.response?.data?.detail || 'Connection lost');
        }
      }
    };
    poll();
    const iv = setInterval(poll, 1500);
    return () => { mounted = false; clearInterval(iv); };
  }, [matchId]);

  const handleSelect = (opt) => {
    if (isLocked || gameState?.phase !== 'question_active') return;
    setSelected(opt);
  };

  const handleLockAnswer = async () => {
    if (!selectedOption || isLocked || submitting) return;
    setSubmitting(true);
    try {
      await api.post(`/arena/matches/${matchId}/answer`, { answer: selectedOption });
      setIsLocked(true);
    } catch (err) {
      console.error('Failed to submit answer', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleLifeline = async (id) => {
    if (gameState?.phase !== 'question_active') return;
    try {
      await api.post(`/arena/matches/${matchId}/lifeline`, { lifeline: id });
    } catch (err) {
      console.error('Lifeline error', err);
    }
  };

  /* ── Loading ── */
  if (loading) return (
    <div className="min-h-screen bg-[#07090D] flex items-center justify-center">
      <div className="flex flex-col items-center gap-5">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-4 border-brand-green/10"></div>
          <div className="absolute inset-0 rounded-full border-4 border-t-brand-green animate-spin"></div>
        </div>
        <p className="text-gray-500 font-semibold tracking-widest text-xs uppercase">Connecting to Arena…</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-[#07090D] flex flex-col items-center justify-center p-6 text-center">
      <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center mb-6 border border-red-500/20">
        <AlertCircle size={36} className="text-red-400" />
      </div>
      <h2 className="text-2xl font-black text-white mb-2">Connection Error</h2>
      <p className="text-gray-500 max-w-sm mb-8 text-sm">{error}</p>
      <button onClick={() => window.location.reload()} className="px-6 py-3 bg-brand-green text-black font-bold rounded-xl">Reconnect</button>
    </div>
  );

  if (!gameState) return null;

  /* ── Finished ── */
  if (gameState.phase === 'finished') return (
    <div className="min-h-screen bg-[#07090D] flex flex-col items-center justify-center p-6 text-center">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/3 left-1/4 w-80 h-80 bg-yellow-400/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-brand-green/5 rounded-full blur-3xl"></div>
      </div>
      <div className="relative z-10 flex flex-col items-center">
        <div className="w-32 h-32 rounded-full bg-yellow-400/10 border border-yellow-400/20 flex items-center justify-center mb-8">
          <Trophy size={60} className="text-yellow-400" />
        </div>
        <h2 className="text-5xl font-black text-white mb-4">Match Over!</h2>
        <p className="text-gray-400 text-lg mb-10 max-w-sm">The arena has closed. Check your dashboard for final results.</p>
        <button onClick={() => navigate('/user/dashboard')} className="px-10 py-4 bg-brand-green text-black font-black text-lg rounded-2xl hover:bg-brand-green/90 transition-all">
          Return to Dashboard
        </button>
      </div>
    </div>
  );

  const { current_question: q, time_left, phase, my_used_lifelines = [], ladder = {}, current_question_index = 0, total_questions = 10, correct_option } = gameState;
  const isActive = phase === 'question_active';
  const isReveal = phase === 'answer_reveal';
  const isWaiting = phase === 'waiting' && !q;
  const fmt = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  const isCorrect = isReveal && selectedOption === correct_option;
  const isWrong   = isReveal && selectedOption && selectedOption !== correct_option;

  const getOptionClass = (opt, idx) => {
    const s = OPTION_STYLES[idx];
    if (isReveal) {
      if (opt === correct_option) return s.correct;
      if (opt === selectedOption) return s.wrong;
      return s.dimmed;
    }
    if (selectedOption === opt) return s.selected;
    if (isActive) return `${s.base} ${s.hover}`;
    return `${s.base} opacity-50`;
  };

  const getLetterClass = (opt, idx) => {
    const s = OPTION_STYLES[idx];
    if (isReveal && opt === correct_option) return 'bg-green-500 text-white border-green-400';
    if (isReveal && opt === selectedOption && opt !== correct_option) return 'bg-red-500/80 text-white border-red-400';
    return selectedOption === opt ? s.letterSelected : s.letter;
  };

  return (
    <div className="min-h-screen bg-[#07090D] text-white flex flex-col" style={{ fontFamily: "'Inter', sans-serif" }}>

      {/* ── Header ── */}
      <header className="sticky top-0 z-20 bg-[#07090D]/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-brand-green/15 flex items-center justify-center">
              <Zap size={16} className="text-brand-green" />
            </div>
            <div>
              <p className="text-sm font-black text-white leading-none">Scholarnnaire Live Arena</p>
              <p className="text-[11px] text-gray-600 mt-0.5">Match {matchId}</p>
            </div>
          </div>

          {/* Timer */}
          <div className={`flex items-center gap-2 px-5 py-2 rounded-full font-mono font-black text-base border-2 transition-all duration-300 ${
            isWaiting                    ? 'border-gray-700 text-gray-600 bg-gray-900/30' :
            (time_left ?? 30) <= 10     ? 'border-red-500 text-red-400 bg-red-500/10 animate-pulse shadow-[0_0_20px_rgba(239,68,68,0.25)]' :
                                          'border-brand-green/50 text-brand-green bg-brand-green/5'
          }`}>
            <Clock size={16} />
            {isWaiting ? 'WAITING' : fmt(time_left ?? 0)}
          </div>
        </div>
      </header>

      {/* Lifeline pause banner */}
      {phase === 'lifeline_paused' && (
        <div className="bg-yellow-500/10 border-b border-yellow-500/20 px-6 py-2.5 flex items-center justify-center gap-2">
          <Star size={14} className="text-yellow-400" />
          <span className="text-yellow-300 font-bold text-xs tracking-widest uppercase">Lifeline Active — Timers Paused</span>
          <Star size={14} className="text-yellow-400" />
        </div>
      )}

      {/* Waiting state */}
      {isWaiting && (
        <div className="flex-1 flex flex-col items-center justify-center gap-6">
          <div className="relative w-28 h-28">
            <div className="absolute inset-0 rounded-full border-4 border-brand-green/10 animate-ping"></div>
            <div className="absolute inset-0 rounded-full border-4 border-brand-green/20"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Clock size={36} className="text-brand-green" />
            </div>
          </div>
          <div className="text-center">
            <h2 className="text-3xl font-black text-white mb-2">Waiting for Admin</h2>
            <p className="text-gray-500">The match will start shortly…</p>
          </div>
        </div>
      )}

      {/* ── Main Game Area ── */}
      {q && (
        <div className="flex-1 flex gap-0">

          {/* Left Panel: Question + Options */}
          <div className="flex-1 flex flex-col px-6 md:px-12 lg:px-16 py-8 max-w-4xl mx-auto w-full">

            {/* Progress + subject */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <span className="text-sm font-black text-brand-green uppercase tracking-widest">
                  Q{(current_question_index) + 1}/{total_questions}
                </span>
                <div className="h-2 w-48 bg-white/5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-brand-green to-emerald-400 rounded-full transition-all duration-700"
                    style={{ width: `${((current_question_index + 1) / total_questions) * 100}%` }}
                  />
                </div>
              </div>
              {q.subject && (
                <span className="text-xs font-bold text-gray-500 bg-white/5 px-4 py-1.5 rounded-full border border-white/5 uppercase tracking-wider">
                  {q.subject}
                </span>
              )}
            </div>

            {/* Question text */}
            <div className="relative rounded-2xl border border-white/8 bg-gradient-to-br from-[#111318] to-[#0D0F14] p-8 md:p-10 mb-8 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-brand-green/3 to-transparent pointer-events-none"></div>
              <h2 className="relative text-2xl md:text-3xl lg:text-4xl font-bold text-white leading-relaxed">
                {q.text}
              </h2>
            </div>

            {/* Result banner */}
            {isReveal && (
              <div className={`flex items-center gap-4 p-4 rounded-2xl border mb-5 transition-all ${
                isCorrect ? 'border-green-500/40 bg-green-500/10' :
                isWrong   ? 'border-red-500/40 bg-red-500/10' :
                             'border-white/10 bg-white/5'
              }`}>
                {isCorrect
                  ? <CheckCircle size={28} className="text-green-400 shrink-0" />
                  : isWrong
                    ? <XCircle size={28} className="text-red-400 shrink-0" />
                    : <AlertCircle size={28} className="text-gray-400 shrink-0" />
                }
                <div>
                  <p className={`font-black text-base ${isCorrect ? 'text-green-400' : isWrong ? 'text-red-400' : 'text-gray-300'}`}>
                    {isCorrect ? '🎉 Correct! You move up the ladder!' : isWrong ? `Incorrect — the answer was ${correct_option}` : `The correct answer was ${correct_option}`}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">Next question coming up…</p>
                </div>
              </div>
            )}

            {/* Options Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {['A','B','C','D'].map((opt, idx) => {
                const key = `option_${opt.toLowerCase()}`;
                const canClick = isActive && !isLocked;
                const cardClass = getOptionClass(opt, idx);
                const letterClass = getLetterClass(opt, idx);
                const isThisCorrect = isReveal && opt === correct_option;
                const isThisWrong   = isReveal && opt === selectedOption && opt !== correct_option;

                return (
                  <button
                    key={opt}
                    onClick={() => handleSelect(opt)}
                    disabled={!canClick}
                    className={`group relative text-left p-5 md:p-6 rounded-2xl border-2 transition-all duration-200 ${cardClass} ${canClick ? 'cursor-pointer active:scale-[0.97]' : 'cursor-default'}`}
                  >
                    <div className="flex items-center gap-5">
                      <span className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-lg shrink-0 border-2 transition-all ${letterClass}`}>
                        {opt}
                      </span>
                      <span className="text-white font-semibold text-lg leading-snug flex-1">{q[key]}</span>
                      {isThisCorrect && <CheckCircle size={24} className="text-green-400 shrink-0" />}
                      {isThisWrong && <XCircle size={24} className="text-red-400 shrink-0" />}
                      {!isReveal && selectedOption === opt && isLocked && <Lock size={18} className="text-gray-300 shrink-0" />}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Lock In Button */}
            {isActive && (
              <button
                onClick={handleLockAnswer}
                disabled={!selectedOption || isLocked || submitting}
                className={`w-full py-5 rounded-2xl font-black text-lg tracking-wide flex items-center justify-center gap-3 transition-all duration-200 mb-8 ${
                  isLocked
                    ? 'bg-white/5 text-gray-500 border border-white/5 cursor-default'
                    : selectedOption
                      ? 'bg-gradient-to-r from-brand-green to-emerald-400 text-black shadow-[0_0_30px_rgba(74,222,128,0.35)] hover:shadow-[0_0_40px_rgba(74,222,128,0.5)] active:scale-[0.98]'
                      : 'bg-white/5 text-gray-600 border border-white/5 cursor-not-allowed'
                }`}
              >
                {isLocked
                  ? <><CheckCircle size={22} /> Answer Locked In</>
                  : submitting
                    ? <><div className="w-5 h-5 border-2 border-current/30 border-t-current rounded-full animate-spin" /> Locking…</>
                    : <><Lock size={22} /> {selectedOption ? `Lock In — Option ${selectedOption}` : 'Select an Answer First'}</>
                }
              </button>
            )}

            {/* ── Lifelines ── */}
            <div>
              <p className="text-xs font-black text-gray-600 uppercase tracking-[0.25em] mb-4">Lifelines</p>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { id: 'phone_scholar', label: 'Phone a Scholar', Icon: Phone,   ring: 'border-blue-500/30 hover:border-blue-400/60',   bg: 'bg-blue-500/10',   iconColor: 'text-blue-400' },
                  { id: 'flip_book',     label: 'Flip a Book',     Icon: BookOpen, ring: 'border-purple-500/30 hover:border-purple-400/60', bg: 'bg-purple-500/10', iconColor: 'text-purple-400' },
                  { id: 'search_net',    label: 'Search the Net',  Icon: Globe,    ring: 'border-orange-500/30 hover:border-orange-400/60', bg: 'bg-orange-500/10', iconColor: 'text-orange-400' },
                ].map(({ id, label, Icon, ring, bg, iconColor }) => {
                  const used = my_used_lifelines?.includes(id);
                  const disabled = !isActive || used || phase === 'lifeline_paused';
                  return (
                    <button
                      key={id}
                      onClick={() => handleLifeline(id)}
                      disabled={disabled}
                      className={`flex flex-col items-center gap-3 py-5 px-3 rounded-2xl border-2 transition-all duration-200 ${
                        used
                          ? 'border-white/5 bg-white/2 opacity-35 cursor-not-allowed'
                          : disabled
                            ? 'border-white/5 bg-white/5 opacity-50 cursor-not-allowed'
                            : `${ring} bg-[#111318] hover:${bg} active:scale-[0.96] cursor-pointer`
                      }`}
                    >
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${used ? 'bg-white/5' : bg}`}>
                        <Icon size={24} className={used ? 'text-gray-700' : iconColor} />
                      </div>
                      <span className={`text-xs font-bold text-center leading-tight ${used ? 'text-gray-700' : 'text-gray-300'}`}>{label}</span>
                      {used && <span className="text-[9px] font-black text-gray-700 uppercase tracking-wider">Used</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* ─ Right Panel: Knowledge Ladder ─ */}
          <div className="hidden lg:flex w-52 shrink-0 border-l border-white/5 flex-col py-6 px-4">
            <p className="text-[10px] font-black text-brand-green uppercase tracking-[0.2em] mb-4 text-center">Knowledge Ladder</p>

            <div className="flex flex-col flex-1 gap-0.5">
              {[11,10,9,8,7,6,5,4,3,2,1].map(rung => {
                const teamsHere = Object.entries(ladder).filter(([, r]) => Number(r) === rung);
                const isTop = rung === 11;
                const active = teamsHere.length > 0;

                return (
                  <div
                    key={rung}
                    className={`flex items-center gap-2 px-2.5 py-2 rounded-lg transition-all duration-500 ${
                      active
                        ? isTop
                          ? 'bg-yellow-400/10 border border-yellow-400/30'
                          : 'bg-brand-green/10 border border-brand-green/25'
                        : 'border border-transparent'
                    }`}
                  >
                    <span className={`text-[10px] font-black w-4 text-right shrink-0 ${active ? (isTop ? 'text-yellow-400' : 'text-brand-green') : 'text-gray-800'}`}>
                      {rung}
                    </span>
                    <span className={`text-[11px] font-semibold flex-1 truncate ${active ? (isTop ? 'text-yellow-300' : 'text-white') : 'text-gray-700'}`}>
                      {RUNG_NAMES[rung]}
                    </span>
                    {active && (
                      <div className="flex gap-0.5 shrink-0">
                        {teamsHere.map(([tid]) => (
                          <div
                            key={tid}
                            className={`w-2.5 h-2.5 rounded-full border ${isTop ? 'bg-yellow-400 border-yellow-300 shadow-[0_0_6px_rgba(250,204,21,0.6)]' : 'bg-brand-green border-brand-green/50 shadow-[0_0_6px_rgba(74,222,128,0.5)]'}`}
                          />
                        ))}
                      </div>
                    )}
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
