/**
 * API Route: /api/chat
 *
 * Proxies requests to Anthropic Claude API with the Rocky persona system prompt.
 * Keeps the API key server-side.
 */

import { NextRequest, NextResponse } from "next/server";
import { ROCKY_SYSTEM_PROMPT, parseRockyResponse } from "@/lib/rocky-persona";

export async function POST(req: NextRequest) {
  try {
    const { messages, apiKey } = await req.json();

    if (!apiKey) {
      return NextResponse.json(
        { error: "API key is required" },
        { status: 400 }
      );
    }

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 1000,
        system: ROCKY_SYSTEM_PROMPT,
        messages,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: `Anthropic API error: ${response.status}`, details: errorText },
        { status: response.status }
      );
    }

    const data = await response.json();
    const text = data.content?.[0]?.text ?? "";
    const parsed = parseRockyResponse(text);

    return NextResponse.json(parsed);
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
