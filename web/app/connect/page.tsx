import type { Metadata } from "next";
import { InstallPanel } from "@/components/InstallPanel";
import { WorkedExample } from "@/components/WorkedExample";
import { loadCatalog } from "@/lib/catalog";
import { assertDemoRecommendation } from "@/lib/recommend";
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

  return (
    <div className="connect">
      <h1>Connect</h1>
      <p className="lede">
        Install the plugin and connect the catalog server from Claude Code. This site
        never calls the server and never embeds a key.
      </p>

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
        The repo&apos;s <code>.mcp.json</code> already points at the deployed server. This
        site never calls it and never embeds a key. The URL appears here as text:
      </p>
      <p className="mcp-url">{MCP_URL}</p>
      <p>
        It authenticates with an API key from your environment (the key is never
        committed — write to nickcarndt@gmail.com to request one):
      </p>
      <InstallPanel code={"export FIELDKIT_API_KEY=<your key>"} />
      <p>
        Restart <code>claude</code> in this directory, approve the project server, and
        run the thirty-second demo. The answer is FK-01 plus FK-03, with the matched
        triggers as evidence — the recommendation is a deterministic, auditable rubric,
        not a model call.
      </p>

      <WorkedExample prompt={DEMO_PROMPT} recommendations={recommendations} />

      <h2>No Claude Code</h2>
      <p>
        The patterns are plain markdown in <code>patterns/</code>. The kit degrades
        gracefully into documents.
      </p>
    </div>
  );
}
