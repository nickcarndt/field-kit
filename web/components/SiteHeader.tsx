import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="site-header">
      <Link href="/" className="wordmark">
        FieldKit
      </Link>
      <nav className="site-nav" aria-label="Site">
        <Link href="/connect">Connect</Link>
      </nav>
    </header>
  );
}
