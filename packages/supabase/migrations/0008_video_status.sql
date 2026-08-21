-- Add an explicit public visibility state to videos. Existing videos remain public.
alter table public.videos
  add column if not exists status text not null default 'published';

alter table public.videos
  drop constraint if exists videos_status_check;

alter table public.videos
  add constraint videos_status_check check (status in ('published', 'private'));

create index if not exists videos_status_idx on public.videos (status);
