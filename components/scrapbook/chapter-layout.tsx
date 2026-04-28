"use client";

import * as React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { useTheme } from "../theme/theme-provider";
import { resolveDecor } from "../../lib/semantic-assets";

export function ChapterLayout({
  id,
  title,
  subtitle,
  semantic,
  children,
}: {
  id: string;
  title: string;
  subtitle?: string;
  semantic: string;
  children: React.ReactNode;
}) {
  const { theme } = useTheme();
  const decor = resolveDecor(theme, semantic);

  return (
    <section id={id} className="relative py-16 sm:py-24">
      <div className="relative mx-auto w-full max-w-6xl px-4 sm:px-8">
        {/* Hero painting marker */}
        {decor.heroPainting ? (
          <div className="relative h-28 sm:h-36 w-full mb-8 rotate-[-1deg]">
            <Image
              src={decor.heroPainting}
              alt=""
              fill
              className="object-contain"
              sizes="(max-width: 768px) 92vw, 900px"
            />
          </div>
        ) : null}

        <motion.h2
          initial={{ opacity: 0, y: 10, rotate: -1 }}
          whileInView={{ opacity: 1, y: 0, rotate: -1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.2, 0.9, 0.2, 1] }}
          className="font-title text-4xl sm:text-6xl tracking-tight"
        >
          {title}
        </motion.h2>

        {subtitle ? (
          <div className="mt-3 font-note text-2xl sm:text-3xl text-black/70">
            {subtitle}
          </div>
        ) : null}

        <div className="relative mt-12">
          {/* Corner anchors */}
          {decor.corner ? (
            <>
              <Image
                src={decor.corner}
                alt=""
                width={0}
                height={0}
                sizes="100vw"
                style={{ width: "auto", height: "auto" }}
                className="pointer-events-none absolute -top-10 -left-6 rotate-[-6deg] opacity-90"
              />
              <Image
                src={decor.corner}
                alt=""
                width={0}
                height={0}
                sizes="100vw"
                style={{ width: "auto", height: "auto" }}
                className="pointer-events-none absolute -bottom-10 -right-6 rotate-[10deg] opacity-70"
              />
            </>
          ) : null}

          <div className="relative grid gap-8 lg:grid-cols-12">
            {children}
          </div>
        </div>
      </div>
    </section>
  );
}

