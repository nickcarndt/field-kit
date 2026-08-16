"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import {
  recommendPattern,
  type Recommendable,
  type Recommendation,
} from "@/lib/recommend";

// One click must be enough for a visitor with no use case in their pocket —
// each example exercises a different pattern so three clicks tour the rubric.
const EXAMPLES = [
  "a claims-processing agent for an insurance client",
  "answer questions over thousands of pages of filings",
  "we have three pilots and don't know where to start",
];

function RecoChip({ rec, order }: { rec: Recommendation; order: number }) {
  return (
    <li style={{ animationDelay: `${order * 70}ms` }}>
      <Link href={`/patterns/${rec.slug}`} className="reco-chip">
        <span className="reco-id">{rec.id}</span>
        <span className="reco-name">{rec.name}</span>
        {rec.matched_triggers.length ? (
          <span className="evidence-tags">
            {rec.matched_triggers.map((t) => (
              <span key={t} className="evidence-tag">
                {t}
              </span>
            ))}
          </span>
        ) : null}
        <span className="reco-reason">{rec.reason}</span>
      </Link>
    </li>
  );
}

export function FindPattern({ catalog }: { catalog: Recommendable[] }) {
  const [query, setQuery] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<Recommendation[] | null>(null);
  // Keyed remount of the result list so re-running restamps the reveal.
  const [runId, setRunId] = useState(0);

  function run(useCase: string) {
    const trimmed = useCase.trim();
    if (!trimmed) {
      setResults(null);
      setError("Enter a use case before you run the rubric.");
      return;
    }
    setError(null);
    setResults(recommendPattern(catalog, trimmed).recommendations);
    setRunId((n) => n + 1);
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    run(query);
  }

  function onExample(example: string) {
    setQuery(example);
    run(example);
  }

  return (
    <section className="find-pattern" aria-labelledby="find-pattern-heading">
      <h2 id="find-pattern-heading">Find your pattern</h2>
      <ul className="example-row" aria-label="Example use cases">
        {EXAMPLES.map((ex) => (
          <li key={ex}>
            <button
              type="button"
              className="example-chip"
              onClick={() => onExample(ex)}
            >
              {ex}
            </button>
          </li>
        ))}
      </ul>
      <form className="find-form" onSubmit={onSubmit}>
        <input
          id="find-use-case"
          type="text"
          name="use-case"
          aria-labelledby="find-pattern-heading"
          placeholder="…or describe your own"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoComplete="off"
        />
        <button type="submit">Find</button>
      </form>
      <p className="find-caption">
        Runs the same deterministic rubric as the live server — in your browser. No
        model call.
      </p>
      {error ? (
        <p className="error-state" role="status">
          {error}
        </p>
      ) : null}
      {results ? (
        <ul className="chip-list" key={runId}>
          {results.map((rec, i) => (
            <RecoChip key={rec.id} rec={rec} order={i} />
          ))}
        </ul>
      ) : null}
    </section>
  );
}
