"use client";

import * as React from "react";
import { useTheme } from "../theme/theme-provider";

const PLAYLIST_ID_NOSTALGIA = "4XUNik0MiQi28XGCXwsNmr";
const PLAYLIST_ID_CHAOS = "1AoYGnxJoVURyreGojeK3D";

export function MoodRadio() {
  const { theme } = useTheme();
  const playlistId = theme === "chaos" ? PLAYLIST_ID_CHAOS : PLAYLIST_ID_NOSTALGIA;

  const src = `https://open.spotify.com/embed/playlist/${playlistId}?utm_source=generator&theme=0`;

  return (
    <div className="fixed bottom-4 left-4 z-40">
      <div
        className={[
          "relative w-[300px] max-w-[82vw]",
          "rounded-[26px]",
          "border border-black/15",
          "bg-white/55",
          "backdrop-blur",
          "shadow-[0_18px_55px_rgba(0,0,0,0.18)]",
          "overflow-hidden",
          "rotate-[-2deg]",
        ].join(" ")}
      >
        {/* cassette-ish top stripe */}
        <div className="h-9 bg-black/10 border-b border-black/10 flex items-center justify-between px-4">
          <div className="font-serif text-[11px] tracking-[0.34em] uppercase text-black/60">
            Mood Radio
          </div>
          <div className="font-handwritten text-[14px] text-black/60 rotate-[-1deg]">
            {theme === "chaos" ? "chaos mix" : "nostalgia mix"}
          </div>
        </div>

        <div className="p-3">
          <iframe
            title="Mood Radio"
            style={{ borderRadius: 16 }}
            src={src}
            width="100%"
            height="152"
            frameBorder="0"
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            loading="lazy"
          />
        </div>
      </div>
    </div>
  );
}

