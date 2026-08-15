# FIELDKIT — Build Spec v2.0
### An MCP-native Partner Enablement Kit, built as an audition for Applied AI Architect, Partnerships @ Anthropic
**Build window: Saturday Aug 15 (today) through Sunday Aug 16, frozen by 5pm Sunday. Mentioned once at the Kyle Mays screen, Monday Aug 17, 3:30pm ET.**

> **What changed from v1 (Aug 12 to Aug 15):** the skeleton is unchanged and was sound. Research added three things: (1) a headline packaging decision, the five patterns become Agent Skills in SKILL.md format shipped as an installable Claude Code plugin; (2) vocabulary alignment to Anthropic's own published "Building Effective Agents" taxonomy; (3) an explicit do-not-start list, separate from the cut order. Also updated: the build schedule compressed from three days to two, and the README gains one line about enterprise plugin distribution.

---

## 1. North Star

**One-line pitch:** FieldKit is the toolkit a Partners Solutions Architect would hand a GSI's AI practice on day one: a queryable library of Anthropic-aligned reference architectures, delivered the way Anthropic itself delivers capability (Agent Skills over MCP, installable as a plugin), plus a practice readiness assessment, so partner teams go from "we want to build with Claude" to "we know exactly which pattern to ship" in one session.

**The thesis underneath it (this is the differentiator, say it out loud in later rounds):** partner enablement should be installable software, not a slide deck. I watched enablement fail from inside a GSI. Practitioners do not read the deck. They install the thing that is already in their editor.

**The message it sends:** I did not just apply for this role. I built the first month of it.

---

## 2. JD Traceability (this table is the interview talk track)

| JD language (verbatim) | FieldKit answer |
|---|---|
| "codify reference architectures / best practices to accelerate time to deployment" | The pattern library: five production patterns, each with architecture, eval plan, and pitfalls |
| "embed with GSI and cloud partner technical teams to enable their AI practices" | The Skills + plugin packaging: the delivery mechanism a practice actually installs |
| "serve as an escalation point for complex technical issues" | Every pattern's "where this breaks in the field" section: escalation knowledge written down instead of trapped in one head |
| "identify high value industry-specific GenAI applications" | Each pattern opens with a concrete industry scene (finance ops, regulated research, federal delivery) |
| "evangelize Anthropic in their developer communities... hackathons, technical enablement sessions" | The 90-minute workshop outline per pattern |
| "Intervene directly to unblock strategic customer deals" | "The objection this kills" on every pattern: a sales-blocker map disguised as documentation |
| "Validate and gather feedback on... deployment patterns" | The README's Field Notes section |
| "Familiarity with common LLM frameworks and tools" | MCP, Agent Skills, LangGraph, evals, structured outputs, citations |
| "A love of teaching, mentoring, and helping others succeed" | The entire artifact is a teaching document that happens to be software |

---

## 3. The Five Patterns (content is the product)

Catalog IDs FK-01 through FK-05 are part numbers in a field kit, not a sequence. Every pattern carries the same seven fields:
**Problem scene → When to use / when not to → Architecture → Eval plan → Where this breaks in the field → The objection this kills → Live exemplar.**

**NEW in v2, vocabulary alignment.** Each pattern must be mapped onto Anthropic's published taxonomy from "Building Effective Agents" (Schluntz and Zhang, Dec 2024). Use their exact terms so the artifact speaks the house dialect: **workflows** ("systems where LLMs and tools are orchestrated through predefined code paths") vs. **agents** ("dynamically direct their own processes and tool usage"), the **augmented LLM**, prompt chaining, routing, parallelization, **orchestrator-workers**, **evaluator-optimizer**, and the **agent-computer interface (ACI)**. Anchor the whole kit in their three core principles: **simplicity, transparency, and a well-crafted agent-computer interface**, plus "find the simplest solution possible, and only increase complexity when needed."

### FK-01 · Deterministic-Core Agent
*"Correctness lives in tools, not the model."*
- **Problem scene:** A controller reconciles vendor invoices against contracts by hand, misses six figures of overbilling a year. The business wants an agent, but an agent that occasionally invents a number is unusable for payment decisions.
- **When to use:** Any workflow where the answer is checkable (math, policy rules, thresholds, matching). **When not to:** open-ended synthesis with no ground truth.
- **Architecture:** Deterministic MCP tools own all business logic. The model's only generative job is the cited report. Orchestrated as a **prompt chaining workflow with programmatic gates** (their terms), not an autonomous agent, because the control flow is known in advance. Human-in-the-loop exception queue for judgment calls.
- **Eval plan:** Labeled fixtures with known answers, deterministic scorers, plus a faithfulness eval on the one generative step.
- **Where this breaks in the field:** Teams let the model "help" with the logic and lose auditability. Fixture sets go stale as contracts change. Exception queues become dumping grounds without triage SLAs.
- **The objection this kills:** "We can't let an LLM touch financial decisions."
- **Live exemplar:** Verity (verity-navy-five.vercel.app)
- **v2 minor:** reference the **Claude Agent SDK** (renamed from Claude Code SDK, late 2025) as the current way to get the agent loop, tools, and context management rather than hand-rolling one.

