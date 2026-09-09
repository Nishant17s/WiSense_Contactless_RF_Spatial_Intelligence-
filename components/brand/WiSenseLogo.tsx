'use client';

import React from 'react';

interface WiSenseLogoProps {
  variant?: 'full' | 'icon' | 'mark' | 'compact';
  themeMode?: 'light' | 'dark' | 'auto';
  className?: string;
  size?: number;
}

export function WiSenseLogo({
  variant = 'full',
  themeMode = 'auto',
  className = '',
  size = 40,
}: WiSenseLogoProps) {
  // Exact WiSense Brand Palette from official reference:
  // Lime: #B5D04D, Olive: #535E25, Lavender: #7D7897
  const limeColor = '#B5D04D';
  const oliveColor = '#535E25';
  const lavenderColor = '#7D7897';

  // The WiSense Icon Geometry:
  // 1. Central Dot (Head): #B5D04D
  // 2. Central Capsule (Torso): #535E25
  // 3. Inner Signal Wave Arcs: #B5D04D
  // 4. Outer Signal Wave Arcs: #7D7897
  const iconSvg = (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="flex-shrink-0"
    >
      {/* Outer RF Waves (Spatial Lavender) */}
      <path
        d="M 16 64 C 12 50 18 36 28 26"
        stroke={lavenderColor}
        strokeWidth="6"
        strokeLinecap="round"
      />
      <path
        d="M 84 64 C 88 50 82 36 72 26"
        stroke={lavenderColor}
        strokeWidth="6"
        strokeLinecap="round"
      />
      <path
        d="M 22 74 C 38 88 62 88 78 74"
        stroke={lavenderColor}
        strokeWidth="6"
        strokeLinecap="round"
      />

      {/* Inner RF Waves (Signal Lime) */}
      <path
        d="M 30 58 C 26 48 30 38 38 30"
        stroke={limeColor}
        strokeWidth="6"
        strokeLinecap="round"
      />
      <path
        d="M 70 58 C 74 48 70 38 62 30"
        stroke={limeColor}
        strokeWidth="6"
        strokeLinecap="round"
      />

      {/* Central Person / Sensing Core */}
      {/* Head Dot */}
      <circle cx="50" cy="22" r="8" fill={limeColor} />
      {/* Torso Capsule */}
      <rect x="44" y="36" width="12" height="28" rx="6" fill={oliveColor} />
    </svg>
  );

  if (variant === 'icon' || variant === 'mark') {
    return <div className={`inline-flex items-center justify-center ${className}`}>{iconSvg}</div>;
  }

  if (variant === 'compact') {
    return (
      <div className={`inline-flex items-center space-x-2.5 ${className}`}>
        {iconSvg}
        <div className="flex flex-col">
          <span className="font-brand font-bold text-xl tracking-tight leading-none text-slate-900 dark:text-white">
            WiSense
          </span>
          <span className="font-mono text-[9px] font-medium tracking-wider text-brand-lavender uppercase mt-0.5">
            Wi-Fi CSI • Edge AI
          </span>
        </div>
      </div>
    );
  }

  // Full Brand Lockup
  return (
    <div className={`inline-flex items-center space-x-3.5 ${className}`}>
      {iconSvg}
      <div className="flex flex-col">
        <div className="flex items-center space-x-2">
          <span className="font-brand font-bold text-2xl tracking-tight leading-none text-slate-900 dark:text-white">
            WiSense
          </span>
          <span className="px-1.5 py-0.5 rounded-full text-[9px] font-mono font-bold bg-brand-lime/15 text-brand-olive dark:text-brand-lime border border-brand-lime/30">
            CSI v2.4
          </span>
        </div>
        <span className="text-[9.5px] font-sans font-bold tracking-[0.16em] uppercase text-slate-600 dark:text-brand-gray mt-1 leading-none">
          CONTACTLESS RF SPATIAL INTELLIGENCE
        </span>
        <span className="text-[9px] font-mono font-semibold tracking-wider text-brand-lavender mt-0.5 leading-none">
          Wi-Fi CSI • Edge AI
        </span>
      </div>
    </div>
  );
}
