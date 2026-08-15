# 10 — 개발 단계 CLAUDE.md

> "프론트엔드 구현 / 관리자 및 데이터 연동"(`CLAUDE.md` "작업 단계별 원칙" 5~6단계) 작업을 시작하기 전에
> 이 문서를 먼저 엽니다.

## 언제 이 문서를 여는가

- 승인된 디자인을 실제 코드(Next.js 컴포넌트)로 구현
- 관리자(`apps/admin`) 기능 · Supabase 연동 개발
- `docs/analysis/05-work-orders.md`의 WO를 실행

디자인이 아직 확정 전이면 [09-phase-design.md](./09-phase-design.md)를 먼저 확인하세요.

## 먼저 참고할 문서 (중복 서술 없음 — 링크만)

- `CLAUDE.md` 하드 룰 1~5 (이미지 생성, 발행 게이트, 저장소 인터페이스, 검수 결정성, 파일 IO)
- [01-architecture.md](./01-architecture.md) — 모노레포 구조, 데이터 흐름, 경계 규칙
- [02-conventions.md](./02-conventions.md) — TypeScript/React 규칙, 네이밍, 커밋, 검증 명령
- [04-seo-geo-playbook.md](./04-seo-geo-playbook.md) — 콘텐츠 메타데이터 전략
- [07-supabase.md](./07-supabase.md) — 백엔드 전환 시 참고
- `docs/planning/AI빌더그룹_PRD.md` §4(FR-1~FR-10), §8(오픈 이슈)

## 승인된 디자인을 임의로 단순화하지 않는다

디자인 확정 단계를 통과한 결과물은 구현 편의를 이유로 컴포넌트를 합치거나, 인터랙션을 생략하거나,
레이아웃을 단순화하지 않는다(`CLAUDE.md` "작업 단계별 원칙"). 구현이 어려운 부분이 있으면 임의로
바꾸지 말고 사용자에게 먼저 보고한다.

## 작업 큐는 `docs/analysis/05-work-orders.md`를 그대로 쓴다

새 작업 목록을 별도로 만들지 않는다. 이미 우선순위(P1 > P2 > P3)와 권장 실행 순서까지 정리돼 있다:

```
WO-6(콘텐츠 완결) → WO-2(게이트 테스트) → WO-1(예약 발행) → WO-3, WO-4(운영 기반)
→ WO-5(백엔드 검증) → WO-7, WO-8(개선)
```

각 WO는 독립 세션 1개 분량 — 한 세션에 두 개 이상 묶지 않는다(검증 게이트가 섞이기 때문).
현재 알려진 미완성 기능 전체 목록은 [`docs/analysis/02-unfinished-features.md`](../docs/analysis/02-unfinished-features.md).

## Out of Scope — 이 단계에서 만들지 않는 것

PRD 확정 사항(D1~D3, D10)을 재확인한다:

| 결정 | 내용 |
| --- | --- |
| D1 | 3사(크몽·똑똑한 개발자·이솝) 소개 페이지를 만들지 않는다 |
| D2 | AX 컨설팅 콘텐츠/서비스를 만들지 않는다 |
| D3 | 관리자에 매칭 기능·CRM을 넣지 않는다(리드는 pluug가 전담) |
| D10 | GEO/AEO 별도 대응을 만들지 않는다(테크니컬 SEO 세팅까지만) |

기능 요구사항이 불명확하면 PRD §8 오픈 이슈(Q1~Q21)를 먼저 확인하고, 없으면 사용자에게 묻는다 —
임의로 범위를 넓히지 않는다.

## 기능 완료 기준

기능별 수용 기준을 이 문서에 복사하지 않는다 — 이중 관리로 어긋날 위험이 있다. 작업 전 반드시
`docs/planning/AI빌더그룹_PRD.md`에서 해당 FR-N과 AC-N.M을 직접 열어 확인한다.

| 기능 영역 | PRD 위치 |
| --- | --- |
| 홈 · 첫 메시지 | FR-1 |
| Work(포트폴리오) | FR-2 |
| Insight(콘텐츠/블로그) | FR-3 |
| 문의하기 · pluug 연동 | FR-4 ⭐ 핵심 |
| 관리자 · 블로그 관리 | FR-5 |
| 관리자 · 유저(빌더) 관리 + 승인 | FR-6 |
| 빌더 프로필 | FR-7 (IA만, 기능은 백로그 — Q8) |
| SEO · GA 트래킹 | FR-8 |
| Eduinfo(교육 콘텐츠) | FR-9 |
| 관리자 계정·등급·권한 | FR-10 (인증 구현 WO-3 선행 필요, AC-10.6) |

## 프론트매터 필드를 추가할 때

`packages/content/src/schema.ts` → admin 폼 → `packages/content/src/audit.ts` 세 곳을 함께 수정한다
(`CLAUDE.md` 코드 규칙 요약, [01-architecture.md](./01-architecture.md) 확장 지점).

## 검증 명령 (작업 후 필수)

```bash
pnpm typecheck       # 필수
pnpm build           # 앱을 건드렸다면
pnpm audit:content   # 글을 건드렸다면
```

통과하지 못한 상태로 완료라고 보고하지 않는다. 상세 검증은 [11-phase-verification.md](./11-phase-verification.md).

## 이 단계에서 하면 안 되는 것

- `audit.ts`에 LLM 호출을 넣는 것 (결정성이 깨짐)
- `content/posts/*.md`를 `@orca/content` 밖에서 직접 쓰는 것
- `status: published`로 쓰는 것 (발행은 사람만)
- 이미지를 직접 생성하는 것 (Codex `imagegen` 위임 또는 `image-maker` 에이전트)
- 관리자에 클라이언트 상태 라이브러리를 도입하는 것 (`useState` 최소 사용은 `Editor.tsx`처럼 예외적으로 허용)

## 다음 단계로 넘어가는 기준

- 해당 WO/FR의 typecheck·build·audit:content가 전부 통과했다
- 실제 실행 결과(터미널 출력)를 근거로 첨부했다
- [11-phase-verification.md](./11-phase-verification.md)로 넘어가 독립적으로 재검증한다 — 개발자 본인이
  통과라고 판단한 것과 검증 단계의 판단은 분리한다.

## 관련 문서

[09-phase-design](./09-phase-design.md) · [01-architecture](./01-architecture.md) ·
[02-conventions](./02-conventions.md) · [11-phase-verification](./11-phase-verification.md)
