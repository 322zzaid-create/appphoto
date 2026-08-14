"use client";

import { useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ImagePlus, Save, Loader2, X } from "lucide-react";
import { toast } from "@/lib/utils/toast";
import type { Profile } from "@/types";

interface StudioProfileSettingsProps {
  user: Profile;
  studioName: string | null;
  studioDescription: string | null;
  studioAvatarUrl: string | null;
  open: boolean;
  onClose: () => void;
}

export function StudioProfileSettings({
  user,
  studioName,
  studioDescription,
  studioAvatarUrl,
  open,
  onClose,
}: StudioProfileSettingsProps) {
  const supabase = createClient();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState(studioName || "");
  const [description, setDescription] = useState(studioDescription || "");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(studioAvatarUrl);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["studio", user.id] });
    queryClient.invalidateQueries({ queryKey: ["profile", user.id] });
  };

  async function handleAvatarChange(file: File) {
    if (!file) return;

    const fileExt = file.name.split(".").pop() || "png";
    const fileName = `${user.id}/studio-avatar.${fileExt}`;

    setUploading(true);
    try {
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(fileName, file, { upsert: true });
      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("avatars")
        .getPublicUrl(fileName);

      const { error: updateError } = await supabase
        .from("profiles")
        .update({ studio_avatar_url: urlData.publicUrl, updated_at: new Date().toISOString() })
        .eq("id", user.id);
      if (updateError) throw updateError;

      setAvatarUrl(urlData.publicUrl);
      invalidate();
      toast.success("Studio avatar updated");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Upload failed";
      toast.error(message);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function handleSave() {
    if (!name.trim()) {
      toast.error("Studio name is required");
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          studio_name: name.trim(),
          studio_description: description.trim(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);
      if (error) throw error;

      invalidate();
      toast.success("Studio profile saved");
      onClose();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to save";
      toast.error(message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/70 backdrop-blur-xl"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, y: 48, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 48, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 300, damping: 28 }}
            className="relative w-full max-w-md overflow-y-auto rounded-2xl border border-white/10 bg-[#0a0a0f]/95 shadow-2xl backdrop-blur-2xl max-h-[85vh] p-5"
          >
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white">Edit Studio Profile</h3>
                <p className="mt-0.5 text-xs text-white/40">
                  Shown on your public studio page
                </p>
              </div>
              <button
                onClick={onClose}
                className="rounded-lg p-1.5 text-white/40 transition-colors hover:bg-white/10 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="group relative"
                disabled={uploading}
                aria-label="Upload studio avatar"
              >
                <div className="overflow-hidden rounded-2xl">
                  <Avatar
                    src={avatarUrl}
                    name={name || user.username}
                    size="xl"
                  />
                </div>
                <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-black/60 opacity-0 transition-opacity group-hover:opacity-100">
                  {uploading ? (
                    <Loader2 className="h-5 w-5 animate-spin text-white" />
                  ) : (
                    <ImagePlus className="h-5 w-5 text-white" />
                  )}
                </div>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleAvatarChange(file);
                }}
              />
              <div>
                <p className="text-sm font-medium text-white">Studio Avatar</p>
                <p className="mt-1 text-xs text-white/40">
                  Click to upload. JPEG, PNG, WebP or GIF (max 5MB).
                </p>
                <Button
                  variant="secondary"
                  size="sm"
                  className="mt-2"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                >
                  {uploading ? "Uploading..." : "Change Photo"}
                </Button>
              </div>
            </div>

            <div className="mt-5 space-y-4">
              <Input
                label="Studio Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your studio name"
              />
              <div>
                <label className="mb-1.5 block text-sm font-medium text-white/80">Description <span className="text-white/30">(optional)</span></label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Tell visitors what your studio is about..."
                  rows={4}
                  maxLength={500}
                  className="flex w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/30 backdrop-blur-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 hover:border-white/20"
                />
                <p className="mt-1 text-right text-[11px] text-white/30">{description.length}/500</p>
              </div>
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <Button variant="ghost" onClick={onClose}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
