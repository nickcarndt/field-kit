import type { Metadata } from "next";
import { EmptyState } from "@/components/EmptyState";
import { FindPattern } from "@/components/FindPattern";
import { SpecPlate } from "@/components/SpecPlate";
import { loadCatalog } from "@/lib/catalog";
import { toRecommendable } from "@/lib/recommend";
import { LIBRARY_DEK, SITE_DESCRIPTION } from "@/lib/site";

export const metadata: Metadata = {
  title: { absolute: "FieldKit" },
  description: SITE_DESCRIPTION,
};

export default function LibraryPage() {
  const patterns = loadCatalog();
  const total = patterns.length;
  return (
    <div className="library">
      <h1 className="library-dek">{LIBRARY_DEK}</h1>
      <FindPattern catalog={patterns.map(toRecommendable)} />
      {total ? (
        <ul className="plate-stack">
          {patterns.map((pattern, i) => (
            <li key={pattern.id}>
              <SpecPlate
                pattern={pattern}
                href={`/patterns/${pattern.slug}`}
                index={i + 1}
                total={total}
              />
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState>
          No patterns loaded. The build should have failed before this page reached a
          browser.
        </EmptyState>
      )}
    </div>
  );
}
