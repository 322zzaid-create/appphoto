"use client";

import { Directory } from "@capacitor/filesystem";
import { SaveToGallery } from "@/lib/app/save-to-gallery";

const WALLPAPER_DIR = "Wallpapers";

function sanitizeFilename(name: string): string {
  const cleaned = name.replace(/[^\p{L}\p{N}_. -]/gu, "_").trim();
  return (cleaned || "wallpaper").replace(/\.+$/g, "").slice(0, 80) + ".jpg";
}

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result !== "string") {
        reject(new Error("Failed to read file"));
        return;
      }
      resolve(reader.result.split(",")[1] ?? "");
    };
    reader.onerror = () => reject(reader.error ?? new Error("Failed to read file"));
    reader.readAsDataURL(blob);
  });
}

/**
 * Downloads the file (native) and saves it directly to the device gallery via
 * MediaStore. The image is staged in the app cache folder while it is copied
 * into Pictures/Wallpapers, then the temp copy is removed. Returns the gallery
 * item URI.
 */
export async function saveWallpaperToDevice(
  url: string,
  title: string,
  headers?: Record<string, string>,
): Promise<string> {
  const { Filesystem } = await import("@capacitor/filesystem");

  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error("Download failed");
  const blob = await res.blob();
  const base64 = await blobToBase64(blob);

  const filename = sanitizeFilename(title);
  const written = await Filesystem.writeFile({
    path: `${WALLPAPER_DIR}/${filename}`,
    data: base64,
    directory: Directory.Cache,
    recursive: true,
  });

  try {
    const saved = await SaveToGallery.saveImage({
      path: written.uri,
      album: WALLPAPER_DIR,
      mime: blob.type || "image/jpeg",
    });
    return saved.uri;
  } finally {
    await Filesystem.deleteFile({
      path: `${WALLPAPER_DIR}/${filename}`,
      directory: Directory.Cache,
    }).catch(() => {
      /* temp file cleanup is best-effort */
    });
  }
}

/**
 * Web fallback: triggers a real file download through the browser. Falls back
 * to opening the URL directly if the cross-origin fetch is blocked by CORS.
 */
export async function downloadWallpaperWeb(
  url: string,
  filename: string,
  headers?: Record<string, string>,
): Promise<void> {
  try {
    const res = await fetch(url, { headers });
    if (!res.ok) throw new Error("Download failed");
    const blob = await res.blob();
    const objectUrl = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = objectUrl;
    a.download = sanitizeFilename(filename);
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(objectUrl);
  } catch {
    window.location.href = url;
  }
}
