"use client";

import { useState, useCallback } from "react";
import type { LexiconEntry, Fidelity } from "@/data/lexicon";
import type { ChordData } from "@/lib/rocky-persona";
import { playWord, getAudioContext } from "@/lib/audio-engine";
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
  const fidelity: Fidelity =
    entry?.fidelity ?? (chordData?.fidelity as Fidelity) ?? "FAN-EXTENDED";
  const glyph = entry?.glyph ?? tones.map(() => "\u25C9").join("");
  const gloss = entry?.gloss ?? chordData?.rationale ?? "";
  const intervalType =
    entry?.intervalType ?? chordData?.interval_type ?? "open";
  const syllables = entry?.syllables ?? [{ tones }];

  const handlePlay = useCallback(() => {
    if (isPlaying) return;
    setIsPlaying(true);
    const { endTime } = playWord({ syllables });
    const ctx = getAudioContext();
    const duration = (endTime - ctx.currentTime) * 1000;
    setTimeout(() => setIsPlaying(false), Math.max(duration, 600));
  }, [isPlaying, syllables]);

  /* ── Compact mode (inline in chat) ──────────────────────────────────── */
  if (compact) {
    return (
      <button
        onClick={handlePlay}
        aria-label={`Play Eridian chord for "${word}"`}
        className={[
          "inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm",
          "min-h-[44px] min-w-[44px]",
          "cursor-pointer",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0e1a]",
          isHighlighted || isPlaying
            ? "border-amber-500 bg-[rgba(245,158,11,0.08)]"
            : "border-[rgba(55,65,81,0.30)] bg-[rgba(17,24,39,0.50)]",
          isHighlighted || isPlaying
            ? "shadow-[0_0_20px_rgba(245,158,11,0.30)]"
            : "",
        ]
          .join(" ")}
        style={{
          border: `1px solid ${
            isHighlighted || isPlaying
              ? "rgba(245, 158, 11, 0.50)"
              : "rgba(55, 65, 81, 0.30)"
          }`,
          borderRadius: "8px",
          transition:
            "border-color 200ms ease, box-shadow 200ms ease, background-color 200ms ease",
        }}
      >
        <span
          className="font-mono text-xs"
          style={{
            color: "#f59e0b",
            textShadow: "0 0 10px rgba(245, 158, 11, 0.30)",
          }}
        >
          {glyph}
        </span>
        <span className="text-[#e2e8f0]">{word}</span>
        <FidelityTag fidelity={fidelity} />
      </button>
    );
  }

  /* ── Expanded mode (in Lexicon Explorer) ────────────────────────────── */
  return (
    <div
      role="button"
      tabIndex={0}
      aria-expanded={expanded}
      aria-label={`${word} — click to ${expanded ? "collapse" : "expand"} details`}
      onClick={() => setExpanded(!expanded)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          setExpanded(!expanded);
        }
      }}
      className={[
        "cursor-pointer rounded-xl p-4",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0e1a]",
      ].join(" ")}
      style={{
        background: expanded
          ? "rgba(17, 24, 39, 0.90)"
          : "var(--bg-secondary)",
        border: `1px solid ${
          expanded
            ? "rgba(245, 158, 11, 0.50)"
            : isHighlighted
              ? "rgba(245, 158, 11, 0.25)"
              : "rgba(55, 65, 81, 0.50)"
        }`,
        borderRadius: "12px",
        boxShadow: expanded
          ? "0 0 24px rgba(245, 158, 11, 0.15)"
          : isHighlighted
            ? "0 0 16px rgba(245, 158, 11, 0.15)"
            : "none",
        transition:
          "border-color 200ms ease, box-shadow 200ms ease, transform 200ms ease, background-color 200ms ease",
        transform: "translateY(0)",
      }}
      onMouseEnter={(e) => {
        if (!expanded) {
          e.currentTarget.style.borderColor = "rgba(245, 158, 11, 0.25)";
          e.currentTarget.style.boxShadow =
            "0 0 16px rgba(245, 158, 11, 0.15)";
          e.currentTarget.style.transform = "translateY(-1px)";
        }
      }}
      onMouseLeave={(e) => {
        if (!expanded) {
          e.currentTarget.style.borderColor = isHighlighted
            ? "rgba(245, 158, 11, 0.25)"
            : "rgba(55, 65, 81, 0.50)";
          e.currentTarget.style.boxShadow = isHighlighted
            ? "0 0 16px rgba(245, 158, 11, 0.15)"
            : "none";
          e.currentTarget.style.transform = "translateY(0)";
        }
      }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span
            className="font-mono text-lg"
            style={{
              color: "#f59e0b",
              textShadow: "0 0 12px rgba(245, 158, 11, 0.30)",
            }}
          >
            {glyph}
          </span>
          <div>
            <span className="font-semibold text-[#e2e8f0]">{word}</span>
            <div
              className="mt-0.5 text-xs"
              style={{ color: "#94a3b8", fontVariantNumeric: "tabular-nums" }}
            >
              {tones.map((t) => `${t}\u00a0Hz`).join(" + ")}
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
            aria-label={`Play chord for "${word}"`}
            className={[
              "rounded-full p-2 min-h-[36px] min-w-[36px]",
              "flex items-center justify-center",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0e1a]",
            ].join(" ")}
            style={{
              background: isPlaying
                ? "#f59e0b"
                : "var(--bg-inset)",
              color: isPlaying ? "#0a0e1a" : "#f59e0b",
              border: `1px solid ${
                isPlaying
                  ? "transparent"
                  : "rgba(55, 65, 81, 0.30)"
              }`,
              boxShadow: isPlaying
                ? "0 0 16px rgba(245, 158, 11, 0.15)"
                : "none",
              transition:
                "background-color 200ms ease, color 200ms ease, border-color 200ms ease, box-shadow 200ms ease",
            }}
          >
            {isPlaying ? (
              <svg
                className="h-4 w-4"
                fill="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <rect x="6" y="4" width="4" height="16" />
                <rect x="14" y="4" width="4" height="16" />
              </svg>
            ) : (
              <svg
                className="h-4 w-4"
                fill="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {expanded && (
        <div
          className="mt-3 border-t pt-3"
          style={{ borderColor: "rgba(55, 65, 81, 0.30)" }}
        >
          <dl className="space-y-1.5 text-xs" style={{ color: "#94a3b8" }}>
            <div className="flex gap-2">
              <dt className="font-medium text-[#e2e8f0]">Interval:</dt>
              <dd className="capitalize">{intervalType}</dd>
            </div>
            {syllables.length > 1 && (
              <div className="flex gap-2">
                <dt className="font-medium text-[#e2e8f0]">Syllables:</dt>
                <dd>
                  {syllables.map((s, i) => (
                    <span key={i}>
                      {i > 0 && " ~ "}[
                      {s.tones.map((t) => `${t}`).join(", ")}]
                    </span>
                  ))}
                </dd>
              </div>
            )}
            <div className="flex gap-2">
              <dt className="font-medium text-[#e2e8f0]">Rationale:</dt>
              <dd>{gloss}</dd>
            </div>
          </dl>
        </div>
      )}
    </div>
  );
}
