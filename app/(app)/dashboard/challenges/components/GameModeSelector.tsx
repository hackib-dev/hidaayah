'use client';

import { motion } from 'framer-motion';
import { User, Users } from 'lucide-react';
import { GameMode } from '../types';

interface GameModeSelectorProps {
  onSelect: (mode: GameMode) => void;
}

export function GameModeSelector({ onSelect }: GameModeSelectorProps) {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-foreground">Choose Game Mode</h2>
        <p className="text-sm text-muted-foreground">Play solo or challenge your circle members</p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onSelect('solo')}
          className="p-8 rounded-2xl bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-950 dark:to-purple-950 hover:shadow-xl transition-all"
        >
          <div className="flex flex-col items-center gap-4">
            <div className="p-4 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600">
              <User className="w-8 h-8 text-white" strokeWidth={1.5} />
            </div>
            <div className="text-center">
              <h3 className="text-xl font-bold text-foreground mb-2">Solo Mode</h3>
              <p className="text-sm text-muted-foreground">
                Practice at your own pace and improve your skills
              </p>
            </div>
          </div>
        </motion.button>

        <motion.button
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onSelect('multiplayer')}
          className="p-8 rounded-2xl bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-teal-950 dark:to-cyan-950 hover:shadow-xl transition-all"
        >
          <div className="flex flex-col items-center gap-4">
            <div className="p-4 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600">
              <Users className="w-8 h-8 text-white" strokeWidth={1.5} />
            </div>
            <div className="text-center">
              <h3 className="text-xl font-bold text-foreground mb-2">Multiplayer</h3>
              <p className="text-sm text-muted-foreground">
                Compete with circle members in real-time
              </p>
            </div>
          </div>
        </motion.button>
      </div>
    </div>
  );
}
