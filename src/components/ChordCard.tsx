"use client";

import { useState } from "react";
import type { LexiconEntry, Fidelity } from "@/data/lexicon";
import type { ChordData } from "@/lib/rocky-persona";
import { playWord } from "@/lib/audio-engine";
import FidelityTag from "./FidelityTag";

interface ChordCardProps {
  entry?: LexiconEntry;
  chordData?: ChordData;
  isHighlighted?: boolean;
  compact?: boolean;
}

export default function ChordCard({
  entry,
  chordData,
  isHighlighted = false,
  compact = false,
}: ChordCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const word = entry?.word ?? chordData?.word ?? "";
  const tones = entry?.syllables[0]?.tones ?? chordData?.tones ?? [];
  const fidelity: Fidelity = entry?.fidelity ?? (chordData?.fidelity as Fidelity) ?? "FAN-EXTENDED";
  const glyph = entry?.glyph ?? tones.map(() => "◉").join("");
  const gloss = entry?.gloss ?? chordData?.rationale ?? "";
  const intervalType = entry?.intervalType ?? chordData?.interval_type ?? "open";
  const syllables = entry?.syllables ?? [{ tones }];

  const handlePlay = () => {
    if (isPlaying) return;
    setIsPlaying(true);
    const { endTime } = playWord({ syllables });
    const ctx = new AudioContext();
    const duration = (endTime - ctx.currentTime) * 1000;
    ctx.close();
    setTimeout(() => setIsPlaying(false), Math.max(duration, 600));
  };

  if (compact) {
    return (
      <button
        onClick={handlePlay}
        className={`chord-card inline-flex items-center gap-2 px-2 py-1 text-sm transition-all ${
          isHighlighted ? "border-rocky-warm glow-warm" : ""
        } ${isPlaying ? "border-rocky-warm/60" : ""}`}
      >
        <span className="text-rocky-warm font-mono text-xs">{glyph}</span>
        <span className="text-rocky-text">{word}</span>
        <FidelityTag fidelity={fidelity} />
      </button>
    );
  }

  return (
    <div
      className={`chord-card cursor-pointer ${
        isHighlighted ? "border-rocky-warm glow-warm" : ""
      }`}
      onClick={() => setExpanded(!expanded)}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-rocky-warm font-mono text-lg">{glyph}</span>
          <div>
            <span className="text-rocky-text font-semibold">{word}</span>
            <div className="mt-0.5 text-xs text-rocky-muted">
              {tones.map((t) => `${t} Hz`).join(" + ")}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <FidelityTag fidelity={fidelity} />
          <button
            onClick={(e) => {
              e.stopPropagation();
              handlePlay();
            }}
            className={`rounded-full p-2 transition-colors ${
              isPlaying
                ? "bg-rocky-warm text-rocky-bg"
                : "bg-rocky-bg text-rocky-warm hover:bg-rocky-warm/20"
            }`}
            title="Play chord"
          >
            {isPlaying ? (
              <svg className="h-4 w-4 animate-pulse" fill="currentColor" viewBox="0 0 24 24">
                <rect x="6" y="4" width="4" height="16" />
                <rect x="14" y="4" width="4" height="16" />
              </svg>
            ) : (
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {expanded && (
        <div className="mt-3 border-t border-rocky-border pt-3">
          <div className="space-y-1 text-xs text-rocky-muted">
            <div>
              <span className="text-rocky-text">Interval type:</span>{" "}
              <span className="capitalize">{intervalType}</span>
            </div>
            {syllables.length > 1 && (
              <div>
                <span className="text-rocky-text">Syllables:</span>{" "}
                {syllables.map((s, i) => (
                  <span key={i}>
                    {i > 0 && " ~ "}
                    [{s.tones.map((t) => `${t}`).join(", ")}]
                  </span>
                ))}
              </div>
            )}
            <div>
              <span className="text-rocky-text">Rationale:</span> {gloss}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
