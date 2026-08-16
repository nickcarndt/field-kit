import type { ReactNode } from "react";

export function ErrorState({ children }: { children: ReactNode }) {
  return (
    <p className="error-state" role="status">
      {children}
    </p>
  );
}
