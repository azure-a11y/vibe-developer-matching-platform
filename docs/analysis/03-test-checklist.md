# 03 — 화면별 테스트 체크리스트

> 수동 QA용. 사전 조건: `pnpm install` → `pnpm dev` (web :3000 · admin :3001).
> 데이터 전제: published 1편, in_review 1편 (템플릿 기본 상태).

## web — 홈 `/`

- [ ] 최신 published 글이 피처드 카드로 표시된다 (제목·설명·날짜·읽기 시간)
- [ ] published 글이 0개일 때 빈 상태 안내(어드민/에이전트 실행 가이드)가 나온다
- [ ] draft / in_review / scheduled / archived 글이 목록에 나오지 않는다
- [ ] 카드 클릭 → `/blog/<slug>` 이동 (한글 슬러그 인코딩 포함)

## web — 글 목록 `/blog`

- [ ] published 글만 개수와 함께 표시된다
- [ ] 태그 칩 클릭 → `?tag=` 필터 적용, "전체"로 해제
- [ ] 태그 카운트가 published 글 기준이다 (draft의 태그가 새지 않음)
- [ ] 조건에 맞는 글이 없으면 빈 상태 문구가 나온다

## web — 글 상세 `/blog/[slug]`

- [ ] 마크다운 본문이 렌더된다 (헤딩·코드 블록·링크)
- [ ] draft/in_review 슬러그 직접 접근 시 404
- [ ] 존재하지 않는 슬러그 404
- [ ] 한글 슬러그(`결정적-콘텐츠-검수-게이트` 발행 후) 정상 접근
- [ ] `<head>`: title/description/canonical/robots/OG/Twitter 태그 확인 (소스 보기)
- [ ] JSON-LD `BlogPosting` 스크립트 존재, FAQ 있는 글은 `FAQPage`도 존재
- [ ] hreflang alternates 설정 시 `<link rel="alternate">` 출력
- [ ] noindex 글: 목록·사이트맵 미노출 (현 구현은 상세 접근도 차단 — 02번 문서 #10 참조)

## web — 시스템 라우트

- [ ] `/sitemap.xml` — published 글 + changefreq/priority 반영, noindex 제외
- [ ] `/robots.txt` — sitemap 참조 포함
- [ ] `/rss.xml` — published 글, 유효한 XML
- [ ] `/llms.txt` — `seo.llmsTxt: false` 글 제외
- [ ] `/about`, 존재하지 않는 경로 404
- [ ] GA4 env 설정 시 트래커 로드 / 미설정 시 스크립트 자체가 없음
- [ ] 소유 확인 env 설정 시 meta 태그 출력 (google/naver/bing)

## admin — 대시보드 `/`

- [ ] 전체/초안/검수 중/발행 카운트 정확
- [ ] 감사 점수 배지가 글마다 표시 (published 글은 높은 점수 기대)
- [ ] 새 글 생성: 제목만 입력 → 슬러그 자동 생성 → `/posts/<slug>` 리다이렉트
- [ ] 한글 제목 → 한글 슬러그 생성 확인
- [ ] 중복 슬러그 생성 시 에러
- [ ] 깨진 frontmatter 파일 존재 시 빨간 오류 박스에 파일별 사유 표시

## admin — 편집기 `/posts/[slug]`

- [ ] 본문 tiptap 편집 → 저장 → 마크다운 파일에 반영 (`content/posts/<slug>.md` 확인)
- [ ] 이미지 업로드(에디터): png/jpg 성공, 9MB 파일 413, .txt 415, 업로드 후 `source: user-upload`
- [ ] SEO 필드 전체 저장 round-trip (특히 keywords 콤마 분리, priority 숫자)
- [ ] GEO: FAQ 2쌍 입력·저장 → 재로드 시 유지 + 빈 행 2개 추가 표시
- [ ] 커버: src 없이 저장 → cover 필드 제거 / src+alt 저장 → 유지
- [ ] 상태 변경(Radix Select) → 저장 → 대시보드 배지 반영
- [ ] 저장 후 감사 점수가 입력 내용에 따라 변한다
- [ ] 삭제 → 대시보드로 리다이렉트, 파일 제거

## admin — 검수 `/review/[slug]`

- [ ] 자동 감사: error/warn/info 배지와 "발행 가능/불가" 판정 표시
- [ ] error가 있는 글은 "발행 불가" 문구 (단, 상태 변경 자체가 막히는지는 확인 — 현재 UI 차단 없음)
- [ ] 사람 체크리스트 6항목 저장 → frontmatter `review.checks` 기록, reviewedAt 갱신
- [ ] 상태를 published로 변경 → `publishedAt` 최초 1회만 스탬프 → web에 즉시 노출
- [ ] JSON-LD 미리보기(BlogPosting, FAQ)가 web 출력과 일치
- [ ] 긴 코드/URL이 있어도 가로 오버플로 없음 (min-w-0 회귀 확인)

## admin — SEO/GEO 대시보드 `/seo`

- [ ] 레인별(SEO/GEO/이미지/에디토리얼) 집계 카드 — info 제외 확인
- [ ] 글별 이슈 목록과 FAQ/인용/키워드 카운트 표시

## CLI / 파이프라인

- [ ] `pnpm typecheck` / `pnpm build` / `pnpm check` 통과
- [ ] `pnpm audit:content` — 결과가 admin 검수 화면과 동일 (같은 `auditPost`)
- [ ] `pnpm agent --list` — blog-writer, image-maker 표시
- [ ] `.claude/hooks/guard-image-generation.sh` — Claude 세션에서 이미지 생성 시도 차단
- [ ] Supabase 키 설정 시: 드라이버 전환 배너, 업로드가 Storage로, 마이그레이션 적용 (`wiki/07-supabase.md` 절차)
