import type { Effort } from "./types.ts";

export interface CopilotNativeFamily {
  readonly family: string;
  readonly model: string;
  readonly stem: string;
  readonly defaultEffort: Effort;
  readonly selectableEfforts: readonly Effort[];
  readonly contextTier?: "default" | "long_context";
}

export const COPILOT_NATIVE_FAMILIES: readonly CopilotNativeFamily[] = [
  {
    family: "terra",
    model: "gpt-5.6-terra",
    stem: "terra",
    defaultEffort: "high",
    selectableEfforts: ["high"],
  },
  {
    family: "copilot-sol",
    model: "gpt-5.6-sol",
    stem: "sol",
    defaultEffort: "medium",
    selectableEfforts: ["medium"],
  },
  {
    family: "luna",
    model: "gpt-5.6-luna",
    stem: "luna",
    defaultEffort: "xhigh",
    selectableEfforts: ["xhigh"],
  },
  {
    family: "opus5",
    model: "claude-opus-5",
    stem: "opus5",
    defaultEffort: "medium",
    selectableEfforts: ["medium"],
    contextTier: "default",
  },
  {
    family: "kimi",
    model: "kimi-k3",
    stem: "kimi",
    defaultEffort: "high",
    selectableEfforts: ["high"],
  },
  {
    family: "astra",
    model: "gpt-6-astra",
    stem: "astra",
    defaultEffort: "low",
    selectableEfforts: ["low"],
  },
];
