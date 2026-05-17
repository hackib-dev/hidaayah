'use client';

import { useEffect, useState } from 'react';

const LIGHT_RULES = [
  { label: 'Qalqalah', color: '#DD6B12', desc: 'Echoing bounce' },
  { label: 'Ghunnah', color: '#22AA00', desc: 'Nasalisation (2 counts)' },
  { label: 'Idghām (ghunnah)', color: '#22AA00', desc: 'Merging with nasalisation' },
  { label: 'Idghām (no ghunnah)', color: '#22AA00', desc: 'Merging without nasalisation' },
  { label: 'Idghām Shafawī', color: '#58B800', desc: 'Lip merging' },
  { label: 'Idghām Mutajānisayn', color: '#BBAA00', desc: 'Same-type letter merging' },
  { label: 'Idghām Mutaqāribayn', color: '#BBAA00', desc: 'Similar-type letter merging' },
  { label: 'Ikhfāʾ', color: '#C040C0', desc: 'Concealment of nūn/tanwīn' },
  { label: 'Ikhfāʾ Shafawī', color: '#E040D0', desc: 'Concealment of mīm' },
  { label: 'Iqlab', color: '#26BFFD', desc: 'Conversion (nūn → mīm)' },
  { label: 'Iẓhār', color: '#CC2222', desc: 'Clear pronunciation' },
  { label: 'Iẓhār Shafawī', color: '#EE3333', desc: 'Clear mīm pronunciation' },
  { label: 'Iẓhār Qamarī', color: '#4488EE', desc: 'Lunar lām — clear lām' },
  { label: 'Madd Normal', color: '#537FFF', desc: 'Natural elongation (2 counts)' },
  { label: 'Madd Permissible', color: '#7090FF', desc: 'Permissible elongation (2–6)' },
  { label: 'Madd Obligatory', color: '#4466DD', desc: 'Obligatory elongation (6)' },
  { label: 'Madd Necessary', color: '#5577EE', desc: 'Necessary elongation (6)' },
  { label: 'Silent / Hamzat Waṣl', color: '#888888', desc: 'Connecting hamza / silent letter' },
];

const DARK_RULES = [
  { label: 'Qalqalah', color: '#DD6B12', desc: 'Echoing bounce' },
  { label: 'Ghunnah', color: '#22AA00', desc: 'Nasalisation (2 counts)' },
  { label: 'Idghām (ghunnah)', color: '#22AA00', desc: 'Merging with nasalisation' },
  { label: 'Idghām (no ghunnah)', color: '#22AA00', desc: 'Merging without nasalisation' },
  { label: 'Idghām Shafawī', color: '#58B800', desc: 'Lip merging' },
  { label: 'Idghām Mutajānisayn', color: '#BBAA00', desc: 'Same-type letter merging' },
  { label: 'Idghām Mutaqāribayn', color: '#BBAA00', desc: 'Similar-type letter merging' },
  { label: 'Ikhfāʾ', color: '#C040C0', desc: 'Concealment of nūn/tanwīn' },
  { label: 'Ikhfāʾ Shafawī', color: '#E040D0', desc: 'Concealment of mīm' },
  { label: 'Iqlab', color: '#26BFFD', desc: 'Conversion (nūn → mīm)' },
  { label: 'Iẓhār', color: '#FF5555', desc: 'Clear pronunciation' },
  { label: 'Iẓhār Shafawī', color: '#FF6666', desc: 'Clear mīm pronunciation' },
  { label: 'Iẓhār Qamarī', color: '#6699FF', desc: 'Lunar lām — clear lām' },
  { label: 'Madd Normal', color: '#7799FF', desc: 'Natural elongation (2 counts)' },
  { label: 'Madd Permissible', color: '#88AAFF', desc: 'Permissible elongation (2–6)' },
  { label: 'Madd Obligatory', color: '#6688EE', desc: 'Obligatory elongation (6)' },
  { label: 'Madd Necessary', color: '#7799FF', desc: 'Necessary elongation (6)' },
  { label: 'Silent / Hamzat Waṣl', color: '#AAAAAA', desc: 'Connecting hamza / silent letter' },
];

export function TajweedLegend() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const check = () => setIsDark(document.documentElement.classList.contains('dark'));
    check();
    const observer = new MutationObserver(check);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  const rules = isDark ? DARK_RULES : LIGHT_RULES;

  return (
    <div className="rounded-2xl border border-border bg-card p-3 space-y-2">
      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
        Tajweed Key
      </p>
      <div className="flex flex-col gap-1.5">
        {rules.map((rule) => (
          <div key={rule.label} className="flex items-start gap-2">
            <span
              className="mt-0.75 h-2.5 w-2.5 shrink-0 rounded-full"
              style={{ background: rule.color }}
            />
            <div className="min-w-0">
              <span className="text-[10px] font-semibold text-foreground leading-tight block">
                {rule.label}
              </span>
              <span className="text-[9px] text-muted-foreground leading-tight block">
                {rule.desc}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
