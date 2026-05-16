"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import * as THREE from "three";
import { Brain, Heart, TrendingUp } from "lucide-react";

interface AICompanion3DProps {
  isDark: boolean;
}

const COMPANION_VERT = `
varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vPosition;

uniform float uTime;

void main() {
  vUv = uv;
  vNormal = normalize(normalMatrix * normal);
  vPosition = position;

  vec3 pos = position;

  pos.y += sin(uTime * 0.8 + position.x * 2.0) * 0.02;
  pos.x += cos(uTime * 0.6 + position.y * 1.5) * 0.01;

  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
`;

const COMPANION_FRAG = `
uniform float uTime;
uniform float uIsDark;

varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vPosition;

void main() {

  vec3 lightPos = vec3(2.0, 3.0, 4.0);
  vec3 lightDir = normalize(lightPos - vPosition);

  float diff = max(dot(vNormal, lightDir), 0.0);

  vec3 baseLight = vec3(0.95, 0.96, 0.97);
  vec3 baseDark = vec3(0.08, 0.15, 0.20);

  vec3 accentLight = vec3(0.06, 0.76, 0.69);
  vec3 accentDark = vec3(0.15, 0.85, 0.75);

  vec3 baseColor = mix(baseLight, baseDark, uIsDark);
  vec3 accentColor = mix(accentLight, accentDark, uIsDark);

  float fresnel = pow(
    1.0 - abs(dot(normalize(vNormal), vec3(0.0, 0.0, 1.0))),
    2.0
  );

  float pulse = sin(uTime * 1.2) * 0.5 + 0.5;

  float energy =
    sin(vPosition.y * 8.0 + uTime * 2.0) * 0.3 + 0.7;

  vec3 col = baseColor * (0.3 + diff * 0.7);

  col = mix(col, accentColor, fresnel * 0.4 * pulse);

  col += accentColor * energy * 0.2 * fresnel;

  float innerGlow = smoothstep(0.8, 1.0, fresnel) * pulse;

  col += vec3(1.0) * innerGlow * 0.3;

  gl_FragColor = vec4(col, 0.9 + fresnel * 0.1);
}
`;

function AICompanion3D({ isDark }: AICompanion3DProps) {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = mountRef.current;

    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    // Scene
    const scene = new THREE.Scene();

    // Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);

    camera.position.set(0, 0, 3);

    // Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
    });

    renderer.setSize(width, height);

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    renderer.setClearColor(0x000000, 0);

    container.appendChild(renderer.domElement);

    // Geometry
    const geometry = new THREE.SphereGeometry(0.6, 32, 32);

    const positions = geometry.attributes.position.array as Float32Array;

    for (let i = 0; i < positions.length; i += 3) {
      const x = positions[i];
      const y = positions[i + 1];
      const z = positions[i + 2];

      const noise = Math.sin(x * 4) * Math.cos(y * 3) * Math.sin(z * 5) * 0.1;

      positions[i] = x * (1 + noise);
      positions[i + 1] = y * (1 + noise * 0.8);
      positions[i + 2] = z * (1 + noise);
    }

    geometry.attributes.position.needsUpdate = true;

    geometry.computeVertexNormals();

    // Material
    const material = new THREE.ShaderMaterial({
      vertexShader: COMPANION_VERT,
      fragmentShader: COMPANION_FRAG,

      uniforms: {
        uTime: { value: 0 },
        uIsDark: {
          value: isDark ? 1.0 : 0.0,
        },
      },

      transparent: true,
      side: THREE.DoubleSide,
    });

    // Mesh
    const mesh = new THREE.Mesh(geometry, material);

    scene.add(mesh);

    // Particles
    const particleGeometry = new THREE.BufferGeometry();

    const particleCount = 50;

    const particlePositions = new Float32Array(particleCount * 3);

    const particleColors = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;

      const radius = 1.2 + Math.random() * 0.8;

      const theta = Math.random() * Math.PI * 2;

      const phi = Math.random() * Math.PI;

      particlePositions[i3] = radius * Math.sin(phi) * Math.cos(theta);

      particlePositions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);

      particlePositions[i3 + 2] = radius * Math.cos(phi);

      const color =
        Math.random() > 0.5
          ? new THREE.Color(0x0fc2b0)
          : new THREE.Color(0xd4a84f);

      particleColors[i3] = color.r;
      particleColors[i3 + 1] = color.g;
      particleColors[i3 + 2] = color.b;
    }

    particleGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(particlePositions, 3),
    );

    particleGeometry.setAttribute(
      "color",
      new THREE.BufferAttribute(particleColors, 3),
    );

    const particleMaterial = new THREE.PointsMaterial({
      size: 0.02,
      vertexColors: true,
      transparent: true,
      opacity: 0.6,
      depthWrite: false,
    });

    const particles = new THREE.Points(particleGeometry, particleMaterial);

    scene.add(particles);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);

    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(
      isDark ? 0x0fc2b0 : 0xd4a84f,
      0.8,
    );

    directionalLight.position.set(2, 3, 4);

    scene.add(directionalLight);

    // Animation
    const clock = new THREE.Clock();

    let frameId: number;

    const animate = () => {
      frameId = requestAnimationFrame(animate);

      const elapsed = clock.getElapsedTime();

      material.uniforms.uTime.value = elapsed;

      material.uniforms.uIsDark.value = isDark ? 1.0 : 0.0;

      mesh.rotation.y = elapsed * 0.2;

      mesh.rotation.x = Math.sin(elapsed * 0.3) * 0.1;

      mesh.position.y = Math.sin(elapsed * 0.5) * 0.05;

      particles.rotation.y = elapsed * 0.1;

      particles.rotation.x = elapsed * 0.05;

      renderer.render(scene, camera);
    };

    animate();

    // Resize
    const handleResize = () => {
      const newWidth = container.clientWidth;
      const newHeight = container.clientHeight;

      camera.aspect = newWidth / newHeight;

      camera.updateProjectionMatrix();

      renderer.setSize(newWidth, newHeight);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(frameId);

      window.removeEventListener("resize", handleResize);

      geometry.dispose();
      material.dispose();
      particleGeometry.dispose();
      particleMaterial.dispose();

      renderer.dispose();

      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [isDark]);

  return <div ref={mountRef} className="absolute inset-0 h-full w-full" />;
}

