#!/usr/bin/env node
/**
 * Registers manufactured device serials so customers can pair them.
 * Usage: SUPABASE_SERVICE_ROLE_KEY=... NEXT_PUBLIC_SUPABASE_URL=... \
 *        node scripts/register-serials.mjs serials.csv
 * CSV format (no header): SERIAL,TYPE   e.g.  ELM-A1B2-C3D4,mirror
 * Runs server-side only — never ship the service role key to the browser.
 */
import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

const [file] = process.argv.slice(2);
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!file || !url || !key) {
  console.error("Usage: node scripts/register-serials.mjs <file.csv> (requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY)");
  process.exit(1);
}

const SERIAL = /^EL[MC]-[A-Z0-9]{4}-[A-Z0-9]{4}$/;
const rows = readFileSync(file, "utf8")
  .split(/\r?\n/)
  .map((l) => l.trim())
  .filter(Boolean)
  .map((l) => {
    const [serial, type] = l.split(",").map((s) => s.trim());
    const s = serial.toUpperCase();
    const t = (type || (s.startsWith("ELM") ? "mirror" : "comb")).toLowerCase();
    if (!SERIAL.test(s) || !["mirror", "comb"].includes(t) || (t === "mirror") !== s.startsWith("ELM")) throw new Error(`Invalid row: ${l}`);
    return { serial: s, device_type: t };
  });

const supabase = createClient(url, key, { auth: { persistSession: false } });
for (let i = 0; i < rows.length; i += 500) {
  const { error } = await supabase.from("device_registry").upsert(rows.slice(i, i + 500), { onConflict: "serial", ignoreDuplicates: true });
  if (error) throw error;
}
console.log(`Registered ${rows.length} serial(s).`);
