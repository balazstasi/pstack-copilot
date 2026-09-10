import { describe, expect, it } from "bun:test";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const PLUGIN_ROOT = join(import.meta.dir, "../../../..");
const POTETO = join(PLUGIN_ROOT, "skills/poteto-mode/SKILL.md");
const COPILOT_TOOLS = join(
  PLUGIN_ROOT,
  "skills/poteto-mode/references/copilot-tools.md",
);
const AUTHORING = join(
  PLUGIN_ROOT,
  "skills/poteto-mode/playbooks/authoring-a-skill.md",
);
const AGENT = join(PLUGIN_ROOT, "agents/poteto-agent.agent.md");
const GENERATOR = join(import.meta.dir, "generate-copilot-agents.ts");
const CREATE = join(
  PLUGIN_ROOT,
  "skills/create-verification-skill/SKILL.md",
);

describe("copilot skill path anchors", () => {
  const poteto = readFileSync(POTETO, "utf8");
  const tools = readFileSync(COPILOT_TOOLS, "utf8");
  const authoring = readFileSync(AUTHORING, "utf8");
  const agent = readFileSync(AGENT, "utf8");
  const generator = readFileSync(GENERATOR, "utf8");
  const create = readFileSync(CREATE, "utf8");

  it("names PLUGIN_ROOT and SKILL_PATH hops that exist on disk", () => {
    const principles = [
      ...poteto.matchAll(/\*\*(principle-[a-z0-9-]+)\*\*/g),
    ].map((match) => match[1]);
    expect(principles.length).toBeGreaterThan(10);
    for (const name of new Set(principles)) {
      expect(
        existsSync(join(PLUGIN_ROOT, "skills", name, "SKILL.md")),
        name,
      ).toBe(true);
    }
    const playbooks = [
      ...poteto.matchAll(/playbooks\/([a-z0-9-]+\.md)/g),
    ].map((match) => match[1]);
    expect(playbooks.length).toBeGreaterThan(10);
    for (const file of new Set(playbooks)) {
      expect(
        existsSync(
          join(PLUGIN_ROOT, "skills/poteto-mode/playbooks", file),
        ),
        file,
      ).toBe(true);
    }
    expect(
      existsSync(
        join(PLUGIN_ROOT, "skills/poteto-mode/playbooks/authoring-a-skill.md"),
      ),
    ).toBe(true);
    expect(
      existsSync(
        join(
          PLUGIN_ROOT,
          "skills/poteto-mode/skills/principle-prove-it-works/SKILL.md",
        ),
      ),
    ).toBe(false);
  });

  it("anchors Copilot hops so View cannot use a bare SKILL.md", () => {
    expect(tools).toContain("## Skill path resolution");
    expect(tools).toContain("${PLUGIN_ROOT}/skills/<name>/SKILL.md");
    expect(tools).toContain("`skill` tool by name");
    expect(tools).toContain("Do not `view` `${PLUGIN_ROOT}/skills/<name>/SKILL.md`");
    expect(tools).toContain("~/.agents/skills/");
    expect(tools).toContain("Do not search for this skill on disk");
    expect(tools).toContain("Never pass `pstack:comment-sicko` to `task()`");
    expect(poteto).toContain("skill: principle-laziness-protocol");
    expect(poteto).toContain("Never `view` `SKILL.md`");
    expect(poteto).toContain("${SKILL_PATH}/playbooks/<file>.md");
    expect(authoring).toContain("do not search for that skill on disk");
    expect(create).toContain(
      "${PLUGIN_ROOT}/skills/poteto-mode/references/copilot-tools.md",
    );
    expect(agent).toContain("skill: poteto-mode");
    expect(agent).toContain("This profile is the session");
    expect(agent).toContain("Never View a path that ends in SKILL.md");
    expect(agent).toContain("Never View a bare filename");
    expect(generator).toContain("Never View a path that ends in SKILL.md");
    expect(generator).toContain("This profile is the session");
    expect(tools).toContain("Pick `poteto-agent` in the Copilot app agent picker");
  });
});
