"use client";

/**
 * ReactiveRockyHero — Emotion-reactive hero Rocky (header, ~80px).
 *
 * Reads emotionState + isPlaying from AudioAnalysisContext.
 * Uses Framer Motion spring physics to animate SVG layers.
 * Checks useReducedMotion() independently.
 *
 * (see brainstorm: docs/brainstorms/2026-03-04-wow-factor-brainstorm.md)
 */

import { useMemo } from "react";
import { useReducedMotion, type MotionProps, type Transition } from "framer-motion";
import { useAudioAnalysis } from "./AudioAnalysisProvider";
import RockyHeroSvg from "./svg/RockyHeroSvg";
import type { EmotionState } from "@/lib/emotion-detector";

interface ReactiveRockyHeroProps {
  className?: string;
}

// Emotion → animation variant mapping
interface EmotionVariants {
  body: MotionProps["animate"];
  waves: MotionProps["animate"];
  core: MotionProps["animate"];
  legs?: MotionProps["animate"][];
}

const springTransition: Transition = { type: "spring", stiffness: 120, damping: 14 };

function getVariants(emotion: EmotionState, emphatic: boolean): EmotionVariants {
  const mul = emphatic ? 1.5 : 1;

  switch (emotion) {
    case "joyful":
      return {
        body: {
          scale: [1, 1 + 0.02 * mul, 1],
          y: [0, -3 * mul, 0],
          transition: { duration: 1.2, repeat: Infinity, ease: "easeInOut" },
        },
        waves: {
          opacity: [0.4, 0.8 * mul, 0.4],
          scale: [1, 1.05 * mul, 1],
          transition: { duration: 1.2, repeat: Infinity, ease: "easeInOut" },
        },
        core: {
          opacity: 0.6 + 0.2 * mul,
          scale: 1 + 0.05 * mul,
          transition: springTransition,
        },
      };

    case "distressed":
      return {
        body: {
          scale: 1 - 0.02 * mul,
          y: 2 * mul,
          transition: { duration: 1.5, ease: "easeOut" },
        },
        waves: {
          opacity: 0.1,
          transition: { duration: 2, ease: "easeOut" },
        },
        core: {
          opacity: 0.25,
          transition: { duration: 2 },
        },
      };

    case "curious":
      return {
        body: {
          rotate: 3 * mul,
          transition: springTransition,
        },
        waves: {
          opacity: [0.3, 0.6 * mul, 0.3],
          transition: { duration: 2, repeat: Infinity, ease: "easeInOut" },
        },
        core: {
          opacity: 0.6,
          transition: springTransition,
        },
      };

    case "thinking":
      return {
        body: {
          scale: [1, 1.01, 1],
          transition: { duration: 3, repeat: Infinity, ease: "easeInOut" },
        },
        waves: {
          opacity: [0.1, 0.25, 0.1],
          transition: { duration: 2, repeat: Infinity, ease: "easeInOut" },
        },
        core: {
          opacity: [0.3, 0.5, 0.3],
          transition: { duration: 2, repeat: Infinity, ease: "easeInOut" },
        },
      };

    case "neutral":
    default:
      return {
        body: {
          scale: 1,
          y: 0,
          rotate: 0,
          transition: springTransition,
        },
        waves: {
          opacity: [0.2, 0.35, 0.2],
          scale: [1, 1.03, 1],
          transition: { duration: 4, repeat: Infinity, ease: "easeInOut" },
        },
        core: {
          opacity: [0.4, 0.55, 0.4],
          transition: { duration: 4, repeat: Infinity, ease: "easeInOut" },
        },
      };
  }
}

// Reduced motion: static opacity per emotion
function getStaticOpacity(emotion: EmotionState): number {
  switch (emotion) {
    case "joyful":
      return 0.9;
    case "distressed":
      return 0.5;
    case "curious":
      return 0.7;
    case "thinking":
      return 0.6;
    default:
      return 0.7;
  }
}

const ARIA_LABELS: Record<EmotionState, string> = {
  neutral: "Rocky in neutral state",
  joyful: "Rocky sounds joyful",
  distressed: "Rocky sounds distressed",
  curious: "Rocky sounds curious",
  thinking: "Rocky is thinking",
};

export default function ReactiveRockyHero({ className }: ReactiveRockyHeroProps) {
  const { emotionState, emotionIntensity } = useAudioAnalysis();
  const prefersReducedMotion = useReducedMotion();

  const variants = useMemo(
    () => getVariants(emotionState, emotionIntensity === "emphatic"),
    [emotionState, emotionIntensity]
  );

  if (prefersReducedMotion) {
    const opacity = getStaticOpacity(emotionState);
    return (
      <div className={className} role="img" aria-label={ARIA_LABELS[emotionState]}>
        <RockyHeroSvg className="h-full w-full" style={{ opacity }} />
      </div>
    );
  }

  return (
    <div className={className} role="img" aria-label={ARIA_LABELS[emotionState]}>
      <RockyHeroSvg
        className="h-full w-full"
        bodyProps={{ animate: variants.body }}
        soundWavesProps={{ animate: variants.waves }}
        coreGlowProps={{ animate: variants.core }}
      />
    </div>
  );
}
