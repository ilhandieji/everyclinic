"use client";

import { useEffect, useRef, type ReactNode } from "react";

/** Pauses the decorative chip loop when the photo is off screen. */
export function HeroChipStage({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stage = ref.current;
    if (!stage) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const chips = () => [...stage.querySelectorAll<HTMLElement>(".hero-mark__chip")];
    const observer = new IntersectionObserver(
      ([entry]) => {
        const state = entry?.isIntersecting ? "running" : "paused";
        for (const chip of chips()) chip.style.animationPlayState = state;
      },
      { threshold: 0.2 },
    );
    observer.observe(stage);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className="hero-mark__stage">
      {children}
    </div>
  );
}
