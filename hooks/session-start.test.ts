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
  const hooks = JSON.parse(readFileSync(join(HOOKS, "hooks.json"), "utf8"));
  const mandate = readFileSync(join(HOOKS, "session-start-context.md"), "utf8");

  it("registers the Copilot default hook path from both manifests", () => {
    expect(manifest.hooks).toBe("hooks/hooks.json");
    expect(marketplace.plugins[0].hooks).toBe("hooks/hooks.json");
  });

  it("submits /poteto-mode and injects the mandate as additionalContext", () => {
    expect(hooks.version).toBe(1);
    expect(Object.keys(hooks.hooks)).toEqual(["sessionStart"]);
    const [prompt, command] = hooks.hooks.sessionStart;
    expect(prompt).toEqual({ type: "prompt", prompt: "/poteto-mode" });
    expect(command.type).toBe("command");
    expect(command.bash).toContain("${PLUGIN_ROOT}/hooks/session-start");
    expect(command.powershell).toContain(
      "${PLUGIN_ROOT}\\hooks\\session-start.ps1",
    );
    expect(command.timeoutSec).toBe(30);
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
