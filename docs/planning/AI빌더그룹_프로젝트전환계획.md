# AI 빌더 그룹 — 프로젝트 전환 계획 (Orca 템플릿 → 실제 제품)

> 작성일 2026-08-14 · 상태: 초안(v1) — 실행 착수 전 리뷰 필요
> 입력 문서: `docs/planning/AI빌더그룹_기획서.md`(§1~18), `AI빌더그룹_PRD.md`(v4, §1~12),
> `artifact/builder-group/**`, `artifact/admin/**`, `artifact/concepts/**`,
> `wiki/09~13-phase-*.md`(초안), `docs/analysis/*`(Orca 템플릿 자체 미완 기능 — 이 계획과는 별개 트랙),
> `packages/content/src/schema.ts`(현재 데이터 모델), 현재 `apps/web` / `apps/admin` 라우트 구조.
>
> 이 문서는 "00~06 문서 세트"를 대체하지 않는다 — **§4에서 그 문서 세트를 어떻게, 누가, 무엇으로부터
> 만들지를 정의**하고, 그 문서들이 나온 뒤 실제 코드를 어떤 순서로 바꿀지(§7~9)를 정의한다.

---

## 0. 한 줄 요약

지금 이 저장소는 **"AI 에이전트가 블로그를 운영하는 법을 보여주는 템플릿"** 코드 위에
**"AI 빌더 그룹 B2B 영업 사이트"** 기획·목업이 올라와 있는 상태다. 목업은 미확정(2안 → 1안 통합 전)이고,
실제 Next.js 코드는 아직 블로그 그대로다. 전환의 본질은 세 가지다.

1. **디자인을 먼저 1개로 확정한다** (지금 착수하면 안 됨 — Q18/Q19 미해결)
2. **데이터 모델을 블로그 전용(Post)에서 도메인 5종(Insight/Work/Builder/WorkProcess/Eduinfo) + 관리자 계정·권한 + 사이트 설정으로 재설계**하되, repository 인터페이스 패턴(하드 룰 3)은 유지한다
3. **apps/web·apps/admin의 라우트/화면을 그 데이터 모델 위에 새로 구현**한다 — 지금 정적 목업(`artifact/*`)은 코드가 아니라 "요구사항이 확인된 레퍼런스"로만 쓴다(`wiki/09-phase-design.md` 원칙 그대로)

---

## 1. 현재 상태 진단 (As-Is)

### 1.1 실제 코드 (변경 대상)

| 레이어 | 현재 상태 | 목표 제품과의 관계 |
| --- | --- | --- |
| `packages/content/src/schema.ts` | `PostFrontmatterSchema` 1종 — 블로그 글(제목/슬러그/태그/SEO/GEO/리뷰) | Insight 도메인에는 거의 그대로 재사용 가능. Work/Builder/WorkProcess/Eduinfo/관리자 계정·권한/사이트 설정은 **스키마 자체가 없음** |
| `packages/content/src/repo/*` | file·supabase 드라이버, `Post` 전용 인터페이스 | 도메인별 저장소로 확장 필요 (§5) |
| `apps/web` | 홈(피처드+목록) / `/blog` / `/blog/[slug]` / `/about` | Work·Builder·Insight(신규 IA)·Eduinfo·문의하기 라우트가 전부 없음. `/about`은 "3사 소개 없음"(D1) 요구사항과 상충 — 재정의 필요 |
| `apps/admin` | 글 목록/편집기/검수/SEO 대시보드만 | Builder·Work·Work Process·계정·권한 메뉴 없음. 인증 자체가 없음(WO-3 미완료) |
| `apps/web`, `apps/admin` 인증 | 없음(무인증 로컬 데모가 "정상 상태"인 템플릿 전제) | PRD FR-10이 로그인·계정 표시·비밀번호 변경을 요구 — 템플릿 전제와 정면 충돌, 전환 시 반드시 다뤄야 함 |

### 1.2 기획·디자인 산출물 (참고 대상, 코드 아님)

