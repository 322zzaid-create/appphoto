-- ============================================================================
-- apex - Security & Performance migration
-- 1. get_category_counts() aggregate RPC (replaces full-table client-side scan)
-- 2. GIN indexes on JSONB categories/tags for @> containment queries
-- 3. Rate-limit index on downloads.ip_address
-- 4. Update default site name seed to 'apex'
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. Category counts aggregate
-- Computes published wallpaper counts per category from the denormalized
-- JSONB column in a single lightweight pass (returns only slug + count).
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_category_counts()
RETURNS TABLE (slug TEXT, count BIGINT)
LANGUAGE sql STABLE SECURITY DEFINER
AS $$
  SELECT c.slug, COUNT(*)::BIGINT AS count
  FROM public.wallpapers w
  CROSS JOIN LATERAL jsonb_array_elements(w.categories) AS cat
  JOIN public.categories c ON c.slug = cat->>'slug'
  WHERE w.status = 'published' AND w.visibility = 'public'
  GROUP BY c.slug
$$;

-- ----------------------------------------------------------------------------
-- 2. GIN indexes for jsonb containment queries (@> / contains)
-- ----------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_wallpapers_categories_gin
    ON public.wallpapers USING GIN (categories);
CREATE INDEX IF NOT EXISTS idx_wallpapers_tags_gin
    ON public.wallpapers USING GIN (tags);

-- ----------------------------------------------------------------------------
-- 3. Rate-limit support index
-- ----------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_downloads_ip_address
    ON public.downloads (ip_address);
CREATE INDEX IF NOT EXISTS idx_downloads_ip_created
    ON public.downloads (ip_address, created_at DESC);

-- ----------------------------------------------------------------------------
-- 4. Default site name -> apex (only when still the original seed value)
-- ----------------------------------------------------------------------------
UPDATE public.app_settings
SET value = '"apex"', updated_at = now()
WHERE key = 'app_name' AND value = '"Wallpaper Hub"';
