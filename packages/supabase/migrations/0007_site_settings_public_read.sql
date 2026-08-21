-- Public site settings are safe-to-read presentation metadata.
-- Keep all writes restricted to the service-role admin path.
drop policy if exists site_settings_public_read on public.site_settings;

create policy site_settings_public_read
  on public.site_settings
  for select
  to anon, authenticated
  using (true);
