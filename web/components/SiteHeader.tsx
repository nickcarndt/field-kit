import Link from "next/link";

export function SiteHeader({ patternCount }: { patternCount: number }) {
  return (
    <header className="site-header">
      <Link href="/" className="wordmark">
        FieldKit
      </Link>
      <div className="site-meta">
        <span>
          Field manual · {patternCount} patterns
        </span>
        <Link href="/assess">Assess</Link>
        <Link href="/connect">Connect</Link>
      </div>
    </header>
  );
}
