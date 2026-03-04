"use client";

/**
 * AudioAnalysisProvider
 *
 * Shared audio bus context for the Living Eridian Communication Experience.
 * Provides a single AnalyserNode in the signal chain, ref-based volume data
 * (no re-render storms), and state-based isPlaying/emotion values.
 *
 * (see brainstorm: docs/brainstorms/2026-03-04-wow-factor-brainstorm.md)
 */

import {
  createContext,
  useContext,
  useRef,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from "react";
import {
  getAudioContext,
  playSequence,
  type PlayableWord,
} from "@/lib/audio-engine";
import type { EmotionState, EmotionIntensity } from "@/lib/emotion-detector";

interface AudioAnalysisContextValue {
  analyserRef: React.RefObject<AnalyserNode | null>;
  volumeRef: React.RefObject<number>;
  isPlaying: boolean;
  emotionState: EmotionState;
  emotionIntensity: EmotionIntensity;
  playChords: (
    words: PlayableWord[],
    octaveShift: boolean,
    onWordStart?: (idx: number) => void
  ) => Promise<void>;
  stopPlayback: () => void;
  setEmotionState: (state: EmotionState) => void;
  setEmotionIntensity: (intensity: EmotionIntensity) => void;
}

const AudioAnalysisContext = createContext<AudioAnalysisContextValue | null>(
  null
);

export function useAudioAnalysis(): AudioAnalysisContextValue {
  const ctx = useContext(AudioAnalysisContext);
  if (!ctx) {
    throw new Error(
      "useAudioAnalysis must be used within an AudioAnalysisProvider"
    );
  }
  return ctx;
}

export default function AudioAnalysisProvider({
  children,
}: {
  children: ReactNode;
}) {
  const analyserRef = useRef<AnalyserNode | null>(null);
  const volumeRef = useRef<number>(0);
  const cancelRef = useRef<(() => void) | null>(null);
  const rafIdRef = useRef<number>(0);
  const frequencyDataRef = useRef<Uint8Array<ArrayBuffer> | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [emotionState, setEmotionState] = useState<EmotionState>("neutral");
  const [emotionIntensity, setEmotionIntensity] =
    useState<EmotionIntensity>("normal");

  // Lazily create the shared AnalyserNode on first play
  const ensureAnalyser = useCallback(() => {
    if (analyserRef.current) return analyserRef.current;
    const ctx = getAudioContext();
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 2048;
    analyser.connect(ctx.destination);
    analyserRef.current = analyser;
    frequencyDataRef.current = new Uint8Array(analyser.frequencyBinCount);
    return analyser;
  }, []);

  // Volume-tracking rAF loop — only runs while isPlaying
  useEffect(() => {
    if (!isPlaying || !analyserRef.current) return;

    let running = true;

    const tick = () => {
      if (!running || !analyserRef.current || !frequencyDataRef.current) return;
      analyserRef.current.getByteFrequencyData(frequencyDataRef.current);

      // Compute RMS from frequency data (0–255 range → 0–1)
      let sum = 0;
      const data = frequencyDataRef.current;
      for (let i = 0; i < data.length; i++) {
        const normalized = data[i] / 255;
        sum += normalized * normalized;
      }
      volumeRef.current = Math.sqrt(sum / data.length);

      rafIdRef.current = requestAnimationFrame(tick);
    };

    rafIdRef.current = requestAnimationFrame(tick);

    return () => {
      running = false;
      cancelAnimationFrame(rafIdRef.current);
      volumeRef.current = 0;
    };
  }, [isPlaying]);

  // Pause rAF on tab background
  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden) {
        cancelAnimationFrame(rafIdRef.current);
      }
      // rAF loop restarts automatically via the isPlaying effect
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibility);
  }, []);

  const playChords = useCallback(
    async (
      words: PlayableWord[],
      octaveShift: boolean,
      onWordStart?: (idx: number) => void
    ) => {
      // Stop any in-progress playback
      if (cancelRef.current) {
        cancelRef.current();
        cancelRef.current = null;
      }

      const ctx = getAudioContext();
      if (ctx.state === "suspended") {
        await ctx.resume();
      }

      const analyser = ensureAnalyser();
      setIsPlaying(true);

      const { promise, cancel } = playSequence(words, {
        octaveShift,
        onWordStart,
        destination: analyser,
      });

      cancelRef.current = cancel;

      await promise;

      // Only clear if this playback wasn't cancelled by a newer one
      if (cancelRef.current === cancel) {
        cancelRef.current = null;
        setIsPlaying(false);
      }
    },
    [ensureAnalyser]
  );

  const stopPlayback = useCallback(() => {
    if (cancelRef.current) {
      cancelRef.current();
      cancelRef.current = null;
    }
    setIsPlaying(false);
  }, []);

  return (
    <AudioAnalysisContext.Provider
      value={{
        analyserRef,
        volumeRef,
        isPlaying,
        emotionState,
        emotionIntensity,
        playChords,
        stopPlayback,
        setEmotionState,
        setEmotionIntensity,
      }}
    >
      {children}
    </AudioAnalysisContext.Provider>
  );
}
