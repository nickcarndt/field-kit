import type { Metadata } from "next";
import { ErrorState } from "@/components/ErrorState";

export const metadata: Metadata = {
  title: "Not in the catalog",
};

export default function NotFound() {
  return (
    <div className="not-found">
      <ErrorState>This pattern is not in the catalog.</ErrorState>
    </div>
  );
}
