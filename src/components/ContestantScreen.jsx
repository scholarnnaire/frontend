import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, BookOpen, Globe, Lock, ShieldAlert, Zap, Pause } from 'lucide-react';
import { useGameState } from '../hooks/useGameState';
import { Scholarpedia } from './Scholarpedia';
import api from '../utils/api';

export function ContestantScreen({ playerId = "player1" }) {
  const { 
    gameState, currentQuestion, rung, inMomentum, inDownfall, 
    lifelines, lifelineLocks, startGame, answerQuestion, useLifeline 
  } = useGameState(playerId);
  
  const [timeLeft, setTimeLeft] = useState(30);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isScholarpediaOpen, setIsScholarpediaOpen] = useState(false);
  const [isGamePaused, setIsGamePaused] = useState(false);

  // Poll for live studio substitution pause state
  useEffect(() => {
    const checkPauseState = async () => {
      try {
        const res = await api.get('/competition/live/substitution-requests');
        const activeSub = res.data.find(r => r.status === 'Approved');
        setIsGamePaused(!!activeSub);
      } catch (err) {
        // fail gracefully
      }
    };
    const interval = setInterval(checkPauseState, 2000);
    return () => clearInterval(interval);
  }, []);

  // Timer logic
  useEffect(() => {
    if (gameState === 'active' && currentQuestion) {
      if (isGamePaused) return; // Frozen! No timer countdown during substitution
      const timerId = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerId);
            if (selectedAnswer === null) {
              answerQuestion(-1); // send timeout
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timerId);
    }
  }, [currentQuestion, gameState, isGamePaused]);

  const handleAnswer = (index) => {
    if (timeLeft > 0 && selectedAnswer === null) {
      setSelectedAnswer(index);
      answerQuestion(index);
    }
  };

  const handleLifeline = (id) => {
    if (lifelines[id] && lifelineLocks[id] === null) {
      if (id === 'flip_a_book') {
        setIsScholarpediaOpen(true);
      }
      useLifeline(id);
    }
  };

  if (!gameState) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-[#0a0b10] text-white font-sans">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/20 via-[#0a0b10] to-[#0a0b10]"></div>
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="z-10 flex flex-col items-center"
        >
          <h1 className="text-6xl font-black mb-12 tracking-tight">Scholarnnaire <span className="text-accent">Arena</span></h1>
          <h2 className="text-2xl text-gray-400 mb-8">Terminal: {playerId === 'player1' ? 'Team Alpha' : 'Team Beta'}</h2>
          <button 
            onClick={startGame}
            className="px-12 py-5 bg-accent hover:bg-accent/90 text-white text-2xl font-bold rounded-2xl shadow-[0_0_40px_rgba(37,99,235,0.4)] transition-all hover:scale-105 active:scale-95"
          >
            ENTER ARENA
          </button>
        </motion.div>
      </div>
    );
  }

  if (gameState === 'finished') {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-[#0a0b10] text-white font-sans">
        <h1 className="text-6xl font-extrabold mb-4 text-accent">Game Over!</h1>
        <h2 className="text-4xl text-gray-300 font-bold">Final Rung: {rung}</h2>
      </div>
    );
  }

  if (!currentQuestion) return <div className="h-screen bg-[#0a0b10]" />;

  // UI State Styles
  let containerStyle = "bg-[#0a0b10] border-gray-800";
  let pulseEffect = null;
  
  if (inMomentum) {
    containerStyle = "bg-blue-950/40 border-blue-500/50";
    pulseEffect = <div className="absolute inset-0 border-[4px] border-blue-500 rounded-3xl animate-pulse pointer-events-none opacity-50"></div>;
  } else if (inDownfall) {
    containerStyle = "bg-red-950/40 border-red-500/50";
    pulseEffect = <div className="absolute inset-0 border-[4px] border-red-500 rounded-3xl animate-pulse pointer-events-none opacity-50"></div>;
  }

  return (
    <div className={`relative flex flex-col items-center justify-between min-h-screen p-4 md:p-8 font-sans bg-[#0a0b10] text-white overflow-hidden`}>
      
      {/* Background ambient glow based on state */}
      <div className={`absolute inset-0 opacity-20 transition-colors duration-1000 ${inMomentum ? 'bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-600 via-[#0a0b10]' : inDownfall ? 'bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-red-600 via-[#0a0b10]' : 'bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-gray-800 via-[#0a0b10]'}`}></div>

      {/* ── GAME PAUSED / SUBSTITUTION IN PROGRESS OVERLAY ── */}
      <AnimatePresence>
        {isGamePaused && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 bg-[#07090e]/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center select-none"
          >
            <div className="w-24 h-24 rounded-3xl bg-amber-500/20 border-2 border-amber-500 flex items-center justify-center mb-6 shadow-[0_0_50px_rgba(245,158,11,0.3)] animate-pulse">
              <Pause className="w-12 h-12 text-amber-400" />
            </div>
            <span className="text-xs uppercase font-black tracking-widest text-amber-400 px-4 py-1.5 bg-amber-950/60 rounded-full border border-amber-500/40 mb-3">
              Official Substitution In Progress
            </span>
            <h2 className="text-3xl md:text-5xl font-black text-white mb-3">
              GAME PAUSED BY MODERATOR
            </h2>
            <p className="text-gray-300 max-w-lg text-sm md:text-base leading-relaxed">
              All active clocks, timers and contestant dashboards are completely frozen. No participant will lose time or be disadvantaged. The game will automatically resume when the substitution is completed.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Info */}
      <div className="w-full flex justify-between items-center z-10 px-4 md:px-8 mb-4">
        <div className="flex items-center gap-4">
          <div className={`px-6 py-3 rounded-xl border font-bold text-xl flex items-center gap-3 backdrop-blur-md transition-colors ${inMomentum ? 'bg-blue-500/20 border-blue-500 text-blue-400' : inDownfall ? 'bg-red-500/20 border-red-500 text-red-400' : 'bg-gray-900 border-gray-700 text-gray-300'}`}>
            {inMomentum && <Zap className="text-blue-400" />}
            {inDownfall && <ShieldAlert className="text-red-400" />}
            Rung {rung}/11
          </div>
        </div>
        
        {/* Timer */}
        <div className="relative w-24 h-24 flex items-center justify-center bg-gray-900/80 backdrop-blur-md rounded-full border-2 border-gray-700 shadow-xl">
           <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="46" fill="none" stroke="currentColor" strokeWidth="8" className="text-gray-800" />
              <circle cx="50" cy="50" r="46" fill="none" stroke="currentColor" strokeWidth="8" className={timeLeft <= 5 ? 'text-red-500' : 'text-accent'} strokeDasharray="289" strokeDashoffset={289 - (289 * timeLeft) / 30} style={{ transition: 'stroke-dashoffset 1s linear' }} />
           </svg>
           <span className={`text-4xl font-black ${timeLeft <= 5 ? 'text-red-500 animate-pulse' : 'text-white'}`}>
             {timeLeft}
           </span>
        </div>
      </div>

      {/* Question Card */}
      <div className={`relative w-full max-w-5xl z-10 p-8 md:p-12 rounded-3xl border ${containerStyle} shadow-2xl backdrop-blur-xl transition-all duration-700`}>
        {pulseEffect}
        
        <div className="flex justify-between items-center mb-6">
          <span className="text-gray-400 font-medium tracking-widest uppercase text-sm">Question {currentQuestion.question_index + 1}</span>
          <span className="bg-gray-800 text-gray-300 px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider">Mathematics</span>
        </div>
        
        <h1 className="text-3xl md:text-5xl font-bold leading-tight mb-8">
          {currentQuestion.question}
        </h1>
        
        {/* Options Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mt-8">
          {currentQuestion.options.map((opt, idx) => {
            const letter = ['A', 'B', 'C', 'D'][idx];
            const isSelected = selectedAnswer === idx;
            const isLocked = selectedAnswer !== null;
            
            return (
              <button 
                key={idx} 
                disabled={isLocked || timeLeft === 0}
                onClick={() => handleAnswer(idx)}
                className={`relative group flex items-center p-6 md:p-8 rounded-2xl border-2 transition-all duration-300 text-left
                  ${isSelected 
                    ? 'bg-accent/20 border-accent scale-[0.98]' 
                    : isLocked 
                      ? 'bg-gray-900/50 border-gray-800 opacity-50' 
                      : 'bg-gray-900 border-gray-700 hover:border-gray-500 hover:bg-gray-800'
                  }
                `}
              >
                <div className={`flex items-center justify-center w-12 h-12 rounded-xl mr-6 font-bold text-xl transition-colors
                  ${isSelected ? 'bg-accent text-white' : 'bg-gray-800 text-gray-400 group-hover:text-white'}
                `}>
                  {letter}
                </div>
                <span className={`text-xl md:text-2xl font-semibold ${isSelected ? 'text-white' : 'text-gray-300 group-hover:text-white'}`}>
                  {opt}
                </span>
                
                {isSelected && (
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute right-6">
                    <Lock className="text-accent" />
                  </motion.div>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Lifelines Footer */}
      <div className="w-full max-w-4xl mt-8 z-10">
        <div className="flex justify-center gap-4 md:gap-8">
          {[
            { id: 'phone_a_scholar', name: 'Phone a Scholar', icon: Phone },
            { id: 'flip_a_book', name: 'Flip a Book', icon: BookOpen },
            { id: 'search_the_net', name: 'Search the Net', icon: Globe }
          ].map((lifeline) => {
            const Icon = lifeline.icon;
            const isAvailable = lifelines[lifeline.id];
            const lockedByOther = lifelineLocks[lifeline.id] !== null && lifelineLocks[lifeline.id] !== playerId;
            
            let btnStateClass = "bg-gray-900 border-gray-700 text-gray-400 hover:bg-gray-800 hover:border-gray-500 hover:text-white";
            let statusText = "Available";
            
            if (!isAvailable) {
              btnStateClass = "bg-gray-900/30 border-gray-800 text-gray-600 opacity-50";
              statusText = "Used";
            } else if (lockedByOther) {
               btnStateClass = "bg-red-950/20 border-red-900/50 text-gray-600 opacity-50";
               statusText = "Locked (Opponent)";
            }
            
            return (
              <button 
                key={lifeline.id}
                disabled={!isAvailable || lockedByOther}
                onClick={() => handleLifeline(lifeline.id)}
                className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all w-32 md:w-40 ${btnStateClass}`}
              >
                <Icon size={28} className="mb-2" />
                <span className="font-bold text-sm text-center leading-tight mb-1">{lifeline.name}</span>
                <span className="text-[10px] uppercase tracking-wider opacity-70">{statusText}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Scholarpedia Modal */}
      <Scholarpedia 
        isOpen={isScholarpediaOpen}
        onClose={() => setIsScholarpediaOpen(false)}
        onTimeUp={() => setIsScholarpediaOpen(false)}
      />
    </div>
  );
}
