"use client";

import { useState, useId, useRef, useCallback, type KeyboardEvent } from "react";
import { LEXICON_CLUSTERS, type ClusterName } from "@/data/lexicon";
import ChordCard from "./ChordCard";

export default function LexiconExplorer() {
  const clusters = Object.keys(LEXICON_CLUSTERS) as ClusterName[];
  const [activeCluster, setActiveCluster] = useState<ClusterName>(clusters[0]);
  const tabId = useId();
  const panelId = useId();
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const totalWords = Object.values(LEXICON_CLUSTERS).flat().length;
  const focusTab = useCallback((nextIndex: number) => {
    const cluster = clusters[nextIndex];
    if (!cluster) return;

    setActiveCluster(cluster);
    tabRefs.current[nextIndex]?.focus();
  }, [clusters]);

  const handleTabKeyDown = useCallback((event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    switch (event.key) {
      case "ArrowRight":
      case "ArrowDown":
        event.preventDefault();
        focusTab((index + 1) % clusters.length);
        break;
      case "ArrowLeft":
      case "ArrowUp":
        event.preventDefault();
        focusTab((index - 1 + clusters.length) % clusters.length);
        break;
      case "Home":
        event.preventDefault();
        focusTab(0);
        break;
      case "End":
        event.preventDefault();
        focusTab(clusters.length - 1);
        break;
    }
  }, [clusters.length, focusTab]);

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
              tabIndex={isActive ? 0 : -1}
              ref={(element) => {
                tabRefs.current[index] = element;
              }}
              onClick={() => setActiveCluster(name)}
              onKeyDown={(event) => handleTabKeyDown(event, index)}
              className={[
                "rounded-full px-3.5 py-2 text-xs font-medium",
                "min-h-[44px]",
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
        className="rounded-xl p-4 text-xs leading-relaxed"
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
