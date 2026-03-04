"use client";

import { useState, useRef, useEffect } from "react";
import type { ChordData, RockyResponse, ChatMessage } from "@/lib/rocky-persona";
import {
  callRockyAPI,
  resolveChords,
  CONVERSATION_STARTERS,
  ERROR_RESPONSES,
} from "@/lib/rocky-persona";
import { LEXICON_MAP } from "@/data/lexicon";
import type { PlayableWord } from "@/lib/audio-engine";
import { useAudioAnalysis } from "./AudioAnalysisProvider";
import { detectEmotion, type EmotionState } from "@/lib/emotion-detector";
import ChordCard from "./ChordCard";
import PentagonalChordViz from "./PentagonalChordViz";
import ReactiveRockyHero from "./ReactiveRockyHero";
import ReactiveRockyAvatar from "./ReactiveRockyAvatar";
import AtmosphereLayer from "./AtmosphereLayer";
import XenonitePanel from "./XenonitePanel";

interface ChatInterfaceProps {
  apiKey: string;
}

export default function ChatInterface({ apiKey }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [playingMessageIdx, setPlayingMessageIdx] = useState<number | null>(
    null
  );
  const [highlightedWordIdx, setHighlightedWordIdx] = useState<number | null>(
    null
  );
  const [octaveShift, setOctaveShift] = useState(false);
  const [messageEmotions, setMessageEmotions] = useState<Map<number, EmotionState>>(new Map());

  const audio = useAudioAnalysis();
  const learnedWordsRef = useRef<Map<string, ChordData>>(new Map());
  const scrollRef = useRef<HTMLDivElement>(null);
  const prevMessageCountRef = useRef(0);

  // Auto-scroll on new messages, respecting reduced motion
  useEffect(() => {
    if (messages.length > prevMessageCountRef.current) {
      const prefersReduced = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;
      scrollRef.current?.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: prefersReduced ? "instant" : "smooth",
      });
    }
    prevMessageCountRef.current = messages.length;
  }, [messages]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMessage: ChatMessage = { role: "user", content: text.trim() };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);
    audio.setEmotionState("thinking");

    try {
      const apiMessages = newMessages.map((m) => ({
        role: m.role,
        content:
          m.role === "assistant" && m.rockyResponse
            ? JSON.stringify(m.rockyResponse)
            : m.content,
      }));

      const response = await callRockyAPI(apiMessages, apiKey);

      // Resolve chords against lexicon
      response.chords = resolveChords(
        response.chords,
        learnedWordsRef.current
      );

      // Detect emotion from response
      const emotion = detectEmotion(response);
      audio.setEmotionState(emotion.state);
      audio.setEmotionIntensity(emotion.intensity);

      const assistantMessage: ChatMessage = {
        role: "assistant",
        content: response.rocky_english,
        rockyResponse: response,
      };

      const msgIdx = newMessages.length;
      setMessages([...newMessages, assistantMessage]);
      setMessageEmotions((prev) => new Map(prev).set(msgIdx, emotion.state));
    } catch (error) {
      console.error("Rocky API error:", error);
      const fallback =
        ERROR_RESPONSES[Math.floor(Math.random() * ERROR_RESPONSES.length)];
      const assistantMessage: ChatMessage = {
        role: "assistant",
        content: fallback.rocky_english,
        rockyResponse: fallback,
      };
      audio.setEmotionState("neutral");
      const msgIdx = newMessages.length;
      setMessages([...newMessages, assistantMessage]);
      setMessageEmotions((prev) => new Map(prev).set(msgIdx, "neutral"));
    } finally {
      setIsLoading(false);
    }
  };

  const playResponse = (msgIdx: number, response: RockyResponse) => {
    if (playingMessageIdx !== null) return;

    const words: PlayableWord[] = response.chords.map((chord) => {
      const lexEntry = LEXICON_MAP.get(chord.word.toLowerCase());
      if (lexEntry) {
        return { syllables: lexEntry.syllables };
      }
      return { syllables: [{ tones: chord.tones }] };
    });

    if (words.length === 0) return;

    setPlayingMessageIdx(msgIdx);

    audio
      .playChords(words, octaveShift, (wordIdx) => {
        setHighlightedWordIdx(wordIdx);
      })
      .then(() => {
        setPlayingMessageIdx(null);
        setHighlightedWordIdx(null);
      });
  };

  return (
    <div className="flex h-full flex-col">
      {/* Background atmosphere particles */}
      <AtmosphereLayer />

      {/* Header */}
      <div className="flex items-center justify-between border-b border-rocky-border px-4 py-3">
        <div className="flex items-center gap-3">
          <ReactiveRockyHero className="h-10 w-10 drop-shadow-[0_0_12px_rgba(245,158,11,0.20)]" />
          <h1 className="text-sm font-semibold text-rocky-text">
            Talk to Rocky
          </h1>
        </div>
        <button
          onClick={() => setOctaveShift(!octaveShift)}
          aria-pressed={octaveShift}
          aria-label={
            octaveShift
              ? "Emphatic mode enabled, click to switch to normal mode"
              : "Normal mode enabled, click to switch to emphatic mode"
          }
          className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0e1a] ${
            octaveShift
              ? "bg-rocky-warm text-rocky-bg font-semibold"
              : "border border-rocky-border bg-rocky-surface text-rocky-muted hover:text-rocky-text hover:border-[rgba(245,158,11,0.25)]"
          }`}
        >
          {octaveShift ? "Emphatic Mode" : "Normal Mode"}
        </button>
      </div>

      {/* Pentagonal Chord Visualizer */}
      <div
        className="border-b border-rocky-border px-4 py-2"
        style={{
          background: "var(--bg-inset)",
          border: "1px solid rgba(55, 65, 81, 0.30)",
          borderRadius: "0",
          height: "120px",
        }}
      >
        <PentagonalChordViz mode="live" />
      </div>

      {/* Messages */}
      <XenonitePanel className="flex-1 overflow-hidden">
        <div
          ref={scrollRef}
          role="log"
          aria-live="polite"
          aria-label="Conversation with Rocky"
          className="h-full space-y-4 overflow-y-auto overscroll-contain px-4 py-4 sm:px-6"
        >
        {/* Empty state: conversation starters */}
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-8 py-12">
            <div className="text-center">
              <div
                className="mb-3 font-mono text-5xl text-rocky-warm"
                style={{
                  animation: "gentle-pulse 4s ease-in-out infinite",
                  textShadow: "0 0 30px rgba(245, 158, 11, 0.30)",
                }}
                aria-hidden="true"
              >
                ◈~⊕~◈
              </div>
              <h2 className="text-xl font-semibold text-rocky-text">
                Talk to Rocky
              </h2>
              <p className="mt-1 text-sm text-rocky-muted">
                Eridian Communication Interface
              </p>
            </div>

            <div className="flex w-full max-w-sm flex-col gap-2">
              {CONVERSATION_STARTERS.map((starter) => (
                <button
                  key={starter}
                  onClick={() => sendMessage(starter)}
                  className="rounded-[10px] border border-rocky-border bg-rocky-surface px-4 py-3 text-left text-sm text-rocky-text transition-colors duration-200 hover:border-[rgba(245,158,11,0.25)] hover:bg-[rgba(245,158,11,0.04)] hover:shadow-[0_0_12px_rgba(245,158,11,0.15)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0e1a]"
                >
                  {starter}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Message list */}
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`message-enter flex ${
              msg.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            {msg.role === "user" ? (
              /* User message bubble — warm amber tint */
              <div
                className="max-w-[80%] px-4 py-3 text-sm leading-relaxed text-rocky-text"
                style={{
                  background: "rgba(245, 158, 11, 0.08)",
                  border: "1px solid rgba(245, 158, 11, 0.15)",
                  borderRadius: "16px 16px 4px 16px",
                }}
              >
                {msg.content}
              </div>
            ) : (
              /* Rocky message — dark glass panel with avatar */
              <div className="flex max-w-[90%] gap-3">
                {/* Rocky avatar */}
                <div className="mt-1 shrink-0">
                  <ReactiveRockyAvatar
                    isActive={playingMessageIdx === idx}
                    emotion={messageEmotions.get(idx) ?? "neutral"}
                  />
                </div>

                <div className="space-y-3">
                  {/* Rocky's English text bubble */}
                  <div
                    className="px-4 py-3"
                    style={{
                      background: "rgba(17, 24, 39, 0.70)",
                      backdropFilter: "blur(12px)",
                      WebkitBackdropFilter: "blur(12px)",
                      border: "1px solid rgba(55, 65, 81, 0.50)",
                      borderRadius: "16px 16px 16px 4px",
                      boxShadow: "inset 3px 0 0 0 rgba(245, 158, 11, 0.15)",
                    }}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-sm leading-relaxed text-rocky-text">
                        {msg.content}
                      </p>
                      {msg.rockyResponse &&
                        msg.rockyResponse.chords.length > 0 && (
                          <button
                            onClick={() =>
                              playResponse(idx, msg.rockyResponse!)
                            }
                            disabled={playingMessageIdx !== null}
                            aria-label="Play response as Eridian chords"
                            className={`shrink-0 rounded-full p-2 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0e1a] ${
                              playingMessageIdx === idx
                                ? "bg-rocky-warm text-rocky-bg"
                                : "border border-rocky-border-subtle bg-rocky-inset text-rocky-warm hover:border-[rgba(245,158,11,0.25)] hover:bg-[rgba(245,158,11,0.10)]"
                            }`}
                            style={
                              playingMessageIdx === idx
                                ? {
                                    animation:
                                      "pulse-glow 1.5s ease-in-out infinite",
                                  }
                                : undefined
                            }
                          >
                            <svg
                              className="h-4 w-4"
                              fill="currentColor"
                              viewBox="0 0 24 24"
                              aria-hidden="true"
                            >
                              <path d="M8 5v14l11-7z" />
                            </svg>
                          </button>
                        )}
                    </div>
                  </div>

                  {/* Chord notation row */}
                  {msg.rockyResponse &&
                    msg.rockyResponse.chords.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {msg.rockyResponse.chords.map((chord, ci) => (
                          <ChordCard
                            key={`${chord.word}-${ci}`}
                            chordData={chord}
                            isHighlighted={
                              playingMessageIdx === idx &&
                              highlightedWordIdx === ci
                            }
                            compact
                          />
                        ))}
                      </div>
                    )}
                </div>
              </div>
            )}
          </div>
        ))}

        {/* Loading state: Rocky is thinking */}
        {isLoading && (
          <div className="message-enter flex justify-start">
            <div className="flex max-w-[90%] gap-3">
              {/* Rocky avatar — thinking state */}
              <div className="mt-1 shrink-0">
                <ReactiveRockyAvatar isActive={false} isThinking />
              </div>

              <div
                className="px-4 py-3"
                style={{
                  background: "rgba(17, 24, 39, 0.70)",
                  backdropFilter: "blur(12px)",
                  WebkitBackdropFilter: "blur(12px)",
                  border: "1px solid rgba(55, 65, 81, 0.50)",
                  borderRadius: "16px 16px 16px 4px",
                  boxShadow: "inset 3px 0 0 0 rgba(245, 158, 11, 0.15)",
                }}
              >
                <div className="flex items-center gap-3">
                  <span className="flex gap-1.5 font-mono text-rocky-warm" aria-hidden="true">
                    <span
                      style={{
                        animation: "thinking-dots 1.2s ease-in-out infinite",
                        animationDelay: "0ms",
                      }}
                    >
                      ◉
                    </span>
                    <span
                      style={{
                        animation: "thinking-dots 1.2s ease-in-out infinite",
                        animationDelay: "200ms",
                      }}
                    >
                      ◉
                    </span>
                    <span
                      style={{
                        animation: "thinking-dots 1.2s ease-in-out infinite",
                        animationDelay: "400ms",
                      }}
                    >
                      ◉
                    </span>
                  </span>
                  <span className="text-sm text-rocky-muted">
                    Rocky is thinking\u2026
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
        </div>
      </XenonitePanel>

      {/* Input area */}
      <div
        className="border-t border-rocky-border px-4 py-3"
        style={{ paddingBottom: "calc(12px + env(safe-area-inset-bottom, 0px))" }}
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage(input);
          }}
          className="flex gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Talk to Rocky\u2026"
            disabled={isLoading}
            aria-label="Message to Rocky"
            autoComplete="off"
            className="flex-1 rounded-[10px] border border-rocky-border bg-rocky-inset px-4 py-2.5 text-sm text-rocky-text placeholder-rocky-dim transition-colors duration-200 focus-visible:border-[rgba(245,158,11,0.25)] focus-visible:shadow-[0_0_0_3px_rgba(245,158,11,0.10)] focus-visible:outline-none"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="rounded-[10px] bg-rocky-warm px-5 py-2.5 text-sm font-semibold text-rocky-bg transition-colors duration-200 hover:bg-rocky-warm-hover hover:shadow-[0_0_20px_rgba(245,158,11,0.25)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0e1a] disabled:cursor-not-allowed disabled:opacity-40"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}
