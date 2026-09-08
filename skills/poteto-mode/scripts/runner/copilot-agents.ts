export const EFFORTS = ["low", "medium", "high", "xhigh", "max"] as const;

export interface CopilotNativeFamily {
  readonly family: string;
  readonly model: string;
  readonly stem: string;
  readonly defaultEffort: (typeof EFFORTS)[number];
  readonly contextTier?: "default" | "long_context";
}

export const COPILOT_NATIVE_FAMILIES: readonly CopilotNativeFamily[] = [
  {
    family: "terra",
    model: "gpt-5.6-terra",
    stem: "terra",
    defaultEffort: "high",
  },
  {
    family: "copilot-sol",
    model: "gpt-5.6-sol",
    stem: "sol",
    defaultEffort: "medium",
  },
  {
    family: "luna",
    model: "gpt-5.6-luna",
    stem: "luna",
    defaultEffort: "xhigh",
  },
  {
    family: "opus5",
    model: "claude-opus-5",
    stem: "opus5",
    defaultEffort: "medium",
    contextTier: "default",
  },
  {
    family: "kimi",
    model: "kimi-k3",
    stem: "kimi",
    defaultEffort: "high",
  },
];
