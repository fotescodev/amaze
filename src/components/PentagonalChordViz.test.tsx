import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import PentagonalChordViz from "./PentagonalChordViz";

vi.mock("./AudioAnalysisProvider", () => ({
  useOptionalAudioAnalysis: () => null,
}));

describe("PentagonalChordViz accessibility", () => {
  it("exposes an accessible label for the visualizer canvas", () => {
    class ResizeObserverMock {
      observe() {}
      disconnect() {}
      unobserve() {}
    }

    Object.defineProperty(window, "ResizeObserver", {
      writable: true,
      configurable: true,
      value: ResizeObserverMock,
    });

    HTMLCanvasElement.prototype.getContext = vi.fn(() => ({
      clearRect: vi.fn(),
      setTransform: vi.fn(),
      beginPath: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      closePath: vi.fn(),
      stroke: vi.fn(),
      arc: vi.fn(),
      fill: vi.fn(),
      save: vi.fn(),
      restore: vi.fn(),
    })) as typeof HTMLCanvasElement.prototype.getContext;

    render(<PentagonalChordViz mode="live" />);

    expect(
      screen.getByRole("img", { name: "Eridian chord visualizer — idle" })
    ).toBeInTheDocument();
  });
});