| 산출물 | 성숙도 | 비고 |
| --- | --- | --- |
| 기획서(§1~18) | 2차 미팅까지 반영, 안정적 | 3사 구조·소구점·D1~D11 결정사항이 확정 근거 |
| PRD v4(FR-1~10, NFR, MoSCoW, 마일스톤) | 상세하나 **오픈이슈 21개** 잔존 | Q1·Q18·Q19가 디자인 확정의 실질적 차단자 |
| `artifact/builder-group`(1안, Human Craft) | 정적 HTML 라이브 빌드, 섹션 인터랙션 구현됨 | 상세 컴포넌트에 "AI스러운 느낌" 피드백(Q19) — 미해결 |
| `artifact/admin`(권한 시안) | 계정·등급·메뉴 매트릭스·로그인 화면 시안 | 등급 이름·범위 클라이언트 미확인(Q21) |
| `artifact/concepts`(5안) | 초기 후보, 2안으로 압축 완료 | 탈락 3안은 사유 문서화 대상(A1) — 미확인 |
| `wiki/09~13-phase-*.md` | 이 프로젝트 전용 단계별 CLAUDE.md 초안, 아직 미커밋 | §7 로드맵과 1:1로 맞춰 재사용 |

### 1.3 문서 세트 격차 — 요청하신 00~06

| 번호 | 요청 문서 | 현재 상태 |
| --- | --- | --- |
| 00 기획서 | ✅ 존재 (`AI빌더그룹_기획서.md`) | |
| 01 요구사항정의서 | ⚠️ PRD가 실질적으로 이 역할을 겸함, 별도 문서 없음 | |
| 02 화면목록(IA) | ❌ 없음 — 기획서 §3, PRD §3/§10 표에 산재 | |
| 03 기능명세 | ⚠️ PRD FR-1~10이 기능명세를 겸함 (Given/When/Then까지 있음) — 화면 단위로 재편은 안 됨 | |
| 04 정책정의 | ❌ 없음 — 카피 원칙·발행 게이트·권한 정책이 기획서/PRD/CLAUDE.md에 분산 | |
| 05 화면설계 | ❌ 없음 — `artifact/*` HTML이 사실상 화면설계를 대신하고 있으나 확정 아님 | |
| 06 데이터모델 | ❌ 없음 — 코드(`schema.ts`)도 아직 목표 도메인을 반영 안 함 | |

---

## 2. 목표 상태 (To-Be) — PRD 기준 정보구조

```
AI 빌더 그룹
├─ Home           3사 소개 없이 "바이브 코딩 외주" 즉시 전달 (FR-1)
├─ Work           포트폴리오, 카드 클릭 → 빌더 상세(모달 또는 별도 페이지, Q17 미정) (FR-2)
├─ Insight        블로그형 아티클, 빌더 작성 글 → 빌더 프로필 연결 (FR-3)
├─ Eduinfo        강의 인덱스 + 유튜브 임베드 + PDF 자료 (FR-9)
├─ 문의하기        pluug 폼 연동, 관리자에서 링크 교체 가능 (FR-4)
└─ 관리자(admin)
   ├─ 대시보드
   ├─ Builder      빌더 계정·프로필 관리, 프로젝트 승인
   ├─ Work         포트폴리오 관리
   ├─ Work Process 일하는 방식 콘텐츠 관리
   ├─ Insight      블로그 관리 (기존 apps/admin 게이트 재사용)
   ├─ 설정         pluug 폼 링크 등 사이트 설정
   └─ 계정 · 권한   관리자 등급·메뉴 매트릭스, 빌더별 개별 권한, 로그인/비밀번호 변경 (FR-10)
```

빌더 프로필(FR-7)은 별도 최상위 메뉴가 아니라 Work 상세에 흡수될 가능성이 큼(Q17) — §4에서 IA 문서로
확정.

---

## 3. 격차 분석 — 영역별로 "무엇을 결정해야 코드를 시작할 수 있는가"

### 3.1 디자인 (가장 시급 — 다른 모든 작업의 선행조건)

- **Q18 (1안/2안 통합)**: 미해결. CLAUDE.md "멀티에이전트 작업 원칙" 상 이 결정은 **한 명의 책임 주체**가
  내려야 하고, 병렬 디자인 금지 원칙이 적용된다. 코드 전환은 이 결정 없이 시작할 수 없다 — 시작하면
  "승인된 디자인을 임의로 단순화"하는 것과 동급의 리스크(잘못된 기준으로 구현 후 재작업).
- **Q19 (상세 컴포넌트 AI스러움)**: 어떤 컴포넌트가 문제인지 구체적 기준이 없음. 실제 코드 구현 전에
  최소한 "무엇이 AI스러운가"의 판단 기준(예: 카드 반복, 균일 높이, 의미 없는 그라데이션 등 CLAUDE.md
  "피해야 할 전형적 AI 디자인" 체크리스트)으로 `artifact/builder-group` 상세 뷰를 먼저 감사(audit)해야
  한다.
