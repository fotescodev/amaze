import type { ReactNode } from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
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
  default: () => (
    <canvas role="img" aria-label="Eridian chord visualizer — idle" />
  ),
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

    const { container } = render(
      <ChatInterface apiKey="test-key" onApiKeyChange={vi.fn()} />
    );

    expect(
      screen.getByRole("heading", { level: 1, name: "Talk to Rocky" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("img", { name: "Eridian chord visualizer — idle" })
    ).toBeInTheDocument();

    const decorativeGlyph = screen.getByText("◈~⊕~◈");
    expect(decorativeGlyph).toHaveAttribute("aria-hidden", "true");

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
    expect(
      thinkingStatus.querySelector('span[aria-hidden="true"]')
    ).toHaveAttribute(
      "aria-hidden",
      "true"
    );

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
    render(<ChatInterface apiKey="test-key" onApiKeyChange={vi.fn()} />);

    const toggle = screen.getByRole("button", { name: /mode enabled/i });

    expect(toggle).toHaveAttribute("aria-pressed", "false");

    fireEvent.click(toggle);

    expect(toggle).toHaveAttribute("aria-pressed", "true");
  });

  it("uses contained overscroll on the chat log and disables smooth scrolling under reduced motion", async () => {
    const scrollToMock = vi.fn();
    Object.defineProperty(HTMLElement.prototype, "scrollTo", {
      writable: true,
      value: scrollToMock,
    });
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: query === "(prefers-reduced-motion: reduce)",
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));
    callRockyAPIMock.mockResolvedValue({
      rocky_english: "Hello human",
      chords: [],
    });

    render(<ChatInterface apiKey="test-key" onApiKeyChange={vi.fn()} />);

    const log = screen.getByRole("log", { name: "Conversation with Rocky" });
    expect(log).toHaveClass("overscroll-contain");

    fireEvent.change(screen.getByLabelText("Message to Rocky"), {
      target: { value: "Hello Rocky" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Send" }));

    await waitFor(() =>
      expect(scrollToMock).toHaveBeenCalledWith(
        expect.objectContaining({ behavior: "auto" })
      )
    );
  });

  it("surfaces an inline API key prompt when sending without a key", () => {
    render(<ChatInterface apiKey="" onApiKeyChange={vi.fn()} />);

    fireEvent.change(screen.getByLabelText("Message to Rocky"), {
      target: { value: "Hello Rocky" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Send" }));

    expect(screen.getByLabelText("Anthropic API Key")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Unlock Chat" })).toBeInTheDocument();
    expect(callRockyAPIMock).not.toHaveBeenCalled();
  });

  it("submits the queued message after an inline API key entry", async () => {
    const onApiKeyChange = vi.fn();
    callRockyAPIMock.mockResolvedValue({
      rocky_english: "Hello human",
      chords: [],
    });

    const { rerender } = render(
      <ChatInterface apiKey="" onApiKeyChange={onApiKeyChange} />
    );

    fireEvent.change(screen.getByLabelText("Message to Rocky"), {
      target: { value: "Hello Rocky" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Send" }));

    fireEvent.change(screen.getByLabelText("Anthropic API Key"), {
      target: { value: "test-key" },
    });
    expect(onApiKeyChange).toHaveBeenCalledWith("test-key");

    rerender(<ChatInterface apiKey="test-key" onApiKeyChange={onApiKeyChange} />);
    fireEvent.click(screen.getByRole("button", { name: "Unlock Chat" }));

    expect(callRockyAPIMock).toHaveBeenCalledWith(
      [{ role: "user", content: "Hello Rocky" }],
      "test-key"
    );
    expect(await screen.findByText("Hello human")).toBeInTheDocument();
  });
});
