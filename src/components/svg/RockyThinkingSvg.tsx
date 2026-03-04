"use client";

/**
 * Rocky Thinking SVG — inline React component with sonar ring animation.
 *
 * Used during loading state. Animatable layers:
 *   - sonarRings — expanding circles (thinking/processing)
 *   - body — main carapace
 *   - coreGlow — brighter when thinking
 *   - thinkingDots — floating dots above Rocky
 *   - legs — contemplative curled pose
 */

import { motion, type MotionProps } from "framer-motion";

interface RockyThinkingSvgProps {
  className?: string;
  size?: number;
  sonarRingsProps?: MotionProps;
  coreGlowProps?: MotionProps;
  thinkingDotsProps?: MotionProps;
}

export default function RockyThinkingSvg({
  className,
  size = 32,
  sonarRingsProps,
  coreGlowProps,
  thinkingDotsProps,
}: RockyThinkingSvgProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 80 80"
      width={size}
      height={size}
      className={className}
      aria-hidden="true"
    >
      <defs>
        <radialGradient id="th-body" cx="50%" cy="42%" r="50%">
          <stop offset="0%" stopColor="#2a1a3e" />
          <stop offset="40%" stopColor="#1a1a2e" />
          <stop offset="100%" stopColor="#0f3460" />
        </radialGradient>
        <radialGradient id="th-core" cx="50%" cy="48%" r="40%">
          <stop offset="0%" stopColor="#fbbf24" stopOpacity={0.5} />
          <stop offset="50%" stopColor="#f59e0b" stopOpacity={0.15} />
          <stop offset="100%" stopColor="#f59e0b" stopOpacity={0} />
        </radialGradient>
        <filter id="th-glow">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Ambient glow */}
      <ellipse cx="40" cy="30" rx="22" ry="18" fill="#f59e0b" opacity={0.06} filter="url(#th-glow)" />

      {/* Sonar rings */}
      <motion.g
        data-layer="sonarRings"
        style={{ originX: "50%", originY: "37.5%" }}
        {...sonarRingsProps}
      >
        <circle cx="40" cy="30" r="18" fill="none" stroke="#f59e0b" strokeWidth="1" opacity={0.4} />
        <circle cx="40" cy="30" r="24" fill="none" stroke="#fbbf24" strokeWidth="0.8" opacity={0.25} />
        <circle cx="40" cy="30" r="30" fill="none" stroke="#fbbf24" strokeWidth="0.6" opacity={0.15} />
      </motion.g>

      {/* Main body */}
      <g data-layer="body">
        <ellipse cx="40" cy="30" rx="16" ry="14" fill="url(#th-body)" stroke="#0f3460" strokeWidth="0.8" />
        <path d="M28 26 Q40 22 52 26" fill="none" stroke="#16213e" strokeWidth="0.5" opacity={0.5} />
        <path d="M26 31 Q40 27 54 31" fill="none" stroke="#16213e" strokeWidth="0.5" opacity={0.4} />
        <path d="M28 35 Q40 32 52 35" fill="none" stroke="#16213e" strokeWidth="0.4" opacity={0.3} />
      </g>

      {/* Core glow */}
      <motion.g
        data-layer="coreGlow"
        style={{ originX: "50%", originY: "36.25%" }}
        {...coreGlowProps}
      >
        <ellipse cx="40" cy="29" rx="8" ry="7" fill="url(#th-core)" filter="url(#th-glow)" />
      </motion.g>

      {/* Teal accent */}
      <ellipse cx="40" cy="30" rx="16" ry="14" fill="none" stroke="#0d9488" strokeWidth="0.3" strokeDasharray="2 4" opacity={0.3} />

      {/* Legs — contemplative curled pose */}
      <g data-layer="legs">
        <path d="M27 38 L18 52 L16 50" fill="none" stroke="#1a1a2e" strokeWidth="2.2" strokeLinecap="round" />
        <circle cx="16" cy="50" r="1.3" fill="#16213e" />
        <path d="M22 36 L12 48 L10 47" fill="none" stroke="#1a1a2e" strokeWidth="2.2" strokeLinecap="round" />
        <circle cx="10" cy="47" r="1.3" fill="#16213e" />
        <path d="M40 42 L40 56 L41 54" fill="none" stroke="#1a1a2e" strokeWidth="2.2" strokeLinecap="round" />
        <circle cx="40" cy="56" r="1.3" fill="#16213e" />
        <path d="M58 36 L68 48 L70 47" fill="none" stroke="#1a1a2e" strokeWidth="2.2" strokeLinecap="round" />
        <circle cx="70" cy="47" r="1.3" fill="#16213e" />
        <path d="M53 38 L62 52 L64 50" fill="none" stroke="#1a1a2e" strokeWidth="2.2" strokeLinecap="round" />
        <circle cx="64" cy="50" r="1.3" fill="#16213e" />
      </g>

      {/* Thinking dots */}
      <motion.g data-layer="thinkingDots" {...thinkingDotsProps}>
        <circle cx="54" cy="12" r="2" fill="#f59e0b" opacity={0.7} />
        <circle cx="60" cy="8" r="2.3" fill="#fbbf24" opacity={0.7} />
        <circle cx="67" cy="5" r="2.8" fill="#fb923c" opacity={0.7} />
      </motion.g>
    </svg>
  );
}
