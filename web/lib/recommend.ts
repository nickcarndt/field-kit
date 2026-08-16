export type Recommendable = {
  id: string;
  slug: string;
  name: string;
  thesis: string;
  kills: string;
  triggers: string[];
  pairs_with_all: boolean;
  fallback: boolean;
};

export type Recommendation = {
  id: string;
  name: string;
  thesis: string;
  kills: string;
  slug: string;
  matched_triggers: string[];
  reason: string;
};

export function toRecommendable(p: Recommendable): Recommendable {
  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    thesis: p.thesis,
    kills: p.kills,
    triggers: p.triggers,
    pairs_with_all: p.pairs_with_all,
    fallback: p.fallback,
  };
}

function hits(useCase: string, triggers: string[]): string[] {
  return triggers.filter((t) => new RegExp(`\\b${escapeRegExp(t)}`, "i").test(useCase));
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function entry(p: Recommendable, matched: string[], reason: string): Recommendation {
  return {
    id: p.id,
    name: p.name,
    thesis: p.thesis,
    kills: p.kills,
    slug: p.slug,
    matched_triggers: matched,
    reason,
  };
}

export function recommendPattern(
  catalog: Recommendable[],
  useCase: string,
): { use_case: string; recommendations: Recommendation[]; method: string } {
  const scored: { p: Recommendable; matched: string[] }[] = [];
  const companions: { p: Recommendable; matched: string[] }[] = [];

  for (const p of catalog) {
    const matched = hits(useCase, p.triggers);
    if (p.pairs_with_all) companions.push({ p, matched });
    else if (matched.length) scored.push({ p, matched });
  }

  scored.sort((a, b) => b.matched.length - a.matched.length || a.p.id.localeCompare(b.p.id));

  let recommendations: Recommendation[] = scored.map(({ p, matched }) =>
    entry(p, matched, `matched trigger(s): ${matched.join(", ")}`),
  );

  if (recommendations.length) {
    recommendations = recommendations.concat(
      companions.map(({ p, matched }) =>
        entry(
          p,
          matched,
          (matched.length ? `matched trigger(s): ${matched.join(", ")} — and ` : "") +
            "recommended on every engagement — this pattern's own " +
            "'when not to use' is 'never'",
        ),
      ),
    );
  } else {
    const matchedCompanions = companions
      .filter((c) => c.matched.length)
      .sort((a, b) => b.matched.length - a.matched.length || a.p.id.localeCompare(b.p.id));
    if (matchedCompanions.length) {
      recommendations = matchedCompanions.map(({ p, matched }) =>
        entry(p, matched, `matched trigger(s): ${matched.join(", ")}`),
      );
    } else {
      recommendations = catalog
        .filter((p) => p.fallback)
        .map((p) =>
          entry(
            p,
            [],
            "no strong trigger match — restate the use case with more domain detail, or start with a readiness assessment to locate the right pattern",
          ),
        );
    }
  }

  return {
    use_case: useCase,
    recommendations,
    method:
      "deterministic trigger rubric: word-boundary prefix match, ranked by hit count; see matched_triggers for the evidence",
  };
}

export const DEMO_QUERY =
  "which pattern fits a claims-processing agent for an insurance client";

export function assertDemoRecommendation(catalog: Recommendable[]): Recommendation[] {
  const { recommendations } = recommendPattern(catalog, DEMO_QUERY);
  const ids = recommendations.map((r) => r.id);
  if (ids[0] !== "FK-01" || !ids.includes("FK-03")) {
    throw new Error(
      `Connect demo query must return FK-01 then FK-03; got ${JSON.stringify(ids)}. Two renderers, one contract — this build gate is the parity check.`,
    );
  }
  return recommendations;
}
