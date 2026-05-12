'use client';

import { motion } from 'framer-motion';
import type { GardenState } from '../types';

interface GardenCanvasProps {
  garden: GardenState;
}

export function GardenCanvas({ garden }: GardenCanvasProps) {
  return (
    <div className="relative w-full aspect-[2/1] md:h-[400px] rounded-3xl bg-gradient-to-b from-sky-100 to-emerald-50 dark:from-slate-900 dark:to-emerald-950 overflow-hidden border border-border">
      <svg className="w-full h-full" viewBox="0 0 800 400" preserveAspectRatio="xMidYMid meet">
        {/* Ground */}
        <motion.path
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          d="M0,300 Q200,280 400,300 T800,300 L800,400 L0,400 Z"
          fill="url(#groundGradient)"
        />

        {/* Trees */}
        {Array.from({ length: garden.trees }).map((_, i) => {
          const x = 100 + i * 70;
          const y = 250 - i * 5;
          return (
            <motion.g
              key={`tree-${i}`}
              initial={{ scale: 0, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              transition={{ delay: i * 0.2, type: 'spring', stiffness: 100 }}
            >
              {/* Trunk */}
              <rect x={x - 5} y={y} width="10" height="50" fill="#8B4513" rx="2" />
              {/* Leaves */}
              <circle cx={x} cy={y - 10} r="25" fill="#2D5016" opacity="0.8" />
              <circle cx={x - 15} cy={y} r="20" fill="#3A6B1F" opacity="0.9" />
              <circle cx={x + 15} cy={y} r="20" fill="#3A6B1F" opacity="0.9" />
            </motion.g>
          );
        })}

        {/* Flowers - distributed across full width */}
        {Array.from({ length: Math.min(garden.flowers, 30) }).map((_, i) => {
          const x = 50 + (i * 750) / Math.min(garden.flowers, 30);
          const y = 280 + ((i * 37) % 40);
          const colors = ['#FF6B9D', '#FFD93D', '#6BCB77', '#4D96FF', '#FF8C42', '#C77DFF'];
          const color = colors[i % colors.length];
          return (
            <motion.g
              key={`flower-${i}`}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.5 + i * 0.08 }}
            >
              <line x1={x} y1={y} x2={x} y2={y + 15} stroke="#2D5016" strokeWidth="2" />
              <circle cx={x} cy={y} r="4" fill={color} />
              <circle cx={x - 3} cy={y - 2} r="3" fill={color} opacity="0.8" />
              <circle cx={x + 3} cy={y - 2} r="3" fill={color} opacity="0.8" />
              <circle cx={x - 2} cy={y + 3} r="3" fill={color} opacity="0.8" />
              <circle cx={x + 2} cy={y + 3} r="3" fill={color} opacity="0.8" />
            </motion.g>
          );
        })}

        {/* Water feature */}
        {garden.water && (
          <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}>
            <ellipse cx="650" cy="320" rx="80" ry="30" fill="#4A90E2" opacity="0.6" />
            <motion.ellipse
              cx="650"
              cy="320"
              rx="60"
              ry="20"
              fill="#87CEEB"
              opacity="0.4"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ repeat: Infinity, duration: 3 }}
            />
          </motion.g>
        )}

        {/* Gradients */}
        <defs>
          <linearGradient id="groundGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#86C232" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#61892F" stopOpacity="0.9" />
          </linearGradient>
        </defs>
      </svg>

      {/* Level badge */}
      <div className="absolute top-4 right-4 px-4 py-2 rounded-xl bg-background/80 backdrop-blur-sm border border-border">
        <p className="text-xs text-muted-foreground">Garden Level</p>
        <p className="text-2xl font-bold text-primary">{garden.level}</p>
      </div>
    </div>
  );
}
