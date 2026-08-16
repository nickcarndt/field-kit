import Link from "next/link";
import type { Recommendation } from "@/lib/recommend";

export function WorkedExample({
  prompt,
  recommendations,
}: {
  prompt: string;
  recommendations: Recommendation[];
}) {
  return (
    <section>
      <h2>Worked example</h2>
      <blockquote className="demo-quote">{prompt}</blockquote>
      <ol className="reco-list">
        {recommendations.map((rec) => (
          <li key={rec.id} className="reco">
            <div className="reco-id">{rec.id}</div>
            <Link href={`/patterns/${rec.slug}`}>{rec.name}</Link>
            <p className="plate-thesis">{rec.thesis}</p>
            <p className="reco-reason">{rec.reason}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