### FK-02 · Grounded Retrieval with Abstention
*"A system that says 'I don't know' is more trustworthy than one that always answers."*
- **Problem scene:** Analysts need answers buried in thousands of pages of filings. In regulated domains, a confidently wrong answer is worse than no answer.
- **When to use:** Question-answering over a real document corpus where provenance matters. **When not to:** tiny corpora that fit in context; creative tasks.
- **Architecture:** Hybrid retrieval (dense plus Postgres FTS fused with RRF, then rerank). Citation grounding enforced **in code** against a closed evidence set, never by prompt request. Confidence-based abstention below threshold.
- **Eval plan:** Six metrics head to head across retrieval strategies: recall, MRR, citation accuracy, faithfulness, latency, cost. Publish the report; the tradeoff table is the deliverable.
- **Where this breaks in the field:** Prompt-requested citations (decorative, not enforced). Dense-only retrieval missing exact-term matches. No abstention threshold.
- **The objection this kills:** "Hallucination risk makes this unusable in our industry."
- **Live exemplar:** Prospectus (prospectus-nickarndt.vercel.app)
- **v2 minor:** name Anthropic's first-class **citations** and **structured outputs** API features in the architecture section. This is the pattern that answers the objection GSIs hear most, and it echoes the real Deloitte Australia incident where AI-assisted work shipped with fabricated citations.
- ⚠️ **Standing rule: hybrid retrieval belongs to FK-02 only. FK-01 has none. Never conflate.**

### FK-03 · Evals as a Launch Gate
*"'It seems to work' is not a deliverable."*
- **Problem scene:** A partner ships a pilot the client loves in the demo and distrusts in week three. Nobody defined what "working" means, so nobody can prove it.
- **When to use:** Every engagement, before code. **When not to:** never. This is the pattern that makes the other four sellable.
- **Architecture:** Define the metric before building. Labeled fixture sets, deterministic scorers where possible, LLM-as-judge where judgment is required, faithfulness checks on generative steps, tracing on every run. Maps to their **evaluator-optimizer** pattern and their "automating evals" guidance.
- **Eval plan (meta):** the pattern IS a template: metric definition sheet, fixture-set starter, judge-prompt scaffold, CI regression gate.
- **Where this breaks in the field:** Evals bolted on after launch. Judge prompts that drift. Fixtures covering only happy paths.
- **The objection this kills:** "How do we know it actually works?" The question that stalls every enterprise deal.
- **Live exemplar:** Verity's harness (runs in CI on every push) plus Prospectus's published report.

### FK-04 · MCP Integration Pattern
*"How Claude reaches enterprise systems without anyone losing sleep."*
- **Problem scene:** The client wants Claude to act on real systems, and the security team wants to know exactly what it can touch and what happens when auth fails.
- **When to use:** Any agent needing tools beyond its context. **When not to:** pure-generation tasks.
- **Architecture:** Custom MCP server (JSON-RPC 2.0, streamable HTTP) exposing narrow, typed tools. Fail-closed auth. Least-privilege tool design. Tool results as the only ground truth the model may cite. This is the **agent-computer interface** in their vocabulary: invest in tool design the way you would invest in a human-facing UI.
- **Eval plan:** Contract tests per tool, auth-failure fixtures proving fail-closed behavior, end-to-end traces.
- **Where this breaks in the field:** Kitchen-sink tools like run_query(sql) that terrify security review. Fail-open error handling. No tracing.
- **The objection this kills:** "We can't give an AI access to our systems."
- **Live exemplar:** Verity's MCP server, and FieldKit itself.
- **v2 addition:** reference Anthropic's Nov 2025 "code execution with MCP" pattern (presenting MCP servers as code APIs to cut token use) as the current efficiency practice.
- **v2 fact to state correctly:** MCP was donated to the Linux Foundation's Agentic AI Foundation in Dec 2025. It is a vendor-neutral open standard, not Anthropic proprietary.

### FK-05 · Deployment Readiness Assessment
*"Are we actually ready to take this to production?"*
- **Problem scene:** A practice lead has three pilots and board pressure, and no honest map of what is blocking production.
- **When to use:** Engagement kickoff, quarterly practice reviews, pre-sales discovery. **When not to:** as a substitute for building.
- **Architecture:** Structured questionnaire, Claude with schema-validated structured output, scored maturity profile across four axes (delivery, evals, governance, Claude fluency), generated roadmap mapping gaps to FK-01 through FK-04.
- **Eval plan:** Golden-profile fixtures, judge consistency checks, refusal handling for out-of-scope input.
- **Where this breaks in the field:** Assessments that flatter instead of diagnose. Roadmaps disconnected from patterns.
- **The objection this kills:** "Where do we even start?"
- **Live exemplar:** evolved from the Federal Readiness Suite.

