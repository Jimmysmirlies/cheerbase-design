"use client";

import { type PropsWithChildren, useEffect } from "react";

import Lenis from "lenis";

type SmoothScrollProviderProps = PropsWithChildren<{
  /**
   * Enable/disable smoothing; handy if we ever need to opt-out.
   */
  enabled?: boolean;
}>;

export function SmoothScrollProvider({
  children,
  enabled = true,
}: SmoothScrollProviderProps) {
  useEffect(() => {
    if (!enabled) return;

    const lenis = new Lenis({
      lerp: 0.12,
      duration: 1.25,
      smoothWheel: true,
    });

    let frame: number | null = null;
    const tick = (time: number) => {
      lenis.raf(time);
      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);

    return () => {
      if (frame) cancelAnimationFrame(frame);
      lenis.destroy();
    };
  }, [enabled]);

  return children;
}
