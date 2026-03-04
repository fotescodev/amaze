"use client";

import { useState } from "react";
import { LEXICON_CLUSTERS, type ClusterName } from "@/data/lexicon";
import ChordCard from "./ChordCard";

export default function LexiconExplorer() {
  const clusters = Object.keys(LEXICON_CLUSTERS) as ClusterName[];
  const [activeCluster, setActiveCluster] = useState<ClusterName>(clusters[0]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <h2 className="text-lg font-semibold text-rocky-warm">
          Eridian Lexicon
        </h2>
        <span className="text-xs text-rocky-muted">
          {Object.values(LEXICON_CLUSTERS).flat().length} words
        </span>
      </div>

      {/* Cluster tabs */}
      <div className="flex flex-wrap gap-2">
        {clusters.map((name) => (
          <button
            key={name}
            onClick={() => setActiveCluster(name)}
            className={`rounded-full px-3 py-1 text-xs transition-colors ${
              activeCluster === name
                ? "bg-rocky-warm text-rocky-bg font-semibold"
                : "bg-rocky-surface text-rocky-muted hover:text-rocky-text border border-rocky-border"
            }`}
          >
            {name}
          </button>
        ))}
      </div>

      {/* Word cards */}
      <div className="grid gap-2">
        {LEXICON_CLUSTERS[activeCluster].map((entry) => (
          <ChordCard key={entry.word} entry={entry} />
        ))}
      </div>

      {/* Fidelity footer */}
      <div className="rounded-md border border-rocky-border bg-rocky-bg/50 p-3 text-[11px] text-rocky-muted">
        Eridian chord assignments are fan-extended interpretations. Only
        structural constraints (chord complexity, syllable count for 1–3) are
        canonical. See fidelity labels on each word.
      </div>
    </div>
  );
}
