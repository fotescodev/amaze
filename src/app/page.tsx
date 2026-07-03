"use client";

import { useState, useId, useCallback, useRef, type KeyboardEvent } from "react";
import Image from "next/image";
import ChatInterface from "@/components/ChatInterface";
import LexiconExplorer from "@/components/LexiconExplorer";
import AudioAnalysisProvider from "@/components/AudioAnalysisProvider";
import { LEXICON_MAP } from "@/data/lexicon";
import { playSequence, ensureAudioReady } from "@/lib/audio-engine";

type Tab = "chat" | "lexicon";

// Quotes with key Eridian chord words to play
const ROCKY_QUOTES = [
  {
    text: "Fist my bump!",
    context: "Rocky's famous malapropism",
    chordWords: ["friend", "happy"],
  },
  {
    text: "Amaze amaze amaze!",
    context: "Rocky's signature wonder",
    chordWords: ["amaze", "amaze", "amaze"],
  },
  {
    text: "You no can die. You are friend.",
    context: "Rocky refusing to let Grace go",
    chordWords: ["no", "sad", "friend"],
  },
  {
    text: "Good good good!",
    context: "When things work out",
    chordWords: ["good", "good", "good"],
  },
  {
    text: "Happy happy happy!",
    context: "Pure Eridian joy",
    chordWords: ["happy", "happy", "happy"],
  },
  {
    text: "Eridian culture rule. Must watch.",
    context: "On watching friends sleep",
    chordWords: ["sleep", "friend"],
  },
  {
    text: "Machine that think. Eridians no have that.",
    context: "Rocky discovering computers",
    chordWords: ["think", "amaze"],
  },
  {
    text: "Your face opening is in sad mode.",
    context: "Rocky reading human emotion",
    chordWords: ["sad", "human"],
  },
];

const TABS: { id: Tab; label: string }[] = [
  { id: "chat", label: "Chat with Rocky" },
  { id: "lexicon", label: "Eridian Lexicon" },
];

function RockyQuoteCarousel() {
  const [index, setIndex] = useState(0);
  const [fading, setFading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const cancelRef = useRef<(() => void) | null>(null);

  const nextQuote = useCallback(() => {
    setFading(true);
    setTimeout(() => {
      setIndex((prev) => (prev + 1) % ROCKY_QUOTES.length);
      setFading(false);
    }, 300);
  }, []);

  const quote = ROCKY_QUOTES[index];

  const playQuoteChords = useCallback(async () => {
    if (isPlaying) {
      cancelRef.current?.();
      setIsPlaying(false);
      return;
    }

    const words = quote.chordWords
      .map((w) => LEXICON_MAP.get(w.toLowerCase()))
      .filter(Boolean);

    if (words.length === 0) return;

    // Must await resume inside user gesture for iOS
    await ensureAudioReady();

    setIsPlaying(true);
    const { promise, cancel } = playSequence(
      words.map((w) => ({ syllables: w!.syllables }))
    );
    cancelRef.current = cancel;
    promise.then(() => setIsPlaying(false));
  }, [quote, isPlaying]);

  // Get tone frequencies for display
  const toneGroups = quote.chordWords
    .map((w) => {
      const entry = LEXICON_MAP.get(w.toLowerCase());
      return entry ? { word: w, tones: entry.syllables[0].tones, glyph: entry.glyph } : null;
    })
    .filter(Boolean) as { word: string; tones: number[]; glyph: string }[];

  return (
    <div className="flex items-stretch gap-2">
      {/* Playable quote area */}
      <button
        onClick={playQuoteChords}
        className="group flex-1 rounded-xl rounded-r-none border border-r-0 border-rocky-border/50 bg-[rgba(17,24,39,0.4)] px-5 py-4 text-left transition-[border-color,box-shadow] duration-300 ease-in-out hover:border-rocky-warm/30 hover:shadow-[0_0_20px_rgba(245,158,11,0.08)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rocky-warm/50 focus-visible:ring-offset-2 focus-visible:ring-offset-rocky-bg"
        aria-label={`Play Rocky's quote: ${quote.text}`}
      >
        {/* Quote text */}
        <p
          className={`text-base font-medium text-rocky-warm transition-opacity duration-300 ease-in-out ${
            fading ? "opacity-0" : "opacity-100"
          }`}
          style={{ textShadow: "0 0 20px rgba(245, 158, 11, 0.15)" }}
        >
          &ldquo;{quote.text}&rdquo;
        </p>

        {/* Context + play hint */}
        <p
          className={`mt-1.5 text-xs text-rocky-dim transition-opacity duration-300 ease-in-out ${
            fading ? "opacity-0" : "opacity-100"
          }`}
        >
          {quote.context}
          <span className="ml-2 text-rocky-muted/60">
            {isPlaying ? "playing\u2026" : "tap to hear in Eridian"}
          </span>
        </p>

        {/* Chord tone visualization */}
        <div
          className={`mt-3 flex flex-wrap items-center gap-2 transition-opacity duration-300 ease-in-out ${
            fading ? "opacity-0" : "opacity-100"
          }`}
        >
          {toneGroups.map((group, gi) => (
            <div key={gi} className="flex items-center gap-1.5">
              {gi > 0 && (
                <span className="text-rocky-dim/40 text-[10px]" aria-hidden="true">~</span>
              )}
              <div className="flex items-end gap-[2px]">
                {group.tones.map((hz, ti) => {
                  const normalized = Math.min(1, Math.max(0, (hz - 80) / (1100 - 80)));
                  const height = 6 + normalized * 16;
                  return (
                    <div
                      key={ti}
                      className={`w-[3px] rounded-full transition-[height,background-color] duration-300 ${
                        isPlaying
                          ? "bg-rocky-warm"
                          : "bg-rocky-warm/40 group-hover:bg-rocky-warm/70"
                      }`}
                      style={{ height: `${height}px` }}
                      aria-hidden="true"
                    />
                  );
                })}
              </div>
              <span className="text-[9px] text-rocky-dim/50 font-mono">{group.word}</span>
            </div>
          ))}
      </div>
    </button>

      {/* Next arrow */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          nextQuote();
        }}
        aria-label="Next quote"
        className="flex w-10 shrink-0 items-center justify-center rounded-xl rounded-l-none border border-l-0 border-rocky-border/50 bg-[rgba(17,24,39,0.4)] text-rocky-dim transition-[color,border-color] duration-200 hover:text-rocky-warm hover:border-rocky-warm/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rocky-warm/50"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    </div>
  );
}

