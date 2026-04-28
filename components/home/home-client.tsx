
"use client";

import {
  useRef,
  useEffect,
  useState,
  useCallback,
  type CSSProperties,
} from "react";
import { Zap, Sparkles } from "lucide-react";
import { FilmReelOverlay } from "./film-reel-overlay";
import { CreditsRoll } from "./credits-roll";

// ─────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────
const SUPABASE_STORAGE = "https://fjkvnqksolupscjgjwkc.supabase.co/storage/v1/object/public/memories";

const MOVIES = [
  {
    id: "01-blueprint",
    title: "The Blueprint",
    subtitle: "Where it all began",
    coverImage: "cover.jpg",
    year: "2022",
    genre: "Origin Story",
    rotate: "-2deg",
    isFinale: false,
  },
  {
    id: "02_hostel",
    title: "Hostel Diaries",
    subtitle: "Room 204 chronicles",
    coverImage: "cover.jpg",
    year: "2022–26",
    genre: "Slice of Life",
    rotate: "1.5deg",
    usePainting: true,
    isFinale: false,
  },
  {
    id: "03_food",
    title: "Food Crimes",
    subtitle: "Midnight mess hall",
    coverImage: "cover.jpg",
    year: "2023",
    genre: "Documentary",
    rotate: "-1deg",
    isFinale: false,
  },
  {
    id: "04_trips",
    title: "Escape Routes",
    subtitle: "Every detour taken",
    coverImage: "cover.jpg",
    year: "2023–25",
    genre: "Adventure",
    rotate: "2.5deg",
    isFinale: false,
  },
  {
    id: "05_glitches",
    title: "Glitches",
    subtitle: "The unplanned frames",
    coverImage: "cover.jpg",
    year: "2024",
    genre: "Experimental",
    rotate: "-3deg",
    isFinale: false,
  },
  {
    id: "06_letters",
    title: "A Letter",
    subtitle: "Everything unsaid",
    coverImage: "cover.jpg",
    year: "2026",
    genre: "Finale",
    rotate: "1deg",
    isFinale: true,
  },
] as const;

type MovieId = (typeof MOVIES)[number]["id"];
type Theme = "nostalgia" | "chaos";

// ─────────────────────────────────────────────────────────────
// PLAYLISTS
// ─────────────────────────────────────────────────────────────
const PLAYLISTS: Record<Theme, { embedUrl: string; label: string }> = {
  nostalgia: {
    embedUrl:
      "https://open.spotify.com/embed/playlist/4XUNik0MiQi28XGCXwsNmr?utm_source=generator&theme=0",
    label: "Nostalgia Radio 🌸",
  },
  chaos: {
    embedUrl:
      "https://open.spotify.com/embed/playlist/1AoYGnxJoVURyreGojeK3D?utm_source=generator&theme=0",
    label: "Chaos Radio ⚡",
  },
};

// ─────────────────────────────────────────────────────────────
// TAPE
// ─────────────────────────────────────────────────────────────
function Tape({ position, theme }: { position: "top-left" | "top-right"; theme: Theme }) {
  const src =
    theme === "chaos"
      ? "/assets/static/chaos/tape-red.png"
      : "/assets/static/nostalgia/tape-pink-soft.png";
  const rot = position === "top-left" ? "-22deg" : "22deg";
  const posStyle: CSSProperties =
    position === "top-left" ? { top: -11, left: 12 } : { top: -11, right: 12 };
  return (
    <img
      src={src}
      alt=""
      aria-hidden
      style={{
        position: "absolute",
        width: 50,
        height: 20,
        objectFit: "cover",
        transform: `rotate(${rot})`,
        pointerEvents: "none",
        zIndex: 10,
        opacity: 0.9,
        ...posStyle,
      }}
    />
  );
}

// ─────────────────────────────────────────────────────────────
// MOVIE POSTER CARD
// ─────────────────────────────────────────────────────────────
interface PosterProps {
  movie: (typeof MOVIES)[number];
  theme: Theme;
  onClick: (id: MovieId, el: HTMLElement) => void;
  index: number;
}

