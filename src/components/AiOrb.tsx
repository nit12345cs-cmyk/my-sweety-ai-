import React from 'react';

interface AiOrbProps {
  state?: 'idle' | 'listening' | 'thinking' | 'speaking';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  onClick?: () => void;
  interactive?: boolean;
}

export const AiOrb: React.FC<AiOrbProps> = React.memo(({
  state = 'idle',
  size = 'md',
  onClick,
  interactive = true,
}) => {
  const dimensions =
    size === 'sm'
      ? 'w-10 h-10'
      : size === 'md'
      ? 'w-20 h-20'
      : size === 'lg'
      ? 'w-32 h-32'
      : 'w-48 h-48';

  const coreGlow =
    state === 'listening'
      ? 'bg-gradient-to-tr from-cyan-500 via-emerald-400 to-indigo-500 shadow-[0_0_50px_rgba(6,182,212,0.8)]'
      : state === 'thinking'
      ? 'bg-gradient-to-tr from-purple-600 via-pink-500 to-amber-400 shadow-[0_0_60px_rgba(168,85,247,0.8)] animate-spin'
      : state === 'speaking'
      ? 'bg-gradient-to-tr from-amber-400 via-rose-500 to-cyan-400 shadow-[0_0_60px_rgba(245,158,11,0.8)]'
      : 'bg-gradient-to-tr from-cyan-500 via-indigo-600 to-purple-600 shadow-[0_0_40px_rgba(6,182,212,0.5)]';

  return (
    <div
      onClick={onClick}
      className={`relative flex items-center justify-center cursor-pointer group ${dimensions} transition-all duration-500`}
    >
      {/* Outer Wave Rings */}
      <div className="absolute inset-0 rounded-full border border-cyan-500/30 animate-ping pointer-events-none" />
      <div className="absolute -inset-2 rounded-full border border-purple-500/20 animate-wave-ring pointer-events-none" />

      {/* Orbiting Ring */}
      <div
        className={`absolute -inset-3 rounded-full border border-dashed border-white/20 transition-all duration-700 ${
          state === 'thinking' ? 'animate-spin border-cyan-400/60' : 'group-hover:rotate-180'
        }`}
      />

      {/* Main Glowing Plasma Core */}
      <div
        className={`w-full h-full rounded-full ${coreGlow} relative overflow-hidden backdrop-blur-md transition-all duration-500 ${
          interactive ? 'group-hover:scale-110' : ''
        }`}
      >
        {/* Plasma Waves Inside */}
        <div className="absolute inset-0 bg-radial from-white/40 via-transparent to-black/60 mix-blend-overlay animate-pulse" />
        <div className="absolute -inset-full bg-gradient-to-r from-transparent via-white/20 to-transparent rotate-45 animate-shimmer" />

        {/* Center Specular Reflection */}
        <div className="absolute top-2 left-3 w-1/3 h-1/3 bg-white/50 rounded-full blur-xs pointer-events-none" />
      </div>

      {/* Floating Particles around Orb */}
      <div className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-cyan-300 animate-bounce blur-2xs" />
      <div className="absolute -bottom-2 -left-2 w-2.5 h-2.5 rounded-full bg-purple-400 animate-pulse blur-2xs" />
      <div className="absolute top-1/2 -right-3 w-1.5 h-1.5 rounded-full bg-amber-300 animate-ping blur-2xs" />
    </div>
  );
});
