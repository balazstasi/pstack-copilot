# Copilot tool mapping for pstack

pstack skills retain Claude Code tool language (`Skill`, `Agent`, `AskUserQuestion`) in shared prose. On GitHub Copilot CLI the files are the same; only those tool names resolve differently. Model execution is not translated here. Read [`provider-dispatch.md`](provider-dispatch.md) for the parent-owned route table and provider-qualified descriptors.

## Tool actions

| pstack / Claude action | Copilot equivalent |
| --- | --- |
| Skill / slash command | Loaded plugin skills. Invoke by name (`/poteto-mode`, `/setup-pstack`). |
| Agent / Task | `agent` / `task` with `agent_type` |
| Per-call `model:` | Valid on `task()`. Native family lanes still pin `model` plus `reasoning-effort` on `pstack-<stem>` because `task()` has no spawn-time effort. |
| `subagent_type: poteto-agent` | `task()` `agent_type: poteto-agent`. CLI `--agent pstack:poteto-agent`. |
| `subagent_type: comment-sicko` | `task()` `agent_type: comment-sicko`. CLI `--agent pstack:comment-sicko`. |
| Native family lane `pstack-<stem>` | `task()` `agent_type: pstack-<stem>`. CLI `--agent pstack:pstack-<stem>`. |
| AskUserQuestion | `ask_user`. Weaker structured choice. Prototype instead of asking when the playbook already says to. |
| `run_in_background` | `task` background mode when present. Otherwise dispatch and keep the task handle. |
| `environment: cloud` | Dropout. Local worktree only. |
| `/loop` | Dropout. `keepAlive: busy` only keeps the session alive. |
| Instructions file | `~/.copilot/copilot-instructions.md` plus the project `AGENTS.md` if present. |

CLI `--agent` and `/agent` use the plugin-namespaced id `pstack:<file-stem>`. The Copilot app agent picker and `task()` use the file stem (`poteto-agent`, `comment-sicko`, `pstack-terra`). Spawn that stem. `sessionStart` links each `agents/<stem>.agent.md` into `~/.copilot/agents/` so those stems exist. Never pass `pstack:comment-sicko` to `task()`.

Copilot scans every `*.md` and `*.agent.md` in the plugin agents directory. This Copilot-only plugin keeps those files under `agents/` as `*.agent.md`. Do not copy Claude `agents/*.md` files here.

## Subagent policy

poteto-mode's Subagents section sets Claude-specific defaults (`subagent_type: "poteto-agent"`, `run_in_background: true`). On Copilot:

- Route an ad-hoc subagent through poteto-mode's style by dispatching `poteto-agent`. That profile loads `poteto-mode` with the skill tool first. CLI `--agent` still uses `pstack:poteto-agent`. The Copilot app picker uses `poteto-agent`.
- Dispatch a native family lane as `pstack-<stem>`. That file pins `model` and `reasoning-effort` at the family's default. Opus 5 also pins `context-tier: default` (small window, not `long_context`). CLI `--agent` still uses `pstack:pstack-<stem>`. Do not pick a family lane as the Copilot app session agent.
- The **no-comments** skill spawns `comment-sicko`. That profile pins `gpt-5.6-luna` at xhigh effort and has read and search tools only. Do not omit `model` on `task()` if a hook require-list would treat an unset model as a deny. The agent file already pins it, so spawn-time `model` is optional.
- Raise `subagents.maxConcurrency` to at least the configured panel size (3 by default) and `subagents.maxDepth` to at least 2 in `~/.copilot/settings.json`. Values below the panel size collapse arena, architect, and interrogate.
- Keep the rest of the policy unchanged. Pass file pointers not inlined context. Give each writer its own worktree. Review every subagent's diff yourself.

## Models and providers

Do not replace every configured entry with a Copilot model. `/setup-pstack` writes portable descriptors such as `claude:fable@max` and Copilot-native descriptors such as `copilot:gpt-5.6-sol@medium`. In a Copilot parent, only `copilot:*` is native. `codex:gpt-5.6-sol` still means the Codex CLI through the external runner. Never treat Copilot Sol as a silent dispatch of the Codex Sol descriptor.

Claude, Codex, and Grok descriptors use `pstack-runner --parent copilot`. A missing CLI is a loud dropout. Never map `claude:fable` to terra or `grok:*` to luna.

Keep Why and Reflect on `inherit-parent` or `auto`. The external runner strips the parent's MCP surface.

## Skill path resolution

