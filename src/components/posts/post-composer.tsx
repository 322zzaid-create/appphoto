"use client";

import { useCallback, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Modal, ModalHeader, ModalContent, ModalFooter } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/hooks/useAuth";
import { useSettings } from "@/lib/hooks/useSettings";
import { postService } from "@/lib/services/post.service";
import { toast } from "@/lib/utils/toast";
import {
  PostImageConfig,
  type PostImageConfigData,
} from "@/components/posts/post-image-config";
import {
  Upload,
  X,
  CheckCircle2,
  Loader2,
  Pencil,
  ImagePlus,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface DraftImage {
  file: File;
  preview: string;
  config: PostImageConfigData | null;
}

interface PostComposerProps {
  open: boolean;
  onClose: () => void;
}

export function PostComposer({ open, onClose }: PostComposerProps) {
  const { user } = useAuth();
  const { autoApproveUploads } = useSettings();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [caption, setCaption] = useState("");
  const [images, setImages] = useState<DraftImage[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [configIndex, setConfigIndex] = useState<number | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);

  // Reset the form every time the composer opens.
  const [prevOpen, setPrevOpen] = useState(open);
  if (open && !prevOpen) {
    setPrevOpen(true);
    setCaption("");
    setImages([]);
    setConfigIndex(null);
    setIsPublishing(false);
  } else if (!open && prevOpen) {
    setPrevOpen(false);
  }

  const addFiles = useCallback((files: FileList | File[]) => {
    const newImages: DraftImage[] = Array.from(files)
      .filter((f) => f.type.startsWith("image/"))
      .map((file) => ({
        file,
        preview: URL.createObjectURL(file),
        config: null,
      }));
    setImages((prev) => [...prev, ...newImages]);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      addFiles(e.dataTransfer.files);
    },
    [addFiles],
  );

  const removeImage = useCallback((index: number) => {
    setImages((prev) => {
      const file = prev[index];
      URL.revokeObjectURL(file.preview);
      return prev.filter((_, i) => i !== index);
    });
  }, []);

  const saveConfig = useCallback((index: number, data: PostImageConfigData) => {
    setImages((prev) =>
      prev.map((img, i) => (i === index ? { ...img, config: data } : img)),
    );
  }, []);

  const allConfigured = images.length > 0 && images.every((img) => !!img.config);

  const handlePublish = async () => {
    if (!user || !allConfigured) return;
    setIsPublishing(true);
    const result = await postService.createPost({
      userId: user.id,
      caption,
      images: images.map((img) => ({
        file: img.file,
        title: img.config!.title,
        description: img.config!.description,
        categories: img.config!.categories,
        tags: img.config!.tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
        device_type: img.config!.device_type,
      })),
      autoApprove: autoApproveUploads,
    });
    setIsPublishing(false);

    if (result.success) {
      toast.success(autoApproveUploads ? "Post published!" : "Post submitted");
      queryClient.invalidateQueries({ queryKey: ["posts-feed"] });
      onClose();
    } else {
      toast.error(result.error || "Failed to publish post");
    }
  };

  const configuredCount = images.filter((img) => !!img.config).length;

  return (
    <>
      <Modal open={open} onClose={onClose} size="lg">
        <ModalHeader>
          <h3 className="text-lg font-semibold text-white">New Post</h3>
        </ModalHeader>
        <ModalContent className="space-y-5">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-white/80">
              Details
            </label>
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Write something about your post..."
              rows={3}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/30 backdrop-blur-xl transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 hover:border-white/20"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-white/80">
              Images
            </label>
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={cn(
                "flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 transition-colors",
                dragOver
                  ? "border-blue-500/50 bg-blue-500/5"
                  : "border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04]",
              )}
            >
              <ImagePlus className="mb-3 h-8 w-8 text-white/20" />
              <p className="text-sm font-medium text-white/60">
                Drag & drop images here
              </p>
              <p className="mt-1 text-xs text-white/30">
                or click to browse (PNG, JPG, WebP)
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => e.target.files && addFiles(e.target.files)}
              />
            </div>
          </div>

          {images.length > 0 && (
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <p className="text-xs text-white/40">
                  Configure each image before publishing —{" "}
                  <span className="text-white/70">{configuredCount}/{images.length}</span>{" "}
                  ready
                </p>
              </div>
              <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-4">
                {images.map((img, i) => (
                  <div
                    key={i}
                    className={cn(
                      "group relative overflow-hidden rounded-xl ring-1 transition-all",
                      img.config
                        ? "ring-emerald-500/50"
                        : "ring-red-500/40",
                    )}
                  >
                    <div className="aspect-square w-full">
                      <img
                        src={img.preview}
                        alt={img.file.name}
                        className="h-full w-full object-cover"
                      />
                    </div>

                    <div className="absolute inset-x-0 top-0 flex items-center justify-between bg-gradient-to-b from-black/70 to-transparent p-1.5">
                      {img.config ? (
                        <span className="flex items-center gap-1 rounded-full bg-emerald-500/90 px-2 py-0.5 text-[10px] font-bold text-white">
                          <CheckCircle2 className="h-2.5 w-2.5" />
                          Ready
                        </span>
                      ) : (
                        <span className="rounded-full bg-red-500/90 px-2 py-0.5 text-[10px] font-bold text-white">
                          Needs info
                        </span>
                      )}
                      <button
                        onClick={() => removeImage(i)}
                        aria-label="Remove image"
                        className="rounded-full bg-black/50 p-1 text-white/70 transition-colors hover:bg-red-500/80 hover:text-white"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>

                    <button
                      onClick={() => setConfigIndex(i)}
                      className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-1.5 bg-gradient-to-t from-black/80 to-transparent p-2 pt-6 text-[11px] font-semibold text-white transition-colors hover:from-black/90"
                    >
                      <Pencil className="h-3 w-3" />
                      {img.config ? "Edit details" : "Add details"}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </ModalContent>
        <ModalFooter className="flex-col-reverse gap-3 sm:flex-row">
          {images.length > 0 && !allConfigured && (
            <p className="text-xs text-white/40">
              Every image needs its details set before the post can be published.
            </p>
          )}
          <div className="flex w-full gap-3 sm:w-auto">
            <Button
              variant="ghost"
              onClick={onClose}
              disabled={isPublishing}
              className="flex-1 sm:flex-none"
            >
              Cancel
            </Button>
            <Button
              onClick={() => void handlePublish()}
              disabled={!allConfigured || isPublishing}
              className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 shadow-blue-500/25 hover:shadow-blue-500/40 sm:flex-none"
            >
              {isPublishing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Upload className="h-4 w-4" />
              )}
              {isPublishing ? "Publishing..." : "Publish Post"}
            </Button>
          </div>
        </ModalFooter>
      </Modal>

      {configIndex !== null && images[configIndex] && (
        <PostImageConfig
          open={configIndex !== null}
          imagePreview={images[configIndex].preview}
          imageName={images[configIndex].file.name}
          initial={images[configIndex].config}
          onSave={(data) => saveConfig(configIndex, data)}
          onClose={() => setConfigIndex(null)}
        />
      )}
    </>
  );
}
