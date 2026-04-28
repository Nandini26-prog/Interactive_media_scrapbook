"use client";

import * as React from "react";
import { ChapterLayout } from "../chapter-layout";
import { PhotoFrame } from "../photo-frame";

export function GenesisChapter() {
  return (
    <ChapterLayout
      id="genesis"
      title="Genesis"
      subtitle="the soft start of the whole storm"
      semantic="overlay bg hero painting genesis corner polaroid tape"
    >
      <div className="lg:col-span-7">
        <div className="relative">
          <PhotoFrame
            id="genesis-1"
            semantic="polaroid sentimental tape checked genesis corner"
            label="first sparks"
          />

          <div className="absolute -bottom-10 -left-6 rotate-[4deg] hidden sm:block">
            <PhotoFrame
              id="genesis-2"
              semantic="polaroid sentimental tape genesis vintage-corner"
              label="the day it felt real"
            />
          </div>
        </div>
      </div>

      <div className="lg:col-span-5 lg:pt-12">
        <div className="relative rounded-[32px] bg-white/60 border border-black/10 shadow-[0_26px_70px_rgba(0,0,0,0.16)] p-7 rotate-[-1deg]">
          <div className="font-note text-2xl leading-8 text-black/75">
            Not a clean timeline. More like… receipts. Paper cuts. Laugh lines.
            The kind of beginning that doesn’t announce itself — it just sticks.
          </div>
          <div className="mt-5 font-serif text-sm tracking-[0.18em] uppercase text-black/45">
            pinned to the page, forever
          </div>
        </div>
      </div>
    </ChapterLayout>
  );
}

