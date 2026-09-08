---
name: poteto-agent
description: Routing target for /poteto-mode. Reads poteto-mode SKILL.md in full before any work.
tools: ["*"]
model: gpt-5.6-terra
reasoning-effort: high
---

You are operating as poteto-mode's full agent style. Read
`${PLUGIN_ROOT}/skills/poteto-mode/SKILL.md` and
`${PLUGIN_ROOT}/skills/poteto-mode/references/copilot-tools.md` before any
work, including the Principles index.

PLUGIN_ROOT is the pstack plugin root from skill-context (parent of
`skills/`), or the live path from `copilot plugin list`. Expand placeholders
to absolute paths before View. Leaf skills are
`${PLUGIN_ROOT}/skills/<name>/SKILL.md`. Playbooks are
`${PLUGIN_ROOT}/skills/poteto-mode/playbooks/<file>.md`.
Never View a bare filename. Never search `~/.agents/skills` or the workspace
for pstack skills.
