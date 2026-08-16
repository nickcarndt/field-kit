import { DocumentSection } from "./DocumentSection";
import { MarkdownBody } from "./MarkdownBody";
import { framingWithoutPlateThesis } from "@/lib/framing";
import { EXPECTED_SECTIONS, type Pattern } from "@/lib/types";

export function PatternDocument({ pattern }: { pattern: Pattern }) {
  const framing = framingWithoutPlateThesis(pattern.framing, pattern.thesis);
  return (
    <article className="pattern-document">
      {framing ? (
        <div className="framing">
          <MarkdownBody source={framing} />
        </div>
      ) : null}
      {EXPECTED_SECTIONS.map((heading) => (
        <DocumentSection key={heading} heading={heading} body={pattern.sections[heading]} />
      ))}
    </article>
  );
}
