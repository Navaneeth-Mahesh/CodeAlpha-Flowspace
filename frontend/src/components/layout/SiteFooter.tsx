import { Logo } from "@/components/common/Logo";

const FOOTER_LINKS = {
  Product: ["Features", "Views", "Pricing", "Changelog"],
  Company: ["About", "Careers", "Contact"],
  Legal: ["Privacy", "Terms", "Security"],
};

export function SiteFooter() {
  return (
    <footer className="border-t border-[var(--color-border)] bg-[var(--color-bg)]">
      <div className="mx-auto max-w-6xl px-6 py-14">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-4">
          <div className="col-span-2 md:col-span-1">
            <Logo />
            <p className="mt-3 text-sm text-[var(--color-text-muted)]">
              Plan, track, and ship work without losing the thread.
            </p>
          </div>
          {Object.entries(FOOTER_LINKS).map(([heading, links]) => (
            <div key={heading}>
              <p className="text-sm font-medium text-[var(--color-text)]">{heading}</p>
              <ul className="mt-3 flex flex-col gap-2">
                {links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 flex flex-col items-start justify-between gap-4 border-t border-[var(--color-border)] pt-6 text-xs text-[var(--color-text-muted)] sm:flex-row sm:items-center">
          <p>&copy; {new Date().getFullYear()} Flowspace, Inc. All rights reserved.</p>
          <p className="font-[var(--font-mono)]">v0.1.0</p>
        </div>
      </div>
    </footer>
  );
}