---

## 4. Packaging (the v2 headline)

**Ship the patterns three ways off one body of content.**

**A. Agent Skills (the headline).** Each pattern becomes a `SKILL.md`: YAML frontmatter with `name` and `description` (the description is what Claude reads to decide relevance, so write it as a trigger sentence), then the seven-field body. Keep each under 5,000 tokens, which your patterns already satisfy. This uses progressive disclosure exactly as designed: name and description always loaded, body loaded on relevance.

**B. Claude Code plugin (the distribution wrapper).** `.claude-plugin/plugin.json` bundling the `skills/` directory and an `.mcp.json` pointing at your deployed server. Test the install path yourself. Anthropic's own framing is the story: plugins do not introduce new capabilities, they package existing ones. That is the enablement-distribution thesis in one sentence.

**C. MCP server (the runtime front door).** Unchanged from v1. Transport: streamable HTTP, FastMCP, reusing Verity's scaffolding.
- **Tools:** `list_patterns()`, `get_pattern(id)`, `recommend_pattern(use_case)`, `get_eval_plan(id)`, `get_workshop(id)`, `assess_readiness(answers)`
- **Resources:** each pattern at `fieldkit://patterns/fk-01` and so on
- **Auth:** fail-closed API key on the HTTP surface. Demonstrating FK-04's own preaching.
- **The demo moment:** in Claude Code, "Ask FieldKit which pattern fits a claims-processing agent for an insurance client" returns FK-01 plus FK-03 with reasoning. Thirty seconds, live.

---

## 5. Web App (unchanged, four screens)

1. **Library** — the five spec-plate cards. The library IS the hero. One line above it: "Reference architectures for teams deploying Claude in production."
2. **Pattern detail** — the seven fields as a beautifully typeset technical document. Print-quality reading. Copy-ready code blocks.
3. **Readiness assessment** — FK-05 flow, four-axis result, roadmap linking into patterns. **First item on the cut list.**
4. **Connect** — how to install the plugin and connect the MCP server from Claude Code or Desktop, with one worked example query.

Footer everywhere: "Built by Nick Arndt · Patterns proven in Verity and Prospectus · Field notes welcome."

---

## 6. README (a writing sample disguised as documentation)

1. Why this exists (the pilot-purgatory problem, business language, three paragraphs)
2. What is inside (five patterns, one line each plus the objection each kills)
3. Quickstart: install the plugin and connect from Claude Code in two minutes
4. How a GSI practice would actually use this (kickoff, assessment, pattern selection, workshop, eval gate, production)
5. Design decisions (why MCP, why Skills, why fail-closed, why evals are a pattern and not a chapter)
6. Field Notes (the feedback loop: what deployment patterns should exist next)

**v2 free addition, one line, high leverage:** note that a GSI could distribute FieldKit-style plugins internally through private plugin marketplaces for enterprise admins. Zero build cost, and it moves the story from "here is a tool" to "here is how a 470,000-person firm distributes this to its practitioners." That is partner-scale thinking, which is what the role actually tests.

---

## 7. Design Spec (unchanged from v1)

**Direction: the technical field manual.** Aviation checklist, surveyor's instrument case, engineering data plate. Precision, paper, ink, one safety color.

**Banned (the AI-design tells):** purple/blue gradients, glassmorphism, emoji in UI, shadcn-default rounded cards with soft shadows, giant gradient hero text, floating blobs, dark-mode-with-neon, Inter plus Space Grotesk defaults. **And deliberately: no cream-plus-terracotta clone of Anthropic's own palette.** Imitating their brand reads as flattery and as an AI tell simultaneously. Adjacent respect, not cosplay.

**Tokens:** paper `#F7F5F0`, ink `#1A1D21`, field-line `#8A8F98`, one signal accent in the international-orange family used only for interactive states and the FK catalog badge. Type: IBM Plex Sans (body/UI), IBM Plex Mono (catalog IDs, metadata, tool signatures), Source Serif 4 (pattern-detail long-form). Scale: display 40/48, section 24/32, body 17/28, meta 13/20 mono. Reading measure 68 to 72 characters.

**The signature element:** the pattern spec plate. Mono catalog number, pattern name in sans, italic one-line thesis, then "Kills: [objection]" as a stamped field. Everything else stays quiet so the plates carry the identity.

