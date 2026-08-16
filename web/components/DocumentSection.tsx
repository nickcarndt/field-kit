import type { ReactNode } from "react";
import { MarkdownBody } from "./MarkdownBody";

export function DocumentSection({
  heading,
  body,
  children,
}: {
  heading: string;
  body: string;
  children?: ReactNode;
}) {
  return (
    <section className="document-section">
      <h2>{heading}</h2>
      {children}
      <MarkdownBody source={body} />
    </section>
  );
}
