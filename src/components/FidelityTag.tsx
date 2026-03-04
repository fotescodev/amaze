"use client";

import type { Fidelity } from "@/data/lexicon";

const FIDELITY_CONFIG: Record<
  Fidelity,
  { classes: string; title: string }
> = {
  CANON: {
    classes: "fidelity-tag fidelity-canon",
    title: "Canon — directly from the novel text",
  },
  "AUDIOBOOK-DERIVED": {
    classes: "fidelity-tag fidelity-audiobook",
    title: "Audiobook-derived — inferred from the audiobook performance",
  },
  "FAN-EXTENDED": {
    classes: "fidelity-tag fidelity-fan",
    title: "Fan-extended — community interpretation consistent with canon rules",
  },
  "AI-EXTENDED": {
    classes: "fidelity-tag fidelity-ai",
    title: "AI-extended — generated to fill gaps using canonical constraints",
  },
};

export default function FidelityTag({ fidelity }: { fidelity: Fidelity }) {
  const { classes, title } = FIDELITY_CONFIG[fidelity];
  return (
    <span className={classes} title={title}>
      {fidelity}
    </span>
  );
}
