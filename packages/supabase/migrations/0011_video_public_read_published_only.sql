-- ─────────────────────────────────────────────────────────────
-- 0011_video_public_read_published_only.sql — videos 공개 SELECT 정책을
-- status 기준으로 제한
--
-- 배경: 0006_video.sql 은 videos 에 "발행 상태" 개념이 없던 시점에 작성되어
-- videos_public_read 정책이 `using (true)`로 전체 공개였습니다. 이후
-- 0008_video_status.sql 에서 status(published/private) 컬럼이 추가됐지만
-- RLS 정책은 갱신되지 않아, anon 키로 테이블을 직접 조회하면 private 영상도
-- 그대로 노출되는 상태였습니다 (공개 웹은 apps/web `/content` 페이지의
-- 애플리케이션 코드 필터에만 의존 — DB 레벨 방어선이 없었습니다).
--
-- 이 마이그레이션은 정책을 posts/works/faqs 와 동일한 패턴
-- (`status = 'published'`)으로 맞춥니다.
--
-- 적용 방법 (0001~0010 과 동일)
--   A) Supabase 대시보드 → SQL Editor 에 붙여넣고 실행
--   B) supabase CLI:  supabase db push
--
-- 영향 범위:
--   - anon/authenticated: private 영상을 더 이상 직접 조회할 수 없습니다.
--   - service role(admin 서버 액션): RLS 를 우회하므로 영향 없음 — 관리자
--     화면은 지금과 동일하게 모든 상태의 영상을 계속 볼 수 있습니다.
-- ─────────────────────────────────────────────────────────────

drop policy if exists videos_public_read on public.videos;
create policy videos_public_read
  on public.videos
  for select
  to anon, authenticated
  using (status = 'published');