Copilot `view` resolves paths against the open workspace, not the skill directory. Plugin skills often live outside that workspace. Claude-style relative refs (`playbooks/authoring-a-skill.md`, a bare `SKILL.md`, `../poteto-mode/references/copilot-tools.md`) miss. A `view` of `SKILL.md` fails immediately.

Load another pstack skill with the `skill` tool by name (`skill: no-comments`, `skill: principle-prove-it-works`). Do not `view` `${PLUGIN_ROOT}/skills/<name>/SKILL.md`. The skill tool injects that file.

Placeholders. Expand each to an absolute filesystem path before every `view` or `execute`. Do not pass the dollar syntax to the tool.

- `SKILL_PATH`. The `Base directory for this skill` line in `<skill-context>`. That is `<plugin-root>/skills/<skill-name>`.
- `PLUGIN_ROOT`. The directory that contains `plugin.json` and `skills/`. From any pstack skill directory it is two parents up.

Hops.

- This skill's files. `${SKILL_PATH}/<relative>` (playbooks, references, scripts).
- Another pstack skill. `skill: <name>`. Not a `view`.
- This mapping. `${PLUGIN_ROOT}/skills/poteto-mode/references/copilot-tools.md`.

If skill-context is missing, take the live `pstack` path from `copilot plugin list`. One lookup. Do not `find` the user's home or the open repo.

Never.

- `view` `SKILL.md`, a path that ends in `SKILL.md`, or `authoring-a-skill.md` with no directory.
- Nest sibling skills under `${SKILL_PATH}/skills/`.
- `~/.agents/skills/` for pstack (do not copy the plugin tree there).
- `~/.claude/plugins/**/plugin-dev/**`. `plugin-dev:skill-development` is a Claude built-in. Use the table below. Do not search for this skill on disk.
- The open repo's `.github/skills/` or `.cursor/skills/` for a pstack leaf.

## Claude built-in skills pstack references

Some triggers name skills that ship with Claude Code, not pstack. They do not exist on Copilot. Substitute the behavior:

| Claude built-in named in pstack | On Copilot |
| --- | --- |
| `run` (drive a CLI/TUI to see a change work) | Run the app yourself via `execute`/`shell` and observe the real output. |
| `verify` (drive a UI to confirm a fix) | Drive the UI with whatever automation you have, or hand the user a concrete manual check. Do not claim done without observing the artifact. |
| `plugin-dev:skill-development` | Do not search for this skill on disk. Follow this mapping and the `create-skill` guidance for SKILL.md files. Keep `name` plus `description` frontmatter and progressive disclosure. |
| `loop` (recurring/self-paced re-invocation, used by `babysit`) | Dropout. Re-run the step yourself on a cadence. `keepAlive: busy` is not `/loop`. |

## Vendored scripts

`skills/poteto-mode/scripts/` ships the `watch-pr` PR watcher, the `orch` store CLI, `worktree-audit.sh`, and `runner/pstack-runner`. They are plain bun and bash. Invoke them through `execute`/`shell`. The external runner needs the assigned `claude`, `codex`, or `grok` executable already authenticated. It rejects a Copilot provider because that lane belongs on a pinned `*.agent.md`. The other scripts need `bun`, `gh`, (for stack work) `gt`, and (for `worktree-audit.sh`) `jq` and `rg`.

## Session identity

A `sessionStart` plugin hook lives at `hooks/hooks.json` (Copilot's default plugin hook path). On a new interactive session it submits `/poteto-mode` as a prompt hook, which actually loads the skill. It also injects a short routing mandate as `additionalContext` so resume and `-p` still see the instruction. The prompt hook does not fire on resume or `-p`. The same hook links plugin agents into `~/.copilot/agents/` (or `$COPILOT_HOME/agents`) so the Copilot app picker and `task()` see file stems. It skips a regular file of the same name.

Pick `poteto-agent` in the Copilot app agent picker. That profile is sticky for the session. CLI `/agent` or `copilot --agent pstack:poteto-agent` is the same file. Do not treat the CLI flag as an extra step after picking the agent. Skills stay on-demand on the default Copilot agent.

Plugin skills lose to `~/.agents/skills/` and `~/.copilot/skills/` on name collision. Do not keep a home copy of `poteto-mode`, `how`, `why`, or `unslop` if you want the plugin versions.

## Instructions file

Where a pstack skill says "your instructions file", on Copilot that is `~/.copilot/copilot-instructions.md`. `/setup-pstack` writes a bounded `<!-- pstack:models:begin -->` block there and keeps `~/.copilot/pstack-models.md` as the editable sheet. Do not fold pstack into a repo-specific gated section of that file.
