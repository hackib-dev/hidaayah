'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import * as THREE from 'three';

// ── Particle shaders ─────────────────────────────────────────────────────────

const PARTICLE_VERTEX = `
  uniform float uTime;
  uniform float uSize;
  attribute float aScale;
  attribute vec3 aColor;
  varying vec3 vColor;
  varying float vAlpha;

  void main() {
    vColor = aColor;
    vec4 modelPosition = modelMatrix * vec4(position, 1.0);

    float wave  = sin(uTime * 0.35 + position.x * 0.6 + position.z * 0.4) * 0.06;
    float drift = cos(uTime * 0.25 + position.y * 0.5 + position.z * 0.3) * 0.04;
    modelPosition.y += wave;
    modelPosition.x += drift;

    vec4 viewPosition = viewMatrix * modelPosition;
    gl_Position = projectionMatrix * viewPosition;

    gl_PointSize = uSize * aScale * (1.0 / -viewPosition.z);
    gl_PointSize = clamp(gl_PointSize, 0.5, 18.0);

    vAlpha = 0.3 + 0.7 * (1.0 - smoothstep(4.0, 10.0, length(position)));
  }
`;

const PARTICLE_FRAGMENT = `
  uniform float uAlphaScale;
  varying vec3 vColor;
  varying float vAlpha;

  void main() {
    vec2 uv = gl_PointCoord - vec2(0.5);
    float dist = length(uv);
    float inner = 1.0 - smoothstep(0.0, 0.25, dist);
    float outer = 1.0 - smoothstep(0.15, 0.5, dist);
    float alpha = inner * 0.9 + outer * 0.2;
    alpha *= vAlpha * uAlphaScale;
    if (dist > 0.5) discard;
    gl_FragColor = vec4(vColor, alpha);
  }
`;

function HeroCtaButton({ text, isPrimary }: { text: string; isPrimary: boolean }) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('auth_token');
      setIsAuthenticated(!!token);
    };
    checkAuth();
    window.addEventListener('storage', checkAuth);
    return () => window.removeEventListener('storage', checkAuth);
  }, []);

  const handleClick = () => {
    router.push(isAuthenticated ? '/dashboard' : '/signup');
  };

  return (
    <motion.button
      onClick={handleClick}
      whileHover={{
        scale: 1.03,
        boxShadow: isPrimary ? '0 0 40px rgba(15,194,176,0.3)' : '0 0 0 1px rgba(15,194,176,0.4)'
      }}
      whileTap={{ scale: 0.97 }}
      className={`rounded-full px-9 py-4 text-[15px] tracking-[0.02em] transition-colors ${
        isPrimary
          ? 'font-medium text-white shadow-[0_0_30px_rgba(15,194,176,0.2)]'
          : 'font-normal border border-border text-foreground bg-transparent hover:bg-primary/5'
      }`}
      style={{
        fontFamily: "'Inter', sans-serif",
        background: isPrimary ? 'linear-gradient(135deg, #0B6B5C 0%, #0FC2B0 100%)' : undefined
      }}
    >
      {text}
    </motion.button>
  );
}

// ── Particle system builder ───────────────────────────────────────────────────

