import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { listPatternFilenames, patternsDir } from "./paths";
import { EXPECTED_SECTIONS, type Axis, type Exemplar, type GroundedIn, type Pattern } from "./types";

// Two renderers, one contract, both fail loud. The Python parser
// (server/mcp_server/catalog.py) is the MCP runtime source of truth.
// This module is the web build-time renderer. Neither is a fallback for
// the other. Parity is enforced by the Connect page's build-gated demo
// query (FK-01 then FK-03).

const ALLOWED_ROOT_KEYS = new Set([
  "id",
  "slug",
  "name",
  "thesis",
  "kills",
  "taxonomy",
  "description",
  "triggers",
  "exemplars",
  "grounded_in",
  "pairs_with_all",
  "fallback",
  "axes",
  "scale",
]);

export class CatalogError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CatalogError";
  }
}

function fail(file: string, message: string): never {
  throw new CatalogError(`${file}: ${message}`);
}

function asString(file: string, field: string, value: unknown): string {
  if (typeof value !== "string" || !value.trim()) {
    fail(file, `${field} must be a non-empty string`);
  }
  return value.trim();
}

function asOptionalString(file: string, field: string, value: unknown): string | undefined {
  if (value === undefined || value === null) return undefined;
  if (value instanceof Date) {
    fail(
      file,
      `${field} got Date — quote dates in frontmatter (date: "2024-12-19")`,
    );
  }
  if (typeof value !== "string") {
    fail(file, `${field} got ${typeof value} — expected a string`);
  }
  const trimmed = value.trim();
  return trimmed ? trimmed : undefined;
}

function asBoolean(file: string, field: string, value: unknown, fallback: boolean): boolean {
  if (value === undefined) return fallback;
  if (typeof value !== "boolean") fail(file, `${field} must be a boolean`);
  return value;
}

function extraKeys(obj: Record<string, unknown>, allowed: Set<string>): string[] {
  return Object.keys(obj).filter((k) => !allowed.has(k));
}

function parseExemplar(file: string, raw: unknown, index: number): Exemplar {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    fail(file, `exemplars[${index}] must be an object`);
  }
  const row = raw as Record<string, unknown>;
  const extra = extraKeys(row, new Set(["name", "url"]));
  if (extra.length) fail(file, `exemplars[${index}] unknown field(s): ${extra.join(", ")}`);
  return {
    name: asString(file, `exemplars[${index}].name`, row.name),
    url: asOptionalString(file, `exemplars[${index}].url`, row.url),
  };
}

function parseGroundedIn(file: string, raw: unknown, index: number): GroundedIn {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    fail(file, `grounded_in[${index}] must be an object`);
  }
  const row = raw as Record<string, unknown>;
  const extra = extraKeys(row, new Set(["source", "authors", "principle", "url", "date"]));
  if (extra.length) fail(file, `grounded_in[${index}] unknown field(s): ${extra.join(", ")}`);
  return {
    source: asString(file, `grounded_in[${index}].source`, row.source),
    authors: asString(file, `grounded_in[${index}].authors`, row.authors),
    principle: asString(file, `grounded_in[${index}].principle`, row.principle),
    url: asOptionalString(file, `grounded_in[${index}].url`, row.url),
    date: asOptionalString(file, `grounded_in[${index}].date`, row.date),
  };
}

function parseAxis(file: string, raw: unknown, index: number): Axis {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    fail(file, `axes[${index}] must be an object`);
  }
  const row = raw as Record<string, unknown>;
  const extra = extraKeys(row, new Set(["key", "name", "routes_to", "items"]));
  if (extra.length) fail(file, `axes[${index}] unknown field(s): ${extra.join(", ")}`);
  let items: string[] = [];
  if (row.items !== undefined) {
    if (!Array.isArray(row.items) || !row.items.every((i) => typeof i === "string" && i.trim())) {
      fail(file, `axes[${index}].items must be a list of non-empty strings`);
    }
    items = row.items.map((i) => (i as string).trim());
  }
  return {
    key: asString(file, `axes[${index}].key`, row.key),
    name: asString(file, `axes[${index}].name`, row.name),
    routes_to: asString(file, `axes[${index}].routes_to`, row.routes_to),
    items,
  };
}

