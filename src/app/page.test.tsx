import type { ReactNode } from "react";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import Home from "./page";
import RootLayout, { metadata, viewport } from "./layout";

vi.mock("next/font/google", () => ({
  JetBrains_Mono: () => ({ variable: "font-mock" }),
}));

vi.mock("next/image", () => ({
  default: ({ alt, ...props }: { alt: string }) => <img alt={alt} {...props} />,
}));

vi.mock("@/components/ChatInterface", () => ({
  default: () => <div>Chat panel</div>,
}));

vi.mock("@/components/LexiconExplorer", () => ({
  default: () => <div>Lexicon panel</div>,
}));

vi.mock("@/components/AudioAnalysisProvider", () => ({
  default: ({ children }: { children: ReactNode }) => <>{children}</>,
}));

vi.mock("@/lib/audio-engine", () => ({
  ensureAudioReady: vi.fn(),
  playSequence: vi.fn(() => ({ promise: Promise.resolve(), cancel: vi.fn() })),
}));

vi.mock("@/data/lexicon", () => ({
  LEXICON_MAP: new Map([
    ["friend", { syllables: [{ tones: [440] }], glyph: "◉" }],
    ["happy", { syllables: [{ tones: [660] }], glyph: "◉" }],
    ["amaze", { syllables: [{ tones: [550] }], glyph: "◉" }],
    ["no", { syllables: [{ tones: [330] }], glyph: "◉" }],
    ["sad", { syllables: [{ tones: [220] }], glyph: "◉" }],
    ["sleep", { syllables: [{ tones: [110] }], glyph: "◉" }],
    ["think", { syllables: [{ tones: [770] }], glyph: "◉" }],
    ["human", { syllables: [{ tones: [880] }], glyph: "◉" }],
  ]),
}));

describe("Home accessibility", () => {
  it("exports dark theme metadata for browser chrome and native controls", () => {
    expect(metadata.other).toMatchObject({ "theme-color": "#0f172a" });
    expect(viewport.themeColor).toBe("#0f172a");

    const { container } = render(<RootLayout><main id="main-content" /></RootLayout>);
    const html = container.querySelector("html");

    expect(html).not.toBeNull();
    expect(html).toHaveStyle({ colorScheme: "dark" });
  });

  it("defines dark-theme and contrast tokens in the global stylesheet", () => {
    const globalsCss = readFileSync(resolve(process.cwd(), "src/app/globals.css"), "utf8");

    expect(globalsCss).toContain("color-scheme: dark;");
    expect(globalsCss).toContain("--text-secondary: #94a3b8;");
    expect(globalsCss).toContain("--text-tertiary: #a5b4c7;");
    expect(globalsCss).toContain("outline: 2px solid var(--amber-300) !important;");
  });

  it("renders a skip link that targets the main landmark", () => {
    render(<RootLayout><main id="main-content" /></RootLayout>);

    const skipLink = screen.getByRole("link", { name: "Skip to main content" });
    expect(skipLink).toHaveAttribute("href", "#main-content");
    expect(document.getElementById("main-content")).not.toBeNull();
  });

  it("exposes main tabs with roving focus and arrow key navigation", () => {
    render(<Home />);

    fireEvent.change(screen.getByLabelText("Anthropic API Key"), {
      target: { value: "test-key" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Enter the Hail Mary" }));

    const chatTab = screen.getByRole("tab", { name: "Chat with Rocky" });
    const lexiconTab = screen.getByRole("tab", { name: "Eridian Lexicon" });

    expect(chatTab).toHaveAttribute("aria-selected", "true");
    expect(chatTab).toHaveAttribute("tabindex", "0");
    expect(chatTab).toHaveAttribute("aria-controls");
    expect(lexiconTab).toHaveAttribute("aria-selected", "false");
    expect(lexiconTab).toHaveAttribute("tabindex", "-1");
    expect(lexiconTab).toHaveAttribute("aria-controls");

    fireEvent.keyDown(chatTab, { key: "ArrowRight" });

    expect(lexiconTab).toHaveFocus();
    expect(lexiconTab).toHaveAttribute("aria-selected", "true");
    expect(chatTab).toHaveAttribute("aria-selected", "false");
  });
});
