"use client";

import { isValidElement, useState, type ReactNode } from "react";

function textOf(node: ReactNode): string {
  if (node == null || typeof node === "boolean") return "";
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(textOf).join("");
  if (isValidElement<{ children?: ReactNode }>(node)) {
    return textOf(node.props.children);
  }
  return "";
}

export function CodeBlock({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<"idle" | "copied" | "failed">("idle");
  const text = textOf(children).replace(/\n$/, "");

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setStatus("copied");
    } catch {
      setStatus("failed");
    }
  }

  return (
    <div className="code-block">
      <div className="code-block-bar">
        <button type="button" onClick={copy}>
          {status === "copied" ? "Copied" : "Copy"}
        </button>
      </div>
      <pre>{children}</pre>
      {status === "failed" ? (
        <p className="code-block-status" role="status">
          Copy failed. Select the block and copy it yourself.
        </p>
      ) : null}
    </div>
  );
}
