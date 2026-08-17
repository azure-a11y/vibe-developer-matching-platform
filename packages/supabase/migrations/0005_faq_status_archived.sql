-- ─────────────────────────────────────────────────────────────
-- 0005_faq_status_archived.sql — faqs.status 값을 draft/published →
-- archived/published 로 변경
--
-- FAQ는 Insight 같은 초안 검수 워크플로우가 필요 없다 — "숨김(보관)"과
-- "공개" 두 상태면 충분하다. packages/content/src/schema.ts 의 FaqStatus
-- 변경과 짝을 이룬다.
--
-- 적용 방법 (0001~0004 와 동일)
--   A) Supabase 대시보드 → SQL Editor 에 붙여넣고 실행
--   B) supabase CLI:  supabase db push
-- ─────────────────────────────────────────────────────────────

update public.faqs set status = 'archived' where status = 'draft';

alter table public.faqs drop constraint if exists faqs_status_check;
alter table public.faqs
  add constraint faqs_status_check check (status in ('archived', 'published'));

alter table public.faqs alter column status set default 'archived';
