import Link from "next/link";
import { GymLogo } from "@/components/brand/gym-logo";
import { brand, callHref, whatsappLink } from "@/lib/brand";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 px-4 text-center">
      <GymLogo className="h-14 w-14" />
      <p className="font-display text-7xl text-brand-red">404</p>
      <h1 className="text-3xl text-text">This page does not exist</h1>
      <p className="max-w-md text-sm leading-relaxed text-muted">
        The link may be old, or the page may have moved. Head back to the gym home page, or call us
        on {brand.phoneDisplay}.
      </p>
      <div className="flex flex-col gap-3 sm:flex-row">
        <Link
          href="/"
          className="border border-brand-red px-5 py-3 text-[11px] font-bold uppercase tracking-[0.12em] text-text transition-colors hover:bg-brand-red"
        >
          Back to home
        </Link>
        <a
          href={callHref}
          className="border border-line px-5 py-3 text-[11px] font-bold uppercase tracking-[0.12em] text-muted transition-colors hover:border-brand-red hover:text-text"
        >
          Call the gym
        </a>
        <a
          href={whatsappLink("Hi, I could not find what I was looking for on your website.")}
          target="_blank"
          rel="noopener noreferrer"
          className="border border-line px-5 py-3 text-[11px] font-bold uppercase tracking-[0.12em] text-muted transition-colors hover:border-brand-red hover:text-text"
        >
          WhatsApp
        </a>
      </div>
    </main>
  );
}