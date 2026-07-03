"use client";

import type { Fidelity } from "@/data/lexicon";

const FIDELITY_CONFIG: Record<
  Fidelity,
  { classes: string; description: string }
> = {
  CANON: {
    classes: "fidelity-tag fidelity-canon",
    description: "Directly from the novel text.",
  },
  "AUDIOBOOK-DERIVED": {
    classes: "fidelity-tag fidelity-audiobook",
    description: "Inferred from the audiobook performance.",
  },
  "FAN-EXTENDED": {
    classes: "fidelity-tag fidelity-fan",
    description: "Community interpretation consistent with canon rules.",
  },
  "AI-EXTENDED": {
    classes: "fidelity-tag fidelity-ai",
    description: "Generated to fill gaps using canonical constraints.",
  },
};

export default function FidelityTag({ fidelity }: { fidelity: Fidelity }) {
  const { classes, description } = FIDELITY_CONFIG[fidelity];
  return (
    <span
      className={classes}
      title={description}
      aria-label={fidelity}
      aria-description={description}
    >
      {fidelity}
    </span>
  );
}
