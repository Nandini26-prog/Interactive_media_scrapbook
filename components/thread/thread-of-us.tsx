"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { supabase } from "../../lib/supabase/client";
import type { MessageRow } from "../../types/messages";
import { StickyNote } from "./sticky-note";
import { useTheme } from "../theme/theme-provider";

export function ThreadOfUs() {
  const { theme } = useTheme();

  const [rows, setRows] = React.useState<MessageRow[] | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let cancelled = false;

    async function run() {
      if (!supabase) {
        setError("Supabase env vars missing.");
        setRows([]);
        return;
      }

      const { data, error } = await supabase
        .from("messages")
        .select("*");

      // Debug: show exact DB payload in browser console
      // eslint-disable-next-line no-console
      console.log("Messages from DB:", data);

      if (cancelled) return;
      if (error) {
        setError(error.message);
        setRows([]);
        return;
      }

      setRows(Array.isArray(data) ? (data as MessageRow[]) : []);
    }

    run();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section id="thread-of-us" className="relative py-20 sm:py-28 overflow-hidden">
      <div className="relative mx-auto w-full max-w-6xl px-4 sm:px-8">
        <motion.h2
          initial={{ opacity: 0, y: 10, rotate: -1 }}
          whileInView={{ opacity: 1, y: 0, rotate: -1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.2, 0.9, 0.2, 1] }}
          className="font-title text-4xl sm:text-6xl tracking-tight"
        >
          Thread of Us
        </motion.h2>
        <div className="mt-3 font-note text-2xl sm:text-3xl text-black/70">
          the wall remembers everything
        </div>

        <div className="mt-10 relative">
          <div className="relative h-[78vh] min-h-[560px] w-full">
            {error ? (
              <div className="absolute inset-0 grid place-items-center p-6">
                <div className="max-w-xl rounded-3xl bg-white/70 border border-black/10 p-6 rotate-[-1deg] shadow-[0_24px_70px_rgba(0,0,0,0.18)]">
                  <div className="font-note text-2xl text-black/80">
                    Couldn’t load the wall.
                  </div>
                  <div className="mt-2 font-mono text-xs text-black/60">
                    {error}
                  </div>
                </div>
              </div>
            ) : rows === null ? (
              <div className="absolute inset-0 grid place-items-center">
                <div className="font-mono text-sm text-black/60">
                  fetching messages…
                </div>
              </div>
            ) : rows.length === 0 ? (
              <div className="absolute inset-0 grid place-items-center p-6">
                <div className="rounded-3xl bg-white/60 border border-black/10 p-6 rotate-[1deg] shadow-[0_24px_70px_rgba(0,0,0,0.18)]">
                  <div className="font-note text-2xl text-black/75">
                    No messages yet. Add some to the `messages` table.
                  </div>
                </div>
              </div>
            ) : (
              <div className="absolute inset-0">
                {rows.map((r, i) => {
                  const id = String(r.id ?? i);
                  const message = (r.content ?? r.message ?? "").trim();
                  const author = (r.author ?? "anonymous").trim();
                  const isChaos = Boolean(r.is_chaos);

                  if (!message) return null;

                  return (
                    <StickyNote
                      key={id}
                      id={id}
                      index={i}
                      message={message}
                      author={author}
                      isChaos={isChaos}
                    />
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

