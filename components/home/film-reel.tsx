"use client";

import {
  useEffect, useState, useRef, useCallback, type CSSProperties,
} from "react";
import { X, Loader2, AlertTriangle, Send, RefreshCw, ImageOff } from "lucide-react";
import type { Theme } from "./home-client";

// ── §3 exact asset paths ───────────────────────────────────────────────────
const A = {
  nostalgia: {
    paperTexture:  "/assets/static/nostalgia/paper-texture-bg.png",
    polaroidTape:  "/assets/static/nostalgia/polaroid-with-tape.png",
    tapePinkSoft:  "/assets/static/nostalgia/tape-pink-soft.png",
    tapePinkChk:   "/assets/static/nostalgia/tape-pink-checked.png",
    paintStroke:   "/assets/static/nostalgia/paint-stroke.png",
    vintageCorner: "/assets/static/nostalgia/vintage-corner.png",
    myPainting2:   "/assets/static/nostalgia/my-painting2.png",
    leftArrow:     "/assets/static/nostalgia/left-arrow.png",
    rightArrow:    "/assets/static/nostalgia/right-arrow.png",
    driedFlower:   "/assets/static/nostalgia/dried-flower.png",
  },
  chaos: {
    wigglyLines:   "/assets/static/chaos/wiggly-lines-bg.png",
    frameNeonGrn:  "/assets/static/chaos/frame-neongreen.png",   // §3-A technical frames
    colorfulPolar: "/assets/static/chaos/colorful-polaroid.png",
    tapeRed:       "/assets/static/chaos/tape-red.png",
    paintSplash:   "/assets/static/chaos/paint-splash-red.png",
    glitchSticker: "/assets/static/chaos/glitch-stickers.png",
    neonGridTape:  "/assets/static/chaos/neon-grid-tape.png",
    sparkle:       "/assets/static/chaos/sparkle-element.png",
    leftArrow:     "/assets/static/chaos/left-arrow.png",
    rightArrow:    "/assets/static/chaos/right-arrow.png",
  },
} as const;

const SUPABASE_URL = "https://fjkvnqksolupscjgjwkc.supabase.co";
const BUCKET       = "memory";

interface MemoryFile {
  name: string;
  url:  string;
  rotate: number;
}

interface Note {
  id:           string;
  image_key:    string;
  author:       string;
  body:          string;
  created_at:   string;
  is_director:  boolean;
}

interface Props {
  movie: {
    id:       string;
    title:    string;
    genre:    string;
    hue:      string;
    isFinale?: boolean;
  };
  theme:   Theme;
  onClose: (wasFinale?: boolean) => void;
}

function rand(min: number, max: number) {
  return Math.round((Math.random() * (max - min) + min) * 10) / 10;
}
function signedRand(min: number, max: number) {
  const v = rand(min, max);
  return Math.random() > 0.5 ? v : -v;
}
function isImageFile(n: string) {
  return /\.(jpe?g|png|gif|webp|avif|svg)$/i.test(n);
}
function getPublicUrl(folderId: string, fileName: string) {
  return `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${folderId}/${encodeURIComponent(fileName)}`;
}
function imageKey(folderId: string, fileName: string) {
  return `${folderId}/${fileName}`;
}

