import React from 'react';
import { motion } from 'framer-motion';
import { useViewerState } from '../hooks/useViewerState';
import { Zap, ShieldAlert } from 'lucide-react';

export function LadderBoard() {
  const { playerStates } = useViewerState("ladder");

  const rungs = [
    { level: 11, label: "₦5,000,000", color: "text-yellow-400 font-black" },
    { level: 10, label: "₦2,500,000", color: "text-gray-300 font-bold" },
    { level: 9, label: "₦1,000,000", color: "text-gray-300 font-bold" },
    { level: 8, label: "₦500,000", color: "text-gray-400" },
    { level: 7, label: "₦250,000", color: "text-gray-400" },
    { level: 6, label: "₦100,000", color: "text-gray-300 font-bold" },
    { level: 5, label: "₦50,000", color: "text-gray-500" },
    { level: 4, label: "₦25,000", color: "text-gray-500" },
    { level: 3, label: "₦10,000", color: "text-gray-500" },
    { level: 2, label: "₦5,000", color: "text-gray-500" },
    { level: 1, label: "₦0", color: "text-gray-600" },
  ];

  // Helper to render a player avatar
  const PlayerAvatar = ({ player, name, bgClass, glowClass }) => {
    // 0 is bottom (index 10 in our array), 11 is top (index 0)
    // We can map rung 0-11 to vertical percentage for positioning
    const verticalPos = `${(player.rung / 11) * 100}%`;
    
    let stateEffects = "";
    let Icon = null;
    if (player.in_momentum) {
      stateEffects = "ring-4 ring-blue-500 shadow-[0_0_30px_rgba(59,130,246,1)] scale-110";
      Icon = <Zap className="absolute -top-6 -right-6 text-blue-400" size={32} />;
    } else if (player.in_downfall) {
      stateEffects = "ring-4 ring-red-500 shadow-[0_0_30px_rgba(239,68,68,1)] grayscale";
      Icon = <ShieldAlert className="absolute -top-6 -right-6 text-red-500" size={32} />;
    }

    return (
      <motion.div
        className="absolute left-1/2 -translate-x-1/2 z-20"
        animate={{ bottom: verticalPos }}
        transition={{ type: "spring", stiffness: 60, damping: 15 }}
      >
        <div className={`relative w-20 h-20 rounded-full flex items-center justify-center font-bold text-xl text-white ${bgClass} ${stateEffects} transition-all duration-300`}>
          {name}
          {Icon}
        </div>
      </motion.div>
    );
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-[#0a0b10] text-white font-sans overflow-hidden relative">
      {/* Dynamic Backgrounds based on state */}
      {playerStates.player1.in_momentum && <div className="absolute inset-0 bg-blue-900/10 pointer-events-none transition-opacity duration-1000"></div>}
      {playerStates.player2.in_momentum && <div className="absolute inset-0 bg-blue-900/10 pointer-events-none transition-opacity duration-1000"></div>}
      
      <h1 className="absolute top-8 text-4xl md:text-5xl font-black uppercase tracking-widest text-accent drop-shadow-[0_0_15px_rgba(37,99,235,0.8)] z-30">
        Knowledge Ladder
      </h1>

      <div className="flex w-full max-w-6xl h-[75vh] justify-between items-end px-4 md:px-12 mt-20 relative">
        
        {/* The Rungs (Background Lines) */}
        <div className="absolute inset-y-0 left-0 right-0 flex flex-col justify-between pointer-events-none pb-10">
          {rungs.map((rung) => (
            <div key={rung.level} className="w-full flex items-center h-0 relative">
              <div className="w-24 md:w-48 text-right pr-4 shrink-0">
                <span className={`text-sm md:text-xl ${rung.color}`}>{rung.label}</span>
              </div>
              <div className="flex-1 border-t-2 border-dashed border-gray-700 opacity-50 shadow-[0_0_10px_rgba(255,255,255,0.1)]"></div>
              <div className="w-24 md:w-48 text-left pl-4 shrink-0">
                <span className={`text-sm md:text-xl ${rung.color}`}>{rung.label}</span>
              </div>
            </div>
          ))}
          {/* Base Level (Rung 0) */}
          <div className="w-full flex items-center h-0 relative">
             <div className="w-24 md:w-48 text-right pr-4 shrink-0"><span className="text-gray-700 text-sm">START</span></div>
             <div className="flex-1 border-t-4 border-solid border-gray-800"></div>
             <div className="w-24 md:w-48 text-left pl-4 shrink-0"><span className="text-gray-700 text-sm">START</span></div>
          </div>
        </div>

        {/* Player 1 Track */}
        <div className="w-1/3 relative h-full flex flex-col items-center">
           {/* Pillar */}
           <div className="absolute top-0 bottom-10 w-24 bg-gradient-to-t from-gray-900 to-gray-800 rounded-t-3xl border-x-2 border-t-2 border-gray-700 shadow-2xl"></div>
           <PlayerAvatar 
             player={playerStates.player1} 
             name="T1" 
             bgClass="bg-gradient-to-br from-cyan-400 to-blue-600" 
           />
           <h2 className="absolute bottom-0 text-2xl font-black text-cyan-400 tracking-widest drop-shadow-[0_0_10px_rgba(34,211,238,0.8)]">TEAM A</h2>
        </div>

        {/* Player 2 Track */}
        <div className="w-1/3 relative h-full flex flex-col items-center">
           {/* Pillar */}
           <div className="absolute top-0 bottom-10 w-24 bg-gradient-to-t from-gray-900 to-gray-800 rounded-t-3xl border-x-2 border-t-2 border-gray-700 shadow-2xl"></div>
           <PlayerAvatar 
             player={playerStates.player2} 
             name="T2" 
             bgClass="bg-gradient-to-br from-pink-400 to-purple-600" 
           />
           <h2 className="absolute bottom-0 text-2xl font-black text-pink-400 tracking-widest drop-shadow-[0_0_10px_rgba(244,114,182,0.8)]">TEAM B</h2>
        </div>

      </div>
    </div>
  );
}
