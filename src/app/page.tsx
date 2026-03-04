"use client";

import { useState, useId, useCallback, useRef } from "react";
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
  const [isKeySet, setIsKeySet] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("chat");
  const tabPanelId = useId();

  if (!isKeySet) {
    return (
      <main className="relative flex min-h-screen items-center justify-center p-4" id="main-content">

        {/* Scan-line overlay */}
        <div
          className="pointer-events-none fixed inset-0 z-50 opacity-[0.06] motion-safe:animate-scanline"
          aria-hidden="true"
          style={{
            backgroundImage:
              "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(148,163,184,0.08) 2px, rgba(148,163,184,0.08) 4px)",
          }}
        />

        <div className="w-full max-w-md space-y-8 text-center">
          {/* Rocky hero image */}
          <div className="flex justify-center">
            <Image
              src="/rocky-hero.svg"
              alt="Rocky, an Eridian alien with five legs and a pentagonal body"
              width={160}
              height={160}
              priority
              className="drop-shadow-[0_0_30px_rgba(245,158,11,0.20)]"
            />
          </div>

          {/* Eridian glyph with gentle pulse */}
          <div
            className="font-mono text-3xl sm:text-[3rem] leading-none text-rocky-warm motion-safe:animate-gentle-pulse"
            aria-hidden="true"
            style={{
              textShadow: "0 0 30px rgba(245, 158, 11, 0.30)",
            }}
          >
            ◈~⊕~◈
          </div>

          {/* Title */}
          <div>
            <h1
              className="text-3xl sm:text-[2.5rem] font-bold tracking-tight text-rocky-text"
              style={{ letterSpacing: "-0.02em" }}
            >
              Talk to Rocky
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-rocky-muted">
              An Eridian communication interface powered by AI.
              <br />
              Speak to an alien who hears in chords and sees in sound.
            </p>
          </div>

          {/* Rocky quotes carousel */}
          <RockyQuoteCarousel />

          {/* Glass-morphism card */}
          <div className="glass-panel p-8 text-left space-y-5">
            <div>
              <label
                htmlFor="api-key"
                className="block text-xs font-semibold uppercase tracking-[0.06em] text-rocky-muted mb-2"
              >
                Anthropic API Key
              </label>
              <input
                id="api-key"
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-ant-…"
                autoComplete="off"
                className="w-full rounded-[10px] border border-rocky-border bg-[#060a12] px-4 py-3 text-sm text-rocky-text placeholder-rocky-dim font-mono focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rocky-warm/50 focus-visible:ring-offset-2 focus-visible:ring-offset-rocky-bg transition-[border-color,box-shadow] duration-200 ease-in-out"
                style={{
                  boxShadow: "none",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor =
                    "rgba(245, 158, 11, 0.25)";
                  e.currentTarget.style.boxShadow =
                    "0 0 0 3px rgba(245, 158, 11, 0.10)";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = "";
                  e.currentTarget.style.boxShadow = "none";
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && apiKey.trim()) {
                    setIsKeySet(true);
                  }
                }}
              />
              <p className="mt-2 text-xs text-rocky-muted">
                Your key is used client-side only. Never stored or transmitted
                to any server.
              </p>
            </div>

            <button
              onClick={() => apiKey.trim() && setIsKeySet(true)}
              disabled={!apiKey.trim()}
              className="w-full rounded-[10px] bg-rocky-warm py-3 text-sm font-semibold text-[#0a0e1a] transition-[background-color,box-shadow,transform] duration-200 ease-in-out hover:bg-[#fbbf24] hover:shadow-[0_0_20px_rgba(245,158,11,0.25)] active:scale-[0.98] active:bg-[#d97706] disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rocky-warm/50 focus-visible:ring-offset-2 focus-visible:ring-offset-rocky-bg"
            >
              Enter the Hail Mary
            </button>
          </div>

          {/* Footer disclaimer */}
          <footer className="text-xs text-rocky-dim">
            A fan project inspired by{" "}
            <span className="text-rocky-muted">Project Hail Mary</span> by Andy
            Weir.
            <br />
            Eridian chord assignments are fan-extended interpretations.
          </footer>
        </div>
      </main>
    );
  }

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
      <div
        role="tablist"
        aria-label="Main navigation"
        className="flex border-b border-[rgba(55,65,81,0.30)]"
        style={{ background: "var(--bg-primary, #0a0e1a)" }}
      >
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              role="tab"
              id={`tab-${tab.id}`}
              aria-selected={isActive}
              aria-controls={`${tabPanelId}-${tab.id}`}
              onClick={() => setActiveTab(tab.id)}
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
              <ChatInterface apiKey={apiKey} />
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
