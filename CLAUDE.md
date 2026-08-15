# CLAUDE.md

Claude Code 가 이 저장소에서 작업할 때 따르는 지침입니다.

> 세션 시작 시 SessionStart 훅이 `scripts/load-context.sh` 를 실행해 wiki 인덱스와 메모리를 자동으로
> 주입합니다. 이 문서는 그 위에 얹히는 **행동 규칙**입니다.

---

## 프로젝트

**Orca AI Company** — Orca 사용자가 IT 프로젝트를 AI 에이전트 팀으로 굴리기 위한 모노레포 템플릿.
레퍼런스 구현은 "AI 팀이 운영하는 블로그"입니다.

```
apps/web          공개 블로그 (Next.js 16, :3000)
apps/admin        콘텐츠 · 테크니컬 SEO/GEO · 검수 (Next.js 16, :3001)
packages/content  스키마 · 저장소 드라이버 · 감사 · JSON-LD  ← 콘텐츠에 관한 모든 것
packages/supabase 클라이언트 · 스토리지 · 마이그레이션 (키 없으면 비활성)
content/posts     마크다운 글 (기본 드라이버, 진실 공급원)
agents/           독립 실행 에이전트 (AGENT.md + skills/) + registry.yaml
wiki/             프로젝트 지식 + 장/단기 메모리
scripts/          결정적 셸 스크립트
```

전체 구조는 `wiki/01-architecture.md`.

---

## 하드 룰

위반하면 작업을 중단하고 사용자에게 보고하세요. 우회로를 찾지 마세요.

### 1. 이미지 생성은 Codex `imagegen` 전용

**당신은 이미지를 생성하지 않습니다.** 예외 없습니다.

```bash
pnpm imagegen --slug <post-slug> --prompt "<장면 설명>"
```

금지되는 것 (사진 · 일러스트레이션 · Hero 비주얼 등 독립적인 이미지 에셋에 한함):
- 당신이 이미지를 직접 생성 · 합성하는 것
- 다른 이미지 생성 모델/API 호출 (DALL·E, Stable Diffusion, Imagen, Midjourney 등)
- 이미지 에셋을 SVG/코드 드로잉으로 대신하는 것
- 실제 Codex 생성이 아닌 이미지에 `source: codex-imagegen` 표기

UI 아이콘 · 인터페이스용 SVG · 차트 · 단순 도형 · 배경 패턴 · CSS 장식 · 레이아웃 구성 요소는 일반 UI
구현 영역이며 이 규칙의 대상이 아닙니다. 실제 인물 · 프로젝트 · 포트폴리오 이미지가 필요하면 생성
이미지보다 실제 제공 에셋을 우선합니다. → `wiki/memory/long-term/image-generation-policy.md`

Codex 를 쓸 수 없으면 **이 순서로** 폴백합니다:

1. **이미지 없이 진행** (기본값 — 커버는 발행 필수 요소가 아님)
2. **사용자에게 직접 첨부 요청** (`source: user-upload`)
3. **웹 검색** — 라이선스 확인 필수 (`source: web-search` + `license` 기록)

강제 수단: `ImageSource` 타입에 `claude` 가 없음 · PreToolUse 훅 차단 · `auditPost()` error.
근거: `wiki/decisions/ADR-0002-codex-only-image-generation.md`

### 2. 발행은 사람만

`status` 를 `published` 로 바꾸지 않습니다. 에이전트는 `in_review` 까지만 올립니다.
발행은 사용자가 admin 검수 화면에서 수행하는 행위입니다.

### 3. 콘텐츠 접근은 저장소 인터페이스로

`getRepository()` 만 씁니다. `getAllPosts()` 같은 파일 전용 함수를 앱 코드에서 직접 부르지 마세요 —
Supabase 로 전환하면 깨집니다.

기본 드라이버는 파일(`content/posts/*.md`)이고, Supabase 키가 있으면 자동으로 DB 드라이버가 됩니다.
**키가 없는 상태가 정상 데모 상태입니다.** → `wiki/07-supabase.md`

### 4. 검수 게이트는 결정적으로

`packages/content/src/audit.ts` 에 LLM 호출을 넣지 않습니다. 사람과 에이전트가 항상 같은 결과를
봐야 합니다. 모델이 자기 결과물을 평가하면 통과 쪽으로 기웁니다.

