# 05 — Claude Code 개발 작업 지시서

> 세션별로 복사해 붙여넣을 수 있는 단위 작업. 번호는 `02-unfinished-features.md`와 대응.
> 모든 작업 공통 규칙 (CLAUDE.md 하드 룰):
>
> - 이미지 생성 금지 (Codex `imagegen` 전용) · `published` 전환 금지 · `getRepository()` 경유 ·
>   `audit.ts`에 LLM 금지 · 앱 코드에서 `fs` 직접 import 금지
> - 작업 후: `pnpm typecheck` 필수, 앱 수정 시 `pnpm build`, 글 수정 시 `pnpm audit:content`
> - 프론트매터 필드 추가 시 `schema.ts` → admin 폼 → `audit.ts` 세 곳 동시 수정
> - 완료 보고에 검증 명령의 실제 출력 포함

---

## WO-1. 예약 발행(scheduled) 실제 구현 — P1

```
작업: scheduled 상태가 실제로 동작하게 만들어라.

배경: packages/content/src/posts.ts getPublishedPosts()가 status === 'published'만 노출해서,
scheduled 글은 발행일이 지나도 영원히 비공개다. 어드민 상태 옵션 설명("발행일 이후 공개")과
불일치한다.

요구사항:
1. wiki/01-architecture.md, wiki/02-conventions.md를 먼저 읽어라.
2. 설계 결정을 먼저 제시하라 (자동 전환 vs 렌더 시점 포함). 정적 빌드/ISR 특성상
   "getPublished에서 scheduled && publishedAt <= now 포함" 방식과 revalidate 전략을 비교하고
   추천안을 골라라.
3. admin 편집기에 publishedAt(예약 시각) 입력 필드를 추가하라. savePostAction도 함께.
4. auditPost()에 규칙 추가: scheduled인데 publishedAt이 없거나 과거면 error. (결정적 규칙만!)
5. file/supabase 두 드라이버가 같은 의미론을 갖게 하라.
검증: pnpm typecheck && pnpm build && pnpm audit:content 출력 첨부.
완료 후: /save-memory로 설계 근거 기록, wiki/06-history.md에 항목 추가.
```

## WO-2. auditPost 및 content 패키지 테스트 도입 — P2

```
작업: packages/content에 vitest를 도입하고 핵심 로직 테스트를 작성하라.

요구사항:
1. vitest를 devDependency로 추가하고 package.json test 스크립트 연결 (turbo test가 이미 있음).
2. 테스트 대상 (우선순위 순):
   - auditPost(): 발행 게이트이므로 최우선. error/warn/info 각 규칙별 케이스 + publishable 판정
     + 점수 계산. 케이스는 audit.ts의 규칙을 1:1로 커버하라.
   - PostFrontmatterSchema: 기본값 채움(prefault), SLUG_PATTERN(한글 슬러그 허용/공백 거부),
     ImageSource에 'claude'가 파싱 실패하는 것.
   - slugify round-trip, 파일 드라이버 save→getBySlug→remove (tmp 디렉터리 사용, CONTENT_DIR로 주입).
3. 앱 코드는 건드리지 마라.
검증: pnpm test 전체 통과 출력 첨부. pnpm typecheck 통과.
```

## WO-3. 어드민 보호 — P2

```
작업: apps/admin에 최소 인증을 추가하라.

요구사항:
1. 환경 변수 기반 Basic Auth를 middleware.ts로 구현하라 (ADMIN_USER / ADMIN_PASSWORD).
2. 변수가 없으면 인증을 끈다 — 로컬 데모 상태 유지가 이 템플릿의 원칙이다 (Supabase 패턴과 동일).
3. .env.example에 주석과 함께 추가하고, "변수 없이 배포하지 말 것" 경고를 남겨라.
4. /api/upload도 보호 범위에 포함되는지 확인하라.
5. 외부 입력이므로 env 파싱에 zod를 써라 (wiki/02-conventions.md).
검증: pnpm typecheck && pnpm build. 변수 설정/미설정 두 상태의 동작을 보고에 명시.
```

## WO-4. lint 통일 — P2

