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

Copilot namespaces plugin agents. `--agent poteto-agent` is rejected.

```bash
copilot --agent pstack:poteto-agent
```

You can also pick `pstack:poteto-agent` with `/agent`.

## Fan-out limits

Before a four-lane panel, set these in `~/.copilot/settings.json`:

```json
{
  "subagents": {
    "maxConcurrency": 4,
    "maxDepth": 2
  }
}
```

Values of 2 and 1 collapse how-critics, arena, architect, and interrogate.

## Configure models

In Copilot CLI:

```text
/setup-pstack
```

Setup writes `~/.copilot/pstack-models.md` and a bounded `<!-- pstack:models:begin -->` block at the end of `~/.copilot/copilot-instructions.md`. It does not fold pstack into a repo-gated section of that file.

Copilot first-run defaults:

- feature / refactoring / how explorer / swarm workers → `copilot:gpt-5.6-luna@xhigh`
- judgment / hardest / how explainer → `copilot:gpt-5.6-terra@high`
- bug-fix / perf / hillclimb → `copilot:gpt-5.6-sol@medium`
- panels → terra, sol, `inherit-parent`, `copilot:kimi-k3@high`
- why / reflect → `inherit-parent`

`copilot:gpt-5.6-sol@medium` is Copilot Sol. `codex:gpt-5.6-sol` still means the Codex CLI. Setup never maps Fable to Terra.

## Layout

```text
.
├── .github/plugin/marketplace.json   # marketplace name pstack-copilot, source ./
├── .github/plugin/plugin.json        # plugin name pstack, agents/, skills/
├── agents/                           # Copilot-only *.agent.md
└── skills/                           # shared pstack skills, including setup-pstack and poteto-mode
```

## Tests

```bash
cd skills/poteto-mode/scripts
bun test --parallel bootstrap orch watch-pr runner check-plan
```

## License

MIT. See [NOTICE.md](NOTICE.md), [LICENSE](LICENSE), and [LICENSE-cursor-team-kit](LICENSE-cursor-team-kit).
