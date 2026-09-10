# pstack for GitHub Copilot

This repository is a local GitHub Copilot plugin for the Copilot app and Copilot CLI. The repo root is the plugin.

It packages the Copilot parent from [open-pstack](https://github.com/ericlitman/open-pstack). Skills stay shared. Copilot-only agents live in `agents/` as `*.agent.md` files. Claude `agents/*.md` files are not here. Copilot loads every `*.md` and `*.agent.md` in the plugin agents directory.

Do not copy `skills/` into `~/.agents/skills/` or `~/.copilot/skills/`. Copilot loads plugin skills last. A home skill with the same `name:` silently wins, and the plugin copy is dropped.

## Install

The Copilot app and Copilot CLI share `~/.copilot/settings.json`. Install once.

From this clone:

```bash
copilot plugin marketplace add "$(pwd)"
copilot plugin install pstack@pstack-copilot
```

That writes `extraKnownMarketplaces.pstack-copilot` and `enabledPlugins["pstack@pstack-copilot"]`.

In the Copilot app you can do the same from **Customize → Plugins**. Add this clone as a custom marketplace, then install `pstack`.

If an older `pstack@open-pstack` marketplace is still enabled, disable or uninstall it so two pstacks do not load:

```bash
copilot plugin uninstall pstack@open-pstack
copilot plugin marketplace remove open-pstack
```

Confirm the loaded path:

```bash
copilot plugin list
```

The enabled plugin must load from this clone, not from `~/Projects/open-pstack`.

### Home-skill collisions

Copilot skill order is first-found-wins. Plugin skills lose to `~/.agents/skills/` and `~/.copilot/skills/`. If `/how` or `/poteto-mode` still looks like Cursor (composer models, `disable-model-invocation`), a home copy is winning.

Move colliding names out of the way. Keep the backup so Cursor or Grok can still use them:

```bash
mkdir -p ~/.agents/skills.bak-pstack-copilot
# example; move every name that also exists in this repo's skills/
mv ~/.agents/skills/poteto-mode ~/.agents/skills.bak-pstack-copilot/
```

Then `copilot skill list`. pstack names should come from the plugin, not `Custom skills`.

## Run with the pstack agent

Pick **poteto-agent** in the Copilot app agent picker (or type `/agent`). That file is sticky for the session. It loads `poteto-mode` before any work. There is no extra CLI latch.

Copilot CLI uses the plugin id:

```bash
copilot --agent pstack:poteto-agent
```

`pstack-terra` and the other `pstack-<stem>` files are spawn lanes for `task()`. Do not pick them as the session agent.

A `sessionStart` hook submits `/poteto-mode` on a new default-agent session and injects a short mandate as `additionalContext` (resume and `-p` included). Copilot may ask you to trust that hook. The prompt hook does not fire on resume or `-p`. The same hook links every `agents/*.agent.md` into `~/.copilot/agents/` so the Copilot app picker and `task()` see file stems. It does not replace a regular file of the same name.

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

Values below the panel size collapse arena, architect, and interrogate.

## Configure models

In Copilot CLI or the Copilot app:

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
├── hooks/                            # sessionStart: /poteto-mode, mandate, agent links
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
