"use client";

import * as React from "react";
import Image from "next/image";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

export function MagazineCover({
  onFinish,
}: {
  onFinish: () => void;
}) {
  const ref = React.useRef<HTMLDivElement | null>(null);
  const [isLeaving, setIsLeaving] = React.useState(false);
  const [flash, setFlash] = React.useState(false);

  const mx = useMotionValue(0);
  const my = useMotionValue(0);

  const rX = useTransform(my, [-0.5, 0.5], [10, -10]);
  const rY = useTransform(mx, [-0.5, 0.5], [-12, 12]);
  const rotateX = useSpring(rX, { stiffness: 220, damping: 26 });
  const rotateY = useSpring(rY, { stiffness: 220, damping: 26 });

  function handleMove(e: React.MouseEvent) {
    if (isLeaving) return;
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    mx.set(px);
    my.set(py);
  }

  function handleLeave() {
    mx.set(0);
    my.set(0);
  }

  async function handleClick() {
    if (isLeaving) return;
    setIsLeaving(true);
    setFlash(true);
    window.setTimeout(() => setFlash(false), 500);
    window.setTimeout(() => onFinish(), 650);
  }

  return (
    <div className="fixed inset-0 z-30 grid place-items-center overflow-hidden">
      <div className="absolute inset-0 bg-[var(--background)]" />

      <motion.div
        ref={ref}
        onMouseMove={handleMove}
        onMouseLeave={handleLeave}
        onClick={handleClick}
        className={[
          "relative cursor-pointer select-none",
          "w-[min(520px,86vw)]",
          "h-[min(82vh,760px)]",
          "rounded-[22px]",
          "shadow-[0_50px_120px_rgba(0,0,0,0.33)]",
          "ring-1 ring-black/10",
          "origin-center",
        ].join(" ")}
        style={{
          rotateX,
          rotateY,
          transformStyle: "preserve-3d",
          perspective: 1200,
        }}
        animate={
          isLeaving
            ? { scale: 1.38, opacity: 0, filter: "blur(2px)" }
            : { scale: 1, opacity: 1, filter: "blur(0px)" }
        }
        transition={{ duration: 0.55, ease: [0.2, 0.9, 0.2, 1] }}
      >
        <div
          className={[
            "absolute inset-0 rounded-[22px] overflow-hidden",
            "bg-white",
          ].join(" ")}
          style={{ transform: "translateZ(0px)" }}
        >
          <Image
            src="/assets/static/magazine-cover.png"
            alt="Magazine cover"
            fill
            priority
            sizes="(max-width: 768px) 86vw, 520px"
            className="object-contain"
          />
        </div>

        <div
          className={[
            "pointer-events-none absolute inset-0 rounded-[22px]",
            "bg-[radial-gradient(circle_at_30%_15%,rgba(255,255,255,0.55),transparent_40%)]",
            "mix-blend-screen",
            "opacity-70",
          ].join(" ")}
          style={{ transform: "translateZ(45px)" }}
        />

        <div
          className={[
            "pointer-events-none absolute -inset-10",
            "bg-[radial-gradient(circle_at_70%_90%,rgba(57,255,20,0.22),transparent_50%)]",
            "opacity-[var(--chaos-glow,0)]",
          ].join(" ")}
          style={{ transform: "translateZ(30px)" }}
        />
      </motion.div>

      <motion.div
        className="pointer-events-none absolute inset-0 bg-white"
        initial={{ opacity: 0 }}
        animate={{ opacity: flash ? 1 : 0 }}
        transition={{ duration: 0.5, ease: "linear" }}
      />
    </div>
  );
}

