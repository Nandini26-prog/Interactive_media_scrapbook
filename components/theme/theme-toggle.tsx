"use client";

import * as React from "react";
import { Sparkles, Zap } from "lucide-react";
import { useTheme } from "./theme-provider";

export function ThemeToggle({ fixed = true }: { fixed?: boolean }) {
  const { theme, toggleTheme } = useTheme();
  const isChaos = theme === "chaos";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={[
        fixed ? "fixed right-4 top-4 z-50" : "relative",
        "select-none",
        "rounded-full",
        "px-4 py-2",
        "shadow-[0_12px_30px_rgba(0,0,0,0.18)]",
        "border border-black/10",
        "backdrop-blur",
        "transition-transform active:scale-[0.98] hover:scale-[1.02]",
        isChaos
          ? "bg-black/40 text-white border-white/15"
          : "bg-white/70 text-zinc-900",
      ].join(" ")}
      aria-label="Toggle theme"
    >
      <span className="flex items-center gap-2">
        {isChaos ? <Zap className="h-4 w-4" /> : <Sparkles className="h-4 w-4" />}
        <span
          className={[
            "text-sm tracking-wide",
            "font-title",
          ].join(" ")}
        >
          {isChaos ? "Chaos" : "Nostalgia"}
        </span>
      </span>
    </button>
  );
}

