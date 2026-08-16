---
name: fk-03-evals-launch-gate
description: "Use on every engagement, before code is written, when anyone asks how they will know the system actually works — defining metrics, building labeled fixture sets, choosing deterministic scorers vs. LLM-as-judge, and gating launch and releases on measured results instead of demo impressions."
---

# FK-03 · Evals as a Launch Gate

*"It seems to work" is not a deliverable.*

Anthropic's guidance is to define specific, measurable success criteria
before building and to automate grading wherever possible. Their
evaluator-optimizer workflow presumes exactly what its name implies:
evaluation criteria clear enough to loop against. This pattern sharpens that
guidance into a hierarchy and a gate — deterministic checks wherever ground
truth exists, LLM-as-judge with a version-controlled rubric reserved for
what genuinely requires judgment, and the whole suite standing between the
engagement and launch: the metric sheet signed before code, the fixture
suite in CI, the number that decides whether the thing ships.

## Problem scene

A partner ships a pilot. The client loves it in the demo and distrusts it by
week three — an odd answer here, an unexplained miss there. Nobody defined
what "working" means, so nobody can prove it works, and the renewal
conversation becomes a vibes negotiation. The pilot didn't fail on capability.
It failed on evidence.

## When to use / when not to

**Use on every engagement, before code.** Kickoff deliverable number one is
the metric definition sheet, not the architecture diagram.

**When not to use: never.** This is the pattern that makes the other four
sellable — FK-01's fixtures, FK-02's six-metric report, FK-04's contract
tests are all this pattern wearing different clothes. An engagement that
skips it isn't leaner; it's just unprovable.

## Architecture

- **Define the metric before building.** Specific and measurable, agreed with
  the client in writing. "Recall ≥ 0.9 on the labeled fixture set" is a
  metric; "high accuracy" is a wish.
- **Labeled fixture sets.** Real cases with known-correct answers, including
  the ugly ones — malformed inputs, edge-of-policy cases, adversarial
  phrasing. Happy-path fixtures prove only that the demo works.
- **Deterministic scorers first.** Exact match, set match, threshold checks —
  wherever ground truth exists, grade in code. Cheap, fast, unarguable.
- **LLM-as-judge only where judgment is required.** Tone, helpfulness,
  synthesis quality — graded against a written rubric, with the judge prompt
  version-controlled and the judge itself spot-checked against human labels.
- **Faithfulness checks on every generative step.** Whatever the model wrote
  must trace to source material — the same discipline FK-01 and FK-02 apply,
  named as what it is: an eval.
- **Tracing on every run.** When a metric moves, the trace says why.

## Eval plan

This pattern's eval plan is a template, because the pattern **is** the eval
plan. It ships four artifacts a practice reuses on every engagement:

1. **Metric definition sheet** — what "working" means, signed before code.
2. **Fixture-set starter** — structure and labeling conventions for the first
   twenty cases, including required unhappy paths.
3. **Judge-prompt scaffold** — rubric format, scale, calibration examples,
   and a versioning rule.
4. **CI regression gate** — the suite runs on every push; a metric drop
   blocks the merge, not the postmortem.

## Where this breaks in the field

- **Evals bolted on after launch.** Built to justify a system that already
  shipped, they inherit its blind spots and confirm what everyone hoped.
- **Judge prompts drift.** Someone tweaks the rubric wording mid-engagement
  and every historical score silently changes meaning. Version the judge like
  code, because it is.
- **Fixtures cover only happy paths.** The suite stays green while the system
  fails on exactly the inputs nobody wanted to write down.

## The objection this kills

**"How do we know it actually works?"** — the question that stalls every
enterprise deal, asked by the buyer's engineers in week one and the buyer's
lawyers in week six. The answer is a number, measured on cases the client
helped label, tracked on every release. Deals stall on vibes; they close on
evidence.

## Live exemplar

**Verity's eval harness** — fixture-based reconciliation evals with
deterministic scorers, gating CI on every pull request and push to main
([verity-navy-five.vercel.app](https://verity-navy-five.vercel.app)) — and
**Prospectus's published six-metric report**
([prospectus-nickarndt.vercel.app](https://prospectus-nickarndt.vercel.app)),
the FK-02 tradeoff table produced by exactly this discipline.

## Workshop outline (90 minutes)

1. **0:00 – 0:20** — The week-three failure: why pilots die on evidence, not
   capability. Metric-before-code as a contract term.
2. **0:20 – 0:50** — Write a real metric sheet for a use case from the room;
   fight about what "working" means until it's measurable.
3. **0:50 – 1:15** — Build twenty fixtures live, including five unhappy
   paths. Wire a deterministic scorer and watch it grade.
4. **1:15 – 1:30** — Judge calibration: score three outputs by hand, then
   compare against the LLM judge; where they disagree, fix the rubric.

---

Grounded in:

- Define success criteria and build evaluations (Claude Docs) — Anthropic — https://platform.claude.com/docs/en/test-and-evaluate/develop-tests
- Building effective agents — Erik Schluntz and Barry Zhang, Anthropic Engineering (2024-12-19) — https://www.anthropic.com/engineering/building-effective-agents
