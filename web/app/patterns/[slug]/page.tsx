import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Citations } from "@/components/Citations";
import { ExemplarLinks } from "@/components/ExemplarLinks";
import { PatternDocument } from "@/components/PatternDocument";
import { SpecPlate } from "@/components/SpecPlate";
import { getPatternBySlug, loadCatalog } from "@/lib/catalog";

export const dynamicParams = false;

export function generateStaticParams() {
  return loadCatalog().map((pattern) => ({ slug: pattern.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const pattern = getPatternBySlug(slug);
  if (!pattern) return { title: "Not in the catalog" };
  return {
    title: `${pattern.id} · ${pattern.name}`,
    description: pattern.thesis,
  };
}

export default async function PatternPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const pattern = getPatternBySlug(slug);
  if (!pattern) notFound();

  return (
    <div className="pattern-page">
      <header className="pattern-chrome">
        <SpecPlate pattern={pattern} heading />
        <p className="pattern-meta">
          {pattern.taxonomy}
          {" · "}
          <ExemplarLinks exemplars={pattern.exemplars} />
        </p>
      </header>
      <PatternDocument pattern={pattern} />
      <Citations entries={pattern.grounded_in} />
    </div>
  );
}
