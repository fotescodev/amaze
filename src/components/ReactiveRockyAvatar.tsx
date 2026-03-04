"use client";

/**
 * ReactiveRockyAvatar — Per-message avatar (32px).
 *
 * Only the currently-playing avatar does audio-reactive animation.
 * Non-active avatars render with static emotion-appropriate opacity.
 * Loading state shows rocky-thinking.svg with sonar rings.
 *
 * (see brainstorm: docs/brainstorms/2026-03-04-wow-factor-brainstorm.md)
 */

import { useReducedMotion } from "framer-motion";
import RockyAvatarSvg from "./svg/RockyAvatarSvg";
import RockyThinkingSvg from "./svg/RockyThinkingSvg";
import type { EmotionState } from "@/lib/emotion-detector";

interface ReactiveRockyAvatarProps {
  isActive: boolean;
  emotion?: EmotionState;
  isThinking?: boolean;
  size?: number;
}

// Active: sound waves pulse, core brightens
const activeWaveProps = {
  animate: {
    opacity: [0.4, 0.9, 0.4],
    scale: [1, 1.15, 1],
    transition: { duration: 0.8, repeat: Infinity, ease: "easeInOut" as const },
  },
};

const activeCoreProps = {
  animate: {
    opacity: [0.5, 0.9, 0.5],
    scale: [1, 1.1, 1],
    transition: { duration: 0.8, repeat: Infinity, ease: "easeInOut" as const },
  },
};

// Thinking: sonar ring animation props
const thinkingSonarProps = {
  animate: {
    scale: [1, 1.4],
    opacity: [0.5, 0],
    transition: { duration: 1.5, repeat: Infinity, ease: "easeOut" as const },
  },
};

const thinkingCoreProps = {
  animate: {
    opacity: [0.3, 0.6, 0.3],
    transition: { duration: 1.5, repeat: Infinity, ease: "easeInOut" as const },
  },
};

const thinkingDotsProps = {
  animate: {
    y: [0, -2, 0],
    opacity: [0.5, 1, 0.5],
    transition: { duration: 1.2, repeat: Infinity, ease: "easeInOut" as const },
  },
};

export default function ReactiveRockyAvatar({
  isActive,
  emotion = "neutral",
  isThinking = false,
  size = 32,
}: ReactiveRockyAvatarProps) {
  const prefersReducedMotion = useReducedMotion();

  // Loading state
  if (isThinking) {
    if (prefersReducedMotion) {
      return <RockyThinkingSvg size={size} className="rounded-full" />;
    }
    return (
      <RockyThinkingSvg
        size={size}
        className="rounded-full"
        sonarRingsProps={thinkingSonarProps}
        coreGlowProps={thinkingCoreProps}
        thinkingDotsProps={thinkingDotsProps}
      />
    );
  }

  // Reduced motion: static avatar
  if (prefersReducedMotion) {
    return <RockyAvatarSvg size={size} className="rounded-full" />;
  }

  // Active avatar: pulse sound waves and core
  if (isActive) {
    return (
      <RockyAvatarSvg
        size={size}
        className="rounded-full"
        soundWavesProps={activeWaveProps}
        coreGlowProps={activeCoreProps}
      />
    );
  }

  // Inactive: static, slight emotion-based opacity
  const opacity = emotion === "joyful" ? 0.9 : emotion === "distressed" ? 0.6 : 0.8;
  return (
    <div style={{ opacity }}>
      <RockyAvatarSvg size={size} className="rounded-full" />
    </div>
  );
}
