"use client";

import {
  useEffect,
  useState,
  useCallback,
  useRef,
  type CSSProperties,
} from "react";
import {
  X,
  Loader2,
  AlertTriangle,
  RefreshCw,
  ImageOff,
  ZoomIn,
  ChevronLeft,
  ChevronRight,
  Upload,
  Pin,
  BookOpen,
} from "lucide-react";

// ─────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────
const SUPABASE_URL = "https://fjkvnqksolupscjgjwkc.supabase.co";
const BUCKET = "memories";

/** px per requestAnimationFrame tick (~42 px/s at 60 fps) */
const AUTO_SCROLL_SPEED = 0.7;
/** ms after last arrow click before auto-scroll resumes */
const RESUME_DELAY_MS = 3000;
/** rendered card width in px — must match the FilmFrame width below */
const FRAME_WIDTH = 240;
/** gap between cards in px */
const FRAME_GAP = 20;

function getPublicUrl(folderId: string, fileName: string) {
  return `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${folderId}/${encodeURIComponent(fileName)}`;
}

function isImageFile(name: string) {
  return /\.(jpe?g|png|gif|webp|avif|svg)$/i.test(name);
}

// ─────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────
interface ReelFrame {
  name: string;
  url: string;
}

interface MemoryNote {
  id: number;
  folder_id: string;
  text: string;
  created_at: string;
}

interface Props {
  folderId: string;
  folderLabel: string;
  isChaosModeActive: boolean;
  isFinale?: boolean;
  onClose: () => void;
}

// ─────────────────────────────────────────────────────────────
// PHOTO ZOOM MODAL — paper note overlay
// ─────────────────────────────────────────────────────────────
function PhotoNote({
  frame,
  isChaosModeActive,
  onClose,
}: {
  frame: ReelFrame;
  isChaosModeActive: boolean;
  onClose: () => void;
}) {
  const isChaos = isChaosModeActive;
  const caption = frame.name.replace(/\.[^.]+$/, "").replace(/[-_]/g, " ");

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 400,
        background: "rgba(0,0,0,0.9)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        animation: "fadeIn 0.18s ease",
        backdropFilter: "blur(8px)",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: "relative",
          maxWidth: "min(90vw, 700px)",
          width: "100%",
          animation: "noteReveal 0.3s cubic-bezier(0.34,1.56,0.64,1)",
          transform: "rotate(-1.5deg)",
        }}
      >
        {/* Paper texture bg */}
        <div
          style={{
            position: "absolute",
            inset: -14,
            backgroundImage: isChaos
              ? "url('/assets/static/chaos/torn-paper-bg-black.png')"
              : "url('/assets/static/nostalgia/paper-texture-bg.png')",
            backgroundSize: "cover",
            borderRadius: 8,
            opacity: isChaos ? 0.65 : 1,
            zIndex: 0,
          }}
        />

        {/* Tape */}
        <img
          src={isChaos ? "/assets/static/chaos/tape-red.png" : "/assets/static/nostalgia/tape-pink-soft.png"}
          alt=""
          aria-hidden
          style={{
            position: "absolute",
            top: -16,
            left: "50%",
            transform: "translateX(-50%) rotate(-2deg)",
            width: 72,
            height: 26,
            objectFit: "cover",
            zIndex: 20,
            opacity: 0.92,
          }}
        />

        {/* Paint stroke */}
        <img
          src={isChaos ? "/assets/static/chaos/paint-splash-red.png" : "/assets/static/nostalgia/paint-stroke.png"}
          alt=""
          aria-hidden
          style={{
            position: "absolute",
            bottom: 28,
            left: 0,
            right: 0,
            height: 38,
            objectFit: "contain",
            opacity: 0.18,
            zIndex: 1,
            pointerEvents: "none",
          }}
        />

        {/* Card */}
        <div
          style={{
            position: "relative",
            zIndex: 10,
            padding: "20px 20px 24px",
            background: isChaos ? "rgba(10,10,22,0.85)" : "rgba(255,252,244,0.9)",
            borderRadius: 4,
            boxShadow: isChaos
              ? "0 16px 64px rgba(0,0,0,0.85), 0 0 28px rgba(155,89,182,0.25)"
              : "0 12px 48px rgba(0,0,0,0.3)",
            border: isChaos ? "1px solid rgba(155,89,182,0.22)" : "1px solid rgba(200,170,130,0.28)",
          }}
        >
          {/* polaroid-with-tape ghost frame */}
          <img
            src="/assets/static/nostalgia/polaroid-with-tape.png"
            alt=""
            aria-hidden
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              opacity: 0.04,
              pointerEvents: "none",
              borderRadius: 4,
            }}
          />

          <img
            src={frame.url}
            alt={caption}
            style={{
              width: "100%",
              maxHeight: "60vh",
              objectFit: "contain",
              display: "block",
              borderRadius: 2,
              filter: isChaos ? "saturate(0.85)" : "none",
            }}
          />

          <div
            style={{
              marginTop: 16,
              paddingTop: 12,
              borderTop: isChaos ? "1px solid rgba(155,89,182,0.2)" : "1px dashed rgba(180,140,100,0.38)",
            }}
          >
            <p
              style={{
                fontFamily: "var(--font-caveat)",
                fontSize: "1.3rem",
                color: isChaos ? "#c8c8ff" : "#3d2b1f",
                textAlign: "center",
                lineHeight: 1.4,
                margin: 0,
              }}
            >
              {caption}
            </p>
            <p
              style={{
                fontFamily: "var(--font-caveat)",
                fontSize: "0.78rem",
                color: isChaos ? "rgba(200,200,255,0.35)" : "rgba(100,70,40,0.38)",
                textAlign: "center",
                marginTop: 6,
                fontStyle: "italic",
              }}
            >
              click anywhere to close
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// FILM FRAME — single sprocket cell
// ─────────────────────────────────────────────────────────────
function FilmFrame({
  frame,
  isChaosModeActive,
  onZoom,
}: {
  frame: ReelFrame;
  isChaosModeActive: boolean;
  onZoom: (frame: ReelFrame) => void;
}) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const [hovered, setHovered] = useState(false);
  const isChaos = isChaosModeActive;

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => !error && onZoom(frame)}
      style={{
        flexShrink: 0,
        width: FRAME_WIDTH,
        cursor: error ? "default" : "zoom-in",
        position: "relative",
        transition: "transform 0.22s cubic-bezier(0.34,1.56,0.64,1)",
        transform: hovered ? "scale(1.07) translateY(-7px)" : "scale(1)",
        zIndex: hovered ? 10 : 1,
      }}
    >
      {/* Film cell */}
      <div
        style={{
          background: "#111",
          border: `3px solid ${isChaos ? "#2e2e2e" : "#1c1c1c"}`,
          borderRadius: 3,
          overflow: "hidden",
          position: "relative",
          boxShadow: hovered
            ? isChaos
              ? "0 0 26px rgba(155,89,182,0.65), 0 10px 32px rgba(0,0,0,0.85)"
              : "0 0 0 2px rgba(255,255,255,0.14), 0 10px 30px rgba(0,0,0,0.75)"
            : "0 4px 18px rgba(0,0,0,0.65)",
          transition: "box-shadow 0.2s ease",
        }}
      >
        {/* Sprocket — top */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-around",
            padding: "5px 10px 3px",
            background: "#080808",
          }}
        >
          {[0, 1, 2, 3, 4].map((i) => (
            <div
              key={i}
              style={{
                width: 10,
                height: 8,
                background: "#1e1e1e",
                borderRadius: 2,
                border: "1.5px solid #333",
              }}
            />
          ))}
        </div>

        {/* Photo area */}
        <div style={{ position: "relative", height: 192, background: "#0d0d0d" }}>
          {!loaded && !error && (
            <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Loader2 className="animate-spin" size={20} color={isChaos ? "#9b59b6" : "#555"} />
            </div>
          )}
          {error ? (
            <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6 }}>
              <ImageOff size={20} color="#3a3a3a" />
              <span style={{ fontSize: 9, color: "#3a3a3a", fontFamily: "var(--font-caveat)" }}>couldn't develop</span>
            </div>
          ) : (
            <img
              src={frame.url}
              alt={frame.name}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                display: loaded ? "block" : "none",
                filter: isChaos ? "saturate(0.8) contrast(1.06)" : "none",
              }}
              onLoad={() => setLoaded(true)}
              onError={() => setError(true)}
            />
          )}

          {/* Hover overlay */}
          {hovered && !error && loaded && (
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: "rgba(0,0,0,0.38)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                animation: "fadeIn 0.14s ease",
              }}
            >
              <ZoomIn size={30} color="rgba(255,255,255,0.88)" strokeWidth={1.5} />
            </div>
          )}
        </div>

        {/* Sprocket — bottom */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-around",
            padding: "3px 10px 5px",
            background: "#080808",
          }}
        >
          {[0, 1, 2, 3, 4].map((i) => (
            <div
              key={i}
              style={{
                width: 10,
                height: 8,
                background: "#1e1e1e",
                borderRadius: 2,
                border: "1.5px solid #333",
              }}
            />
          ))}
        </div>
      </div>

      {/* Caption */}
      <p
        style={{
          fontFamily: "var(--font-caveat)",
          fontSize: "0.78rem",
          color: isChaos ? "rgba(200,200,255,0.42)" : "rgba(255,255,255,0.38)",
          textAlign: "center",
          marginTop: 7,
          padding: "0 6px",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
          maxWidth: "100%",
          pointerEvents: "none",
        }}
      >
        {frame.name.replace(/\.[^.]+$/, "").replace(/[-_]/g, " ")}
      </p>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// ARROW BUTTON — floating nav control
