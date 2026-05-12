'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Move } from 'lucide-react';
import { ChatInterface } from '@/app/(app)/dashboard/companion/components/ChatInterface';

type Position = 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';

export function CompanionOverlay() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState<Position>('bottom-right');

  // Load saved position
  useEffect(() => {
    const saved = localStorage.getItem('companion_position');
    if (saved) setPosition(saved as Position);
  }, []);

  // Hide on companion page
  if (pathname === '/dashboard/companion') {
    return null;
  }

  const savePosition = (pos: Position) => {
    setPosition(pos);
    localStorage.setItem('companion_position', pos);
  };

  const positionClasses = {
    'bottom-right': 'bottom-20 md:bottom-6 right-6',
    'bottom-left': 'bottom-20 md:bottom-6 left-6',
    'top-right': 'top-20 md:top-6 right-6',
    'top-left': 'top-20 md:top-6 left-6'
  };

  const panelPositionClasses = {
    'bottom-right': 'md:bottom-6 md:right-6',
    'bottom-left': 'md:bottom-6 md:left-6',
    'top-right': 'md:top-6 md:right-6',
    'top-left': 'md:top-6 md:left-6'
  };

  return (
    <>
      {/* Floating Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
        className={`fixed z-40 w-14 h-14 rounded-full bg-gradient-to-br from-primary to-teal text-white shadow-lg hover:shadow-xl transition-shadow flex items-center justify-center ${positionClasses[position]}`}
        aria-label="Open AI Companion"
      >
        <MessageCircle className="w-6 h-6" />
      </motion.button>

      {/* Overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            />

            {/* Chat Panel */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className={`fixed inset-4 md:inset-auto md:w-[420px] md:h-[650px] z-50 rounded-2xl bg-background shadow-2xl overflow-hidden ${panelPositionClasses[position]}`}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-border bg-card">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-teal flex items-center justify-center">
                    <MessageCircle className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground text-sm">Quran Companion</h3>
                    <p className="text-xs text-muted-foreground">AI-powered mentor</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {/* Position Selector */}
                  <div className="relative group">
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      className="p-2 rounded-lg hover:bg-secondary transition-colors"
                    >
                      <Move className="w-4 h-4 text-muted-foreground" />
                    </motion.button>
                    <div className="absolute top-full right-0 mt-1 hidden group-hover:block">
                      <div className="p-2 rounded-lg bg-card border border-border shadow-lg space-y-1">
                        <button
                          onClick={() => savePosition('top-left')}
                          className="w-full text-left px-3 py-1.5 text-xs rounded hover:bg-secondary transition-colors"
                        >
                          Top Left
                        </button>
                        <button
                          onClick={() => savePosition('top-right')}
                          className="w-full text-left px-3 py-1.5 text-xs rounded hover:bg-secondary transition-colors"
                        >
                          Top Right
                        </button>
                        <button
                          onClick={() => savePosition('bottom-left')}
                          className="w-full text-left px-3 py-1.5 text-xs rounded hover:bg-secondary transition-colors"
                        >
                          Bottom Left
                        </button>
                        <button
                          onClick={() => savePosition('bottom-right')}
                          className="w-full text-left px-3 py-1.5 text-xs rounded hover:bg-secondary transition-colors"
                        >
                          Bottom Right
                        </button>
                      </div>
                    </div>
                  </div>
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setIsOpen(false)}
                    className="p-2 rounded-lg hover:bg-secondary transition-colors"
                  >
                    <X className="w-5 h-5 text-muted-foreground" />
                  </motion.button>
                </div>
              </div>

              {/* Chat Interface */}
              <div className="h-[calc(100%-73px)]">
                <ChatInterface compact />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
