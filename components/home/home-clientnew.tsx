"use client";

import { useRef, useEffect, useState, type CSSProperties } from "react";
import { FilmReel }    from "./film-reel";
import { CreditsRoll } from "./credits-roll";

// ── Design-guide §3 exact asset paths ────────────────────────────────────────
const A = {
  nostalgia: {
    paperTexture:   "/assets/static/nostalgia/paper-texture-bg.png",
    paintStroke:    "/assets/static/nostalgia/paint-stroke.png",
    tapePinkChk:    "/assets/static/nostalgia/tape-pink-checked.png",
    tapePinkSoft:   "/assets/static/nostalgia/tape-pink-soft.png",
    vintageCorner:  "/assets/static/nostalgia/vintage-corner.png",
    driedFlower:    "/assets/static/nostalgia/dried-flower.png",
    myPainting:     "/assets/static/nostalgia/my-painting.png",
    myPainting2:    "/assets/static/nostalgia/my-painting2.png",
    polaroidTape:   "/assets/static/nostalgia/polaroid-with-tape.png",
    sparkle:        "/assets/static/nostalgia/sparkle-element.png",
  },
  chaos: {
    wigglyLines:    "/assets/static/chaos/wiggly-lines-bg.png",
    paintSplash:    "/assets/static/chaos/paint-splash-red.png",
    tapeRed:        "/assets/static/chaos/tape-red.png",
    paintCornerBk:  "/assets/static/chaos/paint-corner-black.png",
    frameNeonGrn:   "/assets/static/chaos/frame-neongreen.png",
    glitchSticker:  "/assets/static/chaos/glitch-stickers.png",
    blackRip:       "/assets/static/chaos/black-rip.png",
    neonGridTape:   "/assets/static/chaos/neon-grid-tape.png",
    sparkle:        "/assets/static/chaos/sparkle-element.png",
    scribble:       "/assets/static/chaos/scribble-element.png",
  },
} as const;

export type Theme = "nostalgia" | "chaos";

// ── Movie poster config ───────────────────────────────────────────────────────
const MOVIES = [
  {
    id:    "01-blueprint",
    title: "The Blueprint",
    genre: "Origin Story",
    year:  "2022",
    emoji: "📐",
    hue:   "#4A7CBF",
    desc:  "Where it all began. The plans, the dreams, the chaotic first days.",
  },
  {
    id:    "02_hostel",
    title: "Hostel Diaries",
    genre: "Slice of Life",
    year:  "2022–23",
    emoji: "🛏️",
    hue:   "#C0793A",
    desc:  "Late nights, maggi, and conversations that lasted till 4 AM.",
  },
  {
    id:    "03_food",
    title: "Food Crimes",
    genre: "Comedy",
    year:  "2023",
    emoji: "🍕",
    hue:   "#E05C2A",
    desc:  "Everything we ate, regretted, and immediately wanted again.",
  },
  {
    id:    "04_trips",
    title: "Escape Routes",
    genre: "Adventure",
    year:  "2023–24",
    emoji: "🗺️",
    hue:   "#3D9A6B",
    desc:  "Every trip we took to forget we had exams coming up.",
  },
  {
    id:    "05_glitches",
    title: "The Glitches",
    genre: "Thriller",
    year:  "2024–25",
    emoji: "⚡",
    hue:   "#8B5CF6",
    desc:  "The 3 AM panic, the failed plans, the beautiful disasters.",
  },
  {
    id:    "06_letter",
    title: "A Letter",
    genre: "Drama · Finale",
    year:  "2026",
    emoji: "💌",
    hue:   "#C0394B",
    desc:  "The one that started everything. The one that ends it.",
    isFinale: true,
  },
] as const;

type MovieId = (typeof MOVIES)[number]["id"];