// ── Single Film Frame ──────────────────────────────────────────────────────
function FilmFrame({
  file, idx, isChaos, onClick,
}: {
  file: MemoryFile;
  idx:  number;
  isChaos: boolean;
  onClick: () => void;
}) {
  const [loaded,  setLoaded]  = useState(false);
  const [error,   setError]   = useState(false);
  const [hovered, setHovered] = useState(false);

  // §3-A: nostalgia → polaroid-with-tape, chaos even → frame-neongreen, odd → colorful-polaroid
  const frameImg = isChaos
    ? (idx % 2 === 0 ? A.chaos.frameNeonGrn : A.chaos.colorfulPolar)
    : A.nostalgia.polaroidTape;
  const tapeImg  = isChaos ? A.chaos.tapeRed : A.nostalgia.tapePinkSoft;

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        flex:"0 0 auto",
        transform: hovered
          ? "scale(1.08) rotate(0deg) translateY(-8px)"
          : `rotate(${file.rotate}deg)`,
        transition:"transform 0.25s cubic-bezier(0.34,1.56,0.64,1)",
        cursor:"pointer",
        position:"relative",
        zIndex: hovered ? 10 : 1,
      }}
    >
      {/* Tape */}
      <img src={tapeImg} alt="" aria-hidden style={{
        position:"absolute", top:-8, left:"50%",
        transform:"translateX(-50%) rotate(-2deg)",
        width:50, height:18, objectFit:"cover",
        zIndex:5, opacity:0.88, pointerEvents:"none",
      }}/>

      {/* Polaroid frame wrapper */}
      <div style={{ position:"relative", width:210, height:252 }}>
        <img src={frameImg} alt="" aria-hidden style={{
          position:"absolute", inset:0, width:"100%", height:"100%",
          objectFit:"fill", zIndex:3, pointerEvents:"none",
          filter: isChaos
            ? `drop-shadow(0 0 10px ${hovered ? "#39ff14" : "rgba(57,255,20,0.3)"}) drop-shadow(0 6px 20px rgba(0,0,0,0.7))`
            : `drop-shadow(0 4px 16px rgba(0,0,0,0.22))`,
          transition:"filter 0.2s",
        }}/>

        {/* Photo */}
        <div style={{
          position:"absolute", top:"8%", left:"8%",
          width:"84%", height:"68%", overflow:"hidden", zIndex:2,
          background:"#e8e0d8",
        }}>
          {!loaded && !error && (
            <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center" }}>
              <Loader2 className="animate-spin" size={20} color={isChaos ? "#39ff14" : "#c8a97e"}/>
            </div>
          )}
          {error ? (
            <div style={{ position:"absolute", inset:0, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:4 }}>
              <ImageOff size={18} color="#aaa"/>
              <span style={{ fontSize:9, color:"#aaa" }}>couldn't develop</span>
            </div>
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={file.url} alt={file.name}
              style={{ width:"100%", height:"100%", objectFit:"cover", display: loaded ? "block" : "none" }}
              onLoad={() => setLoaded(true)}
              onError={() => setError(true)}
            />
          )}
        </div>

        {/* Caption */}
        <div style={{
          position:"absolute", bottom:"3%", left:"8%", right:"8%",
          zIndex:4, textAlign:"center",
        }}>
          <p style={{
            fontFamily:"var(--font-caveat)", fontSize:"0.76rem",
            color: isChaos ? "#e0e0ff" : "#3d2b1f",
            margin:0, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis",
          }} title={file.name}>
            {file.name.replace(/\.[^.]+$/, "")}
          </p>
        </div>

        {/* Hover hint */}
        {hovered && (
          <div style={{
            position:"absolute", inset:0, zIndex:6,
            background: isChaos
              ? "rgba(0,0,0,0.5)"
              : "rgba(250,240,225,0.6)",
            display:"flex", alignItems:"center", justifyContent:"center",
            backdropFilter:"blur(2px)",
          }}>
            <span style={{
              fontFamily:"var(--font-caveat)", fontSize:"0.9rem",
              color: isChaos ? "#39ff14" : "#3d2b1f",
            }}>✎ Leave a note</span>
          </div>
        )}
      </div>

      {/* §3-D sparkle on every 4th chaos frame */}
      {isChaos && idx % 4 === 0 && (
        <img src={A.chaos.sparkle} alt="" aria-hidden style={{
          position:"absolute", top:-12, right:-8,
          width:24, opacity:0.75, pointerEvents:"none", zIndex:6,
        }}/>
      )}
    </div>
  );
}

