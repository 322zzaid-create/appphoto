-- ============================================================================
-- apex - Server-side ad confirmation
-- The download token is now only issued after the app has confirmed (on the
-- server) that the ad was actually watched. The browser calls /api/ad/confirm
-- the moment its ad detector fires; the token route then requires an
-- unconsumed, fresh confirmation for the same IP + wallpaper before minting a
-- download token. This closes the bare-API bypass (curl'ing the token route
-- directly no longer yields a token).
--
-- NOTE: this is not a cryptographic proof of a real human watching an ad. A
-- determined client can still call /api/ad/confirm itself. The bulletproof
-- layer is a server-to-server callback from the ad network, which is a
-- provider integration and intentionally out of scope here.
-- ============================================================================

CREATE TABLE public.ad_confirmations (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nonce        TEXT NOT NULL UNIQUE,
    wallpaper_id UUID NOT NULL REFERENCES public.wallpapers(id) ON DELETE CASCADE,
    ip_address   INET,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
    consumed_at  TIMESTAMPTZ
);

COMMENT ON TABLE public.ad_confirmations IS
    'Server-side proof that an ad was confirmed watched, consumed once per download token.';

CREATE INDEX idx_ad_confirmations_nonce
    ON public.ad_confirmations (nonce);
CREATE INDEX idx_ad_confirmations_wallpaper
    ON public.ad_confirmations (wallpaper_id);
CREATE INDEX idx_ad_confirmations_ip_created
    ON public.ad_confirmations (ip_address, created_at DESC);

-- Service role bypasses RLS; anon/authenticated get no access (no policies).
ALTER TABLE public.ad_confirmations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ad_confirmations FORCE ROW LEVEL SECURITY;

-- One-time cleanup of stale rows.
DELETE FROM public.ad_confirmations
WHERE created_at < now() - interval '7 days';
