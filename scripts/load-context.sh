#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────
# load-context.sh — 세션 시작 시 주입할 프로젝트 컨텍스트를 stdout으로 출력.
#
# SessionStart 훅이 이 스크립트를 실행하고, stdout이 그대로 컨텍스트에 들어갑니다.
# 수동 실행: pnpm context
#
# 설계 원칙: wiki 전문이 아니라 **인덱스**만 로드합니다. 지도를 주고,
# 필요한 문서는 모델이 직접 열게 합니다. (ADR-0003)
# ─────────────────────────────────────────────────────────────
set -uo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT" || exit 0

RECENT_MEMORY_COUNT="${ORCA_RECENT_MEMORY:-5}"

echo "=============================================="
echo " ORCA AI COMPANY — 세션 컨텍스트"
echo "=============================================="
echo

# ── 1. 핵심 원칙 ──────────────────────────────────────────────
cat <<'RULES'
## 프로젝트 핵심 원칙

1. 현재 제품은 AI 빌더 그룹 B2B 포트폴리오·매칭·문의 웹사이트와 관리자 시스템이다.
2. Orca는 개발 기반일 뿐 제품의 UI/UX 기준이 아니다.
3. 기존 AI 목업은 자동으로 디자인 레퍼런스로 사용하지 않는다.
4. 디자인 작업은 전체 Visual Direction을 먼저 확정한 후 구현한다.
5. 승인된 디자인을 개발 편의를 이유로 임의 단순화하지 않는다.
6. 데이터 접근은 정의된 repository/service 계층을 사용한다.
7. 공개 콘텐츠의 검수·승인 정책을 우회하지 않는다.
8. 완료 보고 전 실제 build/test/verifier 결과를 확인한다.

세부 하드 룰(이미지 생성, 발행 게이트, 검수 결정성 등)은 CLAUDE.md와 아래 장기 메모리를 참조.

RULES

# ── 2. wiki 인덱스 ────────────────────────────────────────────
echo "## wiki 문서 (필요할 때 직접 열어 읽을 것)"
echo
if [ -d wiki ]; then
  while IFS= read -r doc; do
    title="$(grep -m1 '^# ' "$doc" 2>/dev/null | sed 's/^# //')"
    printf -- "- \`%s\` — %s\n" "$doc" "${title:-(제목 없음)}"
  done < <(find wiki -maxdepth 1 -name '*.md' | sort)

  if [ -d wiki/decisions ]; then
    adr_count="$(find wiki/decisions -name 'ADR-*.md' | wc -l | tr -d ' ')"
    echo "- \`wiki/decisions/\` — ADR ${adr_count}건 (아키텍처를 바꾸기 전 확인)"
  fi
else
  echo "- (wiki 디렉터리 없음)"
fi
echo

# ── 3. 장기 메모리 ────────────────────────────────────────────
echo "## 장기 메모리"
echo
if [ -f wiki/memory/index.md ]; then
  sed -n '/^## /,$p' wiki/memory/index.md
else
  echo "(wiki/memory/index.md 없음)"
fi
echo

# ── 4. 최근 단기 메모리 ───────────────────────────────────────
echo "## 최근 단기 메모리 (최신 ${RECENT_MEMORY_COUNT}건)"
echo
if [ -d wiki/memory/short-term ]; then
  found=0
  while IFS= read -r mem; do
    [ -z "$mem" ] && continue
    found=1
    title="$(grep -m1 '^# ' "$mem" 2>/dev/null | sed 's/^# //')"
    mtype="$(grep -m1 '^type:' "$mem" 2>/dev/null | sed 's/^type: *//')"
    mdate="$(grep -m1 '^date:' "$mem" 2>/dev/null | sed 's/^date: *//')"
    printf -- "- [%s] %s — %s (\`%s\`)\n" "${mtype:-?}" "${mdate:-?}" "${title:-$(basename "$mem")}" "$mem"
  done < <(find wiki/memory/short-term -name '*.md' 2>/dev/null | sort -r | head -n "$RECENT_MEMORY_COUNT")
  [ "$found" -eq 0 ] && echo "(단기 메모리 없음)"
else
  echo "(wiki/memory/short-term 디렉터리 없음)"
fi
echo

# ── 5. 에이전트 팀 ────────────────────────────────────────────
echo "## 에이전트 (Claude 서브에이전트가 아니라 독립 프로세스)"
echo
if [ -f agents/registry.yaml ]; then
  awk '
    /^  - id:/      { id=$3 }
    /^    runtime:/ { rt=$2 }
    /^    model:/   { model=$2 }
    /^    summary:/ { $1=""; s=$0; sub(/^ +/,"",s);
                      if (id != "") printf "- `%s` (%s · %s) — %s\n", id, rt, model, s; id="" }
  ' agents/registry.yaml
  echo
  echo "실행: \`pnpm agent <id> \"<작업>\"\` · 목록: \`pnpm agent --list\` · 추가: \`/create-agent\`"
  echo "정의: \`agents/<id>/AGENT.md\` · 스킬: \`agents/<id>/skills/\`"
else
  echo "(agents/registry.yaml 없음)"
fi
echo

# ── 6. git 상태 ───────────────────────────────────────────────
if git rev-parse --git-dir >/dev/null 2>&1; then
  echo "## git"
  echo
  echo "- 브랜치: \`$(git branch --show-current 2>/dev/null || echo '?')\`"
  changed="$(git status --porcelain 2>/dev/null | wc -l | tr -d ' ')"
  echo "- 미커밋 변경: ${changed}개 파일"
  echo "- 최근 커밋:"
  git log --oneline -3 2>/dev/null | sed 's/^/  - /' || echo "  - (커밋 없음)"
  echo
fi

# ── 7. 사용 가능한 스킬 ───────────────────────────────────────
cat <<'SKILLS'
## 슬래시 커맨드 (이 Claude Code 세션용)

- `/orca-setup`   — 의존성 전수 검사 + 설치 (결정적 스크립트) · 팔로우 · 스타는 선택
- `/save-memory`  — 세션 내용을 단기 메모리에 저장, 필요 시 장기/wiki로 승격
- `/create-agent` — 새 에이전트를 registry + AGENT.md + skills/ 에 일괄 생성

에이전트의 스킬(`agents/<id>/skills/`)은 이것과 별개입니다. 그쪽은 런처가
시스템 프롬프트에 주입하는 플레이북이라 codex 에이전트도 읽습니다.

SKILLS

echo "=============================================="
exit 0
