"use client";

import * as React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { useTheme } from "../theme/theme-provider";
import { themeAsset } from "../../lib/semantic-assets";

export function FireworksHero() {
  const { theme } = useTheme();
  const isChaos = theme === "chaos";

  const tape = isChaos
    ? themeAsset("chaos", "tape-red.png")
    : themeAsset("nostalgia", "tape-pink-soft.png");

  const painting = isChaos
    ? themeAsset("chaos", "mypainting - Copy.png")
    : themeAsset("nostalgia", "mypainting.png");

  return (
    <div className="fixed inset-0 z-0 pointer-events-none">
      <div className="absolute inset-0 grid place-items-center">
        {/* Vertical video frame */}
        <div className="relative h-[92vh] w-[min(420px,88vw)]">
          <video
            className="absolute inset-0 h-full w-full object-contain"
            src="/assets/static/hero-fireworks.mp4"
            autoPlay
            muted
            playsInline
            loop
          />

          {/* Layered scrapbook elements fading in over video */}
          <motion.div
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 1.2, ease: [0.2, 0.9, 0.2, 1] }}
          >
            <Image
              src={painting}
              alt=""
              width={0}
              height={0}
              sizes="100vw"
              style={{ width: "auto", height: "auto" }}
              className="absolute -top-6 left-1/2 -translate-x-1/2 rotate-[-2deg] opacity-90"
            />
            <Image
              src={tape}
              alt=""
              width={0}
              height={0}
              sizes="100vw"
              style={{ width: "auto", height: "auto" }}
              className="absolute top-10 left-6 rotate-[-14deg] opacity-90"
            />
            <Image
              src={tape}
              alt=""
              width={0}
              height={0}
              sizes="100vw"
              style={{ width: "auto", height: "auto" }}
              className="absolute top-12 right-6 rotate-[18deg] opacity-80"
            />

            {/* Bottom-half title/quote (keeps top fireworks visible) */}
            <div className="absolute bottom-10 left-0 right-0 px-6 text-center">
              <div className="font-serif text-[11px] tracking-[0.42em] uppercase text-black/70">
                Genesis
              </div>
              <div className="mt-3 font-handwritten text-3xl text-black/80 leading-9 rotate-[-1deg]">
                “we became a lifetime by accident.”
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

