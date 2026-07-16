import React, { useState } from 'react';

interface CampusLogoProps {
  className?: string;
  animate?: boolean;
}

export default function CampusLogo({ className = "w-8 h-8", animate = true }: CampusLogoProps) {
  const [imgFailed, setImgFailed] = useState(false);

  if (!imgFailed) {
    return (
      <img 
        src="/images/app.logo.png" 
        alt="App Logo" 
        className={`${className} object-contain inline-block shrink-0`}
        onError={() => setImgFailed(true)}
      />
    );
  }

  return (
    <svg 
      className={`${className} overflow-visible`} 
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="campus-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#6366F1" /> {/* Indigo */}
          <stop offset="50%" stopColor="#8B5CF6" /> {/* Violet/Purple */}
          <stop offset="100%" stopColor="#3B82F6" /> {/* Blue */}
        </linearGradient>
        <filter id="campus-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>
      
      {/* Outer segmented ring */}
      <circle 
        cx="50" 
        cy="50" 
        r="44" 
        stroke="url(#campus-gradient)" 
        strokeWidth="3" 
        strokeDasharray="12 6 4 6" 
        className={`opacity-40 ${animate ? 'animate-[spin_20s_linear_infinite]' : ''}`}
        style={{ transformOrigin: 'center' }}
      />
      
      {/* Inner glowing orbit */}
      <circle 
        cx="50" 
        cy="50" 
        r="37" 
        stroke="url(#campus-gradient)" 
        strokeWidth="1.5" 
        className={`opacity-70 ${animate ? 'animate-[spin_10s_linear_infinite_reverse]' : ''}`}
        style={{ transformOrigin: 'center' }}
      />

      {/* Graduation Cap Combined with AI Circuit nodes */}
      {/* Cap Diamond Top */}
      <path 
        d="M50 24 L82 38 L50 52 L18 38 Z" 
        fill="url(#campus-gradient)" 
        filter="url(#campus-glow)"
        className="drop-shadow-md"
      />
      
      {/* Highlight on top face */}
      <path 
        d="M50 26 L78 38 L50 50 L22 38 Z" 
        fill="white" 
        className="opacity-15"
      />
      
      {/* Cap Support Neck */}
      <path 
        d="M32 44.5 V52 C32 58 40 61 50 61 C60 61 68 58 68 52 V44.5" 
        stroke="url(#campus-gradient)" 
        strokeWidth="3.5" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        className="drop-shadow-sm"
      />
      
      {/* Tassel cord and fringe */}
      <path 
        d="M50 38 L25 45.5 V56" 
        stroke="#FFFFFF" 
        strokeWidth="2" 
        strokeLinecap="round"
        strokeLinejoin="round"
        className="opacity-90 shadow-sm"
      />
      
      {/* Center cap node */}
      <circle cx="50" cy="38" r="3" fill="#FFFFFF" className="shadow-xs" />
      
      {/* Bottom glowing anchor node */}
      <circle 
        cx="50" 
        cy="61" 
        r="4" 
        fill="url(#campus-gradient)" 
        filter="url(#campus-glow)" 
      />
      <circle cx="50" cy="61" r="2.5" fill="#FFFFFF" />

      {/* Digital floating data pixels */}
      <rect x="26" y="28" width="3" height="3" rx="0.5" fill="#8B5CF6" className="opacity-80 animate-pulse" />
      <rect x="71" y="28" width="3" height="3" rx="0.5" fill="#3B82F6" className="opacity-80 animate-pulse" />
      <circle cx="50" cy="74" r="3" fill="url(#campus-gradient)" />
      
      {/* Vertical connection link to dashboard */}
      <path 
        d="M50 65 V71" 
        stroke="url(#campus-gradient)" 
        strokeWidth="1.5" 
        strokeDasharray="2 2"
        className="opacity-60"
      />
    </svg>
  );
}