function parseFile(filePath: string): Pattern {
  const file = path.basename(filePath);
  const text = fs.readFileSync(filePath, "utf8");
  const { data, content } = matter(text);
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    fail(file, "no frontmatter block");
  }
  const fm = data as Record<string, unknown>;
  const extra = extraKeys(fm, ALLOWED_ROOT_KEYS);
  if (extra.length) fail(file, `unknown frontmatter field(s): ${extra.join(", ")}`);

  const h1 = content.match(/^# .+$/m);
  if (!h1 || h1.index === undefined) fail(file, "no H1 title");
  const afterH1 = content.slice(h1.index + h1[0].length);
  const chunks = afterH1.split(/^## (.+)$/m);
  const framing = chunks[0].trim();
  if (!framing) fail(file, "missing framing paragraph between H1 and first H2");

  const headings: string[] = [];
  const sections: Record<string, string> = {};
  for (let i = 1; i < chunks.length; i += 2) {
    const heading = chunks[i].trim();
    const body = (chunks[i + 1] ?? "").trim();
    headings.push(heading);
    sections[heading] = body;
  }
  const expected = [...EXPECTED_SECTIONS];
  if (headings.length !== expected.length || headings.some((h, i) => h !== expected[i])) {
    fail(file, `H2 sections ${JSON.stringify(headings)} != contract ${JSON.stringify(expected)}`);
  }

  if (!Array.isArray(fm.triggers) || fm.triggers.length === 0) {
    fail(file, "triggers must be a non-empty list of lowercase stems");
  }
  const triggers = fm.triggers.map((t, i) => {
    if (typeof t !== "string" || !t.trim() || t !== t.toLowerCase()) {
      fail(file, `triggers must be non-empty lowercase stems, got ${JSON.stringify(t)} at ${i}`);
    }
    return t;
  });

  if (!Array.isArray(fm.exemplars) || fm.exemplars.length === 0) {
    fail(file, "exemplars must be a non-empty list");
  }
  if (!Array.isArray(fm.grounded_in) || fm.grounded_in.length === 0) {
    fail(file, "grounded_in must be a non-empty list");
  }

  let axes: Axis[] = [];
  if (fm.axes !== undefined) {
    if (!Array.isArray(fm.axes)) fail(file, "axes must be a list");
    axes = fm.axes.map((a, i) => parseAxis(file, a, i));
  }

  let scale: string[] = [];
  if (fm.scale !== undefined) {
    if (!Array.isArray(fm.scale) || !fm.scale.every((s) => typeof s === "string" && s.trim())) {
      fail(file, "scale must be a list of non-empty strings");
    }
    scale = fm.scale.map((s) => (s as string).trim());
  }

  return {
    id: asString(file, "id", fm.id),
    slug: asString(file, "slug", fm.slug),
    name: asString(file, "name", fm.name),
    thesis: asString(file, "thesis", fm.thesis),
    kills: asString(file, "kills", fm.kills),
    taxonomy: asString(file, "taxonomy", fm.taxonomy),
    description: asString(file, "description", fm.description),
    triggers,
    exemplars: fm.exemplars.map((e, i) => parseExemplar(file, e, i)),
    grounded_in: fm.grounded_in.map((g, i) => parseGroundedIn(file, g, i)),
    pairs_with_all: asBoolean(file, "pairs_with_all", fm.pairs_with_all, false),
    fallback: asBoolean(file, "fallback", fm.fallback, false),
    axes,
    scale,
    framing,
    sections,
  };
}

export function loadCatalog(): Pattern[] {
  const dir = patternsDir();
  const files = listPatternFilenames(dir);
  const patterns = files.map((name) => parseFile(path.join(dir, name)));
  const byId = new Map(patterns.map((p) => [p.id, p]));
  if (byId.size !== patterns.length) {
    throw new CatalogError("duplicate catalog ids");
  }
  for (const p of patterns) {
    for (const ax of p.axes) {
      if (!byId.has(ax.routes_to)) {
        throw new CatalogError(
          `${p.id}: axis ${JSON.stringify(ax.key)} routes to unknown pattern ${JSON.stringify(ax.routes_to)}`,
        );
      }
    }
    if (p.axes.some((ax) => ax.items.length > 0) && p.scale.length !== 4) {
      throw new CatalogError(
        `${p.id}: questionnaire items exist but \`scale\` does not define exactly 4 anchor labels (scores 0-3)`,
      );
    }
  }
  return [...patterns].sort((a, b) => a.id.localeCompare(b.id));
}

export function getPatternBySlug(slug: string): Pattern | undefined {
  return loadCatalog().find((p) => p.slug === slug);
}
