"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { stableRandomBetween } from "../../lib/stable-random";

export function StickyNote({
  id,
  message,
  author,
  isChaos,
  index,
}: {
  id: string;
  message: string;
  author: string;
  isChaos: boolean;
  index: number;
}) {
  const seed = `${id}:${index}:${author}`;
  const rot = stableRandomBetween(seed, isChaos ? -10 : -4, isChaos ? 10 : 4);
  const top = stableRandomBetween(seed + ":top", 8, 78);
  const left = stableRandomBetween(seed + ":left", 10, 90);
  const jitterX = stableRandomBetween(seed + ":jx", -26, 26);
  const jitterY = stableRandomBetween(seed + ":jy", -20, 20);
  const tapeSide = stableRandomBetween(seed + ":tape", 0, 1) > 0.5 ? "right" : "left";
  const tapeRot = stableRandomBetween(seed + ":trot", isChaos ? -26 : -10, isChaos ? 26 : 10);

  const paperSrc = isChaos
    ? "/assets/static/chaos/torn-paper-black.png"
    : "/assets/static/nostalgia/letter-paper.png";
  const tapeSrc = isChaos
    ? "/assets/static/chaos/tape-red.png"
    : "/assets/static/nostalgia/tape-pink-soft.png";

  return (
    <motion.div
      className="absolute touch-none"
      style={{
        top: `${top}%`,
        left: `${left}%`,
        transform: `translate(-50%, -50%) translate(${jitterX}px, ${jitterY}px) rotate(${rot}deg)`,
      }}
      initial={{ opacity: 0, scale: 0.98 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, margin: "-10% 0px" }}
      transition={{ duration: 0.5, ease: [0.2, 0.9, 0.2, 1] }}
      drag
      dragMomentum={false}
      dragElastic={0.12}
      whileDrag={{ scale: 1.03, rotate: rot + (isChaos ? 2 : 1), zIndex: 20 }}
    >
      <div className="relative w-[min(320px,78vw)]">
        {/* Paper (required: <img> inside relative container) */}
        <img
          src={paperSrc}
          alt=""
          className={[
            "block w-full h-auto select-none pointer-events-none",
            "drop-shadow-[0_22px_60px_rgba(0,0,0,0.22)]",
          ].join(" ")}
          draggable={false}
        />

        {/* Tape corner */}
        <img
          src={tapeSrc}
          alt=""
          className={[
            "absolute -top-4",
            tapeSide === "left" ? "left-3" : "right-3",
            "w-24 sm:w-28",
            "select-none pointer-events-none",
            "drop-shadow-[0_12px_24px_rgba(0,0,0,0.22)]",
          ].join(" ")}
          style={{ transform: `rotate(${tapeRot}deg)` }}
          draggable={false}
        />

        {/* Content */}
        <div className="absolute inset-0 px-7 py-8">
          <div
            className={[
              "whitespace-pre-wrap",
              "leading-7",
              isChaos ? "font-serif font-bold text-white/90" : "font-handwritten text-black/80",
              isChaos ? "text-[18px]" : "text-[22px]",
            ].join(" ")}
          >
            {message}
          </div>

          <div
            className={[
              "absolute bottom-5 right-6",
              "text-xs tracking-wide",
              "opacity-80",
              "font-handwritten",
              isChaos ? "text-white/85" : "text-black/70",
              "rotate-[-2deg]",
            ].join(" ")}
          >
            — {author}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

