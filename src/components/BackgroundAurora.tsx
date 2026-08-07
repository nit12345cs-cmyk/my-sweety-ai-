import React, { useEffect, useState } from 'react';

export const BackgroundAurora: React.FC = () => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    let animationFrameId: number | null = null;

    const handleMouseMove = (e: MouseEvent) => {
      if (animationFrameId !== null) return;

      animationFrameId = requestAnimationFrame(() => {
        setMousePos({
          x: (e.clientX / window.innerWidth) * 100,
          y: (e.clientY / window.innerHeight) * 100,
        });
        animationFrameId = null;
      });
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 bg-[#030307]">
      {/* Animated Aurora Wave Layer 1 */}
      <div
        className="absolute -top-[40%] -left-[20%] w-[140%] h-[140%] opacity-40 blur-[120px] animate-aurora"
        style={{
          background:
            'radial-gradient(circle at 50% 50%, rgba(6, 182, 212, 0.25), rgba(168, 85, 247, 0.2), rgba(15, 23, 42, 0))',
        }}
      />

      {/* Animated Aurora Wave Layer 2 */}
      <div
        className="absolute -bottom-[30%] -right-[20%] w-[120%] h-[120%] opacity-30 blur-[100px] animate-pulse-slow"
        style={{
          background:
            'radial-gradient(circle at 50% 50%, rgba(245, 158, 11, 0.2), rgba(99, 102, 241, 0.25), rgba(3, 3, 7, 0))',
        }}
      />

      {/* Mouse Reactive Ambient Glow Pod */}
      <div
        className="absolute w-[500px] h-[500px] rounded-full blur-[140px] opacity-25 transition-all duration-700 ease-out pointer-events-none"
        style={{
          left: `${mousePos.x}%`,
          top: `${mousePos.y}%`,
          transform: 'translate(-50%, -50%)',
          background:
            'radial-gradient(circle, rgba(56, 189, 248, 0.4) 0%, rgba(192, 132, 252, 0.25) 50%, transparent 80%)',
        }}
      />

      {/* Mesh Grid Pattern Overlay */}
      <div className="absolute inset-0 bg-grid-pattern opacity-15" />

      {/* Soft Noise Texture Overlay for High-End Glass Look */}
      <div className="absolute inset-0 bg-dot-pattern opacity-20 mix-blend-overlay" />
    </div>
  );
};
