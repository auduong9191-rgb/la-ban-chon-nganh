import "server-only";
import { randomUUID } from "crypto";
import { supabaseAdmin, PRODUCT_IMAGES_BUCKET } from "@/lib/supabase";

function sanitizeFileName(name: string): string {
  return name.replace(/[^a-zA-Z0-9.\-_]/g, "_");
}

export async function uploadImages(files: File[]): Promise<string[]> {
  if (!supabaseAdmin) throw new Error("Supabase chưa được cấu hình");

  const urls: string[] = [];
  for (const file of files) {
    const path = `${randomUUID()}-${sanitizeFileName(file.name)}`;
    const buffer = Buffer.from(await file.arrayBuffer());
    const { error } = await supabaseAdmin.storage
      .from(PRODUCT_IMAGES_BUCKET)
      .upload(path, buffer, { contentType: file.type || "application/octet-stream" });
    if (error) throw new Error(error.message);

    const { data } = supabaseAdmin.storage.from(PRODUCT_IMAGES_BUCKET).getPublicUrl(path);
    urls.push(data.publicUrl);
  }
  return urls;
}

export async function deleteImageByUrl(url: string): Promise<void> {
  if (!supabaseAdmin) return;
  const marker = `/${PRODUCT_IMAGES_BUCKET}/`;
  const idx = url.indexOf(marker);
  if (idx === -1) return;
  const path = url.slice(idx + marker.length);
  await supabaseAdmin.storage.from(PRODUCT_IMAGES_BUCKET).remove([path]);
}
