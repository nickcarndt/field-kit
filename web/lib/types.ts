export type Exemplar = {
  name: string;
  url?: string;
};

export type GroundedIn = {
  source: string;
  authors: string;
  principle: string;
  url?: string;
  date?: string;
};

export type Axis = {
  key: string;
  name: string;
  routes_to: string;
  items: string[];
};

export type Pattern = {
  id: string;
  slug: string;
  name: string;
  thesis: string;
  kills: string;
  taxonomy: string;
  description: string;
  triggers: string[];
  exemplars: Exemplar[];
  grounded_in: GroundedIn[];
  pairs_with_all: boolean;
  fallback: boolean;
  axes: Axis[];
  scale: string[];
  framing: string;
  sections: Record<string, string>;
};

export const EXPECTED_SECTIONS = [
  "Problem scene",
  "When to use / when not to",
  "Architecture",
  "Eval plan",
  "Where this breaks in the field",
  "The objection this kills",
  "Live exemplar",
  "Workshop outline (90 minutes)",
] as const;
