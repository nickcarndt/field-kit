// Front-end-only schematics: the pattern files stay canonical prose; these
// are the site's figures, in the site's own visual language. One shape —
// a labeled signal path plus one annotation — keeps all five calm and
// comparable, the way figures in one manual share one drafting style.

export type FlowStep = { label: string; detail?: string };

export type Diagram = {
  caption: string;
  steps: FlowStep[];
  note: string;
};

export const DIAGRAMS: Record<string, Diagram> = {
  "FK-01": {
    caption: "The deterministic core",
    steps: [
      { label: "invoice + contract", detail: "inputs" },
      { label: "parse", detail: "tool" },
      { label: "match", detail: "tool" },
      { label: "compute", detail: "tool" },
      { label: "flag", detail: "tool" },
      { label: "cited report", detail: "model writes" },
    ],
    note: "unresolved cases exit to a human exception queue with triage SLAs — the model never computes",
  },
  "FK-02": {
    caption: "Grounded retrieval",
    steps: [
      { label: "query" },
      { label: "dense + fts", detail: "hybrid" },
      { label: "rrf · rerank", detail: "fuse" },
      { label: "evidence set", detail: "closed" },
      { label: "generate", detail: "cited" },
      { label: "validate", detail: "in code" },
    ],
    note: "an invalid citation fails the response; low confidence abstains instead of answering",
  },
  "FK-03": {
    caption: "The launch gate",
    steps: [
      { label: "metric sheet", detail: "before code" },
      { label: "fixtures", detail: "labeled" },
      { label: "scorers", detail: "deterministic" },
      { label: "judge", detail: "rubric'd" },
      { label: "ci gate", detail: "every push" },
      { label: "ship / block" },
    ],
    note: "a metric drop blocks the merge, not the postmortem",
  },
  "FK-04": {
    caption: "The gated doorway",
    steps: [
      { label: "claude" },
      { label: "mcp", detail: "json-rpc" },
      { label: "auth gate", detail: "fail-closed" },
      { label: "typed tools", detail: "narrow" },
      { label: "systems", detail: "least privilege" },
    ],
    note: "every call traced — caller, inputs, result; refusals logged too",
  },
  "FK-05": {
    caption: "Assessment to roadmap",
    steps: [
      { label: "answers", detail: "0–3 anchored" },
      { label: "mean per axis" },
      { label: "bands", detail: "gap < 2.0" },
      { label: "profile", detail: "four axes" },
      { label: "roadmap", detail: "routes to FK-0n" },
    ],
    note: "weakest axis first — a weak practice must score weak",
  },
};
