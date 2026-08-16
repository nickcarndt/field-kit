import { PROSPECTUS_URL, VERITY_URL } from "@/lib/site";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      Built by Nick Arndt · Patterns proven in{" "}
      <a href={VERITY_URL} rel="noreferrer" target="_blank">
        Verity
      </a>{" "}
      and{" "}
      <a href={PROSPECTUS_URL} rel="noreferrer" target="_blank">
        Prospectus
      </a>{" "}
      · Field notes welcome.
    </footer>
  );
}