function MoviePoster({ movie, theme, onClick, index }: PosterProps) {
  const ref = useRef<HTMLButtonElement>(null);
  const [hovered, setHovered] = useState(false);
  const isChaos = theme === "chaos";
  const coverimgUrl = `${SUPABASE_STORAGE}/${movie.id}/${movie.coverImage}`;

  const frameImg = isChaos
    ? movie.id === "01-blueprint"
      ? "/assets/static/chaos/frame-neongreen.png"
      : "/assets/static/chaos/colorful-polaroid.png"
    : "/assets/static/nostalgia/polaroid-with-tape.png";

  return (
    <button
      ref={ref}
      onClick={() => ref.current && onClick(movie.id as MovieId, ref.current)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: "none",
        border: "none",
        padding: 0,
        cursor: "pointer",
        transform: hovered
          ? "rotate(0deg) scale(1.08) translateY(-8px)"
          : `rotate(${movie.rotate})`,
        transition: "transform 0.28s cubic-bezier(0.34,1.56,0.64,1)",
        filter: hovered
          ? isChaos
            ? "drop-shadow(0 0 18px #9b59b6) drop-shadow(0 8px 24px rgba(0,0,0,0.7))"
            : "drop-shadow(0 12px 28px rgba(0,0,0,0.28))"
          : isChaos
          ? "drop-shadow(0 4px 12px rgba(0,0,0,0.6))"
          : "drop-shadow(0 4px 12px rgba(0,0,0,0.14))",
        animationDelay: `${index * 0.08}s`,
        animation: "posterReveal 0.5s ease both",
      }}
    >
      {/* Tape sticker */}
      <Tape position={index % 2 === 0 ? "top-left" : "top-right"} theme={theme} />

      {/* Card body */}
      <div
        style={{
          width: 168,
          background: isChaos
            ? "linear-gradient(160deg, #12122a 0%, #1a1a3a 100%)"
            : "#fffdf7",
          border: isChaos
            ? "1.5px solid rgba(155,89,182,0.3)"
            : "1.5px solid rgba(200,170,130,0.35)",
          borderRadius: 6,
          padding: "10px 10px 16px",
          position: "relative",
          overflow: "hidden",
          boxShadow: isChaos
            ? "0 8px 32px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.04)"
            : "0 4px 20px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.7)",
        }}
      >
        {/* Frame image overlay */}
        <img
          src={frameImg}
          alt=""
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            opacity: 0.07,
            pointerEvents: "none",
          }}
        />

        {/* Poster art area */}
        <div
          style={{
            width: "100%",
            height: 108,
            background: isChaos
              ? "linear-gradient(135deg, rgba(155,89,182,0.15), rgba(255,107,53,0.1))"
              : "linear-gradient(135deg, rgba(200,170,130,0.2), rgba(255,240,220,0.5))",
            borderRadius: 3,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 40,
            position: "relative",
            overflow: "hidden",
            marginBottom: 10,
          }}
        >
          {/* Painting as hero for hostel */}
          {/* {movie.usePainting ? (
            <img
              src="/assets/static/nostalgia/mypainting.png"
              alt="painting"
              style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.8 }}
            />
          ) : (
            <span style={{ lineHeight: 1, filter: isChaos ? "drop-shadow(0 0 8px currentColor)" : "none" }}>
              {movie.emoji}
            </span>
          )} */}

          <img src={coverimgUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", opacity: hovered ? 1 : 0.8, filter: hovered ? "none" : "sepia(0.2) contrast(1.1)" }} />
          {/* Paint stroke accent */}
          <img
            src={isChaos ? "/assets/static/chaos/paint-splash-red.png" : "/assets/static/nostalgia/paint-stroke.png"}
            alt=""
            aria-hidden
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "contain",
              opacity: 0.12,
              pointerEvents: "none",
            }}
          />
        </div>

        {/* Genre tag */}
        <p
          style={{
            fontFamily: "var(--font-caveat)",
            fontSize: "0.65rem",
            color: isChaos ? "#9b59b6" : "#c8a97e",
            textTransform: "uppercase",
            letterSpacing: "0.12em",
            marginBottom: 3,
            opacity: 0.8,
          }}
        >
          {movie.genre} · {movie.year}
        </p>

        {/* Title */}
        <h3
          style={{
            fontFamily: isChaos ? "var(--font-bungee)" : "var(--font-playfair)",
            fontSize: isChaos ? "0.72rem" : "1rem",
            color: isChaos ? "#e0e0ff" : "#2d1f12",
            lineHeight: 1.2,
            marginBottom: 4,
          }}
        >
          {movie.title}
        </h3>

        {/* Subtitle */}
        <p
          style={{
            fontFamily: "var(--font-caveat)",
            fontSize: "0.75rem",
            color: isChaos ? "rgba(200,200,255,0.5)" : "rgba(100,70,40,0.55)",
            fontStyle: "italic",
            lineHeight: 1.2,
          }}
        >
          {movie.subtitle}
        </p>

        {/* Finale badge */}
        {movie.isFinale && (
          <div
            style={{
              position: "absolute",
              top: 8,
              right: 8,
              background: isChaos ? "#ff4757" : "#e05c3a",
              color: "white",
              fontSize: "0.55rem",
              fontFamily: isChaos ? "var(--font-bungee)" : "var(--font-caveat)",
              padding: "2px 6px",
              borderRadius: 999,
              letterSpacing: "0.05em",
            }}
          >
            FINALE
          </div>
        )}
      </div>
    </button>
  );
}

