// @ts-nocheck
import { createClient } from "npm:@supabase/supabase-js@2.95.0"

const TARGET = "vanhub-chat-kernel"
const ORIGIN = "https://www.vanhubuk.com"
const TURN_WAIT_MS = 725

function admin() {
  const url = Deno.env.get("SUPABASE_URL") || ""
  let key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || ""
  if (!key) {
    try { key = JSON.parse(Deno.env.get("SUPABASE_SECRET_KEYS") || "{}").default || "" } catch {}
  }
  if (!url || !key) throw new Error("ENV")
  return createClient(url, key, { auth: { persistSession: false } })
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

Deno.serve(async (req) => {
  if (req.method !== "POST") return Response.json({ error: "Method not allowed" }, { status: 405 })
  return Response.json({ target: TARGET, status: "scaffold" })
})
