import { createClient } from "@supabase/supabase-js";

const BUCKET_NAME = "preptrack-data";

function getServiceSupabase() {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error("Missing Supabase URL or Service Role Key in environment.");
  }

  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

/**
 * Checks whether a Supabase database error indicates that the table is missing from schema cache.
 */
export function isSchemaMissingError(err: any): boolean {
  if (!err) return false;
  const msg =
    (err?.message ? String(err.message) : "") +
    (typeof err === "string" ? err : "") +
    (err?.details ? String(err.details) : "") +
    (err?.hint ? String(err.hint) : "");

  return (
    msg.includes("Could not find the table") ||
    msg.includes("schema cache") ||
    msg.includes("PGRST205") ||
    (msg.includes("relation") && msg.includes("does not exist"))
  );
}

/**
 * Read structured JSON from Supabase Storage cloud persistence bucket.
 */
export async function readCloudData<T>(filename: string, defaultValue: T): Promise<T> {
  try {
    const supabase = getServiceSupabase();
    const { data, error } = await supabase.storage.from(BUCKET_NAME).download(filename);

    if (error || !data) {
      return defaultValue;
    }

    const text = await data.text();
    if (!text || text.trim() === "") {
      return defaultValue;
    }

    return JSON.parse(text) as T;
  } catch (e) {
    return defaultValue;
  }
}

/**
 * Write structured JSON to Supabase Storage cloud persistence bucket.
 */
export async function writeCloudData<T>(filename: string, data: T): Promise<boolean> {
  try {
    const supabase = getServiceSupabase();
    const payload = JSON.stringify(data, null, 2);

    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filename, payload, {
        contentType: "application/json",
        upsert: true,
      });

    return !error;
  } catch (e) {
    return false;
  }
}