// ─────────────────────────────────────────────────────────────
function ArrowBtn({
  dir,
  isChaos,
  onClick,
}: {
  dir: "left" | "right";
  isChaos: boolean;
  onClick: () => void;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      aria-label={`Scroll ${dir}`}
      style={{
        position: "absolute",
        top: "50%",
        [dir]: 10,
        transform: "translateY(-50%)",
        zIndex: 20,
        width: 44,
        height: 44,
        borderRadius: "50%",
        border: isChaos
          ? `1.5px solid ${hovered ? "rgba(155,89,182,0.7)" : "rgba(155,89,182,0.28)"}`
          : `1.5px solid ${hovered ? "rgba(255,255,255,0.35)" : "rgba(255,255,255,0.12)"}`,
        background: hovered
          ? isChaos ? "rgba(155,89,182,0.22)" : "rgba(255,255,255,0.1)"
          : "rgba(0,0,0,0.52)",
        backdropFilter: "blur(8px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        color: hovered ? "white" : "rgba(255,255,255,0.5)",
        boxShadow: hovered
          ? isChaos ? "0 0 18px rgba(155,89,182,0.5)" : "0 4px 18px rgba(0,0,0,0.5)"
          : "none",
        transition: "all 0.18s ease",
      }}
    >
      {dir === "left" ? <ChevronLeft size={22} strokeWidth={2} /> : <ChevronRight size={22} strokeWidth={2} />}
    </button>
  );
}

