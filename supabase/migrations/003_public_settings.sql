-- Allow anyone to read app_settings (site name, etc.)
CREATE POLICY "app_settings_public_select"
    ON public.app_settings FOR SELECT
    USING (true);
