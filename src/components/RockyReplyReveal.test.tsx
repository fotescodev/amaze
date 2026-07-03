import { render, screen } from "@testing-library/react";
import { axe } from "jest-axe";
import { afterEach, describe, expect, it, vi } from "vitest";
import RockyReplyReveal from "./RockyReplyReveal";

const response = {
  rocky_english: "zorin tal vex",
  chords: [
    {
      word: "zorin",
      tones: [220, 330],
      fidelity: "CANON" as const,
      interval_type: "consonant" as const,
      rationale: "test",
    },
    {
      word: "tal",
      tones: [247, 370],
      fidelity: "FAN-EXTENDED" as const,
      interval_type: "dissonant" as const,
      rationale: "test",
    },
    {
      word: "vex",
      tones: [262, 392],
      fidelity: "AI-EXTENDED" as const,
      interval_type: "open" as const,
      rationale: "test",
    },
  ],
};

function mockMatchMedia(matches: boolean) {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: query === "(prefers-reduced-motion: reduce)" ? matches : false,
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
}

describe("RockyReplyReveal", () => {
  afterEach(() => {
    mockMatchMedia(false);
  });

  it("renders no decoded English at zero, first two words at two, and all words when fully revealed", () => {
    mockMatchMedia(false);

    const { rerender } = render(
      <RockyReplyReveal response={response} revealedCount={0} />
    );

    expect(screen.queryByText("zorin")).not.toBeInTheDocument();
    expect(screen.queryByText("tal")).not.toBeInTheDocument();
    expect(screen.getAllByText("◉◉")).toHaveLength(3);

    rerender(<RockyReplyReveal response={response} revealedCount={2} />);

    expect(screen.getByText("zorin")).toBeInTheDocument();
    expect(screen.getByText("tal")).toBeInTheDocument();
    expect(screen.queryByText("vex")).not.toBeInTheDocument();
    expect(screen.getAllByText("◉◉")).toHaveLength(1);

    rerender(<RockyReplyReveal response={response} revealedCount={3} />);

    expect(screen.getByText("zorin")).toBeInTheDocument();
    expect(screen.getByText("tal")).toBeInTheDocument();
    expect(screen.getByText("vex")).toBeInTheDocument();
    expect(screen.queryByText("◉◉")).not.toBeInTheDocument();
  });

  it("renders full English immediately without animation classes under reduced motion", () => {
    mockMatchMedia(true);

    render(<RockyReplyReveal response={response} revealedCount={0} />);

    expect(screen.getByText("zorin tal vex")).toBeInTheDocument();
    expect(screen.queryByText("◉◉")).not.toBeInTheDocument();
    expect(document.querySelector(".rocky-reply-token-active")).toBeNull();
  });

  it("has no axe violations during reveal and once fully revealed", async () => {
    mockMatchMedia(false);

    const { container, rerender } = render(
      <RockyReplyReveal response={response} revealedCount={1} />
    );

    expect((await axe(container)).violations).toHaveLength(0);

    rerender(<RockyReplyReveal response={response} revealedCount={3} />);

    expect((await axe(container)).violations).toHaveLength(0);
  });

  it("assigns distinct tint classes for consonant, dissonant, and open words", () => {
    mockMatchMedia(false);

    render(<RockyReplyReveal response={response} revealedCount={3} />);

    expect(screen.getByText("zorin")).toHaveClass("rocky-reply-tint-consonant");
    expect(screen.getByText("tal")).toHaveClass("rocky-reply-tint-dissonant");
    expect(screen.getByText("vex")).toHaveClass("rocky-reply-tint-open");
  });
});
