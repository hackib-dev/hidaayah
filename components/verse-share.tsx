'use client';

import { useState } from 'react';
import { Share2, Download, Link as LinkIcon, Check, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface VerseShareProps {
  verseKey: string;
  arabicText: string;
  translation: string;
  surahName: string;
}

export function VerseShare({ verseKey, arabicText, translation, surahName }: VerseShareProps) {
  const [showModal, setShowModal] = useState(false);
  const [copied, setCopied] = useState(false);

  const shareUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/dashboard/quran?verse=${verseKey}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleDownloadImage = () => {
    // Create canvas for image generation
    const canvas = document.createElement('canvas');
    canvas.width = 1200;
    canvas.height = 630;
    const ctx = canvas.getContext('2d');

    if (!ctx) return;

    // Gradient background
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, '#0f766e');
    gradient.addColorStop(1, '#134e4a');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Arabic text
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Wrap Arabic text
    const maxWidth = 1000;
    const words = arabicText.split(' ');
    let line = '';
    let y = 200;

    words.forEach((word) => {
      const testLine = line + word + ' ';
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxWidth && line !== '') {
        ctx.fillText(line, canvas.width / 2, y);
        line = word + ' ';
        y += 60;
      } else {
        line = testLine;
      }
    });
    ctx.fillText(line, canvas.width / 2, y);

    // Translation
    ctx.font = '24px Arial';
    ctx.fillStyle = '#d1fae5';
    y += 80;

    const transWords = translation.split(' ');
    line = '';
    transWords.forEach((word) => {
      const testLine = line + word + ' ';
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxWidth && line !== '') {
        ctx.fillText(line, canvas.width / 2, y);
        line = word + ' ';
        y += 35;
      } else {
        line = testLine;
      }
    });
    ctx.fillText(line, canvas.width / 2, y);

    // Verse reference
    ctx.font = 'bold 28px Arial';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(`${surahName} - ${verseKey}`, canvas.width / 2, canvas.height - 80);

    // App name
    ctx.font = '20px Arial';
    ctx.fillStyle = '#a7f3d0';
    ctx.fillText('Hidaayah', canvas.width / 2, canvas.height - 40);

    // Download
    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `verse-${verseKey.replace(':', '-')}.png`;
      a.click();
      URL.revokeObjectURL(url);
    });
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${surahName} - ${verseKey}`,
          text: `${arabicText}\n\n"${translation}"\n\n${surahName} - ${verseKey}`,
          url: shareUrl
        });
      } catch (err) {
        console.error('Share failed:', err);
      }
    } else {
      setShowModal(true);
    }
  };

  return (
    <>
      <button
        onClick={handleNativeShare}
        className="p-2 rounded-lg hover:bg-secondary transition-colors"
        aria-label="Share verse"
      >
        <Share2 className="w-4 h-4 text-muted-foreground" />
      </button>

      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md p-6 rounded-2xl bg-card border border-border space-y-4"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-foreground">Share Verse</h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-1 rounded-lg hover:bg-secondary transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-2">
                <button
                  onClick={handleCopyLink}
                  className={cn(
                    'w-full flex items-center gap-3 p-4 rounded-xl border transition-colors',
                    copied
                      ? 'bg-primary/10 border-primary text-primary'
                      : 'bg-secondary border-border hover:bg-secondary/80'
                  )}
                >
                  {copied ? <Check className="w-5 h-5" /> : <LinkIcon className="w-5 h-5" />}
                  <span className="font-medium">{copied ? 'Link Copied!' : 'Copy Link'}</span>
                </button>

                <button
                  onClick={handleDownloadImage}
                  className="w-full flex items-center gap-3 p-4 rounded-xl bg-secondary border border-border hover:bg-secondary/80 transition-colors"
                >
                  <Download className="w-5 h-5" />
                  <span className="font-medium">Download Image</span>
                </button>
              </div>

              <p className="text-xs text-muted-foreground text-center">
                Share this verse with others
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