// ─────────────────────────────────────────────────────────────
// CONTROLLABLE FILM REEL — JS rAF scroll, no CSS animation
// ─────────────────────────────────────────────────────────────
function FilmReel({
  frames,
  isChaosModeActive,
  onFrameZoom,
}: {
  frames: ReelFrame[];
  isChaosModeActive: boolean;
  onFrameZoom: (frame: ReelFrame) => void;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);
  const resumeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Use refs (not state) for pause flags so the rAF loop always reads latest
  const isHoveredRef = useRef(false);
  const isManualPausedRef = useRef(false);
  // State only for the visible UI indicator
  const [showPausePill, setShowPausePill] = useState(false);

  const isChaos = isChaosModeActive;

  // Triple frames so we always have room to loop smoothly in both directions
  const tripled = [...frames, ...frames, ...frames];
  // Width of one full original set in px (frame + gap per card)
  const singleSetWidth = frames.length * (FRAME_WIDTH + FRAME_GAP);

  // ── rAF loop ────────────────────────────────────────────────
  const tick = useCallback(() => {
    const el = trackRef.current;
    if (el && !isHoveredRef.current && !isManualPausedRef.current) {
      el.scrollLeft += AUTO_SCROLL_SPEED;
      // Seamless loop: once we've passed the 2nd set, snap back by one set
      if (el.scrollLeft >= singleSetWidth * 2) {
        el.scrollLeft -= singleSetWidth;
      }
    }
    rafRef.current = requestAnimationFrame(tick);
  }, [singleSetWidth]);

  useEffect(() => {
    // Start in the middle set so left-arrow has room to go
    const el = trackRef.current;
    if (el) el.scrollLeft = singleSetWidth;
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      if (resumeTimerRef.current !== null) clearTimeout(resumeTimerRef.current);
    };
  }, [tick, singleSetWidth]);

  // ── Arrow click handler ─────────────────────────────────────
  const handleArrow = useCallback(
    (dir: "left" | "right") => {
      const el = trackRef.current;
      if (!el) return;

      // Pause auto-scroll and show pill
      isManualPausedRef.current = true;
      setShowPausePill(true);

      // Smooth-scroll 2 frames worth
      const delta = (FRAME_WIDTH * 2 + FRAME_GAP * 2) * (dir === "right" ? 1 : -1);
      el.scrollBy({ left: delta, behavior: "smooth" });

      // After smooth scroll settles, correct boundary if needed
      setTimeout(() => {
        if (!trackRef.current) return;
        const s = trackRef.current.scrollLeft;
        if (s < singleSetWidth * 0.3) trackRef.current.scrollLeft += singleSetWidth;
        if (s > singleSetWidth * 2.6) trackRef.current.scrollLeft -= singleSetWidth;
      }, 400);

      // Reset the 3-second resume timer on every click
      if (resumeTimerRef.current !== null) clearTimeout(resumeTimerRef.current);
      resumeTimerRef.current = setTimeout(() => {
        isManualPausedRef.current = false;
        if (!isHoveredRef.current) setShowPausePill(false);
      }, RESUME_DELAY_MS);
    },
    [singleSetWidth]
  );

  // ── Hover ───────────────────────────────────────────────────
  const onMouseEnter = () => {
    isHoveredRef.current = true;
    setShowPausePill(true);
  };
  const onMouseLeave = () => {
    isHoveredRef.current = false;
    if (!isManualPausedRef.current) setShowPausePill(false);
  };

  return (
    <div style={{ position: "relative", width: "100%", padding: "28px 0 38px" }}>
      {/* Left arrow */}
      <ArrowBtn dir="left" isChaos={isChaos} onClick={() => handleArrow("left")} />

      {/* Scroll track — overflow:hidden, JS drives scrollLeft */}
      <div
        ref={trackRef}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        style={{
          display: "flex",
          gap: FRAME_GAP,
          overflowX: "hidden",
          paddingLeft: 64,
          paddingRight: 64,
          userSelect: "none",
          // Disable native scroll snapping / momentum so JS is the sole controller
          WebkitOverflowScrolling: "auto",
        } as CSSProperties}
      >
        {tripled.map((frame, i) => (
          <FilmFrame
            key={`${frame.name}-${i}`}
            frame={frame}
            isChaosModeActive={isChaosModeActive}
            onZoom={onFrameZoom}
          />
        ))}
      </div>

      {/* Right arrow */}
      <ArrowBtn dir="right" isChaos={isChaos} onClick={() => handleArrow("right")} />

      {/* Edge vignettes */}
      {(["left", "right"] as const).map((side) => (
        <div
          key={side}
          style={{
            position: "absolute",
            top: 0,
            [side]: 0,
            width: 90,
            height: "100%",
            background: isChaos
              ? `linear-gradient(to ${side === "left" ? "right" : "left"}, #08080f, transparent)`
              : `linear-gradient(to ${side === "left" ? "right" : "left"}, #0a0a0a, transparent)`,
            pointerEvents: "none",
            zIndex: 8,
          }}
        />
      ))}

      {/* Pause pill */}
      <div
        style={{
          position: "absolute",
          bottom: 14,
          left: "50%",
          transform: `translateX(-50%) translateY(${showPausePill ? 0 : 8}px)`,
          opacity: showPausePill ? 1 : 0,
          transition: "opacity 0.22s ease, transform 0.22s ease",
          background: "rgba(0,0,0,0.62)",
          color: "rgba(255,255,255,0.52)",
          fontFamily: "var(--font-caveat)",
          fontSize: "0.75rem",
          padding: "3px 14px",
          borderRadius: 999,
          backdropFilter: "blur(6px)",
          pointerEvents: "none",
          zIndex: 12,
          whiteSpace: "nowrap",
          border: isChaos ? "1px solid rgba(155,89,182,0.2)" : "1px solid rgba(255,255,255,0.08)",
        }}
      >
        ⏸ paused · click a frame to zoom
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// SHARED JOURNAL — Supabase memory_notes table
// ─────────────────────────────────────────────────────────────
function SharedJournal({
  folderId,
  isChaosModeActive,
}: {
  folderId: string;
  isChaosModeActive: boolean;
}) {
  const isChaos = isChaosModeActive;
  const [notes, setNotes] = useState<MemoryNote[]>([]);
  const [noteText, setNoteText] = useState("");
  const [loadingNotes, setLoadingNotes] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  // Stable per-note random rotations (re-generated only when notes change length)
  const rotationsRef = useRef<number[]>([]);
  const getRotation = (i: number) => {
    if (rotationsRef.current[i] === undefined) {
      rotationsRef.current[i] = +(Math.random() * 4 - 2).toFixed(2);
    }
    return rotationsRef.current[i];
  };

  // ── fetchNotes ──────────────────────────────────────────────
  const fetchNotes = useCallback(async () => {
    setLoadingNotes(true);
    try {
      const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      if (!anonKey) throw new Error("Missing NEXT_PUBLIC_SUPABASE_ANON_KEY");

      const res = await fetch(
        `${SUPABASE_URL}/rest/v1/memory_notes?folder_id=eq.${encodeURIComponent(folderId)}&order=created_at.desc&limit=50`,
        {
          headers: {
            Authorization: `Bearer ${anonKey}`,
            apikey: anonKey,
            "Content-Type": "application/json",
          },
        }
      );
      if (!res.ok) throw new Error(`fetchNotes failed: ${res.status}`);
      const data: MemoryNote[] = await res.json();
      setNotes(data);
    } catch (err) {
      console.error("fetchNotes error:", err);
    } finally {
      setLoadingNotes(false);
    }
  }, [folderId]);

  // ── submitNote ──────────────────────────────────────────────
  const submitNote = useCallback(async () => {
    const trimmed = noteText.trim();
    if (!trimmed) return;
    setSubmitting(true);
    setSubmitError("");
    try {
      const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      if (!anonKey) throw new Error("Missing NEXT_PUBLIC_SUPABASE_ANON_KEY");

      const res = await fetch(`${SUPABASE_URL}/rest/v1/memory_notes`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${anonKey}`,
          apikey: anonKey,
          "Content-Type": "application/json",
          // Return the inserted row so we can prepend it without a re-fetch
          Prefer: "return=representation",
        },
        body: JSON.stringify({
          folder_id: folderId,
          text: trimmed,
          // created_at is defaulted by Supabase (now()) — no need to send it
        }),
      });

      if (!res.ok) {
        const body = await res.text();
        throw new Error(`Insert failed (${res.status}): ${body}`);
      }

      const [inserted]: MemoryNote[] = await res.json();
      // Optimistic prepend — no need to re-fetch
      setNotes((prev) => [inserted, ...prev]);
      setNoteText("");
    } catch (err) {
      console.error("submitNote error:", err);
      setSubmitError(err instanceof Error ? err.message : "Couldn't pin note");
    } finally {
      setSubmitting(false);
    }
  }, [folderId, noteText]);

  useEffect(() => { fetchNotes(); }, [fetchNotes]);

  // Theme-derived colours
  const accent   = isChaos ? "#9b59b6" : "#c8a97e";
  const textClr  = isChaos ? "#e0e0ff" : "#2d1f12";
  const mutedClr = isChaos ? "rgba(200,200,255,0.38)" : "rgba(100,70,40,0.45)";
  const inputBg  = isChaos ? "rgba(22,22,40,0.92)" : "rgba(255,253,248,0.94)";
  const borderClr = isChaos ? "rgba(155,89,182,0.3)" : "rgba(200,170,130,0.4)";

  const stickyPalette = isChaos
    ? ["rgba(30,14,50,0.96)", "rgba(12,28,12,0.96)", "rgba(38,10,10,0.96)", "rgba(10,20,38,0.96)"]
    : ["rgba(255,252,220,0.97)", "rgba(220,255,240,0.97)", "rgba(255,235,235,0.97)", "rgba(236,226,255,0.97)"];

  return (
    <div style={{ position: "relative" }}>
      {/* Paper texture section background */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: isChaos
            ? "url('/assets/static/chaos/torn-paper-bg-black.png')"
            : "url('/assets/static/nostalgia/paper-texture-bg.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          opacity: isChaos ? 0.55 : 0.82,
          zIndex: 0,
          pointerEvents: "none",
        }}
      />
      {/* Wash for readability */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: isChaos ? "rgba(6,6,14,0.72)" : "rgba(255,252,244,0.55)",
          zIndex: 1,
          pointerEvents: "none",
        }}
      />
      {/* Torn edge top */}
      <div
        style={{
          position: "absolute",
          top: -14,
          left: 0,
          right: 0,
          height: 14,
          backgroundImage: isChaos
            ? "url('/assets/static/chaos/torn-paper-orange.png')"
            : "url('/assets/static/nostalgia/torn-corner.png')",
          backgroundRepeat: "repeat-x",
          backgroundSize: "auto 100%",
          opacity: 0.48,
          zIndex: 2,
          pointerEvents: "none",
        }}
      />

      <div style={{ position: "relative", zIndex: 3, padding: "40px 6% 60px" }}>
        {/* Section heading */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 26 }}>
          <BookOpen size={20} color={accent} strokeWidth={1.5} />
          <h2
            style={{
              fontFamily: isChaos ? "var(--font-bungee)" : "var(--font-playfair)",
              fontSize: isChaos ? "0.88rem" : "1.38rem",
              color: textClr,
              margin: 0,
            }}
          >
            {isChaos ? "SHARED JOURNAL ⚡" : "Shared Journal"}
          </h2>
          <img
            src={isChaos ? "/assets/static/chaos/paint-splash-red.png" : "/assets/static/nostalgia/paint-stroke.png"}
            alt=""
            aria-hidden
            style={{ height: 16, objectFit: "contain", opacity: 0.38 }}
          />
        </div>

        {/* Note composer */}
        <div
          style={{
            background: inputBg,
            border: `1.5px solid ${borderClr}`,
            borderRadius: 8,
            padding: "16px",
            backdropFilter: "blur(6px)",
            boxShadow: isChaos ? "0 4px 24px rgba(0,0,0,0.5)" : "0 4px 20px rgba(0,0,0,0.1)",
            marginBottom: 32,
            position: "relative",
          }}
        >
          {/* Tape on composer */}
          <img
            src={isChaos ? "/assets/static/chaos/tape-red.png" : "/assets/static/nostalgia/tape-pink-checked.png"}
            alt=""
            aria-hidden
            style={{
              position: "absolute",
              top: -12,
              left: 20,
              width: 46,
              height: 18,
              objectFit: "cover",
              opacity: 0.78,
              transform: "rotate(-3deg)",
              zIndex: 5,
            }}
          />

          <textarea
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) submitNote(); }}
            placeholder="Leave a memory here… ✦"
            rows={3}
            style={{
              width: "100%",
              background: "transparent",
              border: "none",
              outline: "none",
              resize: "vertical",
              fontFamily: "var(--font-caveat)",
              fontSize: "1.1rem",
              color: textClr,
              lineHeight: 1.55,
              caretColor: accent,
            }}
          />

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 10 }}>
            <span
              style={{
                fontFamily: "var(--font-caveat)",
                fontSize: "0.72rem",
                color: mutedClr,
                fontStyle: "italic",
              }}
            >
              ⌘ + Enter to pin
            </span>

            <button
              onClick={submitNote}
              disabled={submitting || !noteText.trim()}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 7,
                padding: "8px 22px",
                borderRadius: 999,
                border: "none",
                background:
                  submitting || !noteText.trim()
                    ? isChaos ? "rgba(155,89,182,0.22)" : "rgba(200,170,130,0.28)"
                    : isChaos ? "linear-gradient(135deg,#9b59b6,#7d3cad)" : "linear-gradient(135deg,#c8a97e,#a07850)",
                color: submitting || !noteText.trim() ? mutedClr : "white",
                fontFamily: "var(--font-caveat)",
                fontSize: "1rem",
                cursor: submitting || !noteText.trim() ? "not-allowed" : "pointer",
                transition: "all 0.18s ease",
                boxShadow:
                  submitting || !noteText.trim()
                    ? "none"
                    : isChaos ? "0 4px 16px rgba(155,89,182,0.4)" : "0 4px 14px rgba(180,140,100,0.35)",
              }}
            >
              {submitting ? <Loader2 size={14} className="animate-spin" /> : <Pin size={14} />}
              {submitting ? "Pinning…" : "Pin Note"}
            </button>
          </div>

          {submitError && (
            <p style={{ fontFamily: "var(--font-caveat)", fontSize: "0.8rem", color: "#e05c3a", marginTop: 6 }}>
              ⚠ {submitError}
            </p>
          )}
        </div>

        {/* Notes grid */}
        {loadingNotes ? (
          <div style={{ display: "flex", justifyContent: "center", padding: "24px 0" }}>
            <Loader2 className="animate-spin" size={22} color={accent} />
          </div>
        ) : notes.length === 0 ? (
          <p
            style={{
              fontFamily: "var(--font-caveat)",
              fontSize: "1rem",
              color: mutedClr,
              textAlign: "center",
              fontStyle: "italic",
            }}
          >
            No notes yet — be the first to leave one ✦
          </p>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
              gap: "1.4rem",
            }}
          >
            {notes.map((note, i) => {
              const rot = getRotation(i);
              const bg = stickyPalette[i % stickyPalette.length];
              const dateStr = new Date(note.created_at).toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "short",
                year: "2-digit",
              });

              return (
                <div
                  key={note.id}
                  style={{
                    background: bg,
                    borderRadius: 4,
                    padding: "14px 14px 18px",
                    transform: `rotate(${rot}deg)`,
                    boxShadow: isChaos
                      ? "0 6px 24px rgba(0,0,0,0.65), 0 1px 0 rgba(255,255,255,0.04)"
                      : "0 4px 18px rgba(0,0,0,0.14), 0 1px 0 rgba(255,255,255,0.8)",
                    position: "relative",
                    transition: "transform 0.2s ease, box-shadow 0.2s ease",
                    cursor: "default",
                    border: isChaos
                      ? "1px solid rgba(155,89,182,0.12)"
                      : "1px solid rgba(200,170,130,0.22)",
                  }}
                  onMouseEnter={(e) => {
                    const el = e.currentTarget as HTMLElement;
                    el.style.transform = "rotate(0deg) scale(1.03)";
                    el.style.boxShadow = isChaos
                      ? "0 10px 36px rgba(0,0,0,0.75), 0 0 12px rgba(155,89,182,0.25)"
                      : "0 8px 28px rgba(0,0,0,0.2)";
                  }}
                  onMouseLeave={(e) => {
                    const el = e.currentTarget as HTMLElement;
                    el.style.transform = `rotate(${rot}deg) scale(1)`;
                    el.style.boxShadow = isChaos
                      ? "0 6px 24px rgba(0,0,0,0.65), 0 1px 0 rgba(255,255,255,0.04)"
                      : "0 4px 18px rgba(0,0,0,0.14), 0 1px 0 rgba(255,255,255,0.8)";
                  }}
                >
                  {/* Pin dot */}
                  <div
                    style={{
                      position: "absolute",
                      top: 10,
                      right: 10,
                      width: 10,
                      height: 10,
                      borderRadius: "50%",
                      background: accent,
                      opacity: 0.65,
                    }}
                  />

                  <p
                    style={{
                      fontFamily: "var(--font-caveat)",
                      fontSize: "1rem",
                      color: isChaos ? "rgba(220,220,255,0.88)" : "#3d2b1f",
                      lineHeight: 1.5,
                      margin: 0,
                      marginBottom: 10,
                      wordBreak: "break-word",
                    }}
                  >
                    {note.text}
                  </p>
                  <p
                    style={{
                      fontFamily: "var(--font-caveat)",
                      fontSize: "0.7rem",
                      color: mutedClr,
                      margin: 0,
                      borderTop: `1px dashed ${borderClr}`,
                      paddingTop: 6,
                    }}
                  >
                    {dateStr}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// FINALE CREDITS (06_letters)
// ─────────────────────────────────────────────────────────────
function FinaleCredits() {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 500);
    return () => clearTimeout(t);
  }, []);

  return (
    <div
      style={{
        background: "#000",
        minHeight: "52vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        overflow: "hidden",
        marginTop: 56,
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "url('data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22400%22 height=%22400%22%3E%3Cfilter id=%22n%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.85%22 numOctaves=%224%22/%3E%3C/filter%3E%3Crect width=%22400%22 height=%22400%22 filter=%22url(%23n)%22 opacity=%220.05%22/%3E%3C/svg%3E')",
          opacity: 0.6,
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(28px)",
          transition: "opacity 2.2s ease, transform 2.6s ease",
          textAlign: "center",
          position: "relative",
          zIndex: 5,
          padding: "0 24px",
        }}
      >
        <p
          style={{
            fontFamily: "var(--font-caveat)",
            fontSize: "0.78rem",
            color: "rgba(255,255,255,0.28)",
            letterSpacing: "0.38em",
            textTransform: "uppercase",
            marginBottom: 22,
          }}
        >
          end of reel
        </p>
        <h2
          style={{
            fontFamily: "var(--font-playfair)",
            fontSize: "clamp(2rem, 5vw, 3.6rem)",
            color: "white",
            lineHeight: 1.1,
            marginBottom: 18,
            textShadow: "0 0 60px rgba(255,255,255,0.07)",
          }}
        >
          Banasthali Diaries
          <br />
          <span style={{ fontStyle: "italic", fontSize: "0.68em", color: "rgba(255,255,255,0.55)" }}>
            2022 – 2026
          </span>
        </h2>
        <p style={{ fontFamily: "var(--font-caveat)", fontSize: "1.08rem", color: "rgba(255,255,255,0.48)", marginBottom: 8 }}>
          Directed by Nandini Jain
        </p>
        <p style={{ fontFamily: "var(--font-caveat)", fontSize: "0.84rem", color: "rgba(255,255,255,0.26)", marginBottom: 36 }}>
          Produced on Desk 204, Banasthali
        </p>
        <div style={{ display: "flex", justifyContent: "center", gap: 14, fontSize: "1.3rem" }}>
          {["✦", "✦", "✦"].map((s, i) => (
            <span
              key={i}
              style={{ opacity: 0.35, animation: `sparkleFloat 2.2s ease-in-out ${i * 0.45}s infinite` }}
            >
              {s}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// MAIN EXPORT
// ─────────────────────────────────────────────────────────────
export function FilmReelOverlay({
  folderId,
  folderLabel,
  isChaosModeActive,
  isFinale = false,
  onClose,
}: Props) {
  const [frames, setFrames] = useState<ReelFrame[]>([]);
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [errorMsg, setErrorMsg] = useState("");
  const [zoomedFrame, setZoomedFrame] = useState<ReelFrame | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadMsg, setUploadMsg] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isChaos = isChaosModeActive;
  const headerFont = isChaos ? "var(--font-bungee)" : "var(--font-playfair)";

  // ── Lock scroll ─────────────────────────────────────────────
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  // ── Escape key ──────────────────────────────────────────────
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (zoomedFrame) setZoomedFrame(null);
        else onClose();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose, zoomedFrame]);

  // ── fetchFiles ──────────────────────────────────────────────
  const fetchFiles = useCallback(async () => {
    setStatus("loading");
    try {
      const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      if (!anonKey) throw new Error("Missing NEXT_PUBLIC_SUPABASE_ANON_KEY");

      const res = await fetch(`${SUPABASE_URL}/storage/v1/object/list/${BUCKET}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${anonKey}`,
          apikey: anonKey,
        },
        body: JSON.stringify({
          prefix: `${folderId}/`,
          limit: 200,
          sortBy: { column: "name", order: "asc" },
        }),
      });

      if (!res.ok) {
        const body = await res.text();
        throw new Error(`Supabase ${res.status}: ${body}`);
      }

      const data = await res.json();
      const imageFrames: ReelFrame[] = data
        .filter((f: { name?: string }) => f.name && isImageFile(f.name))
        .map((f: { name: string }) => ({ name: f.name, url: getPublicUrl(folderId, f.name) }));

      setFrames(imageFrames);
      setStatus("success");
    } catch (err) {
      console.error("FilmReelOverlay fetchFiles error:", err);
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong");
      setStatus("error");
    }
  }, [folderId]);

  useEffect(() => { fetchFiles(); }, [fetchFiles]);

  // ── uploadPhoto ─────────────────────────────────────────────
  // Triggered by the hidden <input type="file"> via the "Add Memory" button.
  // Uploads the selected image to the Supabase `memories` bucket under
  // the current folderId path using the Storage REST API.
  const uploadPhoto = useCallback(
    async (file: File) => {
      setUploading(true);
      setUploadMsg("");
      try {
        const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
        if (!anonKey) throw new Error("Missing NEXT_PUBLIC_SUPABASE_ANON_KEY");

        const filePath = `${folderId}/${file.name}`;

        const res = await fetch(
          `${SUPABASE_URL}/storage/v1/object/${BUCKET}/${filePath}`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${anonKey}`,
              apikey: anonKey,
              "Content-Type": file.type || "application/octet-stream",
              // Uncomment the line below to allow overwriting existing files
              // "x-upsert": "true",
            },
            body: file,
          }
        );

        if (!res.ok) {
          const body = await res.text();
          throw new Error(`Upload failed (${res.status}): ${body}`);
        }

        setUploadMsg("✦ Photo uploaded! Refreshing reel…");
        setTimeout(() => {
          fetchFiles();
          setUploadMsg("");
        }, 1800);
      } catch (err) {
        console.error("uploadPhoto error:", err);
        setUploadMsg(err instanceof Error ? `⚠ ${err.message}` : "⚠ Upload failed");
      } finally {
        setUploading(false);
        // Reset so the same file can be re-selected if needed
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    },
    [folderId, fetchFiles]
  );

  return (
    <>
      {/* Hidden file input — triggered programmatically */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) uploadPhoto(file);
        }}
      />

      {/* ── MAIN PANEL ──────────────────────────────────────── */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 300,
          display: "flex",
          flexDirection: "column",
          background: isChaos ? "#08080f" : "#0a0a0a",
          overflowY: "auto",
          animation: "diaryOpen 0.32s ease",
        }}
      >
        {/* Chaos BG texture */}
        {isChaos && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              backgroundImage: "url('/assets/static/chaos/wiggly-lines-bg.png')",
              backgroundSize: "cover",
              opacity: 0.04,
              mixBlendMode: "screen",
              pointerEvents: "none",
              zIndex: 0,
            }}
          />
        )}

        {/* ── HEADER ───────────────────────────────────────── */}
        <div
          style={{
            position: "sticky",
            top: 0,
            zIndex: 50,
            padding: "16px 24px 14px",
            background: isChaos
              ? "linear-gradient(to bottom, rgba(8,8,15,0.98) 80%, transparent)"
              : "linear-gradient(to bottom, rgba(10,10,10,0.98) 80%, transparent)",
            backdropFilter: "blur(14px)",
            borderBottom: isChaos
              ? "1px solid rgba(155,89,182,0.14)"
              : "1px solid rgba(255,255,255,0.06)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
          }}
        >
          {/* Torn paper bottom accent */}
          <div
            style={{
              position: "absolute",
              bottom: -13,
              left: 0,
              right: 0,
              height: 13,
              backgroundImage: isChaos
                ? "url('/assets/static/chaos/torn-paper-orange.png')"
                : "url('/assets/static/nostalgia/torn-corner.png')",
              backgroundRepeat: "repeat-x",
              backgroundSize: "auto 100%",
              opacity: 0.22,
              pointerEvents: "none",
            }}
          />

          {/* Left: title */}
          <div style={{ display: "flex", flexDirection: "column", gap: 2, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
              <img
                src={isChaos ? "/assets/static/chaos/tape-red.png" : "/assets/static/nostalgia/tape-pink-soft.png"}
                alt=""
                aria-hidden
                style={{ width: 34, height: 14, objectFit: "cover", opacity: 0.7, borderRadius: 2 }}
              />
              <span
                style={{
                  fontFamily: "var(--font-caveat)",
                  fontSize: "0.68rem",
                  color: isChaos ? "#9b59b6" : "rgba(255,255,255,0.3)",
                  textTransform: "uppercase",
                  letterSpacing: "0.24em",
                }}
              >
                Film Reel · {folderId}
              </span>
            </div>
            <h1
              style={{
                fontFamily: headerFont,
                fontSize: isChaos ? "0.95rem" : "1.45rem",
                color: isChaos ? "#e0e0ff" : "white",
                margin: 0,
                lineHeight: 1,
                textShadow: isChaos ? "0 0 20px rgba(155,89,182,0.5)" : "none",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {folderLabel}
            </h1>
          </div>

          {/* Right: Upload + Close */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
            {/* Upload / Add Memory */}
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              title="Upload a photo to this reel"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 7,
                padding: "7px 16px",
                borderRadius: 999,
                border: isChaos
                  ? "1.5px solid rgba(155,89,182,0.35)"
                  : "1.5px solid rgba(255,255,255,0.18)",
                background: uploading
                  ? "rgba(255,255,255,0.04)"
                  : isChaos ? "rgba(155,89,182,0.12)" : "rgba(255,255,255,0.07)",
                color: uploading
                  ? "rgba(255,255,255,0.3)"
                  : isChaos ? "rgba(180,140,255,0.85)" : "rgba(255,255,255,0.7)",
                fontFamily: "var(--font-caveat)",
                fontSize: "0.88rem",
                cursor: uploading ? "not-allowed" : "pointer",
                backdropFilter: "blur(6px)",
                transition: "background 0.18s ease, color 0.18s ease",
                boxShadow: isChaos ? "0 0 10px rgba(155,89,182,0.15)" : "none",
              }}
              onMouseEnter={(e) => {
                if (!uploading)
                  (e.currentTarget as HTMLElement).style.background = isChaos
                    ? "rgba(155,89,182,0.24)"
                    : "rgba(255,255,255,0.13)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.background = uploading
                  ? "rgba(255,255,255,0.04)"
                  : isChaos ? "rgba(155,89,182,0.12)" : "rgba(255,255,255,0.07)";
              }}
            >
              {uploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} strokeWidth={2} />}
              {uploading ? "Uploading…" : "Add Memory"}
            </button>

            {/* Close */}
            <button
              onClick={onClose}
              style={{
                background: "rgba(255,255,255,0.07)",
                border: "1px solid rgba(255,255,255,0.11)",
                borderRadius: "50%",
                width: 40,
                height: 40,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                color: "rgba(255,255,255,0.55)",
                transition: "all 0.18s ease",
                flexShrink: 0,
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.14)";
                (e.currentTarget as HTMLElement).style.color = "white";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.07)";
                (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.55)";
              }}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Upload toast */}
        {uploadMsg && (
          <div
            style={{
              position: "fixed",
              top: 74,
              left: "50%",
              transform: "translateX(-50%)",
              background: isChaos ? "rgba(155,89,182,0.9)" : "rgba(50,32,14,0.9)",
              color: "white",
              fontFamily: "var(--font-caveat)",
              fontSize: "0.9rem",
              padding: "7px 22px",
              borderRadius: 999,
              backdropFilter: "blur(8px)",
              zIndex: 60,
              animation: "toastIn 0.22s ease",
              whiteSpace: "nowrap",
            }}
          >
            {uploadMsg}
          </div>
        )}

        {/* ── CONTENT ─────────────────────────────────────────── */}
        <div style={{ flex: 1, position: "relative", zIndex: 5, paddingTop: 22 }}>

          {/* Loading */}
          {status === "loading" && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "55vh", gap: 14 }}>
              <Loader2 className="animate-spin" size={28} color={isChaos ? "#9b59b6" : "rgba(255,255,255,0.35)"} />
              <p style={{ fontFamily: "var(--font-caveat)", fontSize: "1rem", color: "rgba(255,255,255,0.3)" }}>
                developing film…
              </p>
            </div>
          )}

          {/* Error */}
          {status === "error" && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "55vh", gap: 14 }}>
              <AlertTriangle size={28} color="#e05c3a" />
              <p style={{ fontFamily: "var(--font-caveat)", fontSize: "1rem", color: "rgba(255,255,255,0.32)", maxWidth: 320, textAlign: "center" }}>
                {errorMsg}
              </p>
              <button
                onClick={fetchFiles}
                style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 22px", borderRadius: 999, border: "none", background: isChaos ? "#9b59b6" : "#c8a97e", color: "white", fontFamily: "var(--font-caveat)", fontSize: "1rem", cursor: "pointer" }}
              >
                <RefreshCw size={14} /> Try again
              </button>
            </div>
          )}

          {/* Empty */}
          {status === "success" && frames.length === 0 && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "35vh", gap: 10 }}>
              <p style={{ fontFamily: "var(--font-caveat)", fontSize: "1.2rem", color: "rgba(255,255,255,0.22)" }}>
                This reel is still blank ✦
              </p>
              <p style={{ fontFamily: "var(--font-caveat)", fontSize: "0.85rem", color: "rgba(255,255,255,0.16)", fontStyle: "italic" }}>
                Use "Add Memory" above to upload the first frame.
              </p>
            </div>
          )}

          {/* ── THE SINGLE REEL ───── */}
          {status === "success" && frames.length > 0 && (
            <>
              <p
                style={{
                  fontFamily: "var(--font-caveat)",
                  fontSize: "0.82rem",
                  color: isChaos ? "rgba(155,89,182,0.52)" : "rgba(255,255,255,0.2)",
                  textAlign: "center",
                  marginBottom: 6,
                  letterSpacing: "0.09em",
                }}
              >
                {frames.length} frame{frames.length !== 1 ? "s" : ""} · arrows to scroll · hover to pause · click to zoom
              </p>

              <FilmReel
                frames={frames}
                isChaosModeActive={isChaosModeActive}
                onFrameZoom={setZoomedFrame}
              />
            </>
          )}

          {/* ── SHARED JOURNAL — shown once reel status resolves ── */}
          {status === "success" && (
            <SharedJournal folderId={folderId} isChaosModeActive={isChaosModeActive} />
          )}

          {/* ── FINALE CREDITS ── */}
          {isFinale && status === "success" && <FinaleCredits />}
        </div>
      </div>

      {/* ── ZOOM MODAL ──────────────────────────────────────── */}
      {zoomedFrame && (
        <PhotoNote
          frame={zoomedFrame}
          isChaosModeActive={isChaosModeActive}
          onClose={() => setZoomedFrame(null)}
        />
      )}

      <style>{`
        @keyframes diaryOpen {
          from { opacity: 0; transform: scale(0.97); }
          to   { opacity: 1; transform: scale(1); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes noteReveal {
          from { opacity: 0; transform: rotate(-1.5deg) scale(0.88) translateY(22px); }
          to   { opacity: 1; transform: rotate(-1.5deg) scale(1) translateY(0); }
        }
        @keyframes toastIn {
          from { opacity: 0; transform: translateX(-50%) translateY(8px); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
        @keyframes sparkleFloat {
          0%, 100% { opacity: 0.28; transform: translateY(0); }
          50%       { opacity: 0.65; transform: translateY(-7px); }
        }
      `}</style>
    </>
  );
}



