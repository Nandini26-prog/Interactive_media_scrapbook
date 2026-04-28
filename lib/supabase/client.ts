"use client";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

function normalizeSupabaseUrl(raw: string) {
  // Some users paste the PostgREST endpoint (…/rest/v1/). supabase-js expects the project URL.
  return raw.replace(/\/rest\/v1\/?$/i, "");
}

const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

declare global {
  // eslint-disable-next-line no-var
  var __prestigeSupabase: SupabaseClient | null | undefined;
}

function getSingleton() {
  if (!rawUrl || !anonKey) return null;
  if (globalThis.__prestigeSupabase) return globalThis.__prestigeSupabase;
  globalThis.__prestigeSupabase = createClient(normalizeSupabaseUrl(rawUrl), anonKey);
  return globalThis.__prestigeSupabase;
}

export const supabase = getSingleton();

