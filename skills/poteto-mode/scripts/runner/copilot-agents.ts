export const EFFORTS = ["low", "medium", "high", "xhigh", "max"] as const;

export interface CopilotNativeFamily {
  readonly family: string;
  readonly model: string;
  readonly stem: string;
  readonly defaultEffort: (typeof EFFORTS)[number];
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
    family: "opus48",
    model: "claude-opus-4.8",
    stem: "opus48",
    defaultEffort: "high",
  },
  {
    family: "kimi",
    model: "kimi-k3",
    stem: "kimi",
    defaultEffort: "high",
  },
];
