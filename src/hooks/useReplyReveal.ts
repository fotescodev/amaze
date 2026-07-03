"use client";

import { useEffect, useState } from "react";

export type ReplyRevealStatus =
  | "pending"
  | "sounding"
  | "revealing"
  | "revealed";

export interface RevealState {
  status: ReplyRevealStatus;
  revealedCount: number;
}

export function createRevealState(): RevealState {
  return {
    status: "pending",
    revealedCount: 0,
  };
}

export function initializeReveal(totalCount: number): RevealState {
  return totalCount === 0
    ? {
        status: "revealed",
        revealedCount: 0,
      }
    : createRevealState();
}

export function startReveal(
  state: RevealState,
  totalCount: number
): RevealState {
  if (totalCount === 0) {
    return {
      status: "revealed",
      revealedCount: 0,
    };
  }

  if (state.status === "revealed") {
    return state;
  }

  return {
    status: "sounding",
    revealedCount: state.revealedCount,
  };
}

export function tickReveal(
  state: RevealState,
  index: number,
  totalCount: number
): RevealState {
  if (totalCount === 0) {
    return {
      status: "revealed",
      revealedCount: 0,
    };
  }

  const nextCount = Math.max(
    state.revealedCount,
    Math.min(totalCount, index + 1)
  );

  if (nextCount >= totalCount) {
    return {
      status: "revealed",
      revealedCount: totalCount,
    };
  }

  return {
    status: "revealing",
    revealedCount: nextCount,
  };
}

export function resetReveal(): RevealState {
  return createRevealState();
}

export function useReplyReveal(totalCount: number) {
  const [state, setState] = useState<RevealState>(() => initializeReveal(totalCount));

  useEffect(() => {
    setState(initializeReveal(totalCount));
  }, [totalCount]);

  return {
    status: state.status,
    revealedCount: state.revealedCount,
    start() {
      setState((current) => startReveal(current, totalCount));
    },
    tick(index: number) {
      setState((current) => tickReveal(current, index, totalCount));
    },
    reset() {
      setState(resetReveal());
    },
  };
}
