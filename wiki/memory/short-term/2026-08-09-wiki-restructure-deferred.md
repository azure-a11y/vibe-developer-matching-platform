---
date: 2026-08-09
type: decision
topic: wiki-restructure-deferred
tags: [wiki, structure, planning]
confidence: high
promoted: false
---

# wiki/ 디렉터리 재구성(product/design/engineering/qa/handoff)은 보류

## 무엇

사용자가 CLAUDE.md 확장 작업 중 `wiki/`를 `product/ design/ engineering/ qa/ handoff/` 같은
주제별 폴더로 재구성하는 안을 제안했음. 실행 전 영향 범위를 조사한 결과 `wiki/` 경로를 참조하는
파일이 38개 발견됐고, 특히 다음이 걸림돌:

- `scripts/load-context.sh`가 `wiki` 최상위만(`-maxdepth 1`) 스캔 — 하위 폴더로 옮기면 세션 시작
  인덱스에서 누락됨
- `CLAUDE.md`의 "작업 전에" 섹션이 `wiki/01-architecture.md` 등 경로를 하드코딩
- `agents/blog-writer/skills/*`, `agents/image-maker/AGENT.md`가 wiki 경로를 런타임에 직접 참조
- `scripts/check-deps.sh`, `scripts/orca-setup.sh`, `scripts/memory-new.sh`도 wiki 경로 로직 보유
  (`pnpm check`의 "AI 컨텍스트 레이어" 검증과 연결)
- ADR·메모리 파일 간 상호링크, `docs/i18n/README.*.md` 등 온보딩 문서에도 경로 노출

이 내용을 사용자에게 보고했고, 사용자는 "다음에 하는 것으로 하자"며 지금은 보류하기로 결정.

## 왜

폴더 구조 변경 자체는 콘텐츠 정확성이나 품질을 개선하지 않는 순수 정리 작업인데, 스크립트 로직까지
같이 고쳐야 해서 지금 시점에는 위험 대비 이득이 작음.

## 영향

- 앞으로 세션에서 wiki 재구성을 먼저 제안하지 않는다. 사용자가 다시 꺼내거나, CLAUDE.md가 너무
  길어져 못 찾겠다는 신호가 나오거나, 새 wiki 문서 추가 타이밍일 때 다시 검토한다.
- 실행하게 되면 위 5곳(load-context.sh, CLAUDE.md 경로, agents/*, check 스크립트, 상호링크)을
  함께 고치는 걸 전제로 진행해야 한다.

## 관련

- `CLAUDE.md` — 관리자 시스템 / 검증 원칙 / 배포 및 이관 섹션이 이번에 추가됨
- [[project-invariants]]
