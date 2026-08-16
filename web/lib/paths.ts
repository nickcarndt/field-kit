import fs from "node:fs";
import path from "node:path";

const EXPECTED_COUNT = 5;

export function listPatternFilenames(dir: string): string[] {
  if (!fs.existsSync(dir) || !fs.statSync(dir).isDirectory()) return [];
  return fs
    .readdirSync(dir)
    .filter((name) => /^fk-.*\.md$/.test(name))
    .sort();
}

export function patternsDir(): string {
  const candidates = [
    path.resolve(process.cwd(), "..", "patterns"),
    path.resolve(process.cwd(), "patterns"),
  ];
  const reports: string[] = [];
  for (const dir of candidates) {
    const files = listPatternFilenames(dir);
    reports.push(
      `${dir}: ${files.length} file(s)${files.length ? ` (${files.join(", ")})` : ""}`,
    );
    if (files.length === EXPECTED_COUNT) return dir;
  }
  throw new Error(
    `expected exactly ${EXPECTED_COUNT} pattern files (fk-*.md); never building an empty library. Looked in:\n${reports.join("\n")}\nIf this is a Vercel build with Root Directory set to web/, enable "Include source files outside the Root Directory" so ../patterns is visible.`,
  );
}
