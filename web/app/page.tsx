import type { Metadata } from "next";
import { EmptyState } from "@/components/EmptyState";
import { SpecPlate } from "@/components/SpecPlate";
import { loadCatalog } from "@/lib/catalog";
import { LIBRARY_DEK, SITE_DESCRIPTION } from "@/lib/site";

export const metadata: Metadata = {
  title: { absolute: "FieldKit" },
  description: SITE_DESCRIPTION,
};

export default function LibraryPage() {
  const patterns = loadCatalog();
  return (
    <div className="library">
      <h1 className="library-dek">{LIBRARY_DEK}</h1>
      {patterns.length ? (
        <ul className="plate-stack">
          {patterns.map((pattern) => (
            <li key={pattern.id}>
              <SpecPlate pattern={pattern} href={`/patterns/${pattern.slug}`} />
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
