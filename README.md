# FieldKit

**Reference architectures for teams deploying Claude in production — installable, queryable, field-tested.**

Five deployment patterns, each carrying the operational knowledge a partner
practice actually needs: when to use it, how to evaluate it, where it breaks
in the field, and the client objection it removes. Shipped three ways off one
body of content: readable pattern docs, Agent Skills in a Claude Code plugin,
and a live MCP server that recommends the right pattern for a use case in one
tool call.

## Why this exists

Most enterprise AI practices are in pilot purgatory: three proofs of concept,
board pressure to "have an AI story," and no honest map of what is blocking
production. The knowledge that unblocks them exists — it just arrives as
slide decks and enablement sessions, and practitioners do not read the deck.
They install the thing that is already in their editor.

FieldKit is that thing. Each of its five patterns was extracted from a
shipped system, then aligned to Anthropic's published guidance and cited back
to it. The patterns are organized by the objection that blocks the deal —
"we can't let an LLM touch financial decisions," "hallucination risk makes
this unusable" — because that is the axis a practice lead is actually
navigating, and it is the layer the official documentation deliberately
leaves to practitioners.

The packaging is the argument: partner enablement should be installable
software, not a slide deck. FieldKit delivers capability the way Anthropic
itself does — skills over MCP, wrapped in a plugin — so installing it is a
demonstration of the delivery model it recommends.

## What's inside

| ID | Pattern | The objection it kills |
|----|---------|------------------------|
| FK-01 | **Deterministic-Core Agent** — correctness lives in tools, not the model | "We can't let an LLM touch financial decisions." |
| FK-02 | **Grounded Retrieval with Abstention** — "I don't know" beats a confident guess | "Hallucination risk makes this unusable in our industry." |
| FK-03 | **Evals as a Launch Gate** — "it seems to work" is not a deliverable | "How do we know it actually works?" |
| FK-04 | **MCP Integration Pattern** — enterprise access without anyone losing sleep | "We can't give an AI access to our systems." |
| FK-05 | **Deployment Readiness Assessment** — an honest map before a roadmap | "Where do we even start?" |

Live exemplars: [Verity](https://verity-navy-five.vercel.app) (FK-01, FK-03,
FK-04), [Prospectus](https://prospectus-nickarndt.vercel.app) (FK-02, FK-03),
[Federal Readiness Suite](https://federal-readiness-suite.vercel.app) (FK-05),
and FieldKit's own server (FK-04).

## Quickstart — two minutes in Claude Code

**Install the skills (no server, no key needed):** from this repo's root,
start `claude`, then:

```
/plugin marketplace add .
/plugin install fieldkit@fieldkit-dev
```

Ask *"when should a system say I-don't-know instead of answering?"* and watch
FK-02 load itself.

**Connect the live catalog server:** the repo's `.mcp.json` already points at
the deployed server; it authenticates with an API key from your environment
(the key is never committed — see [Field notes](#field-notes) to request
one):

```bash
export FIELDKIT_API_KEY=<your key>
```

Restart `claude` in this directory, approve the project server, and run the
thirty-second demo:

> Ask FieldKit which pattern fits a claims-processing agent for an insurance
> client.

The answer is FK-01 plus FK-03, with the matched triggers as evidence — the
recommendation is a deterministic, auditable rubric, not a model call.

No Claude Code at all? The patterns are plain markdown in
[`patterns/`](patterns/). The kit degrades gracefully into documents.

## How a practice would actually use it

1. **Kickoff / pre-sales:** run `assess_readiness` — anchored scores across
   delivery, evals, governance, and Claude fluency produce a maturity
   profile and a roadmap where every gap routes to a pattern.
2. **Pattern selection:** `recommend_pattern` maps each candidate use case to
   a part number, with evidence.
3. **Enablement:** each pattern carries a 90-minute workshop outline —
   hackathon- and practice-session-ready.
4. **Build:** the pattern doc's architecture and failure-mode sections are
   the engagement checklist; FK-03's metric sheet is signed before code.
5. **Launch:** the eval gate decides, not the demo.
6. **Quarterly:** re-run the assessment; the score trend is the practice's
   own eval.

At enterprise scale, a GSI can distribute FieldKit-style plugins through a
private plugin marketplace — the mechanism by which a 470,000-person firm
puts this in every practitioner's editor at zero build cost.

## Design decisions

**Why MCP.** The catalog is a runtime surface, not a wiki: a model can query
it mid-conversation. MCP is the vendor-neutral open standard for that surface
— donated to the Linux Foundation's Agentic AI Foundation in December 2025 —
so building on it is a bet on the ecosystem, not on any one vendor.

**Why Agent Skills.** Progressive disclosure: name and trigger description
always loaded, full pattern loaded only on relevance. Enablement that shows
up at the moment of need, costing nothing the rest of the time.

**Why fail-closed.** The server refuses everything when its key is missing —
misconfiguration produces an outage, never an exposure. This repo's tests pin
the unset-key case specifically, because that is the case that separates
fail-closed from fail-open in practice. FieldKit runs the architecture FK-04
documents.

**Why evals are a pattern, not a chapter.** "How do we know it works?" is the
question that stalls every enterprise deal, so its answer is a first-class
part number — and FK-03 gated this repo's own build: every claim in these
patterns was adversarially verified against its source before release.

**One source of truth.** The five files in `patterns/` are canonical. The
skills are compiled from them (`scripts/build_skills.py`), the server parses
them at startup with a fail-loud contract, and the recommendation, companion,
and fallback policies are all declared in the patterns' own frontmatter — no
code path branches on a pattern name.

**Honest scope.** Partners deploy Claude across a builder surface and a
knowledge-worker surface. FieldKit deliberately addresses the builder
surface, and runs on the first-party API for the weekend build — the
multi-cloud surface (Bedrock, Vertex) is the day-one extension in the seat,
because that is where GSI delivery actually lives. And it is a starter kit that shows the shape, not a canon: the five
exemplars are systems I shipped, and the natural next step inside a partner
organization is replacing them with Anthropic's own reference architectures
and partner-tested content.

## Field notes

A pattern library earns trust by absorbing what the field learns. Deployment
patterns that should exist next: multi-agent orchestration boundaries,
human-in-the-loop copilot ergonomics, the knowledge-worker enablement
surface. If you deploy one of these patterns — or hit a failure mode these
docs missed — open an issue or write to nickcarndt@gmail.com. To request an
API key for the live server, same address.

---

Built by Nick Arndt · Patterns proven in [Verity](https://verity-navy-five.vercel.app) and [Prospectus](https://prospectus-nickarndt.vercel.app) · Field notes welcome.
