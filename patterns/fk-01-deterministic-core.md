---
id: FK-01
slug: deterministic-core
name: Deterministic-Core Agent
thesis: Correctness lives in tools, not the model.
kills: "We can't let an LLM touch financial decisions."
taxonomy: prompt chaining workflow with programmatic gates
description: >
  Use when a client needs AI in a workflow where the answer is checkable and a
  wrong number is unacceptable — invoice reconciliation, claims processing,
  policy enforcement, threshold approvals — and the blocking objection is that
  an LLM cannot be trusted with financial or compliance decisions.
triggers:
  - reconcil
  - invoice
  - claim
  - payment
  - financial decision
  - policy rule
  - threshold
  - approv
  - audit
  - compliance
  - match
  - calculat
  - insurance
  - underwriting
exemplars:
  - name: Verity
    url: https://verity-navy-five.vercel.app
grounded_in:
  - source: Building effective agents
    authors: Erik Schluntz and Barry Zhang, Anthropic Engineering
    date: "2024-12-19"
    url: https://www.anthropic.com/engineering/building-effective-agents
    principle: >
      Start simple and add agentic complexity only when simpler approaches
      fall short. Prefer workflows — LLMs and tools orchestrated through
      predefined code paths — over autonomous agents when the control flow is
      known in advance.
---

<!-- Frontmatter is the machine contract: catalog.py parses it, recommend_pattern
     scores `triggers`, build_skills.py lifts `description` into SKILL.md.
     Contract rules (all five pattern files):
     - triggers are lowercase stems matched as left-word-boundary prefix
       regexes — re.search(r"\b" + re.escape(t), query, re.I) — so "claim"
       matches "claims-processing" but "api" never fires inside "capital".
     - dates are quoted strings, never bare YAML dates (bare dates parse to
       datetime.date and break JSON serialization).
     - exemplars is a list of {name, url}; url optional.
     - grounded_in entries need source/authors/principle; url and date are
       optional.
     - body = H1, then a framing paragraph (catalog.py preserves it), then
       eight fixed H2s: the spec's seven fields plus "Workshop outline (90
       minutes)", which feeds get_workshop. Pre-H1 HTML comments are author
       notes; parsers anchor on the H1 and drop everything above it. -->

# FK-01 · Deterministic-Core Agent

*Correctness lives in tools, not the model.*

Anthropic's guidance is to start simple and add agentic complexity only when
simpler approaches fall short, preferring workflows — model calls and tools
run through predefined code paths — wherever the control flow is known before
runtime. This pattern is what that principle looks like when the workflow is
invoice reconciliation and the stakes are payment decisions. Their principle;
one field-tested implementation of it, with the operational layer their essay
deliberately leaves to practitioners: where it breaks, and what it sells
against.

## Problem scene

A controller at a mid-market services firm reconciles vendor invoices against
contract terms by hand, three days a month, and still misses six figures of
overbilling a year. The business wants an agent. But an agent that occasionally
invents a number is unusable for payment decisions — one fabricated total in
front of the CFO and the entire AI program loses its license to operate.

## When to use / when not to

**Use when the answer is checkable.** Math, policy rules, thresholds, matching,
anything with a ground truth a scorer can verify: invoice reconciliation,
claims adjudication, rate calculations, eligibility checks, controls testing.

**Do not use** for open-ended synthesis with no ground truth — drafting,
ideation, summarization of contested material. Forcing a deterministic core
onto a judgment task just moves the judgment somewhere you can't see it.

## Architecture

In Anthropic's taxonomy ("Building effective agents," Schluntz & Zhang, Dec
2024), this is a **workflow**, not an agent: the LLM and tools are orchestrated
through predefined code paths, because the control flow is known before any
model is invoked. The shape is **prompt chaining with programmatic gates** —
each case moves through a fixed sequence of steps (parse, match, compute,
flag), with deterministic checks gating every handoff — chosen over an
autonomous agent deliberately: when you can write the control flow down,
letting a model improvise it only adds failure modes. Find the simplest
solution possible; only increase complexity when needed.

The load-bearing decision: **deterministic MCP tools own all business logic.**
Parsing, matching, arithmetic, threshold checks live in typed, tested code the
security and audit teams can read. The model never computes. Its only
generative job is the final report — written strictly over tool results, with
every figure cited back to a tool output. This is the augmented LLM used at
minimum power: tools supply every fact; generation supplies only prose.

Cases the rules can't settle go to a **human-in-the-loop exception queue** with
triage SLAs — an explicit lane for judgment, not a fallback for laziness.

Use the **Claude Agent SDK** (renamed from the Claude Code SDK, late 2025) for
the agent loop, tool wiring, and context management rather than hand-rolling
any of it.

## Eval plan

- **Labeled fixtures with known answers** — real invoice/contract pairs where
  the correct reconciliation is established in advance.
- **Deterministic scorers** on every tool step: exact match on totals, set
  match on flagged discrepancies. No judge needed where arithmetic will do.
- **Faithfulness eval on the one generative step**: every number and claim in
  the report must trace to a tool result; anything untraceable fails the run.
- Gate releases on the fixture suite in CI — this is FK-03 applied, not a
  separate idea.

## Where this breaks in the field

- **The model starts "helping" with the logic.** A prompt tweak lets it
  estimate a missing line item, and auditability is gone. The boundary only
  holds if tool results are the sole source of figures, enforced in code.
- **Fixture sets go stale.** Contracts change, fixtures don't, the suite keeps
  passing while reality drifts. Fixture refresh belongs in the engagement
  cadence, not in good intentions.
- **The exception queue becomes a dumping ground.** Without triage SLAs and
  ownership, "route to human" decays into "route to nobody."

## The objection this kills

**"We can't let an LLM touch financial decisions."** Correct — so this
architecture doesn't let it. Decisions are made by deterministic, auditable
code; the model writes the explanation and cites its sources. The objection
dissolves because the premise (model-in-the-decision-loop) was a design choice,
and we chose otherwise.

## Live exemplar

**Verity** — [verity-navy-five.vercel.app](https://verity-navy-five.vercel.app).
Invoice-to-contract reconciliation with deterministic MCP tools
(`parse_invoice`, `extract_obligations`, `reconcile`), a cited report as the
only generative output, and a fixture-based eval harness gating CI on every
pull request and push to main. Orchestration is LangGraph — Verity predates
the Agent SDK recommendation; same architecture, earlier toolkit.

## Workshop outline (90 minutes)

1. **0:00 – 0:15** — The failure story: why the demo agent that "did the math"
   died in security review. Workflows vs. agents in Anthropic's vocabulary.
2. **0:15 – 0:45** — Live build: wrap one business rule as a typed MCP tool;
   watch the model cite it instead of computing.
3. **0:45 – 1:15** — Break the boundary on purpose: prompt the model to
   estimate, watch the faithfulness eval catch it. Evals as the tripwire.
4. **1:15 – 1:30** — Map a use case from the room onto the pattern; identify
   the exception-queue policy nobody has written down yet.
