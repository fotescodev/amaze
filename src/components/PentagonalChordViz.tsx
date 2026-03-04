"use client";

/**
 * Pentagonal Chord Visualizer
 *
 * Canvas 2D orbital particle visualization matching Rocky's 5-fold body symmetry.
 * Dual mode: "live" reads from AudioAnalysisContext, "static" accepts tone arrays.
 *
 * Performance budget: 5 particles + 5 trail segments each = 30 draw calls/frame.
 *
 * (see brainstorm: docs/brainstorms/2026-03-04-wow-factor-brainstorm.md)
 */

import { useRef, useEffect, useCallback } from "react";
import { useOptionalAudioAnalysis } from "./AudioAnalysisProvider";

interface PentagonalChordVizProps {
  mode: "live" | "static";
  staticTones?: number[][];
  className?: string;
}

const PARTICLE_COUNT = 5;
const TRAIL_LENGTH = 5;
const IDLE_ROTATION_PERIOD = 8; // seconds per revolution
const PENTAGON_OFFSET = -Math.PI / 2; // start from top

// Frequency-to-orbit mapping
const MIN_HZ = 80;
const MAX_HZ = 1100;

// Pentagonal vertex positions for a given radius and rotation angle
function pentagonVertex(
  cx: number,
  cy: number,
  radius: number,
  vertexIndex: number,
  rotation: number
): [number, number] {
  const angle = PENTAGON_OFFSET + (vertexIndex * 2 * Math.PI) / 5 + rotation;
  return [cx + radius * Math.cos(angle), cy + radius * Math.sin(angle)];
}

// Interpolate position along pentagonal path (t in [0, 1])
function pentagonPoint(
  cx: number,
  cy: number,
  radius: number,
  t: number,
  rotation: number
): [number, number] {
  const segment = t * 5;
  const vertIdx = Math.floor(segment) % 5;
  const frac = segment - Math.floor(segment);

  const [x1, y1] = pentagonVertex(cx, cy, radius, vertIdx, rotation);
  const [x2, y2] = pentagonVertex(cx, cy, radius, (vertIdx + 1) % 5, rotation);

  return [x1 + (x2 - x1) * frac, y1 + (y2 - y1) * frac];
}

// Map Hz to orbit radius (logarithmic scale)
function hzToRadius(hz: number, maxRadius: number): number {
  const clamped = Math.max(MIN_HZ, Math.min(MAX_HZ, hz));
  const logMin = Math.log(MIN_HZ);
  const logMax = Math.log(MAX_HZ);
  const normalized = (Math.log(clamped) - logMin) / (logMax - logMin);
  // Inner orbits for low frequencies, outer for high
  return 0.2 * maxRadius + normalized * 0.6 * maxRadius;
}

interface ParticleState {
  t: number; // position along pentagon path [0, 1)
  radius: number;
  brightness: number; // 0-1
  size: number;
  speed: number;
  trail: [number, number][];
}