**Motion:** near none. One orchestrated moment maximum. Hover = ink to signal, 120ms. Respect reduced-motion.

**Craft floor:** responsive to mobile, visible keyboard focus, real empty and error states in plain active voice, no lorem ipsum anywhere.

---

## 8. Build Plan (compressed to two days)

**Step zero (15 min):** create `BUILD-LOG.md` by hand in the repo. After every block, write two lines: what I built, and how it works in my own words. Written immediately, not deferred. This file is the anti-Verity insurance.

**Working protocol with Claude Code (paste before any code):** explain before building (three sentences: what it does, why it exists, what breaks without it), wait for "go," comment only where a decision was made, quiz me after each file, keep files small and single-purpose, never silently refactor what I already understand.

**Tool split:** Claude Code for multi-file work (scaffold, MCP server, Skills packaging, plugin manifest, README). Cursor for the web app and anything visual or iterative. Do not thrash between them mid-task.

**SATURDAY**
- Block 1 (90 min): five pattern markdown files, seven fields each, vocabulary aligned. **Gate: five files exist and I can say each objection-killed line from memory.**
- Block 2 (2.5 hrs): MCP server. Tools in order: list_patterns, get_pattern, recommend_pattern. Fail-closed auth. Deploy. **HARD GATE: recommend_pattern returns a real answer called from Claude Code. If this is not working, everything else stops until it is.**
- Lunch and walk (45 min). Leave the desk. Consolidation happens here.
- Block 3 (75 min): Skills packaging. Five SKILL.md files, plugin.json, .mcp.json, test install. **If this fights for more than an hour, ship the server alone and write Skills packaging as a "next" section in the README.**
- Block 4 (2 hrs): web app. Library, pattern detail, connect page. Design tokens. **Cut the assessment flow if behind.**
- Block 5 (60 min): README, deploy, test the live URL on phone. **Gate: a stranger understands what this is in 30 seconds.**
- Evening (2 hrs): stories practice. Opener B, why-Anthropic, Sections 15 and 16. Out loud, third pass recorded.

**SUNDAY**
- Morning: polish pass, assessment flow only if Saturday's gates all cleared, final deploy. **Frozen by 5pm. No exceptions.**
- Afternoon: G8 (MCP mechanism) until reflexive, Verity talk-through, Anthropic talk-through.
- Evening: off. Actually off.

**Cut order (cut top down, never compress the gates):**
1. Readiness assessment interactive flow becomes a static card plus the questionnaire in the README
2. `get_workshop` tool, outlines live in pattern docs only
3. Five patterns become four, fold FK-05 into the README

**Never cut:** the MCP server working live, the spec-plate design, the README, fail-closed auth.

---

## 9. Do Not Start (new in v2, distinct from the cut order)

These sound impressive and are invisible in a Monday demo:
- Public MCP registry or connectors directory submission (approval is outside your control)
- Multi-cloud deployment on Bedrock, Vertex, or Foundry (huge time sink, zero demo value)
- Full auth, SSO, or RBAC beyond the fail-closed token check (mention as production hardening, do not build)
- External Skills marketplaces (SkillsMP, skills.sh, Agensi)
- Dashboards, analytics, or user accounts in the web app
- A custom eval harness product (reference Braintrust, keep eval plans as content)

---

## 10. How It Plays in the Process

- **Monday, Kyle (recruiter screen):** ONE planted sentence, late in the call, not a demo. "I actually spent the weekend building the tool I'd want in this seat, an MCP server that packages reference architectures as Agent Skills a GSI practice could install on day one. Happy to send the link." Then send the link in the thank-you note.
- **HM and technical rounds:** FieldKit becomes the anchor artifact. The JD traceability table in section 2 is the talk track.
- **The honest scope note to volunteer:** partners deploy Claude across a builder surface and a knowledge-worker surface. FieldKit deliberately addresses the builder surface. Saying that out loud shows the choice was deliberate, not a blind spot.
- **AI-usage policy:** building portfolio software with Claude is on-policy and on-brand. Anthropic's guidance encourages using Claude for interview prep, asks for take-homes to be done without it unless indicated, and expects live interviews to be unassisted. Say plainly that you build AI-natively in Claude Code and Cursor, like everything you ship.

---

## 11. Guardrails

1. Scope creep is the only way this fails. The gates in section 8 are the product.
2. The FK-01 and FK-02 non-conflation rule applies inside FieldKit's own copy.
3. Do not restate stale facts in the README or in conversation: MCP is a donated open standard, not proprietary; and Claude is no longer the only frontier model on all three clouds (that was true Nov 2025 to mid 2026). The accurate line is that Claude was first to break Azure's exclusivity and stays the deepest-integrated model across all three.
4. FieldKit is a multiplier, not a dependency. The essay, the GSI story, and the portfolio already carry Monday's screen.
