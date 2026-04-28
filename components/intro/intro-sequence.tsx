"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { TerminalLoader } from "./terminal-loader";
import { MagazineCover } from "./magazine-cover";

export function IntroSequence({ onDone }: { onDone: () => void }) {
  const [stage, setStage] = React.useState<"loading" | "cover">("loading");

  return (
    <AnimatePresence mode="wait">
      {stage === "loading" ? (
        <motion.div
          key="loading"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35 }}
        >
          <TerminalLoader onDone={() => setStage("cover")} />
        </motion.div>
      ) : (
        <motion.div
          key="cover"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35 }}
        >
          <MagazineCover onFinish={onDone} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

