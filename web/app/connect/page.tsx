import { existsSync } from "node:fs";
import path from "node:path";
import type { Metadata } from "next";
import { FindPattern } from "@/components/FindPattern";
import { InstallPanel } from "@/components/InstallPanel";
import { WorkedExample } from "@/components/WorkedExample";
import { loadCatalog } from "@/lib/catalog";
import { assertDemoRecommendation, toRecommendable } from "@/lib/recommend";
import { MCP_URL, SITE_DESCRIPTION } from "@/lib/site";

export const metadata: Metadata = {
  title: "Connect",
  description: SITE_DESCRIPTION,
};

const DEMO_PROMPT =
  "Ask FieldKit which pattern fits a claims-processing agent for an insurance client.";

export default function ConnectPage() {
  const catalog = loadCatalog();
  const recommendations = assertDemoRecommendation(catalog);
  // The video section exists only when the recording does — no stubs.
  const hasDemoVideo = existsSync(
    path.join(process.cwd(), "public", "fieldkit-demo.mp4"),
  );

  return (
    <div className="connect">
      <h1>Connect</h1>
      <p className="lede">
        Everything above the install steps works with zero setup. Below them is how
        to put FieldKit in your own editor. This site never calls the server and
        never embeds a key.
      </p>

      {hasDemoVideo ? (
        <>
          <h2>Watch it work</h2>
          <p>
            A real Claude Code session — the plugin installing, a skill firing on a
            plain question, the live server answering the thirty-second demo.
            Nothing staged.
          </p>
          {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
          <video className="demo-video" controls preload="metadata" src="/fieldkit-demo.mp4" />
        </>
      ) : null}

      <h2>Install the skills</h2>
      <p>
        No server, no key needed: from this repo&apos;s root, start <code>claude</code>,
        then:
      </p>
      <InstallPanel code={"/plugin marketplace add .\n/plugin install fieldkit@fieldkit-dev"} />
      <p>
        Ask <em>when should a system say I-don&apos;t-know instead of answering?</em> and
        watch FK-02 load itself.
      </p>

      <h2>Connect the live catalog server</h2>
      <p>
        MCP is a vendor-neutral open standard under the Linux Foundation&apos;s Agentic AI
        Foundation — donated December 2025 — not an Anthropic-proprietary protocol.
      </p>
      <p>
        The repo&apos;s <code>.mcp.json</code> already points at the deployed server and
        falls back to the published demo key, so a fresh clone connects with zero
        setup. This site never calls the server itself. The URL and demo key, as
        text:
      </p>
      <p className="mcp-url">{MCP_URL}</p>
      <InstallPanel code={"x-api-key: fieldkit-demo-2026"} />
      <p>
        Publishing a key is a deliberate least-privilege judgment, not an oversight:
        every tool is a read-only view over content already public in this repo, so
        the demo key grants nothing the website doesn&apos;t. The gate itself stays
        fail-closed — change one character of that key and every request returns
        401, which is a better demonstration than any diagram. Production tenants
        connect with private per-client keys instead (write to nick@nickarndt.com;
        <code> export FIELDKIT_API_KEY</code> overrides the default). One note:
        auth is per-request via header — there is no OAuth endpoint, so
        <code> /mcp</code>&apos;s re-authenticate action reports a 401 from the gate.
        That is deny-by-default covering endpoints that were never built.
      </p>
      <p>
        Start <code>claude</code> in this directory, approve the project server, and
        run the thirty-second demo. The answer is FK-01 plus FK-03, with the matched
        triggers as evidence — the recommendation is a deterministic, auditable rubric,
        not a model call.
      </p>

      <WorkedExample prompt={DEMO_PROMPT} recommendations={recommendations} />

      <FindPattern catalog={catalog.map(toRecommendable)} />

      <h2>No Claude Code</h2>
      <p>
        The patterns are plain markdown in <code>patterns/</code>. The kit degrades
        gracefully into documents.
      </p>
    </div>
  );
}