```
작업: 모노레포 lint를 ESLint flat config로 통일하라.

배경: apps는 next lint(제거 예정), packages/content·supabase는 no-op 에코 스크립트다.

요구사항:
1. 루트에 공유 flat config를 두고 4개 워크스페이스가 상속하게 하라.
2. next lint 대신 eslint 직접 호출로 전환 (Next 16 권장 방식 확인).
3. 규칙은 typescript-eslint recommended 수준에서 시작 — strict 옵션은 tsconfig가 이미 담당.
4. 기존 코드의 lint 에러는 auto-fix 가능한 것만 고치고, 나머지는 목록으로 보고만 하라.
   이 작업에서 로직 변경 금지.
검증: pnpm lint 전체 통과(또는 잔여 에러 목록) + pnpm typecheck && pnpm build.
```

## WO-5. Supabase 드라이버 검증 — P2

```
작업: Supabase 드라이버 경로를 실제로 검증하고 결과를 기록하라.

요구사항:
1. wiki/07-supabase.md와 packages/supabase/migrations/README.md 절차를 그대로 따라라.
2. 사용자에게 테스트 프로젝트 키를 요청하라 — 키를 임의로 만들지 마라.
3. 검증 항목: 마이그레이션 적용 → migrate-content.ts 이관 → admin CRUD → 이미지 업로드가
   Storage로 → web 렌더 → CONTENT_DRIVER=file 강제 시 파일 복귀.
4. 발견한 버그는 고치되, 드라이버 인터페이스(repo/types.ts)는 바꾸지 마라.
5. 결과를 wiki/07-supabase.md에 "검증 기록" 섹션으로 남겨라.
검증: 각 항목의 실제 출력/스크린샷 수준 근거 첨부.
```

## WO-6. 검수 대기 글 발행 준비 — P1 (발행 자체는 사람)

```
작업: content/posts/결정적-콘텐츠-검수-게이트.md 를 발행 가능 상태로 끌어올려라.

요구사항:
1. pnpm audit:content를 돌려 이 글의 error/warn을 확인하라 (2026-08-04 작업 로그에 감사 미실행
   기록이 있다).
2. error를 해소하라. warn은 본문 품질을 해치지 않는 선에서.
3. 커버가 필요하면 pnpm agent image-maker에 위임하거나, Codex가 없으면 이미지 없이 진행하라
   (폴백 1순위). 직접 만들지 마라.
4. status는 in_review에 둔다. published로 바꾸지 마라 — 발행은 사용자가 admin에서 한다.
5. 완료 후 doc/work-log의 미완료 항목이 해소됐음을 보고하라.
검증: pnpm audit:content 최종 출력 첨부 (해당 슬러그 error 0).
```

## WO-7. 반복 필드(FAQ/인용/hreflang) UX 개선 — P3

```
작업: admin 편집기의 반복 필드를 제한 없이 추가할 수 있게 하라.

배경: 현재 클라이언트 JS 없이 빈 행 2개만 미리 렌더한다 (EXTRA_ROWS).

요구사항:
1. "admin에 클라이언트 상태 라이브러리 도입 금지" 규칙을 지켜라. 최소한의 'use client'
   컴포넌트(useState로 행 배열만 관리)는 허용된다 — Editor.tsx가 선례다.
2. 행 추가/삭제 버튼. 폼 name 규약(faqQuestion/faqAnswer 반복)은 유지해 actions.ts를 안 바꿔도
   되게 하라.
3. 접근성: 버튼에 레이블, 키보드 조작 가능.
검증: pnpm typecheck && pnpm build. FAQ 5쌍 저장 round-trip을 직접 확인해 보고.
```

## WO-8. 웹 페이지네이션 + 카테고리 노출 — P3

```
작업: /blog에 페이지네이션(searchParams 기반, 페이지당 10)과 카테고리 표시를 추가하라.

요구사항:
1. 서버 컴포넌트 유지. searchParams는 Promise이므로 await (wiki/02-conventions.md).
2. 카테고리는 목록 아이템에 배지로 표시하고, ?category= 필터를 태그와 같은 패턴으로.
3. 기존 슬러그·URL 구조는 바꾸지 마라.
검증: pnpm typecheck && pnpm build.
```

---

## 권장 실행 순서

1. **WO-6** (콘텐츠 완결 — 즉시 가치) → 2. **WO-2** (게이트 테스트 — 이후 작업의 안전망) →
3. **WO-1** (기능 결함) → 4. **WO-3, WO-4** (운영 기반) → 5. **WO-5** (백엔드 검증) →
6. **WO-7, WO-8** (개선)

각 WO는 독립 세션 1개 분량이다. 한 세션에 두 개 이상 묶지 말 것 — 검증 게이트가 섞인다.
