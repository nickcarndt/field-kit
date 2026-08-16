import type { Exemplar } from "@/lib/types";

export function ExemplarLinks({ exemplars }: { exemplars: Exemplar[] }) {
  return (
    <ul className="exemplar-list">
      {exemplars.map((ex) => (
        <li key={ex.name}>
          {ex.url ? (
            <a href={ex.url} rel="noreferrer" target="_blank">
              {ex.name}
            </a>
          ) : (
            ex.name
          )}
        </li>
      ))}
    </ul>
  );
}