// "use client";

// import {
//   useEffect,
//   useState,
//   useCallback,
//   useRef,
//   type CSSProperties,
// } from "react";
// import { X, Loader2, AlertTriangle, RefreshCw, ImageOff, ZoomIn } from "lucide-react";

// // ─────────────────────────────────────────────────────────────
// // CONSTANTS
// // ─────────────────────────────────────────────────────────────
// const SUPABASE_URL = "https://fjkvnqksolupscjgjwkc.supabase.co";
// const BUCKET = "memories";

// function getPublicUrl(folderId: string, fileName: string) {
//   return `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${folderId}/${encodeURIComponent(fileName)}`;
// }

// function isImageFile(name: string) {
//   return /\.(jpe?g|png|gif|webp|avif|svg)$/i.test(name);
// }

// // ─────────────────────────────────────────────────────────────
// // TYPES
// // ─────────────────────────────────────────────────────────────
// interface ReelFrame {
//   name: string;
//   url: string;
// }

// interface Props {
//   folderId: string;
//   folderLabel: string;
//   isChaosModeActive: boolean;
//   isFinale?: boolean;
//   onClose: () => void;
// }

// // ─────────────────────────────────────────────────────────────
// // PHOTO ZOOM MODAL (paper note overlay)
// // ─────────────────────────────────────────────────────────────
// function PhotoNote({
//   frame,
//   isChaosModeActive,
//   onClose,
// }: {
//   frame: ReelFrame;
//   isChaosModeActive: boolean;
//   onClose: () => void;
// }) {
//   const isChaos = isChaosModeActive;
//   const caption = frame.name.replace(/\.[^.]+$/, "").replace(/[-_]/g, " ");