- **Q11/Q12 (Related Links 6개 플레이스홀더 로고, 푸터 사업자 정보)**: 디자인 확정과 별개로 **사실
  확인이 필요한 법적/신뢰 표기** — 클라이언트 확인 없이 실제 값으로 착각해 배포하면 안 됨.

### 3.2 데이터 모델

현재 스키마는 "Post 1종"이다. 목표는 최소 5개 콘텐츠 도메인 + 2개 시스템 도메인이다.

| 도메인 | PRD 근거 | 현재 존재 여부 |
| --- | --- | --- |
| Insight | FR-3 | 기존 `PostFrontmatterSchema`를 이름만 바꿔 재사용 가능 |
| Work(프로젝트) | FR-2 | 없음 — 참여 빌더 참조, 상태(승인대기/공개) 관리 필요 |
| Builder(빌더 프로필) | FR-6, FR-7 | 없음 — 계정 + 프로필 + 참여 프로젝트/작성 콘텐츠 역참조 |
| WorkProcess | 관리자 메뉴 §5.1(기획서) | 없음 — PRD 기능명세는 얕음, §4에서 보강 필요(Open) |
| Eduinfo | FR-9 | 없음 — 강의(영상 URL, PDF 링크) 목록형 |
| AdminAccount/Permission | FR-10 | 없음 — 등급, 메뉴별 권한 매트릭스, 빌더 개별 토글 |
| SiteSettings | FR-5 AC-5.3(pluug 링크) | 없음 — 키-값 설정 저장소 필요 (pluug URL 등) |

### 3.3 저장소/인프라

- Supabase: "팀별 개인 무료 프로젝트 → 최종 확정 페이지만 정식 프로젝트로 이관" 방침(기획서 §17.2)이
  이미 있음 — `packages/supabase` 마이그레이션 스크립트를 **위 신규 도메인 테이블 기준으로 재작성** 필요
  (현재는 posts 테이블 1개 기준으로 추정됨, 확인 필요).
- 인증: `apps/admin` 무인증 → FR-10이 로그인을 필수 요구. `docs/analysis/05-work-orders.md`의 WO-3
  (Basic Auth)는 이 요구사항에 비해 **너무 얕음** — FR-10은 등급별 세분 권한을 요구하므로 Basic Auth가
  아니라 실제 계정 테이블 기반 인증이 필요. WO-3는 이 전환 계획의 대체 대상으로 흡수한다.
- pluug 연동: API/임베드/리다이렉트 미확정(Q7/Q20) — 코드는 "링크를 관리자 설정값으로 관리"하는
  형태로 우선 구현 가능(기획서 §17.2 방침), 최종 연동 방식은 나중에 교체 가능하게 추상화.

### 3.4 콘텐츠

- Work 초기 콘텐츠 소스 미정(Q4, 똑똑한 개발자 실적 전용 가능 여부) — 코드는 "0건이어도 배포 가능한
  빈 상태"를 반드시 지원해야 함(PRD AC-2.3).
- 브랜드명 미확정(Q1) — 코드에 "AI Builder Group" 하드코딩 금지, 설정값으로 분리.

---

## 4. 00~06 문서 세트 재구성 계획

기존 기획서/PRD/목업에서 **추출**하는 작업이지 새로 창작하는 작업이 아니다. 순서가 중요하다 — 02·05는
디자인 확정(§7 Phase 1) 이후에만 최종본이 나올 수 있다.

| 번호 | 문서 | 소스 | 지금 가능한가 | 산출 방법 |
| --- | --- | --- | --- | --- |
| 00 | 기획서 | 기존 파일 그대로 | ✅ | 변경 없음 |
| 01 | 요구사항정의서 | PRD §1~2, §5(NFR), §6(MoSCoW) 재편 | ✅ 지금 가능 | PRD에서 "무엇을/왜"만 추출, FR 번호 체계는 유지 |
| 02 | 화면목록(IA) | 기획서 §3, PRD §3·§10(변경이력 표의 실제 섹션 순서), `artifact/builder-group` 실제 섹션 구조 | ⚠️ **초안만 지금 가능** — Q17(빌더 프로필 구조), Q18(1/2안 통합) 확정 후 최종화 | 화면 트리 + 각 화면의 진입경로/이탈경로 표 |
| 03 | 기능명세 | PRD FR-1~10 (Given/When/Then 이미 있음) | ✅ 지금 가능 | 화면 단위로 재편(FR을 화면에 매핑) |
| 04 | 정책정의 | 기획서 §2.4(1기 문구 정책), §2.5(가격 소구 금지), §8(디자인 품질), CLAUDE.md 하드 룰, FR-10 권한 정책 | ✅ 지금 가능 | "카피 정책 / 콘텐츠 진실성 정책 / 발행 게이트 정책 / 권한 정책" 4절로 통합 |
| 05 | 화면설계 | `artifact/builder-group`, `artifact/admin` (요구사항 확인용) | ❌ **디자인 확정 전에는 임시본만** | Q18 통합 완료 후 확정 디자인 기준으로 재작성 |
| 06 | 데이터모델 | §3.2 표 + 기존 `schema.ts` 패턴 | ✅ 지금 가능(스키마 설계는 디자인과 독립적으로 먼저 시작 가능) | ERD + zod 스키마 초안 |