// ── Note Overlay ──────────────────────────────────────────────────────────
// Full paper-texture overlay with director's note + user notes from Supabase
function NoteOverlay({
  file, folderId, isChaos, onClose,
}: {
  file:     MemoryFile;
  folderId: string;
  isChaos:  boolean;
  onClose:  () => void;
}) {
  const [notes,    setNotes]    = useState<Note[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [draft,    setDraft]    = useState("");
  const [author,   setAuthor]   = useState("");
  const [saving,   setSaving]   = useState(false);
  const [saveErr,  setSaveErr]  = useState("");
  const key = imageKey(folderId, file.name);

  const anonKey = typeof process !== "undefined"
    ? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ""
    : "";

  const fetchNotes = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `${SUPABASE_URL}/rest/v1/image_notes?image_key=eq.${encodeURIComponent(key)}&order=created_at.asc`,
        { headers:{ apikey: anonKey, Authorization:`Bearer ${anonKey}`, "Content-Type":"application/json" } }
      );
      if (!res.ok) throw new Error(await res.text());
      setNotes(await res.json());
    } catch { /* silently fail — notes not critical */ }
    finally { setLoading(false); }
  }, [key, anonKey]);

  useEffect(() => { fetchNotes(); }, [fetchNotes]);

  const handleSave = async () => {
    if (!draft.trim() || !author.trim()) return;
    setSaving(true); setSaveErr("");
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/image_notes`, {
        method:"POST",
        headers:{
          apikey: anonKey, Authorization:`Bearer ${anonKey}`,
          "Content-Type":"application/json", Prefer:"return=representation",
        },
        body: JSON.stringify({ image_key: key, author: author.trim(), body: draft.trim(), is_director: false }),
      });
      if (!res.ok) throw new Error(await res.text());
      setDraft(""); await fetchNotes();
    } catch (e) {
      setSaveErr(e instanceof Error ? e.message : "Failed to save");
    } finally { setSaving(false); }
  };

  const bg = isChaos ? "#0a0a16" : "#fffaf0";
  const textColor = isChaos ? "#e0e0ff" : "#2d1f10";

  return (
    <div
      onClick={onClose}
      style={{
        position:"fixed", inset:0, zIndex:100,
        background:"rgba(0,0,0,0.75)",
        display:"flex", alignItems:"center", justifyContent:"center",
        backdropFilter:"blur(6px)",
        animation:"fadeIn 0.2s ease",
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width:"min(92vw,860px)", maxHeight:"88vh",
          display:"flex", gap:0, borderRadius:10,
          overflow:"hidden",
          boxShadow: isChaos
            ? "0 0 50px rgba(57,255,20,0.2), 0 20px 60px rgba(0,0,0,0.9)"
            : "0 20px 60px rgba(0,0,0,0.4)",
          animation:"slideUp 0.3s cubic-bezier(0.22,1,0.36,1)",
        }}
      >
        {/* Left: zoomed image */}
        <div style={{
          width:"44%", flexShrink:0, position:"relative", overflow:"hidden",
        }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={file.url} alt={file.name}
            style={{ width:"100%", height:"100%", objectFit:"cover" }}
          />
          <div style={{
            position:"absolute", inset:0,
            background: isChaos
              ? "linear-gradient(to right,transparent 70%,#0a0a16)"
              : "linear-gradient(to right,transparent 70%,#fffaf0)",
          }}/>
        </div>

        {/* Right: paper note */}
        <div style={{
          flex:1, background: bg, overflowY:"auto", position:"relative",
        }}>
          {/* §3-A paper-texture-bg.png at low opacity */}
          <div style={{
            position:"absolute", inset:0, pointerEvents:"none",
            backgroundImage:`url('${A.nostalgia.paperTexture}')`,
            backgroundSize:"cover",
            opacity: isChaos ? 0.07 : 0.45,
            mixBlendMode: isChaos ? "screen" : "multiply",
          }}/>

          {/* §3-B tape corners on the note */}
          {!isChaos && (
            <>
              <img src={A.nostalgia.tapePinkChk} alt="" aria-hidden style={{
                position:"absolute", top:10, left:16, width:40, height:14,
                objectFit:"cover", transform:"rotate(-18deg)",
                opacity:0.75, pointerEvents:"none", zIndex:2,
              }}/>
              <img src={A.nostalgia.tapePinkChk} alt="" aria-hidden style={{
                position:"absolute", top:10, right:16, width:40, height:14,
                objectFit:"cover", transform:"rotate(18deg)",
                opacity:0.75, pointerEvents:"none", zIndex:2,
              }}/>
            </>
          )}
          {isChaos && (
            <img src={A.chaos.neonGridTape} alt="" aria-hidden style={{
              position:"absolute", top:0, left:0, width:"100%",
              height:5, objectFit:"cover", opacity:0.6, pointerEvents:"none", zIndex:2,
            }}/>
          )}

          <div style={{ padding:"28px 28px 24px", position:"relative", zIndex:3 }}>
            {/* Close */}
            <button onClick={onClose} style={{
              position:"absolute", top:12, right:12,
              background:"none", border:"none", cursor:"pointer",
              color: isChaos ? "rgba(224,224,255,0.5)" : "rgba(60,40,20,0.5)",
              padding:4,
            }}>
              <X size={18}/>
            </button>

            {/* Image name */}
            <p style={{
              fontFamily:"var(--font-caveat)",
              fontSize:"0.72rem", letterSpacing:"0.3em", textTransform:"uppercase",
              color: isChaos ? "rgba(224,224,255,0.38)" : "rgba(100,70,40,0.45)",
              marginBottom:6,
            }}>{file.name.replace(/\.[^.]+$/, "")}</p>

            {/* §3-C paint-stroke under heading */}
            <div style={{
              position:"relative", display:"inline-block", marginBottom:18,
              backgroundImage:`url('${isChaos ? A.chaos.paintSplash : A.nostalgia.paintStroke}')`,
              backgroundSize:"100% 7px", backgroundRepeat:"no-repeat",
              backgroundPosition:"bottom", paddingBottom:5,
            }}>
              <h3 style={{
                fontFamily: isChaos ? "var(--font-bungee)" : "var(--font-playfair)",
                fontSize:"1.2rem", color: textColor, margin:0,
              }}>Director's Commentary</h3>
            </div>

            {/* Notes list */}
            {loading ? (
              <div style={{ display:"flex", justifyContent:"center", padding:"16px 0" }}>
                <Loader2 className="animate-spin" size={20} color={isChaos ? "#39ff14" : "#c8a97e"}/>
              </div>
            ) : notes.length === 0 ? (
              <p style={{
                fontFamily:"var(--font-caveat)", fontSize:"0.95rem",
                color: isChaos ? "rgba(224,224,255,0.35)" : "rgba(100,70,40,0.4)",
                fontStyle:"italic",
              }}>No notes yet. Be the first ✦</p>
            ) : (
              <div style={{ display:"flex", flexDirection:"column", gap:12, marginBottom:20 }}>
                {notes.map(note => (
                  <div key={note.id} style={{
                    background: note.is_director
                      ? (isChaos ? "rgba(57,255,20,0.08)" : "rgba(200,169,126,0.15)")
                      : (isChaos ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.5)"),
                    border: note.is_director
                      ? `1px solid ${isChaos ? "rgba(57,255,20,0.3)" : "rgba(200,169,126,0.4)"}`
                      : `1px solid ${isChaos ? "rgba(255,255,255,0.08)" : "rgba(180,140,100,0.2)"}`,
                    borderRadius:6, padding:"10px 14px",
                    transform:`rotate(${signedRand(0.3,1)}deg)`,
                  }}>
                    <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                      <span style={{
                        fontFamily:"var(--font-caveat)", fontSize:"0.8rem",
                        color: note.is_director
                          ? (isChaos ? "#39ff14" : "#8B6240")
                          : (isChaos ? "rgba(224,224,255,0.5)" : "rgba(100,70,40,0.5)"),
                        fontWeight: note.is_director ? 700 : 400,
                      }}>
                        {note.is_director ? "🎬 Director" : note.author}
                      </span>
                      <span style={{
                        fontFamily:"var(--font-caveat)", fontSize:"0.68rem",
                        color: isChaos ? "rgba(224,224,255,0.25)" : "rgba(100,70,40,0.3)",
                      }}>
                        {new Date(note.created_at).toLocaleDateString("en-IN",{ day:"numeric", month:"short" })}
                      </span>
                    </div>
                    <p style={{
                      fontFamily:"var(--font-caveat)", fontSize:"0.95rem",
                      color: textColor, margin:0, lineHeight:1.45,
                    }}>{note.body}</p>
                  </div>
                ))}
              </div>
            )}

            {/* ── Leave a note ── */}
            <div style={{
              borderTop:`1px solid ${isChaos ? "rgba(255,255,255,0.08)" : "rgba(160,120,80,0.18)"}`,
              paddingTop:16, marginTop:4,
            }}>
              <p style={{
                fontFamily:"var(--font-caveat)", fontSize:"0.85rem",
                color: isChaos ? "rgba(224,224,255,0.5)" : "rgba(100,70,40,0.5)",
                marginBottom:10,
              }}>Leave your note ✎</p>

              <input
                value={author}
                onChange={e => setAuthor(e.target.value)}
                placeholder="Your name…"
                style={{
                  width:"100%", boxSizing:"border-box",
                  background: isChaos ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.7)",
                  border: `1px solid ${isChaos ? "rgba(57,255,20,0.25)" : "rgba(160,120,80,0.3)"}`,
                  borderRadius:6, padding:"8px 12px",
                  fontFamily:"var(--font-caveat)", fontSize:"0.9rem",
                  color: textColor, outline:"none", marginBottom:8,
                }}
              />
              <textarea
                value={draft}
                onChange={e => setDraft(e.target.value)}
                rows={3}
                placeholder="Write something here…"
                style={{
                  width:"100%", boxSizing:"border-box",
                  background: isChaos ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.7)",
                  border: `1px solid ${isChaos ? "rgba(57,255,20,0.25)" : "rgba(160,120,80,0.3)"}`,
                  borderRadius:6, padding:"8px 12px", resize:"vertical",
                  fontFamily:"var(--font-caveat)", fontSize:"0.9rem",
                  color: textColor, outline:"none", marginBottom:10,
                }}
              />
              {saveErr && (
                <p style={{ fontFamily:"var(--font-caveat)", fontSize:"0.8rem", color:"#E05C2A", marginBottom:6 }}>
                  {saveErr}
                </p>
              )}
              <button
                onClick={handleSave}
                disabled={saving || !draft.trim() || !author.trim()}
                style={{
                  display:"flex", alignItems:"center", gap:6,
                  padding:"8px 20px", borderRadius:999, border:"none",
                  background: isChaos ? "#39ff14" : "#c8a97e",
                  color: isChaos ? "#0a0a16" : "white",
                  fontFamily:"var(--font-caveat)", fontSize:"1rem",
                  cursor: saving ? "wait" : "pointer",
                  opacity: (!draft.trim() || !author.trim()) ? 0.5 : 1,
                  transition:"opacity 0.2s",
                }}
              >
                {saving ? <Loader2 className="animate-spin" size={14}/> : <Send size={14}/>}
                {saving ? "Saving…" : "Paste it in"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── FILM REEL ──────────────────────────────────────────────────────────────
export function FilmReel({ movie, theme, onClose }: Props) {
  const [files,      setFiles]      = useState<MemoryFile[]>([]);
  const [status,     setStatus]     = useState<"loading"|"success"|"error">("loading");
  const [errorMsg,   setErrorMsg]   = useState("");
  const [activeFile, setActiveFile] = useState<MemoryFile | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const isChaos   = theme === "chaos";

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  // Escape
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (activeFile) setActiveFile(null);
        else onClose(movie.isFinale);
      }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose, movie.isFinale, activeFile]);

  const fetchFiles = useCallback(async () => {
    setStatus("loading");
    try {
      const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
      const res = await fetch(`${SUPABASE_URL}/storage/v1/object/list/memory`, {
        method:"POST",
        headers:{
          "Content-Type":"application/json",
          Authorization:`Bearer ${anonKey}`, apikey: anonKey,
        },
        body: JSON.stringify({
          prefix:`${movie.id}/`, limit:200, offset:0,
          sortBy:{ column:"name", order:"asc" },
        }),
      });
      if (!res.ok) throw new Error(`${res.status}: ${await res.text()}`);
      const data: { name: string }[] = await res.json();
      setFiles(data.filter(f => f.name && isImageFile(f.name)).map(f => ({
        name:   f.name,
        url:    getPublicUrl(movie.id, f.name),
        rotate: signedRand(1, 4),
      })));
      setStatus("success");
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Unknown error");
      setStatus("error");
    }
  }, [movie.id]);

  useEffect(() => { fetchFiles(); }, [fetchFiles]);

  // §3-D arrow nav: scroll the reel
  const scroll = (dir: "left" | "right") => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({ left: dir === "right" ? 340 : -340, behavior:"smooth" });
  };

  // CSS film-strip speed: chaos = 18s, nostalgia = 40s
  const reelSpeed   = isChaos ? "18s" : "40s";
  const bgTex       = isChaos ? A.chaos.wigglyLines : A.nostalgia.paperTexture;
  const headingFont = isChaos ? "var(--font-bungee)" : "var(--font-playfair)";
  const textColor   = "#f5ead8";

  return (
    <div style={{
      position:"fixed", inset:0, zIndex:80,
      background: isChaos ? "#070710" : "#100d0a",
      display:"flex", flexDirection:"column",
      animation:"fadeIn 0.3s ease",
    }}>
      {/* §3-A bg texture */}
      <div style={{
        position:"absolute", inset:0, pointerEvents:"none",
        backgroundImage:`url('${bgTex}')`, backgroundSize:"cover",
        opacity: isChaos ? 0.07 : 0.12, mixBlendMode:"screen",
      }}/>

      {/* §3-B Chaos neon-grid-tape top strip */}
      {isChaos && (
        <img src={A.chaos.neonGridTape} alt="" aria-hidden style={{
          position:"absolute", top:0, left:0, width:"100%",
          height:5, objectFit:"cover", opacity:0.75, pointerEvents:"none",
        }}/>
      )}

      {/* ── HEADER ── */}
      <div style={{
        padding:"20px 36px 16px",
        display:"flex", alignItems:"center", justifyContent:"space-between",
        borderBottom:`1px solid ${isChaos ? "rgba(57,255,20,0.15)" : "rgba(255,255,255,0.08)"}`,
        position:"relative", zIndex:5, flexShrink:0,
      }}>
        <div>
          <p style={{
            fontFamily:"var(--font-caveat)",
            color: isChaos ? "rgba(57,255,20,0.6)" : "rgba(245,234,216,0.4)",
            letterSpacing:"0.38em", textTransform:"uppercase",
            fontSize:"0.72rem", marginBottom:3,
          }}>{movie.genre}</p>
          <div style={{ position:"relative", display:"inline-block" }}>
            <img src={isChaos ? A.chaos.paintSplash : A.nostalgia.paintStroke}
              alt="" aria-hidden style={{
                position:"absolute", bottom:-2, left:0,
                width:"100%", height:7, objectFit:"fill",
                opacity:0.4, pointerEvents:"none",
              }}/>
            <h2 style={{
              fontFamily: headingFont,
              fontSize:"clamp(1.4rem,3vw,2.2rem)",
              color: textColor, margin:0,
            }}>{movie.title}</h2>
          </div>
        </div>

        <button onClick={() => onClose(movie.isFinale)} style={{
          display:"flex", alignItems:"center", gap:6,
          padding:"8px 20px", borderRadius:999,
          border: isChaos
            ? "1.5px solid rgba(57,255,20,0.4)"
            : "1.5px solid rgba(245,234,216,0.2)",
          background: isChaos ? "rgba(57,255,20,0.1)" : "rgba(255,255,255,0.06)",
          color: textColor, fontFamily:"var(--font-caveat)", fontSize:"1rem",
          cursor:"pointer", backdropFilter:"blur(4px)",
          transition:"transform 0.15s ease",
        }}
          onMouseEnter={e => ((e.currentTarget as HTMLElement).style.transform="scale(1.06)")}
          onMouseLeave={e => ((e.currentTarget as HTMLElement).style.transform="scale(1)")}
        >
          <X size={14}/>
          {movie.isFinale ? "Roll Credits" : "Close"}
        </button>
      </div>

      {/* ── FILM STRIP EDGE HOLES ── */}
      <FilmHoles isChaos={isChaos}/>

      {/* ── CONTENT ── */}
      <div style={{ flex:1, display:"flex", alignItems:"center", overflow:"hidden", position:"relative", zIndex:5 }}>

        {/* §3-D left arrow nav */}
        <button onClick={() => scroll("left")} style={{
          flexShrink:0, background:"none", border:"none", cursor:"pointer",
          padding:"0 12px", zIndex:10,
        }}>
          <img src={isChaos ? A.chaos.leftArrow : A.nostalgia.leftArrow}
            alt="Previous" style={{
              width:40, height:"auto",
              filter: isChaos ? "brightness(1.8) hue-rotate(90deg)" : "invert(1) opacity(0.65)",
            }}/>
        </button>

        {/* Loading */}
        {status === "loading" && (
          <div style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:16 }}>
            <Loader2 className="animate-spin" size={36} color={isChaos ? "#39ff14" : "#c8a97e"}/>
            <p style={{ fontFamily:"var(--font-caveat)", fontSize:"1.15rem", color:"rgba(245,234,216,0.55)" }}>
              developing the reel…
            </p>
          </div>
        )}

        {/* Error */}
        {status === "error" && (
          <div style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:12 }}>
            <AlertTriangle size={32} color="#E05C2A"/>
            <p style={{ fontFamily:"var(--font-caveat)", color:"#E05C2A", fontSize:"1.1rem" }}>Reel jammed</p>
            <p style={{ fontFamily:"var(--font-caveat)", fontSize:"0.75rem", color:"rgba(245,234,216,0.35)", maxWidth:320, textAlign:"center" }}>{errorMsg}</p>
            <button onClick={fetchFiles} style={{
              display:"flex", alignItems:"center", gap:6, padding:"8px 18px",
              borderRadius:999, border:"none",
              background: isChaos ? "#39ff14" : "#c8a97e",
              color: isChaos ? "#0a0a16" : "white",
              fontFamily:"var(--font-caveat)", fontSize:"1rem", cursor:"pointer",
            }}>
              <RefreshCw size={14}/> Rewind
            </button>
          </div>
        )}

        {/* Empty */}
        {status === "success" && files.length === 0 && (
          <div style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center" }}>
            <p style={{ fontFamily:"var(--font-caveat)", fontSize:"1.3rem", color:"rgba(245,234,216,0.35)" }}>
              This reel is blank ✦
            </p>
          </div>
        )}

        {/* ── THE FILM REEL ── */}
        {status === "success" && files.length > 0 && (
          <div
            ref={scrollRef}
            style={{
              flex:1, display:"flex", alignItems:"center",
              overflowX:"auto", overflowY:"visible",
              gap:"3.5rem", padding:"30px 40px",
              scrollbarWidth:"none",
              // Chaos: CSS auto-scroll animation
              ...(isChaos ? {} : {}),
            }}
          >
            {files.map((file, idx) => (
              <FilmFrame
                key={file.name}
                file={file}
                idx={idx}
                isChaos={isChaos}
                onClick={() => setActiveFile(file)}
              />
            ))}

            {/* Finale end-card in 06_letter */}
            {movie.isFinale && (
              <div style={{
                flex:"0 0 auto", display:"flex", flexDirection:"column",
                alignItems:"center", justifyContent:"center",
                width:240, height:240,
                border:`2px solid ${isChaos ? "rgba(57,255,20,0.4)" : "rgba(245,234,216,0.2)"}`,
                borderRadius:8,
                background: isChaos ? "rgba(57,255,20,0.07)" : "rgba(245,234,216,0.07)",
                cursor:"pointer", gap:12,
              }}
                onClick={() => onClose(true)}
              >
                <span style={{ fontSize:48 }}>🎬</span>
                <p style={{
                  fontFamily: headingFont,
                  fontSize:"0.95rem", color: textColor,
                  textAlign:"center", lineHeight:1.3,
                }}>Roll the Credits</p>
              </div>
            )}
          </div>
        )}

        {/* §3-D right arrow nav */}
        <button onClick={() => scroll("right")} style={{
          flexShrink:0, background:"none", border:"none", cursor:"pointer",
          padding:"0 12px", zIndex:10,
        }}>
          <img src={isChaos ? A.chaos.rightArrow : A.nostalgia.rightArrow}
            alt="Next" style={{
              width:40, height:"auto",
              filter: isChaos ? "brightness(1.8) hue-rotate(90deg)" : "invert(1) opacity(0.65)",
            }}/>
        </button>
      </div>

      {/* Film strip bottom holes */}
      <FilmHoles isChaos={isChaos}/>

      {/* Frame count */}
      {status === "success" && (
        <div style={{
          textAlign:"center", padding:"10px 0 16px",
          fontFamily:"var(--font-caveat)", fontSize:"0.85rem",
          color:"rgba(245,234,216,0.3)", position:"relative", zIndex:5, flexShrink:0,
        }}>
          {files.length} frame{files.length !== 1 ? "s" : ""} · click any to leave a note
        </div>
      )}

      {/* ── NOTE OVERLAY ── */}
      {activeFile && (
        <NoteOverlay
          file={activeFile}
          folderId={movie.id}
          isChaos={isChaos}
          onClose={() => setActiveFile(null)}
        />
      )}

      <style>{`
        @keyframes fadeIn  { from{opacity:0} to{opacity:1} }
        @keyframes slideUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:none} }
        div::-webkit-scrollbar { display:none; }
      `}</style>
    </div>
  );
}

// ── Film strip edge holes (purely decorative CSS) ──────────────────────────
function FilmHoles({ isChaos }: { isChaos: boolean }) {
  const holeColor = isChaos ? "rgba(57,255,20,0.25)" : "rgba(255,255,255,0.1)";
  const holes = Array.from({ length: 20 });
  return (
    <div style={{
      display:"flex", alignItems:"center",
      padding:"4px 16px", gap:"1.8vw",
      flexShrink:0, position:"relative", zIndex:5,
    }}>
      {holes.map((_,i) => (
        <div key={i} style={{
          width:14, height:10, borderRadius:3,
          background: holeColor,
          flex:"0 0 auto",
        }}/>
      ))}
    </div>
  );
}