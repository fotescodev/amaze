import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useReplyReveal } from "./useReplyReveal";

describe("useReplyReveal", () => {
  it("moves from pending to sounding, revealing, and revealed", () => {
    const { result } = renderHook(() => useReplyReveal(3));

    expect(result.current.status).toBe("pending");
    expect(result.current.revealedCount).toBe(0);

    act(() => {
      result.current.start();
    });

    expect(result.current.status).toBe("sounding");
    expect(result.current.revealedCount).toBe(0);

    act(() => {
      result.current.tick(0);
    });

    expect(result.current.status).toBe("revealing");
    expect(result.current.revealedCount).toBe(1);

    act(() => {
      result.current.tick(2);
    });

    expect(result.current.status).toBe("revealed");
    expect(result.current.revealedCount).toBe(3);
  });

  it("keeps ticks monotonic for duplicates and out-of-order indices", () => {
    const { result } = renderHook(() => useReplyReveal(4));

    act(() => {
      result.current.start();
      result.current.tick(2);
    });

    expect(result.current.status).toBe("revealing");
    expect(result.current.revealedCount).toBe(3);

    act(() => {
      result.current.tick(1);
      result.current.tick(2);
    });

    expect(result.current.status).toBe("revealing");
    expect(result.current.revealedCount).toBe(3);
  });

  it("resets to pending", () => {
    const { result } = renderHook(() => useReplyReveal(2));

    act(() => {
      result.current.start();
      result.current.tick(1);
      result.current.reset();
    });

    expect(result.current.status).toBe("pending");
    expect(result.current.revealedCount).toBe(0);
  });

  it("resolves zero-chord replies immediately on start", () => {
    const { result } = renderHook(() => useReplyReveal(0));

    act(() => {
      result.current.start();
    });

    expect(result.current.status).toBe("revealed");
    expect(result.current.revealedCount).toBe(0);
  });
});
