"use client";

import * as React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { useTheme } from "../theme/theme-provider";
import { resolveDecor } from "../../lib/semantic-assets";
import { stableRandomBetween } from "../../lib/stable-random";

export function PhotoFrame({
  id,
  semantic,
  label,
}: {
  id: string;
  semantic: string;
  label: string;
}) {
  const { theme } = useTheme();
  const decor = resolveDecor(theme, semantic);

  const rot = stableRandomBetween(id, -3, 3);
  const x = stableRandomBetween(id + ":x", -10, 10);
  const y = stableRandomBetween(id + ":y", -6, 6);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16, rotate: rot - 2 }}
      whileInView={{ opacity: 1, y: 0, rotate: rot }}
      viewport={{ once: true, margin: "-20% 0px" }}
      transition={{ duration: 0.65, ease: [0.2, 0.9, 0.2, 1] }}
      className="relative w-[min(360px,84vw)]"
      style={{ transform: `translate(${x}px, ${y}px)` }}
    >
      {/* Frame */}
      <div className="relative aspect-[4/5]">
        {decor.frame ? (
          <Image
            src={decor.frame}
            alt=""
            fill
            sizes="360px"
            className="object-contain drop-shadow-[0_22px_50px_rgba(0,0,0,0.20)]"
          />
        ) : (
          <div className="absolute inset-0 rounded-3xl bg-white/60 shadow-[0_22px_60px_rgba(0,0,0,0.16)]" />
        )}

        {/* Placeholder photo */}
        <div className="absolute inset-[13%] rounded-xl overflow-hidden">
          <div
            className={[
              "absolute inset-0",
              theme === "chaos"
                ? "bg-[conic-gradient(from_130deg_at_50%_50%,#39ff14,#7c3aed,#00d4ff,#39ff14)]"
                : "bg-[radial-gradient(circle_at_30%_20%,rgba(182,75,42,0.25),transparent_55%),radial-gradient(circle_at_70%_80%,rgba(0,0,0,0.10),transparent_55%)]",
            ].join(" ")}
          />
          <div className="absolute inset-0 bg-black/5" />
        </div>

        {/* Tape */}
        {decor.tape ? (
          <Image
            src={decor.tape}
            alt=""
            width={0}
            height={0}
            sizes="100vw"
            style={{ width: "auto", height: "auto" }}
            className="pointer-events-none absolute -top-5 left-1/2 -translate-x-1/2 rotate-[-4deg] drop-shadow-[0_10px_20px_rgba(0,0,0,0.20)]"
          />
        ) : null}

        {/* Sticker / glitch */}
        {decor.sticker ? (
          <Image
            src={decor.sticker}
            alt=""
            width={0}
            height={0}
            sizes="100vw"
            style={{ width: "auto", height: "auto" }}
            className="pointer-events-none absolute -bottom-6 -right-6 rotate-[9deg] drop-shadow-[0_16px_30px_rgba(0,0,0,0.22)]"
          />
        ) : null}
      </div>

      <div className="mt-3 px-2 font-note text-xl text-black/70">
        {label}
      </div>
    </motion.div>
  );
}

