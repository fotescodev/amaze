"use client";

/**
 * Rocky Hero SVG — inline React component with named motion.g groups.
 *
 * Animatable layers:
 *   - soundWavesLeft, soundWavesRight, soundWavesTop — wave arcs
 *   - body — main carapace ellipse + texture
 *   - coreGlow — inner amber communication glow
 *   - leg1..leg5 — individual legs for body language
 *   - tealAccents — engineering detail rings/dots
 *
 * All transform-origins use percentage-based values for scaling independence.
 */

import { motion, type MotionProps } from "framer-motion";

interface RockyHeroSvgProps {
  className?: string;
  soundWavesProps?: MotionProps;
  bodyProps?: MotionProps;
  coreGlowProps?: MotionProps;
  legProps?: MotionProps[];
  tealAccentProps?: MotionProps;
}

export default function RockyHeroSvg({
  className,
  soundWavesProps,
  bodyProps,
  coreGlowProps,
  legProps,
  tealAccentProps,
}: RockyHeroSvgProps) {
  const lp = (i: number) => legProps?.[i] ?? {};

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 400 350"
      className={className}
      role="img"
      aria-label="Rocky the Eridian"
    >
      <defs>
        <radialGradient id="hero-body" cx="50%" cy="42%" r="50%">
          <stop offset="0%" stopColor="#2a1a3e" />
          <stop offset="40%" stopColor="#1a1a2e" />
          <stop offset="100%" stopColor="#0f3460" />
        </radialGradient>
        <radialGradient id="hero-core-glow" cx="50%" cy="48%" r="40%">
          <stop offset="0%" stopColor="#fbbf24" stopOpacity={0.5} />
          <stop offset="50%" stopColor="#f59e0b" stopOpacity={0.15} />
          <stop offset="100%" stopColor="#f59e0b" stopOpacity={0} />
        </radialGradient>
        <radialGradient id="hero-ambient" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.12} />
          <stop offset="100%" stopColor="#f59e0b" stopOpacity={0} />
        </radialGradient>
        <linearGradient id="hero-leg-grad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#1a1a2e" />
          <stop offset="100%" stopColor="#0f3460" />
        </linearGradient>
        <filter id="hero-soft-glow">
          <feGaussianBlur stdDeviation="6" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="hero-outer-glow">
          <feGaussianBlur stdDeviation="12" />
        </filter>
        <clipPath id="hero-body-clip">
          <ellipse cx="200" cy="135" rx="82" ry="70" />
        </clipPath>
      </defs>

      {/* Ambient glow */}
      <ellipse cx="200" cy="140" rx="160" ry="120" fill="url(#hero-ambient)" />

      {/* Sound wave arcs — left */}
      <motion.g
        data-layer="soundWavesLeft"
        style={{ originX: "50%", originY: "38.6%" }}
        {...soundWavesProps}
      >
        <path d="M95 90 Q65 135 95 180" fill="none" stroke="#f59e0b" strokeWidth="2" opacity={0.3} />
        <path d="M80 75 Q42 135 80 195" fill="none" stroke="#fbbf24" strokeWidth="1.5" opacity={0.2} />
        <path d="M65 60 Q20 135 65 210" fill="none" stroke="#fbbf24" strokeWidth="1" opacity={0.15} />
      </motion.g>

      {/* Sound wave arcs — right */}
      <motion.g
        data-layer="soundWavesRight"
        style={{ originX: "50%", originY: "38.6%" }}
        {...soundWavesProps}
      >
        <path d="M305 90 Q335 135 305 180" fill="none" stroke="#f59e0b" strokeWidth="2" opacity={0.3} />
        <path d="M320 75 Q358 135 320 195" fill="none" stroke="#fbbf24" strokeWidth="1.5" opacity={0.2} />
        <path d="M335 60 Q380 135 335 210" fill="none" stroke="#fbbf24" strokeWidth="1" opacity={0.15} />
      </motion.g>

      {/* Sound wave arcs — top */}
      <motion.g
        data-layer="soundWavesTop"
        style={{ originX: "50%", originY: "38.6%" }}
        {...soundWavesProps}
      >
        <path d="M160 60 Q200 40 240 60" fill="none" stroke="#f59e0b" strokeWidth="1.5" opacity={0.25} />
        <path d="M145 45 Q200 20 255 45" fill="none" stroke="#fbbf24" strokeWidth="1" opacity={0.15} />
      </motion.g>

      {/* Outer glow behind body */}
      <ellipse cx="200" cy="135" rx="90" ry="78" fill="#f59e0b" opacity={0.06} filter="url(#hero-outer-glow)" />

      {/* Main body */}
      <motion.g
        data-layer="body"
        style={{ originX: "50%", originY: "38.6%" }}
        {...bodyProps}
      >
        <ellipse cx="200" cy="135" rx="82" ry="70" fill="url(#hero-body)" stroke="#0f3460" strokeWidth="1.5" />
        {/* Carapace texture */}
        <g clipPath="url(#hero-body-clip)" opacity={0.35}>
          <path d="M130 110 Q165 95 200 100 Q235 95 270 110" fill="none" stroke="#16213e" strokeWidth="1.2" />
          <path d="M125 130 Q162 118 200 122 Q238 118 275 130" fill="none" stroke="#16213e" strokeWidth="1" />
          <path d="M128 150 Q164 140 200 143 Q236 140 272 150" fill="none" stroke="#16213e" strokeWidth="1" />
          <path d="M135 168 Q167 160 200 162 Q233 160 265 168" fill="none" stroke="#16213e" strokeWidth="0.8" />
          <path d="M170 70 Q168 135 172 200" fill="none" stroke="#16213e" strokeWidth="0.6" />
          <path d="M200 65 Q198 135 200 205" fill="none" stroke="#16213e" strokeWidth="0.6" />
          <path d="M230 70 Q232 135 228 200" fill="none" stroke="#16213e" strokeWidth="0.6" />
        </g>
      </motion.g>

      {/* Core glow */}
      <motion.g
        data-layer="coreGlow"
        style={{ originX: "50%", originY: "37.1%" }}
        {...coreGlowProps}
      >
        <ellipse cx="200" cy="130" rx="40" ry="35" fill="url(#hero-core-glow)" filter="url(#hero-soft-glow)" />
      </motion.g>

      {/* Teal accents */}
      <motion.g data-layer="tealAccents" {...tealAccentProps}>
        <ellipse cx="200" cy="135" rx="82" ry="70" fill="none" stroke="#0d9488" strokeWidth="0.6" strokeDasharray="6 8" opacity={0.35} />
        <ellipse cx="200" cy="135" rx="60" ry="50" fill="none" stroke="#0d9488" strokeWidth="0.4" strokeDasharray="3 6" opacity={0.2} />
        <circle cx="165" cy="120" r="1.5" fill="#0d9488" opacity={0.5} />
        <circle cx="235" cy="120" r="1.5" fill="#0d9488" opacity={0.5} />
        <circle cx="200" cy="100" r="1.5" fill="#0d9488" opacity={0.5} />
        <circle cx="180" cy="155" r="1.2" fill="#0d9488" opacity={0.4} />
        <circle cx="220" cy="155" r="1.2" fill="#0d9488" opacity={0.4} />
      </motion.g>

      {/* Leg 1 — far left */}
      <motion.g
        data-layer="leg1"
        style={{ originX: "33.75%", originY: "50%" }}
        {...lp(0)}
      >
        <path d="M135 175 Q105 195 75 185 Q65 182 55 190" fill="none" stroke="url(#hero-leg-grad)" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M55 190 L48 185" fill="none" stroke="#1a1a2e" strokeWidth="3" strokeLinecap="round" />
        <path d="M55 190 L46 192" fill="none" stroke="#1a1a2e" strokeWidth="3" strokeLinecap="round" />
        <path d="M55 190 L50 198" fill="none" stroke="#1a1a2e" strokeWidth="3" strokeLinecap="round" />
      </motion.g>

      {/* Leg 2 — left */}
      <motion.g
        data-layer="leg2"
        style={{ originX: "37%", originY: "54.3%" }}
        {...lp(1)}
      >
        <path d="M148 190 Q120 230 95 250 Q85 258 78 265" fill="none" stroke="url(#hero-leg-grad)" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M78 265 L70 260" fill="none" stroke="#1a1a2e" strokeWidth="3" strokeLinecap="round" />
        <path d="M78 265 L72 270" fill="none" stroke="#1a1a2e" strokeWidth="3" strokeLinecap="round" />
        <path d="M78 265 L80 273" fill="none" stroke="#1a1a2e" strokeWidth="3" strokeLinecap="round" />
      </motion.g>

      {/* Leg 3 — center bottom */}
      <motion.g
        data-layer="leg3"
        style={{ originX: "50%", originY: "57.1%" }}
        {...lp(2)}
      >
        <path d="M200 200 Q200 250 200 290 Q200 300 198 308" fill="none" stroke="url(#hero-leg-grad)" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M198 308 L190 305" fill="none" stroke="#1a1a2e" strokeWidth="3" strokeLinecap="round" />
        <path d="M198 308 L200 316" fill="none" stroke="#1a1a2e" strokeWidth="3" strokeLinecap="round" />
        <path d="M198 308 L206 306" fill="none" stroke="#1a1a2e" strokeWidth="3" strokeLinecap="round" />
      </motion.g>

      {/* Leg 4 — right */}
      <motion.g
        data-layer="leg4"
        style={{ originX: "63%", originY: "54.3%" }}
        {...lp(3)}
      >
        <path d="M252 190 Q280 230 305 250 Q315 258 322 265" fill="none" stroke="url(#hero-leg-grad)" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M322 265 L330 260" fill="none" stroke="#1a1a2e" strokeWidth="3" strokeLinecap="round" />
        <path d="M322 265 L328 270" fill="none" stroke="#1a1a2e" strokeWidth="3" strokeLinecap="round" />
        <path d="M322 265 L320 273" fill="none" stroke="#1a1a2e" strokeWidth="3" strokeLinecap="round" />
      </motion.g>

      {/* Leg 5 — far right */}
      <motion.g
        data-layer="leg5"
        style={{ originX: "66.25%", originY: "50%" }}
        {...lp(4)}
      >
        <path d="M265 175 Q295 195 325 185 Q335 182 345 190" fill="none" stroke="url(#hero-leg-grad)" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M345 190 L352 185" fill="none" stroke="#1a1a2e" strokeWidth="3" strokeLinecap="round" />
        <path d="M345 190 L354 192" fill="none" stroke="#1a1a2e" strokeWidth="3" strokeLinecap="round" />
        <path d="M345 190 L350 198" fill="none" stroke="#1a1a2e" strokeWidth="3" strokeLinecap="round" />
      </motion.g>

      {/* Shadow */}
      <ellipse cx="200" cy="320" rx="100" ry="8" fill="#0f172a" opacity={0.4} />
    </svg>
  );
}
