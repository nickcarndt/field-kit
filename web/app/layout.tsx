import type { ReactNode } from "react";
import type { Metadata, Viewport } from "next";
import Link from "next/link";
import { plexMono, plexSans, sourceSerif } from "./fonts";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { loadCatalog } from "@/lib/catalog";
import { SITE_DESCRIPTION } from "@/lib/site";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: {
    default: "FieldKit",
    template: "%s · FieldKit",
  },
  description: SITE_DESCRIPTION,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      className={`${plexSans.variable} ${plexMono.variable} ${sourceSerif.variable}`}
    >
      <body>
        <Link href="#content" className="skip-link">
          Skip to content
        </Link>
        <SiteHeader patternCount={loadCatalog().length} />
        <main id="content" className="site-main">
          {children}
        </main>
        <SiteFooter />
      </body>
    </html>
  );
}
