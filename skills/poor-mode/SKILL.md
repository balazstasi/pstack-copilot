---
name: poor-mode
description: "Set pstack's persistent economical workflow mode. Use for /poor-mode, I'm poor, save tokens, or normal mode to restore standard workflows. Supports task-only overrides without changing saved preferences."
---

# Poor mode

Read [usage-mode.md](../poteto-mode/references/usage-mode.md) and apply it before any other pstack workflow. Default `/poor-mode` and “I'm poor” to `poor`; “normal mode” sets `normal`. An explicit “for this task” override applies immediately without writing files.

## Persist the preference

Changing mode is already authorized by the mode request. Do not invoke setup, probe models, run a smoke panel, change model assignments, or ask for another confirmation.

1. Locate the active parent's model sheet and instruction file:

   | Parent | Model sheet | Instructions |
   | --- | --- | --- |
   | Copilot | `~/.copilot/pstack-models.md` | `~/.copilot/copilot-instructions.md` |
   | Codex | `~/.codex/pstack-models.md` | `~/.codex/AGENTS.md` |
   | Claude Code | `~/.claude/pstack-models.md` | `~/.claude/CLAUDE.md` |

   Honor the host's configured home directory. Change only this parent's files.
2. Read the existing files. Preserve all model rows and unrelated content. Replace the single `usage mode:` line, or append it when absent. For a missing sheet, create `# pstack models` and the mode line only; model roles continue to use their existing defaults. Reject duplicate or invalid mode lines before writing.
3. Include this policy sentence in the sheet, once: `Before running pstack workflows, read the installed plugin's skills/poteto-mode/references/usage-mode.md and apply the saved usage mode across nested skills.` This makes the setting discoverable in fresh sessions, including direct skill invocations.
4. For Copilot and Codex, mirror the sheet's exact bytes inside `<!-- pstack:models:begin -->` and `<!-- pstack:models:end -->` in the instruction file. Replace an existing well-formed block or append one when both markers are absent. A missing, duplicated, or reversed marker is inconsistent state: report it rather than guessing the boundary. For Claude Code, ensure a single standalone `@<absolute sheet path>` include exists, accepting the equivalent tilde include if already present.
5. Prepare both renders before writing. Snapshot existing bytes and whether each file existed, write, and read back to verify. On failure restore snapshots (remove only files created by this attempt). An unchanged rerun should make no edits. Report a persistence failure and keep the requested mode active for this session; do not claim it was saved.

Confirm the mode and saved sheet path in one sentence. Poor mode stays active until changed; a one-task full Arena exception does not change the saved mode. Normal mode restores existing workflow and model choices without resetting them.
