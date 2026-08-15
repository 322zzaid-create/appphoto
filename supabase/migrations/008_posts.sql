-- Migration: 008_posts
-- Description: Adds a Threads-style posts feed. Approved studios can publish
-- multi-image posts. Every post image is ALSO stored as its own wallpaper
-- record (with its own category/tags) so it appears across the app.

-- ============================================================
-- 1. posts
-- ============================================================
CREATE TABLE public.posts (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    caption     TEXT NOT NULL DEFAULT '',
    like_count  BIGINT NOT NULL DEFAULT 0,
    save_count  BIGINT NOT NULL DEFAULT 0,
    image_count INTEGER NOT NULL DEFAULT 0,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.posts
    IS 'Threads-style posts published by approved studios.';

-- ============================================================
-- 2. post_images (links a post to its individual wallpaper records)
-- ============================================================
CREATE TABLE public.post_images (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id      UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
    wallpaper_id UUID NOT NULL REFERENCES public.wallpapers(id) ON DELETE CASCADE,
    position     INTEGER NOT NULL DEFAULT 0,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (post_id, wallpaper_id)
);

COMMENT ON TABLE public.post_images
    IS 'Ordered images of a post. Each wallpaper_id is a full wallpaper record.';

-- ============================================================
-- 3. post_likes
-- ============================================================
CREATE TABLE public.post_likes (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id    UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    post_id    UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (user_id, post_id)
);

-- ============================================================
-- 4. post_saves
-- ============================================================
CREATE TABLE public.post_saves (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id    UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    post_id    UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (user_id, post_id)
);

-- ============================================================
-- 5. Indexes
-- ============================================================
CREATE INDEX idx_posts_user_id      ON public.posts (user_id);
CREATE INDEX idx_posts_created_at   ON public.posts (created_at DESC);
CREATE INDEX idx_posts_like_count   ON public.posts (like_count DESC);
CREATE INDEX idx_post_images_post_id ON public.post_images (post_id);
CREATE INDEX idx_post_images_wallpaper_id ON public.post_images (wallpaper_id);
CREATE INDEX idx_post_likes_user_id ON public.post_likes (user_id);
CREATE INDEX idx_post_likes_post_id ON public.post_likes (post_id);
CREATE INDEX idx_post_saves_user_id ON public.post_saves (user_id);
CREATE INDEX idx_post_saves_post_id ON public.post_saves (post_id);

-- ============================================================
-- 6. Helper: is the current user an approved studio owner?
-- ============================================================
CREATE OR REPLACE FUNCTION public.is_approved_studio()
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND studio_status = 'approved'
  );
$$;

-- ============================================================
-- 7. Row Level Security (RLS)
-- ============================================================
ALTER TABLE public.posts       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts       FORCE ROW LEVEL SECURITY;
ALTER TABLE public.post_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_images FORCE ROW LEVEL SECURITY;
ALTER TABLE public.post_likes  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_likes  FORCE ROW LEVEL SECURITY;
ALTER TABLE public.post_saves  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_saves  FORCE ROW LEVEL SECURITY;

-- posts
CREATE POLICY "posts_select" ON public.posts
    FOR SELECT USING (true);

CREATE POLICY "posts_insert_approved_studio" ON public.posts
    FOR INSERT WITH CHECK (
        auth.uid() = user_id
        AND public.is_approved_studio()
    );

CREATE POLICY "posts_update_own" ON public.posts
    FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "posts_delete_own" ON public.posts
    FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "posts_admin_all" ON public.posts
    FOR ALL USING (public.is_admin());

-- post_images
CREATE POLICY "post_images_select" ON public.post_images
    FOR SELECT USING (true);

CREATE POLICY "post_images_insert_own" ON public.post_images
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.posts
            WHERE id = post_id AND user_id = auth.uid()
        )
    );

CREATE POLICY "post_images_admin_all" ON public.post_images
    FOR ALL USING (public.is_admin());

-- post_likes
CREATE POLICY "post_likes_select" ON public.post_likes
    FOR SELECT USING (true);

CREATE POLICY "post_likes_insert_own" ON public.post_likes
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "post_likes_delete_own" ON public.post_likes
    FOR DELETE USING (user_id = auth.uid());

CREATE POLICY "post_likes_admin_all" ON public.post_likes
    FOR ALL USING (public.is_admin());

-- post_saves
CREATE POLICY "post_saves_select" ON public.post_saves
    FOR SELECT USING (true);

CREATE POLICY "post_saves_insert_own" ON public.post_saves
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "post_saves_delete_own" ON public.post_saves
    FOR DELETE USING (user_id = auth.uid());

CREATE POLICY "post_saves_admin_all" ON public.post_saves
    FOR ALL USING (public.is_admin());

-- ============================================================
-- 8. Triggers
-- ============================================================
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.posts
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- post_likes -> posts.like_count
CREATE OR REPLACE FUNCTION public.handle_post_like_count()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE public.posts
        SET like_count = like_count + 1
        WHERE id = NEW.post_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE public.posts
        SET like_count = GREATEST(like_count - 1, 0)
        WHERE id = OLD.post_id;
        RETURN OLD;
    END IF;
END;
$$;

CREATE TRIGGER on_post_like_change
    AFTER INSERT OR DELETE ON public.post_likes
    FOR EACH ROW EXECUTE FUNCTION public.handle_post_like_count();

-- post_saves -> posts.save_count
CREATE OR REPLACE FUNCTION public.handle_post_save_count()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE public.posts
        SET save_count = save_count + 1
        WHERE id = NEW.post_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE public.posts
        SET save_count = GREATEST(save_count - 1, 0)
        WHERE id = OLD.post_id;
        RETURN OLD;
    END IF;
END;
$$;

CREATE TRIGGER on_post_save_change
    AFTER INSERT OR DELETE ON public.post_saves
    FOR EACH ROW EXECUTE FUNCTION public.handle_post_save_count();

-- post_images -> posts.image_count (guarded so cascading deletes don't error)
CREATE OR REPLACE FUNCTION public.handle_post_image_count()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE public.posts
        SET image_count = image_count + 1
        WHERE id = NEW.post_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE public.posts
        SET image_count = GREATEST(image_count - 1, 0)
        WHERE id = OLD.post_id
          AND EXISTS (SELECT 1 FROM public.posts WHERE id = OLD.post_id);
        RETURN OLD;
    END IF;
END;
$$;

CREATE TRIGGER on_post_image_change
    AFTER INSERT OR DELETE ON public.post_images
    FOR EACH ROW EXECUTE FUNCTION public.handle_post_image_count();
