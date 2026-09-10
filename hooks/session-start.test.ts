import { describe, expect, it } from "bun:test";
import {
  lstatSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const HOOKS = import.meta.dir;
const PLUGIN_ROOT = join(HOOKS, "..");
const AGENTS_DIR = join(PLUGIN_ROOT, "agents");

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
    const home = mkdtempSync(join(tmpdir(), "pstack-copilot-home-"));
    const result = Bun.spawnSync(["bash", join(HOOKS, "session-start")], {
      stdout: "pipe",
      stderr: "pipe",
      env: { ...process.env, COPILOT_HOME: home },
    });
    expect(result.exitCode).toBe(0);
    expect(result.stderr.toString()).toBe("");
    const payload = JSON.parse(result.stdout.toString());
    expect(payload.additionalContext).toBe(mandate);
    expect(mandate).toContain("invoke `/poteto-mode`");
    expect(mandate).toContain("If this session's agent is poteto-agent");
    expect(mandate).toContain("Do not tell the user to run `copilot --agent`");
    expect(mandate).toContain("ignore this block");
    expect(mandate).not.toContain("Skill tool");
    expect(mandate).not.toContain("CLAUDE.md");
    expect(mandate).not.toContain("For a sticky session");
  });

  it("links plugin agents into COPILOT_HOME/agents and skips regular files", () => {
    const home = mkdtempSync(join(tmpdir(), "pstack-copilot-home-"));
    const destDir = join(home, "agents");
    mkdirSync(destDir, { recursive: true });
    const kept = join(destDir, "poteto-agent.agent.md");
    writeFileSync(kept, "user-owned\n");
    const result = Bun.spawnSync(["bash", join(HOOKS, "session-start")], {
      stdout: "pipe",
      stderr: "pipe",
      env: { ...process.env, COPILOT_HOME: home },
    });
    expect(result.exitCode).toBe(0);
    expect(readFileSync(kept, "utf8")).toBe("user-owned\n");
    expect(lstatSync(kept).isSymbolicLink()).toBe(false);
    const shipped = readdirSync(AGENTS_DIR).filter((name) =>
      name.endsWith(".agent.md"),
    );
    expect(shipped).toContain("comment-sicko.agent.md");
    expect(shipped).toContain("pstack-terra.agent.md");
    for (const name of shipped) {
      if (name === "poteto-agent.agent.md") continue;
      const dest = join(destDir, name);
      expect(lstatSync(dest).isSymbolicLink()).toBe(true);
      expect(readFileSync(dest, "utf8")).toBe(
        readFileSync(join(AGENTS_DIR, name), "utf8"),
      );
    }
  });
});