**권장**: 01·03·04·06은 이번 주 안에 바로 작성 가능(디자인 확정을 기다릴 필요 없음). 02·05는 §7
Phase 1(디자인 확정) 완료 후 확정본 작성. 이 순서 자체가 "디자인은 통합해서 하나로, 개발/데이터는
병렬 가능"이라는 CLAUDE.md 원칙과 일치한다.

---

## 5. 데이터 모델 전환 방향

### 5.1 원칙

- 하드 룰 3(`getRepository()` 경유)을 그대로 유지한다 — 도메인이 늘어나도 앱 코드는 저장소 구현
  (file/Supabase)을 직접 알지 못한다.
- 기존 `Post`를 삭제하지 않고 **`Insight`로 개명 + 재사용**한다(SEO/GEO/Review 구조가 이미 FR-3
  요구사항과 대부분 일치).
- 신규 도메인마다 `packages/content/src/schema.ts`에 zod 스키마 → `repo/types.ts`에 인터페이스 →
  `repo/file.ts` / `repo/supabase.ts`에 드라이버 순으로 동일 패턴 반복.

### 5.2 신규 스키마 초안 (설계 방향, 확정 아님 — 06번 문서에서 확정)

```
Builder
  id, displayName, slug, avatar(Image), bio, specialties[], education[],
  communityActivity[], verifications[], status(pending|active|inactive),
  role permissions: { canWriteInsight, canEditInsight, canDeleteInsight(default false) }
  ← Work.builderIds[], Insight.authorId 로부터 역참조

Work
  id, title, slug, summary, scope, builderRole, period, techStack[],
  problem, solution, result, assets(Image[]), builderIds[],
  status(pending_review|published|archived), createdAt/updatedAt

WorkProcess
  id, title, body, order  ← "일하는 방식" 콘텐츠, Work와 별개로 정책성 콘텐츠

Eduinfo(강의)
  id, title, youtubeUrl, pdfUrl, order, description

AdminAccount
  id, email, name, grade(최종관리자|콘텐츠관리자|검수담당 — 이름 자체 Q21 미확정),
  passwordHash, menuPermissions: { dashboard, builder, work, workProcess, insight, settings, accountPermission }
  각 값: full|edit_approve|view|none

SiteSettings
  key-value: pluugFormUrl, brandName, domain 등 — "코드에 하드코딩 금지" 원칙 강제 장치
```

### 5.3 Insight(기존 Post) 변경 최소화 원칙

FR-3 요구사항(카테고리 재구성, 작성자→빌더 프로필 연결)만 추가한다:
- `author: string` → `authorBuilderId: string (optional)`로 확장(기존 필드 유지, 마이그레이션 없이 옵션 추가)
- `category` 값 집합을 "일하는 방식/AI 활용 공유회/빌더가 쓴 글"로 재정의(코드 강제 아님, 문서화)

---

## 6. 애플리케이션 구조 전환 방향

### 6.1 apps/web

- 기존 `/blog`, `/blog/[slug]`는 **삭제하지 않고 `/insight`, `/insight/[slug]`로 리네이밍**하는 편이
  구현 재사용률이 높다(레이아웃, 메타데이터 생성기, JSON-LD 로직 그대로 재사용).
- `/about`은 D1(3사 소개 페이지 없음)과 상충하므로, 없애거나 "일하는 방식(Work Process)" 페이지로
  성격을 바꾼다 — §4의 02번 문서(IA)에서 최종 결정.
- 신규 라우트: `/work`, `/work/[slug]`(또는 모달, Q17), `/eduinfo`, 문의하기는 페이지가 아니라
  전역 모달(현재 목업 패턴 유지가 합리적).

### 6.2 apps/admin

- 좌측 네비를 대시보드/Builder/Work/Work Process/Insight/설정/계정·권한 7개로 재편(`artifact/admin`
  시안 그대로 구조 확인용으로 참고, 스타일은 디자인 확정 후 재작업).
- 기존 글 관리 화면(`app/posts`, `app/review`)은 Insight 메뉴 하위로 이동, 로직은 거의 그대로 재사용.
- 인증 레이어 신설이 다른 모든 관리자 기능의 선행조건 — §3.3에서 WO-3보다 강화된 요구사항으로 대체.

### 6.3 하지 않는 것

- `artifact/builder-group`, `artifact/admin`의 정적 HTML/CSS/JS를 그대로 복사해 Next.js 컴포넌트로
  옮기지 않는다. 참고해 재구현한다(`wiki/09-phase-design.md` 원칙) — 정적 프로토타입은 상태 관리·
  데이터 바인딩·라우팅이 전혀 없어 그대로 옮기면 오히려 재작업이 커진다.

---

## 7. 단계별 실행 로드맵

CLAUDE.md 11단계 원칙에 매핑. 각 단계의 Entry/Exit 기준과 병렬화 가능 범위를 명시한다.

### Phase 0 — 오픈이슈 압축 (지금 당장, 코드 변경 없음)

**목표**: 코드 전환을 막는 질문만 먼저 좁힌다. 전부 풀 필요는 없다.
- 필수 확인: Q18(디자인 통합 방향), Q1(브랜드명 — 최소 "가제로 진행" 합의라도), Q4(Work 초기 콘텐츠
  소스 — "0건 빈 상태로 런칭" 허용 여부)
- 선택 확인(지연 가능): Q2·Q5·Q6(정산/일정 내부 사안, 코드와 무관)
- **산출물**: §4의 01·03·04·06 문서 초안 작성 (지금 가능한 것부터)
- **담당**: 기획/PM 트랙 — 코드 작업과 병렬 가능

### Phase 1 — 디자인 확정 (CLAUDE.md 3~4단계)

**Entry**: Phase 0의 Q18 답 확보
**목표**: 1안+2안을 하나의 디자인 시스템으로 통합, 상세 컴포넌트의 "AI스러움"(Q19) 해소
- 한 명의 책임 디자이너(또는 팀장 2인 총대)가 Visual Direction 10항목(`wiki/09-phase-design.md`)을
  확정
- `artifact/builder-group`(1안 인터랙션 강점)과 2안(에셋·Eduinfo 강점)을 하나로 병합한 **확정
  디자인 시스템**을 `artifact/` 내 신규 폴더(예: `artifact/builder-group-final/`)에 정적 산출물로
  먼저 완성 — 아직 Next.js 코드 아님
- 병렬 금지: 섹션별로 다른 담당자에게 동시 배정하지 않는다
- **Exit 기준**: `wiki/09-phase-design.md`의 "다음 단계로 넘어가는 기준" 체크리스트 전부 통과 + 팀장
  2인 승인(투표 금지)
- **산출물**: §4의 02·05 문서 확정본

### Phase 2 — 데이터 모델 구현 (§5, Phase 1과 병렬 가능)

**Entry**: 없음 — Phase 1과 독립적으로 지금 시작 가능(디자인이 데이터 구조를 결정하지 않음)
- `packages/content/src/schema.ts`에 Builder/Work/WorkProcess/Eduinfo/AdminAccount/SiteSettings 추가
- `repo/types.ts` 인터페이스 확장, file 드라이버부터 구현(Supabase는 Phase 3에서)
- `packages/supabase/migrations`에 신규 테이블 마이그레이션 추가
- **Exit 기준**: `pnpm typecheck` 통과, 각 도메인 file 드라이버 CRUD가 admin 없이 스크립트로 검증됨

### Phase 3 — 프론트엔드 구현 (CLAUDE.md 5단계)

**Entry**: Phase 1 Exit + Phase 2 Exit
- `apps/web`에 `/work`, `/insight`(리네임), `/eduinfo`, 문의하기 모달 구현 — 확정 디자인 기준
- 여기서부터 컴포넌트 단위 병렬화 가능(디자인 시스템이 이미 확정됐으므로)

### Phase 4 — 관리자 · 데이터 연동 (CLAUDE.md 6단계, Phase 3과 일부 병렬)

- 인증 레이어 신설(AdminAccount 기반, 등급·메뉴 권한 체크 미들웨어)
- Builder/Work/WorkProcess/설정/계정·권한 관리자 화면
- pluug 링크 설정값 연동(FR-5 AC-5.3)
- 빌더 로그인 → 업로드 → 승인 플로우(FR-6)

### Phase 5 — 기능/UI/SEO/접근성/성능 검증 (CLAUDE.md 7~9단계)

- `wiki/11-phase-verification.md` 기준 — 기존 구현 옹호 금지, 요구사항 대비 독립 검토
- Insight 상세 모달 vs 라우팅 페이지 결정(Q15)이 이 단계 이전에 반드시 확정돼야 SEO 검증이 의미 있음
- 이 단계부터는 병렬화 적극 활용(기능검증/반응형/SEO/접근성/성능을 서로 다른 에이전트·세션에 배정 가능)

### Phase 6 — 배포 · 이관 (CLAUDE.md 10~11단계)

- `wiki/12-phase-deployment.md`, `wiki/13-phase-handoff.md` 기준
- Supabase 팀 무료 프로젝트 → 클라이언트 정식 프로젝트 이관(기획서 §17.2 방침 실행)
- 도메인 확정(Q3) 반영, 푸터 사업자 정보(Q12) 실값 확인 후 배포

---

## 8. 우선순위 요약 (지금 이 세션 이후 바로 할 수 있는 것)

| 순서 | 작업 | 선행조건 | 트랙 |
| --- | --- | --- | --- |
| 1 | Q18/Q1/Q4 클라이언트 확인 요청 문구 정리 | 없음 | 기획 |
| 2 | 01·03·04·06 문서 초안 작성 | 없음 | 기획/데이터 |
| 3 | `packages/content` 스키마 확장(Builder/Work/WorkProcess/Eduinfo/AdminAccount/SiteSettings) | 06 문서 초안 | 개발 |
| 4 | `artifact/builder-group` 상세 컴포넌트 "AI스러움" 자체 감사(Q19 기준 마련) | 없음 | 디자인 |
| 5 | 1안+2안 통합 디자인 세션(책임자 1인 지정) | 1, 4 | 디자인 |
| 6 | apps/admin 인증 레이어 설계(FR-10 기준, WO-3 대체) | 3 | 개발 |

**지금 하면 안 되는 것**: `apps/web`/`apps/admin`에 Work·Builder·Eduinfo 화면을 목업 스타일 그대로
코드로 옮기기 시작하는 것. 디자인이 아직 1개로 확정되지 않았고(Q18), 데이터 모델도 없다(§5) — 지금
시작하면 Phase 1 결과가 나온 뒤 다시 만들어야 한다.

---

## 9. 리스크

| 리스크 | 영향 | 완화 |
| --- | --- | --- |
| Q18 미해결 장기화 | 코드 착수 자체가 무기한 지연 | Phase 0에서 최우선으로 좁힌다. 늦어도 "임시 베이스라인 1개"를 팀장 2인이 강제 지정하고 이후 보완 |
| FR-10(관리자 권한)이 WO-3보다 훨씬 큰 작업임을 과소평가 | 배포 직전 인증 부재 발견 | §3.3에서 이미 WO-3를 흡수 대상으로 명시함, Phase 4 착수 시 별도 설계 문서 필요 |
| Insight 모달 vs 라우팅 미정(Q15) 상태로 SEO 작업 착수 | SEO 검증 단계에서 재작업 | Phase 3 착수 전 확정 필수 조건으로 게이트 |
| `docs/analysis/*`(Orca 템플릿 자체 미완 기능, WO-1~8)와 이 전환 작업의 혼선 | 서로 다른 목적의 작업이 한 세션에 섞임 | WO-1~8은 "템플릿 하드닝" 트랙, 이 문서는 "제품 전환" 트랙으로 분리 유지. 겹치는 것은 WO-3(인증)뿐이며 §3.3에서 흡수 처리 |

---

## 10. 관련 문서

- `docs/planning/AI빌더그룹_기획서.md`, `AI빌더그룹_PRD.md` — 요구사항 원본
- `wiki/09-phase-design.md` ~ `wiki/13-phase-handoff.md` — 단계별 세부 가이드(이 로드맵과 1:1 대응)
- `wiki/01-architecture.md`, `wiki/02-conventions.md` — 코드 작업 시 필수 선행 독서
- `docs/analysis/05-work-orders.md` — 별개 트랙(템플릿 하드닝), WO-3만 이 계획에 흡수됨
