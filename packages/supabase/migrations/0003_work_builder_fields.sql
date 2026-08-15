-- ─────────────────────────────────────────────────────────────
-- 0003_work_builder_fields.sql — apps/web(지홍님 1안) 통합에 필요한
-- Work/Builder 필드 추가 + 공개 읽기(anon) RLS 정책
--
-- 배경: artifact/ai-builder-group/05-서비스-nextjs 를 apps/web 에 통합하면서
-- Work 목록 필터·카드 표기, Builder 프로필 화면에 필요한 필드가
-- packages/content/src/schema.ts 에 추가됐다. 이 마이그레이션은 그 스키마
-- 변경을 0002_builder_group_domains.sql 위에 반영한다.
--
-- ⚠️ 이 파일은 작성만 하고 아직 어떤 Supabase 프로젝트에도 적용(push)하지
-- 않았다 — 현재 VDMP 는 Supabase 키가 없는 파일 드라이버 데모 상태다
-- (CLAUDE.md 하드 룰 3). 실제 Supabase 프로젝트를 연결한 뒤 사람이 직접
-- 적용 여부를 판단한다.
--
-- 적용 방법 (0001/0002 와 동일)
--   A) Supabase 대시보드 → SQL Editor 에 붙여넣고 실행
--   B) supabase CLI:  supabase db push
-- ─────────────────────────────────────────────────────────────

-- ── works: 목록 필터/카드 표기 필드 ──────────────────────────
alter table public.works
  add column if not exists category text not null default 'platform'
    check (category in ('aiax', 'commerce', 'platform', 'finance')),
  add column if not exists tag       text not null default '',
  add column if not exists year      text not null default '',
  add column if not exists partner   text not null default '';

comment on column public.works.category is 'Work 목록 필터 칩 값 — WorkCategory (schema.ts)';
comment on column public.works.tag is '카드에 노출되는 자유 텍스트 태그, category 보다 구체적 (예: "SaaS · Admin")';
comment on column public.works.year is '카드/상세 표기용 연도 (자유 텍스트)';
comment on column public.works.partner is '"with 똑똑한개발자 · 빌더 조쉬" 형태의 파트너 표기';

create index if not exists works_category_idx on public.works (category);

-- ── builders: 프로필 화면 필드 ────────────────────────────────
alter table public.builders
  add column if not exists role        text not null default '',
  add column if not exists focus       text not null default '',
  add column if not exists principles  jsonb not null default '[]'::jsonb,
  add column if not exists badge_label text not null default '',
  add column if not exists is_lead     boolean not null default false;

comment on column public.builders.role is '프로필 헤더에 노출되는 짧은 타이틀 (예: "프로덕트 빌더 · 기획+개발")';
comment on column public.builders.focus is '한 줄 전문 분야 (예: "프로덕트 전체 · MVP · 검증")';
comment on column public.builders.principles is '{title, description}[] — "일하는 원칙" 카드';
comment on column public.builders.badge_label is '카드/히어로 뱃지 텍스트 (예: "✳ 이달의 빌더", "NEW"). 빈 문자열 = 뱃지 없음';
comment on column public.builders.is_lead is 'true 면 리드 스타일 뱃지(라임), false 면 NEW 스타일(플레인) 뱃지';

-- ── 공개 읽기(anon) 정책 ──────────────────────────────────────
-- 0002 의 "공개 페이지가 생기면 그때 anon 정책을 추가하세요" 를 지금
-- 실행한다 — apps/web 의 Work/Builder 목록·상세가 이 두 테이블을
-- 공개적으로 읽어야 하기 때문이다. published/active 상태만 노출한다.
drop policy if exists works_public_read on public.works;
create policy works_public_read
  on public.works
  for select
  to anon, authenticated
  using (status = 'published');

drop policy if exists builders_public_read on public.builders;
create policy builders_public_read
  on public.builders
  for select
  to anon, authenticated
  using (status = 'active');

-- admin_accounts, site_settings 는 계속 anon 정책 없음(의도적) — 변경하지 않는다.
