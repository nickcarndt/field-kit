import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AssessmentForm } from "@/components/AssessmentForm";
import { assessmentPattern, instrumentComplete } from "@/lib/assess";
import { loadCatalog } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "Readiness assessment",
  description:
    "Score a practice across delivery, evals, governance, and Claude fluency — twelve anchored statements, a maturity profile, and a roadmap that routes each gap to a FieldKit pattern.",
};

export default function AssessPage() {
  const catalog = loadCatalog();
  const assessment = assessmentPattern(catalog);

  // The cut rule, enforced: no complete instrument in the content, no page.
  if (!instrumentComplete(assessment)) {
    notFound();
  }

  return (
    <div className="library assess">
      <h1 className="library-dek">Are we actually ready?</h1>
      <p className="assess-lede">
        Twelve statements, each scored 0–3 against the anchors below. The
        instrument comes verbatim from{" "}
        <a href={`/patterns/${assessment.slug}`}>FK-05</a>, the scoring runs in
        your browser with the same bands as the live server, and a weak practice
        must score weak — that is the point.
      </p>
      <AssessmentForm assessment={assessment} catalog={catalog} />
    </div>
  );
}