export default function Home() {
  const [apiKey, setApiKey] = useState("");
  const [activeTab, setActiveTab] = useState<Tab>("chat");
  const tabPanelId = useId();
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const focusTab = useCallback((nextIndex: number) => {
    const tab = TABS[nextIndex];
    if (!tab) return;

    setActiveTab(tab.id);
    tabRefs.current[nextIndex]?.focus();
  }, []);

  const handleTabKeyDown = useCallback((event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    switch (event.key) {
      case "ArrowRight":
      case "ArrowDown":
        event.preventDefault();
        focusTab((index + 1) % TABS.length);
        break;
      case "ArrowLeft":
      case "ArrowUp":
        event.preventDefault();
        focusTab((index - 1 + TABS.length) % TABS.length);
        break;
      case "Home":
        event.preventDefault();
        focusTab(0);
        break;
      case "End":
        event.preventDefault();
        focusTab(TABS.length - 1);
        break;
    }
  }, [focusTab]);

  return (
    <main className="relative flex h-screen flex-col" id="main-content">
      {/* Scan-line overlay */}
      <div
        className="pointer-events-none fixed inset-0 z-50 opacity-[0.06] motion-safe:animate-scanline"
        aria-hidden="true"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(148,163,184,0.08) 2px, rgba(148,163,184,0.08) 4px)",
        }}
      />

      {/* Tab bar */}
      <div className="border-b border-[rgba(55,65,81,0.30)] px-4 py-4">
        <div className="mx-auto w-full max-w-4xl">
          <div className="mb-3 flex items-center gap-3">
            <Image
              src="/rocky-hero.svg"
              alt="Rocky, an Eridian alien with five legs and a pentagonal body"
              width={48}
              height={48}
              priority
              className="drop-shadow-[0_0_20px_rgba(245,158,11,0.18)]"
            />
            <div>
              <h1 className="text-base font-semibold text-rocky-text">Talk to Rocky</h1>
              <p className="text-xs text-rocky-muted">
                Explore the lexicon or hear Rocky before you chat.
              </p>
            </div>
          </div>
          <RockyQuoteCarousel />
        </div>
      </div>
      <div
        role="tablist"
        aria-label="Main navigation"
        className="flex border-b border-[rgba(55,65,81,0.30)]"
        style={{ background: "var(--bg-primary, #0a0e1a)" }}
      >
        {TABS.map((tab, index) => {
          const isActive = activeTab === tab.id;
          const tabIndex = isActive ? 0 : -1;
          return (
            <button
              key={tab.id}
              role="tab"
              id={`tab-${tab.id}`}
              aria-selected={isActive}
              aria-controls={`${tabPanelId}-${tab.id}`}
              tabIndex={tabIndex}
              ref={(element) => {
                tabRefs.current[index] = element;
              }}
              onClick={() => setActiveTab(tab.id)}
              onKeyDown={(event) => handleTabKeyDown(event, index)}
              className={`flex-1 py-3 text-sm font-medium transition-[color,border-color] duration-200 ease-in-out border-b-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-rocky-warm/50 ${
                isActive
                  ? "border-rocky-warm text-rocky-warm font-semibold"
                  : "border-transparent text-rocky-muted hover:text-rocky-text"
              }`}
              style={
                isActive
                  ? { textShadow: "0 0 12px rgba(245, 158, 11, 0.20)" }
                  : undefined
              }
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab panels */}
      <div className="flex-1 overflow-hidden">
        <div
          role="tabpanel"
          id={`${tabPanelId}-chat`}
          aria-labelledby="tab-chat"
          className={activeTab === "chat" ? "h-full" : "hidden"}
        >
          {activeTab === "chat" && (
            <AudioAnalysisProvider>
              <ChatInterface apiKey={apiKey} onApiKeyChange={setApiKey} />
            </AudioAnalysisProvider>
          )}
        </div>

        <div
          role="tabpanel"
          id={`${tabPanelId}-lexicon`}
          aria-labelledby="tab-lexicon"
          className={activeTab === "lexicon" ? "h-full" : "hidden"}
        >
          {activeTab === "lexicon" && (
            <div className="h-full overflow-y-auto p-4">
              <LexiconExplorer />
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
