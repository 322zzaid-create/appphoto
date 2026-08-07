-- ============================================================================
-- Wallpaper Hub - Complete Database Schema
-- Supabase PostgreSQL Migration: 001_initial_schema
-- ============================================================================
-- This migration creates the full production schema for Wallpaper Hub,
-- including tables, enums, indexes, RLS policies, triggers, and storage.
-- ============================================================================

-- ============================================================================
-- 1. CUSTOM ENUM TYPES
-- ============================================================================

CREATE TYPE public.user_role AS ENUM ('user', 'admin', 'artist');
CREATE TYPE public.wallpaper_status AS ENUM ('draft', 'published', 'archived', 'rejected');
CREATE TYPE public.wallpaper_visibility AS ENUM ('public', 'private', 'unlisted');
CREATE TYPE public.wallpaper_orientation AS ENUM ('portrait', 'landscape', 'square');
CREATE TYPE public.device_type AS ENUM ('phone', 'desktop', 'tablet', 'all');
CREATE TYPE public.wallpaper_type AS ENUM ('static', 'live');
CREATE TYPE public.download_quality AS ENUM ('low', 'hd', 'original');
CREATE TYPE public.notification_type AS ENUM ('system', 'wallpaper', 'admin', 'achievement');
CREATE TYPE public.ad_type AS ENUM ('rewarded', 'interstitial', 'banner', 'native');
CREATE TYPE public.ad_interaction_type AS ENUM ('started', 'completed', 'skipped', 'failed');
CREATE TYPE public.payout_status AS ENUM ('pending', 'processing', 'completed', 'failed');
CREATE TYPE public.report_reason AS ENUM ('spam', 'inappropriate', 'copyright', 'other');
CREATE TYPE public.report_status AS ENUM ('pending', 'reviewed', 'resolved', 'dismissed');


