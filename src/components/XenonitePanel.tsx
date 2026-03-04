"use client";

/**
 * XenonitePanel — CSS-only prismatic shimmer border effect.
 *
 * Animated conic gradient on ::before pseudo-element creates a slow-moving
 * shimmer along the panel border. Static under reduced motion.
 *
 * (see brainstorm: docs/brainstorms/2026-03-04-wow-factor-brainstorm.md)
 */

import type { ReactNode } from "react";

interface XenonitePanelProps {
  children: ReactNode;
  className?: string;
}

export default function XenonitePanel({
  children,
  className = "",
}: XenonitePanelProps) {
  return (
    <div className={`xenonite-panel ${className}`}>
      {children}
    </div>
  );
}