### 5. 파일 IO 는 `@orca/content` 경유

앱 코드에서 `fs` 를 직접 import 하지 않습니다. 검증 · 감사 · 경로 해석이 한 곳에 모여 있어야
우회로가 생기지 않습니다.

> **업로드는 생성이 아닙니다.** 어드민 에디터의 이미지 업로드(`source: user-upload`)는 하드 룰 1과
> 무관합니다. 금지되는 것은 **생성**입니다.

---

## 작업 전에

1. **관련 wiki 문서를 엽니다.** 세션 시작 시 인덱스만 로드됩니다 — 필요한 문서는 직접 읽으세요.
   - 코드 수정 → `wiki/01-architecture.md`, `wiki/02-conventions.md`
   - 글 작성 → `wiki/03-content-guidelines.md`
   - 메타데이터 전략 → `wiki/04-seo-geo-playbook.md`
   - 백엔드 · 저장소 → `wiki/07-supabase.md`
   - 메타 태그 · 사이트맵 · 소유 확인 · GA4 → `wiki/08-technical-seo.md`
   - 에이전트 운영 → `wiki/05-agent-operations.md`
2. **`wiki/memory/` 에 관련 메모리가 있는지 확인합니다.**
3. **에이전트에 맡길 일인지 판단합니다.** 글쓰기는 `blog-writer`, 이미지는 `image-maker` 가
   전담합니다. `pnpm agent <id> "<작업>"` 으로 띄우세요 — Task 도구로 위임할 대상이 아닙니다.

## 작업 후에

```bash
pnpm typecheck       # 필수
pnpm build           # 앱을 건드렸다면
pnpm check           # 설정 · 스크립트 · 훅을 건드렸다면
pnpm audit:content   # 글을 건드렸다면 (발행 게이트 — admin 과 동일한 함수)
```

통과 못 한 상태로 "완료"라고 말하지 마세요. 실패했으면 실패했다고 출력과 함께 보고하세요.

결정을 내렸다면 `/save-memory` 로 근거를 남깁니다.

---

## 코드 규칙 요약

전체는 `wiki/02-conventions.md`.

- `strict: true`, `noUncheckedIndexedAccess: true`. `any` 금지.
- 외부 입력(폼 · 파일 · 환경 변수)은 zod 로 검증한 뒤 사용.
- 서버 컴포넌트가 기본. `'use client'` 는 상호작용이 실제로 필요할 때만.
- 폼은 서버 액션(`app/actions.ts`). admin 에 클라이언트 상태 라이브러리를 도입하지 않음.
- `params` / `searchParams` 는 Promise. `await` 할 것.
- 프론트매터 필드 추가 시 `schema.ts` → admin 폼 → `audit.ts` 세 곳을 함께 수정.
- 네이티브 `<select>` 금지. `components/Select.tsx`(Radix)를 씁니다. 본문 편집은 tiptap `Editor.tsx`.
- 슬러그는 자연어를 씁니다 (한글 허용). 키워드가 URL 에 남습니다. 기존 슬러그를 바꾸지 마세요.
- 커밋은 Conventional Commits.

---

## 에이전트

**Claude 서브에이전트가 아닙니다.** 각자 별도 터미널에서 도는 독립 프로세스이고 런타임이 다릅니다.
Task 도구로 위임하지 말고, 필요하면 런처로 띄우세요.

| ID | 런타임 | 모델 | 역할 | 쓰기 범위 |
| --- | --- | --- | --- | --- |
| `blog-writer` | `claude` | opus | 기획 → 작성 → SEO/GEO → 검수 | `content/posts/**` |
| `image-maker` | `codex` | default | imagegen으로 이미지 생성 · 출처 기록 | `public/images/**` + `cover` |

```bash
pnpm agent --list
pnpm agent blog-writer "<작업>"
pnpm agent image-maker "<작업>"
```

정의는 `agents/<id>/AGENT.md`, 스킬은 `agents/<id>/skills/`, 런타임·모델 매핑은 `agents/registry.yaml`.
런처가 AGENT.md + 스킬 인덱스를 시스템 프롬프트로 조립해 해당 CLI를 띄웁니다.

