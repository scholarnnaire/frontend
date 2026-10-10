import React from 'react';

export function VisionariesCrest({ className = "w-16 h-16", showGlow = true }) {
  return (
    <div className={`relative flex items-center justify-center shrink-0 ${className}`}>
      {showGlow && (
        <div className="absolute inset-0 bg-amber-400/20 rounded-full blur-md"></div>
      )}
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full drop-shadow-[0_4px_10px_rgba(217,119,6,0.35)] relative z-10"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Shield / Circular Outer Badge */}
        <circle cx="50" cy="50" r="46" fill="#0A1224" stroke="url(#goldGradient)" strokeWidth="3.5" />
        <circle cx="50" cy="50" r="41" fill="#0E1E3D" stroke="#D97706" strokeWidth="1" strokeDasharray="3 2" />

        {/* Inner Stars / Accents */}
        <circle cx="50" cy="18" r="2" fill="#FBBF24" />
        <circle cx="32" cy="22" r="1.5" fill="#FBBF24" />
        <circle cx="68" cy="22" r="1.5" fill="#FBBF24" />

        {/* Stylized Golden Eagle Wings & Body */}
        {/* Left Wing */}
        <path
          d="M 50 48 C 42 36, 26 32, 16 38 C 22 46, 30 52, 44 54 C 36 54, 25 50, 18 46 C 24 54, 34 58, 46 58 C 38 60, 28 60, 22 57 C 30 64, 42 63, 50 60 Z"
          fill="url(#goldGradient)"
        />
        {/* Right Wing */}
        <path
          d="M 50 48 C 58 36, 74 32, 84 38 C 78 46, 70 52, 56 54 C 64 54, 75 50, 82 46 C 76 54, 66 58, 54 58 C 62 60, 72 60, 78 57 C 70 64, 58 63, 50 60 Z"
          fill="url(#goldGradient)"
        />

        {/* Eagle Head & Beak */}
        <path
          d="M 47 34 C 47 30, 50 27, 53 27 C 56 27, 58 29, 58 32 C 60 32, 63 34, 61 36 C 58 38, 55 37, 54 39 C 52 42, 48 42, 47 38 Z"
          fill="url(#goldGradientLight)"
        />
        {/* Beak */}
        <path d="M 58 32 L 64 34 L 59 36 Z" fill="#F59E0B" />
        {/* Eye */}
        <circle cx="53" cy="31" r="1" fill="#0A1224" />

        {/* Eagle Breast Shield & Tail */}
        <path
          d="M 45 46 Q 50 42 55 46 L 54 66 L 50 74 L 46 66 Z"
          fill="url(#goldGradientLight)"
        />
        <path
          d="M 48 50 L 52 50 L 51 64 L 49 64 Z"
          fill="#B45309"
        />

        {/* Laurel Wreath at base */}
        <path
          d="M 28 72 C 34 78, 42 81, 50 81 C 58 81, 66 78, 72 72"
          stroke="url(#goldGradient)"
          strokeWidth="2"
          strokeLinecap="round"
        />

        {/* Gradients */}
        <defs>
          <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FDE68A" />
            <stop offset="40%" stopColor="#F59E0B" />
            <stop offset="70%" stopColor="#D97706" />
            <stop offset="100%" stopColor="#92400E" />
          </linearGradient>
          <linearGradient id="goldGradientLight" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFFBEB" />
            <stop offset="50%" stopColor="#FCD34D" />
            <stop offset="100%" stopColor="#F59E0B" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}

export default VisionariesCrest;
