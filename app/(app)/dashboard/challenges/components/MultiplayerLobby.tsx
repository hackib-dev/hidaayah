'use client';

import { motion } from 'framer-motion';
import { Users, Crown, Clock, Play, X } from 'lucide-react';
import { MultiplayerGame } from '../types';

interface MultiplayerLobbyProps {
  game: MultiplayerGame;
  isHost: boolean;
  onStart: () => void;
  onCancel: () => void;
}

export function MultiplayerLobby({ game, isHost, onStart, onCancel }: MultiplayerLobbyProps) {
  const readyCount = game.players.filter((p) => p.isReady).length;
  const canStart = isHost && readyCount >= 2;

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-teal-100 dark:bg-teal-900 border border-teal-300 dark:border-teal-700">
          <Users className="w-4 h-4 text-teal-600 dark:text-teal-400" />
          <span className="text-sm font-semibold text-teal-700 dark:text-teal-300">
            {game.circleName}
          </span>
        </div>
        <h2 className="text-2xl font-bold text-foreground">Waiting for Players</h2>
        <p className="text-sm text-muted-foreground">
          {readyCount} of {game.players.length} players ready
        </p>
      </div>

      {/* Game Info */}
      <div className="p-4 rounded-xl bg-secondary border border-border">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Challenge</p>
            <p className="text-sm font-semibold text-foreground capitalize">
              {game.challengeType.replace('_', ' ')}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Difficulty</p>
            <p className="text-sm font-semibold text-foreground capitalize">{game.difficulty}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Questions</p>
            <p className="text-sm font-semibold text-foreground">{game.questionCount}</p>
          </div>
        </div>
      </div>

      {/* Players List */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-foreground">Players</h3>
        <div className="space-y-2">
          {game.players.map((player, index) => (
            <motion.div
              key={player.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="p-4 rounded-xl bg-background border border-border"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center text-white font-semibold">
                    {player.name[0]}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-foreground">{player.name}</span>
                      {player.id === game.hostId && <Crown className="w-4 h-4 text-amber-500" />}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Joined {new Date(player.joinedAt).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
                <div>
                  {player.isReady ? (
                    <span className="px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 text-xs font-semibold">
                      Ready
                    </span>
                  ) : (
                    <span className="px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300 text-xs font-semibold flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Waiting
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={onCancel}
          className="px-6 py-3 rounded-xl bg-secondary border border-border text-foreground hover:bg-secondary/80 transition-colors flex items-center gap-2"
        >
          <X className="w-4 h-4" />
          Cancel
        </button>
        {isHost && (
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={onStart}
            disabled={!canStart}
            className="flex-1 py-3 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-600 text-white font-semibold hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
          >
            <Play className="w-5 h-5" />
            Start Game {!canStart && '(Need 2+ players)'}
          </motion.button>
        )}
      </div>
    </div>
  );
}