//   return (
//     <div
//       onClick={onClose}
//       style={{
//         position: "fixed",
//         inset: 0,
//         zIndex: 400,
//         background: "rgba(0,0,0,0.88)",
//         display: "flex",
//         alignItems: "center",
//         justifyContent: "center",
//         animation: "fadeIn 0.2s ease",
//         backdropFilter: "blur(6px)",
//       }}
//     >
//       <div
//         onClick={(e) => e.stopPropagation()}
//         style={{
//           position: "relative",
//           maxWidth: "min(88vw, 680px)",
//           animation: "noteReveal 0.3s cubic-bezier(0.34,1.56,0.64,1)",
//           transform: "rotate(-1.5deg)",
//         }}
//       >
//         {/* Paper texture background */}
//         <div
//           style={{
//             position: "absolute",
//             inset: -12,
//             backgroundImage: isChaos
//               ? "url('/assets/static/chaos/torn-paper-bg-black.png')"
//               : "url('/assets/static/nostalgia/paper-texture-bg.png')",
//             backgroundSize: "cover",
//             borderRadius: 6,
//             opacity: isChaos ? 0.7 : 1,
//             zIndex: 0,
//           }}
//         />

//         {/* Tape across top */}
//         <img
//           src={
//             isChaos
//               ? "/assets/static/chaos/tape-red.png"
//               : "/assets/static/nostalgia/tape-pink-soft.png"
//           }
//           alt=""
//           aria-hidden
//           style={{
//             position: "absolute",
//             top: -14,
//             left: "50%",
//             transform: "translateX(-50%) rotate(-2deg)",
//             width: 70,
//             height: 24,
//             objectFit: "cover",
//             zIndex: 20,
//             opacity: 0.9,
//           }}
//         />

