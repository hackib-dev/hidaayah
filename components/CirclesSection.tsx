"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";

import { BookOpen, RotateCcw, Mic, MessageCircle } from "lucide-react";

type NodeType = {
  id: number;
  x: number;
  y: number;
  label: string;
  color: string;
  size: number;
  role: string;
};

type EdgeType = {
  from: number;
  to: number;
};

const NODES: NodeType[] = [
  {
    id: 0,
    x: 50,
    y: 50,
    label: "You",
    color: "var(--teal)",
    size: 14,
    role: "",
  },

  {
    id: 1,
    x: 22,
    y: 28,
    label: "Yusuf",
    color: "var(--teal)",
    size: 10,
    role: "Hifdh",
  },

  {
    id: 2,
    x: 75,
    y: 22,
    label: "Amina",
    color: "var(--teal)",
    size: 10,
    role: "Muraaja'ah",
  },

  {
    id: 3,
    x: 85,
    y: 60,
    label: "Ibrahim",
    color: "var(--gold)",
    size: 10,
    role: "Reflection",
  },

  {
    id: 4,
    x: 60,
    y: 80,
    label: "Khadija",
    color: "var(--teal)",
    size: 10,
    role: "Recitation",
  },

  {
    id: 5,
    x: 15,
    y: 65,
    label: "Omar",
    color: "var(--teal)",
    size: 10,
    role: "Hifdh",
  },

  {
    id: 6,
    x: 40,
    y: 18,
    label: "Fatima",
    color: "var(--gold)",
    size: 9,
    role: "Tafsir",
  },

  {
    id: 7,
    x: 88,
    y: 38,
    label: "Ali",
    color: "var(--teal)",
    size: 9,
    role: "Recitation",
  },

  {
    id: 8,
    x: 30,
    y: 82,
    label: "Maryam",
    color: "var(--teal)",
    size: 9,
    role: "Muraaja'ah",
  },

  {
    id: 9,
    x: 68,
    y: 42,
    label: "Hassan",
    color: "var(--teal)",
    size: 9,
    role: "Hifdh",
  },

  {
    id: 10,
    x: 12,
    y: 44,
    label: "Zaid",
    color: "var(--gold)",
    size: 8,
    role: "Reflection",
  },

  {
    id: 11,
    x: 55,
    y: 62,
    label: "Aisha",
    color: "var(--teal)",
    size: 8,
    role: "Tafsir",
  },
];

const EDGES: EdgeType[] = [
  { from: 0, to: 1 },
  { from: 0, to: 2 },
  { from: 0, to: 3 },
  { from: 0, to: 4 },
  { from: 0, to: 5 },
  { from: 0, to: 9 },

  { from: 1, to: 6 },
  { from: 1, to: 10 },

  { from: 2, to: 7 },
  { from: 2, to: 6 },

  { from: 3, to: 7 },
  { from: 3, to: 11 },

  { from: 4, to: 8 },
  { from: 4, to: 11 },

  { from: 5, to: 8 },
  { from: 5, to: 10 },

  { from: 9, to: 11 },
  { from: 9, to: 7 },
];

const GROUPS = [
  {
    name: "Hifdh Circle",
    count: "12 members",
    color: "teal",
    icon: BookOpen,
  },

  {
    name: "Muraaja'ah",
    count: "8 members",
    color: "gold",
    icon: RotateCcw,
  },

  {
    name: "Recitation Group",
    count: "24 members",
    color: "teal",
    icon: Mic,
  },

  {
    name: "Reflections",
    count: "156 members",
    color: "teal",
    icon: MessageCircle,
  },
];

function ConstellationSVG({ inView }: { inView: boolean }) {
  const [pulse, setPulse] = useState(0);

  const frameRef = useRef<number>(0);

  useEffect(() => {
    if (!inView) return;

    let start: number | null = null;

    const animate = (timestamp: number) => {
      if (!start) {
        start = timestamp;
      }

      setPulse((timestamp - start) / 1000);

      frameRef.current = requestAnimationFrame(animate);
    };

    frameRef.current = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(frameRef.current);
  }, [inView]);

  return (
    <svg
      viewBox="0 0 100 100"
      className="h-full w-full"
      preserveAspectRatio="xMidYMid meet"
    >
      {/* Edges */}
      {EDGES.map((edge, index) => {
        const from = NODES[edge.from];

        const to = NODES[edge.to];

        const opacity = inView
          ? 0.18 + Math.sin(pulse * 0.8 + index * 0.5) * 0.08
          : 0;

        return (
          <motion.line
            key={index}
            x1={from.x}
            y1={from.y}
            x2={to.x}
            y2={to.y}
            stroke={from.color}
            strokeWidth="0.15"
            strokeOpacity={opacity}
            initial={{
              pathLength: 0,
              opacity: 0,
            }}
            animate={
              inView
                ? {
                    pathLength: 1,
                    opacity: 1,
                  }
                : {}
            }
            transition={{
              duration: 1.5,
              delay: 0.5 + index * 0.08,
              ease: [0.16, 1, 0.3, 1],
            }}
          />
        );
      })}

      {/* Nodes */}
      {NODES.map((node, index) => {
        const glowSize =
          node.size * (1 + Math.sin(pulse * 1.2 + index * 0.7) * 0.15);

        return (
          <g key={node.id}>
            {/* Glow */}
            <motion.circle
              cx={node.x}
              cy={node.y}
              r={glowSize * 0.6}
              fill={node.color}
              opacity={inView ? 0.08 + Math.sin(pulse * 0.9 + index) * 0.03 : 0}
              initial={{
                scale: 0,
              }}
              animate={
                inView
                  ? {
                      scale: 1,
                    }
                  : {}
              }
              transition={{
                duration: 0.8,
                delay: 0.3 + index * 0.06,
              }}
            />

            {/* Main Node */}
            <motion.circle
              cx={node.x}
              cy={node.y}
              r={node.size * 0.32}
              fill={node.color}
              opacity={inView ? 0.85 : 0}
              initial={{
                scale: 0,
              }}
              animate={
                inView
                  ? {
                      scale: 1,
                    }
                  : {}
              }
              transition={{
                duration: 0.6,
                delay: 0.4 + index * 0.06,
                type: "spring",
              }}
            />

            {/* Label */}
            <motion.text
              x={node.x}
              y={
                index === 0
                  ? node.y - node.size * 0.5
                  : node.y + node.size * 0.5 + 2.5
              }
              textAnchor="middle"
              fill={index === 0 ? node.color : "var(--muted-foreground)"}
              fontSize={index === 0 ? "2.8" : "2.2"}
              fontWeight={index === 0 ? "500" : "300"}
              opacity={inView ? (index === 0 ? 0.9 : 1) : 0}
              initial={{
                opacity: 0,
              }}
              animate={
                inView
                  ? {
                      opacity: index === 0 ? 0.9 : 1,
                    }
                  : {}
              }
              transition={{
                delay: index === 0 ? 1 : 0.8 + index * 0.05,
              }}
            >
              {node.label}
            </motion.text>
          </g>
        );
      })}
    </svg>
  );
}

