'use client';

import { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { Cloud, Zap, Sunrise, Moon, Wind, Sparkles, ArrowRight, Mic, MicOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const emotions = [
  {
    id: 'anxious',
    label: 'Anxious',
    icon: Cloud,
    color: 'bg-violet-muted text-violet border-violet/20',
    activeColor: 'bg-violet text-white border-violet'
  },
  {
    id: 'grateful',
    label: 'Grateful',
    icon: Sunrise,
    color: 'bg-gold-muted text-accent border-accent/20',
    activeColor: 'bg-accent text-accent-foreground border-accent'
  },
  {
    id: 'lost',
    label: 'Lost',
    icon: Wind,
    color: 'bg-secondary text-muted-foreground border-border',
    activeColor: 'bg-primary text-primary-foreground border-primary'
  },
  {
    id: 'hopeful',
    label: 'Hopeful',
    icon: Sparkles,
    color: 'bg-teal-muted text-teal border-teal/20',
    activeColor: 'bg-teal text-white border-teal'
  },
  {
    id: 'struggling',
    label: 'Struggling',
    icon: Zap,
    color: 'bg-rose-muted text-rose border-rose/20',
    activeColor: 'bg-rose text-white border-rose'
  },
  {
    id: 'peaceful',
    label: 'Peaceful',
    icon: Moon,
    color: 'bg-gold-muted text-accent border-accent/20',
    activeColor: 'bg-accent text-accent-foreground border-accent'
  }
];

// Web Speech API type declarations
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
}
interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}
interface SpeechRecognitionInstance extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  onresult: ((e: SpeechRecognitionEvent) => void) | null;
  onerror: ((e: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognitionInstance;
    webkitSpeechRecognition: new () => SpeechRecognitionInstance;
  }
}

interface EmotionInputProps {
  onSubmit: (data: { emotion: string; situation: string }) => void;
}

export function EmotionInput({ onSubmit }: EmotionInputProps) {
  const [selectedEmotion, setSelectedEmotion] = useState<string | null>(null);
  const [situation, setSituation] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);

  useEffect(() => {
    const supported = !!(window.SpeechRecognition || window.webkitSpeechRecognition);
    setSpeechSupported(supported);
  }, []);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    let finalTranscript = situation;

    recognition.onresult = (e: SpeechRecognitionEvent) => {
      let interim = '';
      for (let i = e.results.length - 1; i >= 0; i--) {
        if (e.results[i].isFinal) {
          finalTranscript += e.results[i][0].transcript;
        } else {
          interim = e.results[i][0].transcript;
        }
      }
      setSituation(finalTranscript + interim);
    };

    recognition.onerror = () => {
      setIsListening(false);
    };

    recognition.onend = () => {
      setSituation(finalTranscript);
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  };

  const handleSubmit = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    }
    if (selectedEmotion || situation.trim()) {
      onSubmit({ emotion: selectedEmotion || '', situation: situation.trim() });
    }
  };

  const canSubmit = !!(selectedEmotion || situation.trim());

  return (
    <div className="w-full max-w-xl mx-auto space-y-4">
      {/* Main Input */}
      <motion.div
        animate={{
          borderColor: isListening
            ? 'oklch(0.40 0.12 185 / 0.8)'
            : isFocused
              ? 'oklch(0.40 0.12 185 / 0.5)'
              : 'oklch(0.90 0.006 85)',
          boxShadow: isListening
            ? '0 0 0 3px oklch(0.40 0.12 185 / 0.15)'
            : isFocused
              ? '0 0 0 3px oklch(0.40 0.12 185 / 0.08)'
              : 'none'
        }}
        transition={{ duration: 0.2 }}
        className="relative rounded-2xl bg-card border overflow-hidden"
      >
        <textarea
          value={situation}
          onChange={(e) => setSituation(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={
            isListening
              ? 'Listening... speak now'
              : "What's on your heart today? Share your feelings, situation, or what you're going through..."
          }
          className="w-full min-h-[100px] md:min-h-[110px] p-4 pb-14 bg-transparent rounded-2xl text-foreground text-sm md:text-base placeholder:text-muted-foreground/60 resize-none focus:outline-none leading-relaxed"
        />

        {/* Bottom Actions */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {speechSupported && (
              <motion.button
                whileTap={{ scale: 0.92 }}
                onClick={toggleListening}
                type="button"
                className={cn(
                  'flex items-center gap-1.5 px-3 py-2 rounded-xl transition-colors text-sm font-semibold touch-target',
                  isListening
                    ? 'bg-primary/15 text-primary'
                    : 'hover:bg-secondary text-muted-foreground hover:text-foreground'
                )}
                aria-label={isListening ? 'Stop listening' : 'Start voice input'}
              >
                <AnimatePresence mode="wait" initial={false}>
                  {isListening ? (
                    <motion.span
                      key="on"
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.8, opacity: 0 }}
                      className="flex items-center gap-1.5"
                    >
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ repeat: Infinity, duration: 1 }}
                      >
                        <MicOff className="w-4 h-4" />
                      </motion.div>
                      <span className="text-xs">Stop</span>
                    </motion.span>
                  ) : (
                    <motion.span
                      key="off"
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.8, opacity: 0 }}
                      className="flex items-center gap-1.5"
                    >
                      <Mic className="w-4 h-4" />
                      <span className="text-xs">Speak</span>
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>
            )}

            {/* Listening pulse indicator */}
            <AnimatePresence>
              {isListening && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="flex items-center gap-1"
                >
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      className="w-1 rounded-full bg-primary"
                      animate={{ height: ['6px', '14px', '6px'] }}
                      transition={{
                        repeat: Infinity,
                        duration: 0.8,
                        delay: i * 0.15,
                        ease: 'easeInOut'
                      }}
                    />
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <motion.button
            whileTap={{ scale: canSubmit ? 0.95 : 1 }}
            onClick={handleSubmit}
            disabled={!canSubmit}
            className={cn(
              'flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200',
              canSubmit
                ? 'bg-primary text-primary-foreground shadow-sm hover:opacity-90'
                : 'bg-muted text-muted-foreground cursor-not-allowed'
            )}
          >
            <span>Seek Guidance</span>
            <ArrowRight className="w-4 h-4" />
          </motion.button>
        </div>
      </motion.div>

      {/* Emotion Chips */}
      <div className="space-y-2.5">
        <p className="text-xs md:text-sm text-muted-foreground font-medium px-1">
          Or select how you&apos;re feeling:
        </p>
        <div className="flex flex-wrap gap-2">
          {emotions.map((emotion, index) => {
            const Icon = emotion.icon;
            const isSelected = selectedEmotion === emotion.id;
            return (
              <motion.button
                key={emotion.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                whileTap={{ scale: 0.93 }}
                onClick={() => setSelectedEmotion(isSelected ? null : emotion.id)}
                className={cn(
                  'flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-sm font-semibold border transition-all duration-200 touch-target',
                  isSelected ? emotion.activeColor : emotion.color
                )}
              >
                <Icon className={cn('w-4 h-4', isSelected && 'animate-bounce-subtle')} />
                <span>{emotion.label}</span>
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
