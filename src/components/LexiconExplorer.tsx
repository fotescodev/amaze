"use client";

import { useState, useId } from "react";
import { LEXICON_CLUSTERS, type ClusterName } from "@/data/lexicon";
import ChordCard from "./ChordCard";

export default function LexiconExplorer() {
  const clusters = Object.keys(LEXICON_CLUSTERS) as ClusterName[];
  const [activeCluster, setActiveCluster] = useState<ClusterName>(clusters[0]);
  const tabId = useId();
  const panelId = useId();

  const totalWords = Object.values(LEXICON_CLUSTERS).flat().length;

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-baseline gap-3">
        <h2
          className="text-lg font-bold"
          style={{
            color: "#f59e0b",
            textShadow: "0 0 12px rgba(245, 158, 11, 0.20)",
          }}
        >
          Eridian Lexicon
        </h2>
        <span
          className="text-xs font-medium"
          style={{ color: "#64748b", letterSpacing: "0.04em" }}
        >
          {totalWords} words
        </span>
      </div>

      {/* Cluster tabs */}
      <div
        role="tablist"
        aria-label="Lexicon clusters"
        className="flex flex-wrap gap-2"
      >
        {clusters.map((name, index) => {
          const isActive = activeCluster === name;
          return (
            <button
              key={name}
              role="tab"
              id={`${tabId}-${index}`}
              aria-selected={isActive}
              aria-controls={panelId}
              onClick={() => setActiveCluster(name)}
              className={[
                "rounded-full px-3 py-1.5 text-xs font-medium",
                "min-h-[36px]",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0e1a]",
              ].join(" ")}
              style={{
                background: isActive
                  ? "rgba(245, 158, 11, 0.15)"
                  : "var(--bg-secondary)",
                color: isActive ? "#f59e0b" : "#94a3b8",
                border: `1px solid ${
                  isActive
                    ? "rgba(245, 158, 11, 0.25)"
                    : "rgba(55, 65, 81, 0.50)"
                }`,
                fontWeight: isActive ? 600 : 500,
                textShadow: isActive
                  ? "0 0 10px rgba(245, 158, 11, 0.20)"
                  : "none",
                transition:
                  "color 200ms ease, background-color 200ms ease, border-color 200ms ease",
              }}
            >
              {name}
            </button>
          );
        })}
      </div>

      {/* Word cards grid */}
      <div
        id={panelId}
        role="tabpanel"
        aria-labelledby={`${tabId}-${clusters.indexOf(activeCluster)}`}
        className="grid gap-3 grid-cols-1 md:grid-cols-2"
      >
        {LEXICON_CLUSTERS[activeCluster].map((entry) => (
          <ChordCard key={entry.word} entry={entry} />
        ))}
      </div>

      {/* Fidelity disclaimer footer */}
      <footer
        className="rounded-xl p-4 text-[11px] leading-relaxed"
        style={{
          background: "rgba(6, 10, 18, 0.60)",
          border: "1px solid rgba(55, 65, 81, 0.30)",
          color: "#64748b",
          letterSpacing: "0.01em",
        }}
      >
        Eridian chord assignments are fan-extended interpretations. Only
        structural constraints (chord complexity, syllable count for 1–3) are
        canonical. See fidelity labels on each word.
      </footer>
    </div>
  );
}
