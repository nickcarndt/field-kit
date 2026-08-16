import Link from "next/link";
import { KillsStamp } from "./KillsStamp";
import type { Pattern } from "@/lib/types";

function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

export function SpecPlate({
  pattern,
  href,
  heading = false,
  index,
  total,
}: {
  pattern: Pattern;
  href?: string;
  heading?: boolean;
  index: number;
  total: number;
}) {
  const Name = heading ? "h1" : "span";
  const inner = (
    <>
      <div className="plate-id-block">
        <span className="catalog-badge">{pattern.id}</span>
        <span className="plate-index">
          {pad2(index)} / {pad2(total)}
        </span>
      </div>
      <hr className="plate-rule" />
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
