"use client";

import { useRef, useEffect, useCallback } from "react";

interface WaveformVisualizerProps {
  analyser: AnalyserNode | null;
  isPlaying: boolean;
}

export default function WaveformVisualizer({
  analyser,
  isPlaying,
}: WaveformVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>(0);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !analyser) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Float32Array(bufferLength);

    const render = () => {
      animFrameRef.current = requestAnimationFrame(render);
      analyser.getFloatTimeDomainData(dataArray);

      // Background
      ctx.fillStyle = "rgba(15, 23, 42, 0.3)";
      ctx.fillRect(0, 0, width, height);

      // Waveform
      ctx.lineWidth = 2;
      ctx.strokeStyle = "#f59e0b";
      ctx.beginPath();

      const sliceWidth = width / bufferLength;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i];
        const y = (v + 1) / 2 * height;

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
        x += sliceWidth;
      }

      ctx.lineTo(width, height / 2);
      ctx.stroke();

      // Glow effect
      ctx.shadowColor = "#f59e0b";
      ctx.shadowBlur = 10;
    };

    render();
  }, [analyser]);

  useEffect(() => {
    if (isPlaying && analyser) {
      draw();
    } else {
      cancelAnimationFrame(animFrameRef.current);
      // Draw flat line when not playing
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.fillStyle = "#0f172a";
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.strokeStyle = "#334155";
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(0, canvas.height / 2);
          ctx.lineTo(canvas.width, canvas.height / 2);
          ctx.stroke();
        }
      }
    }

    return () => cancelAnimationFrame(animFrameRef.current);
  }, [isPlaying, analyser, draw]);

  return (
    <canvas
      ref={canvasRef}
      width={400}
      height={64}
      className="waveform-container w-full rounded-md"
    />
  );
}
