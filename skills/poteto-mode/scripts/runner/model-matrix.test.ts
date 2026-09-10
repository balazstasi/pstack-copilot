import { describe, expect, it } from "bun:test";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { COPILOT_NATIVE_FAMILIES } from "./copilot-agents.ts";
import { EFFORTS, type Effort } from "./types.ts";

const PLUGIN_ROOT = join(import.meta.dir, "../../../..");
const DISPATCH_PATH = join(
  PLUGIN_ROOT,
  "skills/poteto-mode/references/provider-dispatch.md"
);
const SETUP_PATH = join(PLUGIN_ROOT, "skills/setup-pstack/SKILL.md");
const AGENTS_DIR = join(PLUGIN_ROOT, "agents");

const MATRIX_HEADER = [
  "Family",
  "Upstream pstack choice",
  "Provider",
  "Model",
  "Default effort",
  "Selectable efforts",
  "Claude-native agent stem",
] as const;

const FAMILY_ORDER = ["fable", "sol", "grok", "opus"] as const;
const PROVIDERS = ["claude", "codex", "grok"] as const;
const DESCRIPTOR_RE =
  /(claude|codex|grok):[a-z0-9.-]+@(low|medium|high|xhigh|max)/g;
const PANEL_ROLES = [
  "how critics",
  "arena runners",
  "arena cross-judge pool",
  "architect runners",
  "interrogate reviewers",
] as const;
const SHEET_ROLES = [
  "feature, refactoring",
  "bug-fix",
  "perf-issue",
  "hillclimb",
  "judgment and prose",
  "hardest tasks",
  "how explorer",
  "how explainer",
  "how critics",
  "why investigators, synthesizer",
  "reflect tooling, judgment, divergent, synthesizer",
  "arena runners",
  "arena cross-judge pool",
  "swarm workers",
  "architect runners",
  "interrogate reviewers",
] as const;
const SETUP_SECTION_ORDER = [
  "### 2. Load current state",
  "### 3. Parse per-family efforts",
  "### 4. Collect one requested effort per family",
  "### 5. Probe the four requested pairs",
  "### 6. Render, preserving role families",
  "### 7. Confirm and commit",
] as const;

interface MatrixRow {
  family: string;
  upstreamChoice: string;
  provider: string;
  model: string;
  defaultEffort: Effort;
  selectableEfforts: Effort[];
  claudeNativeAgentStem: string | null;
}

function splitRow(line: string): string[] {
  const trimmed = line.trim();
  if (!trimmed.startsWith("|") || !trimmed.endsWith("|")) {
    throw new Error(`matrix row must be a pipe table: ${line}`);
  }
  return trimmed
    .slice(1, -1)
    .split("|")
    .map((cell) => cell.trim().replaceAll("`", ""));
}

function isSeparator(cells: string[]): boolean {
  return cells.every((cell) => /^:?-{3,}:?$/.test(cell));
}

function asEffort(value: string): Effort {
  if ((EFFORTS as readonly string[]).includes(value)) {
    return value as Effort;
  }
  throw new Error(`not an effort: ${value}`);
}

function parseModelMatrix(markdown: string): MatrixRow[] {
  const lines = markdown.split(/\r?\n/);
  const start = lines.findIndex((line) => line.trim() === "## Model matrix");
  if (start < 0) {
    throw new Error("missing ## Model matrix");
  }
  let end = lines.length;
  for (let i = start + 1; i < lines.length; i++) {
    if (lines[i].startsWith("## ")) {
      end = i;
      break;
    }
  }
  const table = lines
    .slice(start + 1, end)
    .map((line) => line.trim())
    .filter((line) => line.startsWith("|"));
  if (table.length !== 6) {
    throw new Error(
      `model matrix must be header, separator, and 4 data rows, got ${table.length}`
    );
  }
  const header = splitRow(table[0]);
  if (header.join("|") !== MATRIX_HEADER.join("|")) {
    throw new Error(`unexpected matrix header: ${header.join(" | ")}`);
  }
  if (!isSeparator(splitRow(table[1]))) {
    throw new Error("matrix header separator missing");
  }
  return table.slice(2).map((line) => {
    const cells = splitRow(line);
    if (cells.length !== MATRIX_HEADER.length) {
      throw new Error(`matrix row has ${cells.length} cells: ${line}`);
    }
    const [
      family,
      upstreamChoice,
      provider,
      model,
      defaultEffortRaw,
      selectableRaw,
      stemRaw,
    ] = cells;
    if (!(PROVIDERS as readonly string[]).includes(provider)) {
      throw new Error(`invalid provider: ${provider}`);
    }
    const selectableEfforts = selectableRaw.split(/\s+/).map(asEffort);
    const claudeNativeAgentStem = stemRaw === "-" ? null : stemRaw;
    if (claudeNativeAgentStem !== null && !/^[a-z0-9-]+$/.test(claudeNativeAgentStem)) {
      throw new Error(`invalid Claude-native agent stem: ${stemRaw}`);
    }
    if ((provider === "claude") !== (claudeNativeAgentStem !== null)) {
      throw new Error(`${family} stem must be present iff provider is claude`);
    }
    const defaultEffort = asEffort(defaultEffortRaw);
    if (!selectableEfforts.includes(defaultEffort)) {
      throw new Error(`${family} default effort is not selectable`);
    }
    return {
      family,
      upstreamChoice,
      provider,
      model,
      defaultEffort,
      selectableEfforts,
      claudeNativeAgentStem,
    };
  });
}

