# 12 — 배포 단계 CLAUDE.md

> "배포"(`CLAUDE.md` "작업 단계별 원칙" 10단계) 작업을 시작하기 전에 이 문서를 먼저 엽니다.
> [11-phase-verification.md](./11-phase-verification.md)를 통과하지 못했다면 이 단계로 넘어오지 않습니다.

## 언제 이 문서를 여는가

- Production 빌드/배포를 실제로 실행하기 직전
- 도메인·환경변수·외부 서비스 계정을 확정하는 작업

## 배포 전 하드 블로커 — 먼저 확인

아래가 해소되지 않았으면 배포를 진행하지 말고 사용자에게 보고한다.

| 블로커 | 근거 |
| --- | --- |
| 어드민(`apps/admin`, :3001)이 무인증 상태 | [`docs/analysis/02-unfinished-features.md`](../docs/analysis/02-unfinished-features.md) P2 #4, PRD FR-10 AC-10.6이 "인증 구현(WO-3) 선행 필요"라고 명시 |
| WO-3(어드민 보호)가 미완료 | [`docs/analysis/05-work-orders.md`](../docs/analysis/05-work-orders.md) WO-3 |
| pluug 연동이 임시 계정 상태 | PRD Q7/Q20 — 정식 계정 이관은 클라이언트가 별도 처리(기획서 §17.2) |
| 도메인 미확정 | PRD Q3 — `builderschool.ai` 계승 vs 신규 구매 |

로컬 데모 상태가 이 템플릿의 기본 원칙이라는 것(`CLAUDE.md` 하드 룰, [07-supabase.md](./07-supabase.md))과
"프로덕션 배포"는 다른 이야기다. 키/인증 없이 돌아가는 것이 정상인 것과, 그 상태로 공개 배포하는 것은
구분한다.

## 배포 전 체크리스트

- [ ] `pnpm build` 로 두 앱(web, admin) production 빌드 성공 확인
- [ ] `.env.example` 기준 필요한 환경변수 전수 목록화(Supabase 키, ADMIN_USER/PASSWORD 등)
- [ ] Vercel — 기존 계정 재사용(신규 계정 불필요, 기획서 §17.2)
- [ ] GA4 — 계정 요청 → 클라이언트 계정을 협업자로 초대(기획서 §17.2)
- [ ] 구글/네이버 서치콘솔 — 클라이언트가 전달한 이메일 계정으로 등록(기획서 §17.2)
- [ ] Supabase — 팀 개인 무료 프로젝트가 아니라 클라이언트 정식(유료) 프로젝트로 이관됐는지 확인
      (오너 권한은 팀장에게 이미 부여됨, 기획서 §17.2)
- [ ] SEO 테크니컬 세팅(메타태그/사이트맵/소유확인) 최종 점검 → [08-technical-seo.md](./08-technical-seo.md)

## 이 단계에서 하면 안 되는 것

- 도메인이 미확정인 채로 하드코딩된 URL을 프로덕션에 반영하는 것
- 어드민 무인증 상태로 공개 배포하는 것
- 배포 후 검증 없이 완료로 보고하는 것 — 배포 직후 실제 URL 접속 확인이 필요하다

## 다음 단계로 넘어가는 기준

- Production 빌드가 실제 배포 환경에서 정상 동작 확인됨
- 구글·네이버 색인 확인 완료(PRD M3 완료 기준)
- [13-phase-handoff.md](./13-phase-handoff.md)로 넘어간다.

## 관련 문서

[11-phase-verification](./11-phase-verification.md) · [07-supabase](./07-supabase.md) ·
[08-technical-seo](./08-technical-seo.md) · [13-phase-handoff](./13-phase-handoff.md)
