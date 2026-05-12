'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, Lightbulb, Brain, Languages } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Challenge } from '../types';
import { transliterateToArabic, compareArabicText } from '../utils/transliteration';

interface CompleteAyahProps {
  challenge: Challenge;
  onComplete: (correct: boolean, timeSpent: number) => void;
}

export function CompleteAyah({ challenge, onComplete }: CompleteAyahProps) {
  const [userAnswer, setUserAnswer] = useState('');
  const [arabicPreview, setArabicPreview] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [startTime] = useState(Date.now());

  useEffect(() => {
    setArabicPreview(transliterateToArabic(userAnswer));
  }, [userAnswer]);

  const handleSubmit = () => {
    const timeSpent = Math.floor((Date.now() - startTime) / 1000);
    const finalAnswer = arabicPreview || userAnswer;
    const correct = compareArabicText(finalAnswer, challenge.answer);
    setIsCorrect(correct);
    setSubmitted(true);
    setTimeout(() => onComplete(correct, timeSpent), 2500);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="space-y-6"
    >
      {/* Challenge Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-950 dark:to-purple-950 border border-violet-200 dark:border-violet-800 p-8">
        <div className="absolute top-0 right-0 w-64 h-64 bg-violet-200/20 dark:bg-violet-800/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

        <div className="relative space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-100 dark:bg-violet-900 border border-violet-300 dark:border-violet-700">
              <Brain className="w-4 h-4 text-violet-600 dark:text-violet-400" />
              <span className="text-xs font-semibold text-violet-700 dark:text-violet-300">
                Complete the Ayah
              </span>
            </div>
            <span className="text-xs text-violet-600 dark:text-violet-400 font-medium">
              {challenge.verseKey}
            </span>
          </div>

          <div className="space-y-3">
            <p className="text-sm text-violet-700 dark:text-violet-300 font-medium">
              Fill in the missing part
            </p>
            <p
              className="text-3xl text-right leading-loose text-foreground"
              style={{ fontFamily: 'var(--font-arabic)' }}
            >
              {challenge.question}
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs text-violet-600 dark:text-violet-400">
            <span className="px-2 py-1 rounded-md bg-violet-100 dark:bg-violet-900">
              {challenge.surahName}
            </span>
            <span className="px-2 py-1 rounded-md bg-violet-100 dark:bg-violet-900 capitalize">
              {challenge.difficulty}
            </span>
          </div>
        </div>
      </div>

      {/* Hint */}
      <AnimatePresence>
        {showHint && challenge.hint && !submitted && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800">
              <div className="flex items-start gap-3">
                <Lightbulb className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5" />
                <div>
                  <p className="text-xs font-semibold text-amber-700 dark:text-amber-300 mb-1">
                    Hint
                  </p>
                  <p className="text-sm text-amber-600 dark:text-amber-400">{challenge.hint}</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input Area */}
      <div className="space-y-3">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Languages className="w-3.5 h-3.5" />
            <span>Type in Arabic or transliteration (e.g., "bismillah" → "بسم الله")</span>
          </div>
          <input
            type="text"
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            disabled={submitted}
            placeholder="Type your answer..."
            className="w-full p-4 rounded-xl bg-background border-2 border-border text-foreground text-lg placeholder:text-muted-foreground/60 focus:outline-none focus:border-violet-500 disabled:opacity-50 transition-colors"
          />
          {arabicPreview && arabicPreview !== userAnswer && (
            <div className="p-3 rounded-lg bg-violet-50 dark:bg-violet-950 border border-violet-200 dark:border-violet-800">
              <p className="text-xs text-violet-600 dark:text-violet-400 mb-1">Arabic preview:</p>
              <p
                className="text-xl text-right text-foreground"
                style={{ fontFamily: 'var(--font-arabic)' }}
              >
                {arabicPreview}
              </p>
            </div>
          )}
        </div>

        {!submitted ? (
          <div className="flex gap-2">
            {challenge.hint && !showHint && (
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowHint(true)}
                className="px-4 py-3 rounded-xl bg-secondary border border-border text-foreground hover:bg-secondary/80 transition-colors flex items-center gap-2"
              >
                <Lightbulb className="w-4 h-4" />
                <span className="text-sm font-medium">Show Hint</span>
              </motion.button>
            )}
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleSubmit}
              disabled={!userAnswer.trim()}
              className="flex-1 py-3 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 text-white font-semibold hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              Submit Answer
            </motion.button>
          </div>
        ) : (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={`p-6 rounded-2xl ${
              isCorrect
                ? 'bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-950 dark:to-green-950 border-2 border-emerald-300 dark:border-emerald-700'
                : 'bg-gradient-to-br from-rose-50 to-pink-50 dark:from-rose-950 dark:to-pink-950 border-2 border-rose-300 dark:border-rose-700'
            }`}
          >
            <div className="flex items-start gap-4">
              <div
                className={`p-3 rounded-full ${
                  isCorrect ? 'bg-emerald-100 dark:bg-emerald-900' : 'bg-rose-100 dark:bg-rose-900'
                }`}
              >
                {isCorrect ? (
                  <Check className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                ) : (
                  <X className="w-6 h-6 text-rose-600 dark:text-rose-400" />
                )}
              </div>
              <div className="flex-1 space-y-2">
                <p
                  className={`text-lg font-bold ${
                    isCorrect
                      ? 'text-emerald-700 dark:text-emerald-300'
                      : 'text-rose-700 dark:text-rose-300'
                  }`}
                >
                  {isCorrect ? "Masha'Allah! Correct!" : 'Not quite right'}
                </p>
                {!isCorrect && (
                  <div className="space-y-2">
                    <p className="text-sm text-rose-600 dark:text-rose-400">
                      The correct answer is:
                    </p>
                    <p
                      className="text-xl text-right p-3 rounded-lg bg-background/50 border border-border text-foreground"
                      style={{ fontFamily: 'var(--font-arabic)' }}
                    >
                      {challenge.answer}
                    </p>
                  </div>
                )}
                {isCorrect && (
                  <p className="text-sm text-emerald-600 dark:text-emerald-400">
                    Your garden grows stronger with each correct answer 🌱
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
