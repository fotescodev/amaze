"use client";

import type { Fidelity } from "@/data/lexicon";

const TAG_CLASSES: Record<Fidelity, string> = {
  CANON: "fidelity-tag fidelity-canon",
  "AUDIOBOOK-DERIVED": "fidelity-tag fidelity-audiobook",
  "FAN-EXTENDED": "fidelity-tag fidelity-fan",
  "AI-EXTENDED": "fidelity-tag fidelity-ai",
};

export default function FidelityTag({ fidelity }: { fidelity: Fidelity }) {
  return <span className={TAG_CLASSES[fidelity]}>{fidelity}</span>;
}
