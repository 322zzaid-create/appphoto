-- Migration: 006_studio_profiles
-- Description: Adds studio profile avatar column for studio public pages.

-- ============================================================
-- 1. Add studio avatar to profiles
-- ============================================================
ALTER TABLE public.profiles ADD COLUMN studio_avatar_url TEXT;

-- ============================================================
-- 2. Index on username for public studio page lookups
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_profiles_studio_approved
    ON public.profiles (username)
    WHERE studio_status = 'approved';

COMMENT ON COLUMN public.profiles.studio_avatar_url
    IS 'Public studio profile image uploaded by the studio owner.';