const FEATURES = [
  {
    title: "Contextual Wisdom",

    description:
      "Every response draws from the Qur'an, Sunnah, and centuries of Islamic scholarship tailored to your exact situation.",

    icon: Brain,
  },

  {
    title: "Emotional Intelligence",

    description:
      "Responds with compassion and wisdom inspired by prophetic guidance.",

    icon: Heart,
  },

  {
    title: "Always Learning",

    description:
      "Adapts guidance to your spiritual journey and personal growth.",

    icon: TrendingUp,
  },
];

export default function AICompanionSection() {
  const sectionRef = useRef<HTMLElement>(null);

  const isInView = useInView(sectionRef, {
    once: true,
    amount: 0.3,
  });

  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains("dark"));

    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains("dark"));
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="
        relative
        flex
        min-h-screen
        flex-col
        items-center
        justify-center
        overflow-hidden
        bg-background
        px-6
        py-32
      "
    >
      {/* Background Glow */}
      <div
        className="
          pointer-events-none
          absolute
          left-1/2
          top-1/2
          h-[600px]
          w-[800px]
          -translate-x-1/2
          -translate-y-1/2
        "
        style={{
          background:
            "radial-gradient(ellipse, rgba(var(--teal-rgb),0.06) 0%, transparent 70%)",
        }}
      />

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{
          duration: 1,
          ease: [0.16, 1, 0.3, 1],
        }}
        className="
          relative
          z-10
          mb-16
          text-center
        "
      >
        <span
          className="
            mb-5
            block
            text-xs
            font-medium
            uppercase
            tracking-[0.25em]
            text-teal-500/70
          "
        >
          AI Companion
        </span>

        <h2
          className="
            mx-auto
            mb-4
            max-w-4xl
            font-serif
            text-4xl
            font-light
            leading-tight
            tracking-tight
            text-foreground
            md:text-6xl
          "
        >
          Wisdom rooted in <em className="text-teal-500">revelation.</em>
        </h2>

        <p
          className="
            mx-auto
            max-w-2xl
            text-base
            leading-7
            text-muted-foreground
          "
        >
          Meet your spiritual companion — an AI trained on Islamic knowledge,
          designed to offer guidance that honors both tradition and your unique
          journey.
        </p>
      </motion.div>

      {/* Content */}
      <div
        className="
          relative
          z-10
          grid
          w-full
          max-w-6xl
          gap-16
          lg:grid-cols-2
        "
      >
        {/* 3D Side */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={isInView ? { opacity: 1, x: 0 } : {}}
          transition={{
            duration: 1.2,
            delay: 0.3,
            ease: [0.16, 1, 0.3, 1],
          }}
          className="
            relative
            flex
            h-[300px]
            items-center
            justify-center
            md:h-[400px]
          "
        >
          <AICompanion3D isDark={isDark} />

          <div
            className="
              pointer-events-none
              absolute
              bottom-[20%]
              left-1/2
              h-[30px]
              w-[60%]
              -translate-x-1/2
              blur-xl
            "
            style={{
              background:
                "radial-gradient(ellipse, rgba(var(--teal-rgb),0.3) 0%, transparent 70%)",
            }}
          />
        </motion.div>

        {/* Features */}
        <div className="flex flex-col gap-8">
          {FEATURES.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{
                opacity: 0,
                x: 30,
              }}
              animate={
                isInView
                  ? {
                      opacity: 1,
                      x: 0,
                    }
                  : {}
              }
              transition={{
                duration: 0.8,
                delay: 0.4 + index * 0.1,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="
                  flex
                  gap-4
                  rounded-2xl
                  border
                  border-border
                  bg-card
                  p-6
                "
            >
              <div
                className="
                    flex
                    h-10
                    w-10
                    shrink-0
                    items-center
                    justify-center
                    rounded-xl
                    border
                  "
                style={{
                  background: "rgba(var(--teal-rgb),0.1)",
                  borderColor: "rgba(var(--teal-rgb),0.2)",
                }}
              >
                <feature.icon
                  size={18}
                  className="text-teal-500"
                  strokeWidth={1.5}
                />
              </div>

              <div>
                <h3
                  className="
                      mb-2
                      text-base
                      font-medium
                      text-foreground
                    "
                >
                  {feature.title}
                </h3>

                <p
                  className="
                      text-sm
                      leading-6
                      text-muted-foreground
                    "
                >
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