-- ============================================================================
-- 2. TABLES
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 2.1 profiles
-- ----------------------------------------------------------------------------
CREATE TABLE public.profiles (
    id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username      TEXT NOT NULL UNIQUE,
    full_name     TEXT,
    avatar_url    TEXT,
    bio           TEXT,
    role          public.user_role NOT NULL DEFAULT 'user',
    is_premium    BOOLEAN NOT NULL DEFAULT false,
    premium_expires_at TIMESTAMPTZ,
    coins         INTEGER NOT NULL DEFAULT 0 CHECK (coins >= 0),
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.profiles IS 'User profile data extending Supabase auth.users.';


-- ----------------------------------------------------------------------------
-- 2.2 categories
-- ----------------------------------------------------------------------------
CREATE TABLE public.categories (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            TEXT NOT NULL UNIQUE,
    slug            TEXT NOT NULL UNIQUE,
    description     TEXT,
    icon            TEXT,
    color           TEXT,
    display_order   INTEGER NOT NULL DEFAULT 0,
    is_active       BOOLEAN NOT NULL DEFAULT true,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    wallpaper_count INTEGER NOT NULL DEFAULT 0
);

COMMENT ON TABLE public.categories IS 'Wallpaper categories (Nature, Abstract, etc.). wallpaper_count is maintained by triggers.';


-- ----------------------------------------------------------------------------
-- 2.3 tags
-- ----------------------------------------------------------------------------
CREATE TABLE public.tags (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name         TEXT NOT NULL UNIQUE,
    slug         TEXT NOT NULL UNIQUE,
    usage_count  INTEGER NOT NULL DEFAULT 0,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.tags IS 'Tags for wallpaper classification. usage_count is maintained by triggers.';


-- ----------------------------------------------------------------------------
-- 2.4 wallpapers
-- ----------------------------------------------------------------------------
CREATE TABLE public.wallpapers (
    id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title                 TEXT NOT NULL,
    description           TEXT,
    slug                  TEXT NOT NULL UNIQUE,
    status                public.wallpaper_status NOT NULL DEFAULT 'draft',
    visibility            public.wallpaper_visibility NOT NULL DEFAULT 'public',

    thumbnail_url         TEXT,
    preview_url           TEXT,
    hd_url                TEXT,
    original_url          TEXT,

    original_filename     TEXT,
    file_size             BIGINT,
    hd_file_size          BIGINT,
    preview_file_size     BIGINT,
    thumbnail_file_size   BIGINT,

    width                 INTEGER CHECK (width > 0),
    height                INTEGER CHECK (height > 0),
    aspect_ratio          TEXT,
    orientation           public.wallpaper_orientation,

    device_type           public.device_type NOT NULL DEFAULT 'all',
    wallpaper_type        public.wallpaper_type NOT NULL DEFAULT 'static',
    mime_type             TEXT,

    dominant_colors       JSONB DEFAULT '[]'::jsonb,

    categories            JSONB NOT NULL DEFAULT '[]'::jsonb,
    tags                  JSONB NOT NULL DEFAULT '[]'::jsonb,

    view_count            BIGINT NOT NULL DEFAULT 0,
    download_count        BIGINT NOT NULL DEFAULT 0,
    like_count            BIGINT NOT NULL DEFAULT 0,
    favorite_count        BIGINT NOT NULL DEFAULT 0,
    share_count           BIGINT NOT NULL DEFAULT 0,

    is_featured           BOOLEAN NOT NULL DEFAULT false,
    is_premium            BOOLEAN NOT NULL DEFAULT false,
    featured_at           TIMESTAMPTZ,

    uploader_id           UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    artist_id             UUID REFERENCES public.profiles(id) ON DELETE SET NULL,

    published_at          TIMESTAMPTZ,
    created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.wallpapers IS 'Core wallpaper table storing all metadata and file references.';


-- ----------------------------------------------------------------------------
-- 2.5 wallpaper_categories (junction)
-- ----------------------------------------------------------------------------
CREATE TABLE public.wallpaper_categories (
    wallpaper_id UUID NOT NULL REFERENCES public.wallpapers(id) ON DELETE CASCADE,
    category_id  UUID NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
    PRIMARY KEY (wallpaper_id, category_id)
);

COMMENT ON TABLE public.wallpaper_categories IS 'Many-to-many: wallpapers ↔ categories.';


-- ----------------------------------------------------------------------------
-- 2.6 wallpaper_tags (junction)
-- ----------------------------------------------------------------------------
CREATE TABLE public.wallpaper_tags (
    wallpaper_id UUID NOT NULL REFERENCES public.wallpapers(id) ON DELETE CASCADE,
    tag_id       UUID NOT NULL REFERENCES public.tags(id) ON DELETE CASCADE,
    PRIMARY KEY (wallpaper_id, tag_id)
);

COMMENT ON TABLE public.wallpaper_tags IS 'Many-to-many: wallpapers ↔ tags.';


-- ----------------------------------------------------------------------------
-- 2.7 favorites
-- ----------------------------------------------------------------------------
CREATE TABLE public.favorites (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id      UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    wallpaper_id UUID NOT NULL REFERENCES public.wallpapers(id) ON DELETE CASCADE,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (user_id, wallpaper_id)
);

COMMENT ON TABLE public.favorites IS 'User bookmarked / favorited wallpapers.';


-- ----------------------------------------------------------------------------
-- 2.8 downloads
-- ----------------------------------------------------------------------------
CREATE TABLE public.downloads (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id      UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    wallpaper_id UUID NOT NULL REFERENCES public.wallpapers(id) ON DELETE CASCADE,
    quality      public.download_quality NOT NULL DEFAULT 'low',
    ip_address   INET,
    user_agent   TEXT,
    device_type  TEXT,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.downloads IS 'Download log for analytics and cooldown tracking.';


-- ----------------------------------------------------------------------------
-- 2.11 views
-- ----------------------------------------------------------------------------
CREATE TABLE public.views (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id      UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    wallpaper_id UUID NOT NULL REFERENCES public.wallpapers(id) ON DELETE CASCADE,
    ip_address   INET,
    duration     INTEGER CHECK (duration >= 0),
    created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.views IS 'Wallpaper view events for analytics.';


-- ----------------------------------------------------------------------------
-- 2.12 likes
-- ----------------------------------------------------------------------------
CREATE TABLE public.likes (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id      UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    wallpaper_id UUID NOT NULL REFERENCES public.wallpapers(id) ON DELETE CASCADE,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (user_id, wallpaper_id)
);

COMMENT ON TABLE public.likes IS 'User likes on wallpapers.';


-- ----------------------------------------------------------------------------
-- 2.13 search_history
-- ----------------------------------------------------------------------------
CREATE TABLE public.search_history (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id       UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    query         TEXT NOT NULL,
    filters       JSONB,
    results_count INTEGER,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.search_history IS 'Per-user search history for recommendations and analytics.';


-- ----------------------------------------------------------------------------
-- 2.14 search_suggestions
-- ----------------------------------------------------------------------------
CREATE TABLE public.search_suggestions (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    term             TEXT NOT NULL UNIQUE,
    search_count     INTEGER NOT NULL DEFAULT 1,
    last_searched_at TIMESTAMPTZ,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.search_suggestions IS 'Global search term frequencies for autocomplete / suggestions.';


-- ----------------------------------------------------------------------------
-- 2.15 notifications
-- ----------------------------------------------------------------------------
CREATE TABLE public.notifications (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id    UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title      TEXT NOT NULL,
    message    TEXT NOT NULL,
    type       public.notification_type NOT NULL DEFAULT 'system',
    data       JSONB,
    is_read    BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.notifications IS 'In-app notifications for users.';


-- ----------------------------------------------------------------------------
-- 2.16 wallpaper_of_the_day
-- ----------------------------------------------------------------------------
CREATE TABLE public.wallpaper_of_the_day (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wallpaper_id UUID NOT NULL UNIQUE REFERENCES public.wallpapers(id) ON DELETE CASCADE,
    date         DATE NOT NULL UNIQUE,
    is_manual    BOOLEAN NOT NULL DEFAULT false,
    selected_by  UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.wallpaper_of_the_day IS 'Curated daily featured wallpaper.';


-- ----------------------------------------------------------------------------
-- 2.17 ad_configurations
-- ----------------------------------------------------------------------------
CREATE TABLE public.ad_configurations (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ad_type           public.ad_type NOT NULL,
    provider          TEXT NOT NULL DEFAULT 'admob',
    ad_unit_id        TEXT NOT NULL,
    app_id            TEXT,
    is_enabled        BOOLEAN NOT NULL DEFAULT true,
    placement_rules   JSONB,
    frequency_cap     INTEGER CHECK (frequency_cap IS NULL OR frequency_cap >= 0),
    cooldown_seconds  INTEGER NOT NULL DEFAULT 30 CHECK (cooldown_seconds >= 0),
    created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.ad_configurations IS 'AdMob / ad network configuration per placement.';


-- ----------------------------------------------------------------------------
-- 2.18 user_ad_interactions
-- ----------------------------------------------------------------------------
CREATE TABLE public.user_ad_interactions (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id           UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    ad_config_id      UUID NOT NULL REFERENCES public.ad_configurations(id) ON DELETE CASCADE,
    wallpaper_id      UUID REFERENCES public.wallpapers(id) ON DELETE SET NULL,
    interaction_type  public.ad_interaction_type NOT NULL,
    reward_granted    BOOLEAN NOT NULL DEFAULT false,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.user_ad_interactions IS 'Tracks user interactions with ads for reward logic.';


-- ----------------------------------------------------------------------------
-- 2.19 artist_payouts
-- ----------------------------------------------------------------------------
CREATE TABLE public.artist_payouts (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    artist_id      UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    amount         DECIMAL(12,2) NOT NULL CHECK (amount > 0),
    currency       TEXT NOT NULL DEFAULT 'USD',
    status         public.payout_status NOT NULL DEFAULT 'pending',
    payment_method TEXT,
    reference_id   TEXT,
    notes          TEXT,
    created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
    processed_at   TIMESTAMPTZ
);

COMMENT ON TABLE public.artist_payouts IS 'Payout records for artist revenue sharing.';


-- ----------------------------------------------------------------------------
-- 2.20 app_settings
-- ----------------------------------------------------------------------------
CREATE TABLE public.app_settings (
    key         TEXT PRIMARY KEY,
    value       JSONB NOT NULL,
    description TEXT,
    updated_by  UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.app_settings IS 'Key-value store for runtime app configuration.';


-- ----------------------------------------------------------------------------
-- 2.21 reports
-- ----------------------------------------------------------------------------
CREATE TABLE public.reports (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reporter_id   UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    wallpaper_id  UUID NOT NULL REFERENCES public.wallpapers(id) ON DELETE CASCADE,
    reason        public.report_reason NOT NULL,
    description   TEXT,
    status        public.report_status NOT NULL DEFAULT 'pending',
    reviewed_by   UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    review_notes  TEXT,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    resolved_at   TIMESTAMPTZ
);

COMMENT ON TABLE public.reports IS 'Content moderation reports submitted by users.';


-- ============================================================================
-- 3. INDEXES
-- ============================================================================

-- ----------------------------------------------------------------------------
-- wallpapers
-- ----------------------------------------------------------------------------
CREATE INDEX idx_wallpapers_slug              ON public.wallpapers (slug);
CREATE INDEX idx_wallpapers_status            ON public.wallpapers (status);
CREATE INDEX idx_wallpapers_uploader_id       ON public.wallpapers (uploader_id);
CREATE INDEX idx_wallpapers_artist_id         ON public.wallpapers (artist_id);
CREATE INDEX idx_wallpapers_device_type       ON public.wallpapers (device_type);
CREATE INDEX idx_wallpapers_wallpaper_type    ON public.wallpapers (wallpaper_type);
CREATE INDEX idx_wallpapers_orientation       ON public.wallpapers (orientation);
CREATE INDEX idx_wallpapers_is_featured       ON public.wallpapers (is_featured);
CREATE INDEX idx_wallpapers_is_premium        ON public.wallpapers (is_premium);
CREATE INDEX idx_wallpapers_view_count        ON public.wallpapers (view_count DESC);
CREATE INDEX idx_wallpapers_download_count    ON public.wallpapers (download_count DESC);
CREATE INDEX idx_wallpapers_like_count        ON public.wallpapers (like_count DESC);
CREATE INDEX idx_wallpapers_created_at        ON public.wallpapers (created_at DESC);
CREATE INDEX idx_wallpapers_published_at      ON public.wallpapers (published_at DESC);

-- Composite indexes for common query patterns
CREATE INDEX idx_wallpapers_status_featured   ON public.wallpapers (status, is_featured DESC);
CREATE INDEX idx_wallpapers_status_created    ON public.wallpapers (status, created_at DESC);
CREATE INDEX idx_wallpapers_device_status     ON public.wallpapers (device_type, status);
CREATE INDEX idx_wallpapers_type_status       ON public.wallpapers (wallpaper_type, status);
CREATE INDEX idx_wallpapers_orientation_status ON public.wallpapers (orientation, status);

-- Full-text search index
CREATE INDEX idx_wallpapers_fts ON public.wallpapers
    USING GIN (to_tsvector('english', coalesce(title, '') || ' ' || coalesce(description, '')));

-- GIN index on dominant_colors JSONB
CREATE INDEX idx_wallpapers_dominant_colors ON public.wallpapers USING GIN (dominant_colors);

-- ----------------------------------------------------------------------------
-- profiles
-- ----------------------------------------------------------------------------
CREATE INDEX idx_profiles_username ON public.profiles (username);
CREATE INDEX idx_profiles_role     ON public.profiles (role);

-- ----------------------------------------------------------------------------
-- downloads
-- ----------------------------------------------------------------------------
CREATE INDEX idx_downloads_user_id      ON public.downloads (user_id);
CREATE INDEX idx_downloads_wallpaper_id ON public.downloads (wallpaper_id);
CREATE INDEX idx_downloads_created_at   ON public.downloads (created_at DESC);

-- ----------------------------------------------------------------------------
-- views
-- ----------------------------------------------------------------------------
CREATE INDEX idx_views_user_id      ON public.views (user_id);
CREATE INDEX idx_views_wallpaper_id ON public.views (wallpaper_id);
CREATE INDEX idx_views_created_at   ON public.views (created_at DESC);

-- ----------------------------------------------------------------------------
-- search_history
-- ----------------------------------------------------------------------------
CREATE INDEX idx_search_history_user_id ON public.search_history (user_id);
CREATE INDEX idx_search_history_query   ON public.search_history (query);

-- ----------------------------------------------------------------------------
-- search_suggestions
-- ----------------------------------------------------------------------------
CREATE INDEX idx_search_suggestions_term        ON public.search_suggestions (term);
CREATE INDEX idx_search_suggestions_search_count ON public.search_suggestions (search_count DESC);

-- ----------------------------------------------------------------------------
-- notifications
-- ----------------------------------------------------------------------------
CREATE INDEX idx_notifications_user_id ON public.notifications (user_id);
CREATE INDEX idx_notifications_is_read ON public.notifications (is_read) WHERE is_read = false;

-- ----------------------------------------------------------------------------
-- wallpaper_of_the_day
-- ----------------------------------------------------------------------------
CREATE INDEX idx_wotd_date ON public.wallpaper_of_the_day (date DESC);


-- ============================================================================
-- 4. ROW-LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS on every table
ALTER TABLE public.profiles                ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tags                    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallpapers              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallpaper_categories    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallpaper_tags          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites               ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.downloads               ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.views                   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.likes                   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.search_history          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.search_suggestions      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallpaper_of_the_day    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ad_configurations       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_ad_interactions    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.artist_payouts          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_settings            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports                 ENABLE ROW LEVEL SECURITY;

-- Force RLS even for table owners (Supabase best practice)
ALTER TABLE public.profiles                FORCE ROW LEVEL SECURITY;
ALTER TABLE public.categories              FORCE ROW LEVEL SECURITY;
ALTER TABLE public.tags                    FORCE ROW LEVEL SECURITY;
ALTER TABLE public.wallpapers              FORCE ROW LEVEL SECURITY;
ALTER TABLE public.wallpaper_categories    FORCE ROW LEVEL SECURITY;
ALTER TABLE public.wallpaper_tags          FORCE ROW LEVEL SECURITY;
ALTER TABLE public.favorites               FORCE ROW LEVEL SECURITY;
ALTER TABLE public.downloads               FORCE ROW LEVEL SECURITY;
ALTER TABLE public.views                   FORCE ROW LEVEL SECURITY;
ALTER TABLE public.likes                   FORCE ROW LEVEL SECURITY;
ALTER TABLE public.search_history          FORCE ROW LEVEL SECURITY;
ALTER TABLE public.search_suggestions      FORCE ROW LEVEL SECURITY;
ALTER TABLE public.notifications           FORCE ROW LEVEL SECURITY;
ALTER TABLE public.wallpaper_of_the_day    FORCE ROW LEVEL SECURITY;
ALTER TABLE public.ad_configurations       FORCE ROW LEVEL SECURITY;
ALTER TABLE public.user_ad_interactions    FORCE ROW LEVEL SECURITY;
ALTER TABLE public.artist_payouts          FORCE ROW LEVEL SECURITY;
ALTER TABLE public.app_settings            FORCE ROW LEVEL SECURITY;
ALTER TABLE public.reports                 FORCE ROW LEVEL SECURITY;

-- ----------------------------------------------------------------------------
-- Helper: check if current user is admin
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- ----------------------------------------------------------------------------
-- profiles
-- ----------------------------------------------------------------------------
CREATE POLICY "profiles_select_public"
    ON public.profiles FOR SELECT
    USING (true);

CREATE POLICY "profiles_update_own"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_admin_all"
    ON public.profiles FOR ALL
    USING (public.is_admin());

-- ----------------------------------------------------------------------------
-- categories
-- ----------------------------------------------------------------------------
CREATE POLICY "categories_select"
    ON public.categories FOR SELECT
    USING (is_active = true OR public.is_admin());

CREATE POLICY "categories_admin_all"
    ON public.categories FOR ALL
    USING (public.is_admin());

-- ----------------------------------------------------------------------------
-- tags
-- ----------------------------------------------------------------------------
CREATE POLICY "tags_select"
    ON public.tags FOR SELECT
    USING (true);

CREATE POLICY "tags_admin_all"
    ON public.tags FOR ALL
    USING (public.is_admin());

-- ----------------------------------------------------------------------------
-- wallpapers
-- ----------------------------------------------------------------------------
CREATE POLICY "wallpapers_select_published"
    ON public.wallpapers FOR SELECT
    USING (
        (status = 'published' AND visibility = 'public')
        OR public.is_admin()
        OR uploader_id = auth.uid()
        OR artist_id = auth.uid()
    );

CREATE POLICY "wallpapers_insert_own"
    ON public.wallpapers FOR INSERT
    WITH CHECK (auth.uid() = uploader_id);

CREATE POLICY "wallpapers_update_own_or_admin"
    ON public.wallpapers FOR UPDATE
    USING (
        public.is_admin()
        OR uploader_id = auth.uid()
        OR artist_id = auth.uid()
    )
    WITH CHECK (
        public.is_admin()
        OR uploader_id = auth.uid()
        OR artist_id = auth.uid()
    );

CREATE POLICY "wallpapers_delete_admin"
    ON public.wallpapers FOR DELETE
    USING (public.is_admin());

-- ----------------------------------------------------------------------------
-- wallpaper_categories
-- ----------------------------------------------------------------------------
CREATE POLICY "wallpaper_categories_select"
    ON public.wallpaper_categories FOR SELECT
    USING (true);

CREATE POLICY "wallpaper_categories_manage_admin"
    ON public.wallpaper_categories FOR ALL
    USING (public.is_admin());

CREATE POLICY "wallpaper_categories_insert_own"
    ON public.wallpaper_categories FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.wallpapers
            WHERE id = wallpaper_id
              AND (uploader_id = auth.uid() OR artist_id = auth.uid())
        )
    );

-- ----------------------------------------------------------------------------
-- wallpaper_tags
-- ----------------------------------------------------------------------------
CREATE POLICY "wallpaper_tags_select"
    ON public.wallpaper_tags FOR SELECT
    USING (true);

CREATE POLICY "wallpaper_tags_manage_admin"
    ON public.wallpaper_tags FOR ALL
    USING (public.is_admin());

CREATE POLICY "wallpaper_tags_insert_own"
    ON public.wallpaper_tags FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.wallpapers
            WHERE id = wallpaper_id
              AND (uploader_id = auth.uid() OR artist_id = auth.uid())
        )
    );

-- ----------------------------------------------------------------------------
-- favorites
-- ----------------------------------------------------------------------------
CREATE POLICY "favorites_select_own"
    ON public.favorites FOR SELECT
    USING (user_id = auth.uid() OR public.is_admin());

CREATE POLICY "favorites_insert_own"
    ON public.favorites FOR INSERT
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "favorites_delete_own"
    ON public.favorites FOR DELETE
    USING (user_id = auth.uid());

-- ----------------------------------------------------------------------------
-- downloads
-- ----------------------------------------------------------------------------
CREATE POLICY "downloads_select_own"
    ON public.downloads FOR SELECT
    USING (user_id = auth.uid() OR public.is_admin());

CREATE POLICY "downloads_insert_auth"
    ON public.downloads FOR INSERT
    WITH CHECK (
        user_id = auth.uid()
        OR (user_id IS NULL AND auth.uid() IS NULL)
    );

-- ----------------------------------------------------------------------------
-- views
-- ----------------------------------------------------------------------------
CREATE POLICY "views_select_own"
    ON public.views FOR SELECT
    USING (user_id = auth.uid() OR public.is_admin());

CREATE POLICY "views_insert_auth"
    ON public.views FOR INSERT
    WITH CHECK (
        user_id = auth.uid()
        OR (user_id IS NULL AND auth.uid() IS NULL)
    );

-- ----------------------------------------------------------------------------
-- likes
-- ----------------------------------------------------------------------------
CREATE POLICY "likes_select"
    ON public.likes FOR SELECT
    USING (true);

CREATE POLICY "likes_insert_own"
    ON public.likes FOR INSERT
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "likes_delete_own"
    ON public.likes FOR DELETE
    USING (user_id = auth.uid());

-- ----------------------------------------------------------------------------
-- search_history
-- ----------------------------------------------------------------------------
CREATE POLICY "search_history_select_own"
    ON public.search_history FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "search_history_insert_own"
    ON public.search_history FOR INSERT
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "search_history_delete_own"
    ON public.search_history FOR DELETE
    USING (user_id = auth.uid());

-- ----------------------------------------------------------------------------
-- search_suggestions
-- ----------------------------------------------------------------------------
CREATE POLICY "search_suggestions_select"
    ON public.search_suggestions FOR SELECT
    USING (true);

CREATE POLICY "search_suggestions_insert_auth"
    ON public.search_suggestions FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "search_suggestions_update_auth"
    ON public.search_suggestions FOR UPDATE
    USING (auth.uid() IS NOT NULL);

-- ----------------------------------------------------------------------------
-- notifications
-- ----------------------------------------------------------------------------
CREATE POLICY "notifications_select_own"
    ON public.notifications FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "notifications_update_own"
    ON public.notifications FOR UPDATE
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "notifications_insert_service"
    ON public.notifications FOR INSERT
    WITH CHECK (public.is_admin());

-- ----------------------------------------------------------------------------
-- wallpaper_of_the_day
-- ----------------------------------------------------------------------------
CREATE POLICY "wotd_select"
    ON public.wallpaper_of_the_day FOR SELECT
    USING (true);

CREATE POLICY "wotd_admin_all"
    ON public.wallpaper_of_the_day FOR ALL
    USING (public.is_admin());

-- ----------------------------------------------------------------------------
-- ad_configurations
-- ----------------------------------------------------------------------------
CREATE POLICY "ad_configs_admin_only"
    ON public.ad_configurations FOR ALL
    USING (public.is_admin());

-- ----------------------------------------------------------------------------
-- user_ad_interactions
-- ----------------------------------------------------------------------------
CREATE POLICY "user_ad_interactions_select_own"
    ON public.user_ad_interactions FOR SELECT
    USING (user_id = auth.uid() OR public.is_admin());

CREATE POLICY "user_ad_interactions_insert_own"
    ON public.user_ad_interactions FOR INSERT
    WITH CHECK (user_id = auth.uid());

-- ----------------------------------------------------------------------------
-- artist_payouts
-- ----------------------------------------------------------------------------
CREATE POLICY "artist_payouts_select_own_or_admin"
    ON public.artist_payouts FOR SELECT
    USING (artist_id = auth.uid() OR public.is_admin());

CREATE POLICY "artist_payouts_admin_all"
    ON public.artist_payouts FOR ALL
    USING (public.is_admin());

-- ----------------------------------------------------------------------------
-- app_settings
-- ----------------------------------------------------------------------------
CREATE POLICY "app_settings_admin_only"
    ON public.app_settings FOR ALL
    USING (public.is_admin());

-- ----------------------------------------------------------------------------
-- reports
-- ----------------------------------------------------------------------------
CREATE POLICY "reports_select_own_or_admin"
    ON public.reports FOR SELECT
    USING (reporter_id = auth.uid() OR public.is_admin());

CREATE POLICY "reports_insert_auth"
    ON public.reports FOR INSERT
    WITH CHECK (reporter_id = auth.uid());

CREATE POLICY "reports_admin_manage"
    ON public.reports FOR UPDATE
    USING (public.is_admin());

CREATE POLICY "reports_admin_delete"
    ON public.reports FOR DELETE
    USING (public.is_admin());


-- ============================================================================
-- 5. TRIGGER FUNCTIONS
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 5.1 Auto-update updated_at
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.wallpapers
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.ad_configurations
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();


-- ----------------------------------------------------------------------------
-- 5.2 Auto-create profile on signup
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
    INSERT INTO public.profiles (id, username, full_name, avatar_url)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data ->> 'username', split_part(NEW.email, '@', 1)),
        COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.raw_user_meta_data ->> 'name'),
        COALESCE(NEW.raw_user_meta_data ->> 'avatar_url', NEW.raw_user_meta_data ->> 'picture')
    );
    RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- ----------------------------------------------------------------------------
-- 5.3 wallpaper_categories → category.wallpaper_count
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_wallpaper_category_count()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE public.categories
        SET wallpaper_count = wallpaper_count + 1
        WHERE id = NEW.category_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE public.categories
        SET wallpaper_count = wallpaper_count - 1
        WHERE id = OLD.category_id;
        RETURN OLD;
    END IF;
END;
$$;

CREATE TRIGGER on_wallpaper_category_change
    AFTER INSERT OR DELETE ON public.wallpaper_categories
    FOR EACH ROW EXECUTE FUNCTION public.handle_wallpaper_category_count();


-- ----------------------------------------------------------------------------
-- 5.5 wallpaper_tags → tag.usage_count
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_tag_usage_count()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE public.tags
        SET usage_count = usage_count + 1
        WHERE id = NEW.tag_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE public.tags
        SET usage_count = usage_count - 1
        WHERE id = OLD.tag_id;
        RETURN OLD;
    END IF;
END;
$$;

CREATE TRIGGER on_wallpaper_tag_change
    AFTER INSERT OR DELETE ON public.wallpaper_tags
    FOR EACH ROW EXECUTE FUNCTION public.handle_tag_usage_count();


-- ----------------------------------------------------------------------------
-- 5.7 Sync denormalized categories/tags JSONB on wallpapers
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.sync_wallpaper_categories_jsonb()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE public.wallpapers
    SET categories = (
        SELECT COALESCE(jsonb_agg(jsonb_build_object('id', c.id, 'name', c.name, 'slug', c.slug, 'icon', c.icon, 'color', c.color)), '[]'::jsonb)
        FROM public.wallpaper_categories wc
        JOIN public.categories c ON c.id = wc.category_id
        WHERE wc.wallpaper_id = COALESCE(NEW.wallpaper_id, OLD.wallpaper_id)
    ),
    updated_at = now()
    WHERE id = COALESCE(NEW.wallpaper_id, OLD.wallpaper_id);
    IF TG_OP = 'INSERT' THEN RETURN NEW; ELSE RETURN OLD; END IF;
END;
$$;

CREATE TRIGGER on_wallpaper_category_sync_jsonb
    AFTER INSERT OR DELETE ON public.wallpaper_categories
    FOR EACH ROW EXECUTE FUNCTION public.sync_wallpaper_categories_jsonb();

CREATE OR REPLACE FUNCTION public.sync_wallpaper_tags_jsonb()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE public.wallpapers
    SET tags = (
        SELECT COALESCE(jsonb_agg(jsonb_build_object('id', t.id, 'name', t.name, 'slug', t.slug)), '[]'::jsonb)
        FROM public.wallpaper_tags wt
        JOIN public.tags t ON t.id = wt.tag_id
        WHERE wt.wallpaper_id = COALESCE(NEW.wallpaper_id, OLD.wallpaper_id)
    ),
    updated_at = now()
    WHERE id = COALESCE(NEW.wallpaper_id, OLD.wallpaper_id);
    IF TG_OP = 'INSERT' THEN RETURN NEW; ELSE RETURN OLD; END IF;
END;
$$;

CREATE TRIGGER on_wallpaper_tag_sync_jsonb
    AFTER INSERT OR DELETE ON public.wallpaper_tags
    FOR EACH ROW EXECUTE FUNCTION public.sync_wallpaper_tags_jsonb();


-- ----------------------------------------------------------------------------
-- 5.6 Auto-increment/decrement wallpaper counters
-- ----------------------------------------------------------------------------

-- likes → like_count
CREATE OR REPLACE FUNCTION public.handle_like_count()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE public.wallpapers
        SET like_count = like_count + 1
        WHERE id = NEW.wallpaper_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE public.wallpapers
        SET like_count = like_count - 1
        WHERE id = OLD.wallpaper_id;
        RETURN OLD;
    END IF;
END;
$$;

CREATE TRIGGER on_like_change
    AFTER INSERT OR DELETE ON public.likes
    FOR EACH ROW EXECUTE FUNCTION public.handle_like_count();


-- favorites → favorite_count
CREATE OR REPLACE FUNCTION public.handle_favorite_count()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE public.wallpapers
        SET favorite_count = favorite_count + 1
        WHERE id = NEW.wallpaper_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE public.wallpapers
        SET favorite_count = favorite_count - 1
        WHERE id = OLD.wallpaper_id;
        RETURN OLD;
    END IF;
END;
$$;

CREATE TRIGGER on_favorite_change
    AFTER INSERT OR DELETE ON public.favorites
    FOR EACH ROW EXECUTE FUNCTION public.handle_favorite_count();


-- downloads → download_count
CREATE OR REPLACE FUNCTION public.handle_download_count()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE public.wallpapers
        SET download_count = download_count + 1
        WHERE id = NEW.wallpaper_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE public.wallpapers
        SET download_count = GREATEST(download_count - 1, 0)
        WHERE id = OLD.wallpaper_id;
        RETURN OLD;
    END IF;
END;
$$;

CREATE TRIGGER on_download_change
    AFTER INSERT OR DELETE ON public.downloads
    FOR EACH ROW EXECUTE FUNCTION public.handle_download_count();


-- views → view_count
CREATE OR REPLACE FUNCTION public.handle_view_count()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE public.wallpapers
        SET view_count = view_count + 1
        WHERE id = NEW.wallpaper_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE public.wallpapers
        SET view_count = GREATEST(view_count - 1, 0)
        WHERE id = OLD.wallpaper_id;
        RETURN OLD;
    END IF;
END;
$$;

CREATE TRIGGER on_view_change
    AFTER INSERT OR DELETE ON public.views
    FOR EACH ROW EXECUTE FUNCTION public.handle_view_count();


-- ============================================================================
-- 6. UTILITY FUNCTIONS
-- ============================================================================

-- Generate URL-safe slug from title
CREATE OR REPLACE FUNCTION public.slugify(input TEXT)
RETURNS TEXT
LANGUAGE plpgsql IMMUTABLE
AS $$
DECLARE
    slug TEXT;
BEGIN
    slug := lower(trim(input));
    slug := regexp_replace(slug, '[^a-z0-9\s-]', '', 'g');
    slug := regexp_replace(slug, '[\s-]+', '-', 'g');
    slug := regexp_replace(slug, '^-+|-+$', '', 'g');
    RETURN slug;
END;
$$;

-- Auto-set slug on wallpapers if null
CREATE OR REPLACE FUNCTION public.auto_set_wallpaper_slug()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    IF NEW.slug IS NULL OR NEW.slug = '' THEN
        NEW.slug := public.slugify(NEW.title) || '-' || substr(NEW.id::text, 1, 8);
    END IF;
    RETURN NEW;
END;
$$;

CREATE TRIGGER before_insert_wallpaper_slug
    BEFORE INSERT ON public.wallpapers
    FOR EACH ROW EXECUTE FUNCTION public.auto_set_wallpaper_slug();

-- Auto-set published_at when status changes to published
CREATE OR REPLACE FUNCTION public.auto_set_published_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    IF NEW.status = 'published' AND (OLD.status IS DISTINCT FROM 'published') THEN
        NEW.published_at := now();
    END IF;
    RETURN NEW;
END;
$$;

CREATE TRIGGER before_update_wallpaper_status
    BEFORE UPDATE ON public.wallpapers
    FOR EACH ROW EXECUTE FUNCTION public.auto_set_published_at();


-- ============================================================================
-- 7. SEED DATA
-- ============================================================================

-- Default app settings
INSERT INTO public.app_settings (key, value, description) VALUES
    ('app_name',           '"Wallpaper Hub"',                            'Application display name'),
    ('max_upload_size_mb', '50',                                         'Maximum upload file size in MB'),
    ('daily_download_limit','50',                                        'Free user daily download limit'),
    ('premium_download_limit','999',                                     'Premium user daily download limit'),
    ('coins_per_download', '5',                                          'Coins earned per wallpaper download'),
    ('coins_per_like',     '1',                                          'Coins earned when someone likes wallpaper'),
    ('min_payout_amount',  '50.00',                                      'Minimum artist payout threshold in USD'),
    ('wotd_auto_select',   'true',                                       'Auto-select wallpaper of the day'),
    ('enable_ads',         'true',                                       'Master ad toggle'),
    ('featured_refresh_hours', '24',                                     'Hours between featured refresh')
ON CONFLICT (key) DO NOTHING;

-- Default categories
INSERT INTO public.categories (name, slug, icon, color, display_order) VALUES
    ('Nature',       'nature',       'leaf',       '#22c55e', 1),
    ('Abstract',     'abstract',     'shapes',     '#8b5cf6', 2),
    ('Minimal',      'minimal',      'minus',      '#6b7280', 3),
    ('Space',        'space',        'star',       '#3b82f6', 4),
    ('Architecture', 'architecture', 'building',   '#f59e0b', 5),
    ('Animals',      'animals',      'paw',        '#ef4444', 6),
    ('Dark',         'dark',         'moon',       '#1e293b', 7),
    ('Colorful',     'colorful',     'palette',    '#ec4899', 8),
    ('Anime',        'anime',        'sparkles',   '#a855f7', 9),
    ('Landscape',    'landscape',    'mountain',   '#14b8a6', 10),
    ('Vehicles',     'vehicles',     'car',        '#f97316', 11),
    ('Food',         'food',         'coffee',     '#eab308', 12),
    ('Sports',       'sports',       'zap',        '#06b6d4', 13),
    ('Fantasy',      'fantasy',      'wand',       '#d946ef', 14),
    ('Vintage',      'vintage',      'clock',      '#78716c', 15)
ON CONFLICT (name) DO NOTHING;


-- ============================================================================
-- 8. STORAGE BUCKETS & POLICIES
-- ============================================================================

-- Create buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
    ('wallpapers-original',  'wallpapers-original',  false, 52428800,  ARRAY['image/jpeg','image/png','image/webp','image/gif']),
    ('wallpapers-hd',        'wallpapers-hd',        false, 20971520,  ARRAY['image/jpeg','image/png','image/webp']),
    ('wallpapers-preview',   'wallpapers-preview',   true,  5242880,   ARRAY['image/jpeg','image/png','image/webp']),
    ('wallpapers-thumbnail', 'wallpapers-thumbnail',  true,  2097152,   ARRAY['image/jpeg','image/png','image/webp']),
    ('avatars',              'avatars',              true,  5242880,   ARRAY['image/jpeg','image/png','image/webp','image/gif'])
ON CONFLICT (id) DO NOTHING;

-- ----------------------------------------------------------------------------
-- wallpapers-original (private)
-- ----------------------------------------------------------------------------
CREATE POLICY "storage_original_select_own"
    ON storage.objects FOR SELECT
    USING (
        bucket_id = 'wallpapers-original'
        AND (
            public.is_admin()
            OR (storage.foldername(name))[1] = auth.uid()::text
        )
    );

CREATE POLICY "storage_original_insert_auth"
    ON storage.objects FOR INSERT
    WITH CHECK (
        bucket_id = 'wallpapers-original'
        AND auth.uid() IS NOT NULL
        AND (storage.foldername(name))[1] = auth.uid()::text
    );

CREATE POLICY "storage_original_delete_own"
    ON storage.objects FOR DELETE
    USING (
        bucket_id = 'wallpapers-original'
        AND (
            public.is_admin()
            OR (storage.foldername(name))[1] = auth.uid()::text
        )
    );

-- ----------------------------------------------------------------------------
-- wallpapers-hd (private)
-- ----------------------------------------------------------------------------
CREATE POLICY "storage_hd_select_own_or_premium"
    ON storage.objects FOR SELECT
    USING (
        bucket_id = 'wallpapers-hd'
        AND (
            public.is_admin()
            OR (storage.foldername(name))[1] = auth.uid()::text
            OR EXISTS (
                SELECT 1 FROM public.profiles
                WHERE id = auth.uid()
                  AND (is_premium = true OR role IN ('admin','artist'))
            )
        )
    );

CREATE POLICY "storage_hd_insert_auth"
    ON storage.objects FOR INSERT
    WITH CHECK (
        bucket_id = 'wallpapers-hd'
        AND auth.uid() IS NOT NULL
        AND (storage.foldername(name))[1] = auth.uid()::text
    );

CREATE POLICY "storage_hd_delete_own_or_admin"
    ON storage.objects FOR DELETE
    USING (
        bucket_id = 'wallpapers-hd'
        AND (
            public.is_admin()
            OR (storage.foldername(name))[1] = auth.uid()::text
        )
    );

-- ----------------------------------------------------------------------------
-- wallpapers-preview (public)
-- ----------------------------------------------------------------------------
CREATE POLICY "storage_preview_select_public"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'wallpapers-preview');

CREATE POLICY "storage_preview_insert_auth"
    ON storage.objects FOR INSERT
    WITH CHECK (
        bucket_id = 'wallpapers-preview'
        AND auth.uid() IS NOT NULL
        AND (storage.foldername(name))[1] = auth.uid()::text
    );

CREATE POLICY "storage_preview_delete_own_or_admin"
    ON storage.objects FOR DELETE
    USING (
        bucket_id = 'wallpapers-preview'
        AND (
            public.is_admin()
            OR (storage.foldername(name))[1] = auth.uid()::text
        )
    );

-- ----------------------------------------------------------------------------
-- wallpapers-thumbnail (public)
-- ----------------------------------------------------------------------------
CREATE POLICY "storage_thumbnail_select_public"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'wallpapers-thumbnail');

CREATE POLICY "storage_thumbnail_insert_auth"
    ON storage.objects FOR INSERT
    WITH CHECK (
        bucket_id = 'wallpapers-thumbnail'
        AND auth.uid() IS NOT NULL
        AND (storage.foldername(name))[1] = auth.uid()::text
    );

CREATE POLICY "storage_thumbnail_delete_own_or_admin"
    ON storage.objects FOR DELETE
    USING (
        bucket_id = 'wallpapers-thumbnail'
        AND (
            public.is_admin()
            OR (storage.foldername(name))[1] = auth.uid()::text
        )
    );

-- ----------------------------------------------------------------------------
-- avatars (public)
-- ----------------------------------------------------------------------------
CREATE POLICY "storage_avatars_select_public"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'avatars');

CREATE POLICY "storage_avatars_insert_own"
    ON storage.objects FOR INSERT
    WITH CHECK (
        bucket_id = 'avatars'
        AND auth.uid() IS NOT NULL
        AND (storage.foldername(name))[1] = auth.uid()::text
    );

CREATE POLICY "storage_avatars_update_own"
    ON storage.objects FOR UPDATE
    USING (
        bucket_id = 'avatars'
        AND (storage.foldername(name))[1] = auth.uid()::text
    );

CREATE POLICY "storage_avatars_delete_own"
    ON storage.objects FOR DELETE
    USING (
        bucket_id = 'avatars'
        AND (
            public.is_admin()
            OR (storage.foldername(name))[1] = auth.uid()::text
        )
    );


-- ============================================================================
-- END OF MIGRATION
-- ============================================================================
