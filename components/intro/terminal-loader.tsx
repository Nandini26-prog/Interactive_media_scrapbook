"use client";

import * as React from "react";
import { motion } from "framer-motion";

const LINES = [
  "Loading 4 years of chaos...",
  "Finding the person of a lifetime...",
  "Wait... NOW!",
] as const;

export function TerminalLoader({
  onDone,
  stepMs = 900,
}: {
  onDone: () => void;
  stepMs?: number;
}) {
  const [idx, setIdx] = React.useState(0);

  React.useEffect(() => {
    if (idx >= LINES.length) return;
    const t = window.setTimeout(() => setIdx((v) => v + 1), stepMs);
    return () => window.clearTimeout(t);
  }, [idx, stepMs]);

  React.useEffect(() => {
    if (idx !== LINES.length) return;
    const t = window.setTimeout(() => onDone(), 450);
    return () => window.clearTimeout(t);
  }, [idx, onDone]);

  return (
    <div className="fixed inset-0 z-40 grid place-items-center overflow-hidden">
      <div className="absolute inset-0 bg-[var(--background)]" />

      <div
        className={[
          "relative w-[min(760px,92vw)]",
          "rounded-2xl border border-black/10",
          "bg-white/60",
          "shadow-[0_30px_90px_rgba(0,0,0,0.20)]",
          "backdrop-blur",
          "p-6 sm:p-8",
          "rotate-[-1deg]",
          "overflow-hidden",
          "before:absolute before:inset-0 before:opacity-60",
          "before:bg-[radial-gradient(circle_at_30%_10%,rgba(182,75,42,0.16),transparent_55%)]",
        ].join(" ")}
      >
        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-red-500/70" />
            <span className="h-2.5 w-2.5 rounded-full bg-yellow-500/70" />
            <span className="h-2.5 w-2.5 rounded-full bg-green-500/70" />
          </div>
          <div className="text-xs tracking-[0.2em] uppercase text-black/50">
            booting scrapbook.exe
          </div>
        </div>

        <div className="relative mt-6 font-mono text-[13px] leading-6 text-black/80">
          {LINES.slice(0, Math.min(idx, LINES.length)).map((line) => (
            <div key={line} className="flex gap-2">
              <span className="text-black/40">$</span>
              <span>{line}</span>
            </div>
          ))}

          <motion.span
            className="inline-block h-[1em] w-[10px] align-[-2px] bg-black/60"
            animate={{ opacity: [0, 1, 0] }}
            transition={{ duration: 0.9, repeat: Infinity }}
          />
        </div>
      </div>
    </div>
  );
}

