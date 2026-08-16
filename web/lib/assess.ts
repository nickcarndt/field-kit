// Client-side scoring that mirrors server/mcp_server/tools/assess_readiness.py
// exactly: band on the TRUE mean, round only for display, gap below 2.0,
// roadmap weakest-first, routing read from the assessment pattern's axes.

import type { Pattern } from "./types";

export type AxisScore = {
  axis: string;
  name: string;
  score: number;
  level: string;
};

export type RoadmapEntry = AxisScore & {
  patternId: string;
  patternSlug: string;
  patternName: string;
  kills: string;
  thesis: string;
};

const LEVELS: Array<[number, string]> = [
  [1.0, "nascent"],
  [2.0, "emerging"],
  [2.75, "established"],
  [3.01, "production-ready"],
];

export const GAP_BELOW = 2.0;

function levelOf(raw: number): string {
  return LEVELS.find(([cutoff]) => raw < cutoff)![1];
}

export function assessmentPattern(catalog: Pattern[]): Pattern | undefined {
  return catalog.find((p) => p.axes.length > 0);
}

// The cut rule as a predicate: /assess ships only against a complete
// instrument — 4 shared anchors, 3 statements per axis.
export function instrumentComplete(p: Pattern | undefined): p is Pattern {
  return (
    !!p &&
    p.scale.length === 4 &&
    p.axes.length > 0 &&
    p.axes.every((a) => a.items.length === 3)
  );
}

export function scoreAnswers(
  catalog: Pattern[],
  assessment: Pattern,
  answers: Record<string, number[]>,
): { profile: AxisScore[]; roadmap: RoadmapEntry[] } {
  const byId = new Map(catalog.map((p) => [p.id, p]));

  const scored = assessment.axes.map((ax) => {
    const scores = answers[ax.key] ?? [];
    const raw = scores.reduce((a, b) => a + b, 0) / scores.length;
    return {
      raw,
      routesTo: ax.routes_to,
      entry: {
        axis: ax.key,
        name: ax.name,
        score: Math.round(raw * 100) / 100,
        level: levelOf(raw),
      },
    };
  });

  const roadmap = scored
    .filter((s) => s.raw < GAP_BELOW)
    .sort((a, b) => a.raw - b.raw)
    .flatMap((s) => {
      const target = byId.get(s.routesTo);
      return target
        ? [
            {
              ...s.entry,
              patternId: target.id,
              patternSlug: target.slug,
              patternName: target.name,
              kills: target.kills,
              thesis: target.thesis,
            },
          ]
        : [];
    });

  return { profile: scored.map((s) => s.entry), roadmap };
}
