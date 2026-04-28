
"use client";

import {
  useEffect,
  useState,
  useCallback,
  useRef,
  type CSSProperties,
} from "react";
import { X, Loader2, AlertTriangle, ImageOff, RefreshCw } from "lucide-react";

const SUPABASE_URL = "https://fjkvnqksolupscjgjwkc.supabase.co";
const BUCKET = "memories";

interface MemoryFile {
  name: string;
  url: string;
  rotate: number;
  /** small random nudge so the grid doesn't look mechanical */
  nudgeX: number;
  nudgeY: number;
}

interface Props {
  folderId: string;
  folderLabel: string;
  isChaosModeActive: boolean;
  onClose: () => void;
}

// ─────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────
function getPublicUrl(folderId: string, fileName: string) {
  return `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${folderId}/${encodeURIComponent(fileName)}`;
}

function rand(min: number, max: number) {
  return Math.round((Math.random() * (max - min) + min) * 10) / 10;
}

function isImageFile(name: string) {
  return /\.(jpe?g|png|gif|webp|avif|svg)$/i.test(name);
}

// ─────────────────────────────────────────────────────────────
// POLAROID CARD
// ─────────────────────────────────────────────────────────────
function PolaroidCard({
  file,
  isChaosModeActive,
}: {
  file: MemoryFile;
  isChaosModeActive: boolean;
}) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const [hovered, setHovered] = useState(false);

  const tapeImg = isChaosModeActive
    ? "/assets/static/chaos/tape-red.png"
    : "/assets/static/nostalgia/tape-pink-soft.png";

  return (
    <div
      style={{
        transform: hovered
          ? `rotate(0deg) scale(1.04) translateY(-4px)`
          : `rotate(${file.rotate}deg) translateX(${file.nudgeX}px) translateY(${file.nudgeY}px)`,
        transition: "transform 0.22s cubic-bezier(0.34,1.56,0.64,1)",
        willChange: "transform",
        zIndex: hovered ? 10 : 1,
        position: "relative",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Polaroid frame */}
      <div
        style={{
          background: "white",
          padding: "9px 9px 30px",
          borderRadius: 3,
          boxShadow: isChaosModeActive
            ? "0 6px 28px rgba(0,0,0,0.72), 0 0 10px rgba(155,89,182,0.25)"
            : "0 3px 16px rgba(0,0,0,0.16), 0 1px 4px rgba(0,0,0,0.08)",
          position: "relative",
        }}
      >
        {/* Tape */}
        <img
          src={tapeImg}
          alt=""
          aria-hidden
          style={{
            position: "absolute",
            top: -9,
            left: "50%",
            transform: "translateX(-50%) rotate(-3deg)",
            width: 48,
            height: 18,
            objectFit: "cover",
            zIndex: 5,
            opacity: 0.85,
          }}
        />

        {/* Photo */}
        <div
          style={{
            width: 190,
            height: 190,
            background: "#f0ece8",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {!loaded && !error && (
            <div
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Loader2
                className="animate-spin"
                size={22}
                color={isChaosModeActive ? "#9b59b6" : "#c8a97e"}
              />
            </div>
          )}
          {error ? (
            <div
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
              }}
            >
              <ImageOff size={22} color="#aaa" />
              <span style={{ fontSize: 10, color: "#aaa" }}>
                couldn't develop
              </span>
            </div>
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={file.url}
              alt={file.name}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                display: loaded ? "block" : "none",
              }}
              onLoad={() => setLoaded(true)}
              onError={() => setError(true)}
            />
          )}
        </div>

        {/* Caption */}
        <p
          style={{
            marginTop: 6,
            textAlign: "center",
            fontFamily: "var(--font-caveat)",
            fontSize: "0.82rem",
            color: "#5a4a3a",
            maxWidth: 190,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
          title={file.name}
        >
          {file.name.replace(/\.[^.]+$/, "")}
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// TORN PAPER DIVIDER
// ─────────────────────────────────────────────────────────────
function TornDivider({ theme }: { theme: "nostalgia" | "chaos" }) {
  const src =
    theme === "chaos"
      ? "/assets/static/chaos/torn-paper-orange.png"
      : "/assets/static/nostalgia/torn-corner.png";
  return (
    <div
      style={{
        width: "100%",
        height: 28,
        backgroundImage: `url('${src}')`,
        backgroundRepeat: "repeat-x",
        backgroundSize: "auto 100%",
        opacity: 0.4,
        margin: "8px 0",
      }}
    />
  );
}

// ─────────────────────────────────────────────────────────────
// MAIN OVERLAY
// ─────────────────────────────────────────────────────────────
export function MemoryOverlay({
  folderId,
  folderLabel,
  isChaosModeActive,
  onClose,
}: Props) {
  const [files, setFiles] = useState<MemoryFile[]>([]);
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [errorMsg, setErrorMsg] = useState("");
  const theme = isChaosModeActive ? "chaos" : "nostalgia";

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  // Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  // Fetch
  const fetchFiles = useCallback(async () => {
    setStatus("loading");
    try {
      const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      if (!anonKey) throw new Error("Missing NEXT_PUBLIC_SUPABASE_ANON_KEY");

      const res = await fetch(
        `${SUPABASE_URL}/storage/v1/object/list/${BUCKET}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${anonKey}`,
            apikey: anonKey,
          },
          body: JSON.stringify({
            prefix: `${folderId}/`,
            limit: 100,
            offset: 0,
            sortBy: { column: "name", order: "asc" },
          }),
        }
      );

      if (!res.ok) {
        const body = await res.text();
        throw new Error(`Supabase ${res.status}: ${body}`);
      }

      const data: { name: string }[] = await res.json();
      const imageFiles = data
        .filter((f) => f.name && isImageFile(f.name))
        .map((f) => ({
          name: f.name,
          url: getPublicUrl(folderId, f.name),
          rotate: rand(-2, 2),
          nudgeX: rand(-5, 5),
          nudgeY: rand(-4, 4),
        }));

      setFiles(imageFiles);
      setStatus("success");
    } catch (err) {
      console.error(err);
      setErrorMsg(err instanceof Error ? err.message : "Unknown error");
      setStatus("error");
    }
  }, [folderId]);

  useEffect(() => { fetchFiles(); }, [fetchFiles]);

  // ─── Styling tokens ───
  const paperBg = isChaosModeActive
    ? "#0a0a16"
    : "radial-gradient(ellipse at 40% 20%, #fffaf3 0%, #f8f0e3 55%, #f0e4d0 100%)";
  const headerBorder = isChaosModeActive
    ? "rgba(155,89,182,0.25)"
    : "rgba(160,120,80,0.22)";
  const headingFont = isChaosModeActive
    ? "var(--font-bungee)"
    : "var(--font-playfair)";
  const labelFont = "var(--font-caveat)";
  const headingColor = isChaosModeActive ? "#e0e0ff" : "#2d1f10";

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 70,
        display: "flex",
        flexDirection: "column",
        background: paperBg,
        animation: "diaryOpen 0.3s cubic-bezier(0.22,1,0.36,1)",
        overflow: "hidden",
      }}
    >
      {/* Paper texture */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: isChaosModeActive
            ? "url('/assets/static/chaos/torn-paper-bg-black.png')"
            : "url('/assets/static/nostalgia/paper-texture-bg.png')",
          backgroundSize: "cover",
          opacity: isChaosModeActive ? 0.18 : 0.45,
          mixBlendMode: isChaosModeActive ? "screen" : "multiply",
          pointerEvents: "none",
        }}
      />

      {/* My painting watermark */}
      <div
        style={{
          position: "absolute",
          bottom: "8%",
          right: "4%",
          width: 180,
          height: 140,
          backgroundImage: "url('/assets/static/nostalgia/my-painting2.png')",
          backgroundSize: "contain",
          backgroundRepeat: "no-repeat",
          opacity: isChaosModeActive ? 0.06 : 0.09,
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      {/* Paint stroke behind title */}
      <div
        style={{
          position: "absolute",
          top: 58,
          left: "50%",
          transform: "translateX(-50%)",
          width: "40%",
          height: 10,
          backgroundImage: "url('/assets/static/nostalgia/paint-stroke.png')",
          backgroundSize: "100% 100%",
          opacity: isChaosModeActive ? 0.25 : 0.35,
          pointerEvents: "none",
        }}
      />

      {/* ── HEADER ── */}
      <div
        style={{
          position: "relative",
          zIndex: 5,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "20px 32px 18px",
          borderBottom: `1px solid ${headerBorder}`,
        }}
      >
        <div>
          <p
            style={{
              fontFamily: labelFont,
              fontSize: "0.78rem",
              color: isChaosModeActive
                ? "rgba(224,224,255,0.42)"
                : "rgba(100,70,40,0.52)",
              letterSpacing: "0.38em",
              textTransform: "uppercase",
              marginBottom: 3,
            }}
          >
            {folderId}
          </p>
          <h2
            style={{
              fontFamily: headingFont,
              fontSize: "clamp(1.4rem,3.5vw,2.3rem)",
              color: headingColor,
              lineHeight: 1.1,
            }}
          >
            {folderLabel}
          </h2>
        </div>

        <button
          onClick={onClose}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "8px 18px",
            borderRadius: 999,
            border: isChaosModeActive
              ? "1px solid rgba(155,89,182,0.45)"
              : "1px solid rgba(160,120,80,0.3)",
            background: isChaosModeActive
              ? "rgba(155,89,182,0.12)"
              : "rgba(255,255,255,0.55)",
            color: headingColor,
            fontFamily: labelFont,
            fontSize: "1rem",
            cursor: "pointer",
            backdropFilter: "blur(4px)",
            boxShadow: isChaosModeActive
              ? "0 0 12px rgba(155,89,182,0.2)"
              : "0 2px 8px rgba(0,0,0,0.1)",
            transition: "transform 0.15s ease",
          }}
          onMouseEnter={(e) =>
            ((e.currentTarget as HTMLElement).style.transform = "scale(1.06)")
          }
          onMouseLeave={(e) =>
            ((e.currentTarget as HTMLElement).style.transform = "scale(1)")
          }
        >
          <X size={14} />
          Close
        </button>
      </div>

      <TornDivider theme={theme} />

      {/* ── CONTENT ── */}
      <div
        style={{
          position: "relative",
          zIndex: 5,
          flex: 1,
          overflowY: "auto",
          padding: "20px 32px 48px",
        }}
      >
        {/* Loading */}
        {status === "loading" && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              height: "55vh",
              gap: 16,
            }}
          >
            <Loader2
              className="animate-spin"
              size={34}
              color={isChaosModeActive ? "#9b59b6" : "#c8a97e"}
            />
            <p
              style={{
                fontFamily: labelFont,
                fontSize: "1.15rem",
                color: isChaosModeActive
                  ? "rgba(224,224,255,0.55)"
                  : "rgba(80,50,20,0.55)",
              }}
            >
              developing memories…
            </p>
          </div>
        )}

        {/* Error */}
        {status === "error" && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              height: "55vh",
              gap: 14,
              textAlign: "center",
            }}
          >
            <AlertTriangle size={32} color="#E05C2A" />
            <p
              style={{
                fontFamily: labelFont,
                fontSize: "1.1rem",
                color: isChaosModeActive ? "#ff6b35" : "#E05C2A",
              }}
            >
              Couldn't open this chapter
            </p>
            <p
              style={{
                fontSize: "0.75rem",
                color: isChaosModeActive
                  ? "rgba(224,224,255,0.4)"
                  : "rgba(80,50,20,0.45)",
                maxWidth: 320,
              }}
            >
              {errorMsg}
            </p>
            <button
              onClick={fetchFiles}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                marginTop: 6,
                padding: "8px 20px",
                borderRadius: 999,
                border: "none",
                background: isChaosModeActive ? "#9b59b6" : "#c8a97e",
                color: "white",
                fontFamily: labelFont,
                fontSize: "1rem",
                cursor: "pointer",
              }}
            >
              <RefreshCw size={14} />
              Try again
            </button>
          </div>
        )}

        {/* Empty */}
        {status === "success" && files.length === 0 && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              height: "55vh",
            }}
          >
            <p
              style={{
                fontFamily: labelFont,
                fontSize: "1.3rem",
                color: isChaosModeActive
                  ? "rgba(224,224,255,0.35)"
                  : "rgba(80,50,20,0.38)",
              }}
            >
              This page is still blank ✦
            </p>
          </div>
        )}

        {/* Gallery */}
        {status === "success" && files.length > 0 && (
          <>
            {/* Count in handwritten note style */}
            <p
              style={{
                fontFamily: labelFont,
                fontSize: "1rem",
                color: isChaosModeActive
                  ? "rgba(224,224,255,0.4)"
                  : "rgba(100,70,40,0.5)",
                textAlign: "center",
                marginBottom: 28,
                fontStyle: "italic",
              }}
            >
              {files.length} {files.length === 1 ? "memory" : "memories"} found
              ✦
            </p>

            {/* Polaroid grid — non-overlapping, gap-5 */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(210px, 1fr))",
                gap: "2rem 1.8rem",
                // Extra vertical padding so rotated cards have breathing room
                padding: "0.5rem 0.25rem",
              }}
            >
              {files.map((file) => (
                <div
                  key={file.name}
                  style={{ display: "flex", justifyContent: "center" }}
                >
                  <PolaroidCard
                    file={file}
                    isChaosModeActive={isChaosModeActive}
                  />
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <style>{`
        @keyframes diaryOpen {
          from { opacity: 0; transform: scale(0.96) translateY(12px); }
          to   { opacity: 1; transform: scale(1)    translateY(0); }
        }
      `}</style>
    </div>
  );
}




// "use client";

// import { useEffect, useState, useCallback, useRef } from "react";
// import { X, Loader2, AlertTriangle, ImageOff } from "lucide-react";

// // FIXED: Using your exact Project URL and Bucket Name
// const SUPABASE_URL = "https://fjkvnqksolupscjgjwkc.supabase.co";
// const BUCKET = "memories"; // Ensuring it's plural as per your URL

// interface MemoryFile {
//   name: string;
//   url: string;
//   rotate: number;
// }

// // ── Helpers ──────────────────────────────────────────────────────────────────

// function getPublicUrl(folderId: string, fileName: string) {
//   // FIXED: Removed encodeURIComponent for the fileName to see if it resolves the 404
//   return `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${folderId}/${fileName}`;
// }

// function randomRotate() {
//   return Math.round((Math.random() * 4 - 2) * 10) / 10;
// }

// function isImage(name: string) {
//   return /\.(jpe?g|png|gif|webp|avif|svg)$/i.test(name);
// }

// // ── Main Overlay ──────────────────────────────────────────────────────────────

// export function MemoryOverlay({
//   folderId,
//   folderLabel,
//   isChaosModeActive,
//   onClose,
// }: {
//   folderId: string;
//   folderLabel: string;
//   isChaosModeActive: boolean;
//   onClose: () => void;
// }) {
//   const [files, setFiles] = useState<MemoryFile[]>([]);
//   const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
//   const [errorMsg, setErrorMsg] = useState("");

//   const fetchFiles = useCallback(async () => {
//     setStatus("loading");
//     try {
//       // FIXED: Using the long JWT key you provided directly to bypass .env issues
//       const anonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZqa3ZucWtzb2x1cHNjamdqd2tjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY3MjczMDUsImV4cCI6MjA5MjMwMzMwNX0.zXsrGghifRiL-LDP1f11TKVTbWuN5m-GfBVAYJiNvZA";

//       const res = await fetch(
//         `${SUPABASE_URL}/storage/v1/object/list/${BUCKET}`,
//         {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//             "Authorization": `Bearer ${anonKey}`,
//             "apikey": anonKey,
//           },
//           body: JSON.stringify({
//             prefix: `${folderId}/`,
//             limit: 100,
//             sortBy: { column: "name", order: "asc" },
//           }),
//         }
//       );

//       if (!res.ok) {
//         const body = await res.text();
//         throw new Error(`Supabase error ${res.status}: ${body}`);
//       }

//       const data = await res.json();
//     //   const data = await res.json();
//         console.log("Folder being searched:", folderId); // Check this in console
//         console.log("Files found in Supabase:", data);   // Check this in console

//       const imageFiles = data
//         .filter((f: any) => f.name && isImage(f.name))
//         .map((f: any) => ({
//           name: f.name,
//           url: getPublicUrl(folderId, f.name),
//           rotate: randomRotate(),
//         }));

//       setFiles(imageFiles);
//       setStatus("success");
//     } catch (err) {
//       console.error("DEBUG ERROR:", err);
//       setErrorMsg(err instanceof Error ? err.message : "Check console for details");
//       setStatus("error");
//     }
//   }, [folderId]);

//   useEffect(() => {
//     fetchFiles();
//   }, [fetchFiles]);

//   return (
//     <div className="fixed inset-0 z-[200] flex flex-col p-4 md:p-8 overflow-hidden" 
//          style={{ background: isChaosModeActive ? "rgba(10,10,25,0.98)" : "rgba(255,250,245,0.98)", backdropFilter: "blur(10px)" }}>
      
//       {/* HEADER */}
//       <div className="flex justify-between items-center mb-8">
//         <div>
//             <h2 className="text-3xl" style={{ fontFamily: isChaosModeActive ? 'var(--font-bungee)' : 'var(--font-playfair)' }}>
//                 {folderLabel}
//             </h2>
//             <p className="opacity-60" style={{ fontFamily: 'var(--font-caveat)' }}>Chapter: {folderId}</p>
//         </div>
//         <button onClick={onClose} className="p-2 hover:bg-black/5 rounded-full"><X /></button>
//       </div>

//       {/* CONTENT */}
//       <div className="flex-1 overflow-y-auto">
//         {status === "loading" && <div className="flex justify-center pt-20"><Loader2 className="animate-spin" /></div>}
        
//         {status === "success" && (
//           <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 pb-20">
//             {files.map((file) => (
//               <div key={file.name} className="flex justify-center" style={{ transform: `rotate(${file.rotate}deg)` }}>
//                 <div className="bg-white p-2 pb-8 shadow-xl rounded-sm">
//                    <img src={file.url} alt="" className="w-48 h-48 object-cover bg-gray-100" onError={(e) => console.log("Failed URL:", file.url)} />
//                    <p className="mt-2 text-center text-xs opacity-50" style={{ fontFamily: 'var(--font-caveat)' }}>{file.name.split('.')[0]}</p>
//                 </div>
//               </div>
//             ))}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }