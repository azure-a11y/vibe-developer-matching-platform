# 04 — README.md 개선안

> 현재 README는 철학·구조 설명이 잘 돼 있는 편. 아래는 **추가/수정 제안**이며 README.md 자체는
> 수정하지 않았습니다. 반영 시 `docs/i18n/` 번역 8종도 함께 갱신해야 합니다.

## 1. 빠진 내용 — 추가 제안

### 1-1. "5분 데모 시나리오" 섹션
설치 직후 무엇을 눌러봐야 하는지가 없다. 구조 설명 앞에 체험 경로를 넣을 것:

```
1. pnpm dev
2. localhost:3001 → in_review 글 "검수 게이트에 LLM을 넣지 않는 이유" 검수 → 발행
3. localhost:3000 → 글이 공개되는 것 확인
4. pnpm agent blog-writer "'X'에 대한 글을 기획부터 검수까지 진행해"
```

### 1-2. 콘텐츠 라이프사이클 다이어그램
`draft → in_review → published(사람만) / scheduled / archived` 상태 전이와 "누가 어떤 전이를
할 수 있는가"를 표나 mermaid로. 이 템플릿의 핵심 차별점인데 README에 명시가 없다.

### 1-3. 요구 사항과 선택 사항의 구분 표
Node ≥20.11, pnpm ≥10은 뱃지로만 존재. claude CLI(blog-writer), codex CLI(image-maker),
Supabase(선택)가 각각 없으면 무엇이 안 되는지 표로:

| 도구 | 없으면 |
| --- | --- |
| claude CLI | blog-writer 실행 불가 (앱은 정상) |
| codex CLI | 이미지 생성 불가 → 폴백 절차 (이미지 없이 진행) |
| Supabase 키 | 파일 드라이버로 동작 (정상 데모 상태) |

### 1-4. 어드민 보안 경고
어드민에 인증이 없다는 사실과 "로컬 전용, 그대로 배포 금지"를 명시. (02번 문서 #4)

### 1-5. 트러블슈팅 최소 3건
포트 충돌(WEB_PORT/ADMIN_PORT), `pnpm check` 실패 시 읽는 법, 프론트매터 오류가 대시보드에
표시되는 위치.

## 2. 수정 제안

- **에이전트 표에 스킬 목록 추가** — blog-writer의 4단계 스킬(plan → draft → seo/geo → review)이
  파이프라인 그 자체인데 README에서 보이지 않는다.
- **`pnpm audit:content` 소개** — 발행 게이트를 CLI로도 돌릴 수 있다는 것은 CI 연동 포인트.
  "CI에서 이 명령을 돌리면 사람 없이도 게이트 유지"를 한 줄로.
- **스크립트 표** — package.json의 명령 15개 중 README에 등장하는 것은 일부. `setup/check/agent/
  imagegen/audit:content/context/memory:new`를 표로 정리.
- **라이선스·기여 안내** — MIT 뱃지는 있으나 기여 규칙(Conventional Commits, 하드 룰 준수) 언급 없음.

## 3. 구조 재배치 제안

현재: 문제 → 설치 → 구조 → (이하 생략)
제안: **문제 → 5분 데모 → 구조 → 콘텐츠 라이프사이클 → 에이전트 → 설치 상세(INSTALL.md 링크) →
스크립트 표 → 트러블슈팅 → 기여/라이선스**

설치 상세는 이미 INSTALL.md가 자기완결적이므로 README에서는 3줄 요약 + 링크로 줄여도 된다.

## 4. 유지할 것

- "사람은 설정 파일을 오타로 망칩니다" 같은 어조 — 템플릿의 개성이므로 유지
- 문제/해결 2×4 표 — 핵심 가치 전달이 명확함
- 다국어 링크 헤더
