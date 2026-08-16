import Link from "next/link";
import { KillsStamp } from "./KillsStamp";
import type { Pattern } from "@/lib/types";

export function SpecPlate({
  pattern,
  href,
  heading = false,
}: {
  pattern: Pattern;
  href?: string;
  heading?: boolean;
}) {
  const Name = heading ? "h1" : "span";
  const inner = (
    <>
      <span className="catalog-badge">{pattern.id}</span>
      <Name className="plate-name">{pattern.name}</Name>
      <span className="plate-thesis">{pattern.thesis}</span>
      <KillsStamp kills={pattern.kills} />
    </>
  );

  if (href) {
    return (
      <Link href={href} className="spec-plate">
        {inner}
      </Link>
    );
  }

  return <div className="spec-plate">{inner}</div>;
}
