---
name: fk-04-mcp-integration
description: "Use when a client wants Claude to act on real internal systems — databases, ticketing, ERP, proprietary APIs — and the security team needs to know exactly what it can touch, how access is authenticated, and what happens when auth fails. Covers MCP server design, narrow typed tools, fail-closed auth, and least privilege."
---

# FK-04 · MCP Integration Pattern

*How Claude reaches enterprise systems without anyone losing sleep.*

Anthropic's framing is that the agent-computer interface deserves the same
design investment as a human-facing UI — tools are the product surface an
agent lives on. MCP is the open standard for that surface: vendor-neutral
under the Linux Foundation's Agentic AI Foundation since December 2025, not
proprietary plumbing. This pattern is the enterprise field version of that
guidance: the tool design, auth posture, and audit story that gets an
integration through security review instead of stalled by it.

## Problem scene

The client wants Claude to act on real systems — pull the ticket, check the
contract, file the adjustment. The security team wants three answers before
anything ships: exactly what can it touch, how is access authenticated, and
what happens when auth fails. Most integrations die here, not on capability
but on the absence of a crisp answer to question three.

## When to use / when not to

**Use for** any agent that needs tools beyond its context window — which is
nearly every agent doing real enterprise work.

**Do not use** for pure-generation tasks: drafting, rewriting,
summarizing supplied text. An MCP server with nothing real to expose is
ceremony, and ceremony is what security reviews learn to distrust.

## Architecture

- **A custom MCP server** — JSON-RPC 2.0 over streamable HTTP — as the single
  doorway between the model and the enterprise. One protocol, one place to
  authenticate, one place to trace.
- **Narrow, typed tools.** `get_invoice(invoice_id)`, not `run_query(sql)`.
  Each tool does one thing, validates its inputs, and can be explained to a
  security reviewer in one sentence. This is the ACI principle in practice:
  tool design *is* interface design.
- **Fail-closed auth.** No credential, wrong credential, or a server booted
  without its key configured: every request is refused. The dangerous default
  is the opposite — an auth check that quietly passes when misconfigured.
  Fail-closed means misconfiguration produces an outage, never an exposure.
- **Least privilege per tool.** Read tools and write tools separated; write
  tools scoped to the smallest action that serves the use case; nothing
  exposed "while we're in there."
- **Tool results as the only ground truth.** The model may cite what a tool
  returned and nothing else — the same boundary FK-01 draws around logic,
  drawn here around facts.
- **At scale: code execution with MCP.** When tool counts grow, present
  servers as code APIs and load definitions on demand rather than packing
  every definition into context — Anthropic's published efficiency pattern
  (Nov 2025).

## Eval plan

- **Contract tests per tool** — typed inputs, typed outputs, error shapes,
  run in CI like any API's test suite.
- **Auth-failure fixtures** — requests with no key, a wrong key, and a
  server misconfigured without one, each proving the refusal path. Fail-closed
  is a claim; fixtures make it a fact.
- **End-to-end traces** — every tool call logged with caller, inputs, and
  results, because "what did the agent touch?" must be answerable from
  records, not memory.

## Where this breaks in the field

- **Kitchen-sink tools.** `run_query(sql)` demos beautifully and dies in
  security review — because the honest answer to "what can it touch?" becomes
  "anything." Tool breadth is the thing reviewers price.
- **Fail-open error handling.** The auth middleware that logs a warning and
  continues; the try/except that swallows the 401. Nobody notices until the
  audit.
- **No tracing.** The integration works, then something odd happens, and
  there is no record of what the agent actually did. Trust, once spent here,
  does not refill.

## The objection this kills

**"We can't give an AI access to our systems."** Reframe what "access" means:
the model gets a handful of named, typed verbs behind authenticated doors — not a
shell, not a connection string, not your network. Hand the reviewer the tool
list; it fits on an index card. And the protocol carrying it is a
Linux Foundation open standard, not one vendor's lock-in. The conversation
changes from "how do we stop it" to "which verbs do we grant."

## Live exemplar

**Verity's MCP server** — deterministic reconciliation tools behind MCP
([verity-navy-five.vercel.app](https://verity-navy-five.vercel.app)) — and
**FieldKit itself**, whose catalog server is built to this pattern: narrow
typed tools, fail-closed auth. If you are reading this over MCP, the
demonstration is already running.

## Workshop outline (90 minutes)

1. **0:00 – 0:20** — The security-review conversation: the three questions,
   and why "what happens when auth fails" is the one that kills deals.
2. **0:20 – 0:50** — Live: split a kitchen-sink `run_query` tool into three
   narrow typed tools; watch the security answer improve as the surface
   shrinks.
3. **0:50 – 1:15** — Break auth on purpose: remove the server's key, watch
   every request refuse. Fail-closed as demonstrated behavior, not slideware.
4. **1:15 – 1:30** — Map one system from the room onto a five-tool MCP
   surface; write the index-card tool list a reviewer would sign.

---

Grounded in:

- Model Context Protocol specification — MCP project (vendor-neutral, Agentic AI Foundation / Linux Foundation) — https://modelcontextprotocol.io
- MCP joins the Agentic AI Foundation — Model Context Protocol project blog (2025-12-09) — https://blog.modelcontextprotocol.io/posts/2025-12-09-mcp-joins-agentic-ai-foundation/
- Building effective agents (Appendix 2, the agent-computer interface) — Erik Schluntz and Barry Zhang, Anthropic Engineering (2024-12-19) — https://www.anthropic.com/engineering/building-effective-agents
- Code execution with MCP: Building more efficient agents — Anthropic Engineering (2025-11-04) — https://www.anthropic.com/engineering/code-execution-with-mcp
