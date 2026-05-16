'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import * as THREE from 'three';

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

  float wave = sin(uTime * 0.35 + position.x * 0.6 + position.z * 0.4) * 0.06;
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
varying vec3 vColor;
varying float vAlpha;

void main() {
  vec2 uv = gl_PointCoord - vec2(0.5);
  float dist = length(uv);

  float inner = 1.0 - smoothstep(0.0, 0.25, dist);
  float outer = 1.0 - smoothstep(0.15, 0.5, dist);

  float alpha = inner * 0.9 + outer * 0.2;
  alpha *= vAlpha;

  if (dist > 0.5) discard;

  gl_FragColor = vec4(vColor, alpha);
}
`;

const RING_VERTEX = `
varying vec2 vUv;
varying vec3 vNormal;

void main() {
  vUv = uv;
  vNormal = normalize(normalMatrix * normal);

  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const RING_FRAGMENT = `
uniform float uTime;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform float uOpacity;

varying vec2 vUv;
varying vec3 vNormal;

void main() {
  float fresnel = pow(
    1.0 - abs(dot(normalize(vNormal), vec3(0.0, 0.0, 1.0))),
    1.8
  );

  float t = sin(uTime * 0.6 + vUv.x * 6.2832) * 0.5 + 0.5;

  vec3 color = mix(uColorA, uColorB, t * 0.45);

  float pulse = 0.85 + 0.15 * sin(uTime * 1.8 + vUv.y * 6.2832);

  float alpha = (fresnel * 0.75 + 0.18) * uOpacity * pulse;

  gl_FragColor = vec4(color, alpha);
}
`;

const CORE_VERTEX = `
varying vec2 vUv;
varying vec3 vNormal;

void main() {
  vUv = uv;
  vNormal = normalize(normalMatrix * normal);

  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const CORE_FRAGMENT = `
uniform float uTime;
uniform float uOpacity;

varying vec2 vUv;
varying vec3 vNormal;

void main() {
  float pulse = 0.5 + 0.5 * sin(uTime * 0.8);

  float fresnel = pow(
    1.0 - abs(dot(normalize(vNormal), vec3(0.0, 0.0, 1.0))),
    2.5
  );

  vec3 teal = vec3(0.043, 0.420, 0.361);
  vec3 gold = vec3(0.831, 0.659, 0.310);

  vec3 color = mix(teal, gold, pulse * 0.3);

  float alpha =
    fresnel *
    0.5 *
    uOpacity *
    (0.7 + 0.3 * pulse);

  gl_FragColor = vec4(color, alpha);
}
`;

function buildParticleSystem(count: number) {
  const geometry = new THREE.BufferGeometry();

  const positions = new Float32Array(count * 3);
  const scales = new Float32Array(count);
  const colors = new Float32Array(count * 3);

  const teal = new THREE.Color('#0FC2B0');
  const gold = new THREE.Color('#D4A84F');
  const ivory = new THREE.Color('#F8FAFC');
  const deepGreen = new THREE.Color('#0B6B5C');

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

    if (rand < 0.12) c = teal;
    else if (rand < 0.2) c = gold;
    else if (rand < 0.27) c = deepGreen;

    colors[i * 3] = c.r;
    colors[i * 3 + 1] = c.g;
    colors[i * 3 + 2] = c.b;
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

  geometry.setAttribute('aScale', new THREE.BufferAttribute(scales, 1));

  geometry.setAttribute('aColor', new THREE.BufferAttribute(colors, 3));

  const material = new THREE.ShaderMaterial({
    vertexShader: PARTICLE_VERTEX,
    fragmentShader: PARTICLE_FRAGMENT,
    uniforms: {
      uTime: { value: 0 },
      uSize: { value: 28 }
    },
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    vertexColors: true
  });

  return new THREE.Points(geometry, material);
}

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
    if (text === 'Begin Your Journey' || text === 'Experience Hidaayah') {
      router.push(isAuthenticated ? '/dashboard' : '/signup');
    }
  };

  return (
    <motion.button
      onClick={handleClick}
      whileHover={{
        scale: 1.03,
        boxShadow: isPrimary ? '0 0 40px rgba(var(--teal-rgb), 0.3)' : undefined,
        background: !isPrimary ? 'rgba(var(--teal-rgb),0.08)' : undefined
      }}
      whileTap={{ scale: 0.97 }}
      className={`rounded-full border-none px-9 py-4 text-[15px] font-${isPrimary ? 'medium' : 'normal'} tracking-[0.02em] ${
        isPrimary
          ? 'text-primary-foreground shadow-[0_0_30px_rgba(var(--teal-rgb),0.2)]'
          : 'border border-border bg-card text-foreground'
      }`}
      style={{
        fontFamily: "'Inter', sans-serif",
        background: isPrimary
          ? 'linear-gradient(135deg, var(--emerald) 0%, var(--teal) 100%)'
          : undefined
      }}
    >
      {text}
    </motion.button>
  );
}

function buildNoorRings() {
  const group = new THREE.Group();

  const ringConfigs = [
    {
      radius: 1.4,
      tube: 0.012,
      rotAxis: 'Y',
      speed: 0.18,
      colorA: '#0FC2B0',
      colorB: '#D4A84F'
    },
    {
      radius: 1,
      tube: 0.009,
      rotAxis: 'X',
      speed: 0.28,
      colorA: '#0B6B5C',
      colorB: '#D4A84F'
    },
    {
      radius: 0.65,
      tube: 0.007,
      rotAxis: 'Z',
      speed: 0.22,
      colorA: '#1C8C73',
      colorB: '#D4A84F'
    }
  ];

  const rings: Array<{
    mesh: THREE.Mesh;
    rotAxis: string;
    speed: number;
  }> = [];

  ringConfigs.forEach((cfg) => {
    const geo = new THREE.TorusGeometry(cfg.radius, cfg.tube, 32, 128);

    const mat = new THREE.ShaderMaterial({
      vertexShader: RING_VERTEX,
      fragmentShader: RING_FRAGMENT,
      uniforms: {
        uTime: { value: 0 },
        uColorA: { value: new THREE.Color(cfg.colorA) },
        uColorB: { value: new THREE.Color(cfg.colorB) },
        uOpacity: { value: 0 }
      },
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide
    });

    const mesh = new THREE.Mesh(geo, mat);

    group.add(mesh);

    rings.push({
      mesh,
      rotAxis: cfg.rotAxis,
      speed: cfg.speed
    });
  });

  const coreGeo = new THREE.SphereGeometry(0.35, 32, 32);

  const coreMat = new THREE.ShaderMaterial({
    vertexShader: CORE_VERTEX,
    fragmentShader: CORE_FRAGMENT,
    uniforms: {
      uTime: { value: 0 },
      uOpacity: { value: 0 }
    },
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.BackSide
  });

  const coreMesh = new THREE.Mesh(coreGeo, coreMat);

  group.add(coreMesh);

  (group as any)._rings = rings;
  (group as any)._coreMesh = coreMesh;

  return group;
}

export default function HeroSection() {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const mouseRef = useRef({
    x: 0,
    y: 0
  });

  const cameraTargetRef = useRef({
    x: 0,
    y: 0
  });

  const [phase, setPhase] = useState(0);

  // Check authentication
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('auth_token');
      setIsAuthenticated(!!token);
    };

    checkAuth();
    window.addEventListener('storage', checkAuth);
    return () => window.removeEventListener('storage', checkAuth);
  }, []);

  const handleCtaClick = (text: string) => {
    if (text === 'Begin Your Journey') {
      router.push(isAuthenticated ? '/dashboard' : '/signup');
    } else if (text === 'Experience Hidaayah') {
      router.push(isAuthenticated ? '/dashboard' : '/signup');
    }
  };

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 400),
      setTimeout(() => setPhase(2), 1400),
      setTimeout(() => setPhase(3), 2200),
      setTimeout(() => setPhase(4), 3000),
      setTimeout(() => setPhase(5), 3700),
      setTimeout(() => setPhase(6), 4400)
    ];

    return () => timers.forEach(clearTimeout);
  }, []);

  useEffect(() => {
    if (!mountRef.current) return;

    const container = mountRef.current;

    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(
      65,
      container.clientWidth / container.clientHeight,
      0.1,
      100
    );

    camera.position.set(0, 0, 6);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true
    });

    renderer.setSize(container.clientWidth, container.clientHeight);

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    renderer.setClearColor(0x000000, 0);

    container.appendChild(renderer.domElement);

    const particles = buildParticleSystem(1800);

    scene.add(particles);

    const noorGroup = buildNoorRings();

    scene.add(noorGroup);

    const rings = (noorGroup as any)._rings;
    const coreMesh = (noorGroup as any)._coreMesh;

    let ringsVisible = false;
    let noorOpacity = 0;

    setTimeout(() => {
      ringsVisible = true;
    }, 1500);

    const onMouseMove = (e: MouseEvent) => {
      mouseRef.current.x = (e.clientX / window.innerWidth) * 2 - 1;

      mouseRef.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };

    const onResize = () => {
      camera.aspect = container.clientWidth / container.clientHeight;

      camera.updateProjectionMatrix();

      renderer.setSize(container.clientWidth, container.clientHeight);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('resize', onResize);

    const clock = new THREE.Clock();

    let frameId: number;

    const animate = () => {
      frameId = requestAnimationFrame(animate);

      const elapsed = clock.getElapsedTime();

      (particles.material as THREE.ShaderMaterial).uniforms.uTime.value = elapsed;

      if (ringsVisible && noorOpacity < 1) {
        noorOpacity = Math.min(1, noorOpacity + 0.008);
      }

      rings.forEach(
        ({ mesh, rotAxis, speed }: { mesh: THREE.Mesh; rotAxis: string; speed: number }) => {
          const mat = mesh.material as THREE.ShaderMaterial;

          mat.uniforms.uTime.value = elapsed;
          mat.uniforms.uOpacity.value = noorOpacity;

          if (rotAxis === 'Y') {
            mesh.rotation.y = elapsed * speed;
          }

          if (rotAxis === 'X') {
            mesh.rotation.x = elapsed * speed;
          }

          if (rotAxis === 'Z') {
            mesh.rotation.z = elapsed * speed;
          }
        }
      );

      (coreMesh.material as THREE.ShaderMaterial).uniforms.uTime.value = elapsed;

      (coreMesh.material as THREE.ShaderMaterial).uniforms.uOpacity.value = noorOpacity;

      noorGroup.rotation.y = elapsed * 0.06;

      cameraTargetRef.current.x += (mouseRef.current.x * 0.5 - cameraTargetRef.current.x) * 0.04;

      cameraTargetRef.current.y += (mouseRef.current.y * 0.3 - cameraTargetRef.current.y) * 0.04;

      camera.position.x = cameraTargetRef.current.x;
      camera.position.y = cameraTargetRef.current.y;

      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(frameId);

      window.removeEventListener('mousemove', onMouseMove);

      window.removeEventListener('resize', onResize);

      renderer.dispose();

      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <section className="relative flex h-screen min-h-[700px] w-full items-center justify-center overflow-hidden bg-background">
      {/* 3D Canvas */}
      <div ref={mountRef} className="pointer-events-none absolute inset-0 z-0" />

      {/* Background glow */}
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 z-[1] h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2"
        style={{
          background: 'radial-gradient(ellipse, rgba(15, 194, 176, 0.06) 0%, transparent 70%)'
        }}
      />

      {/* Content */}
      <div className="relative z-10 flex max-w-[820px] flex-col items-center px-6 text-center">
        {/* Arabic Verse */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{
            opacity: phase >= 1 ? 1 : 0,
            y: phase >= 1 ? 0 : 8
          }}
          transition={{
            duration: 1.6,
            ease: [0.16, 1, 0.3, 1]
          }}
          className="mb-8"
        >
          <div
            dir="rtl"
            className="text-[28px] leading-[1.8] tracking-[0.05em] text-[var(--gold)]"
            style={{
              fontFamily: "'Amiri', serif",
              textShadow: '0 0 40px rgba(var(--gold-rgb),0.4), 0 0 80px rgba(var(--gold-rgb),0.15)'
            }}
          >
            ذَٰلِكَ الْكِتَابُ لَا رَيْبَ ۛ فِيهِ ۛ هُدًى لِّلْمُتَّقِينَ
          </div>

          <div
            className="mt-2 text-[13px] font-light tracking-[0.12em] text-muted-foreground"
            style={{
              fontFamily: "'Inter', sans-serif"
            }}
          >
            Al-Baqarah 2:2
          </div>
        </motion.div>

        {/* Separator */}
        <motion.div
          initial={{
            scaleX: 0,
            opacity: 0
          }}
          animate={{
            scaleX: phase >= 2 ? 1 : 0,
            opacity: phase >= 2 ? 1 : 0
          }}
          transition={{
            duration: 1.2,
            ease: [0.16, 1, 0.3, 1]
          }}
          className="mb-7 h-px w-[60px] origin-center"
          style={{
            background: 'linear-gradient(90deg, transparent, var(--teal), transparent)'
          }}
        />

        {/* Brand */}
        <motion.div
          initial={{
            opacity: 0,
            letterSpacing: '0.6em'
          }}
          animate={{
            opacity: phase >= 2 ? 1 : 0,
            letterSpacing: phase >= 2 ? '0.4em' : '0.6em'
          }}
          transition={{
            duration: 1.4,
            ease: [0.16, 1, 0.3, 1]
          }}
          className="mb-8 text-[13px] font-medium uppercase tracking-[0.4em] text-[var(--teal)]"
          style={{
            fontFamily: "'Inter', sans-serif"
          }}
        >
          HIDAAYAH
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{
            opacity: phase >= 3 ? 1 : 0,
            y: phase >= 3 ? 0 : 24
          }}
          transition={{
            duration: 1.4,
            ease: [0.16, 1, 0.3, 1]
          }}
          className="mb-7 text-[clamp(52px,8vw,96px)] font-light leading-[1.08] tracking-[-0.01em] text-foreground"
          style={{
            fontFamily: "'Cormorant Garamond', serif"
          }}
        >
          Guided,
          <em
            className="italic"
            style={{
              background: 'linear-gradient(135deg, var(--teal), var(--emerald), var(--gold))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}
          >
            by the Qur&apos;an.
          </em>
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{
            opacity: phase >= 4 ? 1 : 0,
            y: phase >= 4 ? 0 : 16
          }}
          transition={{
            duration: 1.2,
            ease: [0.16, 1, 0.3, 1]
          }}
          className="mb-12 max-w-[560px] text-[clamp(16px,2vw,19px)] font-light leading-[1.75] tracking-[0.01em] text-muted-foreground"
          style={{
            fontFamily: "'Inter', sans-serif"
          }}
        >
          A spiritual companion designed to help you reconnect with Allah through guidance,
          reflection, recitation, and growth.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{
            opacity: phase >= 5 ? 1 : 0,
            y: phase >= 5 ? 0 : 16
          }}
          transition={{
            duration: 1,
            ease: [0.16, 1, 0.3, 1]
          }}
          className="flex flex-wrap justify-center gap-4"
        >
          <HeroCtaButton text="Begin Your Journey" isPrimary />
          <HeroCtaButton text="Experience Hidaayah" isPrimary={false} />
        </motion.div>
      </div>

      {/* Bottom Fade */}
      <div
        className="pointer-events-none absolute bottom-0 left-0 right-0 z-[5] h-[200px]"
        style={{
          background: 'linear-gradient(to bottom, transparent, var(--background))'
        }}
      />

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{
          opacity: phase >= 6 ? 0.5 : 0
        }}
        transition={{ duration: 1 }}
        className="absolute bottom-10 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-2"
      >
        <span
          className="text-[11px] font-light uppercase tracking-[0.15em] text-muted-foreground"
          style={{
            fontFamily: "'Inter', sans-serif"
          }}
        >
          Scroll
        </span>

        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
          className="h-8 w-px opacity-60"
          style={{
            background: 'linear-gradient(to bottom, var(--teal), transparent)'
          }}
        />
      </motion.div>
    </section>
  );
}
