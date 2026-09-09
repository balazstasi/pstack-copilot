import { describe, expect, it } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const HOOKS = import.meta.dir;
const PLUGIN_ROOT = join(HOOKS, "..");

describe("copilot sessionStart hook", () => {
  const manifest = JSON.parse(
    readFileSync(join(PLUGIN_ROOT, ".github/plugin/plugin.json"), "utf8"),
  );
  const marketplace = JSON.parse(
    readFileSync(join(PLUGIN_ROOT, ".github/plugin/marketplace.json"), "utf8"),
  );
  const hooks = JSON.parse(
    readFileSync(join(HOOKS, "copilot-hooks.json"), "utf8"),
  );
  const mandate = readFileSync(
    join(HOOKS, "session-start-context.md"),
    "utf8",
  );

  it("registers the Copilot hook file from both manifests", () => {
    expect(manifest.hooks).toBe("hooks/copilot-hooks.json");
    expect(marketplace.plugins[0].hooks).toBe("hooks/copilot-hooks.json");
  });

  it("is a sessionStart command hook, not a prompt and not a subagent injector", () => {
    expect(hooks.version).toBe(1);
    expect(Object.keys(hooks.hooks)).toEqual(["sessionStart"]);
    const [entry] = hooks.hooks.sessionStart;
    expect(entry.type).toBe("command");
    expect(entry.bash).toContain("${PLUGIN_ROOT}/hooks/session-start");
    expect(entry.powershell).toContain("${PLUGIN_ROOT}\\hooks\\session-start.ps1");
    expect(JSON.stringify(hooks)).not.toContain('"prompt"');
    expect(JSON.stringify(hooks)).not.toContain("subagentStart");
  });

  it("emits additionalContext with the Copilot poteto-mode mandate", () => {
    const result = Bun.spawnSync(["bash", join(HOOKS, "session-start")], {
      stdout: "pipe",
      stderr: "pipe",
    });
    expect(result.exitCode).toBe(0);
    expect(result.stderr.toString()).toBe("");
    const payload = JSON.parse(result.stdout.toString());
    expect(payload.additionalContext).toBe(mandate);
    expect(mandate).toContain("invoke `/poteto-mode`");
    expect(mandate).toContain("ignore this block");
    expect(mandate).not.toContain("Skill tool");
    expect(mandate).not.toContain("CLAUDE.md");
  });
});