//         {/* Paint stroke behind title */}
//         <img
//           src={
//             isChaos
//               ? "/assets/static/chaos/paint-splash-red.png"
//               : "/assets/static/nostalgia/paint-stroke.png"
//           }
//           alt=""
//           aria-hidden
//           style={{
//             position: "absolute",
//             bottom: 24,
//             left: 0,
//             right: 0,
//             height: 36,
//             objectFit: "contain",
//             opacity: 0.2,
//             zIndex: 1,
//             pointerEvents: "none",
//           }}
//         />

//         {/* Inner content */}
//         <div
//           style={{
//             position: "relative",
//             zIndex: 10,
//             padding: "20px 20px 22px",
//             background: isChaos
//               ? "rgba(12,12,24,0.82)"
//               : "rgba(255,252,244,0.88)",
//             borderRadius: 4,
//             boxShadow: isChaos
//               ? "0 12px 60px rgba(0,0,0,0.8), 0 0 24px rgba(155,89,182,0.3)"
//               : "0 12px 48px rgba(0,0,0,0.28), 0 2px 8px rgba(0,0,0,0.1)",
//             border: isChaos
//               ? "1px solid rgba(155,89,182,0.2)"
//               : "1px solid rgba(200,170,130,0.25)",
//           }}
//         >
//           {/* Photo */}
//           <img
//             src={frame.url}
//             alt={caption}
//             style={{
//               width: "100%",
//               maxHeight: "60vh",
//               objectFit: "contain",
//               display: "block",
//               borderRadius: 2,
//               filter: isChaos ? "saturate(0.85)" : "none",
//             }}
//           />

//           {/* Caption — Caveat font on paper note */}
//           <div
//             style={{
//               marginTop: 14,
//               padding: "8px 4px 0",
//               borderTop: isChaos
//                 ? "1px solid rgba(155,89,182,0.2)"
//                 : "1px dashed rgba(180,140,100,0.35)",
//             }}
//           >
//             <p
//               style={{
//                 fontFamily: "var(--font-caveat)",
//                 fontSize: "1.25rem",
//                 color: isChaos ? "#c0c0ff" : "#3d2b1f",
//                 textAlign: "center",
//                 lineHeight: 1.4,
//                 margin: 0,
//               }}
//             >
//               {caption}
//             </p>
//             <p
//               style={{
//                 fontFamily: "var(--font-caveat)",
//                 fontSize: "0.8rem",
//                 color: isChaos ? "rgba(200,200,255,0.4)" : "rgba(100,70,40,0.4)",
//                 textAlign: "center",
//                 marginTop: 4,
//                 fontStyle: "italic",
//               }}
//             >
//               click anywhere to close
//             </p>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// // ─────────────────────────────────────────────────────────────
// // FILM FRAME (single sprocket cell)
// // ─────────────────────────────────────────────────────────────
// function FilmFrame({
//   frame,
//   isChaosModeActive,
//   onZoom,
// }: {
//   frame: ReelFrame;
//   isChaosModeActive: boolean;
//   onZoom: (frame: ReelFrame) => void;
// }) {
//   const [loaded, setLoaded] = useState(false);
//   const [error, setError] = useState(false);
//   const [hovered, setHovered] = useState(false);
//   const isChaos = isChaosModeActive;

//   return (
//     <div
//       onMouseEnter={() => setHovered(true)}
//       onMouseLeave={() => setHovered(false)}
//       onClick={() => !error && onZoom(frame)}
//       style={{
//         flexShrink: 0,
//         width: 220,
//         cursor: error ? "default" : "zoom-in",
//         position: "relative",
//         transition: "transform 0.22s cubic-bezier(0.34,1.56,0.64,1)",
//         transform: hovered ? "scale(1.06) translateY(-6px)" : "scale(1)",
//         zIndex: hovered ? 10 : 1,
//       }}
//     >
//       {/* Film cell border */}
//       <div
//         style={{
//           background: "#111",
//           border: `3px solid ${isChaos ? "#333" : "#1a1a1a"}`,
//           borderRadius: 2,
//           overflow: "hidden",
//           position: "relative",
//           boxShadow: hovered
//             ? isChaos
//               ? "0 0 24px rgba(155,89,182,0.6), 0 8px 30px rgba(0,0,0,0.8)"
//               : "0 0 0 2px rgba(255,255,255,0.15), 0 8px 28px rgba(0,0,0,0.7)"
//             : "0 4px 16px rgba(0,0,0,0.6)",
//         }}
//       >
//         {/* Sprocket holes — top */}
//         <div style={{ display: "flex", justifyContent: "space-around", padding: "4px 8px 2px", background: "#0a0a0a" }}>
//           {[0, 1, 2, 3].map((i) => (
//             <div
//               key={i}
//               style={{
//                 width: 10,
//                 height: 8,
//                 background: "#1a1a1a",
//                 borderRadius: 2,
//                 border: "1.5px solid #333",
//               }}
//             />
//           ))}
//         </div>

//         {/* Photo area */}
//         <div style={{ position: "relative", height: 180, background: "#0d0d0d" }}>
//           {!loaded && !error && (
//             <div
//               style={{
//                 position: "absolute",
//                 inset: 0,
//                 display: "flex",
//                 alignItems: "center",
//                 justifyContent: "center",
//               }}
//             >
//               <Loader2
//                 className="animate-spin"
//                 size={20}
//                 color={isChaos ? "#9b59b6" : "#888"}
//               />
//             </div>
//           )}
//           {error ? (
//             <div
//               style={{
//                 position: "absolute",
//                 inset: 0,
//                 display: "flex",
//                 flexDirection: "column",
//                 alignItems: "center",
//                 justifyContent: "center",
//                 gap: 6,
//               }}
//             >
//               <ImageOff size={20} color="#444" />
//               <span style={{ fontSize: 9, color: "#444", fontFamily: "var(--font-caveat)" }}>
//                 couldn't develop
//               </span>
//             </div>
//           ) : (
//             <img
//               src={frame.url}
//               alt={frame.name}
//               style={{
//                 width: "100%",
//                 height: "100%",
//                 objectFit: "cover",
//                 display: loaded ? "block" : "none",
//                 filter: isChaos ? "saturate(0.8) contrast(1.05)" : "none",
//                 transition: "filter 0.3s ease",
//               }}
//               onLoad={() => setLoaded(true)}
//               onError={() => setError(true)}
//             />
//           )}

//           {/* Hover zoom hint */}
//           {hovered && !error && loaded && (
//             <div
//               style={{
//                 position: "absolute",
//                 inset: 0,
//                 background: "rgba(0,0,0,0.35)",
//                 display: "flex",
//                 alignItems: "center",
//                 justifyContent: "center",
//                 animation: "fadeIn 0.15s ease",
//               }}
//             >
//               <ZoomIn size={28} color="rgba(255,255,255,0.85)" strokeWidth={1.5} />
//             </div>
//           )}
//         </div>

//         {/* Sprocket holes — bottom */}
//         <div style={{ display: "flex", justifyContent: "space-around", padding: "2px 8px 4px", background: "#0a0a0a" }}>
//           {[0, 1, 2, 3].map((i) => (
//             <div
//               key={i}
//               style={{
//                 width: 10,
//                 height: 8,
//                 background: "#1a1a1a",
//                 borderRadius: 2,
//                 border: "1.5px solid #333",
//               }}
//             />
//           ))}
//         </div>
//       </div>

//       {/* Caption strip */}
//       <p
//         style={{
//           fontFamily: "var(--font-caveat)",
//           fontSize: "0.75rem",
//           color: isChaos ? "rgba(200,200,255,0.5)" : "rgba(255,255,255,0.45)",
//           textAlign: "center",
//           marginTop: 6,
//           padding: "0 4px",
//           whiteSpace: "nowrap",
//           overflow: "hidden",
//           textOverflow: "ellipsis",
//           maxWidth: "100%",
//         }}
//       >
//         {frame.name.replace(/\.[^.]+$/, "").replace(/[-_]/g, " ")}
//       </p>
//     </div>
//   );
// }

