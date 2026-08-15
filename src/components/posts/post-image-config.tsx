"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { CATEGORIES, DEVICE_TYPE_OPTIONS } from "@/lib/constants";
import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export interface PostImageConfigData {
  title: string;
  description: string;
  categories: string[];
  tags: string;
  device_type: string;
}

const deviceOptions = DEVICE_TYPE_OPTIONS.filter((o) => o.value !== "all");
const categoryOptions = CATEGORIES.map((c) => ({ name: c.name, slug: c.slug }));

interface PostImageConfigProps {
  open: boolean;
  imagePreview: string;
  imageName: string;
  initial?: PostImageConfigData | null;
  onSave: (data: PostImageConfigData) => void;
  onClose: () => void;
}

export function PostImageConfig({
  open,
  imagePreview,
  imageName,
  initial,
  onSave,
  onClose,
}: PostImageConfigProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [categories, setCategories] = useState<string[]>([]);
  const [tags, setTags] = useState("");
  const [deviceType, setDeviceType] = useState("phone");

  // Populate the fields whenever the modal opens for a given image.
  const [prevOpen, setPrevOpen] = useState(open);
  if (open && !prevOpen) {
    setPrevOpen(true);
    setTitle(initial?.title ?? "");
    setDescription(initial?.description ?? "");
    setCategories(initial?.categories ?? []);
    setTags(initial?.tags ?? "");
    setDeviceType(initial?.device_type ?? "phone");
  } else if (!open && prevOpen) {
    setPrevOpen(false);
  }

  const handleSave = () => {
    if (!title.trim() || categories.length === 0) return;
    onSave({
      title: title.trim(),
      description: description.trim(),
      categories,
      tags: tags.trim(),
      device_type: deviceType,
    });
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[70] flex items-end justify-center sm:items-center sm:p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, y: 48, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 48, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 300, damping: 28 }}
            className="relative w-full max-h-[92vh] overflow-y-auto rounded-t-3xl border border-white/10 bg-[#0a0a0f]/95 shadow-2xl backdrop-blur-2xl sm:max-w-2xl sm:rounded-2xl"
          >
            <button
              onClick={onClose}
              className="absolute right-4 top-4 z-10 rounded-lg p-1.5 text-white/40 transition-colors hover:bg-white/10 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="border-b border-white/10 px-6 py-4">
              <h3 className="text-lg font-semibold text-white">Image Details</h3>
            </div>

            <div className="space-y-4 px-6 py-4">
              <div className="flex items-center gap-4">
                <img
                  src={imagePreview}
                  alt={imageName}
                  className="h-20 w-20 shrink-0 rounded-xl object-cover ring-1 ring-white/10"
                />
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-white">
                    {imageName}
                  </p>
                  <p className="mt-0.5 text-xs text-white/40">
                    Private metadata for this image. It will not appear in the
                    post.
                  </p>
                </div>
              </div>

              <Input
                label="Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Image title"
              />

              <div>
                <label className="mb-1.5 block text-sm font-medium text-white/80">
                  Description{" "}
                  <span className="text-white/30">(optional)</span>
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Optional description"
                  rows={3}
                  className="h-24 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/30 backdrop-blur-xl transition-all focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 hover:border-white/20"
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
                  Category
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {categoryOptions.map((cat) => (
                    <button
                      key={cat.slug}
                      onClick={() =>
                        setCategories((prev) =>
                          prev.includes(cat.slug)
                            ? prev.filter((c) => c !== cat.slug)
                            : [...prev, cat.slug],
                        )
                      }
                      className={cn(
                        "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                        categories.includes(cat.slug)
                          ? "border-purple-500/50 bg-purple-500/20 text-purple-300"
                          : "border-white/10 bg-white/5 text-white/50 hover:border-white/20",
                      )}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
                {categories.length === 0 && (
                  <p className="mt-1.5 text-xs text-red-400">
                    Select at least one category
                  </p>
                )}
              </div>

              <Input
                label="Tags"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="nature, landscape, 4k (comma separated)"
              />
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-white/10 px-6 py-4">
              <Button variant="ghost" onClick={onClose}>
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={!title.trim() || categories.length === 0}
              >
                <Check className="h-4 w-4" />
                Save Details
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
