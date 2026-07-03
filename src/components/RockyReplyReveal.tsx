"use client";

import { useEffect, useState } from "react";
import { LEXICON_MAP } from "@/data/lexicon";
import type { ChordData, RockyResponse } from "@/lib/rocky-persona";

interface RockyReplyRevealProps {
  response: RockyResponse;
  revealedCount: number;
}

const TINT_CLASS_BY_INTERVAL: Record<ChordData["interval_type"], string> = {
  consonant: "rocky-reply-tint-consonant",
  dissonant: "rocky-reply-tint-dissonant",
  open: "rocky-reply-tint-open",
};

function getGlyph(chord: ChordData) {
  return (
    LEXICON_MAP.get(chord.word.toLowerCase())?.glyph ??
    chord.tones.map(() => "\u25C9").join("")
  );
}

export default function RockyReplyReveal({
  response,
  revealedCount,
}: RockyReplyRevealProps) {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(() =>
    typeof window !== "undefined"
      ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
      : false
  );

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const syncPreference = () => setPrefersReducedMotion(mediaQuery.matches);

    syncPreference();
    mediaQuery.addEventListener("change", syncPreference);

    return () => {
      mediaQuery.removeEventListener("change", syncPreference);
    };
  }, []);

  if (prefersReducedMotion) {
    return (
      <div>
        <p
          aria-live="polite"
          className="text-sm leading-relaxed text-rocky-text"
        >
          {response.rocky_english}
        </p>
      </div>
    );
  }

  const activeIndex =
    revealedCount >= 0 && revealedCount < response.chords.length
      ? revealedCount
      : -1;

  return (
    <div>
      <p className="sr-only" aria-live="polite">
        {response.rocky_english}
      </p>
      <p
        aria-hidden="true"
        className="flex flex-wrap gap-x-2 gap-y-2 text-sm leading-relaxed text-rocky-text"
      >
        {response.chords.map((chord, index) => {
          const glyph = getGlyph(chord);
          const tintClass = TINT_CLASS_BY_INTERVAL[chord.interval_type];

          if (index < revealedCount) {
            return (
              <span
                key={`${chord.word}-${index}`}
                className={`rocky-reply-token ${tintClass}`}
              >
                {chord.word}
              </span>
            );
          }

          if (index === activeIndex) {
            return (
              <span
                key={`${chord.word}-${index}`}
                className={`rocky-reply-token rocky-reply-token-active ${tintClass}`}
                data-word={chord.word}
              >
                <span className="rocky-reply-glyph" aria-hidden="true">
                  {glyph}
                </span>
              </span>
            );
          }

          return (
            <span
              key={`${chord.word}-${index}`}
              className={`rocky-reply-token ${tintClass}`}
            >
              {glyph}
            </span>
          );
        })}
      </p>
    </div>
  );
}