// // ─────────────────────────────────────────────────────────────
// // INFINITE FILM REEL
// // ─────────────────────────────────────────────────────────────
// function FilmReel({
//   frames,
//   isChaosModeActive,
//   onFrameZoom,
// }: {
//   frames: ReelFrame[];
//   isChaosModeActive: boolean;
//   onFrameZoom: (frame: ReelFrame) => void;
// }) {
//   const [paused, setPaused] = useState(false);
//   // Duplicate frames for seamless loop
//   const doubled = [...frames, ...frames];
//   const isChaos = isChaosModeActive;

//   return (
//     <div
//       style={{
//         position: "relative",
//         width: "100%",
//         overflow: "hidden",
//         padding: "24px 0 32px",
//       }}
//     >
//       {/* Film strip track */}
//       <div
//         style={{
//           display: "flex",
//           gap: 20,
//           width: "max-content",
//           animation: paused ? "none" : "filmScroll 40s linear infinite",
//           animationPlayState: paused ? "paused" : "running",
//         }}
//         onMouseEnter={() => setPaused(true)}
//         onMouseLeave={() => setPaused(false)}
//       >
//         {doubled.map((frame, i) => (
//           <FilmFrame
//             key={`${frame.name}-${i}`}
//             frame={frame}
//             isChaosModeActive={isChaosModeActive}
//             onZoom={onFrameZoom}
//           />
//         ))}
//       </div>

//       {/* Edge fades */}
//       <div
//         style={{
//           position: "absolute",
//           top: 0,
//           left: 0,
//           width: 80,
//           height: "100%",
//           background: isChaos
//             ? "linear-gradient(to right, #0a0a16, transparent)"
//             : "linear-gradient(to right, #0a0a0a, transparent)",
//           pointerEvents: "none",
//           zIndex: 5,
//         }}
//       />
//       <div
//         style={{
//           position: "absolute",
//           top: 0,
//           right: 0,
//           width: 80,
//           height: "100%",
//           background: isChaos
//             ? "linear-gradient(to left, #0a0a16, transparent)"
//             : "linear-gradient(to left, #0a0a0a, transparent)",
//           pointerEvents: "none",
//           zIndex: 5,
//         }}
//       />

//       {/* Pause indicator */}
//       {paused && (
//         <div
//           style={{
//             position: "absolute",
//             bottom: 8,
//             left: "50%",
//             transform: "translateX(-50%)",
//             background: "rgba(0,0,0,0.55)",
//             color: "rgba(255,255,255,0.6)",
//             fontFamily: "var(--font-caveat)",
//             fontSize: "0.75rem",
//             padding: "3px 12px",
//             borderRadius: 999,
//             backdropFilter: "blur(4px)",
//             pointerEvents: "none",
//             zIndex: 10,
//           }}
//         >
//           ⏸ paused — click a frame to zoom
//         </div>
//       )}
//     </div>
//   );
// }

// // ─────────────────────────────────────────────────────────────
// // FINALE CREDITS
// // ─────────────────────────────────────────────────────────────
// function FinaleCredits({ onDone }: { onDone: () => void }) {
//   const [visible, setVisible] = useState(false);

//   useEffect(() => {
//     const t = setTimeout(() => setVisible(true), 400);
//     return () => clearTimeout(t);
//   }, []);

//   return (
//     <div
//       style={{
//         background: "#000",
//         height: "50vh",
//         display: "flex",
//         flexDirection: "column",
//         alignItems: "center",
//         justifyContent: "center",
//         gap: 0,
//         position: "relative",
//         overflow: "hidden",
//         marginTop: 48,
//       }}
//     >
//       {/* Grain overlay */}
//       <div
//         style={{
//           position: "absolute",
//           inset: 0,
//           backgroundImage: "url('data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22400%22 height=%22400%22%3E%3Cfilter id=%22n%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.9%22 numOctaves=%224%22/%3E%3C/filter%3E%3Crect width=%22400%22 height=%22400%22 filter=%22url(%23n)%22 opacity=%220.04%22/%3E%3C/svg%3E')",
//           pointerEvents: "none",
//           opacity: 0.6,
//         }}
//       />

//       {/* Slow scroll credits */}
//       <div
//         style={{
//           opacity: visible ? 1 : 0,
//           transform: visible ? "translateY(0)" : "translateY(30px)",
//           transition: "opacity 2s ease, transform 2.5s ease",
//           textAlign: "center",
//           position: "relative",
//           zIndex: 5,
//         }}
//       >
//         <p
//           style={{
//             fontFamily: "var(--font-caveat)",
//             fontSize: "0.8rem",
//             color: "rgba(255,255,255,0.3)",
//             letterSpacing: "0.35em",
//             textTransform: "uppercase",
//             marginBottom: 20,
//           }}
//         >
//           end of reel
//         </p>
//         <h2
//           style={{
//             fontFamily: "var(--font-playfair)",
//             fontSize: "clamp(2rem, 5vw, 3.5rem)",
//             color: "white",
//             lineHeight: 1.1,
//             marginBottom: 16,
//             textShadow: "0 0 60px rgba(255,255,255,0.08)",
//           }}
//         >
//           Banasthali Diaries
//           <br />
//           <span
//             style={{
//               fontStyle: "italic",
//               fontSize: "0.7em",
//               color: "rgba(255,255,255,0.6)",
//             }}
//           >
//             2022 – 2026
//           </span>
//         </h2>
//         <p
//           style={{
//             fontFamily: "var(--font-caveat)",
//             fontSize: "1.05rem",
//             color: "rgba(255,255,255,0.5)",
//             marginBottom: 8,
//           }}
//         >
//           Directed by Nandini Jain
//         </p>
//         <p
//           style={{
//             fontFamily: "var(--font-caveat)",
//             fontSize: "0.85rem",
//             color: "rgba(255,255,255,0.28)",
//             marginBottom: 32,
//           }}
//         >
//           Produced on Desk 204, Banasthali
//         </p>
//         {/* Confetti / sparkle hint */}
//         <div
//           style={{
//             display: "flex",
//             justifyContent: "center",
//             gap: 12,
//             fontSize: "1.4rem",
//             animation: "sparkleFloat 2s ease-in-out infinite",
//           }}
//         >
//           {"✦ ✦ ✦".split(" ").map((s, i) => (
//             <span
//               key={i}
//               style={{
//                 opacity: 0.4,
//                 animationDelay: `${i * 0.4}s`,
//                 animation: `sparkleFloat 2s ease-in-out ${i * 0.4}s infinite`,
//               }}
//             >
//               {s}
//             </span>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// }

// // ─────────────────────────────────────────────────────────────
// // MAIN EXPORT
// // ─────────────────────────────────────────────────────────────
// export function FilmReelOverlay({
//   folderId,
//   folderLabel,
//   isChaosModeActive,
//   isFinale = false,
//   onClose,
// }: Props) {
//   const [frames, setFrames] = useState<ReelFrame[]>([]);
//   const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
//   const [errorMsg, setErrorMsg] = useState("");
//   const [zoomedFrame, setZoomedFrame] = useState<ReelFrame | null>(null);
//   const isChaos = isChaosModeActive;
//   const scrollRef = useRef<HTMLDivElement>(null);

//   // Lock body scroll
//   useEffect(() => {
//     document.body.style.overflow = "hidden";
//     return () => { document.body.style.overflow = ""; };
//   }, []);

//   // Escape key
//   useEffect(() => {
//     const handler = (e: KeyboardEvent) => {
//       if (e.key === "Escape") {
//         if (zoomedFrame) setZoomedFrame(null);
//         else onClose();
//       }
//     };
//     window.addEventListener("keydown", handler);
//     return () => window.removeEventListener("keydown", handler);
//   }, [onClose, zoomedFrame]);

//   // Fetch images from Supabase folder
//   const fetchFiles = useCallback(async () => {
//     setStatus("loading");
//     try {
//       const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
//       if (!anonKey) throw new Error("Missing NEXT_PUBLIC_SUPABASE_ANON_KEY");

//       const res = await fetch(
//         `${SUPABASE_URL}/storage/v1/object/list/${BUCKET}`,
//         {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//             Authorization: `Bearer ${anonKey}`,
//             apikey: anonKey,
//           },
//           body: JSON.stringify({
//             prefix: `${folderId}/`,
//             limit: 200,
//             sortBy: { column: "name", order: "asc" },
//           }),
//         }
//       );

//       if (!res.ok) {
//         const body = await res.text();
//         throw new Error(`Supabase ${res.status}: ${body}`);
//       }

//       const data = await res.json();
//       const imageFrames: ReelFrame[] = data
//         .filter((f: { name?: string }) => f.name && isImageFile(f.name))
//         .map((f: { name: string }) => ({
//           name: f.name,
//           url: getPublicUrl(folderId, f.name),
//         }));

//       setFrames(imageFrames);
//       setStatus("success");
//     } catch (err) {
//       console.error("FilmReelOverlay fetch error:", err);
//       setErrorMsg(err instanceof Error ? err.message : "Something went wrong");
//       setStatus("error");
//     }
//   }, [folderId]);

