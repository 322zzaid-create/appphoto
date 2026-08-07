"use client";

import { useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "./useAuth";

export function useLikes() {
  const { user } = useAuth();
  const supabase = createClient();
  const queryClient = useQueryClient();

  const { data: likedIds = [] } = useQuery({
    queryKey: ["likedIds", user?.id],
    queryFn: async (): Promise<string[]> => {
      if (!user) return [];
      const { data } = await supabase
        .from("likes")
        .select("wallpaper_id")
        .eq("user_id", user.id);
      return data?.map((l) => l.wallpaper_id) ?? [];
    },
    enabled: !!user,
    staleTime: 30 * 1000,
  });

  const addLike = useMutation({
    mutationFn: async (wallpaperId: string) => {
      if (!user) throw new Error("Not authenticated");
      const { error } = await supabase.from("likes").insert({
        user_id: user.id,
        wallpaper_id: wallpaperId,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["likedIds", user?.id] });
      queryClient.invalidateQueries({ queryKey: ["wallpapers"] });
      queryClient.invalidateQueries({ queryKey: ["wallpaper"] });
    },
  });

  const removeLike = useMutation({
    mutationFn: async (wallpaperId: string) => {
      if (!user) throw new Error("Not authenticated");
      const { error } = await supabase
        .from("likes")
        .delete()
        .eq("user_id", user.id)
        .eq("wallpaper_id", wallpaperId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["likedIds", user?.id] });
      queryClient.invalidateQueries({ queryKey: ["wallpapers"] });
      queryClient.invalidateQueries({ queryKey: ["wallpaper"] });
    },
  });

  const toggleLike = useCallback(
    (wallpaperId: string) => {
      if (likedIds.includes(wallpaperId)) {
        removeLike.mutate(wallpaperId);
      } else {
        addLike.mutate(wallpaperId);
      }
    },
    [likedIds, addLike, removeLike],
  );

  const isLiked = useCallback(
    (wallpaperId: string) => likedIds.includes(wallpaperId),
    [likedIds],
  );

  return {
    likedIds,
    addLike,
    removeLike,
    toggleLike,
    isLiked,
  };
}