export default function PentagonalChordViz({
  mode,
  staticTones,
  className,
}: PentagonalChordVizProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animFrameRef = useRef<number>(0);
  const reducedMotionRef = useRef(false);
  const visibleRef = useRef(true);
  const particlesRef = useRef<ParticleState[]>([]);
  const frequencyDataRef = useRef<Uint8Array<ArrayBuffer> | null>(null);

  // Always call the hook (Rules of Hooks), returns null outside provider
  const audio = useOptionalAudioAnalysis();

  // Initialize particles
  useEffect(() => {
    const particles: ParticleState[] = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push({
        t: i / PARTICLE_COUNT,
        radius: 0.3 + i * 0.12,
        brightness: 0.15,
        size: 3,
        speed: 0.02,
        trail: [],
      });
    }
    particlesRef.current = particles;
  }, []);

  // Reduced motion
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    reducedMotionRef.current = mq.matches;
    const handler = (e: MediaQueryListEvent) => {
      reducedMotionRef.current = e.matches;
    };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  // Visibility change — pause when tab hidden
  useEffect(() => {
    const handler = () => {
      visibleRef.current = !document.hidden;
    };
    document.addEventListener("visibilitychange", handler);
    return () => document.removeEventListener("visibilitychange", handler);
  }, []);

  // ResizeObserver
  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        const dpr = window.devicePixelRatio || 1;
        canvas.width = Math.round(width * dpr);
        canvas.height = Math.round(height * dpr);
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;
      }
    });
    ro.observe(container);
    return () => ro.disconnect();
  }, []);

  // Build aria label
  const getAriaLabel = useCallback(() => {
    if (audio?.isPlaying) {
      return "Eridian chord visualizer — playing";
    }
    return "Eridian chord visualizer — idle";
  }, [audio?.isPlaying]);

  // Main render loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const isPlaying = audio?.isPlaying ?? false;
    const analyser = audio?.analyserRef.current ?? null;
    const emotionState = audio?.emotionState ?? "neutral";

    // Allocate frequency data buffer if needed
    if (analyser && !frequencyDataRef.current) {
      frequencyDataRef.current = new Uint8Array(analyser.frequencyBinCount);
    }

    // For reduced motion, draw static and stop
    if (reducedMotionRef.current) {
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      const dpr = window.devicePixelRatio || 1;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const w = canvas.width / dpr;
      const h = canvas.height / dpr;
      const cx = w / 2;
      const cy = h / 2;
      const maxR = Math.min(w, h) * 0.42;

      ctx.clearRect(0, 0, w, h);

      // Draw static pentagon paths
      for (let ring = 0; ring < 3; ring++) {
        const r = maxR * (0.4 + ring * 0.25);
        ctx.beginPath();
        for (let v = 0; v <= 5; v++) {
          const [px, py] = pentagonVertex(cx, cy, r, v % 5, 0);
          if (v === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.strokeStyle = "rgba(245, 158, 11, 0.08)";
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // Static dots at vertices
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const r = maxR * (0.3 + i * 0.12);
        const [px, py] = pentagonVertex(cx, cy, r, i, 0);
        ctx.beginPath();
        ctx.arc(px, py, 3, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(245, 158, 11, 0.15)";
        ctx.fill();
      }
      return;
    }

    let lastTime = 0;

    const render = (timestamp: number) => {
      if (!visibleRef.current) {
        animFrameRef.current = requestAnimationFrame(render);
        return;
      }

      const dt = lastTime ? (timestamp - lastTime) / 1000 : 1 / 60;
      lastTime = timestamp;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const dpr = window.devicePixelRatio || 1;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const w = canvas.width / dpr;
      const h = canvas.height / dpr;
      const cx = w / 2;
      const cy = h / 2;
      const maxR = Math.min(w, h) * 0.42;

      // Trail effect
      ctx.fillStyle = "rgba(6, 10, 18, 0.3)";
      ctx.fillRect(0, 0, w, h);

      // Global rotation for idle
      const globalRotation =
        ((timestamp / 1000) / IDLE_ROTATION_PERIOD) * Math.PI * 2;

      // Read frequency data if playing
      let bandEnergies = [0, 0, 0, 0, 0];
      if (isPlaying && analyser && frequencyDataRef.current) {
        analyser.getByteFrequencyData(frequencyDataRef.current);
        const data = frequencyDataRef.current;
        const binCount = data.length;
        const bandSize = Math.floor(binCount / 5);

        for (let b = 0; b < 5; b++) {
          let sum = 0;
          const start = b * bandSize;
          const end = Math.min(start + bandSize, binCount);
          for (let i = start; i < end; i++) {
            sum += data[i] / 255;
          }
          bandEnergies[b] = sum / (end - start);
        }
      }

      // Draw pentagon orbit paths
      for (let ring = 0; ring < 3; ring++) {
        const r = maxR * (0.4 + ring * 0.25);
        ctx.beginPath();
        for (let v = 0; v <= 5; v++) {
          const [px, py] = pentagonVertex(
            cx,
            cy,
            r,
            v % 5,
            isPlaying ? 0 : globalRotation
          );
          if (v === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.strokeStyle = "rgba(245, 158, 11, 0.08)";
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      const particles = particlesRef.current;
      const isDissonant = emotionState === "distressed";

      // Update and draw particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        const energy = bandEnergies[i];

        if (isPlaying) {
          // Active: speed and brightness respond to frequency energy
          p.brightness = 0.3 + energy * 0.7;
          p.speed = 0.03 + energy * 0.12;
          p.size = 2 + energy * 3;
        } else {
          // Idle: slow, dim
          p.brightness = 0.15;
          p.speed = 1 / (IDLE_ROTATION_PERIOD * 5);
          p.size = 3;
        }

        // Advance position
        p.t = (p.t + p.speed * dt) % 1;

        const radius = maxR * p.radius;
        const rotation = isPlaying ? 0 : globalRotation;
        let [px, py] = pentagonPoint(cx, cy, radius, p.t, rotation);

        // Dissonant jitter
        if (isPlaying && isDissonant) {
          px += (Math.random() - 0.5) * 4;
          py += (Math.random() - 0.5) * 4;
        }

        // Update trail
        p.trail.push([px, py]);
        if (p.trail.length > TRAIL_LENGTH) {
          p.trail.shift();
        }

        // Draw trail
        for (let t = 0; t < p.trail.length - 1; t++) {
          const alpha = ((t + 1) / p.trail.length) * p.brightness * 0.5;
          const [tx, ty] = p.trail[t];
          const trailSize = p.size * (0.3 + (t / p.trail.length) * 0.7);
          ctx.beginPath();
          ctx.arc(tx, ty, trailSize, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(245, 158, 11, ${alpha.toFixed(3)})`;
          ctx.fill();
        }

        // Draw particle with glow
        ctx.save();
        if (isPlaying && p.brightness > 0.3) {
          ctx.shadowColor = "rgba(245, 158, 11, 0.40)";
          ctx.shadowBlur = 8;
        }
        ctx.beginPath();
        ctx.arc(px, py, p.size, 0, Math.PI * 2);
        ctx.fillStyle = isPlaying
          ? `rgba(251, 191, 36, ${p.brightness.toFixed(3)})`
          : `rgba(245, 158, 11, ${p.brightness.toFixed(3)})`;
        ctx.fill();
        ctx.restore();
      }

      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);

    return () => cancelAnimationFrame(animFrameRef.current);
  }, [audio?.isPlaying, audio?.analyserRef, audio?.emotionState]);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        width: "100%",
        height: "100%",
        minHeight: "120px",
      }}
    >
      <canvas
        ref={canvasRef}
        role="img"
        aria-label={getAriaLabel()}
        style={{ display: "block", width: "100%", height: "100%" }}
      />
    </div>
  );
}
