-- Migration: 002_studio_and_ratings
-- Description: Adds Studio System and Rating System to the Wallpaper Hub database.

-- ============================================================
-- 1. Add studio fields to profiles table
-- ============================================================
ALTER TABLE public.profiles ADD COLUMN studio_status TEXT NOT NULL DEFAULT 'none' CHECK (studio_status IN ('none', 'pending', 'approved', 'rejected'));
ALTER TABLE public.profiles ADD COLUMN studio_name TEXT;
ALTER TABLE public.profiles ADD COLUMN studio_description TEXT;
ALTER TABLE public.profiles ADD COLUMN approved_at TIMESTAMPTZ;

-- ============================================================
-- 2. Create studio_applications table
-- ============================================================
CREATE TABLE public.studio_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    studio_name TEXT NOT NULL,
    studio_description TEXT NOT NULL,
    reason TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    admin_notes TEXT,
    reviewed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (user_id)
);

-- ============================================================
-- 3. Create ratings table
-- ============================================================
CREATE TABLE public.ratings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    wallpaper_id UUID NOT NULL REFERENCES public.wallpapers(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (user_id, wallpaper_id)
);

-- ============================================================
-- 4. Add avg_rating and rating_count columns to wallpapers
-- ============================================================
ALTER TABLE public.wallpapers ADD COLUMN avg_rating NUMERIC(3,2) DEFAULT 0;
ALTER TABLE public.wallpapers ADD COLUMN rating_count INTEGER DEFAULT 0;

-- ============================================================
-- 5. Indexes
-- ============================================================
CREATE INDEX idx_studio_applications_user_id ON public.studio_applications (user_id);
CREATE INDEX idx_studio_applications_status ON public.studio_applications (status);
CREATE INDEX idx_ratings_wallpaper_id ON public.ratings (wallpaper_id);
CREATE INDEX idx_ratings_user_id ON public.ratings (user_id);
CREATE INDEX idx_wallpapers_avg_rating ON public.wallpapers (avg_rating DESC);

-- ============================================================
-- 6. Row Level Security (RLS)
-- ============================================================

-- studio_applications
ALTER TABLE public.studio_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.studio_applications FORCE ROW LEVEL SECURITY;

CREATE POLICY "studio_apps_select_own" ON public.studio_applications
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "studio_apps_insert_own" ON public.studio_applications
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "studio_apps_admin_all" ON public.studio_applications
    FOR ALL USING (public.is_admin());

-- ratings
ALTER TABLE public.ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ratings FORCE ROW LEVEL SECURITY;

CREATE POLICY "ratings_select" ON public.ratings
    FOR SELECT USING (true);

CREATE POLICY "ratings_insert_own" ON public.ratings
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "ratings_update_own" ON public.ratings
    FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE POLICY "ratings_delete_own" ON public.ratings
    FOR DELETE USING (user_id = auth.uid());

-- ============================================================
-- 7. Triggers for updated_at
-- ============================================================
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.studio_applications
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.ratings
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================
-- 8. Trigger to update wallpaper avg_rating and rating_count
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_rating_update()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
        UPDATE public.wallpapers
        SET avg_rating = (
            SELECT COALESCE(AVG(rating), 0) FROM public.ratings WHERE wallpaper_id = NEW.wallpaper_id
        ),
        rating_count = (
            SELECT COUNT(*) FROM public.ratings WHERE wallpaper_id = NEW.wallpaper_id
        )
        WHERE id = NEW.wallpaper_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE public.wallpapers
        SET avg_rating = (
            SELECT COALESCE(AVG(rating), 0) FROM public.ratings WHERE wallpaper_id = OLD.wallpaper_id
        ),
        rating_count = (
            SELECT COUNT(*) FROM public.ratings WHERE wallpaper_id = OLD.wallpaper_id
        )
        WHERE id = OLD.wallpaper_id;
        RETURN OLD;
    END IF;
END;
$$;

CREATE TRIGGER on_rating_change
    AFTER INSERT OR UPDATE OR DELETE ON public.ratings
    FOR EACH ROW EXECUTE FUNCTION public.handle_rating_update();
