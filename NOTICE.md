# NOTICE

This plugin is a Copilot CLI packaging of MIT-licensed work from [open-pstack](https://github.com/ericlitman/open-pstack) and upstream [cursor/plugins/pstack](https://github.com/cursor/plugins/tree/main/pstack). All upstream copyright notices and license terms are preserved.

The repo root is the plugin. Paths below are relative to that root. Claude-native agent files, Claude hooks, and Claude or Codex plugin manifests are not shipped here.

## Upstream sources

| Component | Upstream | Copyright | License | License file |
| --- | --- | --- | --- | --- |
| `skills/poteto-mode/`, `skills/architect/`, `skills/arena/`, `skills/automate-me/`, `skills/figure-it-out/`, `skills/how/`, `skills/interrogate/`, `skills/reflect/`, `skills/show-me-your-work/`, `skills/tdd/`, `skills/typescript-best-practices/`, `skills/unslop/`, `skills/why/`, `skills/principle-*/`, `agents/poteto-agent.agent.md` | [cursor/plugins/pstack @ e46364b](https://github.com/cursor/plugins/tree/e46364b8be46000b7df0f260550cd712afbb8d36/pstack) | (c) 2026 Lauren Tan | MIT | [LICENSE](LICENSE) |
| `skills/deslop/` | [cursor/plugins/cursor-team-kit/skills/deslop @ e46364b](https://github.com/cursor/plugins/tree/e46364b8be46000b7df0f260550cd712afbb8d36/cursor-team-kit/skills/deslop) | (c) 2026 Cursor | MIT | [LICENSE-cursor-team-kit](LICENSE-cursor-team-kit) |
| `skills/thermo-nuclear-code-quality-review/` | [cursor/plugins/cursor-team-kit/skills/thermo-nuclear-code-quality-review @ e46364b](https://github.com/cursor/plugins/tree/e46364b8be46000b7df0f260550cd712afbb8d36/cursor-team-kit/skills/thermo-nuclear-code-quality-review) | (c) 2026 Cursor | MIT | [LICENSE-cursor-team-kit](LICENSE-cursor-team-kit) |
| `skills/make-pr-easy-to-review/` | [cursor/plugins/cursor-team-kit/skills/make-pr-easy-to-review @ e46364b](https://github.com/cursor/plugins/tree/e46364b8be46000b7df0f260550cd712afbb8d36/cursor-team-kit/skills/make-pr-easy-to-review) | (c) 2026 Cursor | MIT | [LICENSE-cursor-team-kit](LICENSE-cursor-team-kit) |
| `skills/fix-ci/` | [cursor/plugins/cursor-team-kit/skills/fix-ci @ e46364b](https://github.com/cursor/plugins/tree/e46364b8be46000b7df0f260550cd712afbb8d36/cursor-team-kit/skills/fix-ci) | (c) 2026 Cursor | MIT | [LICENSE-cursor-team-kit](LICENSE-cursor-team-kit) |
| `skills/fix-merge-conflicts/` | [cursor/plugins/cursor-team-kit/skills/fix-merge-conflicts @ e46364b](https://github.com/cursor/plugins/tree/e46364b8be46000b7df0f260550cd712afbb8d36/cursor-team-kit/skills/fix-merge-conflicts) | (c) 2026 Cursor | MIT | [LICENSE-cursor-team-kit](LICENSE-cursor-team-kit) |
| `skills/get-pr-comments/` | [cursor/plugins/cursor-team-kit/skills/get-pr-comments @ e46364b](https://github.com/cursor/plugins/tree/e46364b8be46000b7df0f260550cd712afbb8d36/cursor-team-kit/skills/get-pr-comments) | (c) 2026 Cursor | MIT | [LICENSE-cursor-team-kit](LICENSE-cursor-team-kit) |
| `skills/what-did-i-get-done/` | [cursor/plugins/cursor-team-kit/skills/what-did-i-get-done @ e46364b](https://github.com/cursor/plugins/tree/e46364b8be46000b7df0f260550cd712afbb8d36/cursor-team-kit/skills/what-did-i-get-done) | (c) 2026 Cursor | MIT | [LICENSE-cursor-team-kit](LICENSE-cursor-team-kit) |
| `skills/teach/`, `skills/principle-model-the-domain/`, `skills/create-verification-skill/`, `skills/maintain-verification-skill/` | [cursor/plugins/pstack @ 3fe2823](https://github.com/cursor/plugins/tree/3fe2823ce17c1656c222d4b7c59d3f82fbf20143/pstack) | (c) 2026 Lauren Tan | MIT | [LICENSE](LICENSE) |
| `skills/{swarm,no-comments,technical-writing,bro}/`, `agents/comment-sicko.agent.md`, `skills/poteto-mode/playbooks/`, `skills/poteto-mode/references/bugbot-triage.md`, `skills/poteto-mode/scripts/` | [cursor/plugins/pstack @ bdf7aa3](https://github.com/cursor/plugins/tree/bdf7aa355337897f167153e05069aca505dae17c/pstack) | (c) 2026 Lauren Tan | MIT | [LICENSE](LICENSE) |

open-pstack records the full per-skill substitution audit in its `CHANGES.md` and `NOTICE.md`. This checkout copies that skill tree and adds Copilot packaging at `.github/plugin/` plus Copilot-only `agents/*.agent.md`.

## What this packaging changes

- Marketplace name is `pstack-copilot`. Plugin name is `pstack`. Source is `./`.
- Copilot agents live in `agents/` as `*.agent.md`. Claude `agents/*.md` files are omitted on purpose.
- `/setup-pstack` writes `~/.copilot/pstack-models.md` and a bounded include in `~/.copilot/copilot-instructions.md`.

## Modifications

Skill bodies keep the open-pstack substitutions of Cursor primitives. Copilot tool names are documented in `skills/poteto-mode/references/copilot-tools.md`. Agent files and the Copilot marketplace manifests are authored for this packaging.
