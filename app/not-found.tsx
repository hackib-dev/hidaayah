import Link from 'next/link';
import { Home, Compass } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="space-y-2">
          <p
            className="text-6xl text-primary/30 font-serif"
            style={{ fontFamily: 'var(--font-arabic)' }}
          >
            ٤٠٤
          </p>
          <h1 className="text-xl font-serif font-bold text-foreground">Page Not Found</h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            The path you seek does not exist. Perhaps the guidance you need lies elsewhere.
          </p>
        </div>

        <div className="flex items-center justify-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-primary to-teal text-white font-semibold text-sm shadow-sm hover:opacity-90 transition-all"
          >
            <Home className="w-4 h-4" />
            <span>Go Home</span>
          </Link>
          <Link
            href="/guidance"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-secondary text-secondary-foreground font-semibold text-sm hover:bg-secondary/80 transition-all"
          >
            <Compass className="w-4 h-4" />
            <span>Seek Guidance</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
