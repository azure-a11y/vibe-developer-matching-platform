-- ─────────────────────────────────────────────────────────────
-- 0004_faq.sql — faq_categories · faqs 테이블 · RLS
--
-- 적용 방법 (0001~0003 과 동일)
--   A) Supabase 대시보드 → SQL Editor 에 붙여넣고 실행
--   B) supabase CLI:  supabase db push
--
-- 이 스키마는 packages/content/src/schema.ts 의 FaqCategory/Faq 프론트매터와
-- 1:1 대응됩니다. 한쪽을 바꾸면 반드시 다른 쪽도 바꾸세요.
--
-- faqs.category_id 는 uuid 가 아니라 faq_categories.slug 를 참조하는 text FK
-- 입니다 — 0002 의 works.builder_ids(Builder.slug 배열)와 같은 이유로, 파일
-- 드라이버에 uuid 개념이 없어서 두 드라이버(file/supabase)를 구조적으로
-- 동일하게 유지하기 위함입니다. (packages/supabase/src/types.ts 의 FaqRow
-- 주석 참고)
-- ─────────────────────────────────────────────────────────────

create extension if not exists "pgcrypto";

-- ── faq_categories ───────────────────────────────────────────
create table if not exists public.faq_categories (
  id          uuid primary key default gen_random_uuid(),

  name        text not null,
  slug        text not null unique,
  sort_order  integer not null default 0,
  is_active   boolean not null default true,

  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

comment on table public.faq_categories is $$FAQ 카테고리. Mirrors FaqCategoryFrontmatterSchema in packages/content/src/schema.ts$$;

create index if not exists faq_categories_sort_order_idx on public.faq_categories (sort_order);

drop trigger if exists faq_categories_set_updated_at on public.faq_categories;
create trigger faq_categories_set_updated_at
  before update on public.faq_categories
  for each row execute function public.set_updated_at();

-- ── faqs ─────────────────────────────────────────────────────
create table if not exists public.faqs (
  id           uuid primary key default gen_random_uuid(),

  question     text not null,
  slug         text not null unique,
  answer       text not null default '',

  -- faq_categories.slug 참조 (uuid FK 가 아님 — 파일 위 주석 참고).
  category_id  text not null references public.faq_categories (slug) on delete restrict,

  sort_order   integer not null default 0,
  status       text not null default 'draft'
              check (status in ('draft', 'published')),

  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

comment on table public.faqs is $$FAQ 항목. Mirrors FaqFrontmatterSchema. category_id references faq_categories(slug), not faq_categories(id).$$;

create index if not exists faqs_category_id_idx on public.faqs (category_id);
create index if not exists faqs_status_idx on public.faqs (status);

drop trigger if exists faqs_set_updated_at on public.faqs;
create trigger faqs_set_updated_at
  before update on public.faqs
  for each row execute function public.set_updated_at();

-- ── RLS ──────────────────────────────────────────────────────
-- 공개 사이트(apps/web `/faq`, 홈 FAQ 프리뷰)는 anon 키로 읽는다. 초안은
-- 노출되면 안 되므로 published 만, 카테고리는 활성 상태만 노출한다.
-- 0003_work_builder_fields.sql 의 works/builders 공개 읽기 정책과 같은 패턴.
alter table public.faq_categories enable row level security;

drop policy if exists faq_categories_public_read on public.faq_categories;
create policy faq_categories_public_read
  on public.faq_categories
  for select
  to anon, authenticated
  using (is_active = true);

alter table public.faqs enable row level security;

drop policy if exists faqs_public_read on public.faqs;
create policy faqs_public_read
  on public.faqs
  for select
  to anon, authenticated
  using (status = 'published');

-- 쓰기는 service role 로만 (어드민 서버 액션이 service role 키를 씁니다).
