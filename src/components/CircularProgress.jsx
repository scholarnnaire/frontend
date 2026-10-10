import React from 'react';

export function CircularProgress({
  value = 4,
  total = 4,
  label = "Qualified Members",
  color = "emerald", // 'emerald', 'blue', 'amber'
  size = 80,
  strokeWidth = 7
}) {
  const percentage = total > 0 ? (value / total) * 100 : 0;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const colorStyles = {
    emerald: {
      stroke: "#10B981",
      trail: "#E2E8F0",
      text: "#0F172A",
      dot: "bg-emerald-500"
    },
    blue: {
      stroke: "#2563EB",
      trail: "#E2E8F0",
      text: "#0F172A",
      dot: "bg-blue-600"
    },
    amber: {
      stroke: "#F59E0B",
      trail: "#E2E8F0",
      text: "#0F172A",
      dot: "bg-amber-500"
    }
  }[color] || {
    stroke: "#2563EB",
    trail: "#E2E8F0",
    text: "#0F172A",
    dot: "bg-blue-500"
  };

  return (
    <div className="flex flex-col items-center justify-center text-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={colorStyles.trail}
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={colorStyles.stroke}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        {/* Inner Text */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-sm font-extrabold text-slate-800">
            {value}/{total}
          </span>
        </div>
      </div>
      <span className="text-[11px] font-semibold text-slate-600 mt-2 leading-tight max-w-[90px]">
        {label}
      </span>
    </div>
  );
}

export default CircularProgress;
