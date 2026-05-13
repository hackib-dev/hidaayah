'use client';

import { cn } from '@/lib/utils';
import { BookOpen, BookText, Layers, FileText, Mic } from 'lucide-react';
import { motion } from 'framer-motion';
import type { RecitationFormat } from '@/types/recitation';

interface FormatOption {
  id: RecitationFormat;
  label: string;
  sublabel: string;
  icon: React.ElementType;
}

const FORMAT_OPTIONS: FormatOption[] = [
  { id: 'surah', label: 'Surah', sublabel: '114 chapters', icon: BookText },
  { id: 'juz', label: 'Juz', sublabel: '30 parts', icon: Layers },
  { id: 'hizb', label: 'Hizb', sublabel: '60 sections', icon: BookOpen },
  { id: 'page', label: 'Page', sublabel: '604 pages', icon: FileText },
  { id: 'reciters', label: 'Reciters', sublabel: 'All reciters', icon: Mic }
];

interface RecitationFormatSelectorProps {
  value: RecitationFormat;
  onChange: (format: RecitationFormat) => void;
}

export function RecitationFormatSelector({ value, onChange }: RecitationFormatSelectorProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
      {FORMAT_OPTIONS.map((opt) => {
        const Icon = opt.icon;
        const isActive = value === opt.id;
        return (
          <motion.button
            key={opt.id}
            whileTap={{ scale: 0.95 }}
            onClick={() => onChange(opt.id)}
            className={cn(
              'flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-all duration-200 shrink-0 border',
              isActive
                ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                : 'bg-card text-muted-foreground border-border hover:text-foreground hover:border-primary/30'
            )}
          >
            <Icon className="w-3.5 h-3.5" />
            <span>{opt.label}</span>
            {isActive && (
              <span className="text-[10px] opacity-75 hidden sm:inline">{opt.sublabel}</span>
            )}
          </motion.button>
        );
      })}
    </div>
  );
}
