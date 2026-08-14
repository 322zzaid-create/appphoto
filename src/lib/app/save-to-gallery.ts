"use client";

import { registerPlugin } from "@capacitor/core";

export interface SaveImageOptions {
  /** Path (file:// URI) of the image to copy into the gallery. */
  path: string;
  /** Album/folder name under Pictures. Defaults to "Wallpapers". */
  album?: string;
  /** MIME type of the image. Defaults to "image/jpeg". */
  mime?: string;
}

export interface SaveToGalleryPlugin {
  /** Copies the image into the device gallery via MediaStore. Resolves with the gallery item URI. */
  saveImage(options: SaveImageOptions): Promise<{ uri: string }>;
}

export const SaveToGallery = registerPlugin<SaveToGalleryPlugin>("SaveToGallery");
