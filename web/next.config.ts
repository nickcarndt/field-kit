import path from "node:path";
import { fileURLToPath } from "node:url";
import type { NextConfig } from "next";

const repoRoot = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

const nextConfig: NextConfig = {
  // The catalog parser reads ../patterns. On Vercel, set Root Directory to
  // web/ and enable "Include source files outside the Root Directory".
  outputFileTracingRoot: repoRoot,
};

export default nextConfig;
