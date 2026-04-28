"use client";

import * as React from "react";
import Image from "next/image";
import { ChapterLayout } from "../chapter-layout";
import { PhotoFrame } from "../photo-frame";
import { useTheme } from "../../theme/theme-provider";
import { themeAsset } from "../../../lib/semantic-assets";

export function ChaosChapter() {
  const { theme } = useTheme();
  const isChaos = theme === "chaos";

  return (
    <ChapterLayout
      id="the-chaos"
      title="The Chaos"
      subtitle="3 AM energy, neon proof, bad decisions archived"
      semantic="overlay bg hero painting polaroid tape sticker glitch"
    >
      {/* Extra chaos-only overlay: wiggly lines */}
      {isChaos ? (
        <div className="pointer-events-none absolute inset-0 opacity-30">
          <Image
            src={themeAsset("chaos", "wiggly-lines-bg.png")}
            alt=""
            fill
            className="object-cover"
            sizes="100vw"
          />
        </div>
      ) : null}

      <div className="lg:col-span-7">
        <div className="relative">
          <PhotoFrame
            id="chaos-1"
            semantic="polaroid tape sticker glitch"
            label="we were unstoppable (for like 6 minutes)"
          />

          <div className="absolute -top-10 right-0 rotate-[-6deg] hidden sm:block">
            <PhotoFrame
              id="chaos-2"
              semantic="polaroid technical tape sticker glitch"
              label="internship mode: unhinged"
            />
          </div>
        </div>
      </div>

      <div className="lg:col-span-5 lg:pt-14">
        <div className="relative rounded-[34px] bg-black/20 border border-white/15 shadow-[0_26px_80px_rgba(0,0,0,0.32)] p-7 rotate-[2deg] backdrop-blur">
          <div className="font-note text-2xl leading-8 text-white/85">
            Everything was loud. Screens bright. Plans questionable. But somehow
            it all worked — or at least looked iconic while failing.
          </div>
          <div className="mt-6 flex items-center gap-3">
            <span className="h-2 w-2 rounded-full bg-[var(--accent)] shadow-[0_0_18px_rgba(57,255,20,0.6)]" />
            <div className="font-loud text-xs tracking-[0.22em] uppercase text-white/70">
              chaos certified
            </div>
          </div>
        </div>
      </div>

      {/* Scatter chaos elements when in Chaos mode */}
      {isChaos ? (
        <>
          <Image
            src={themeAsset("chaos", "sparkle-element.png")}
            alt=""
            width={0}
            height={0}
            sizes="100vw"
            style={{ width: "auto", height: "auto" }}
            className="pointer-events-none absolute top-16 right-10 rotate-[11deg] opacity-90 hidden md:block"
          />
          <Image
            src={themeAsset("chaos", "scribble-element.png")}
            alt=""
            width={0}
            height={0}
            sizes="100vw"
            style={{ width: "auto", height: "auto" }}
            className="pointer-events-none absolute bottom-8 left-10 -rotate-[10deg] opacity-80 hidden md:block"
          />
        </>
      ) : null}
    </ChapterLayout>
  );
}

