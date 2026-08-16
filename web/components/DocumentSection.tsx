import { MarkdownBody } from "./MarkdownBody";

export function DocumentSection({ heading, body }: { heading: string; body: string }) {
  return (
    <section className="document-section">
      <h2>{heading}</h2>
      <MarkdownBody source={body} />
    </section>
  );
}