//   useEffect(() => {
//     fetchFiles();
//   }, [fetchFiles]);

//   const headerFont = isChaos ? "var(--font-bungee)" : "var(--font-playfair)";

//   return (
//     <>
//       {/* ── MAIN PANEL ─────────────────────── */}
//       <div
//         ref={scrollRef}
//         style={{
//           position: "fixed",
//           inset: 0,
//           zIndex: 300,
//           display: "flex",
//           flexDirection: "column",
//           background: isChaos ? "#08080f" : "#0a0a0a",
//           overflowY: "auto",
//           animation: "diaryOpen 0.35s ease",
//         }}
//       >
//         {/* Background texture */}
//         {isChaos && (
//           <div
//             style={{
//               position: "fixed",
//               inset: 0,
//               backgroundImage: "url('/assets/static/chaos/wiggly-lines-bg.png')",
//               backgroundSize: "cover",
//               opacity: 0.04,
//               mixBlendMode: "screen",
//               pointerEvents: "none",
//               zIndex: 0,
//             }}
//           />
//         )}

//         {/* ── HEADER ─────────────────────── */}
//         <div
//           style={{
//             position: "sticky",
//             top: 0,
//             zIndex: 50,
//             padding: "18px 28px 14px",
//             background: isChaos
//               ? "linear-gradient(to bottom, rgba(8,8,15,0.98), rgba(8,8,15,0.85))"
//               : "linear-gradient(to bottom, rgba(10,10,10,0.98), rgba(10,10,10,0.85))",
//             backdropFilter: "blur(12px)",
//             borderBottom: isChaos
//               ? "1px solid rgba(155,89,182,0.15)"
//               : "1px solid rgba(255,255,255,0.06)",
//             display: "flex",
//             alignItems: "center",
//             justifyContent: "space-between",
//             gap: 16,
//           }}
//         >
//           {/* Torn paper accent */}
//           <div
//             style={{
//               position: "absolute",
//               bottom: -12,
//               left: 0,
//               right: 0,
//               height: 12,
//               backgroundImage: isChaos
//                 ? "url('/assets/static/chaos/torn-paper-orange.png')"
//                 : "url('/assets/static/nostalgia/torn-corner.png')",
//               backgroundRepeat: "repeat-x",
//               backgroundSize: "auto 100%",
//               opacity: 0.25,
//               pointerEvents: "none",
//             }}
//           />

//           <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
//             {/* Tape accent */}
//             <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
//               <img
//                 src={
//                   isChaos
//                     ? "/assets/static/chaos/tape-red.png"
//                     : "/assets/static/nostalgia/tape-pink-soft.png"
//                 }
//                 alt=""
//                 aria-hidden
//                 style={{ width: 36, height: 14, objectFit: "cover", opacity: 0.7, borderRadius: 2 }}
//               />
//               <span
//                 style={{
//                   fontFamily: "var(--font-caveat)",
//                   fontSize: "0.7rem",
//                   color: isChaos ? "#9b59b6" : "rgba(255,255,255,0.35)",
//                   textTransform: "uppercase",
//                   letterSpacing: "0.25em",
//                 }}
//               >
//                 Film Reel · {folderId}
//               </span>
//             </div>
//             <h1
//               style={{
//                 fontFamily: headerFont,
//                 fontSize: isChaos ? "1rem" : "1.5rem",
//                 color: isChaos ? "#e0e0ff" : "white",
//                 margin: 0,
//                 lineHeight: 1,
//                 textShadow: isChaos ? "0 0 20px rgba(155,89,182,0.5)" : "none",
//               }}
//             >
//               {folderLabel}
//             </h1>
//           </div>

//           <button
//             onClick={onClose}
//             style={{
//               background: "rgba(255,255,255,0.07)",
//               border: "1px solid rgba(255,255,255,0.12)",
//               borderRadius: "50%",
//               width: 40,
//               height: 40,
//               display: "flex",
//               alignItems: "center",
//               justifyContent: "center",
//               cursor: "pointer",
//               color: "rgba(255,255,255,0.6)",
//               transition: "all 0.18s ease",
//               flexShrink: 0,
//             }}
//             onMouseEnter={(e) => {
//               (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.14)";
//               (e.currentTarget as HTMLElement).style.color = "white";
//             }}
//             onMouseLeave={(e) => {
//               (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.07)";
//               (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.6)";
//             }}
//           >
//             <X size={18} />
//           </button>
//         </div>

//         {/* ── CONTENT ────────────────────── */}
//         <div style={{ flex: 1, position: "relative", zIndex: 5, paddingTop: 18 }}>
//           {/* Loading */}
//           {status === "loading" && (
//             <div
//               style={{
//                 display: "flex",
//                 flexDirection: "column",
//                 alignItems: "center",
//                 justifyContent: "center",
//                 height: "50vh",
//                 gap: 14,
//               }}
//             >
//               <Loader2
//                 className="animate-spin"
//                 size={28}
//                 color={isChaos ? "#9b59b6" : "rgba(255,255,255,0.4)"}
//               />
//               <p
//                 style={{
//                   fontFamily: "var(--font-caveat)",
//                   fontSize: "1rem",
//                   color: "rgba(255,255,255,0.35)",
//                 }}
//               >
//                 developing film...
//               </p>
//             </div>
//           )}

//           {/* Error */}
//           {status === "error" && (
//             <div
//               style={{
//                 display: "flex",
//                 flexDirection: "column",
//                 alignItems: "center",
//                 justifyContent: "center",
//                 height: "50vh",
//                 gap: 14,
//               }}
//             >
//               <AlertTriangle size={28} color="#e05c3a" />
//               <p
//                 style={{
//                   fontFamily: "var(--font-caveat)",
//                   fontSize: "1rem",
//                   color: "rgba(255,255,255,0.35)",
//                   maxWidth: 320,
//                   textAlign: "center",
//                 }}
//               >
//                 {errorMsg}
//               </p>
//               <button
//                 onClick={fetchFiles}
//                 style={{
//                   display: "flex",
//                   alignItems: "center",
//                   gap: 6,
//                   padding: "8px 20px",
//                   borderRadius: 999,
//                   border: "none",
//                   background: isChaos ? "#9b59b6" : "#c8a97e",
//                   color: "white",
//                   fontFamily: "var(--font-caveat)",
//                   fontSize: "1rem",
//                   cursor: "pointer",
//                 }}
//               >
//                 <RefreshCw size={14} /> Try again
//               </button>
//             </div>
//           )}

//           {/* Empty */}
//           {status === "success" && frames.length === 0 && (
//             <div
//               style={{
//                 display: "flex",
//                 alignItems: "center",
//                 justifyContent: "center",
//                 height: "50vh",
//               }}
//             >
//               <p
//                 style={{
//                   fontFamily: "var(--font-caveat)",
//                   fontSize: "1.2rem",
//                   color: "rgba(255,255,255,0.25)",
//                 }}
//               >
//                 This reel is still blank ✦
//               </p>
//             </div>
//           )}

//           {/* Film reel */}
//           {status === "success" && frames.length > 0 && (
//             <>
//               {/* Frame count */}
//               <p
//                 style={{
//                   fontFamily: "var(--font-caveat)",
//                   fontSize: "0.85rem",
//                   color: isChaos ? "rgba(155,89,182,0.6)" : "rgba(255,255,255,0.25)",
//                   textAlign: "center",
//                   marginBottom: 12,
//                   letterSpacing: "0.1em",
//                 }}
//               >
//                 {frames.length} frames in reel · hover to pause · click to zoom
//               </p>

//               {/* THE REEL */}
//               <FilmReel
//                 frames={frames}
//                 isChaosModeActive={isChaosModeActive}
//                 onFrameZoom={setZoomedFrame}
//               />

//               {/* Second pass reel offset */}
//               {frames.length > 4 && (
//                 <FilmReel
//                   frames={[...frames].reverse()}
//                   isChaosModeActive={isChaosModeActive}
//                   onFrameZoom={setZoomedFrame}
//                 />
//               )}

//               {/* Finale credits at end of 06_letters */}
//               {isFinale && <FinaleCredits onDone={onClose} />}
//             </>
//           )}
//         </div>
//       </div>

//       {/* ── ZOOMED PHOTO NOTE ─────────────── */}
//       {zoomedFrame && (
//         <PhotoNote
//           frame={zoomedFrame}
//           isChaosModeActive={isChaosModeActive}
//           onClose={() => setZoomedFrame(null)}
//         />
//       )}

//       <style>{`
//         @keyframes diaryOpen {
//           from { opacity: 0; transform: scale(0.97); }
//           to   { opacity: 1; transform: scale(1); }
//         }
//         @keyframes fadeIn {
//           from { opacity: 0; }
//           to   { opacity: 1; }
//         }
//         @keyframes noteReveal {
//           from { opacity: 0; transform: rotate(-1.5deg) scale(0.9) translateY(20px); }
//           to   { opacity: 1; transform: rotate(-1.5deg) scale(1) translateY(0); }
//         }
//         @keyframes filmScroll {
//           from { transform: translateX(0); }
//           to   { transform: translateX(-50%); }
//         }
//         @keyframes sparkleFloat {
//           0%, 100% { opacity: 0.3; transform: translateY(0); }
//           50%       { opacity: 0.7; transform: translateY(-6px); }
//         }
//       `}</style>
//     </>
//   );
// }