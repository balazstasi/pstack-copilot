# Copilot tool mapping for pstack

pstack skills retain Claude Code tool language (`Skill`, `Agent`, `AskUserQuestion`) in shared prose. On GitHub Copilot CLI the files are the same; only those tool names resolve differently. Model execution is not translated here. Read [`provider-dispatch.md`](provider-dispatch.md) for the parent-owned route table and provider-qualified descriptors.

## Tool actions

| pstack / Claude action | Copilot equivalent |
| --- | --- |
| Skill / slash command | Loaded plugin skills. Invoke by name (`/poteto-mode`, `/setup-pstack`). |
| Agent / Task | `agent` / `task` with `agent_type` |
| Per-call `model:` | Do not trust. GitHub Copilot CLI issue 3565 can silently downgrade a spawn-time model to the parent session model. Pin the model on a `*.agent.md` profile. |
| `subagent_type: poteto-agent` | `agent_type: pstack:poteto-agent` |
| `subagent_type: comment-sicko` | `agent_type: pstack:comment-sicko` |
| Native family lane `pstack-<stem>-<effort>` | `agent_type: pstack:pstack-<stem>-<effort>` |
| AskUserQuestion | `ask_user`. Weaker structured choice. Prototype instead of asking when the playbook already says to. |
| `run_in_background` | `task` background mode when present. Otherwise dispatch and keep the task handle. |
| `environment: cloud` | Dropout. Local worktree only. |
| `/loop` | Dropout. `keepAlive: busy` only keeps the session alive. |
| Instructions file | `~/.copilot/copilot-instructions.md` plus the project `AGENTS.md` if present. |

Plugin custom agents are namespaced as `pstack:<file-stem>`. `--agent poteto-agent` is rejected. Use `--agent pstack:poteto-agent` or `/agent` and pick that id.

Copilot scans every `*.md` and `*.agent.md` in the plugin agents directory. This Copilot-only plugin keeps those files under `agents/` as `*.agent.md`. Do not copy Claude `agents/*.md` files here.

## Subagent policy

poteto-mode's Subagents section sets Claude-specific defaults (`subagent_type: "poteto-agent"`, `run_in_background: true`). On Copilot:

- Route an ad-hoc subagent through poteto-mode's style by dispatching `pstack:poteto-agent`. That profile reads the `poteto-mode` skill in full first.
- Pin the lane on a generated `pstack-<stem>-<effort>` agent. Do not pass `model` on `task(...)`.
- The **no-comments** skill spawns `pstack:comment-sicko`. That profile has read and search tools only.
- Raise `subagents.maxConcurrency` to at least 4 and `subagents.maxDepth` to at least 2 in `~/.copilot/settings.json` before a four-lane panel. Values of 2 and 1 collapse how-critics, arena, architect, and interrogate.
- Keep the rest of the policy unchanged. Pass file pointers not inlined context. Give each writer its own worktree. Review every subagent's diff yourself.

## Models and providers

Do not replace every configured entry with a Copilot model. `/setup-pstack` writes portable descriptors such as `claude:fable@max` and Copilot-native descriptors such as `copilot:gpt-5.6-sol@medium`. In a Copilot parent, only `copilot:*` is native. `codex:gpt-5.6-sol` still means the Codex CLI through the external runner. Never treat Copilot Sol as a silent dispatch of the Codex Sol descriptor.

Claude, Codex, and Grok descriptors use `pstack-runner --parent copilot`. A missing CLI is a loud dropout. Never map `claude:fable` to terra or `grok:*` to luna.

Keep Why and Reflect on `inherit-parent` or `auto`. The external runner strips the parent's MCP surface.

## Claude built-in skills pstack references

Some triggers name skills that ship with Claude Code, not pstack. They do not exist on Copilot. Substitute the behavior:

| Claude built-in named in pstack | On Copilot |
| --- | --- |
| `run` (drive a CLI/TUI to see a change work) | Run the app yourself via `execute`/`shell` and observe the real output. |
| `verify` (drive a UI to confirm a fix) | Drive the UI with whatever automation you have, or hand the user a concrete manual check. Do not claim done without observing the artifact. |
| `plugin-dev:skill-development` | Follow this mapping and the `create-skill` guidance for SKILL.md files. Keep `name` plus `description` frontmatter and progressive disclosure. |
| `loop` (recurring/self-paced re-invocation, used by `babysit`) | Dropout. Re-run the step yourself on a cadence. `keepAlive: busy` is not `/loop`. |

## Vendored scripts

`skills/poteto-mode/scripts/` ships the `watch-pr` PR watcher, the `orch` store CLI, `worktree-audit.sh`, and `runner/pstack-runner`. They are plain bun and bash. Invoke them through `execute`/`shell`. The external runner needs the assigned `claude`, `codex`, or `grok` executable already authenticated. It rejects a Copilot provider because that lane belongs on a pinned `*.agent.md`. The other scripts need `bun`, `gh`, (for stack work) `gt`, and (for `worktree-audit.sh`) `jq` and `rg`.

## Session identity

Sticky `/poteto-mode` across turns does not exist. Latch the session with `copilot --agent pstack:poteto-agent` or `/agent`. Skills stay on-demand.

## Instructions file

Where a pstack skill says "your instructions file", on Copilot that is `~/.copilot/copilot-instructions.md`. `/setup-pstack` writes a bounded `<!-- pstack:models:begin -->` block there and keeps `~/.copilot/pstack-models.md` as the editable sheet. Do not fold pstack into a repo-specific gated section of that file.
