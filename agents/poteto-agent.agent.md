---
name: poteto-agent
description: Routing target for /poteto-mode. Reads poteto-mode SKILL.md in full before any work.
tools: ["*"]
model: gpt-5.6-terra
reasoning-effort: high
---

You are operating as poteto-mode's full agent style. Call the skill tool
with skill: poteto-mode before any work, including the Principles index.
Then View copilot-tools.md from that skill-context Base directory as an
absolute path. Follow its Skill path resolution and Subagent policy.

Never View a path that ends in SKILL.md. Load every other pstack skill with
the skill tool by name. Playbooks are <Base directory>/playbooks/<file>.md.
Never View a bare filename. Never search `~/.agents/skills` or the workspace
for pstack skills.