function defaultDescriptors(rows: MatrixRow[]): string[] {
  return rows.map(
    (row) => `${row.provider}:${row.model}@${row.defaultEffort}`
  );
}

function parseFrontmatter(text: string): {
  fields: Record<string, string>;
  body: string;
} {
  if (!text.startsWith("---\n")) {
    throw new Error("missing frontmatter");
  }
  const end = text.indexOf("\n---\n", 4);
  if (end < 0) {
    throw new Error("unterminated frontmatter");
  }
  const fields: Record<string, string> = {};
  for (const line of text.slice(4, end).split("\n")) {
    const idx = line.indexOf(": ");
    if (idx < 0) {
      throw new Error(`bad frontmatter line: ${line}`);
    }
    fields[line.slice(0, idx)] = line.slice(idx + 2);
  }
  return { fields, body: text.slice(end + 5) };
}

function firstRunSheet(setup: string): string {
  const match = setup.match(
    /```markdown\n(# pstack model configuration\n[\s\S]*?)```/
  );
  if (!match) {
    throw new Error("setup-pstack is missing the first-run sheet fence");
  }
  return match[1];
}

describe("model matrix", () => {
  const rows = parseModelMatrix(readFileSync(DISPATCH_PATH, "utf8"));
  const setup = readFileSync(SETUP_PATH, "utf8");
  const quad = defaultDescriptors(rows);

  it("owns the effort universe and first-run defaults", () => {
    expect([...EFFORTS]).toEqual(["low", "medium", "high", "xhigh", "max"]);
    expect(rows.map((row) => row.family)).toEqual([...FAMILY_ORDER]);
    for (const row of rows) {
      expect(row.upstreamChoice.length).toBeGreaterThan(0);
      expect(row.model.length).toBeGreaterThan(0);
      expect(row.selectableEfforts.length).toBeGreaterThan(0);
      expect(row.selectableEfforts).toEqual(
        EFFORTS.filter((effort) => row.selectableEfforts.includes(effort))
      );
    }
    expect(
      rows.map((row) => [row.family, row.defaultEffort])
    ).toEqual([
      ["fable", "max"],
      ["sol", "max"],
      ["grok", "xhigh"],
      ["opus", "xhigh"],
    ]);
    expect(
      rows
        .filter((row) => row.family === "fable" || row.family === "opus")
        .map((row) => [row.family, row.model])
    ).toEqual([
      ["fable", "fable"],
      ["opus", "opus"],
    ]);
  });

  it("does not ship Claude-native agent files in this Copilot-only plugin", () => {
    const leaked = readdirSync(AGENTS_DIR).filter(
      (name) => name.endsWith(".md") && !name.endsWith(".agent.md")
    );
    expect(leaked).toEqual([]);
    expect(
      readdirSync(AGENTS_DIR).some((name) => name.includes("fable"))
    ).toBe(false);
  });

  it("keeps setup's first-run default panel copy aligned with the matrix", () => {
    const sheet = firstRunSheet(setup);
    const roles = sheet
      .split("\n")
      .filter((line) => line.includes(": "))
      .map((line) => line.slice(0, line.indexOf(": ")));
    expect(roles).toEqual([...SHEET_ROLES]);
    const byFamily = new Map<string, MatrixRow>(
      rows.map((row) => [`${row.provider}:${row.model}`, row])
    );
    for (const descriptor of sheet.match(DESCRIPTOR_RE) ?? []) {
      const at = descriptor.lastIndexOf("@");
      const key = descriptor.slice(0, at);
      const effort = descriptor.slice(at + 1);
      const row = byFamily.get(key);
      if (row === undefined) {
        throw new Error(`unknown first-run descriptor: ${descriptor}`);
      }
      expect(effort).toBe(row.defaultEffort);
    }
    const expectedPanel = quad.join(", ");
    for (const role of PANEL_ROLES) {
      const line = sheet
        .split("\n")
        .find((entry) => entry.startsWith(`${role}:`));
      if (line === undefined) {
        throw new Error(`missing first-run panel row: ${role}`);
      }
      expect(line).toBe(`${role}: ${expectedPanel}`);
    }
  });

  it("keeps setup's fail-closed reconfiguration order", () => {
    let previous = -1;
    for (const heading of SETUP_SECTION_ORDER) {
      const current = setup.indexOf(heading);
      expect(current).toBeGreaterThan(previous);
      previous = current;
    }
    expect(setup).toContain("Do not invent a precedence rule.");
    expect(setup).toContain("Do not probe or write while any inconsistency is unresolved.");
    expect(setup).toContain("A failed probe writes nothing:");
    expect(setup).toContain("Run one probe per family");
    expect(setup).toContain("normalized complete role map from step 2");
    expect(setup).toContain("starts with `claude-fable-` or `claude-opus-`");
    expect(setup).toContain("preserving the provider, effort, role, and lane order");
    expect(setup).toContain("Show any rolling-alias migrations");
    expect(setup).toContain("Every documented role remains present.");
    expect(setup).toContain("An effort-only rerun cannot change a role's family.");
    expect(setup).toContain("<!-- pstack:models:begin -->");
    expect(setup).toContain("<!-- pstack:models:end -->");
  });

  it("binds Claude-native dispatch to the matrix mapping", () => {
    const dispatch = readFileSync(DISPATCH_PATH, "utf8");
    const nativeStart = dispatch.indexOf("## Native lanes");
    const externalStart = dispatch.indexOf("## External lanes");
    expect(nativeStart).toBeGreaterThan(-1);
    expect(externalStart).toBeGreaterThan(nativeStart);
    const nativeLanes = dispatch.slice(nativeStart, externalStart);
    expect(nativeLanes).toContain(
      "match the descriptor's `(provider, model)` to one model-matrix row"
    );
    expect(nativeLanes).toContain("`pstack-<stem>-<effort>`");
    expect(nativeLanes).toContain("`pstack:pstack-<stem>`");
    expect(nativeLanes).not.toContain("issue 3565");
  });

  it("normalizes old rolling-family pins before any runtime route", () => {
    const dispatch = readFileSync(DISPATCH_PATH, "utf8");
    const normalizationStart = dispatch.indexOf("## Read-time normalization");
    const parentStart = dispatch.indexOf("## The parent owns the route");
    expect(normalizationStart).toBeGreaterThan(-1);
    expect(parentStart).toBeGreaterThan(normalizationStart);
    const normalization = dispatch.slice(normalizationStart, parentStart);
    expect(normalization).toContain("replace that model component in memory");
    expect(normalization).toContain("Never pass the versioned predecessor to Claude.");
    expect(normalization).toContain("without writing user files");
    expect(normalization).toContain("`/setup-pstack` will rewrite it");
    expect(normalization).toContain("runner rejects a missed Fable or Opus version pin");
  });

  it("ships Copilot-native agents under agents/ as *.agent.md only", () => {
    const dispatch = readFileSync(DISPATCH_PATH, "utf8");
    expect(dispatch).toContain("## Copilot-native families");
    expect(dispatch).toContain("`copilot:*`");
    expect(dispatch).toContain("--parent <claude|codex|copilot>");
    expect(dispatch).toContain(
      "| astra | gpt-6-astra | copilot | low | low | astra |"
    );
    expect(dispatch).toContain(
      "| luna | gpt-5.6-luna | copilot | xhigh | xhigh | luna |"
    );
    expect(dispatch).not.toContain("3565");
    const tools = readFileSync(
      join(PLUGIN_ROOT, "skills/poteto-mode/references/copilot-tools.md"),
      "utf8"
    );
    expect(tools).toContain("`agent_type: pstack-<stem>`");
    expect(tools).toContain("--agent pstack:pstack-<stem>");
    expect(tools).toContain("`agent_type: comment-sicko`");
    expect(tools).not.toContain("pstack-<stem>-<effort>");
    expect(tools).not.toContain("3565");
    expect(
      COPILOT_NATIVE_FAMILIES.map((family) => [
        family.family,
        family.model,
        family.stem,
        family.defaultEffort,
        [...family.selectableEfforts],
        family.contextTier ?? null,
      ])
    ).toEqual([
      ["terra", "gpt-5.6-terra", "terra", "high", ["high"], null],
      ["copilot-sol", "gpt-5.6-sol", "sol", "medium", ["medium"], null],
      ["luna", "gpt-5.6-luna", "luna", "xhigh", ["xhigh"], null],
      [
        "opus5",
        "claude-opus-5",
        "opus5",
        "medium",
        ["medium"],
        "default",
      ],
      ["kimi", "kimi-k3", "kimi", "high", ["high"], null],
      ["astra", "gpt-6-astra", "astra", "low", ["low"], null],
    ]);
    const expected = new Set<string>([
      "poteto-agent.agent.md",
      "comment-sicko.agent.md",
    ]);
    for (const family of COPILOT_NATIVE_FAMILIES) {
      const name = `pstack-${family.stem}`;
      expected.add(`${name}.agent.md`);
      expect([...family.selectableEfforts]).toEqual([family.defaultEffort]);
      expect(name).not.toMatch(/-(low|medium|high|xhigh|max)$/);
      const text = readFileSync(join(AGENTS_DIR, `${name}.agent.md`), "utf8");
      const { fields } = parseFrontmatter(text);
      expect(fields.name).toBe(name);
      expect(fields.model).toBe(family.model);
      expect(fields.model).not.toMatch(/1m/i);
      expect(fields["reasoning-effort"]).toBe(family.defaultEffort);
      expect(fields.tools).toBe(
        '["read", "search", "execute", "edit", "todo", "web"]'
      );
      if (family.contextTier === undefined) {
        expect(fields["context-tier"]).toBeUndefined();
      } else {
        expect(fields["context-tier"]).toBe(family.contextTier);
      }
    }
    const poteto = parseFrontmatter(
      readFileSync(join(AGENTS_DIR, "poteto-agent.agent.md"), "utf8")
    );
    expect(poteto.fields.model).toBe("gpt-5.6-terra");
    expect(poteto.fields["reasoning-effort"]).toBe("high");
    const sicko = parseFrontmatter(
      readFileSync(join(AGENTS_DIR, "comment-sicko.agent.md"), "utf8")
    );
    expect(sicko.fields.model).toBe("gpt-5.6-luna");
    expect(sicko.fields["reasoning-effort"]).toBe("xhigh");
    const shipped = readdirSync(AGENTS_DIR)
      .filter((name) => name.endsWith(".agent.md"))
      .sort();
    expect(shipped).toEqual([...expected].sort());
    expect(shipped.some((name) => /-(low|medium|high|xhigh|max)\.agent\.md$/.test(name))).toBe(
      false
    );
  });

  it("keeps setup's Copilot first-run sheet on Copilot-native descriptors", () => {
    const match = setup.match(
      /```markdown\n(# pstack model configuration \(Copilot parent\)\n[\s\S]*?)```/
    );
    if (!match) {
      throw new Error("setup-pstack is missing the Copilot first-run sheet fence");
    }
    const sheet = match[1];
    for (const family of COPILOT_NATIVE_FAMILIES) {
      expect(sheet).toContain(
        `copilot:${family.model}@${family.defaultEffort}`
      );
    }
    const copilotPanel =
      "copilot:gpt-5.6-terra@high, copilot:gpt-5.6-sol@medium, copilot:kimi-k3@high";
    for (const role of PANEL_ROLES) {
      const line = sheet
        .split("\n")
        .find((entry) => entry.startsWith(`${role}:`));
      if (line === undefined) {
        throw new Error(`missing Copilot first-run panel row: ${role}`);
      }
      expect(line).toBe(`${role}: ${copilotPanel}`);
      expect(line).not.toContain("inherit-parent");
    }
    expect(setup).toContain("Ask 2 or 3.");
    expect(setup).toContain("Default 3:");
    expect(setup).toContain("Default 2:");
    expect(sheet).toContain("copilot:gpt-6-astra@low");
    expect(sheet).toContain("copilot:claude-opus-5@medium");
    expect(sheet).not.toContain("copilot:claude-opus-4.8@high");
    expect(sheet).not.toContain("claude-opus-5-1m");
    expect(setup).toContain("pstack:pstack-<stem>");
    expect(setup).not.toContain("pstack:pstack-<stem>-<effort>");
    expect(setup).toContain("opus5");
    expect(setup).toContain("astra");
    expect(setup).not.toContain("opus48");
    expect(sheet).not.toContain("claude:fable");
    expect(sheet).not.toContain("grok:grok-4.6");
    expect(setup).toContain("~/.copilot/pstack-models.md");
    expect(setup).toContain("A silent downgrade to the parent session model is a failed probe.");
    expect(setup).toContain("Never map claude:fable to terra");
  });
});

