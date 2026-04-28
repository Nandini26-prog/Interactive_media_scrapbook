"use client";

import * as React from "react";
import { ThemeToggle } from "../theme/theme-toggle";

const CHAPTERS = [
  { id: "genesis", label: "Genesis" },
  { id: "the-chaos", label: "The Chaos" },
  { id: "memory-explosion", label: "Memory Explosion" },
  { id: "thread-of-us", label: "Thread of Us" },
] as const;

export function TopBar() {
  return (
    <div className="fixed top-0 left-0 right-0 z-50">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-8">
        <div
          className={[
            "mt-3",
            "rounded-full",
            "border-b border-black/15",
            "bg-white/55",
            "backdrop-blur",
            "shadow-[0_10px_40px_rgba(0,0,0,0.10)]",
          ].join(" ")}
        >
          <div className="flex items-center justify-between gap-4 px-5 py-3">
            <div className="min-w-0">
              <div className="font-serif text-[12px] sm:text-[13px] tracking-[0.35em] uppercase text-black/70 whitespace-nowrap">
                Prestige Farewell
              </div>
            </div>

            <div className="shrink-0">
              <ThemeToggle fixed={false} />
            </div>

            <nav className="hidden md:flex items-center gap-6 min-w-0">
              {CHAPTERS.map((c) => (
                <a
                  key={c.id}
                  href={`#${c.id}`}
                  className="font-serif text-[11px] tracking-[0.28em] uppercase text-black/55 hover:text-black/85 transition-colors whitespace-nowrap"
                >
                  {c.label}
                </a>
              ))}
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
}

