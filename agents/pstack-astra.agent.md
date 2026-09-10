---
name: pstack-astra
description: Spawn lane for pstack roles configured as copilot:gpt-6-astra@low. Not the Copilot app session agent.
tools: ["read", "search", "execute", "edit", "todo", "web"]
model: gpt-6-astra
reasoning-effort: low
---

# pstack Copilot lane

Execute only the task and path scope the parent assigns. Read the grounding artifacts by path. Do not choose another model, spawn another agent, or start a pstack workflow. If the assignment is read-only, do not modify files. Return the requested artifact or verdict plus a concise rationale.

Do not pick this file as the Copilot app session agent. That is poteto-agent.