function buildParticleSystem(count: number, isDark: boolean) {
  const positions = new Float32Array(count * 3);
  const scales = new Float32Array(count);
  const colors = new Float32Array(count * 3);

  // Dark: mostly ivory/white stars with accent specks — matches original design
  // Light: mostly mid-tone teal/gold dots so they're visible on the cream background
  const emerald = new THREE.Color(isDark ? '#10B981' : '#0A7A63');
  const gold = new THREE.Color(isDark ? '#F59E0B' : '#A06F20');
  const ivory = new THREE.Color(isDark ? '#FDFAF5' : '#8BA8A0');
  const teal = new THREE.Color(isDark ? '#0D9488' : '#0B7B72');

  for (let i = 0; i < count; i++) {
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    const r = 2.5 + Math.random() * 8;

    positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    positions[i * 3 + 2] = r * Math.cos(phi);

    scales[i] = Math.random() * 3 + 0.8;

    const rand = Math.random();
    let c = ivory;
    if (rand < 0.12) c = emerald;
    else if (rand < 0.2) c = gold;
    else if (rand < 0.27) c = teal;

    colors[i * 3] = c.r;
    colors[i * 3 + 1] = c.g;
    colors[i * 3 + 2] = c.b;
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geo.setAttribute('aScale', new THREE.BufferAttribute(scales, 1));
  geo.setAttribute('aColor', new THREE.BufferAttribute(colors, 3));

  const alphaScale = isDark ? 1.0 : 0.5;

  const mat = new THREE.ShaderMaterial({
    vertexShader: PARTICLE_VERTEX,
    fragmentShader: PARTICLE_FRAGMENT,
    uniforms: {
      uTime: { value: 0 },
      uSize: { value: 28 },
      uAlphaScale: { value: alphaScale }
    },
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    vertexColors: true
  });

  return new THREE.Points(geo, mat);
}

// ── Main component ────────────────────────────────────────────────────────────

export default function HeroSection() {
  const [ready, setReady] = useState(false);
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const t = setTimeout(() => setReady(true), 150);
    return () => clearTimeout(t);
  }, []);

  // Three.js particle background
  useEffect(() => {
    const el = mountRef.current;
    if (!el) return;

    // ── Scene ──────────────────────────────────────────────────────────────
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(65, el.clientWidth / el.clientHeight, 0.1, 100);
    camera.position.set(0, 0, 6);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(el.clientWidth, el.clientHeight);
    renderer.setClearColor(0x000000, 0);
    el.appendChild(renderer.domElement);

    const isDark = document.documentElement.classList.contains('dark');
    const particles = buildParticleSystem(1800, isDark);
    scene.add(particles);

    // ── Mouse parallax ─────────────────────────────────────────────────────
    const mouse = { x: 0, y: 0 };
    const camTgt = { x: 0, y: 0 };
    const onMouseMove = (e: MouseEvent) => {
      mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener('mousemove', onMouseMove);

    // ── Resize ─────────────────────────────────────────────────────────────
    const onResize = () => {
      if (!el) return;
      camera.aspect = el.clientWidth / el.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(el.clientWidth, el.clientHeight);
    };
    window.addEventListener('resize', onResize);

    // ── Animate ────────────────────────────────────────────────────────────
    let rafId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      rafId = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();

      (particles.material as THREE.ShaderMaterial).uniforms.uTime.value = t;

      // Smooth camera parallax
      camTgt.x += (mouse.x * 0.5 - camTgt.x) * 0.04;
      camTgt.y += (mouse.y * 0.3 - camTgt.y) * 0.04;
      camera.position.x = camTgt.x;
      camera.position.y = camTgt.y;
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('resize', onResize);
      renderer.dispose();
      if (el.contains(renderer.domElement)) el.removeChild(renderer.domElement);
    };
  }, []);

  const ease = [0.22, 1, 0.36, 1] as const;

  return (
    <section className="relative flex h-screen min-h-[700px] w-full flex-col items-center justify-center overflow-hidden bg-background">
      {/* Particles */}
      <div ref={mountRef} className="pointer-events-none absolute inset-0 z-0" aria-hidden="true" />

      {/* Ambient glow */}
      <div
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          background:
            'radial-gradient(ellipse 70% 60% at 50% 50%, rgba(15,194,176,0.04) 0%, rgba(212,168,79,0.02) 45%, transparent 70%)'
        }}
      />

      {/* Content */}
      <div className="relative z-10 flex max-w-[820px] flex-col items-center px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={ready ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.1, ease }}
          className="mb-5 flex items-center gap-3"
        >
          <div className="h-px w-8 bg-teal opacity-60" />
          <span
            className="text-[11px] font-medium uppercase tracking-[0.3em] text-teal"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            Hidaayah
          </span>
          <div className="h-px w-8 bg-teal opacity-60" />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 28 }}
          animate={ready ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 1.0, delay: 0.2, ease }}
          className="mb-6 text-[clamp(48px,7vw,88px)] font-extralight leading-[1.06] tracking-[-0.02em] text-foreground"
          style={{ fontFamily: "'Cormorant Garamond', serif" }}
        >
          Guided,{' '}
          <em
            className="italic"
            style={{
              background: 'linear-gradient(135deg, #0FC2B0 0%, #0B6B5C 50%, #D4A84F 100%)',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              color: '#0FC2B0'
            }}
          >
            by the Qur&apos;an.
          </em>
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={ready ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.35, ease }}
          className="mb-7"
        >
          <div
            dir="rtl"
            className="text-[20px] leading-loose text-gold"
            style={{
              fontFamily: "'Amiri', serif",
              opacity: 0.85,
              textShadow: '0 0 30px rgba(212,168,79,0.25)'
            }}
          >
            ذَٰلِكَ الْكِتَابُ لَا رَيْبَ ۛ فِيهِ ۛ هُدًى لِّلْمُتَّقِينَ
          </div>
          <div
            className="mt-1.5 text-[11px] font-light tracking-[0.15em] text-muted-foreground"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            Al-Baqarah 2:2
          </div>
        </motion.div>

        <motion.div
          initial={{ scaleX: 0, opacity: 0 }}
          animate={ready ? { scaleX: 1, opacity: 1 } : {}}
          transition={{ duration: 1.0, delay: 0.45, ease }}
          className="mb-7 h-px w-16 origin-center"
          style={{ background: 'linear-gradient(90deg, transparent, var(--teal), transparent)' }}
        />

        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={ready ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.5, ease }}
          className="mb-10 max-w-125 text-[clamp(15px,1.8vw,17px)] font-light leading-[1.8] text-muted-foreground"
          style={{ fontFamily: "'Inter', sans-serif" }}
        >
          A spiritual companion designed to help you reconnect with Allah through guidance,
          reflection, recitation, and growth.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={ready ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.65, ease }}
          className="flex flex-wrap justify-center gap-4"
        >
          <HeroCtaButton text="Begin Your Journey" isPrimary />
          <HeroCtaButton text="Experience Hidaayah" isPrimary={false} />
        </motion.div>
      </div>

      {/* Bottom fade */}
      <div
        className="pointer-events-none absolute bottom-0 left-0 right-0 z-5 h-36"
        style={{ background: 'linear-gradient(to bottom, transparent, var(--background))' }}
      />

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={ready ? { opacity: 0.45 } : {}}
        transition={{ duration: 1, delay: 1.2 }}
        className="absolute bottom-7 left-1/2 z-10 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
          className="h-9 w-px"
          style={{ background: 'linear-gradient(to bottom, var(--teal), transparent)' }}
        />
      </motion.div>
    </section>
  );
}
