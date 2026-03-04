"use client";

import { useState } from "react";
import ChatInterface from "@/components/ChatInterface";
import LexiconExplorer from "@/components/LexiconExplorer";

type Tab = "chat" | "lexicon";

export default function Home() {
  const [apiKey, setApiKey] = useState("");
  const [isKeySet, setIsKeySet] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("chat");

  if (!isKeySet) {
    return (
      <main className="flex min-h-screen items-center justify-center p-4">
        <div className="w-full max-w-md space-y-6 text-center">
          <div>
            <div className="text-5xl font-mono text-rocky-warm mb-3">◈~⊕~◈</div>
            <h1 className="text-2xl font-bold text-rocky-text">
              Talk to Rocky
            </h1>
            <p className="mt-2 text-sm text-rocky-muted leading-relaxed">
              An Eridian communication interface.
              <br />
              Built with care. Labeled with honesty.
            </p>
          </div>

          <div className="rounded-xl border border-rocky-border bg-rocky-surface p-6 text-left space-y-4">
            <div>
              <label
                htmlFor="api-key"
                className="block text-xs font-semibold uppercase tracking-wider text-rocky-muted mb-2"
              >
                Anthropic API Key
              </label>
              <input
                id="api-key"
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-ant-..."
                className="w-full rounded-lg border border-rocky-border bg-rocky-bg px-4 py-2.5 text-sm text-rocky-text placeholder-rocky-muted/50 outline-none focus:border-rocky-warm/50 transition-colors"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && apiKey.trim()) {
                    setIsKeySet(true);
                  }
                }}
              />
              <p className="mt-2 text-[11px] text-rocky-muted">
                Your key is used client-side to call the Anthropic API directly.
                It is never stored or transmitted to any server.
              </p>
            </div>

            <button
              onClick={() => apiKey.trim() && setIsKeySet(true)}
              disabled={!apiKey.trim()}
              className="w-full rounded-lg bg-rocky-warm py-2.5 text-sm font-semibold text-rocky-bg transition-colors hover:bg-rocky-warm/80 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Enter the Hail Mary
            </button>
          </div>

          <p className="text-[11px] text-rocky-muted/70">
            A fan project inspired by{" "}
            <span className="text-rocky-muted">Project Hail Mary</span> by Andy
            Weir.
            <br />
            Eridian chord assignments are fan-extended interpretations.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex h-screen flex-col">
      {/* Tab bar */}
      <div className="flex border-b border-rocky-border">
        <button
          onClick={() => setActiveTab("chat")}
          className={`flex-1 px-4 py-3 text-sm font-semibold transition-colors ${
            activeTab === "chat"
              ? "border-b-2 border-rocky-warm text-rocky-warm"
              : "text-rocky-muted hover:text-rocky-text"
          }`}
        >
          Chat with Rocky
        </button>
        <button
          onClick={() => setActiveTab("lexicon")}
          className={`flex-1 px-4 py-3 text-sm font-semibold transition-colors ${
            activeTab === "lexicon"
              ? "border-b-2 border-rocky-warm text-rocky-warm"
              : "text-rocky-muted hover:text-rocky-text"
          }`}
        >
          Eridian Lexicon
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === "chat" ? (
          <ChatInterface apiKey={apiKey} />
        ) : (
          <div className="h-full overflow-y-auto p-4">
            <LexiconExplorer />
          </div>
        )}
      </div>
    </main>
  );
}
