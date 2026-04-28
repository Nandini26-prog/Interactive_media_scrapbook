"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";

interface Props {
  onClose?: () => void;
  isChaosModeActive?: boolean;
}

export function CreditsRoll({ onClose, isChaosModeActive }: Props) {
  // Check if it's acting as a standalone page (overlay) or an inline footer
  const isOverlay = !!onClose;

  return (
    <motion.div
      initial={isOverlay ? { opacity: 0 } : {}}
      animate={isOverlay ? { opacity: 1 } : {}}
      exit={isOverlay ? { opacity: 0 } : {}}
      // FIXED: Conditional positioning logic
      className={`${
        isOverlay ? "fixed inset-0 z-[300]" : "relative w-full"
      } flex flex-col items-center justify-start overflow-hidden bg-black text-white`}
      style={{ minHeight: "100vh" }}
    >
      {/* Close Button - Only show in Overlay Mode */}
      {isOverlay && (
        <button
          onClick={onClose}
          className="fixed top-8 right-8 z-[310] p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
        >
          <X size={24} />
        </button>
      )}

      {/* The Rolling Content */}
      <div className={`relative w-full max-w-2xl px-6 ${isOverlay ? 'pt-[100vh]' : 'pt-40'} pb-[50vh]`}>
        <motion.div
          initial={{ y: "20%" }}
          whileInView={{ y: "-150%" }} // Starts moving when it enters the viewport
          viewport={{ once: false }}
          transition={{
            duration: 30, // Thoda slow kiya for better reading
            ease: "linear",
            repeat: Infinity,
          }}
          className="flex flex-col items-center text-center space-y-12"
        >
          {/* Main Title */}
          <div className="space-y-4">
            <h2 
              className="text-white/40 tracking-[0.3em] uppercase text-xs sm:text-sm"
              style={{ fontFamily: "var(--font-caveat)" }}
            >
              A Farewell Presentation
            </h2>
            <h1 
              className="text-4xl md:text-7xl font-bold"
              style={{ 
                fontFamily: isChaosModeActive ? "var(--font-bungee)" : "var(--font-playfair)" 
              }}
            >
              BANASTHALI DIARIES
            </h1>
            <p className="text-lg md:text-xl opacity-60">2022 — 2026</p>
          </div>

          <div className="w-16 h-[1px] bg-white/20" />

          {/* Core Credits */}
          <div className="space-y-10">
            <div>
              <p className="text-white/40 text-[10px] uppercase tracking-[0.2em] mb-2">Directed & Curated By</p>
              <p className="text-3xl md:text-4xl font-medium" style={{ fontFamily: "var(--font-caveat)" }}>Nandini Jain</p>
            </div>

            <div>
              <p className="text-white/40 text-[10px] uppercase tracking-[0.2em] mb-2">Executive Best Friend</p>
              <p className="text-3xl md:text-4xl font-medium" style={{ fontFamily: "var(--font-caveat)" }}>Pragya Rastogi/ Paggaa / Prestige </p>
            </div>

            <div>
              <p className="text-white/40 text-[10px] uppercase tracking-[0.2em] mb-2">Filmed on Location at</p>
              <p className="text-2xl md:text-3xl">Banasthali Vidyapith</p>
              <p className="text-xs opacity-40 italic mt-1">Rajasthan, India</p>
            </div>
          </div>

          {/* Cast of Life */}
          <div className="space-y-8 pt-10">
            <p className="text-white/40 text-[10px] uppercase tracking-[0.2em]">The Cast</p>
            <div className="space-y-4 text-xl md:text-2xl">
              <p>The 3AM club</p>
              <p>Done and dusted by 'GIRLS'</p>
              <p>The Mess Food Survivors</p>
              <p>Time and our growth</p>
              <p>The people of lifetime</p>
            </div>
          </div>

          <div className="pt-20">
            <p className="text-white/30 text-sm italic max-w-xs mx-auto">
              "Because every great story deserves a standing ovation."
            </p>
          </div>

          {/* Final Logo */}
          <div className="pt-60 opacity-30 select-none pb-20">
            <h3 className="text-6xl md:text-8xl tracking-tighter" style={{ fontFamily: "var(--font-playfair)" }}>
              End.
            </h3>
          </div>
        </motion.div>
      </div>

      {/* Cinematic Vignette */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black via-transparent to-black z-[5]" />
    </motion.div>
  );
}
