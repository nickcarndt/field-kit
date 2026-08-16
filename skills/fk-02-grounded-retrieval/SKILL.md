---
name: fk-02-grounded-retrieval
description: "Use when a client needs question-answering over a real document corpus and provenance decides whether the answer is usable — filings, research archives, regulatory and legal documents — and the blocking objection is hallucination risk in a domain where a confidently wrong answer is worse than no answer."
---

# FK-02 · Grounded Retrieval with Abstention

*A system that says "I don't know" is more trustworthy than one that always
answers.*

Anthropic ships grounding as platform capability, not prompt technique:
citations generated against a provided source set, contextual retrieval
research showing hybrid search plus reranking beats dense-only, and structured
outputs that make responses machine-checkable. This pattern is the field
assembly of those pieces for domains where a confidently wrong answer is worse
than no answer — plus the layer the platform can't supply: enforcement in your
code, an abstention policy, and the eval table that proves the tradeoffs.

## Problem scene

Analysts need answers buried in thousands of pages of filings, and the
retrieval bar is unforgiving: the right clause, the exact figure, the correct
year. In regulated domains, a confidently wrong answer is worse than no
answer — it gets repeated in a memo with the firm's name on it. This is no
longer hypothetical: in 2025, Deloitte Australia partially refunded a
government contract after a delivered report was found to contain fabricated,
AI-generated references. The objection this pattern kills got a headline case.

## When to use / when not to

**Use for** question-answering over a real document corpus where provenance
matters: due diligence, regulatory research, contract review, internal
knowledge bases with compliance exposure.

**Do not use** when the corpus fits in the context window — just load the
documents; retrieval infrastructure for a hundred pages is complexity without
justification. And not for creative or synthesis tasks, where there is no
closed evidence set to ground against and abstention has no meaning.

## Architecture

- **Hybrid retrieval.** Dense embeddings plus Postgres full-text search, fused
  with reciprocal rank fusion, then reranked. Two engines because they fail
  differently: dense search misses exact terms — tickers, clause numbers,
  defined terms — and lexical search misses paraphrase. RRF means neither
  engine needs tuned score normalization to contribute.
- **Closed evidence set.** The model answers only from retrieved passages.
  What wasn't retrieved doesn't exist.
- **Citation grounding enforced in code, never by prompt request.** Generate
  passage-level references — via the first-class citations capability, or a
  citation schema in structured output — then validate every one against the
  evidence set after generation. An invalid citation fails the response — it
  is not a warning.
- **Confidence-based abstention.** Below threshold, the system returns "not
  established in this corpus" with the nearest passages, instead of an answer.
  The refusal is a feature; it is the reason the answers are believable.
- **Structured outputs for the envelope.** Answer, citations, confidence as a
  schema-constrained object, so the enforcement step checks fields, not prose.

## Eval plan

Six metrics, head to head, across retrieval strategies (dense-only, hybrid,
hybrid + rerank): **recall, MRR, citation accuracy, faithfulness,
latency, cost.** Publish the report — the tradeoff table is the deliverable,
because it converts "trust us" into "here is what we measured and what it
costs."

## Where this breaks in the field

- **Prompt-requested citations.** "Please cite your sources" produces
  citations shaped like citations. If no code checks them against the
  evidence, they are decorative — and they will be wrong precisely when the
  stakes are highest.
- **Dense-only retrieval.** Ships fast, demos well, then misses the exact-term
  query — the clause number, the part code — that the client tries first.
- **No abstention threshold.** A system that always answers spends its trust
  on the first confident miss. Nobody audits the next hundred right answers.

## The objection this kills

**"Hallucination risk makes this unusable in our industry."** The answer is
architectural, not reassuring: the system may only speak from a closed
evidence set, every citation is machine-verified after generation, and when
confidence is low it declines rather than improvises. Show the failed-citation
path rejecting a response; that demo ends the conversation.

## Live exemplar

**Prospectus** —
[prospectus-nickarndt.vercel.app](https://prospectus-nickarndt.vercel.app).
Hybrid retrieval over public filings (dense + Postgres FTS, RRF fusion,
rerank), code-enforced citations against a closed evidence set — a citation
schema in structured output, validated post-generation — confidence-based
abstention, and a published six-metric evaluation report comparing retrieval
strategies.

## Workshop outline (90 minutes)

1. **0:00 – 0:20** — The fabricated-citation failure mode: why prompt-requested
   citations are decorative, and what the 2025 headlines cost.
2. **0:20 – 0:45** — Live comparison: dense-only vs. hybrid on exact-term
   queries. Watch dense search miss the ticker symbol.
3. **0:45 – 1:10** — Enforcement: corrupt a citation in a response, watch the
   validator reject it. Grounding as code path, not prompt hope.
4. **1:10 – 1:30** — Abstention: tune the threshold on a sample corpus; decide
   as a room what "I don't know" should look like to an end user.

---

Grounded in:

- Introducing Contextual Retrieval — Anthropic (2024-09-19) — https://www.anthropic.com/news/contextual-retrieval
- Introducing Citations on the Anthropic API — Anthropic (2025) — https://claude.com/blog/introducing-citations-api
- Structured outputs (Claude Docs) — Anthropic — https://platform.claude.com/docs/en/build-with-claude/structured-outputs
