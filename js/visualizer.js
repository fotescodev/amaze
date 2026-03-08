/**
 * Audio Visualizer
 * Canvas 2D waveform/frequency bar display for Eridian translation output.
 */

let canvas, ctx;
let analyser;
let animFrameId = null;
let isActive = false;

// Visual config
const BAR_COLOR_START = '#f59e0b'; // amber
const BAR_COLOR_END = '#ef4444';   // red-orange
const IDLE_COLOR = 'rgba(245, 158, 11, 0.15)';
const BG_COLOR = 'rgba(0, 0, 0, 0)';

export function initVisualizer(canvasElement, analyserNode) {
  canvas = canvasElement;
  ctx = canvas.getContext('2d');
  analyser = analyserNode;

  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  // Draw idle state
  drawIdle();
}

function resizeCanvas() {
  if (!canvas) return;
  const container = canvas.parentElement;
  canvas.width = container.clientWidth * window.devicePixelRatio;
  canvas.height = container.clientHeight * window.devicePixelRatio;
  ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
}

export function startVisualization() {
  isActive = true;
  if (!animFrameId) {
    draw();
  }
}

export function stopVisualization() {
  isActive = false;
  // Let the animation naturally fade out
  setTimeout(() => {
    if (!isActive && animFrameId) {
      cancelAnimationFrame(animFrameId);
      animFrameId = null;
      drawIdle();
    }
  }, 500);
}

function draw() {
  animFrameId = requestAnimationFrame(draw);

  if (!analyser || !canvas) return;

  const w = canvas.clientWidth;
  const h = canvas.clientHeight;

  // Clear
  ctx.clearRect(0, 0, w, h);

  // Get frequency data
  const bufferLength = analyser.frequencyBinCount;
  const dataArray = new Uint8Array(bufferLength);
  analyser.getByteFrequencyData(dataArray);

  // Check if there's actual audio playing
  let sum = 0;
  for (let i = 0; i < bufferLength; i++) sum += dataArray[i];
  const avgVolume = sum / bufferLength;

  if (avgVolume < 1 && !isActive) {
    cancelAnimationFrame(animFrameId);
    animFrameId = null;
    drawIdle();
    return;
  }

  // Draw frequency bars
  const barCount = 64;
  const barWidth = w / barCount - 1;
  const step = Math.floor(bufferLength / barCount);

  for (let i = 0; i < barCount; i++) {
    const value = dataArray[i * step];
    const percent = value / 255;
    const barHeight = percent * h * 0.85;

    const x = i * (barWidth + 1);
    const y = h - barHeight;

    // Gradient color based on position
    const t = i / barCount;
    const gradient = ctx.createLinearGradient(x, h, x, y);
    gradient.addColorStop(0, BAR_COLOR_START);
    gradient.addColorStop(1, lerpColor(BAR_COLOR_START, BAR_COLOR_END, t));

    ctx.fillStyle = gradient;
    ctx.globalAlpha = 0.6 + percent * 0.4;

    // Rounded bars
    const radius = Math.min(barWidth / 2, 3);
    roundRect(ctx, x, y, barWidth, barHeight, radius);

    // Glow effect for tall bars
    if (percent > 0.5) {
      ctx.shadowColor = BAR_COLOR_START;
      ctx.shadowBlur = percent * 12;
    } else {
      ctx.shadowBlur = 0;
    }
  }

  ctx.globalAlpha = 1;
  ctx.shadowBlur = 0;

  // Draw waveform overlay
  const waveData = new Uint8Array(analyser.fftSize);
  analyser.getByteTimeDomainData(waveData);

  ctx.beginPath();
  ctx.strokeStyle = 'rgba(245, 158, 11, 0.5)';
  ctx.lineWidth = 1.5;

  const sliceWidth = w / waveData.length;
  let wx = 0;

  for (let i = 0; i < waveData.length; i++) {
    const v = waveData[i] / 128.0;
    const wy = (v * h) / 2;

    if (i === 0) ctx.moveTo(wx, wy);
    else ctx.lineTo(wx, wy);

    wx += sliceWidth;
  }

  ctx.stroke();
}

function drawIdle() {
  if (!canvas || !ctx) return;

  const w = canvas.clientWidth;
  const h = canvas.clientHeight;

  ctx.clearRect(0, 0, w, h);

  // Subtle idle bars
  const barCount = 64;
  const barWidth = w / barCount - 1;

  for (let i = 0; i < barCount; i++) {
    const barHeight = 2 + Math.sin(i * 0.3) * 2;
    const x = i * (barWidth + 1);
    const y = h - barHeight - 4;

    ctx.fillStyle = IDLE_COLOR;
    ctx.fillRect(x, y, barWidth, barHeight);
  }
}

function roundRect(ctx, x, y, w, h, r) {
  if (h < 1) return;
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h);
  ctx.lineTo(x, y + h);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.fill();
}

function lerpColor(c1, c2, t) {
  // Simple hex color lerp
  const r1 = parseInt(c1.slice(1, 3), 16);
  const g1 = parseInt(c1.slice(3, 5), 16);
  const b1 = parseInt(c1.slice(5, 7), 16);
  const r2 = parseInt(c2.slice(1, 3), 16);
  const g2 = parseInt(c2.slice(3, 5), 16);
  const b2 = parseInt(c2.slice(5, 7), 16);

  const r = Math.round(r1 + (r2 - r1) * t);
  const g = Math.round(g1 + (g2 - g1) * t);
  const b = Math.round(b1 + (b2 - b1) * t);

  return `rgb(${r}, ${g}, ${b})`;
}
