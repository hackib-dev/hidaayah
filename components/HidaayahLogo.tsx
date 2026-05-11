import { useId } from 'react';

interface HidaayahLogoProps {
  variant?: 'light' | 'dark';
  iconOnly?: boolean;
  size?: number;
}

export default function HidaayahLogo({
  variant = 'light',
  iconOnly = false,
  size = 36
}: HidaayahLogoProps) {
  const maskId = useId();

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 36 36"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <defs>
          <mask id={maskId}>
            <rect width="36" height="36" fill="white" />
            <circle cx="24" cy="14" r="13" fill="black" />
          </mask>
        </defs>
        {/* Half-moon crescent — uses --primary which adjusts per mode */}
        <circle cx="18" cy="18" r="15" fill="var(--primary)" mask={`url(#${maskId})`} />
        {/* Star dot */}
        <circle cx="30" cy="7" r="2.5" fill="var(--primary)" />
      </svg>

      {!iconOnly && (
        <span
          style={{
            fontFamily: 'var(--font-serif)',
            fontWeight: 700,
            fontSize: size * 0.67,
            // --foreground switches automatically between light/dark mode
            color: 'var(--foreground)',
            letterSpacing: '0.5px',
            lineHeight: 1,
            userSelect: 'none'
          }}
        >
          Hidaayah
        </span>
      )}
    </div>
  );
}
