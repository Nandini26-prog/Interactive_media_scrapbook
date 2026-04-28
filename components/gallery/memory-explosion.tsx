"use client";

import * as React from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { useTheme } from "../theme/theme-provider";
import { themeAsset } from "../../lib/semantic-assets";
import { stableRandomBetween } from "../../lib/stable-random";

type Card = {
  id: string;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  rotate: number;
};

function makeCards(count: number) {
  const cards: Card[] = [];
  for (let i = 0; i < count; i++) {
    const seed = `mem:${i}`;
    const edge = Math.floor(stableRandomBetween(seed + ":e", 0, 4)); // 0..3
    const startX =
      edge === 0
        ? stableRandomBetween(seed + ":x", -520, -260)
        : edge === 1
          ? stableRandomBetween(seed + ":x", 260, 520)
          : stableRandomBetween(seed + ":x", -420, 420);
    const startY =
      edge === 2
        ? stableRandomBetween(seed + ":y", -520, -260)
        : edge === 3
          ? stableRandomBetween(seed + ":y", 260, 520)
          : stableRandomBetween(seed + ":y", -420, 420);

    cards.push({
      id: seed,
      startX,
      startY,
      endX: stableRandomBetween(seed + ":ex", -110, 110),
      endY: stableRandomBetween(seed + ":ey", -80, 90),
      rotate: stableRandomBetween(seed + ":r", -18, 18),
    });
  }
  return cards;
}

export function MemoryExplosion() {
  const { theme } = useTheme();
  const isChaos = theme === "chaos";

  const [started, setStarted] = React.useState(false);
  const [cards] = React.useState(() => makeCards(18));
  const [confettiOn, setConfettiOn] = React.useState(false);

  const frameSrc = isChaos
    ? themeAsset("chaos", "colorful-polaroid.png")
    : themeAsset("nostalgia", "polaroid-with-tape.png");

  const confettiSrc = isChaos
    ? themeAsset("chaos", "confetti-element.png")
    : themeAsset("nostalgia", "confetti-element.png");

  function onYes() {
    if (started) return;
    setStarted(true);
    setConfettiOn(true);
    window.setTimeout(() => setConfettiOn(false), 650);
  }

  return (
    <section id="memory-explosion" className="relative py-20 sm:py-28 overflow-hidden">
      <div className="relative mx-auto w-full max-w-6xl px-4 sm:px-8">
        <div className="relative rounded-[44px] border border-black/10 bg-white/30 shadow-[0_32px_90px_rgba(0,0,0,0.20)] backdrop-blur overflow-hidden">
          {!started ? (
            <div className="relative px-6 sm:px-10 py-16 sm:py-20">
              <div className="max-w-3xl rotate-[-1deg]">
                <div className="font-title text-4xl sm:text-6xl tracking-tight">
                  Ready to relive the glitches in our matrix?
                </div>
                <div className="mt-5 font-note text-2xl sm:text-3xl text-black/70">
                  Say yes and let the pile crash-land.
                </div>

                <div className="mt-10">
                  <button
                    type="button"
                    onClick={onYes}
                    className={[
                      "inline-flex items-center justify-center",
                      "rounded-full px-8 py-4",
                      "shadow-[0_18px_50px_rgba(0,0,0,0.20)]",
                      "border",
                      "transition-transform active:scale-[0.98] hover:scale-[1.02]",
                      isChaos
                        ? "bg-black/40 text-white border-white/15"
                        : "bg-white/70 text-zinc-900 border-black/10",
                      "font-title tracking-[0.16em] uppercase",
                    ].join(" ")}
                  >
                    YES
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="relative h-[78vh] min-h-[620px] w-full">
              <AnimatePresence>
                {confettiOn ? (
                  <motion.div
                    className="absolute inset-0 pointer-events-none"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    {Array.from({ length: 20 }).map((_, i) => {
                      const seed = `conf:${i}`;
                      const x = stableRandomBetween(seed + ":x", -240, 240);
                      const y = stableRandomBetween(seed + ":y", -200, 140);
                      const r = stableRandomBetween(seed + ":r", -50, 50);
                      const s = stableRandomBetween(seed + ":s", 0.6, 1.05);
                      return (
                        <motion.img
                          key={seed}
                          src={confettiSrc}
                          alt=""
                          className="absolute left-1/2 top-1/2 w-24 sm:w-28 opacity-90"
                          style={{ translateX: "-50%", translateY: "-50%" }}
                          initial={{ x: 0, y: 0, rotate: 0, scale: 0.4, opacity: 0 }}
                          animate={{
                            x,
                            y,
                            rotate: r,
                            scale: s,
                            opacity: [0, 1, 0],
                          }}
                          transition={{ duration: 0.8, ease: "easeOut" }}
                          draggable={false}
                        />
                      );
                    })}
                  </motion.div>
                ) : null}
              </AnimatePresence>

              <div className="absolute inset-0 grid place-items-center">
                <div className="relative w-[min(860px,92vw)] h-[min(540px,70vh)]">
                  {cards.map((c, i) => (
                    <motion.div
                      key={c.id}
                      className="absolute left-1/2 top-1/2"
                      style={{ translateX: "-50%", translateY: "-50%" }}
                      initial={{
                        x: c.startX,
                        y: c.startY,
                        rotate: c.rotate - 8,
                        scale: 0.92,
                        opacity: 0,
                      }}
                      animate={{
                        x: c.endX,
                        y: c.endY,
                        rotate: c.rotate,
                        scale: 1,
                        opacity: 1,
                      }}
                      transition={{
                        delay: 0.05 * i,
                        duration: 0.85,
                        ease: [0.2, 0.9, 0.2, 1],
                      }}
                      drag
                      dragMomentum={false}
                      dragElastic={0.12}
                      whileDrag={{
                        scale: 1.03,
                        zIndex: 30,
                      }}
                    >
                      <div className="relative w-[min(240px,52vw)]">
                        <Image
                          src={frameSrc}
                          alt=""
                          width={0}
                          height={0}
                          sizes="100vw"
                          style={{ width: "auto", height: "auto" }}
                          className="block drop-shadow-[0_26px_60px_rgba(0,0,0,0.26)] select-none pointer-events-none"
                        />

                        <div className="absolute inset-[13%] rounded-xl overflow-hidden">
                          <div
                            className={[
                              "absolute inset-0",
                              isChaos
                                ? "bg-[conic-gradient(from_130deg_at_50%_50%,#39ff14,#7c3aed,#00d4ff,#39ff14)]"
                                : "bg-[radial-gradient(circle_at_30%_20%,rgba(182,75,42,0.25),transparent_55%),radial-gradient(circle_at_70%_80%,rgba(0,0,0,0.10),transparent_55%)]",
                            ].join(" ")}
                          />
                          <div className="absolute inset-0 bg-black/5" />
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