에이전트를 늘리는 기준은 **역할이 아니라 런타임과 병렬성**입니다. 기존 에이전트가 할 수 있는 일이면
에이전트 대신 **스킬을 추가**하세요.

---

## 슬래시 커맨드

`agents/<id>/skills/`(에이전트가 읽는 플레이북)와는 별개인, 이 세션용 커맨드입니다.

| 명령 | 용도 |
| --- | --- |
| `/orca-setup` | 의존성 전수 검사 + 설치 (+ 선택: 조직 팔로우 · 레포 스타) |
| `/save-memory` | 세션 내용을 단기 메모리에 저장, 필요 시 장기/wiki 승격 |
| `/create-agent` | 새 에이전트를 registry + AGENT.md + skills/ 에 일괄 생성 |

---

## 소통

- **한국어로 답합니다.** 코드 주석과 커밋 메시지는 영어 혼용 가능.
- 결론 먼저. 옵션을 나열하기보다 추천안을 제시하세요.
- 확인하지 않은 것을 확인했다고 말하지 마세요. 검증 명령의 실제 출력으로 뒷받침하세요.

---

## 작업 단계별 원칙

이 프로젝트는 디자인만 만드는 프로젝트가 아니다.

작업은 다음 단계로 이어진다.

1. 기획 및 요구사항 정의
2. 디자인 방향 수립
3. 와이어프레임 및 고해상도 목업
4. 디자인 확정
5. 실제 프론트엔드 구현
6. 관리자 및 데이터 연동
7. 기능 검증
8. UI/반응형 검증
9. SEO·접근성·성능 검증
10. 배포
11. 운영 이관 및 문서화

현재 작업 단계가 무엇인지 먼저 판단하고, 그 단계에 맞는 기준으로 작업한다.

- 디자인 단계에서는 구현 편의성 때문에 디자인 품질을 낮추지 않는다.
- 개발 단계에서는 승인된 디자인을 임의로 단순화하지 않는다.
- 검증 단계에서는 기존 구현을 옹호하지 말고, 요구사항과 승인된 디자인을 기준으로 독립적으로 검토한다.

---

## UI/UX 디자인 품질 원칙

### 목표

단순히 기능이 동작하는 화면이 아니라 전문 UI/UX 디자이너 또는 디지털 에이전시가 제작한 수준의
B2B 브랜드 경험을 목표로 한다.

"AI가 빠르게 만든 랜딩페이지"처럼 보이는 결과를 허용하지 않는다.

### 디자인 시작 전에

UI 구현부터 시작하지 않는다. 먼저 아래 항목을 정의한다.

1. Visual Direction
2. Brand Mood
3. Typography
4. Grid / Layout
5. Spacing System
6. Color System
7. Image / Asset Direction
8. Interaction / Motion
9. Section Hierarchy
10. Responsive Strategy

### 피해야 할 전형적인 AI 디자인

다음 패턴을 습관적으로 반복하지 않는다.

- 모든 콘텐츠를 둥근 카드 안에 넣기
- 같은 형태의 3열 카드 반복
- 의미 없는 그라데이션 남용
- 과도한 pill 형태 버튼
- 작은 아이콘 + 제목 + 설명의 반복
- 모든 섹션 중앙 정렬
- 의미 없는 glassmorphism
- 과도한 glow 효과
- 비슷한 높이의 섹션을 기계적으로 반복
- 실제 콘텐츠보다 장식이 강한 Hero
- 레퍼런스 없이 임의의 SaaS 스타일을 적용

### 디자인에서 중요하게 볼 것

- 타이포그래피의 위계
- 충분한 여백과 밀도 조절
- 섹션별 강약
- 사진과 그래픽 에셋의 품질
- 정보의 편집적 배치
- 브랜드 고유성
- 콘텐츠 자체가 돋보이는 레이아웃
- 첫 화면에서의 신뢰도
- Work와 Builder 콘텐츠의 실제성
- CTA까지 이어지는 자연스러운 흐름

---

## 기존 디자인 산출물 취급

기존 와이어프레임, HTML 목업, CSS 및 과거 AI 생성 시안은 프로젝트 기록과 요구사항 확인을 위한 자료다.

사용자가 명시적으로 레퍼런스로 지정하지 않은 과거 시안은 신규 디자인의 품질 기준으로 사용하지 않는다.

