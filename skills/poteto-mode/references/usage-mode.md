# Usage mode

Resolve usage mode before choosing a workflow or launching any native agent or external model. This policy applies to every pstack skill, principle, playbook, review, and retry. Read it once per session; reuse the resolved state unless the user changes it.

## Resolve once

Read `usage mode: poor|normal` from the current parent's model sheet: Copilot `~/.copilot/pstack-models.md`, Codex `~/.codex/pstack-models.md`, Claude Code `~/.claude/pstack-models.md`. Use the harness's configured home directory when overridden. A missing sheet or field means `normal`, preserving existing installations. Duplicate or invalid mode fields must be corrected before delegation; continue useful local work meanwhile.

A direct task-specific mode instruction overrides the saved setting for that task only. “I'm poor” or `/poor-mode` enables persistent poor mode through the **poor-mode** skill; “normal mode” restores normal behavior through the same skill. “I'm poor for this task” changes only the active task. Do not rewrite configuration for a temporary override.

“Full arena for this task” authorizes Arena's normal candidates and judge for that invocation only. Other explicitly requested agent counts or specialist consultations authorize only those named lanes. A bare `/arena`, `/swarm`, or `/interrogate` selects the workflow but does not disable poor mode. “Be autonomous” and “don't stop” do not authorize additional model usage. Neither does invoking a nested skill.

## Poor mode contract

- Work in the current agent. No automatic subagents, external model calls, panels, independent model judges, or recursive delegation. This overrides conflicting fan-out, throughput, second-opinion, and context-offloading instructions elsewhere in pstack.
- Scale design to the change. Crossing a function boundary alone does not trigger Architect. Use a short sketch when changing subsystem boundaries, ownership, or a shared contract. Compare two brief approaches only for a meaningful tradeoff; implement one.
- Search before reading. Read relevant sections and callers, reuse established findings, and keep tool output bounded. Load only skill references needed for the active work. Do not launch helpers to clear context.
- Reproduce bugs, run relevant tests, inspect the final diff and callers, and fix concrete findings. Keep required correctness and safety checks. Repeat verification after relevant changes or new evidence, not for reassurance.
- Keep reports concise: outcome, actionable findings, validation, and remaining uncertainty. Skip exhaustive candidate packages, agreement maps, ceremonial principle recitals, and throughput reports.
- If blocked on a hard question, narrow it using available evidence first. Offer one scoped specialist consultation if it would help, explaining the question and proposed model. Launch only when explicitly requested or already authorized. Do not silently upgrade models or restart the entire workflow.
- A permitted helper receives the specific question, relevant paths, compact evidence, expected output, and no-delegation instruction. Avoid full conversation inheritance. Stop when that question is answered; retries or extra reviewers are not implicitly authorized.
- Do not claim to switch the parent model, impose a hard token cap, or measure savings without host support and usage evidence. This is an instruction-level workflow policy, not a runtime billing limit.

## Reduced workflows

These replace the normal delegated phases while poor mode is active. Retain the requested deliverable and relevant verification; do not run the normal phases afterward.

| Workflow | Execute in the parent |
| --- | --- |
| Architect | Trace affected code, sketch the boundary or contract if necessary, choose one design, implement and verify. No Arena call. |
| Arena | Compare two short sketches against a brief rubric, choose one, produce it once, verify. Identify the result as reduced Arena without independent candidates or a judge. |
| Swarm | Cover the requested slices locally; reuse evidence and return one report. Do not race implementations. |
| Interrogate | Review the diff and relevant callers once against intent and the rubric; report actionable findings and uncertainty. No model consensus claims. |
| How | Trace the relevant code and explain directly, including for simple questions. No explorer or explainer handoff. |
| Why | Investigate relevant available evidence directly, distinguishing sources from inference. No investigator or synthesizer handoff. |
| Reflect | Inspect the active conversation once, extract durable lessons, and make the warranted skill edits. No reviewer panel. |
| No-comments and other delegated reviews | Apply the review criteria locally to the relevant diff. For No-comments, read the criteria in `agents/comment-sicko.agent.md` from the plugin root without launching that agent. |
| Other playbooks and principles | Perform necessary work locally; replace competing prototypes with brief sketches and keep a single implementation. |

A workflow requiring an independent approval before an irreversible action still requires that approval. Complete the authorized preparation locally and report the unmet gate; never substitute self-review for required independent approval or claim that the gate passed.