// ─────────────────────────────────────────────────────────────
// FEATURED BANNER (my-painting.png as hero)
// ─────────────────────────────────────────────────────────────
function FeaturedBanner({ theme }: { theme: Theme }) {
  const isChaos = theme === "chaos";
  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "clamp(300px, 45vw, 520px)",
        overflow: "hidden",
        borderRadius: "0 0 24px 24px",
        marginBottom: 0,
      }}
    >
      {/* Hero painting */}
      <img
        src="/assets/static/nostalgia/mypainting.png"
        alt="Featured"
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          transform: "scale(1.04)",
          filter: isChaos ? "saturate(0.7) hue-rotate(200deg) brightness(0.7)" : "brightness(0.85)",
          transition: "filter 0.6s ease",
        }}
      />

      {/* Paint texture overlay */}
      {isChaos && (
        <img
          src="/assets/static/chaos/mypaintintg-bg.png"
          alt=""
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            opacity: 0.25,
            mixBlendMode: "screen",
          }}
        />
      )}

      {/* Gradient scrim */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: isChaos
            ? "linear-gradient(to top, #0e0e1c 0%, rgba(14,14,28,0.6) 45%, transparent 100%)"
            : "linear-gradient(to top, rgba(26,14,6,0.88) 0%, rgba(26,14,6,0.4) 50%, transparent 100%)",
          pointerEvents: "none",
        }}
      />

      {/* Wiggly lines for chaos */}
      {isChaos && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: "url('/assets/static/chaos/wiggly-lines-bg.png')",
            backgroundSize: "cover",
            opacity: 0.07,
            mixBlendMode: "screen",
            pointerEvents: "none",
          }}
        />
      )}

      {/* Paint splash accent */}
      <img
        src={isChaos ? "/assets/static/chaos/paint-splash-red.png" : "/assets/static/nostalgia/paint-stroke.png"}
        alt=""
        aria-hidden
        style={{
          position: "absolute",
          bottom: "15%",
          left: "5%",
          width: 220,
          opacity: 0.2,
          pointerEvents: "none",
          transform: "rotate(-8deg)",
        }}
      />

      {/* Feature text */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          padding: "0 5% 36px",
          display: "flex",
          flexDirection: "column",
          gap: 6,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginBottom: 4,
          }}
        >
          <img
            src={isChaos ? "/assets/static/chaos/sparkle-element.png" : "/assets/static/nostalgia/vintage-corner.png"}
            alt=""
            aria-hidden
            style={{ width: 22, height: 22, objectFit: "contain", opacity: 0.7 }}
          />
          <span
            style={{
              fontFamily: "var(--font-caveat)",
              fontSize: "0.8rem",
              color: isChaos ? "#9b59b6" : "#f0c080",
              textTransform: "uppercase",
              letterSpacing: "0.3em",
            }}
          >
            Banasthali Originals · Featured
          </span>
        </div>

        <h1
          style={{
            fontFamily: isChaos ? "var(--font-bungee)" : "var(--font-playfair)",
            fontSize: "clamp(2rem, 5vw, 4rem)",
            color: "white",
            lineHeight: 1.05,
            textShadow: isChaos
              ? "0 0 40px rgba(155,89,182,0.6), 0 4px 20px rgba(0,0,0,0.8)"
              : "0 4px 32px rgba(0,0,0,0.6)",
            maxWidth: "70%",
          }}
        >
          {isChaos ? "THE CHAOS ARCHIVE" : "Banasthali Diaries"}
        </h1>

        <p
          style={{
            fontFamily: "var(--font-caveat)",
            fontSize: "1.05rem",
            color: "rgba(255,255,255,0.72)",
            maxWidth: 480,
            lineHeight: 1.4,
          }}
        >
          {isChaos
            ? "4 years. 6 folders. One chaotic love story with a place."
            : "Four years, one campus, a thousand moments we almost forgot to save."}
        </p>

        <div style={{ display: "flex", gap: 10, marginTop: 6 }}>
          <span
            style={{
              background: isChaos
                ? "linear-gradient(135deg, #9b59b6, #ff6b35)"
                : "linear-gradient(135deg, #c8a97e, #e05c3a)",
              color: "white",
              padding: "7px 22px",
              borderRadius: 999,
              fontFamily: "var(--font-caveat)",
              fontSize: "1rem",
              cursor: "default",
              letterSpacing: "0.03em",
            }}
          >
            ▶ 2022–2026
          </span>
          <span
            style={{
              background: "rgba(255,255,255,0.12)",
              backdropFilter: "blur(8px)",
              color: "rgba(255,255,255,0.8)",
              padding: "7px 18px",
              borderRadius: 999,
              fontFamily: "var(--font-caveat)",
              fontSize: "1rem",
              border: "1px solid rgba(255,255,255,0.2)",
            }}
          >
            6 Chapters
          </span>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// NAV BAR
