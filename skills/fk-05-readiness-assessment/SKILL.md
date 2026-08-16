---
name: fk-05-readiness-assessment
description: "Use at engagement kickoff, quarterly practice reviews, or pre-sales discovery when a partner team has pilots, pressure, and no honest map — scoring practice maturity across delivery, evals, governance, and Claude fluency, and producing a roadmap that routes each gap to a specific FieldKit pattern."
---

# FK-05 · Deployment Readiness Assessment

*Are we actually ready to take this to production?*

Four patterns in this kit implement Anthropic's published guidance and cite
it. This one doesn't, and says so: it comes from the consulting side of the
table — from watching practices buy capability before diagnosing readiness,
and watching assessments get scored to flatter the buyer. What Anthropic's
platform contributes here is the mechanism, not the method: structured
outputs make the scoring schema-validated and typed, so the diagnosis is
data a roadmap can be generated from, not prose a partner can renegotiate.

## Problem scene

A practice lead has three pilots, board pressure to "have an AI story," and
no honest map of what is actually blocking production. Every vendor
conversation starts from zero. Every internal status update is optimistic in
a way nobody can quite defend. The missing artifact isn't a strategy deck —
it's a diagnosis specific enough to route to next actions.

## When to use / when not to

**Use at** engagement kickoff (before pattern selection), quarterly practice
reviews (same instrument, tracked over time), and pre-sales discovery (the
assessment conversation is the qualification conversation).

**Do not use as** a substitute for building. An assessment that doesn't end
in a pattern being implemented is a deck with a rubric stapled to it — the
exact artifact this kit exists to replace.

## Architecture

- **Structured questionnaire** across four axes: **delivery** (can they ship
  and operate software?), **evals** (can they prove things work?),
  **governance** (who owns risk, data, and sign-off?), and **Claude fluency**
  (do they know the platform beyond the chat window?).
- **Claude scores responses against an anchored rubric, returning
  schema-validated structured output** — axis scores with cited evidence
  from the answers, never free prose. The schema guarantees shape and types;
  score bounds ride on integer enums plus a code-side check, since schema
  constraints don't cover numeric ranges.
- **Anchored scoring, not vibes.** Each maturity level per axis is defined by
  observable facts ("evals run in CI on every release" vs. "we spot-check
  outputs"), so the same answers produce the same profile regardless of who
  runs it — and flattery has nowhere to hide.
- **Generated roadmap that routes gaps to patterns.** Weak delivery
  discipline, or a correctness-critical workflow nobody dares automate →
  FK-01. Low evals score → FK-03 first. Governance blocked on
  AI-touching-systems fear → FK-04. Hallucination anxiety stalling a
  document use case → FK-02. The routing is the point: this is the front
  door of the kit, and every exit leads to another pattern.
- **Refusal handling.** Out-of-scope input — "just tell us which model is
  best" — gets a structured refusal with a redirect, not an improvised
  answer beyond the instrument's competence.

## Eval plan

- **Golden-profile fixtures** — complete questionnaires with agreed-correct
  profiles, including a deliberately weak practice that must score weak. The
  flattery test is a fixture, not a hope.
- **Judge consistency checks** — the same fixture scored repeatedly must
  produce the same profile within tolerance; drift means the rubric anchors
  are too loose.
- **Refusal fixtures** — out-of-scope inputs that must produce the
  structured refusal path, not a score.

## Where this breaks in the field

- **Assessments that flatter instead of diagnose.** The buyer is in the
  room, the scores drift upward, and the roadmap prescribes nothing because
  nothing is wrong. An assessment nobody can fail is marketing.
- **Roadmaps disconnected from patterns.** "Improve your eval maturity" with
  no next artifact is advice; "implement FK-03's metric sheet on your lead
  pilot this quarter" is a plan. If the roadmap doesn't name patterns, the
  assessment was theater.

## The objection this kills

**"Where do we even start?"** — asked by every practice lead with more
pilots than production systems. The answer is a scored profile they can
defend to their board and a sequenced roadmap where every step is a pattern
in this kit. Not a vision. A next action.

## Live exemplar

**Partner Readiness Suite** —
[partner-readiness-suite.vercel.app](https://partner-readiness-suite.vercel.app).
This pattern, interactive: guided practice intake, a streamed architecture
recommendation, a judge-scored evaluation sandbox with score math in code, a
trust and governance matrix, and an engagement roadmap with an eval gate
before production. Evolved from the **Federal Readiness Suite**
([federal-readiness-suite.vercel.app](https://federal-readiness-suite.vercel.app)),
the assessment instrument built for federal delivery readiness — generalized
to the four axes a partner AI practice actually varies on.

## Workshop outline (90 minutes)

1. **0:00 – 0:15** — Why assessments flatter, and what an anchored rubric
   changes. The flattery test as a fixture.
2. **0:15 – 0:45** — Run the instrument live on the room's own practice;
   watch where "we're pretty strong there" meets the anchors.
3. **0:45 – 1:15** — Read the generated profile and roadmap; argue with it;
   trace each disagreement to an anchor or an answer.
4. **1:15 – 1:30** — Commit to the first routed pattern: which FK number,
   which pilot, who owns it, reviewed when.

---

Grounded in:

- Field experience — GSI delivery practice — Nick Arndt
- Structured outputs (Claude Docs) — Anthropic — https://platform.claude.com/docs/en/build-with-claude/structured-outputs
