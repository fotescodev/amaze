import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import LexiconExplorer from "./LexiconExplorer";

vi.mock("./ChordCard", () => ({
  default: ({ entry }: { entry: { word: string } }) => <div>{entry.word}</div>,
}));

describe("LexiconExplorer accessibility", () => {
  it("exposes cluster tabs with roving focus and arrow key navigation", () => {
    render(<LexiconExplorer />);

    const tabs = screen.getAllByRole("tab");
    const firstTab = tabs[0];
    const secondTab = tabs[1];

    expect(firstTab).toHaveAttribute("aria-selected", "true");
    expect(firstTab).toHaveAttribute("tabindex", "0");
    expect(firstTab).toHaveAttribute("aria-controls");
    expect(secondTab).toHaveAttribute("aria-selected", "false");
    expect(secondTab).toHaveAttribute("tabindex", "-1");

    fireEvent.keyDown(firstTab, { key: "ArrowRight" });

    expect(secondTab).toHaveFocus();
    expect(secondTab).toHaveAttribute("aria-selected", "true");
    expect(firstTab).toHaveAttribute("aria-selected", "false");
  });
});
