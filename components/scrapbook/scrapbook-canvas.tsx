"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { GenesisChapter } from "./chapters/genesis";
import { ChaosChapter } from "./chapters/chaos";
import { MemoryExplosion } from "../gallery/memory-explosion";
import { ThreadOfUs } from "../thread/thread-of-us";

export function ScrapbookCanvas() {
  return (
    <div className="relative flex-1 overflow-y-auto">
      <div className="relative mx-auto w-full max-w-5xl px-4 py-16 sm:px-8">
        <motion.h1
          initial={{ opacity: 0, y: 14, rotate: -1 }}
          animate={{ opacity: 1, y: 0, rotate: -1 }}
          transition={{ duration: 0.7, ease: [0.2, 0.9, 0.2, 1] }}
          className="text-4xl sm:text-5xl leading-[1.05] tracking-tight font-title"
        >
          <span className="block">The Scrapbook Canvas</span>
          <span className="mt-2 block font-note text-2xl sm:text-3xl text-black/70">
            flip the vibe. watch the page change.
          </span>
        </motion.h1>

        <div className="mt-10" />
      </div>

      <GenesisChapter />
      <ChaosChapter />
      <MemoryExplosion />
      <ThreadOfUs />
    </div>
  );
}

