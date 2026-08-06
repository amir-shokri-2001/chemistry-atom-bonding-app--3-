import React, { useState } from 'react';
import { AtomData } from '../data/atoms';

interface CanvasAtomProps {
  id: string;
  atom: AtomData;
  x: number;
  y: number;
  charge?: number;
  isSelected: boolean;
  onMouseDown: (id: string, e: React.MouseEvent | React.TouchEvent) => void;
  onClick: (id: string) => void;
  showElectrons: boolean;
  freezeElectrons: boolean;
  displayElectronConfig: number[];
}

export default function CanvasAtom({
  id,
  atom,
  x,
  y,
  charge,
  isSelected,
  onMouseDown,
  onClick,
  showElectrons,
  freezeElectrons,
  displayElectronConfig,
}: CanvasAtomProps) {
  const [hovered, setHovered] = useState(false);
  const radius = atom.radius;

  // Use the displayElectronConfig (which changes after bonding) instead of original
  const shellRadii = displayElectronConfig.map((_, i) => radius + 14 + i * 14);

  const chargeStr = charge
    ? charge > 0
      ? `${charge > 1 ? charge : ''}+`
      : `${charge < -1 ? Math.abs(charge) : ''}−`
    : null;

  // Check if electrons changed from original
  const originalTotal = atom.electronConfig.reduce((s, c) => s + c, 0);
  const currentTotal = displayElectronConfig.reduce((s, c) => s + c, 0);
  const hasChanged = originalTotal !== currentTotal;

  return (
    <g
      transform={`translate(${x}, ${y})`}
      onMouseDown={(e) => {
        e.stopPropagation();
        onMouseDown(id, e);
      }}
      onTouchStart={(e) => {
        e.stopPropagation();
        onMouseDown(id, e);
      }}
      onClick={(e) => {
        e.stopPropagation();
        onClick(id);
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="cursor-grab active:cursor-grabbing"
      style={{
        filter: isSelected
          ? 'drop-shadow(0 0 12px rgba(59,130,246,0.8))'
          : hovered
          ? 'drop-shadow(0 0 8px rgba(255,255,255,0.4))'
          : 'none',
      }}
    >
      {/* Electron shells - using displayElectronConfig */}
      {showElectrons &&
        displayElectronConfig.map((electrons, shellIndex) => {
          if (electrons <= 0) return null;
          const shellR = shellRadii[shellIndex];
          const animClass = freezeElectrons
            ? ''
            : shellIndex % 2 === 0 ? 'electron-orbit' : 'electron-orbit-reverse';
          return (
            <g key={shellIndex} className={animClass}>
              {/* Shell ring */}
              <circle
                cx={0}
                cy={0}
                r={shellR}
                fill="none"
                stroke={hasChanged ? 'rgba(250,204,21,0.2)' : 'rgba(255,255,255,0.15)'}
                strokeWidth={1}
                strokeDasharray="4 4"
              />
              {/* Electrons on this shell */}
              {Array.from({ length: electrons }).map((_, eIdx) => {
                const angle = (2 * Math.PI * eIdx) / electrons;
                const ex = shellR * Math.cos(angle);
                const ey = shellR * Math.sin(angle);
                return (
                  <circle
                    key={eIdx}
                    cx={ex}
                    cy={ey}
                    r={3.5}
                    fill="#60A5FA"
                    stroke="#93C5FD"
                    strokeWidth={1}
                  />
                );
              })}
            </g>
          );
        })}

      {/* Selection ring */}
      {isSelected && (
        <circle
          cx={0}
          cy={0}
          r={radius + 6}
          fill="none"
          stroke="#3B82F6"
          strokeWidth={2.5}
          strokeDasharray="6 3"
          className="electron-orbit"
        />
      )}

      {/* Atom body */}
      <defs>
        <radialGradient id={`grad-${id}`} cx="35%" cy="35%">
          <stop offset="0%" stopColor="white" stopOpacity="0.4" />
          <stop offset="50%" stopColor={atom.color} stopOpacity="0.9" />
          <stop offset="100%" stopColor={atom.color} stopOpacity="1" />
        </radialGradient>
      </defs>
      <circle
        cx={0}
        cy={0}
        r={radius}
        fill={`url(#grad-${id})`}
        stroke={isSelected ? '#3B82F6' : hasChanged ? 'rgba(250,204,21,0.5)' : 'rgba(255,255,255,0.3)'}
        strokeWidth={isSelected ? 2.5 : hasChanged ? 2 : 1}
      />

      {/* Nucleus highlight dots */}
      <circle cx={-3} cy={-3} r={4} fill="rgba(255,255,255,0.25)" />
      <circle cx={3} cy={2} r={2.5} fill="rgba(255,255,255,0.15)" />

      {/* Symbol */}
      <text
        x={0}
        y={charge ? -2 : 2}
        textAnchor="middle"
        dominantBaseline="middle"
        fill="white"
        fontWeight="bold"
        fontSize={radius * 0.65}
        style={{ textShadow: '0 1px 3px rgba(0,0,0,0.8)' }}
      >
        {atom.symbol}
      </text>

      {/* Electron count badge */}
      {showElectrons && (
        <text
          x={0}
          y={charge ? radius * 0.5 : radius * 0.55}
          textAnchor="middle"
          dominantBaseline="middle"
          fill={hasChanged ? 'rgba(250,204,21,0.8)' : 'rgba(255,255,255,0.5)'}
          fontSize={8}
          fontFamily="monospace"
        >
          {currentTotal}e⁻
        </text>
      )}

      {/* Charge label */}
      {chargeStr && (
        <g>
          <circle
            cx={radius * 0.75}
            cy={-radius * 0.75}
            r={12}
            fill={charge! > 0 ? '#EF4444' : '#3B82F6'}
            stroke="white"
            strokeWidth={1.5}
          />
          <text
            x={radius * 0.75}
            y={-radius * 0.75}
            textAnchor="middle"
            dominantBaseline="central"
            fill="white"
            fontWeight="bold"
            fontSize={12}
          >
            {chargeStr}
          </text>
        </g>
      )}

      {/* Hover tooltip */}
      {hovered && (
        <g>
          <rect
            x={-70}
            y={-radius - 52}
            width={140}
            height={42}
            rx={8}
            fill="rgba(0,0,0,0.9)"
            stroke="rgba(255,255,255,0.2)"
            strokeWidth={1}
          />
          <text
            x={0}
            y={-radius - 36}
            textAnchor="middle"
            fill="white"
            fontSize={11}
            fontFamily="Vazirmatn, sans-serif"
          >
            {atom.nameFa} ({atom.name})
          </text>
          <text
            x={0}
            y={-radius - 20}
            textAnchor="middle"
            fill={hasChanged ? '#FBBF24' : '#9CA3AF'}
            fontSize={9}
            fontFamily="monospace"
          >
            e⁻: [{displayElectronConfig.join(',')}]
            {hasChanged && ` ← [${atom.electronConfig.join(',')}]`}
          </text>
        </g>
      )}
    </g>
  );
}
