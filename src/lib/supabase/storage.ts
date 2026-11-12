import "server-only";
import { createAdminClient } from "./admin";

export const STORAGE_BUCKET = "preptrack-private";

export type StorageFolder = "materials" | "question-papers" | "imports" | "images";

export interface UploadResult {
  success: boolean;
  path?: string;
  fullPath?: string;
  error?: string;
}

export interface SignedUrlResult {
  success: boolean;
  signedUrl?: string;
  error?: string;
}

/**
 * Ensures the private Supabase Storage bucket exists.
 */
export async function ensureStorageBucket(): Promise<boolean> {
  try {
    const supabase = createAdminClient();
    const { data: buckets, error: listErr } = await supabase.storage.listBuckets();
    if (listErr) {
      console.error("[Storage] Failed to list buckets:", listErr.message);
      return false;
    }

    const exists = buckets.some((b) => b.name === STORAGE_BUCKET);
    if (!exists) {
      const { error: createErr } = await supabase.storage.createBucket(STORAGE_BUCKET, {
        public: false,
        fileSizeLimit: 52428800, // 50MB
        allowedMimeTypes: [
          "application/pdf",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "text/csv",
          "text/plain",
          "image/png",
          "image/jpeg",
          "image/jpg",
        ],
      });
      if (createErr) {
        console.error("[Storage] Failed to create private bucket:", createErr.message);
        return false;
      }
    }
    return true;
  } catch (err: any) {
    console.error("[Storage] Bucket initialization error:", err?.message || err);
    return false;
  }
}

/**
 * Uploads a file to the owner-scoped directory inside the private bucket:
 * <owner-id>/<folder>/<timestamp>-<sanitized-filename>
 */
export async function uploadOwnerFile(
  ownerId: string,
  folder: StorageFolder,
  fileBuffer: Buffer | Uint8Array,
  fileName: string,
  contentType: string
): Promise<UploadResult> {
  try {
    await ensureStorageBucket();
    const supabase = createAdminClient();

    const sanitizedName = fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
    const filePath = `${ownerId}/${folder}/${Date.now()}-${sanitizedName}`;

    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(filePath, fileBuffer, {
        contentType,
        upsert: false,
      });

    if (error) {
      console.error("[Storage] Upload failed:", error.message);
      return { success: false, error: `Storage upload error: ${error.message}` };
    }

    return {
      success: true,
      path: data.path,
      fullPath: `${STORAGE_BUCKET}/${data.path}`,
    };
  } catch (err: any) {
    console.error("[Storage] Unexpected upload exception:", err);
    return { success: false, error: `Storage upload exception: ${err?.message || "Unknown error"}` };
  }
}

/**
 * Generates a short-lived signed URL for authorized access to an owner-scoped file.
 */
export async function getOwnerFileSignedUrl(
  ownerId: string,
  filePath: string,
  expiresInSeconds: number = 3600
): Promise<SignedUrlResult> {
  try {
    // Security check: ensure filePath starts with ownerId
    if (!filePath.startsWith(`${ownerId}/`) && !filePath.startsWith(`${STORAGE_BUCKET}/${ownerId}/`)) {
      return { success: false, error: "Unauthorized file access: path outside owner boundary." };
    }

    const cleanPath = filePath.replace(`${STORAGE_BUCKET}/`, "");
    const supabase = createAdminClient();

    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .createSignedUrl(cleanPath, expiresInSeconds);

    if (error || !data?.signedUrl) {
      return { success: false, error: `Signed URL generation failed: ${error?.message || "Unknown error"}` };
    }

    return { success: true, signedUrl: data.signedUrl };
  } catch (err: any) {
    return { success: false, error: `Signed URL exception: ${err?.message || "Unknown error"}` };
  }
}

/**
 * Downloads the binary contents of an owner-scoped file from Supabase Storage.
 */
export async function downloadOwnerFile(
  ownerId: string,
  filePath: string
): Promise<{ success: boolean; data?: Buffer; error?: string }> {
  try {
    if (!filePath.startsWith(`${ownerId}/`) && !filePath.startsWith(`${STORAGE_BUCKET}/${ownerId}/`)) {
      return { success: false, error: "Unauthorized file download: path outside owner boundary." };
    }

    const cleanPath = filePath.replace(`${STORAGE_BUCKET}/`, "");
    const supabase = createAdminClient();

    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .download(cleanPath);

    if (error || !data) {
      return { success: false, error: `Storage download failed: ${error?.message || "Unknown error"}` };
    }

    const arrayBuffer = await data.arrayBuffer();
    return { success: true, data: Buffer.from(arrayBuffer) };
  } catch (err: any) {
    return { success: false, error: `Storage download exception: ${err?.message || "Unknown error"}` };
  }
}

/**
 * Deletes an owner-scoped file from Supabase Storage.
 */
export async function deleteOwnerFile(
  ownerId: string,
  filePath: string
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!filePath.startsWith(`${ownerId}/`) && !filePath.startsWith(`${STORAGE_BUCKET}/${ownerId}/`)) {
      return { success: false, error: "Unauthorized file deletion: path outside owner boundary." };
    }

    const cleanPath = filePath.replace(`${STORAGE_BUCKET}/`, "");
    const supabase = createAdminClient();

    const { error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .remove([cleanPath]);

    if (error) {
      return { success: false, error: `Storage delete failed: ${error.message}` };
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: `Storage delete exception: ${err?.message || "Unknown error"}` };
  }
}