// ── Viewport corner decoration ────────────────────────────────────────────────
function CornerDecor({ theme }: { theme: Theme }) {
  const isChaos = theme === "chaos";
  const src = isChaos ? A.chaos.paintCornerBk : A.nostalgia.vintageCorner;
  const corners = ["tl","tr","bl","br"] as const;
  const transforms: Record<string, CSSProperties> = {
    tl:{ top:0,   left:0   },
    tr:{ top:0,   right:0,  transform:"scaleX(-1)" },
    bl:{ bottom:0,left:0,   transform:"scaleY(-1)" },
    br:{ bottom:0,right:0,  transform:"scale(-1,-1)" },
  };
  return (
    <>
      {corners.map(c => (
        <img key={c} src={src} alt="" aria-hidden style={{
          position:"fixed", width:90, height:90, pointerEvents:"none",
          zIndex:99, opacity:0.45, ...transforms[c],
        }}/>
      ))}
    </>
  );
}

// ── Movie Poster Card ─────────────────────────────────────────────────────────
function PosterCard({
  movie, theme, idx, onClick,
}: {
  movie: (typeof MOVIES)[number];
  theme: Theme;
  idx: number;
  onClick: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  const isChaos = theme === "chaos";
  const rotate  = (idx % 2 === 0 ? 1 : -1) * ((idx % 3) + 1); // 1–3 deg

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position:"relative", border:"none", background:"none",
        cursor:"pointer", padding:0,
        transform: hovered ? "scale(1.07) rotate(0deg)" : `rotate(${rotate}deg)`,
        transition:"transform 0.28s cubic-bezier(0.34,1.56,0.64,1)",
        zIndex: hovered ? 10 : 1,
      }}
    >
      {/* §3-B tape strip */}
      <img
        src={isChaos ? A.chaos.tapeRed : A.nostalgia.tapePinkChk}
        alt="" aria-hidden
        style={{
          position:"absolute", top:-9, left:"50%",
          transform:"translateX(-50%) rotate(-3deg)",
          width:52, height:18, objectFit:"cover",
          zIndex:5, opacity:0.85, pointerEvents:"none",
        }}
      />

      {/* Poster body */}
      <div style={{
        width:180, height:260,
        background: isChaos
          ? `linear-gradient(160deg,${movie.hue}33 0%,#0a0a16 100%)`
          : `linear-gradient(160deg,${movie.hue}22 0%,#fdf4e3 100%)`,
        border: isChaos
          ? `2px solid ${movie.hue}66`
          : `2px solid ${movie.hue}44`,
        borderRadius:6,
        boxShadow: hovered
          ? isChaos
            ? `0 0 28px ${movie.hue}88, 0 12px 40px rgba(0,0,0,0.8)`
            : `0 10px 36px rgba(0,0,0,0.28), 0 2px 8px ${movie.hue}44`
          : isChaos
            ? `0 4px 18px rgba(0,0,0,0.6)`
            : `0 4px 16px rgba(0,0,0,0.14)`,
        overflow:"hidden", position:"relative",
        transition:"box-shadow 0.25s ease",
      }}>
        {/* §3-A bg texture at low opacity */}
        <div style={{
          position:"absolute", inset:0, pointerEvents:"none",
          backgroundImage: isChaos
            ? `url('${A.chaos.wigglyLines}')`
            : `url('${A.nostalgia.paperTexture}')`,
          backgroundSize:"cover",
          opacity: isChaos ? 0.08 : 0.28,
          mixBlendMode: isChaos ? "screen" : "multiply",
        }}/>

        {/* Emoji "poster art" */}
        <div style={{
          fontSize:60, lineHeight:1,
          display:"flex", alignItems:"center", justifyContent:"center",
          height:130, position:"relative", zIndex:2,
          filter: hovered ? "drop-shadow(0 0 12px rgba(255,255,255,0.5))" : "none",
          transition:"filter 0.2s",
        }}>{movie.emoji}</div>

        {/* Title block */}
        <div style={{
          position:"absolute", bottom:0, left:0, right:0,
          background: isChaos
            ? "linear-gradient(transparent,rgba(0,0,0,0.92))"
            : "linear-gradient(transparent,rgba(250,240,225,0.97))",
          padding:"18px 12px 12px",
          zIndex:3,
        }}>
          {/* §3-C paint-stroke under title */}
          <div style={{
            position:"relative",
            backgroundImage:`url('${isChaos ? A.chaos.paintSplash : A.nostalgia.paintStroke}')`,
            backgroundSize:"100% 6px", backgroundRepeat:"no-repeat",
            backgroundPosition:"bottom",
            paddingBottom:4, marginBottom:4,
          }}>
            <p style={{
              fontFamily: isChaos ? "var(--font-bungee)" : "var(--font-playfair)",
              fontSize:"0.88rem", color: isChaos ? "#fff" : "#1a0f06",
              margin:0, lineHeight:1.2,
            }}>{movie.title}</p>
          </div>
          <p style={{
            fontFamily:"var(--font-caveat)", fontSize:"0.72rem",
            color: isChaos ? "rgba(255,255,255,0.55)" : "rgba(60,40,20,0.55)",
            margin:0,
          }}>{movie.genre} · {movie.year}</p>
          {movie.isFinale && (
            <span style={{
              display:"inline-block", marginTop:4,
              padding:"1px 7px", borderRadius:3,
              background:"#C0394B", color:"white",
              fontFamily:"var(--font-bungee)", fontSize:"0.52rem",
              letterSpacing:"0.08em",
            }}>FINALE</span>
          )}
        </div>

        {/* Chaos: glitch sticker overlay */}
        {isChaos && hovered && (
          <img src={A.chaos.glitchSticker} alt="" aria-hidden style={{
            position:"absolute", top:8, right:8, width:36,
            opacity:0.7, pointerEvents:"none", zIndex:4,
          }}/>
        )}
      </div>
    </button>
  );
}

