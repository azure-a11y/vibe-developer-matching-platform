# 11 — 검증 단계 CLAUDE.md

> "기능 검증 / UI·반응형 검증 / SEO·접근성·성능 검증"(`CLAUDE.md` "작업 단계별 원칙" 7~9단계) 작업을
> 시작하기 전에 이 문서를 먼저 엽니다.

## 언제 이 문서를 여는가

- 구현된 기능이 승인된 디자인·요구사항과 일치하는지 확인
- 배포 전 마지막 점검
- 다른 세션(또는 다른 에이전트)이 작업했다고 주장하는 내용을 재검토

## 검증 단계의 원칙: 독립적으로 검토한다

`CLAUDE.md` "작업 단계별 원칙": *"검증 단계에서는 기존 구현을 옹호하지 말고, 요구사항과 승인된 디자인을
기준으로 독립적으로 검토한다."*

- 구현자 본인이 "됐다"고 보고했더라도 그대로 믿지 않는다 — 실행 결과로 재확인한다.
- 개발과 검증을 같은 컨텍스트에서 이어서 하지 않는다(같은 사람이 방금 만든 걸 그 자리에서 통과시키는
  구조를 피한다). `CLAUDE.md` execution_protocols의 "authoring과 review는 분리된 패스로 유지" 원칙과
  동일하다.

## 3갈래 체크리스트

`CLAUDE.md` "검증 원칙" 절을 그대로 상속한다.

### 디자인 검증
- 승인 목업과 구현 비교
- Typography / Spacing / Alignment
- 이미지 품질
- Responsive
- Hover / Interaction
- Empty / Loading / Error 상태

### 기능 검증
- Builder CRUD
- Work CRUD
- Insight CRUD
- 공개/비공개 상태 전환(FR-6 AC-6.1·AC-6.2 — 승인 전 비공개 유지)
- 관련 콘텐츠 연결(Work → 빌더 프로필, Insight → 작성자)
- 문의(FR-4 — pluug 리드 적재까지 E2E)
- 권한(FR-10 — 등급별 메뉴 접근, 빌더 개별 권한)
- Validation(zod 스키마 경계)

### 기술 검증

```bash
pnpm typecheck
pnpm build
pnpm check
pnpm audit:content
```

추가로 확인: Console error · Broken link · 이미지 최적화 · SEO metadata · sitemap/robots · 접근성 ·
Core Web Vitals.

## 이미 알려진 갭과 먼저 대조한다

검증 중 발견한 문제를 새 버그로 보고하기 전에, [`docs/analysis/02-unfinished-features.md`](../docs/analysis/02-unfinished-features.md)
(P1~P3)에 이미 기록된 항목인지 먼저 확인한다. 이미 알려진 갭이면 중복 보고 대신 해당 항목을 인용한다.
예: 어드민 무인증(P2 #4), 테스트 0개(P2 #5), Supabase 드라이버 미검증(P2 #6).

## GA/트래킹 검증 (이 프로젝트 고유)

기획서 §9.2 실측 사례 — CTA 버튼 하나로 주간 문의가 10~20건에서 0건까지 떨어진 전례가 있다. 신규 UI
요소를 추가했다면, 배포 전 반드시:
- 요소 단위 클릭 이벤트가 GA에 태깅됐는지 확인(PRD AC-8.2)
- FAQ 등 옵션 전환 UI가 실제로 URL 슬러그를 바꾸는지 확인(PRD AC-8.1, 예: `/faq/aiax` ↔ `/faq/it`)

## 이 단계에서 하면 안 되는 것

- 실행 결과 없이 "통과"라고 보고하는 것 — 검증 명령의 실제 출력으로 뒷받침한다(`CLAUDE.md` 소통 원칙)
- 실패를 발견하고도 범위를 좁혀 우회 보고하는 것
- 승인된 디자인 기준이 아니라 "지금 구현된 것"을 기준으로 정당화하는 것

## 다음 단계로 넘어가는 기준

- 3갈래 체크리스트 전 항목에 대해 실제 확인 결과가 있다(추정 아님)
- 발견된 이슈가 있다면 배포 블로커인지(P1/P2) 개선 후보인지(P3) 분류됐다
- 통과하면 [12-phase-deployment.md](./12-phase-deployment.md)로 넘어간다.

## 관련 문서

[10-phase-development](./10-phase-development.md) · [08-technical-seo](./08-technical-seo.md) ·
[12-phase-deployment](./12-phase-deployment.md)