특히 다음 파일과 디렉터리는 새로운 디자인 작업 시 자동으로 스타일을 계승하지 않는다.

- `docs/wireframes-3ans.html`
- `docs/mockups-3ans.html`
- `docs/자료/2조/와이어프레임_프론트엔드/**`

기존 코드가 존재한다는 이유만으로 색상, 컴포넌트, 카드 구조, 여백, 타이포그래피를 유지하지 않는다.

다만 요구사항, 정보구조, 콘텐츠와 이미 확정된 기능 정책은 필요에 따라 기존 자료에서 확인한다.

---

## 멀티에이전트 작업 원칙

독립성이 높은 개발·조사·테스트·검증 작업은 멀티에이전트 병렬 실행을 적극 활용한다.

그러나 하나의 화면 또는 하나의 브랜드 경험을 구성하는 UI/UX 디자인을 섹션별로 독립 병렬 디자인하지 않는다.

디자인 단계에서는 하나의 책임 주체가 전체 Visual Direction을 먼저 결정한다.

Hero / Work / Builder / Insight / CTA / Footer는 서로 다른 디자인이 아니라 하나의 디자인 시스템으로 취급한다.

전체 디자인이 확정된 이후에는 다음 작업을 병렬화할 수 있다.

- 컴포넌트 구현
- 관리자 기능
- 데이터 연동
- SEO
- 테스트
- 접근성 검증
- 성능 검증
- 콘텐츠 검수

단, 병렬 작업 결과는 최종 통합 검수를 거친다.

---

## 관리자 시스템

관리자는 단순 블로그 CMS가 아니다. 공개 사이트에서 사용되는 신뢰 정보와 콘텐츠를 운영하기 위한
관리 시스템이다.

주요 관리 대상은 다음과 같다.

### Builder
- 기본 프로필
- 전문 분야
- 소개
- 교육 이력
- 커뮤니티 활동
- 검증 정보
- 프로젝트 참여 이력
- 공개 여부

### Work / Portfolio
- 프로젝트명
- 프로젝트 소개
- 수행 범위
- 빌더 역할
- 작업 기간
- 사용 기술
- 문제 및 해결 과정
- 결과
- 이미지/에셋
- 참여 빌더
- 공개 상태

### Work Process
- 프로젝트 진행 방식
- 협업 방식
- 개발 프로세스
- 품질 검증 방식

### Insight
- 제목
- 본문
- 작성자
- 카테고리/태그
- SEO 정보
- 공개 상태

관리자는 데이터 입력뿐 아니라 검수 → 승인 → 공개 상태를 관리할 수 있어야 한다.

세부 필드는 PRD에 따라 조정한다.

---

## 검증 원칙

완료 판단은 "화면이 보인다"가 아니다.

### 디자인 검증
- 승인 목업과 구현 비교
- Typography
- Spacing
- Alignment
- 이미지 품질
- Responsive
- Hover / Interaction
- Empty / Loading / Error 상태

### 기능 검증
- Builder CRUD
- Work CRUD
- Insight CRUD
- 공개/비공개 상태
- 관련 콘텐츠 연결
- 문의
- 권한
- Validation

### 기술 검증
- typecheck
- lint
- build
- 테스트
- Console error
- Broken link
- 이미지 최적화
- SEO metadata
- sitemap / robots
- 접근성
- Core Web Vitals

검증 결과를 실제 실행 결과 없이 추정해서 "완료"라고 보고하지 않는다.

---

## 배포 및 이관

프로젝트 완료는 코드 구현 종료가 아니다.

최종 단계에는 다음을 포함한다.

- Production build 확인
- 환경변수 목록 정리
- 배포 절차 정리
- 관리자 계정 및 권한 확인
- 데이터 구조 설명
- 운영자 콘텐츠 등록 방법
- 장애 발생 시 확인 항목
- 외부 서비스/API 목록
- 도메인 및 DNS 관련 정보
- 분석/SEO 도구 설정
- Git 저장소 및 브랜치 상태
- 알려진 이슈
- 유지보수 시 주의사항

운영자가 개발자에게 다시 문의하지 않아도 기본적인 콘텐츠 등록과 운영이 가능하도록 이관한다.
