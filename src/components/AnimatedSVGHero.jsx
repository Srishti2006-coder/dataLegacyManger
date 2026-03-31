import React from 'react';

const AnimatedSVGHero = () => {
  return (
    <div className="svg-hero-container">
      <svg viewBox="0 0 800 600" className="auth-hero-svg">
        {/* Background orbs */}
        <defs>
          <radialGradient id="orb1" cx="20%" cy="20%" r="30%">
            <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.8">
              <animate attributeName="stopOpacity" values="0.8;0.4;0.8" dur="3s" repeatCount="indefinite"/>
            </stop>
            <stop offset="100%" stopColor="#7c3aed" stopOpacity="0.2">
              <animate attributeName="stopOpacity" values="0.2;0.1;0.2" dur="3s" repeatCount="indefinite"/>
            </stop>
          </radialGradient>
          <radialGradient id="orb2" cx="80%" cy="80%" r="25%">
            <stop offset="0%" stopColor="#ec4899">
              <animate attributeName="stopColor" values="#ec4899;#f472b6;#ec4899" dur="4s" repeatCount="indefinite"/>
            </stop>
            <stop offset="100%" stopColor="#10b981" stopOpacity="0.3"/>
          </radialGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge> 
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
          <linearGradient id="vaultGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00ff88">
              <animate attributeName="stopColor" values="#00ff88;#00cc66;#00ff88" dur="2s" repeatCount="indefinite"/>
            </stop>
            <stop offset="50%" stopColor="#4f46e5">
              <animate attributeName="stopColor" values="#4f46e5;#3730a3;#4f46e5" dur="2s" repeatCount="indefinite"/>
            </stop>
            <stop offset="100%" stopColor="#ec4899"/>
          </linearGradient>
        </defs>

        {/* Floating orbs */}
        <circle cx="150" cy="100" r="60" fill="url(#orb1)" filter="url(#glow)">
          <animate attributeName="cy" values="100;80;120;100" dur="8s" repeatCount="indefinite"/>
          <animateTransform attributeName="transform" type="rotate" values="0 150 100;360 150 100" dur="20s" repeatCount="indefinite"/>
        </circle>
        <circle cx="650" cy="500" r="50" fill="url(#orb2)" filter="url(#glow)">
          <animate attributeName="cy" values="500;470;530;500" dur="10s" repeatCount="indefinite"/>
          <animateTransform attributeName="transform" type="rotate" values="0 650 500;-360 650 500" dur="25s" repeatCount="indefinite"/>
        </circle>

        {/* Central vault/lock */}
        <g filter="url(#glow)" transform="translate(400,300)">
          <rect x="-120" y="-80" width="240" height="160" rx="20" fill="url(#vaultGradient)" stroke="#ffffff" strokeWidth="4">
            <animate attributeName="rx" values="20;30;20" dur="3s" repeatCount="indefinite"/>
          </rect>
          <circle cx="0" cy="-20" r="35" fill="#ffffff" stroke="#00ff88" strokeWidth="3">
            <animate attributeName="r" values="35;32;38;35" dur="2s" repeatCount="indefinite"/>
            <animate attributeName="cy" values="-20;-25;-15;-20" dur="2s" repeatCount="indefinite"/>
          </circle>
          {/* Shackle */}
          <path d="M 0 -55 Q 25 -90, 50 -55 Q 25 -20, 0 -55" fill="none" stroke="#ec4899" strokeWidth="8" strokeLinecap="round">
            <animate attributeName="strokeDasharray" values="0 200;200 0" dur="4s" repeatCount="indefinite"/>
          </path>
          {/* Legacy symbol */}
          <text x="0" y="40" textAnchor="middle" fontSize="48" fontFamily="Inter, sans-serif" fontWeight="bold" fill="url(#vaultGradient)" filter="url(#glow)">
            <animate attributeName="opacity" values="1;0.3;1" dur="3s" repeatCount="indefinite"/>
          </text>
        </g>

        {/* Scan lines */}
        <defs>
          <pattern id="scanlines" width="100" height="100" patternUnits="userSpaceOnUse">
            <line x1="0" y1="0" x2="0" y2="100" stroke="#00ff88" strokeOpacity="0.1" strokeWidth="1"/>
            <animateTransform attributeName="patternTransform" type="translate" values="0 0;0 2;0 0" dur="0.1s" repeatCount="indefinite"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#scanlines)" opacity="0.3"/>

        {/* Glitch effect overlay */}
        <rect width="100%" height="100%" fill="none">
          <animate attributeName="pathLength" from="0" to="1" dur="0.5s" repeatCount="indefinite"/>
        </rect>
      </svg>
    </div>
  );
};

export default AnimatedSVGHero;

