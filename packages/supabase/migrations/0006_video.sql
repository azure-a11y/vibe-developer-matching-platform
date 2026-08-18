-- ─────────────────────────────────────────────────────────────
-- 0006_video.sql — videos 테이블 · RLS
--
-- 적용 방법 (0001~0005 와 동일)
--   A) Supabase 대시보드 → SQL Editor 에 붙여넣고 실행
--   B) supabase CLI:  supabase db push
--
-- 이 스키마는 packages/content/src/schema.ts 의 VideoFrontmatterSchema와
-- 1:1 대응됩니다. 한쪽을 바꾸면 반드시 다른 쪽도 바꾸세요.
--
-- Post/Work 와 달리 발행 상태(status) 컬럼이 없습니다 — 등록된 영상은
-- 전부 공개 사이트에 노출됩니다 (별도 검수 게이트가 요청되지 않았음).
-- ─────────────────────────────────────────────────────────────

create extension if not exists "pgcrypto";

create table if not exists public.videos (
  id           uuid primary key default gen_random_uuid(),

  title        text not null,
  slug         text not null unique,
  youtube_url  text not null,
  youtube_id   text not null,

  sort_order   integer not null default 0,
  -- 대표영상 — 애플리케이션 레이어(videos.ts writeVideo / repo/supabase.ts save)가
  -- 저장 시점에 다른 행의 featured 를 false 로 정리해 "최대 1개"를 보장합니다.
  -- DB 레벨 제약(partial unique index)은 두지 않았습니다 — 두 드라이버(file/supabase)의
  -- 정합성 로직을 동일한 곳(애플리케이션 코드)에 두기 위함입니다.
  featured     boolean not null default false,

  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

comment on table public.videos is $$유튜브 동영상 관리. Mirrors VideoFrontmatterSchema in packages/content/src/schema.ts$$;

create index if not exists videos_sort_order_idx on public.videos (sort_order);
create index if not exists videos_featured_idx on public.videos (featured);

drop trigger if exists videos_set_updated_at on public.videos;
create trigger videos_set_updated_at
  before update on public.videos
  for each row execute function public.set_updated_at();

-- ── RLS ──────────────────────────────────────────────────────
-- 공개 사이트(apps/web `/content`)는 anon 키로 전체 목록을 읽는다 — 발행
-- 상태 개념이 없으므로 0004_faq.sql 의 published-only 정책과 달리 전체 공개.
alter table public.videos enable row level security;

drop policy if exists videos_public_read on public.videos;
create policy videos_public_read
  on public.videos
  for select
  to anon, authenticated
  using (true);

-- 쓰기는 service role 로만 (어드민 서버 액션이 service role 키를 씁니다).
