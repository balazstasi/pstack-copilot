# pstack for Copilot CLI

This repository is a local GitHub Copilot CLI plugin. The repo root is the plugin. Install it the same way you install ponytail from a local checkout.

It packages the Copilot parent from [open-pstack](https://github.com/ericlitman/open-pstack). Skills stay shared. Copilot-only agents live in `agents/` as `*.agent.md` files. Claude `agents/*.md` files are not here. Copilot loads every `*.md` and `*.agent.md` in the plugin agents directory.

Do not copy `skills/` into `~/.agents/skills/`. Copilot loads the plugin tree. Duplicates follow if you copy it.

## Install

From any directory:

```bash
copilot plugin marketplace add /Users/bata02/Projects/pstack-copilot
copilot plugin install pstack@pstack-copilot
```

That writes `extraKnownMarketplaces.pstack-copilot` and `enabledPlugins["pstack@pstack-copilot"]` in `~/.copilot/settings.json`.

If an older `pstack@open-pstack` marketplace is still enabled, disable or uninstall it so two pstacks do not load:

```bash
copilot plugin uninstall pstack@open-pstack
copilot plugin marketplace remove open-pstack
```

Confirm the loaded path:

```bash
copilot plugin list
```

The enabled plugin must load from `/Users/bata02/Projects/pstack-copilot`, not from `~/Projects/open-pstack`.

## Latch poteto-mode

A `sessionStart` hook injects a short mandate that routes non-trivial work into `/poteto-mode`. Copilot may ask you to trust that hook. The full skill still loads only when invoked.

Copilot namespaces plugin agents. `--agent poteto-agent` is rejected. Latch the full style for the session with:

```bash
copilot --agent pstack:poteto-agent
```

You can also pick `pstack:poteto-agent` with `/agent`.

Copilot Desktop `task()` uses file stems from `~/.copilot/agents/`, not `pstack:<stem>`. Link spawnable plugin agents there so `comment-sicko` and family lanes appear in the enum:

```bash
mkdir -p ~/.copilot/agents
ln -sf "$(pwd)/agents/comment-sicko.agent.md" ~/.copilot/agents/comment-sicko.agent.md
ln -sf "$(pwd)/agents/poteto-agent.agent.md" ~/.copilot/agents/poteto-agent.agent.md
```

Run those from the plugin root (`copilot plugin list` shows the live path). `task()` then takes `agent_type: comment-sicko`. `pstack:comment-sicko` is CLI `--agent` only.

## Fan-out limits

Before a panel, set these in `~/.copilot/settings.json` so concurrency is at least the configured panel size (3 by default):

```json
{
  "subagents": {
    "maxConcurrency": 3,
    "maxDepth": 2
  }
}
```

Values below the panel size collapse how-critics, arena, architect, and interrogate.

## Configure models

In Copilot CLI:

```text
/setup-pstack
```

Setup writes `~/.copilot/pstack-models.md` and a bounded `<!-- pstack:models:begin -->` block at the end of `~/.copilot/copilot-instructions.md`. It does not fold pstack into a repo-gated section of that file.

Copilot first-run defaults:

- feature / refactoring / how explorer → `copilot:gpt-5.6-luna@xhigh`
- swarm workers → `copilot:gpt-6-astra@low`
- judgment and prose → `copilot:claude-opus-5@medium`
- hardest / how explainer → `copilot:gpt-5.6-terra@high`
- bug-fix / perf / hillclimb → `copilot:gpt-5.6-sol@medium`
- panels → terra, sol, kimi (2 or 3 distinct families; `/setup-pstack` sets the list)
- why / reflect → `inherit-parent`

`copilot:gpt-5.6-sol@medium` is Copilot Sol. `codex:gpt-5.6-sol` still means the Codex CLI. Setup never maps Fable to Terra.

## Layout

```text
.
├── .github/plugin/marketplace.json   # marketplace name pstack-copilot, source ./
├── .github/plugin/plugin.json        # plugin name pstack, agents/, skills/, hooks/
├── agents/                           # Copilot-only *.agent.md
├── hooks/                            # sessionStart: injects the poteto-mode mandate
└── skills/                           # shared pstack skills, including setup-pstack and poteto-mode
```

## Tests

```bash
cd skills/poteto-mode/scripts
bun test --parallel bootstrap orch watch-pr runner check-plan
```

From the repo root:

```bash
bun test hooks/session-start.test.ts
```

## License

MIT. See [NOTICE.md](NOTICE.md), [LICENSE](LICENSE), and [LICENSE-cursor-team-kit](LICENSE-cursor-team-kit).
