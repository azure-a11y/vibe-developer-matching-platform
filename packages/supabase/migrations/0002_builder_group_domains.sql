-- ─────────────────────────────────────────────────────────────
-- 0002_builder_group_domains.sql — builders · works · admin_accounts ·
-- site_settings 테이블 · RLS
--
-- 적용 방법 (0001_init.sql 과 동일)
--   A) Supabase 대시보드 → SQL Editor 에 붙여넣고 실행
--   B) supabase CLI:  supabase db push
--
-- 이 스키마는 packages/content/src/schema.ts 의 Builder/Work/AdminAccount/
-- SiteSettings 프론트매터와 1:1 대응됩니다. 한쪽을 바꾸면 반드시 다른 쪽도
-- 바꾸세요.
--
-- apps/web 은 아직 이 네 도메인을 전혀 읽지 않습니다(사용자 화면 미확정).
-- 그래서 RLS 는 켜두되 anon/authenticated 정책은 만들지 않습니다 — 지금은
-- apps/admin 의 service role 쓰기/읽기만 존재합니다. 공개 페이지가 생기면
-- 그때 실제 요구사항 기준으로 anon 정책을 추가하세요.
-- ─────────────────────────────────────────────────────────────

create extension if not exists "pgcrypto";

-- updated_at 자동 갱신 함수는 0001_init.sql 에서 이미 생성됨 (public.set_updated_at)

-- ── builders ─────────────────────────────────────────────────
create table if not exists public.builders (
  id                  uuid primary key default gen_random_uuid(),

  slug                text not null unique,
  display_name        text not null,
  bio                 text not null default '',

  avatar              jsonb,
  specialties         text[] not null default '{}',
  education           text[] not null default '{}',
  community_activity  text[] not null default '{}',
  verifications       text[] not null default '{}',

  status              text not null default 'pending'
                      check (status in ('pending','active','inactive')),
  permissions         jsonb not null default '{"canWriteInsight":false,"canEditInsight":false,"canDeleteInsight":false}'::jsonb,

  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

comment on table public.builders is $$Builder profiles. Mirrors BuilderFrontmatterSchema in packages/content/src/schema.ts$$;

create index if not exists builders_status_idx on public.builders (status);

drop trigger if exists builders_set_updated_at on public.builders;
create trigger builders_set_updated_at
  before update on public.builders
  for each row execute function public.set_updated_at();

alter table public.builders enable row level security;
-- 정책 없음 = anon/authenticated 전면 차단. service role 만 접근(RLS 우회).

-- ── works ────────────────────────────────────────────────────
create table if not exists public.works (
  id            uuid primary key default gen_random_uuid(),

  slug          text not null unique,
  title         text not null,
  summary       text not null default '',
  scope         text not null default '',
  builder_role  text not null default '',
  period        text not null default '',
  tech_stack    text[] not null default '{}',
  problem       text not null default '',
  solution      text not null default '',
  result        text not null default '',
  assets        jsonb not null default '[]'::jsonb,

  -- 참여 빌더 slug 배열. file 드라이버(Work.builderIds)와 동일한 방식 —
  -- 별도 join 테이블을 새로 만들지 않는다.
  builder_ids   text[] not null default '{}',

  status        text not null default 'pending_review'
               check (status in ('pending_review','published','archived')),

  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

comment on table public.works is $$Work/portfolio entries. Mirrors WorkFrontmatterSchema. builder_ids is a slug array, not a join table.$$;

create index if not exists works_status_idx on public.works (status);
create index if not exists works_builder_ids_idx on public.works using gin (builder_ids);

drop trigger if exists works_set_updated_at on public.works;
create trigger works_set_updated_at
  before update on public.works
  for each row execute function public.set_updated_at();

alter table public.works enable row level security;
-- 정책 없음 = service role 전용.

-- ── admin_accounts ───────────────────────────────────────────
create table if not exists public.admin_accounts (
  id                uuid primary key default gen_random_uuid(),

  slug              text not null unique,
  email             text not null unique,
  name              text not null,
  grade             text not null default '미지정',

  -- node:crypto scrypt "salt:hash" 문자열. 앱(lib/auth.ts)에서 검증하며
  -- DB 는 불투명한 텍스트로만 저장한다.
  password_hash     text not null,

  menu_permissions  jsonb not null default '{}'::jsonb,
  status            text not null default 'active'
                    check (status in ('active','inactive')),

  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

comment on table public.admin_accounts is $$Admin login + permission accounts. Mirrors AdminAccountFrontmatterSchema. Never exposed to anon - login always goes through the service-role client.$$;

drop trigger if exists admin_accounts_set_updated_at on public.admin_accounts;
create trigger admin_accounts_set_updated_at
  before update on public.admin_accounts
  for each row execute function public.set_updated_at();

alter table public.admin_accounts enable row level security;
-- 정책 없음(의도적) — 로그인/권한 데이터는 anon 키로 절대 읽히면 안 된다.
-- proxy.ts 와 서버 액션은 항상 service role 클라이언트를 쓴다.

-- ── site_settings (싱글톤) ───────────────────────────────────
create table if not exists public.site_settings (
  -- boolean PK + check(id) 트릭으로 행을 정확히 1개로 제한한다.
  id                              boolean primary key default true check (id),

  brand_name                     text not null default '',
  domain                         text not null default '',
  pluug_form_url                 text not null default '',
  company_name                   text not null default '',
  ceo_name                       text not null default '',
  business_registration_number   text not null default '',
  operated_by                    text not null default '',

  updated_at                     timestamptz not null default now()
);

comment on table public.site_settings is $$Singleton settings row. Mirrors SiteSettingsFrontmatterSchema.$$;

insert into public.site_settings (id) values (true) on conflict (id) do nothing;

drop trigger if exists site_settings_set_updated_at on public.site_settings;
create trigger site_settings_set_updated_at
  before update on public.site_settings
  for each row execute function public.set_updated_at();

alter table public.site_settings enable row level security;
-- 정책 없음 = service role 전용. 공개 페이지(footer 등)가 이 값을 읽어야
-- 하는 시점이 오면 anon select 정책을 별도로 추가한다.
