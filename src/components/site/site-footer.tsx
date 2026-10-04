import Link from "next/link";
import { GymLogoLockup } from "@/components/brand/gym-logo";
import {
  addressOneLine,
  brand,
  callHref,
  googleMapDirectionsUrl,
  instagramUrl,
  whatsappLink,
} from "@/lib/brand";

const FOOTER_LINKS = [
  { href: "/#services", label: "Services" },
  { href: "/#programs", label: "Programs" },
  { href: "/pricing", label: "Pricing" },
  { href: "/#cafe", label: "Right Nutrition Café" },
  { href: "/#faq", label: "FAQ" },
  { href: "/contact", label: "Contact" },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-white/5 bg-surface/40">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-10 px-4 py-14 sm:px-6 md:grid-cols-3">
        <div>
          <GymLogoLockup />
          <p className="mt-4 text-sm leading-relaxed text-muted">
            {brand.positioning}. {brand.hours}.
          </p>
          <p className="mt-4 text-sm text-muted">
            Trained by {brand.trainer.name}, {brand.trainer.certifications.join(", ")}.
          </p>
        </div>

        <nav aria-label="Footer">
          <h2 className="text-xl text-text">Explore</h2>
          <ul className="mt-4 space-y-1">
            {FOOTER_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="inline-block rounded px-2 py-1.5 text-sm text-muted transition-colors hover:bg-white/[0.05] hover:text-text"
                >
                  {link.label}
                </Link>
              </li>
            ))}
            <li>
              <Link
                href="/admin/login"
                className="inline-block rounded px-2 py-1.5 text-sm text-muted transition-colors hover:bg-white/[0.05] hover:text-text"
              >
                Owner login
              </Link>
            </li>
          </ul>
        </nav>

        <div>
          <h2 className="text-xl text-text">Visit us</h2>
          <address className="mt-4 text-sm not-italic leading-relaxed text-muted">
            {brand.address.line1}
            <br />
            {brand.address.line2}
            <br />
            {brand.address.line3}
          </address>
          <ul className="mt-4 space-y-2 text-sm">
            <li>
              <a href={callHref} className="text-brand-red hover:underline">
                {brand.phoneDisplay}
              </a>
            </li>
            <li>
              <a
                href={whatsappLink("Hi, I want to know about membership at Never Give Up Fitness.")}
                target="_blank"
                rel="noopener noreferrer"
                className="text-status-active hover:underline"
              >
                WhatsApp us
              </a>
            </li>
            <li>
              <a
                href={instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted hover:text-text"
              >
                Instagram @{brand.instagramHandle}
              </a>
            </li>
            <li>
              <a
                href={googleMapDirectionsUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted hover:text-text"
              >
                Get directions
              </a>
            </li>
          </ul>
          <p className="mt-4 text-xs text-muted">{brand.hours}</p>
        </div>
      </div>

      <div className="border-t border-white/5 px-4 py-6 sm:px-6">
        <p className="mx-auto max-w-6xl text-xs text-muted">
          © {new Date().getFullYear()} {brand.name}. {addressOneLine}.
        </p>
      </div>
    </footer>
  );
}