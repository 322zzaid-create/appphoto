-- Add 'tv' to the device_type enum so the "TV" option shown in the
-- filter/upload UIs maps to a valid database value instead of failing
-- the wallpapers.device_type check constraint.
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_enum
        WHERE enumtypid = 'public.device_type'::regtype
          AND enumlabel = 'tv'
    ) THEN
        ALTER TYPE public.device_type ADD VALUE 'tv';
    END IF;
END;
$$;
