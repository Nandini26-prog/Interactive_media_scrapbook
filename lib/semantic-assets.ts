import type { ThemeName } from "../components/theme/theme-provider";

function has(s: string, needle: string) {
  return s.toLowerCase().includes(needle.toLowerCase());
}

export function themeAsset(theme: ThemeName, filename: string) {
  return `/assets/static/${theme}/${filename}`;
}

/**
 * String-based "semantic asset logic" per design guide.
 * Pass a single `semantic` string containing keywords like:
 * "polaroid tape sticker torn-paper sentimental technical genesis"
 */
export function resolveDecor(theme: ThemeName, semantic: string) {
  const s = semantic.toLowerCase();

  // Frames
  let frame: string | null = null;
  if (has(s, "polaroid")) {
    if (theme === "nostalgia") frame = themeAsset(theme, "polaroid-with-tape.png");
    if (theme === "chaos") {
      frame = has(s, "technical")
        ? themeAsset(theme, "frame-neongreen.png")
        : themeAsset(theme, "colorful-polaroid.png");
    }
  }

  // Tape
  let tape: string | null = null;
  if (has(s, "tape")) {
    if (theme === "nostalgia") {
      tape = has(s, "checked")
        ? themeAsset(theme, "tape-pink-checked.webp")
        : themeAsset(theme, "tape-pink-soft.png");
    } else {
      tape = themeAsset(theme, "tape-red.png");
    }
  }

  // Stickers / scribbles (mostly Chaos)
  let sticker: string | null = null;
  if (has(s, "sticker") || has(s, "glitch")) {
    // Your chaos folder doesn't include glitch-stickers.png; use available elements.
    sticker =
      theme === "chaos"
        ? has(s, "glitch")
          ? themeAsset(theme, "scribble-element.png")
          : themeAsset(theme, "sparkle-element.png")
        : null;
  }

  // Corner anchors for Genesis
  let corner: string | null = null;
  if (has(s, "genesis") || has(s, "corner")) {
    corner =
      theme === "nostalgia"
        ? has(s, "torn")
          ? themeAsset(theme, "torn-corner.png")
          : themeAsset(theme, "vintage-corner.png")
        : themeAsset(theme, "paint-corner-black.png");
  }

  // Section overlay background
  let overlayBg: string | null = null;
  if (has(s, "bg") || has(s, "overlay")) {
    overlayBg =
      theme === "nostalgia"
        ? themeAsset(theme, "paper-texture-bg.png")
        : themeAsset(theme, "wiggly-lines-bg.png");
  }

  // Torn paper blocks (Chaos)
  let tornPaper: string | null = null;
  if (has(s, "torn-paper")) {
    if (theme === "chaos") {
      tornPaper = has(s, "orange")
        ? themeAsset(theme, "torn-paper-orange.png")
        : themeAsset(theme, "torn-paper-black.png");
    }
  }

  // Hero painting markers
  let heroPainting: string | null = null;
  if (has(s, "painting") || has(s, "hero")) {
    // Filenames in this repo contain spaces / " - Copy" variants; match exactly.
    if (theme === "nostalgia") {
      // Prefer the newer "my painting2.png" unless semantic explicitly asks otherwise.
      heroPainting = themeAsset(theme, has(s, "1") ? "mypainting.png" : "my painting2.png");
    } else {
      heroPainting = themeAsset(
        theme,
        has(s, "1") ? "mypainting - Copy.png" : "my painting2 - Copy.png",
      );
    }
  }

  return { frame, tape, sticker, corner, overlayBg, tornPaper, heroPainting };
}

