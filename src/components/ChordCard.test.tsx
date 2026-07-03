import { fireEvent, render, screen } from "@testing-library/react";
import { axe } from "jest-axe";
import { vi, describe, expect, it } from "vitest";
import ChordCard from "./ChordCard";

vi.mock("@/lib/audio-engine", () => ({
  playWord: vi.fn(() => ({ endTime: 1 })),
  getAudioContext: vi.fn(() => ({ currentTime: 0 })),
}));

const entry = {
  word: "amaze",
  gloss: "test gloss",
  glyph: "◉",
  fidelity: "CANON" as const,
  intervalType: "open" as const,
  syllables: [{ tones: [440, 660] }],
};

describe("ChordCard accessibility", () => {
  it("labels the icon-only play button and hides its svg", () => {
    render(<ChordCard entry={entry} />);

    const playButton = screen.getByRole("button", {
      name: 'Play chord for "amaze"',
    });

    expect(playButton.querySelector("svg")).toHaveAttribute(
      "aria-hidden",
      "true"
    );
  });

  it("has no axe violations in compact mode", async () => {
    const { container } = render(<ChordCard entry={entry} compact />);
    const results = await axe(container);

    expect(results.violations).toHaveLength(0);
  });

  it("exposes the fidelity tag with an accessible name and description", () => {
    render(<ChordCard entry={entry} />);

    const fidelityTag = screen.getByText("CANON");

    expect(fidelityTag).toHaveAccessibleName("CANON");
    expect(fidelityTag).toHaveAccessibleDescription(
      "Directly from the novel text."
    );
  });

  it("exposes the expanded card as a focusable keyboard-activatable control", () => {
    render(<ChordCard entry={entry} />);

    const card = screen.getByRole("button", {
      name: 'amaze — click to expand details',
    });

    expect(card).toHaveAttribute("tabindex", "0");
    expect(card).toHaveAttribute("aria-expanded", "false");

    fireEvent.keyDown(card, { key: "Enter" });

    expect(card).toHaveAttribute("aria-expanded", "true");
  });
});
