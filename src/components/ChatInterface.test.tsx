import type { ReactNode } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { axe } from "jest-axe";
import { describe, expect, it, vi, beforeEach } from "vitest";
import ChatInterface from "./ChatInterface";

const { callRockyAPIMock, playChordsMock, setEmotionStateMock, setEmotionIntensityMock } =
  vi.hoisted(() => ({
    callRockyAPIMock: vi.fn(),
    playChordsMock: vi.fn().mockResolvedValue(undefined),
    setEmotionStateMock: vi.fn(),
    setEmotionIntensityMock: vi.fn(),
  }));

vi.mock("@/lib/rocky-persona", () => ({
  callRockyAPI: callRockyAPIMock,
  resolveChords: (chords: unknown) => chords,
  CONVERSATION_STARTERS: [],
  ERROR_RESPONSES: [{ rocky_english: "Fallback", chords: [] }],
}));

vi.mock("@/data/lexicon", () => ({
  LEXICON_MAP: new Map(),
}));

vi.mock("@/lib/emotion-detector", () => ({
  detectEmotion: vi.fn(() => ({ state: "neutral", intensity: 0 })),
}));

vi.mock("./AudioAnalysisProvider", () => ({
  useAudioAnalysis: () => ({
    playChords: playChordsMock,
    setEmotionState: setEmotionStateMock,
    setEmotionIntensity: setEmotionIntensityMock,
  }),
}));

vi.mock("./ChordCard", () => ({
  default: ({ chordData }: { chordData: { word: string } }) => (
    <div data-testid="chord-card">{chordData.word}</div>
  ),
}));

vi.mock("./PentagonalChordViz", () => ({
  default: () => <div data-testid="viz" />,
}));

vi.mock("./ReactiveRockyHero", () => ({
  default: () => <div data-testid="hero" />,
}));

vi.mock("./ReactiveRockyAvatar", () => ({
  default: () => <div data-testid="avatar" />,
}));

vi.mock("./AtmosphereLayer", () => ({
  default: () => null,
}));

vi.mock("./XenonitePanel", () => ({
  default: ({
    children,
    className,
  }: {
    children: ReactNode;
    className?: string;
  }) => <div className={className}>{children}</div>,
}));

describe("ChatInterface accessibility", () => {
  beforeEach(() => {
    callRockyAPIMock.mockReset();
    playChordsMock.mockClear();
    setEmotionStateMock.mockClear();
    setEmotionIntensityMock.mockClear();
  });

  it("announces the chat log and thinking state, and keeps the play icon hidden from assistive tech", async () => {
    let resolveResponse:
      | ((value: {
          rocky_english: string;
          chords: Array<{
            word: string;
            tones: number[];
            fidelity: string;
            rationale: string;
            interval_type: string;
          }>;
        }) => void)
      | null = null;

    callRockyAPIMock.mockImplementation(
      () =>
        new Promise<{
          rocky_english: string;
          chords: Array<{
            word: string;
            tones: number[];
            fidelity: string;
            rationale: string;
            interval_type: string;
          }>;
        }>((resolve) => {
          resolveResponse = resolve;
        })
    );

    const { container } = render(<ChatInterface apiKey="test-key" />);

    const log = screen.getByRole("log", { name: "Conversation with Rocky" });
    expect(log).toHaveAttribute("aria-live", "polite");
    expect(log).toHaveAttribute("aria-relevant", "additions text");

    fireEvent.change(screen.getByLabelText("Message to Rocky"), {
      target: { value: "Hello Rocky" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Send" }));

    const thinkingStatus = await screen.findByRole("status");
    expect(thinkingStatus).toHaveAttribute("aria-live", "polite");
    expect(thinkingStatus).toHaveTextContent("Rocky is thinking…");

    resolveResponse?.({
      rocky_english: "Hello human",
      chords: [
        {
          word: "hello",
          tones: [440],
          fidelity: "CANON",
          rationale: "test",
          interval_type: "open",
        },
      ],
    });

    const playButton = await screen.findByRole("button", {
      name: "Play response as Eridian chords",
    });

    expect(playButton.querySelector("svg")).toHaveAttribute(
      "aria-hidden",
      "true"
    );

    const results = await axe(container);

    expect(results.violations).toHaveLength(0);
  });

  it("exposes the octave shift toggle with aria-pressed", () => {
    render(<ChatInterface apiKey="test-key" />);

    const toggle = screen.getByRole("button", { name: /mode enabled/i });

    expect(toggle).toHaveAttribute("aria-pressed", "false");

    fireEvent.click(toggle);

    expect(toggle).toHaveAttribute("aria-pressed", "true");
  });
});
