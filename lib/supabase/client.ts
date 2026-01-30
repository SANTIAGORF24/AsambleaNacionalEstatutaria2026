import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  // Intentar usar variables de entorno primero, luego fallback hardcodeado
  const url =
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    "https://qbqnfsohekrobqbsbont.supabase.co";
  const anonKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY ||
    "sb_publishable_r5mFX8tjYMnOPul95B8leQ_PwfM6EBU";

  console.log("Supabase config:", {
    url: url ? "URL configured" : "URL missing",
    anonKey: anonKey ? "Key configured" : "Key missing",
    fromEnv: !!process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY,
  });

  return createBrowserClient(url, anonKey);
}