// ─────────────────────────────────────────────────────────────
function NavBar({
  theme,
  onToggleTheme,
}: {
  theme: Theme;
  onToggleTheme: () => void;
}) {
  const isChaos = theme === "chaos";
  const [radioOpen, setRadioOpen] = useState(false);

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "14px 28px",
        background: isChaos
          ? "linear-gradient(to bottom, rgba(10,10,22,0.96), transparent)"
          : "linear-gradient(to bottom, rgba(26,14,6,0.82), transparent)",
        backdropFilter: "blur(0px)",
        pointerEvents: "none",
      }}
    >
      {/* Logo */}
      <div style={{ pointerEvents: "auto" }}>
        <h2
          style={{
            fontFamily: isChaos ? "var(--font-bungee)" : "var(--font-playfair)",
            fontSize: "1.15rem",
            color: isChaos ? "#9b59b6" : "#f0c080",
            letterSpacing: isChaos ? "0.08em" : "0.02em",
            textShadow: isChaos ? "0 0 20px rgba(155,89,182,0.8)" : "0 2px 8px rgba(0,0,0,0.4)",
            margin: 0,
          }}
        >
          {isChaos ? "⚡ CHAOS.ARCHIVE" : "Banasthali Diaries"}
        </h2>
        <p
          style={{
            fontFamily: "var(--font-caveat)",
            fontSize: "0.7rem",
            color: "rgba(255,255,255,0.45)",
            margin: 0,
            marginTop: 1,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
          }}
        >
          2022 – 2026
        </p>
      </div>

      {/* Right controls */}
      <div style={{ display: "flex", alignItems: "center", gap: 14, pointerEvents: "auto" }}>
        {/* Spotify radio */}
        <div style={{ position: "relative" }}>
          <button
            onClick={() => setRadioOpen((v) => !v)}
            style={{
              background: "rgba(29,185,84,0.18)",
              border: "1px solid rgba(29,185,84,0.35)",
              color: "#1db954",
              borderRadius: 999,
              padding: "6px 14px",
              fontFamily: "var(--font-caveat)",
              fontSize: "0.9rem",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 6,
              backdropFilter: "blur(8px)",
            }}
          >
            🎵 {radioOpen ? "Hide" : PLAYLISTS[theme].label}
          </button>
          {radioOpen && (
            <div
              style={{
                position: "absolute",
                top: "calc(100% + 8px)",
                right: 0,
                borderRadius: 14,
                overflow: "hidden",
                boxShadow: isChaos
                  ? "0 0 24px rgba(155,89,182,0.5), 0 8px 32px rgba(0,0,0,0.6)"
                  : "0 8px 32px rgba(0,0,0,0.2)",
                border: isChaos
                  ? "2px solid rgba(155,89,182,0.45)"
                  : "2px solid rgba(180,140,100,0.3)",
                animation: "slideUpFade 0.22s ease",
              }}
            >
              <iframe
                src={PLAYLISTS[theme].embedUrl}
                width="300"
                height="152"
                frameBorder="0"
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                loading="lazy"
                style={{ display: "block" }}
              />
            </div>
          )}
        </div>

        {/* Vibe toggle */}
        <button
          onClick={onToggleTheme}
          title={isChaos ? "Back to Nostalgia" : "Enter Chaos Mode"}
          style={{
            background: isChaos
              ? "linear-gradient(135deg, #9b59b6, #ff6b35)"
              : "rgba(255,255,255,0.1)",
            border: isChaos
              ? "none"
              : "1.5px solid rgba(255,255,255,0.25)",
            borderRadius: "50%",
            width: 42,
            height: 42,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            backdropFilter: "blur(8px)",
            boxShadow: isChaos
              ? "0 0 20px rgba(155,89,182,0.7), 0 0 40px rgba(255,107,53,0.3)"
              : "0 2px 12px rgba(0,0,0,0.3)",
            animation: isChaos ? "zapPulse 1.5s ease-in-out infinite" : "none",
            transition: "all 0.3s ease",
          }}
        >
          <Zap
            size={18}
            color={isChaos ? "white" : "rgba(255,255,255,0.8)"}
            fill={isChaos ? "white" : "none"}
          />
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// ORIGINALS ROW
// ─────────────────────────────────────────────────────────────
function OriginalsRow({
  theme,
  onMovieClick,
}: {
  theme: Theme;
  onMovieClick: (id: MovieId, el: HTMLElement) => void;
}) {
  const isChaos = theme === "chaos";
  return (
    <div style={{ padding: "32px 5% 0" }}>
      {/* Row title */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          marginBottom: 28,
        }}
      >
        {isChaos ? (
          <Sparkles size={18} color="#9b59b6" />
        ) : (
          <img
            src="/assets/static/nostalgia/sparkle-element.png"
            alt=""
            aria-hidden
            style={{ width: 20, height: 20, objectFit: "contain" }}
          />
        )}
        <h2
          style={{
            fontFamily: isChaos ? "var(--font-bungee)" : "var(--font-playfair)",
            fontSize: isChaos ? "0.9rem" : "1.3rem",
            color: isChaos ? "#e0e0ff" : "#2d1f12",
            margin: 0,
          }}
        >
          {isChaos ? "BANASTHALI ORIGINALS ⚡" : "Banasthali Originals"}
        </h2>
        <img
          src={isChaos ? "/assets/static/chaos/paint-splash-red.png" : "/assets/static/nostalgia/paint-stroke.png"}
          alt=""
          aria-hidden
          style={{ height: 16, objectFit: "contain", opacity: 0.55 }}
        />
      </div>

      {/* Poster row — horizontal scroll */}
      <div
        style={{
          display: "flex",
          gap: 28,
          overflowX: "auto",
          paddingBottom: 32,
          paddingTop: 16,
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >
        {MOVIES.map((movie, i) => (
          <div key={movie.id} style={{ flexShrink: 0 }}>
            <MoviePoster
              movie={movie}
              theme={theme}
              onClick={onMovieClick}
              index={i}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// STREAMING DASHBOARD (after hero scroll)
// ─────────────────────────────────────────────────────────────
function StreamingDashboard({
  theme,
  onMovieClick,
}: {
  theme: Theme;
  onMovieClick: (id: MovieId, el: HTMLElement) => void;
}) {
  const isChaos = theme === "chaos";

  return (
    <div
      style={{
        minHeight: "100vh",
        background: isChaos
          ? "#0e0e1c"
          : "radial-gradient(ellipse at 30% 0%, #fdf4e3 0%, #f0e6d6 60%, #e0cdb8 100%)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background texture */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: isChaos
            ? "url('/assets/static/chaos/wiggly-lines-bg.png')"
            : "url('/assets/static/nostalgia/paper-texture-bg.png')",
          backgroundSize: "cover",
          opacity: isChaos ? 0.06 : 0.3,
          mixBlendMode: isChaos ? "screen" : "multiply",
          pointerEvents: "none",
        }}
      />

      {/* Corner paint frames (chaos) */}
      {isChaos && (
        <>
          {(["tl", "tr", "bl", "br"] as const).map((corner) => {
            const s: CSSProperties = {
              position: "fixed",
              width: 110,
              height: 110,
              zIndex: 45,
              opacity: 0.45,
              pointerEvents: "none",
              ...(corner === "tl" ? { top: 0, left: 0 } : {}),
              ...(corner === "tr" ? { top: 0, right: 0, transform: "scaleX(-1)" } : {}),
              ...(corner === "bl" ? { bottom: 0, left: 0, transform: "scaleY(-1)" } : {}),
              ...(corner === "br" ? { bottom: 0, right: 0, transform: "scale(-1,-1)" } : {}),
            };
            return (
              <img
                key={corner}
                src="/assets/static/chaos/paint-corner-black.png"
                alt=""
                aria-hidden
                style={s}
              />
            );
          })}
        </>
      )}

      {/* Content */}
      <div style={{ position: "relative", zIndex: 5 }}>
        <FeaturedBanner theme={theme} />
        <OriginalsRow theme={theme} onMovieClick={onMovieClick} />

        {/* Bottom padding */}
        <div style={{ height: 80 }} />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// MORPH EXPAND OVERLAY
// ─────────────────────────────────────────────────────────────
function MorphExpand({
  originRect,
  theme,
}: {
  originRect: { top: number; left: number; width: number; height: number };
  theme: Theme;
}) {
  const [phase, setPhase] = useState<"grow" | "bloom">("grow");

  useEffect(() => {
    const t = setTimeout(() => setPhase("bloom"), 280);
    return () => clearTimeout(t);
  }, []);

  const isChaos = theme === "chaos";

  const growStyle: CSSProperties =
    phase === "grow"
      ? {
          top: originRect.top,
          left: originRect.left,
          width: originRect.width,
          height: originRect.height,
          borderRadius: 10,
        }
      : { top: 0, left: 0, width: "100vw", height: "100vh", borderRadius: 0 };

  return (
    <div
      style={{
        position: "fixed",
        zIndex: 200,
        overflow: "hidden",
        background: isChaos ? "#0a0a16" : "#fdf4e3",
        ...growStyle,
        transition:
          "top 0.32s cubic-bezier(0.7,0,0.2,1), left 0.32s cubic-bezier(0.7,0,0.2,1), width 0.32s cubic-bezier(0.7,0,0.2,1), height 0.32s cubic-bezier(0.7,0,0.2,1), border-radius 0.32s ease",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: isChaos
            ? "url('/assets/static/chaos/torn-paper-bg-black.png')"
            : "url('/assets/static/nostalgia/paper-texture-bg.png')",
          backgroundSize: "cover",
          opacity: phase === "bloom" ? 1 : 0,
          transition: "opacity 0.3s ease 0.25s",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: isChaos
            ? "url('/assets/static/chaos/paint-splash-red.png')"
            : "url('/assets/static/nostalgia/paint-stroke.png')",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
          backgroundSize: "50% auto",
          opacity: phase === "bloom" ? 0.14 : 0,
          transition: "opacity 0.28s ease 0.35s",
        }}
      />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// MORPH STATE
// ─────────────────────────────────────────────────────────────
interface MorphState {
  active: boolean;
  originRect: { top: number; left: number; width: number; height: number } | null;
  done: boolean;
  movieId: MovieId | null;
}

// ─────────────────────────────────────────────────────────────
// HOME CLIENT (main export)
// ─────────────────────────────────────────────────────────────
export function HomeClient() {
  const [scrollY, setScrollY] = useState(0);
  const [theme, setTheme] = useState<Theme>("nostalgia");
  const [morph, setMorph] = useState<MorphState>({
    active: false,
    originRect: null,
    done: false,
    movieId: null,
  });

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.setAttribute("data-theme", theme);
  }, [theme]);

  const vh = typeof window !== "undefined" ? window.innerHeight : 800;
  const progress = Math.min(scrollY / vh, 1);
  const deskY = Math.max(0, (1 - progress) * 100);
  const heroOpacity = Math.max(0, 1 - progress / 0.3);
  const isChaos = theme === "chaos";

  const handleMovieClick = useCallback((id: MovieId, el: HTMLElement) => {
    const r = el.getBoundingClientRect();
    setMorph({
      active: true,
      originRect: { top: r.top, left: r.left, width: r.width, height: r.height },
      done: false,
      movieId: id,
    });
    setTimeout(() => setMorph((prev) => ({ ...prev, done: true })), 660);
  }, []);

  const handleClose = useCallback(() => {
    setMorph({ active: false, originRect: null, done: false, movieId: null });
  }, []);

  const movieLabel = MOVIES.find((m) => m.id === morph.movieId)?.title ?? "";

  return (
    <>
      {/* ── NAV BAR ───────────────────────── */}
      <NavBar theme={theme} onToggleTheme={() => setTheme((t) => (t === "nostalgia" ? "chaos" : "nostalgia"))} />

      {/* ── HERO VIDEO ────────────────────── */}
      <div
        style={{
          position: "sticky",
          top: 0,
          width: "100%",
          height: "100vh",
          overflow: "hidden",
          zIndex: 0,
        }}
      >
        <video
          src="/hero-fireworks.mp4"
          autoPlay
          muted
          loop
          playsInline
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "radial-gradient(ellipse at 50% 60%, transparent 25%, rgba(0,0,0,0.65) 100%)",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            pointerEvents: "none",
            opacity: heroOpacity,
            transition: "opacity 0.12s linear",
          }}
        >
          <p
            style={{
              fontFamily: "var(--font-caveat)",
              color: "rgba(255,255,255,0.55)",
              letterSpacing: "0.45em",
              textTransform: "uppercase",
              fontSize: "0.9rem",
              marginBottom: 14,
            }}
          >
            scroll to enter
          </p>
          <h1
            style={{
              fontFamily: isChaos ? "var(--font-bungee)" : "var(--font-playfair)",
              fontSize: "clamp(3rem, 9vw, 6.5rem)",
              color: "white",
              textAlign: "center",
              lineHeight: 1.05,
              textShadow: isChaos
                ? "0 0 60px rgba(155,89,182,0.6), 0 4px 40px rgba(0,0,0,0.5)"
                : "0 4px 40px rgba(0,0,0,0.5)",
            }}
          >
            {isChaos ? "THE CHAOS ARCHIVE" : "Banasthali Diaries"}
          </h1>
          <p
            style={{
              fontFamily: "var(--font-caveat)",
              color: "rgba(255,255,255,0.65)",
              fontSize: "1.15rem",
              marginTop: 14,
            }}
          >
            — 2022 · 2026 —
          </p>
        </div>
      </div>

      {/* ── STREAMING DASHBOARD (slides over hero) ─── */}
      <div
        style={{
          position: "relative",
          zIndex: 20,
          marginTop: "-100vh",
          transform: `translateY(${deskY}vh)`,
          willChange: "transform",
          transition: deskY === 0 ? "transform 0.16s ease-out" : "none",
          borderRadius: "20px 20px 0 0",
          overflow: "hidden",
          boxShadow: "0 -20px 80px rgba(0,0,0,0.5)",
        }}
      >
        <StreamingDashboard theme={theme} onMovieClick={handleMovieClick} />
        
      </div>
    {/* FOOTER CREDITS */}
<div className="relative w-full overflow-hidden bg-black">
  <CreditsRoll isChaosModeActive={isChaos} />
</div>
      

      {/* ── MORPH TRANSITION ─────────────── */}
      {morph.active && !morph.done && morph.originRect && (
        <MorphExpand originRect={morph.originRect} theme={theme} />
      )}

      {/* ── FILM REEL OVERLAY ────────────── */}
      {morph.done && morph.movieId && (
        <FilmReelOverlay
          folderId={morph.movieId}
          folderLabel={movieLabel}
          isChaosModeActive={isChaos}
          isFinale={MOVIES.find((m) => m.id === morph.movieId)?.isFinale === true}
          onClose={handleClose}
        />
      )}

      <style>{`
        @keyframes slideUpFade {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes posterReveal {
          from { opacity: 0; transform: translateY(16px) rotate(var(--rotate, 0deg)); }
          to   { opacity: 1; }
        }
        @keyframes zapPulse {
          0%, 100% { box-shadow: 0 0 20px rgba(155,89,182,0.7), 0 0 40px rgba(255,107,53,0.3); }
          50%       { box-shadow: 0 0 32px rgba(155,89,182,1),   0 0 60px rgba(255,107,53,0.6); }
        }
        /* Hide scrollbar for poster row */
        ::-webkit-scrollbar { display: none; }
      `}</style>
    </>
  );
}

