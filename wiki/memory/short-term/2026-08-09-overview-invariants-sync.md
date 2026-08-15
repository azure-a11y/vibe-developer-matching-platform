---
date: 2026-08-09
type: preference
topic: overview-invariants-sync
tags: [wiki, consistency,00-overview]
confidence: high
promoted: false
---

# wiki/00-overview.md를 건드릴 때는 "핵심 불변 규칙" 목록을 별말 없어도 project-invariants.md와 맞춘다

## 무엇

`wiki/00-overview.md`의 "핵심 불변 규칙" 절은 `wiki/memory/long-term/project-invariants.md`와는
별개의 사본이라 손으로 동기화해야 한다. 2026-08-09 CLAUDE.md 확장 작업 중 이 문서만 옛 문구
("콘텐츠의 진실은 파일. DB 도입 금지")로 남아 있던 걸 뒤늦게 발견해서 고쳤다. 지금은 5개 항목뿐이라
`project-invariants.md`의 6번("에이전트는 독립 프로세스, Claude 서브에이전트 아님")이 빠져 있는 상태.

사용자가 "다음에 이 문서 작업이 있을 때 별도 말이 없어도 수정해달라"고 명시적으로 지시함.

## 왜

이 문서는 4중 사본(CLAUDE.md 하드 룰 / `scripts/load-context.sh` / `project-invariants.md` /
`wiki/00-overview.md`) 중 하나라서 하나만 바뀌면 조용히 드리프트가 생긴다. 사용자가 매번 지적하지
않아도 알아서 동기화하길 원함.

## 영향

- `wiki/00-overview.md`를 어떤 이유로든 편집하게 되면, 편집 전후로 "핵심 불변 규칙" 목록을
  `project-invariants.md`와 대조해서 누락·구식 문구가 있으면 같이 고친다 (요청받지 않아도).
- 현재 알려진 갭: 6번 항목("에이전트는 독립 프로세스") 추가 필요.
- 이 규칙은 이 파일 하나(`wiki/00-overview.md`)에 국한된다. 다른 문서 동기화는 별도 지시 없이
  임의로 넓히지 않는다.

## 관련

- [[project-invariants]]
- `CLAUDE.md`, `scripts/load-context.sh` (같은 규칙의 다른 사본)
