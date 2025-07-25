import React, { useState, useEffect } from "react";

export default function FlowingWave() {
  const [time, setTime] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTime((t) => t + 0.02);
    }, 16); // ~60fps
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full h-screen bg-black overflow-hidden relative">
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 1200 800"
        className="absolute inset-0"
      >
        <defs>
          <linearGradient id="waveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#f19700" />
            <stop offset="50%" stopColor="#862c87" />
            <stop offset="100%" stopColor="#0078c1" />
          </linearGradient>
        </defs>

        <g>
          {Array.from({ length: 60 }, (_, i) => {
            const startX = 1200;
            const endX = 0;

            // Smooth vertical start and end Y to avoid originating from one point
            const verticalSpacing = 6; // tighter spacing
            const startY = 100 + i * verticalSpacing;
            const endY = 400 + i * verticalSpacing;

            let pathData = `M ${startX} ${startY}`;

            for (let step = 0; step <= 100; step++) {
              const progress = step / 100;
              const x = startX - startX * progress;
              const baseY = startY + (endY - startY) * progress;

              // Make waveStrength more peaky at the center
              const waveStrength = Math.pow(Math.sin(progress * Math.PI), 1.8);

              const wave1 =
                Math.sin(progress * Math.PI * 2.5 + i * 0.1 + time) *
                65 * // stronger
                waveStrength;
              const wave2 =
                Math.cos(progress * Math.PI * 1.8 + i * 0.12 + time * 0.7) *
                45 * // stronger
                waveStrength;

              const y = baseY + wave1 + wave2;
              pathData += ` L ${x} ${y}`;
            }

            return (
              <path
                key={i}
                d={pathData}
                fill="none"
                stroke="url(#waveGradient)"
                strokeWidth="1.6"
                opacity={0.5 - i * 0.006}
                strokeLinecap="round"
              />
            );
          })}
        </g>
      </svg>
    </div>
  );
}
