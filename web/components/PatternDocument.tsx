import { DocumentSection } from "./DocumentSection";
import { FlowDiagram } from "./FlowDiagram";
import { MarkdownBody } from "./MarkdownBody";
import { DIAGRAMS } from "@/lib/diagrams";
import { framingWithoutPlateThesis } from "@/lib/framing";
import { EXPECTED_SECTIONS, type Pattern } from "@/lib/types";

export function PatternDocument({ pattern }: { pattern: Pattern }) {
  const framing = framingWithoutPlateThesis(pattern.framing, pattern.thesis);
  const diagram = DIAGRAMS[pattern.id];
  return (
    <article className="pattern-document">
      {framing ? (
        <div className="framing">
          <MarkdownBody source={framing} />
        </div>
      ) : null}
      {EXPECTED_SECTIONS.map((heading) => (
        <DocumentSection key={heading} heading={heading} body={pattern.sections[heading]}>
          {heading === "Architecture" && diagram ? (
            <FlowDiagram diagram={diagram} />
          ) : null}
        </DocumentSection>
      ))}
    </article>
  );
}
