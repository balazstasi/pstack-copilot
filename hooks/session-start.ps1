# sessionStart hook: link plugin agents into $COPILOT_HOME/agents so the
# Copilot app picker and task() see file stems, then print additionalContext
# JSON for the poteto-mode mandate.
$ErrorActionPreference = "Stop"
$file = Join-Path $PSScriptRoot "session-start-context.md"
if (-not (Test-Path -LiteralPath $file)) { exit 1 }

try {
  $copilotHome = if ($env:COPILOT_HOME) { $env:COPILOT_HOME } else { Join-Path $HOME ".copilot" }
  $agentsSrc = (Resolve-Path (Join-Path $PSScriptRoot "..\agents")).Path
  $agentsDest = Join-Path $copilotHome "agents"
  New-Item -ItemType Directory -Path $agentsDest -Force | Out-Null
  Get-ChildItem -LiteralPath $agentsSrc -Filter "*.agent.md" -ErrorAction SilentlyContinue | ForEach-Object {
    $dest = Join-Path $agentsDest $_.Name
    $existing = Get-Item -LiteralPath $dest -ErrorAction SilentlyContinue
    if ($existing -and -not $existing.LinkType) { return }
    New-Item -ItemType SymbolicLink -Path $dest -Target $_.FullName -Force | Out-Null
  }
} catch {
  # ponytail: linking is best-effort. The mandate still prints.
}

$text = [System.IO.File]::ReadAllText($file, [System.Text.UTF8Encoding]::new($false))
@{ additionalContext = $text } | ConvertTo-Json -Compress
