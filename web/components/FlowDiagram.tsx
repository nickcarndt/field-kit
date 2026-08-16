import type { Diagram } from "@/lib/diagrams";

export function FlowDiagram({ diagram }: { diagram: Diagram }) {
  return (
    <figure className="flow-diagram">
      <ol className="flow">
        {diagram.steps.map((step) => (
          <li key={step.label}>
            <span className="flow-node">
              <span className="flow-label">{step.label}</span>
              {step.detail ? <span className="flow-detail">{step.detail}</span> : null}
            </span>
          </li>
        ))}
      </ol>
      <figcaption className="flow-caption">
        <span className="flow-fig">Fig. 1 — {diagram.caption}</span>
        <span className="flow-note">{diagram.note}</span>
      </figcaption>
    </figure>
  );
}
