"use client";

import { useState, useRef, useEffect } from "react";
import type { ChordData, RockyResponse, ChatMessage } from "@/lib/rocky-persona";
import {
  callRockyAPI,
  resolveChords,
  CONVERSATION_STARTERS,
  ERROR_RESPONSES,
} from "@/lib/rocky-persona";
import { LEXICON_MAP, QUESTION_PARTICLE } from "@/data/lexicon";
import { playWord, playSequence, type PlayableWord } from "@/lib/audio-engine";
import ChordCard from "./ChordCard";
import WaveformVisualizer from "./WaveformVisualizer";
import FidelityTag from "./FidelityTag";

interface ChatInterfaceProps {
  apiKey: string;
}

export default function ChatInterface({ apiKey }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [playingMessageIdx, setPlayingMessageIdx] = useState<number | null>(null);
  const [highlightedWordIdx, setHighlightedWordIdx] = useState<number | null>(null);
  const [octaveShift, setOctaveShift] = useState(false);
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);

  const learnedWordsRef = useRef<Map<string, ChordData>>(new Map());
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMessage: ChatMessage = { role: "user", content: text.trim() };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);

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

      const assistantMessage: ChatMessage = {
        role: "assistant",
        content: response.rocky_english,
        rockyResponse: response,
      };

      setMessages([...newMessages, assistantMessage]);
    } catch (error) {
      console.error("Rocky API error:", error);
      const fallback =
        ERROR_RESPONSES[Math.floor(Math.random() * ERROR_RESPONSES.length)];
      const assistantMessage: ChatMessage = {
        role: "assistant",
        content: fallback.rocky_english,
        rockyResponse: fallback,
      };
      setMessages([...newMessages, assistantMessage]);
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

    // Create analyser for visualization
    const audioCtx = new AudioContext();
    const newAnalyser = audioCtx.createAnalyser();
    newAnalyser.fftSize = 2048;
    setAnalyser(newAnalyser);
    audioCtx.close(); // We'll use the engine's context

    const { promise } = playSequence(words, octaveShift, (wordIdx) => {
      setHighlightedWordIdx(wordIdx);
    });

    promise.then(() => {
      setPlayingMessageIdx(null);
      setHighlightedWordIdx(null);
      setAnalyser(null);
    });
  };

  return (
    <div className="flex h-full flex-col">
      {/* Header controls */}
      <div className="flex items-center justify-between border-b border-rocky-border px-4 py-2">
        <div className="flex items-center gap-3">
          <span className="text-rocky-warm font-mono text-lg">◈~⊕~◈</span>
          <span className="text-sm font-semibold text-rocky-text">
            Talk to Rocky
          </span>
        </div>
        <button
          onClick={() => setOctaveShift(!octaveShift)}
          className={`rounded-full px-3 py-1 text-xs transition-colors ${
            octaveShift
              ? "bg-rocky-warm text-rocky-bg font-semibold"
              : "bg-rocky-surface text-rocky-muted border border-rocky-border hover:text-rocky-text"
          }`}
          title="Octave shift for emotional emphasis (canon)"
        >
          {octaveShift ? "Emphatic Mode" : "Normal Mode"}
        </button>
      </div>

      {/* Waveform */}
      <div className="border-b border-rocky-border px-4 py-2">
        <WaveformVisualizer
          analyser={analyser}
          isPlaying={playingMessageIdx !== null}
        />
      </div>

      {/* Messages */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 py-4 space-y-4"
      >
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-6 py-12">
            <div className="text-center">
              <div className="text-4xl text-rocky-warm font-mono mb-2">◈~⊕~◈</div>
              <h2 className="text-xl font-semibold text-rocky-text">
                Talk to Rocky
              </h2>
              <p className="mt-1 text-sm text-rocky-muted">
                Eridian Communication Interface
              </p>
            </div>

            <div className="flex flex-col gap-2 w-full max-w-sm">
              {CONVERSATION_STARTERS.map((starter) => (
                <button
                  key={starter}
                  onClick={() => sendMessage(starter)}
                  className="rounded-lg border border-rocky-border bg-rocky-surface px-4 py-3 text-left text-sm text-rocky-text transition-colors hover:border-rocky-warm/40 hover:bg-rocky-warm/5"
                >
                  {starter}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${
              msg.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            {msg.role === "user" ? (
              <div className="max-w-[80%] rounded-2xl rounded-br-sm bg-rocky-warm/20 px-4 py-2 text-sm text-rocky-text">
                {msg.content}
              </div>
            ) : (
              <div className="max-w-[90%] space-y-3">
                {/* Rocky's English text */}
                <div className="rounded-2xl rounded-bl-sm border border-rocky-border bg-rocky-surface px-4 py-3">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm text-rocky-text leading-relaxed">
                      {msg.content}
                    </p>
                    {msg.rockyResponse &&
                      msg.rockyResponse.chords.length > 0 && (
                        <button
                          onClick={() =>
                            playResponse(idx, msg.rockyResponse!)
                          }
                          disabled={playingMessageIdx !== null}
                          className={`shrink-0 rounded-full p-2 transition-colors ${
                            playingMessageIdx === idx
                              ? "bg-rocky-warm text-rocky-bg animate-pulse"
                              : "bg-rocky-bg text-rocky-warm hover:bg-rocky-warm/20"
                          }`}
                          title="Play full response as Eridian chords"
                        >
                          <svg
                            className="h-4 w-4"
                            fill="currentColor"
                            viewBox="0 0 24 24"
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
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="rounded-2xl rounded-bl-sm border border-rocky-border bg-rocky-surface px-4 py-3">
              <div className="flex items-center gap-2 text-sm text-rocky-muted">
                <span className="font-mono text-rocky-warm animate-pulse">
                  ◉ ◉ ◉
                </span>
                <span>Rocky is thinking...</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="border-t border-rocky-border px-4 py-3">
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
            placeholder="Talk to Rocky..."
            disabled={isLoading}
            className="flex-1 rounded-lg border border-rocky-border bg-rocky-surface px-4 py-2 text-sm text-rocky-text placeholder-rocky-muted outline-none focus:border-rocky-warm/50 transition-colors"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="rounded-lg bg-rocky-warm px-4 py-2 text-sm font-semibold text-rocky-bg transition-colors hover:bg-rocky-warm/80 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}
