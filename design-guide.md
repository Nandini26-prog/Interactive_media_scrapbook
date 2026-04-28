# Visual Identity & Logic Guide: The Digital Scrapbook

## 1. Core Aesthetic: "Maximalist Digital Junk Journal"
- **Vibe:** Hand-crafted, layered, textured, and full of life. 
- **Anti-Rules:** NO clean/minimalist UI. NO perfectly aligned grids. NO standard buttons.
- **Key Techniques:** - Use `rotate-[1deg]` to `rotate-[6deg]` on almost all images and notes to look "pasted."
  - Overlap elements (images over letters, tape over image corners).
  - Use `box-shadow` that looks like physical depth on paper.

## 2. The "Vibe Toggle" System
The website must support two distinct themes via a `data-theme` attribute on the body.

### A. Nostalgia Mode (Sentimental/Soft)
- **Background:** #FFF9F0 (Aged Paper/Canvas texture).
- **Typography:** Serif (Playfair Display) for headers, Handwritten (Caveat) for notes.
- **Assets Folder:** `/public/assets/static/nostalgia/`
- **Asset Logic:** Use `polaroid-white.png`, `dried-flower.png`, `soft-tape.png`.
- **Mood:** Emotional, warm, "Person of a lifetime" energy.

### B. Chaos Mode (Hype/Electric)
- **Background:** #1A1A2E (Deep Midnight/Grunge).
- **Typography:** Bold/Loud (Bungee) for headers, Messy Print for notes.
- **Assets Folder:** `/public/assets/static/chaos/`
- **Asset Logic:** Use `black-rip.png`, `neon-grid-tape.png`, `glitch-stickers.png`.
- **Mood:** 3 AM madness, Technoverse stress, "Why did we do that?" energy.

## 3. Semantic Asset Logic (Exact Filename Mapping)
Cursor must map the following specific files from `/public/assets/static/[theme]/` to UI behaviors:

### A. Framing & Backgrounds
- **`polaroid-with-tape.png` (Nostalgia):** Use as the primary frame for "sentimental" photos.
- **`colorful-polaroid.png` (Chaos):** Use for fun, loud photos.
- **`frame-neongreen.png` (Chaos):** Use for technical/internship memories.
- **`paper-texture-bg.png` (Nostalgia) & `wiggly-lines-bg.png` (Chaos):** Use as section-wide background overlays (low opacity) to add depth.
- **`torn-paper-bg-black.png` / `torn-paper-black.png` / `torn-paper-orange.png` (Chaos):** Use as backgrounds for "Inside Joke" text blocks.

### B. Decoration & "Pasting"
- **`tape-pink-checked.png` / `tape-pink-soft.png` (Nostalgia):** Apply to corners of `letter-paper`.
- **`tape-red.png` (Chaos):** Apply to corners of `torn-paper` or photos.
- **`paint-corner-black.png` (Chaos):** Position fixed in the corners of the viewport to "frame" the chaos.
- **`vintage-corner.png` / `torn-corner.png` (Nostalgia):** Use to anchor the "Genesis" chapter images.

### C. Artistic Personal Touches
- **`my-painting.png` / `my-painting2.png` (Both):** These are high-priority personal markers. Use them as "Hero" elements at the start of Chapters.
- **`mypaintintg-bg.png` (Chaos):** Use as a full-screen transition background when moving into a deep-dive gallery.
- **`paint-stroke.png` / `paint-splash-red.png`:** Use as underlines for titles or behind "Important" dates.

### D. Directional & Interactive Elements
- **`left-arrow.png` / `right-arrow.png` / `right-arrow` (Scribble):** Use as navigation buttons for the horizontal scroll sections.
- **`confetti-element.png`:** Trigger a "burst" of this image when the friend clicks the "Yes" prompt for the gallery.
- **`sparkle-element.png` / `scribble-element.png`:** Scatter these randomly around the 'Chaos' canvas to fill white space.


## 4. Interaction Flow
1. **Intro:** `magazine-cover.png` with a 3D tilt effect on mouse move.
2. **Transition:** On click -> Zoom into cover -> Blur -> Pure White Flash -> Reveal Scrapbook.
3. **The Canvas:** An infinite-scroll or zoomable canvas where memories are scattered.
4. **The Gallery:** A "pile" of photos that are `draggable` using Framer Motion.