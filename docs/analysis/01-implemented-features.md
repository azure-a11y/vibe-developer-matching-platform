# 01 — 현재 구현된 기능 목록

> 2026-08-05 기준. 코드 직접 확인 결과이며, 실행 검증(빌드/런타임)은 별도 수행 필요.
> 관련: `wiki/01-architecture.md`, `wiki/06-history.md`

## apps/web — 공개 블로그 (:3000)

| 기능 | 위치 | 상태 |
| --- | --- | --- |
| 홈 (최신 글 피처드 + 목록) | `app/page.tsx` | 완료 |
| 글 목록 + 태그 필터 (`?tag=`) | `app/blog/page.tsx` | 완료 |
| 글 상세 (마크다운 렌더, 읽기 시간) | `app/blog/[slug]/page.tsx` | 완료 |
| 메타데이터 자동 생성 (title/description/keywords/canonical/robots/OG/Twitter/hreflang) | `generateMetadata` | 완료 |
| JSON-LD (BlogPosting + FAQPage) | `@orca/content` `jsonld.ts` 경유 | 완료 |
| 소개 페이지 | `app/about/page.tsx` | 완료 (정적 내용) |
| 404 | `app/not-found.tsx` | 완료 |
| sitemap.xml (changefreq/priority 반영) | `app/sitemap.ts` | 완료 |
| robots.txt | `app/robots.ts` | 완료 |
| RSS 피드 | `app/rss.xml/route.ts` | 완료 |
| llms.txt (GEO, `seo.llmsTxt` 필터) | `app/llms.txt/route.ts` | 완료 |
| GA4 트래커 (env 있을 때만 로드) | `components/Analytics.tsx` | 완료 (env 설정 필요) |
| 검색엔진 소유 확인 태그 (Google/Naver/Bing) | env → layout | 완료 (env 설정 필요) |
| 비공개 글 차단 (published 외 404) | `app/blog/[slug]/page.tsx` | 완료 |

## apps/admin — 콘텐츠 · 검수 대시보드 (:3001)

| 기능 | 위치 | 상태 |
| --- | --- | --- |
| 대시보드 (상태별 카운트, 감사 점수 테이블, 프론트매터 오류 표시) | `app/page.tsx` | 완료 |
| 새 글 초안 생성 (제목/슬러그/작성자) | `createPostAction` | 완료 |
| 글 편집기 (본문 tiptap + 메타 전체) | `app/posts/[slug]/page.tsx`, `components/Editor.tsx` | 완료 |
| SEO 필드 편집 (title/desc/keywords/canonical/noindex/robots/OG/Twitter/changefreq/priority/hreflang/llmsTxt) | `savePostAction` | 완료 |
| GEO 필드 편집 (locale/시장/answerSummary/entities/FAQ/citations) | `savePostAction` | 완료 |
| 커버 이미지 메타 (src/alt/source/origin/credit/license) | `savePostAction` | 완료 |
| 이미지 업로드 API (로컬 ↔ Supabase Storage 자동 전환, 8MB/형식 제한) | `app/api/upload/route.ts` | 완료 |
| 검수 화면 (자동 감사 + 사람 체크리스트 6항목 + 상태 변경) | `app/review/[slug]/page.tsx` | 완료 |
| 구조화 데이터(JSON-LD) 미리보기 | 검수 화면 | 완료 |
| SEO/GEO 상태 대시보드 (레인별 이슈 집계) | `app/seo/page.tsx` | 완료 |
| 글 삭제 | `deletePostAction` | 완료 |
| Radix Select 컴포넌트 (네이티브 select 금지 규칙 이행) | `components/Select.tsx` | 완료 |

## packages/content — 콘텐츠 단일 진실 공급원

| 기능 | 위치 | 상태 |
| --- | --- | --- |
| zod 스키마 (frontmatter/SEO/GEO/리뷰/이미지 출처) | `schema.ts` | 완료 |
| `ImageSource`에 `claude` 부재 (하드 룰 1 타입 강제) | `schema.ts` | 완료 |
| 자연어 슬러그 (한글 허용, `SLUG_PATTERN`) | `schema.ts` | 완료 |
| 결정적 발행 감사 `auditPost()` (LLM 없음, error/warn/info + 점수) | `audit.ts` | 완료 |
| 저장소 인터페이스 + file/supabase 드라이버 자동 선택 | `repo/` | 완료 |
| 파일 드라이버 (마크다운 read/write/delete, 읽기 시간 계산) | `posts.ts`, `repo/file.ts` | 완료 |
| Supabase 드라이버 | `repo/supabase.ts` | 구현됨 (미검증 — 02 참조) |
| JSON-LD 생성 (BlogPosting/FAQPage) | `jsonld.ts` | 완료 |
| 경로 해석 (`findRepoRoot`, `CONTENT_DIR`) | `paths.ts` | 완료 |

## packages/supabase

클라이언트 · 설정 감지(`isSupabaseConfigured`) · Storage 업로드 · 초기 마이그레이션 SQL ·
콘텐츠 이관 스크립트(`scripts/migrate-content.ts`). 키가 없으면 전부 비활성 — 데모 정상 상태.

## agents / scripts / 세션 인프라

- 독립 에이전트 2개: `blog-writer`(claude·opus, 스킬 4개), `image-maker`(codex, 스킬 2개) + `registry.yaml`
- `pnpm agent` 런처, `pnpm imagegen`(Codex 전용 경로), `pnpm audit:content` CLI, `pnpm check`(의존성 검사), `pnpm setup`
- SessionStart 훅 (wiki 인덱스 + 메모리 자동 주입), 이미지 생성 차단 PreToolUse 훅
- 슬래시 커맨드 3개: `/orca-setup`, `/save-memory`, `/create-agent`
- wiki 문서 9편 + ADR 3편 + 장기 메모리 5편

## 콘텐츠 현황

| 글 | 상태 |
| --- | --- |
| `orca-ai-company-getting-started` | published |
| `결정적-콘텐츠-검수-게이트` | **in_review** — 사람 발행 대기 (하드 룰 2) |