// ── MAIN EXPORT ───────────────────────────────────────────────────────────────
export function HomeClient() {
  const [scrollY,        setScrollY]      = useState(0);
  const [theme,          setTheme]        = useState<Theme>("nostalgia");
  const [activeMovie,    setActiveMovie]  = useState<MovieId | null>(null);
  const [showCredits,    setShowCredits]  = useState(false);
  const [dashVisible,    setDashVisible]  = useState(false);

  const isChaos = theme === "chaos";

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", onScroll, { passive:true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.setAttribute("data-theme", theme);
  }, [theme]);

  // Trigger dashboard stagger once desk is visible
  useEffect(() => {
    if (scrollY > window.innerHeight * 0.5) setDashVisible(true);
  }, [scrollY]);

  const vh       = typeof window !== "undefined" ? window.innerHeight : 800;
  const progress = Math.min(scrollY / vh, 1);
  const deskY    = Math.max(0, (1 - progress) * 100);
  const heroOp   = Math.max(0, 1 - progress / 0.3);

  const handleMovieClick = (id: MovieId) => {
    setActiveMovie(id);
  };

  const handleReelClose = (wasFinale: boolean) => {
    setActiveMovie(null);
    if (wasFinale) {
      setTimeout(() => setShowCredits(true), 300);
    }
  };

  const activeMovieData = MOVIES.find(m => m.id === activeMovie) ?? null;

  return (
    <>
      {/* ── HERO FIREWORKS ───────────────────────────────────── */}
      <div style={{
        position:"sticky", top:0, width:"100%", height:"100vh",
        overflow:"hidden", zIndex:0,
      }}>
        <video src="/hero-fireworks.mp4" autoPlay muted loop playsInline style={{
          position:"absolute", inset:0, width:"100%", height:"100%", objectFit:"cover",
        }}/>
        <div style={{
          position:"absolute", inset:0, pointerEvents:"none",
          background:"radial-gradient(ellipse at 50% 60%,transparent 25%,rgba(0,0,0,0.72) 100%)",
        }}/>
        <div style={{
          position:"absolute", inset:0,
          display:"flex", flexDirection:"column", alignItems:"center",
          justifyContent:"center", pointerEvents:"none",
          opacity: heroOp,
        }}>
          <p style={{
            fontFamily:"var(--font-caveat)", color:"rgba(255,255,255,0.55)",
            letterSpacing:"0.5em", textTransform:"uppercase", fontSize:"0.85rem",
            marginBottom:12,
          }}>scroll to watch</p>
          <h1 style={{
            fontFamily: isChaos ? "var(--font-bungee)" : "var(--font-playfair)",
            fontSize:"clamp(2.8rem,8vw,5.5rem)", color:"white",
            textAlign:"center", lineHeight:1.05,
            textShadow:"0 4px 40px rgba(0,0,0,0.55)",
          }}>Banasthali Diaries</h1>
          <p style={{
            fontFamily:"var(--font-caveat)", color:"rgba(255,255,255,0.65)",
            fontSize:"1.4rem", marginTop:10, letterSpacing:"0.15em",
          }}>2022 — 2026</p>
        </div>
      </div>

      {/* ── STREAMING DASHBOARD ──────────────────────────────── */}
      <div style={{
        position:"relative", zIndex:20,
        marginTop:"-100vh",
        transform:`translateY(${deskY}vh)`,
        willChange:"transform",
        transition: deskY === 0 ? "transform 0.18s ease-out" : "none",
        minHeight:"100vh",
        borderRadius:"18px 18px 0 0",
        overflow:"hidden",
        boxShadow:"0 -20px 80px rgba(0,0,0,0.55)",
      }}>
        {/* Dashboard background */}
        <div style={{
          position:"absolute", inset:0,
          background: isChaos
            ? "#0a0a16"
            : "linear-gradient(175deg,#12100e 0%,#1c1410 40%,#0e0c0a 100%)",
        }}/>

        {/* §3-A texture overlay */}
        <div style={{
          position:"absolute", inset:0, pointerEvents:"none",
          backgroundImage: isChaos
            ? `url('${A.chaos.wigglyLines}')`
            : `url('${A.nostalgia.paperTexture}')`,
          backgroundSize:"cover",
          opacity: isChaos ? 0.07 : 0.12,
          mixBlendMode:"screen",
        }}/>

        {/* ── FEATURED BANNER (§3-C my-painting.png as hero) ── */}
        <div style={{
          position:"relative", width:"100%", height:"clamp(260px,38vw,480px)",
          overflow:"hidden",
        }}>
          {/* my-painting.png stretched as cinematic banner */}
          <img src={A.nostalgia.myPainting} alt="Featured" style={{
            width:"100%", height:"100%", objectFit:"cover",
            objectPosition:"center top", filter:"brightness(0.55) saturate(1.2)",
          }}/>
          {/* Cinematic vignette */}
          <div style={{
            position:"absolute", inset:0,
            background:"linear-gradient(to bottom,rgba(0,0,0,0.1) 0%,rgba(0,0,0,0.0) 40%,rgba(10,10,22,1) 100%)",
          }}/>
          {/* §3-B neon-grid-tape on top edge */}
          {isChaos && (
            <img src={A.chaos.neonGridTape} alt="" aria-hidden style={{
              position:"absolute", top:0, left:0, width:"100%",
              height:6, objectFit:"cover", opacity:0.7, pointerEvents:"none",
            }}/>
          )}

          {/* Banner title overlay */}
          <div style={{
            position:"absolute", bottom:32, left:48,
            display:"flex", flexDirection:"column", gap:8,
          }}>
            <span style={{
              fontFamily:"var(--font-caveat)",
              color: isChaos ? "#39ff14" : "#c8a060",
              fontSize:"0.8rem", letterSpacing:"0.35em",
              textTransform:"uppercase",
            }}>
              {isChaos ? "⚡ NOW IN CHAOS" : "✦ Original Series"}
            </span>
            <h2 style={{
              fontFamily: isChaos ? "var(--font-bungee)" : "var(--font-playfair)",
              fontSize:"clamp(2rem,4vw,3.2rem)", color:"white",
              margin:0, textShadow:"0 2px 24px rgba(0,0,0,0.6)",
            }}>Banasthali Diaries</h2>
            <p style={{
              fontFamily:"var(--font-caveat)", color:"rgba(255,255,255,0.65)",
              fontSize:"1rem", margin:0, maxWidth:460,
            }}>
              Four years. Six chapters. One friendship. — 2022–2026
            </p>
          </div>

          {/* §3-D Chaos mode ⚡ toggle in banner corner */}
          <button
            onClick={() => setTheme(t => t === "nostalgia" ? "chaos" : "nostalgia")}
            style={{
              position:"absolute", top:20, right:24,
              background: isChaos
                ? "rgba(57,255,20,0.15)"
                : "rgba(255,255,255,0.1)",
              border: isChaos
                ? "1.5px solid rgba(57,255,20,0.6)"
                : "1.5px solid rgba(255,255,255,0.25)",
              borderRadius:8, padding:"8px 16px",
              color:"white", cursor:"pointer",
              fontFamily:"var(--font-caveat)", fontSize:"1rem",
              backdropFilter:"blur(8px)",
              boxShadow: isChaos ? "0 0 16px rgba(57,255,20,0.4)" : "none",
              transition:"all 0.2s ease",
              zIndex:10,
            }}
          >
            {isChaos ? "✦ Normal Mode" : "⚡ Chaos Mode"}
          </button>
        </div>

        {/* ── MOVIE POSTER ROW ── */}
        <div style={{ padding:"32px 48px 48px", position:"relative", zIndex:5 }}>
          {/* §3-C paint-stroke row heading */}
          <div style={{ marginBottom:28, position:"relative", display:"inline-block" }}>
            <img src={isChaos ? A.chaos.paintSplash : A.nostalgia.paintStroke}
              alt="" aria-hidden style={{
                position:"absolute", bottom:-2, left:0,
                width:"100%", height:8, objectFit:"fill",
                opacity:0.4, pointerEvents:"none",
              }}
            />
            <h3 style={{
              fontFamily: isChaos ? "var(--font-bungee)" : "var(--font-playfair)",
              fontSize:"clamp(1.1rem,2.5vw,1.6rem)",
              color: isChaos ? "#e0e0ff" : "#f5ead8",
              margin:0,
            }}>All Chapters</h3>
          </div>

          {/* Poster grid */}
          <div style={{
            display:"flex", flexWrap:"wrap",
            gap:"2.8rem 2.2rem",
          }}>
            {MOVIES.map((movie, idx) => (
              <div
                key={movie.id}
                style={{
                  opacity: dashVisible ? 1 : 0,
                  transform: dashVisible ? "translateY(0)" : "translateY(28px)",
                  transition:`opacity 0.5s ease ${idx * 0.08}s, transform 0.5s ease ${idx * 0.08}s`,
                }}
              >
                <PosterCard
                  movie={movie}
                  theme={theme}
                  idx={idx}
                  onClick={() => handleMovieClick(movie.id as MovieId)}
                />
              </div>
            ))}
          </div>

          {/* §3-B Nostalgia: dried-flower scattered */}
          {!isChaos && (
            <img src={A.nostalgia.driedFlower} alt="" aria-hidden style={{
              position:"absolute", bottom:40, right:60,
              width:52, height:"auto", transform:"rotate(22deg)",
              opacity:0.45, pointerEvents:"none",
            }}/>
          )}
        </div>

        {/* §3-B Chaos: black-rip bottom */}
        {isChaos && (
          <img src={A.chaos.blackRip} alt="" aria-hidden style={{
            position:"absolute", bottom:0, left:0, width:"100%",
            height:"auto", opacity:0.65, pointerEvents:"none", zIndex:3,
          }}/>
        )}
      </div>

      {/* ── CORNER DECOR ─────────────────────────────────────── */}
      <CornerDecor theme={theme}/>

      {/* ── FILM REEL OVERLAY ────────────────────────────────── */}
      {activeMovieData && (
        <FilmReel
          movie={activeMovieData as typeof MOVIES[number] & { hue: string }}
          theme={theme}
          onClose={(wasFinale) => handleReelClose(wasFinale ?? false)}
        />
      )}

      {/* ── CREDITS ROLL ─────────────────────────────────────── */}
      {showCredits && (
        <CreditsRoll onClose={() => setShowCredits(false)}/>
      )}

      
    </>
  );
}