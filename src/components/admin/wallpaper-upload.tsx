"use client";

import { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils/cn";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { CATEGORIES, DEVICE_TYPE_OPTIONS } from "@/lib/constants";
import { uploadService } from "@/lib/services/upload.service";
import { useAuth } from "@/lib/hooks/useAuth";
import { useSettings } from "@/lib/hooks/useSettings";
import {
  Upload,
  X,
  CheckCircle2,
  Loader2,
  AlertCircle,
  RotateCcw,
} from "lucide-react";
import { toast } from "@/lib/utils/toast";

interface UploadFile {
  file: File;
  preview: string;
  progress: number;
  status: "pending" | "uploading" | "processing" | "done" | "error";
  error?: string;
  wallpaperUrl?: string;
}

const deviceOptions = DEVICE_TYPE_OPTIONS.filter((o) => o.value !== "all");

const categoryOptions = CATEGORIES.map((c) => ({ label: c.name, value: c.slug }));

interface WallpaperUploadProps {
  onComplete?: () => void;
  className?: string;
}

export function WallpaperUpload({ onComplete, className }: WallpaperUploadProps) {
  const { user } = useAuth();
  const { autoApproveUploads } = useSettings();
  const [step, setStep] = useState(1);
  const [uploads, setUploads] = useState<UploadFile[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [categories, setCategories] = useState<string[]>([]);
  const [tags, setTags] = useState("");
  const [deviceType, setDeviceType] = useState("phone");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadComplete, setUploadComplete] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const addFiles = useCallback((files: FileList | File[]) => {
    const newUploads: UploadFile[] = Array.from(files)
      .filter((f) => f.type.startsWith("image/"))
      .map((file) => ({
        file,
        preview: URL.createObjectURL(file),
        progress: 0,
        status: "pending" as const,
      }));
    setUploads((prev) => [...prev, ...newUploads]);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      addFiles(e.dataTransfer.files);
    },
    [addFiles],
  );

  const removeFile = useCallback((index: number) => {
    setUploads((prev) => {
      const file = prev[index];
      URL.revokeObjectURL(file.preview);
      return prev.filter((_, i) => i !== index);
    });
  }, []);

  const updateUpload = (index: number, updates: Partial<UploadFile>) => {
    setUploads((prev) =>
      prev.map((u, i) => (i === index ? { ...u, ...updates } : u)),
    );
  };

  const handleUpload = async () => {
    if (!user) {
      toast.error("You must be logged in");
      return;
    }

    if (!title.trim()) {
      toast.error("Title is required");
      return;
    }

    setIsUploading(true);
    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < uploads.length; i++) {
      const upload = uploads[i];
      if (upload.status === "done") {
        successCount++;
        continue;
      }

      updateUpload(i, { status: "uploading", progress: 0, error: undefined });

      try {
        // Upload file to storage
        const { url: previewUrl, error: uploadError } =
          await uploadService.uploadWallpaper(upload.file, user.id, (progress) => {
            updateUpload(i, { progress });
          });

        if (uploadError) {
          updateUpload(i, {
            status: "error",
            error: uploadError,
          });
          failCount++;
          continue;
        }

        // Get image dimensions
        const dims = await uploadService.getImageDimensions(upload.file);

        // Create thumbnail (use same URL for now)
        const { url: thumbUrl } = await uploadService.uploadThumbnail(upload.file, user.id);

        // Create database record
        const result = await uploadService.createWallpaperRecord({
          title,
          description,
          categories,
          tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
          device_type: deviceType,
          preview_url: previewUrl,
          thumbnail_url: thumbUrl || previewUrl,
          original_url: previewUrl,
          file_size: upload.file.size,
          width: dims.width,
          height: dims.height,
          uploader_id: user.id,
          status: autoApproveUploads ? "published" : "draft",
        });

        if (!result.success) {
          updateUpload(i, {
            status: "error",
            error: result.error || "Failed to save record",
          });
          failCount++;
          continue;
        }

        updateUpload(i, { status: "done", progress: 100, wallpaperUrl: previewUrl });
        successCount++;
      } catch (err) {
        updateUpload(i, {
          status: "error",
          error: err instanceof Error ? err.message : "Unexpected error",
        });
        failCount++;
      }
    }

    setIsUploading(false);

    if (failCount === 0 && successCount > 0) {
      setUploadComplete(true);
      toast.success(
        autoApproveUploads
          ? `${successCount} wallpaper(s) uploaded successfully!`
          : `${successCount} wallpaper(s) uploaded. Pending admin review.`,
      );
      setTimeout(() => {
        onComplete?.();
      }, 1500);
    } else if (failCount > 0 && successCount > 0) {
      toast.success(`${successCount} uploaded, ${failCount} failed`);
    } else if (failCount > 0) {
      toast.error(`All ${failCount} upload(s) failed`);
    }
  };

  const retryFailed = async () => {
    setUploads((prev) =>
      prev.map((u) =>
        u.status === "error"
          ? { ...u, status: "pending", progress: 0, error: undefined }
          : u,
      ),
    );
    setUploadComplete(false);
    setIsUploading(false);
  };

  const overallProgress =
    uploads.length > 0
      ? Math.round(uploads.reduce((sum, u) => sum + u.progress, 0) / uploads.length)
      : 0;

  const statusIcon = (status: UploadFile["status"]) => {
    switch (status) {
      case "uploading":
        return <Loader2 className="h-4 w-4 animate-spin text-purple-400" />;
      case "done":
        return <CheckCircle2 className="h-4 w-4 text-green-400" />;
      case "error":
        return <AlertCircle className="h-4 w-4 text-red-400" />;
      default:
        return null;
    }
  };

  if (uploadComplete) {
    return (
      <div className="flex flex-col items-center py-12">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-green-500/10">
          <CheckCircle2 className="h-8 w-8 text-green-400" />
        </div>
        <h3 className="text-lg font-bold text-white">Upload Complete!</h3>
        <p className="mt-1 text-sm text-white/40">
          {autoApproveUploads
            ? "Your wallpapers have been uploaded successfully."
            : "Your wallpapers are now pending admin review."}
        </p>
      </div>
    );
  }

  return (
    <div className={cn("mx-auto max-w-2xl space-y-6", className)}>
      {/* Step indicators */}
      <div className="flex items-center gap-2">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center gap-2">
            <div
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-colors",
                step >= s
                  ? "bg-purple-500/20 text-purple-400"
                  : "bg-white/5 text-white/30",
              )}
            >
              {step > s ? <CheckCircle2 className="h-4 w-4" /> : s}
            </div>
            {s < 3 && (
              <div
                className={cn(
                  "h-0.5 w-16 rounded-full transition-colors",
                  step > s ? "bg-purple-500/30" : "bg-white/10",
                )}
              />
            )}
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* Step 1: Select files */}
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={cn(
                "flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-12 transition-colors",
                dragOver
                  ? "border-purple-500/50 bg-purple-500/5"
                  : "border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04]",
              )}
            >
              <Upload className="mb-4 h-10 w-10 text-white/20" />
              <p className="text-sm font-medium text-white/60">
                Drag & drop wallpapers here
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

            {uploads.length > 0 && (
              <div className="space-y-2">
                {uploads.map((upload, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-3"
                  >
                    <img
                      src={upload.preview}
                      alt=""
                      className="h-12 w-12 shrink-0 rounded-lg object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm text-white/80">
                        {upload.file.name}
                      </p>
                      <p className="text-[11px] text-white/30">
                        {(upload.file.size / 1024 / 1024).toFixed(1)} MB
                      </p>
                    </div>
                    {statusIcon(upload.status)}
                    <button
                      onClick={() => removeFile(i)}
                      className="shrink-0 rounded-lg p-1.5 text-white/30 hover:bg-white/10 hover:text-white"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-end">
              <Button onClick={() => setStep(2)} disabled={uploads.length === 0}>
                Next
              </Button>
            </div>
          </motion.div>
        )}

        {/* Step 2: Details */}
        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <Input
              label="Title"
              placeholder="Wallpaper title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <div>
              <label className="mb-1.5 block text-sm font-medium text-white/80">
                Description <span className="text-white/30">(optional)</span>
              </label>
              <textarea
                placeholder="Describe your wallpaper..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="h-24 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/30 backdrop-blur-xl transition-all focus:outline-none focus:ring-2 focus:ring-purple-500/50"
              />
            </div>
            <Select
              label="Device Type"
              options={deviceOptions}
              value={deviceType}
              onChange={setDeviceType}
            />
            <div>
              <label className="mb-2 block text-sm font-medium text-white/80">
                Categories
              </label>
              <div className="flex flex-wrap gap-1.5">
                {categoryOptions.map((cat) => (
                  <button
                    key={cat.value}
                    onClick={() =>
                      setCategories((prev) =>
                        prev.includes(cat.value)
                          ? prev.filter((c) => c !== cat.value)
                          : [...prev, cat.value],
                      )
                    }
                    className={cn(
                      "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                      categories.includes(cat.value)
                        ? "border-purple-500/50 bg-purple-500/20 text-purple-300"
                        : "border-white/10 bg-white/5 text-white/50 hover:border-white/20",
                    )}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>
            <Input
              label="Tags"
              placeholder="nature, landscape, 4k (comma separated)"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
            />
            <div className="flex justify-between">
              <Button variant="ghost" onClick={() => setStep(1)}>
                Back
              </Button>
              <Button onClick={() => setStep(3)}>Next</Button>
            </div>
          </motion.div>
        )}

        {/* Step 3: Review & Upload */}
        {step === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <h3 className="mb-4 text-sm font-semibold text-white">
                Review & Upload
              </h3>
              <div className="grid grid-cols-3 gap-3">
                {uploads.map((u, i) => (
                  <div key={i} className="relative overflow-hidden rounded-xl">
                    <img
                      src={u.preview}
                      alt=""
                      className="aspect-video w-full object-cover"
                    />
                    {/* Progress overlay */}
                    {u.status === "uploading" && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                        <div className="text-center">
                          <Loader2 className="mx-auto mb-1 h-6 w-6 animate-spin text-purple-400" />
                          <span className="text-xs font-bold text-white">
                            {u.progress}%
                          </span>
                        </div>
                      </div>
                    )}
                    {u.status === "done" && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                        <CheckCircle2 className="h-8 w-8 text-green-400" />
                      </div>
                    )}
                    {u.status === "error" && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-900/60 p-2">
                        <AlertCircle className="mb-1 h-6 w-6 text-red-400" />
                        <span className="text-center text-[10px] text-red-300 line-clamp-2">
                          {u.error}
                        </span>
                      </div>
                    )}
                    {/* Progress bar at bottom */}
                    {u.status === "uploading" && (
                      <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10">
                        <div
                          className="h-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-300"
                          style={{ width: `${u.progress}%` }}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="mt-4 space-y-2 text-sm">
                <p className="text-white/60">
                  <span className="text-white/40">Title:</span>{" "}
                  {title || "Untitled"}
                </p>
                <p className="text-white/60">
                  <span className="text-white/40">Device:</span> {deviceType}
                </p>
                <p className="text-white/60">
                  <span className="text-white/40">Categories:</span>{" "}
                  {categories.join(", ") || "None"}
                </p>
                <p className="text-white/60">
                  <span className="text-white/40">Files:</span> {uploads.length}
                </p>
              </div>

              {/* Overall progress */}
              {isUploading && (
                <div className="mt-4">
                  <div className="flex items-center justify-between text-xs text-white/40">
                    <span>Uploading...</span>
                    <span>{overallProgress}%</span>
                  </div>
                  <div className="mt-1 h-2 overflow-hidden rounded-full bg-white/5">
                    <motion.div
                      className="h-full bg-gradient-to-r from-purple-500 to-blue-500"
                      initial={{ width: 0 }}
                      animate={{ width: `${overallProgress}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-between">
              <Button variant="ghost" onClick={() => setStep(2)} disabled={isUploading}>
                Back
              </Button>
              {uploads.some((u) => u.status === "error") && !isUploading ? (
                <Button onClick={retryFailed} variant="secondary">
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Retry Failed
                </Button>
              ) : (
                <Button
                  onClick={handleUpload}
                  disabled={isUploading}
                >
                  {isUploading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Upload className="mr-2 h-4 w-4" />
                  )}
                  {isUploading
                    ? `Uploading ${uploads.filter((u) => u.status === "uploading").length}...`
                    : `Upload ${uploads.length} ${uploads.length === 1 ? "file" : "files"}`}
                </Button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