export default function CirclesSection() {
  const sectionRef = useRef<HTMLElement>(null);

  const isInView = useInView(sectionRef, {
    once: true,
    amount: 0.3,
  });

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
      {/* Ambient Glow */}
      <div
        className="
          pointer-events-none
          absolute
          left-1/2
          top-[40%]
          h-[500px]
          w-[700px]
          -translate-x-1/2
          -translate-y-1/2
        "
        style={{
          background:
            "radial-gradient(ellipse, rgba(var(--teal-rgb),0.04) 0%, transparent 70%)",
        }}
      />

      {/* Header */}
      <motion.div
        initial={{
          opacity: 0,
          y: 20,
        }}
        animate={
          isInView
            ? {
                opacity: 1,
                y: 0,
              }
            : {}
        }
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
          Circles & Community
        </span>

        <h2
          className="
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
          You&apos;re never on this journey{" "}
          <em className="text-teal-500">alone.</em>
        </h2>

        <p
          className="
            mx-auto
            max-w-xl
            text-base
            leading-7
            text-muted-foreground
          "
        >
          Connect with believers who share your commitment to growth through
          memorization, reflection, recitation, and spiritual accountability.
        </p>
      </motion.div>

      {/* Content */}
      <div
        className="
          relative
          z-10
          flex
          w-full
          max-w-6xl
          flex-wrap
          items-center
          justify-center
          gap-16
        "
      >
        {/* Constellation */}
        <motion.div
          initial={{
            opacity: 0,
            scale: 0.9,
          }}
          animate={
            isInView
              ? {
                  opacity: 1,
                  scale: 1,
                }
              : {}
          }
          transition={{
            duration: 1.2,
            delay: 0.3,
            ease: [0.16, 1, 0.3, 1],
          }}
          className="
            relative
            h-[90vw]
            w-[90vw]
            max-h-[400px]
            max-w-[400px]
            rounded-full
            border
            border-border
            bg-card
            p-8
            backdrop-blur-md
          "
          style={{
            boxShadow: "0 0 60px rgba(var(--teal-rgb),0.05)",
          }}
        >
          <ConstellationSVG inView={isInView} />
        </motion.div>

        {/* Groups */}
        <div
          className="
            flex
            min-w-[260px]
            flex-col
            gap-4
          "
        >
          {GROUPS.map((group, index) => {
            const isTeal = group.color === "teal";

            return (
              <motion.div
                key={group.name}
                initial={{
                  opacity: 0,
                  x: 24,
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
                  delay: 0.5 + index * 0.1,
                  ease: [0.16, 1, 0.3, 1],
                }}
                whileHover={{
                  x: 4,
                }}
                className="
                    flex
                    cursor-pointer
                    items-center
                    gap-4
                    rounded-2xl
                    border
                    border-border
                    bg-card
                    px-6
                    py-5
                    transition-colors
                    hover:bg-teal-500/[0.03]
                  "
              >
                {/* Icon */}
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
                    background: isTeal
                      ? "rgba(15,194,176,0.12)"
                      : "rgba(212,168,79,0.12)",

                    borderColor: isTeal
                      ? "rgba(15,194,176,0.2)"
                      : "rgba(212,168,79,0.2)",
                  }}
                >
                  <group.icon
                    size={18}
                    className={isTeal ? "text-teal-500" : "text-yellow-500"}
                    strokeWidth={1.5}
                  />
                </div>

                {/* Text */}
                <div>
                  <h3
                    className="
                        mb-1
                        text-sm
                        font-medium
                        text-foreground
                      "
                  >
                    {group.name}
                  </h3>

                  <p
                    className="
                        text-xs
                        text-muted-foreground
                      "
                  >
                    {group.count}
                  </p>
                </div>

                {/* Arrow */}
                <div className="ml-auto">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path
                      d="M5 3L9 7L5 11"
                      stroke="var(--muted-foreground)"
                      strokeWidth="1.2"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
