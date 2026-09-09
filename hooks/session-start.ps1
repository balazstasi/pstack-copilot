# sessionStart hook: print Copilot additionalContext JSON for the poteto-mode mandate.
$ErrorActionPreference = "Stop"
$file = Join-Path $PSScriptRoot "session-start-context.md"
if (-not (Test-Path -LiteralPath $file)) { exit 1 }
$text = [System.IO.File]::ReadAllText($file, [System.Text.UTF8Encoding]::new($false))
@{ additionalContext = $text } | ConvertTo-Json -Compress
