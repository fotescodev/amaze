"use client";

/**
 * Rocky Avatar SVG — inline React component with named motion.g groups.
 *
 * Small (32px) per-message avatar. Animatable layers:
 *   - soundWaves — the four wave arcs
 *   - body — carapace + texture
 *   - coreGlow — inner amber glow (pulsed during playback)
 *   - legs — all five legs as a single group
 */

import { motion, type MotionProps } from "framer-motion";

interface RockyAvatarSvgProps {
  className?: string;
  size?: number;
  soundWavesProps?: MotionProps;
  coreGlowProps?: MotionProps;
}

export default function RockyAvatarSvg({
  className,
  size = 32,
  soundWavesProps,
  coreGlowProps,
}: RockyAvatarSvgProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 64 64"
      width={size}
      height={size}
      className={className}
      aria-hidden="true"
    >
      <defs>
        <radialGradient id="av-body-glow" cx="50%" cy="45%" r="50%">
          <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.25} />
          <stop offset="60%" stopColor="#1a1a2e" stopOpacity={0.9} />
          <stop offset="100%" stopColor="#0f3460" stopOpacity={1} />
        </radialGradient>
        <radialGradient id="av-inner-glow" cx="50%" cy="50%" r="45%">
          <stop offset="0%" stopColor="#fbbf24" stopOpacity={0.4} />
          <stop offset="100%" stopColor="#f59e0b" stopOpacity={0} />
        </radialGradient>
        <filter id="av-glow">
          <feGaussianBlur stdDeviation="1.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Ambient glow */}
      <ellipse cx="32" cy="28" rx="16" ry="14" fill="#f59e0b" opacity={0.08} filter="url(#av-glow)" />

      {/* Sound wave arcs */}
      <motion.g
        data-layer="soundWaves"
        style={{ originX: "50%", originY: "43.75%" }}
        {...soundWavesProps}
      >
        <path d="M18 18 Q14 24 18 30" fill="none" stroke="#f59e0b" strokeWidth="0.8" opacity={0.3} />
        <path d="M46 18 Q50 24 46 30" fill="none" stroke="#f59e0b" strokeWidth="0.8" opacity={0.3} />
        <path d="M15 16 Q10 24 15 32" fill="none" stroke="#fbbf24" strokeWidth="0.6" opacity={0.2} />
        <path d="M49 16 Q54 24 49 32" fill="none" stroke="#fbbf24" strokeWidth="0.6" opacity={0.2} />
      </motion.g>

      {/* Main body */}
      <g data-layer="body">
        <ellipse cx="32" cy="26" rx="14" ry="12" fill="url(#av-body-glow)" stroke="#0f3460" strokeWidth="0.8" />
        <path d="M22 22 Q32 18 42 22" fill="none" stroke="#16213e" strokeWidth="0.5" opacity={0.6} />
        <path d="M20 27 Q32 23 44 27" fill="none" stroke="#16213e" strokeWidth="0.5" opacity={0.5} />
        <path d="M22 31 Q32 28 42 31" fill="none" stroke="#16213e" strokeWidth="0.4" opacity={0.4} />
      </g>

      {/* Core glow */}
      <motion.g
        data-layer="coreGlow"
        style={{ originX: "50%", originY: "39%" }}
        {...coreGlowProps}
      >
        <ellipse cx="32" cy="25" rx="7" ry="6" fill="url(#av-inner-glow)" />
      </motion.g>

      {/* Legs */}
      <g data-layer="legs">
        <path d="M23 34 L16 48 L14 46" fill="none" stroke="#1a1a2e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="14" cy="46" r="1.2" fill="#16213e" />
        <path d="M41 34 L48 48 L50 46" fill="none" stroke="#1a1a2e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="50" cy="46" r="1.2" fill="#16213e" />
        <path d="M20 32 L10 44 L8 43" fill="none" stroke="#1a1a2e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="8" cy="43" r="1.2" fill="#16213e" />
        <path d="M44 32 L54 44 L56 43" fill="none" stroke="#1a1a2e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="56" cy="43" r="1.2" fill="#16213e" />
        <path d="M32 36 L32 50 L33 48" fill="none" stroke="#1a1a2e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="32" cy="50" r="1.2" fill="#16213e" />
      </g>

      {/* Teal accent */}
      <ellipse cx="32" cy="26" rx="14" ry="12" fill="none" stroke="#0d9488" strokeWidth="0.3" strokeDasharray="2 4" opacity={0.4} />
    </svg>
  );
}
