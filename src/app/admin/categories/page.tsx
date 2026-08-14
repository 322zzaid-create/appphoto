"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal, ModalHeader, ModalContent, ModalFooter } from "@/components/ui/modal";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { slugify } from "@/lib/utils";
import { toast } from "@/lib/utils/toast";
import type { Category } from "@/types";

export default function AdminCategoriesPage() {
  const supabase = createClient();
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState("#8b5cf6");

  const { data: categories = [], isLoading } = useQuery({
    queryKey: ["admin-categories"],
    queryFn: async (): Promise<Category[]> => {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("display_order", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        name,
        slug: slug || slugify(name),
        description: description || null,
        color,
      };
      if (editingId) {
        const { error } = await supabase.from("categories").update(payload).eq("id", editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("categories").insert({
          ...payload,
          display_order: categories.length,
          is_active: true,
        });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
      toast.success(editingId ? "Category updated" : "Category created");
      setShowModal(false);
      resetForm();
    },
    onError: () => toast.error("Failed to save category"),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("categories").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
      toast.success("Category deleted");
    },
  });

  const resetForm = () => {
    setName("");
    setSlug("");
    setDescription("");
    setColor("#8b5cf6");
    setEditingId(null);
  };

  const openEdit = (cat: Category) => {
    setEditingId(cat.id);
    setName(cat.name);
    setSlug(cat.slug);
    setDescription(cat.description || "");
    setColor(cat.color || "#8b5cf6");
    setShowModal(true);
  };

  return (
    <div>
      <PageHeader
        title="Categories"
        description="Manage wallpaper categories"
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Categories", href: "/admin/categories" },
        ]}
        actions={
          <Button
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
          >
            <Plus className="mr-1.5 h-4 w-4" />
            Add Category
          </Button>
        }
      />

      {isLoading ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-2xl bg-white/5" />
          ))}
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="glass-card flex items-center justify-between p-4"
            >
              <div className="flex items-center gap-3">
                <div
                  className="h-10 w-10 shrink-0 rounded-xl"
                  style={{ backgroundColor: cat.color || "#8b5cf6" }}
                />
                <div>
                  <p className="font-medium text-white">{cat.name}</p>
                  <p className="text-xs text-white/40">
                    {cat.wallpaper_count} wallpapers · {cat.slug}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => openEdit(cat)}
                  className="rounded-lg p-1.5 text-white/40 hover:bg-white/10 hover:text-white"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  onClick={() => {
                    if (confirm("Delete this category?")) {
                      deleteMutation.mutate(cat.id);
                    }
                  }}
                  className="rounded-lg p-1.5 text-white/40 hover:bg-red-500/10 hover:text-red-400"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={showModal} onClose={() => setShowModal(false)} size="sm">
        <ModalHeader>
          <h2 className="text-lg font-bold text-white">
            {editingId ? "Edit Category" : "New Category"}
          </h2>
        </ModalHeader>
        <ModalContent className="space-y-4">
          <Input
            label="Name"
            placeholder="Category name"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (!editingId) setSlug(slugify(e.target.value));
            }}
          />
          <Input
            label="Slug"
            placeholder="category-slug"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
          />
          <Input
            label="Description"
            placeholder="Optional description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <div>
            <label className="mb-1.5 block text-sm font-medium text-white/80">Color</label>
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="h-10 w-full cursor-pointer rounded-xl border border-white/10 bg-white/5"
            />
          </div>
        </ModalContent>
        <ModalFooter>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
          <Button onClick={() => saveMutation.mutate()} loading={saveMutation.isPending}>
            {editingId ? "Save Changes" : "Create"}
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
