import { useEffect, useRef, useCallback } from 'react';
import { motion, useInView } from 'framer-motion';

function seededRand(seed: number): number {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

function drawRichGarden(ctx: CanvasRenderingContext2D, w: number, h: number, progress: number) {
  ctx.clearRect(0, 0, w, h);

  const isDark = document.documentElement.classList.contains('dark');

  // ── Stage 1: Bare cracked earth (0-0.2) ──
  const earthProgress = Math.min(1, progress / 0.2);

  // Sky gradient
  const skyGrad = ctx.createLinearGradient(0, 0, 0, h * 0.6);
  if (isDark) {
    skyGrad.addColorStop(0, `rgba(2, 8, 23, ${1 - progress * 0.3})`);
    skyGrad.addColorStop(0.7, `rgba(7, 21, 33, ${1 - progress * 0.2})`);
    skyGrad.addColorStop(1, `rgba(11, 35, 46, ${1 - progress * 0.1})`);
  } else {
    skyGrad.addColorStop(0, `rgba(248, 244, 237, ${1 - progress * 0.2})`);
    skyGrad.addColorStop(0.7, `rgba(255, 250, 240, ${1 - progress * 0.15})`);
    skyGrad.addColorStop(1, `rgba(245, 235, 220, ${1 - progress * 0.1})`);
  }
  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, w, h * 0.75);

  const groundY = h * 0.75;

  // Bare earth with cracks
  const earthColor = isDark ? 'rgba(25, 20, 15, 1)' : 'rgba(139, 115, 85, 1)';
  ctx.fillStyle = earthColor;
  ctx.fillRect(0, groundY, w, h - groundY);

  // Draw cracks in bare earth
  if (progress < 0.3) {
    ctx.strokeStyle = isDark ? 'rgba(15, 10, 5, 0.8)' : 'rgba(101, 67, 33, 0.6)';
    ctx.lineWidth = 2;
    for (let i = 0; i < 8; i++) {
      const x = (i / 7) * w + seededRand(i * 13) * 40 - 20;
      const crackLength = 30 + seededRand(i * 17) * 50;
      ctx.beginPath();
      ctx.moveTo(x, groundY + 10);
      ctx.lineTo(x + seededRand(i * 19) * 20 - 10, groundY + crackLength);
      ctx.stroke();
    }
  }

  // ── Stage 2: Grass & wildflowers (0.2-0.4) ──
  if (progress > 0.2) {
    const grassProgress = Math.min(1, (progress - 0.2) / 0.2);

    // Rich grass carpet
    const grassGrad = ctx.createLinearGradient(0, groundY, 0, h);
    if (isDark) {
      grassGrad.addColorStop(0, `rgba(15, 60, 35, ${grassProgress * 0.9})`);
      grassGrad.addColorStop(0.5, `rgba(10, 45, 25, ${grassProgress * 0.7})`);
      grassGrad.addColorStop(1, 'rgba(7, 21, 33, 1)');
    } else {
      grassGrad.addColorStop(0, `rgba(76, 175, 80, ${grassProgress * 0.8})`);
      grassGrad.addColorStop(0.5, `rgba(139, 195, 74, ${grassProgress * 0.6})`);
      grassGrad.addColorStop(1, 'rgba(245, 235, 220, 1)');
    }
    ctx.fillStyle = grassGrad;
    ctx.fillRect(0, groundY, w, h - groundY);

    // Individual grass blades
    for (let i = 0; i < w / 3; i++) {
      const x = i * 3 + seededRand(i * 7) * 6 - 3;
      const height = (12 + seededRand(i * 11) * 18) * grassProgress;
      const sway = Math.sin(Date.now() / 3000 + i * 0.3) * 3;

      ctx.beginPath();
      ctx.moveTo(x, groundY);
      ctx.quadraticCurveTo(x + sway, groundY - height * 0.7, x + sway * 1.2, groundY - height);
      ctx.strokeStyle = isDark
        ? `rgba(30, 120, 60, ${grassProgress * 0.7})`
        : `rgba(56, 142, 60, ${grassProgress * 0.8})`;
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }

    // Wildflowers scattered
    for (let i = 0; i < 25; i++) {
      const x = seededRand(i * 23) * w;
      const y = groundY - seededRand(i * 29) * 15;
      const flowerSize = 3 + seededRand(i * 31) * 4;
      const flowerAlpha = grassProgress * 0.8;

      // Flower colors
      const colors = isDark
        ? ['rgba(255, 193, 7, ', 'rgba(233, 30, 99, ', 'rgba(156, 39, 176, ', 'rgba(63, 81, 181, ']
        : [
            'rgba(255, 235, 59, ',
            'rgba(244, 67, 54, ',
            'rgba(233, 30, 99, ',
            'rgba(103, 58, 183, '
          ];

      const color = colors[Math.floor(seededRand(i * 37) * colors.length)];

      ctx.beginPath();
      ctx.arc(x, y, flowerSize, 0, Math.PI * 2);
      ctx.fillStyle = color + flowerAlpha + ')';
      ctx.fill();

      // Flower center
      ctx.beginPath();
      ctx.arc(x, y, flowerSize * 0.3, 0, Math.PI * 2);
      ctx.fillStyle = isDark ? 'rgba(255, 193, 7, 0.9)' : 'rgba(255, 235, 59, 0.9)';
      ctx.fill();
    }
  }

  // ── Stage 3: Trees with full foliage (0.4-0.6) ──
  if (progress > 0.4) {
    const treeProgress = Math.min(1, (progress - 0.4) / 0.2);

    const trees = [
      { x: w * 0.15, height: 80, width: 60 },
      { x: w * 0.35, height: 100, width: 70 },
      { x: w * 0.65, height: 90, width: 65 },
      { x: w * 0.85, height: 75, width: 55 }
    ];

    trees.forEach((tree, i) => {
      const treeH = tree.height * treeProgress;
      const treeW = tree.width * treeProgress;

      // Tree trunk
      const trunkW = 8;
      ctx.fillStyle = isDark ? 'rgba(101, 67, 33, 0.9)' : 'rgba(121, 85, 72, 0.9)';
      ctx.fillRect(tree.x - trunkW / 2, groundY - treeH * 0.3, trunkW, treeH * 0.3);

      // Lush foliage - multiple layers for depth
      const foliageColors = isDark
        ? ['rgba(34, 139, 34, 0.8)', 'rgba(50, 205, 50, 0.7)', 'rgba(0, 128, 0, 0.9)']
        : ['rgba(76, 175, 80, 0.9)', 'rgba(139, 195, 74, 0.8)', 'rgba(46, 125, 50, 0.85)'];

      foliageColors.forEach((color, layer) => {
        const layerSize = treeW * (1 - layer * 0.15);
        ctx.beginPath();
        ctx.arc(tree.x, groundY - treeH * 0.7, layerSize / 2, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
      });

      // Fruits/flowers on trees
      for (let f = 0; f < 8; f++) {
        const fx = tree.x + (seededRand(i * 100 + f * 13) - 0.5) * treeW * 0.6;
        const fy = groundY - treeH * 0.7 + (seededRand(i * 100 + f * 17) - 0.5) * treeW * 0.4;

        ctx.beginPath();
        ctx.arc(fx, fy, 2 + seededRand(f * 19) * 2, 0, Math.PI * 2);
        ctx.fillStyle = isDark ? 'rgba(255, 193, 7, 0.8)' : 'rgba(255, 87, 34, 0.8)';
        ctx.fill();
      }
    });
  }

  // ── Stage 4: Pathways & more flowers (0.6-0.8) ──
  if (progress > 0.6) {
    const pathProgress = Math.min(1, (progress - 0.6) / 0.2);

    // Winding stone pathway
    const pathY = groundY + 20;
    const pathPoints = [];
    for (let i = 0; i <= 20; i++) {
      const t = i / 20;
      const x = t * w;
      const y = pathY + Math.sin(t * Math.PI * 3) * 25;
      pathPoints.push({ x, y });
    }

    // Draw path
    ctx.strokeStyle = isDark ? 'rgba(169, 169, 169, 0.6)' : 'rgba(158, 158, 158, 0.7)';
    ctx.lineWidth = 25 * pathProgress;
    ctx.lineCap = 'round';
    ctx.beginPath();
    pathPoints.forEach((p, i) => {
      if (i === 0) ctx.moveTo(p.x, p.y);
      else ctx.lineTo(p.x, p.y);
    });
    ctx.stroke();

    // Path stones
    for (let i = 0; i < pathPoints.length - 1; i += 2) {
      const p = pathPoints[i];
      ctx.beginPath();
      ctx.arc(p.x, p.y, 4 + seededRand(i * 41) * 3, 0, Math.PI * 2);
      ctx.fillStyle = isDark ? 'rgba(211, 211, 211, 0.8)' : 'rgba(189, 189, 189, 0.9)';
      ctx.fill();
    }

    // Flower beds along path
    for (let i = 0; i < 40; i++) {
      const t = seededRand(i * 43);
      const pathPoint = pathPoints[Math.floor(t * pathPoints.length)];
      const side = seededRand(i * 47) > 0.5 ? 1 : -1;
      const x = pathPoint.x + side * (30 + seededRand(i * 53) * 20);
      const y = pathPoint.y + (seededRand(i * 59) - 0.5) * 15;

      // Colorful flower clusters
      const clusterColors = isDark
        ? ['rgba(255, 64, 129, 0.9)', 'rgba(124, 77, 255, 0.9)', 'rgba(0, 229, 255, 0.9)']
        : ['rgba(233, 30, 99, 0.9)', 'rgba(156, 39, 176, 0.9)', 'rgba(63, 81, 181, 0.9)'];

      const color = clusterColors[Math.floor(seededRand(i * 61) * clusterColors.length)];

      ctx.beginPath();
      ctx.arc(x, y, 4 + seededRand(i * 67) * 3, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
    }
  }

  // ── Stage 5: Full paradise with butterflies (0.8-1.0) ──
  if (progress > 0.8) {
    const paradiseProgress = Math.min(1, (progress - 0.8) / 0.2);

    // Golden light rays from sky
    const rayAlpha = paradiseProgress * 0.15;
    const centerX = w * 0.5;
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const rayGrad = ctx.createLinearGradient(
        centerX,
        h * 0.1,
        centerX + Math.cos(angle) * w * 0.8,
        h * 0.1 + Math.sin(angle) * h * 0.6
      );
      rayGrad.addColorStop(0, `rgba(255, 215, 0, ${rayAlpha})`);
      rayGrad.addColorStop(1, 'transparent');

      ctx.fillStyle = rayGrad;
      ctx.beginPath();
      ctx.moveTo(centerX, h * 0.1);
      ctx.lineTo(centerX + Math.cos(angle - 0.1) * w, h * 0.7);
      ctx.lineTo(centerX + Math.cos(angle + 0.1) * w, h * 0.7);
      ctx.closePath();
      ctx.fill();
    }

    // Floating butterflies
    const time = Date.now() / 2000;
    for (let i = 0; i < 12; i++) {
      const x = (Math.sin(time * 0.5 + i * 1.3) * 0.4 + 0.5) * w;
      const y = h * (0.3 + i * 0.03) + Math.sin(time * 0.8 + i * 0.7) * 30;

      // Butterfly wings
      const wingColors = isDark
        ? ['rgba(255, 193, 7, 0.8)', 'rgba(255, 64, 129, 0.8)', 'rgba(124, 77, 255, 0.8)']
        : ['rgba(255, 152, 0, 0.9)', 'rgba(233, 30, 99, 0.9)', 'rgba(103, 58, 183, 0.9)'];

      const color = wingColors[i % wingColors.length];

      // Left wing
      ctx.beginPath();
      ctx.ellipse(x - 3, y, 4, 6, Math.sin(time * 3 + i) * 0.3, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();

      // Right wing
      ctx.beginPath();
      ctx.ellipse(x + 3, y, 4, 6, -Math.sin(time * 3 + i) * 0.3, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();

      // Body
      ctx.beginPath();
      ctx.ellipse(x, y, 1, 4, 0, 0, Math.PI * 2);
      ctx.fillStyle = isDark ? 'rgba(101, 67, 33, 0.9)' : 'rgba(62, 39, 35, 0.9)';
      ctx.fill();
    }

    // Sparkling particles
    for (let i = 0; i < 30; i++) {
      const x = seededRand(i * 71 + time * 10) * w;
      const y = seededRand(i * 73 + time * 8) * h * 0.8;
      const sparkle = Math.sin(time * 4 + i * 2) * 0.5 + 0.5;

      ctx.beginPath();
      ctx.arc(x, y, 1 + sparkle * 2, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 215, 0, ${sparkle * paradiseProgress * 0.8})`;
      ctx.fill();
    }
  }
}

export default function QuranGardenSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const progressRef = useRef(0);
  const targetProgressRef = useRef(0);
  const rafRef = useRef<number>(0);
  const inView = useInView(sectionRef, { once: false, amount: 0.1 });

  const animate = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    progressRef.current += (targetProgressRef.current - progressRef.current) * 0.05; // Faster animation response
    drawRichGarden(ctx, canvas.width, canvas.height, progressRef.current);
    rafRef.current = requestAnimationFrame(animate);
  }, []);

  useEffect(() => {
    if (!inView) return;
    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [inView, animate]);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const handleScroll = () => {
      const rect = section.getBoundingClientRect();
      const windowH = window.innerHeight;
      const sectionH = section.offsetHeight;

      // Start animation when section enters viewport
      const sectionTop = rect.top;
      const sectionBottom = rect.bottom;

      // Calculate progress based on how much of the section has been scrolled through
      let progress = 0;
      if (sectionTop <= windowH && sectionBottom >= 0) {
        // Section is in viewport
        const visibleHeight = Math.min(windowH, sectionBottom) - Math.max(0, sectionTop);
        const scrolledPastTop = Math.max(0, windowH - sectionTop);
        progress = Math.min(1, scrolledPastTop / (sectionH * 0.8)); // Complete animation over 80% of section height
      }

      targetProgressRef.current = Math.max(0, Math.min(1, progress));
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);

      // Reset transform so repeated resizes don't accumulate scaling.
      const ctx = canvas.getContext('2d');
      if (ctx) ctx.setTransform(1, 0, 0, 1, 0, 0);

      canvas.width = canvas.offsetWidth * dpr;
      canvas.height = canvas.offsetHeight * dpr;

      if (ctx) ctx.scale(dpr, dpr);
    };

    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, []);

  return (
    <section
      ref={sectionRef}
      style={{
        position: 'relative',
        height: '200vh', // Reduced height for better control
        background: 'var(--background)'
      }}
    >
      <div
        style={{
          position: 'sticky',
          top: 0,
          height: '100vh',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <canvas
          ref={canvasRef}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%'
          }}
        />

        <div
          style={{
            position: 'relative',
            zIndex: 10,
            textAlign: 'center',
            padding: '0 2rem',
            pointerEvents: 'none'
          }}
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ duration: 1.5, delay: 0.5 }}
          >
            <div
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: '12px',
                fontWeight: 500,
                color: 'var(--teal)',
                letterSpacing: '0.25em',
                textTransform: 'uppercase',
                marginBottom: '1.5rem',
                opacity: 0.8,
                textShadow: '0 2px 20px var(--background)'
              }}
            >
              The Quran Garden
            </div>
            <h2
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: 'clamp(36px, 5vw, 64px)',
                fontWeight: 300,
                color: 'var(--foreground)',
                lineHeight: 1.2,
                letterSpacing: '-0.01em',
                marginBottom: '1.25rem',
                textShadow: '0 4px 40px var(--background)'
              }}
            >
              Your relationship with the
              <br />
              <em style={{ fontStyle: 'italic', color: 'var(--teal)' }}>Qur'an becomes visible.</em>
            </h2>
            <p
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: '16px',
                fontWeight: 400,
                color: 'var(--muted-foreground)',
                lineHeight: 1.75,
                maxWidth: '480px',
                margin: '0 auto',
                textShadow: '0 2px 30px var(--background)'
              }}
            >
              Every moment of connection, every verse reflected upon, every prayer offered — watch
              your spiritual relationship flourish into something beautiful.
            </p>
          </motion.div>
        </div>

        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '120px',
            background: 'linear-gradient(to bottom, transparent, var(--background))',
            zIndex: 5,
            pointerEvents: 'none'
          }}
        />
      </div>
    </section>
  );
}
