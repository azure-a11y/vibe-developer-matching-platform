$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
Set-Location $root
$registry = Join-Path $root "agents/registry.yaml"

function Get-AgentField([string]$id, [string]$field) {
  $active = $false
  foreach ($line in Get-Content $registry) {
    if ($line -match '^  - id:\s*(\S+)') { $active = $Matches[1] -eq $id; continue }
    if ($active -and $line -match "^    ${field}:\s*(.*)$") { return $Matches[1].Trim() }
  }
  return ""
}

function List-Agents {
  foreach ($line in Get-Content $registry) {
    if ($line -match '^  - id:\s*(\S+)') { $id = $Matches[1] }
    elseif ($line -match '^    runtime:\s*(\S+)') { $runtime = $Matches[1] }
    elseif ($line -match '^    model:\s*(\S+)') { $model = $Matches[1] }
    elseif ($line -match '^    summary:\s*(.*)') { "  {0,-14} {1,-8} {2,-8} {3}" -f $id,$runtime,$model,$Matches[1] }
  }
}

if ($args.Count -eq 1 -and ($args[0] -in @("--list", "-l"))) { List-Agents; exit 0 }
if ($args.Count -lt 2) { Write-Error '사용법: pnpm agent <id> "작업 내용"'; exit 2 }

$agentId = $args[0]
$taskArgs = @($args[1..($args.Count - 1)])
$printMode = $taskArgs -contains "--print" -or $taskArgs -contains "-p"
$dryRun = $taskArgs -contains "--dry-run"
$task = ($taskArgs | Where-Object { $_ -notin @("--print", "-p", "--dry-run") }) -join " "

$runtime = Get-AgentField $agentId "runtime"
$model = Get-AgentField $agentId "model"
$definition = Get-AgentField $agentId "definition"
$skillsDir = Get-AgentField $agentId "skills"
if (-not $runtime) { Write-Error "등록되지 않은 에이전트: $agentId"; exit 1 }
if (-not (Test-Path $definition)) { Write-Error "정의 파일이 없습니다: $definition"; exit 1 }

$prompt = Get-Content $definition -Raw
if (Test-Path $skillsDir) {
  foreach ($skill in Get-ChildItem $skillsDir -Directory) {
    $skillFile = Join-Path $skill.FullName "SKILL.md"
    if (Test-Path $skillFile) { $prompt += "`n`n---`n`n## 사용 가능한 스킬`n`n" + (Get-Content $skillFile -Raw) }
  }
}
$prompt += "`n`n---`n`n## 프로젝트 컨텍스트`n`n작업 디렉터리: $root`n`n먼저 AGENTS.md, wiki/README.md, wiki/memory/index.md를 읽으세요."

if ($runtime -ne "claude") { Write-Error "Windows 런처는 현재 Claude 런타임만 지원합니다: $runtime"; exit 1 }
$promptFile = [IO.Path]::GetTempFileName()
Set-Content -LiteralPath $promptFile -Value $prompt -Encoding utf8
$claudeArgs = @("--append-system-prompt-file", $promptFile)
if ($model -and $model -ne "default") { $claudeArgs += @("--model", $model) }
if ($printMode) { $claudeArgs += "--print" }
$claudeArgs += $task
if ($dryRun) { Write-Output ("claude " + ($claudeArgs -join " ")); exit 0 }
& claude @claudeArgs
$exitCode = $LASTEXITCODE
Remove-Item -LiteralPath $promptFile -Force -ErrorAction SilentlyContinue
exit $exitCode
