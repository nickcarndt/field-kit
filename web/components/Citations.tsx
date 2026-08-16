import type { GroundedIn } from "@/lib/types";

export function Citations({ entries }: { entries: GroundedIn[] }) {
  return (
    <aside className="citations">
      <h2>Grounded in</h2>
      <ol>
        {entries.map((entry) => (
          <li key={entry.source}>
            <div className="citation-head">
              {entry.url ? (
                <a href={entry.url} rel="noreferrer" target="_blank">
                  {entry.source}
                </a>
              ) : (
                entry.source
              )}
              {". "}
              {entry.authors}
              {entry.date ? `. ${entry.date}` : ""}
            </div>
            <p className="citation-principle">{entry.principle}</p>
          </li>
        ))}
      </ol>
    </aside>
  );
}
