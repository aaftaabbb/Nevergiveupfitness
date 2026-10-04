import Link from "next/link";
import { ArrowRight, Check, ChevronDown, Clock, Dumbbell, MapPin, ShieldCheck, Sparkles, Zap } from "lucide-react";
import { GymLogo } from "@/components/brand/gym-logo";
import { ButtonLink } from "@/components/ui/button";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { ContactFloaters } from "@/components/site/contact-floaters";
import { EnquiryForm } from "@/components/site/enquiry-form";
import { SectionHeading } from "@/components/site/section-heading";
import { PhotoSlot } from "@/components/site/photo-slot";
import { listPublicPlans } from "@/lib/dal/public";
import {
  brand,
  callHref,
  googleMapDirectionsUrl,
  googleMapEmbedUrl,
  instagramUrl,
  whatsappLink,
} from "@/lib/brand";
import { formatRupees } from "@/lib/format";

/**
 * Prices come from MongoDB, so the page is revalidated on an interval instead
 * of being frozen at build time. A change in the admin panel shows up on the
 * site within five minutes without a redeploy.
 */
export const revalidate = 300;

export const metadata = {
  title: `${brand.name} | 24/7 Gym in Tungarphata, Vasai East`,
  description: `${brand.positioning}. Air conditioned floor, hi-tech equipment, personal training, diet counselling and the in-house Right Nutrition Café. ${brand.promo.headline}.`,
  alternates: { canonical: "/" },
};

const whyItems = [
  {
    icon: Clock,
    title: "Open when your shift ends",
    detail: "24 hours, all 7 days. Night shift, early gym, or a 10 pm session. Your card never sleeps.",
  },
  {
    icon: Zap,
    title: "Equipment that is maintained",
    detail: "Hi-tech machines and a free weight floor, serviced on a schedule instead of after a breakdown.",
  },
  {
    icon: ShieldCheck,
    title: "A written plan, not a guess",
    detail: "Body analysis, fitness test and a diet plan you can actually follow at home.",
  },
  {
    icon: Sparkles,
    title: "Eat without breaking the diet",
    detail: "Right Nutrition Café sits inside the gym, so a high protein meal is a walk, not an excuse.",
  },
];

export default async function HomePage() {
  const plans = await listPublicPlans();
  const monthlyPrice = plans.find((plan) => plan.months === 1)?.price ?? 0;

  return (
    <>
      <SiteHeader />

      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden border-b border-white/5">
          {/* Ambient light and a faint grid, purely decorative. */}
          <div className="pointer-events-none absolute inset-0" aria-hidden>
            <div className="absolute -left-28 top-0 h-80 w-80 rounded-full bg-brand-red/20 blur-3xl" />
            <div className="absolute -right-24 top-10 h-72 w-72 rounded-full bg-brand-gold/10 blur-3xl" />
            <div
              className="absolute inset-0"
              style={{
                backgroundImage:
                  "linear-gradient(to right, rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.04) 1px, transparent 1px)",
                backgroundSize: "72px 72px",
                maskImage: "radial-gradient(75% 60% at 50% 0%, black, transparent)",
                WebkitMaskImage: "radial-gradient(75% 60% at 50% 0%, black, transparent)",
              }}
            />
          </div>

          <div className="relative mx-auto max-w-6xl px-4 pb-20 pt-14 sm:px-6 sm:pb-24 sm:pt-20">
            <div className="grid gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
              <div>
                <span className="eyebrow">{brand.positioning}</span>

                <h1 className="mt-6 text-5xl sm:text-7xl">
                  Never give up.
                  <br />
                  <span className="bg-gradient-to-r from-brand-red via-brand-red to-brand-gold bg-clip-text text-transparent">
                    Strength &amp; devotion.
                  </span>
                </h1>

                <p className="mt-6 max-w-xl text-base leading-relaxed text-muted">
                  A 24 hour, fully air conditioned gym in Tungarphata with hi-tech equipment,
                  personal training from a certified trainer, diet counselling, and a high protein
                  café inside the building. {brand.hours}.
                </p>

                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <ButtonLink href="#enquiry" size="lg">
                    Request a free trial
                    <ArrowRight className="h-4 w-4" aria-hidden />
                  </ButtonLink>
                  <ButtonLink
                    href={whatsappLink(
                      `Hi ${brand.name}, I want to know about membership and a free trial.`,
                    )}
                    variant="ghost"
                    size="lg"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    WhatsApp the gym
                  </ButtonLink>
                </div>

                <ul className="mt-10 flex flex-wrap gap-2">
                  {brand.facilityHighlights.map((highlight) => (
                    <li
                      key={highlight}
                      className="rounded-chip border border-white/10 bg-white/[0.03] px-3.5 py-2 text-[11px] font-bold uppercase tracking-[0.14em] text-muted"
                    >
                      {highlight}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="relative">
                <PhotoSlot
                  label="Gym floor photo"
                  className="aspect-[4/5] w-full shadow-[0_34px_80px_-34px_rgba(0,0,0,0.95)]"
                />
                <div className="glass absolute -bottom-5 left-4 right-4 flex items-center gap-3 px-4 py-3 sm:left-6 sm:right-auto sm:max-w-64">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-chip bg-brand-red/15 text-brand-red">
                    <Dumbbell className="h-5 w-5" aria-hidden />
                  </span>
                  <p className="text-xs leading-snug text-muted">
                    <span className="block font-bold uppercase tracking-[0.12em] text-text">
                      1st 24/7 gym
                    </span>
                    in Tungarphata &amp; Sativali
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Offer band */}
        <section className="relative z-10 -mt-6 px-4 sm:-mt-8 sm:px-6">
          <div className="mx-auto max-w-6xl">
            <div className="card card-emphasis flex flex-col gap-5 p-6 sm:p-7 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-brand-red">
                  {brand.promo.eyebrow}
                </p>
                <p className="mt-2 font-display text-3xl text-text sm:text-4xl">
                  {brand.promo.headline}
                </p>
              </div>
              <ul className="flex flex-wrap gap-2">
                {brand.promo.points.map((point) => (
                  <li
                    key={point}
                    className="rounded-chip border border-brand-red/30 bg-brand-red/10 px-3 py-2 text-[11px] font-bold uppercase tracking-[0.1em] text-text"
                  >
                    {point}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Why us */}
        <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
          <SectionHeading
            eyebrow="Why members stay"
            title="A gym that works around your life"
            description="Most people quit because the gym is inconvenient or the plan was never written down. Both are fixed here."
          />
          <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2">
            {whyItems.map((item) => {
              const Icon = item.icon;
              return (
                <article key={item.title} className="card lift p-6">
                  <span className="icon-chip">
                    <Icon className="h-5 w-5" aria-hidden />
                  </span>
                  <h3 className="mt-5 text-2xl text-text">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">{item.detail}</p>
                </article>
              );
            })}
          </div>
        </section>

        {/* Services */}
        <section id="services" className="border-y border-white/5 bg-surface/40 scroll-mt-20">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
            <SectionHeading
              eyebrow="On the floor"
              title="Services"
              description="Everything the gym trains, from a first timer walking in to a powerlifter chasing a total."
            />

            <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {brand.services.map((service) => (
                <article key={service.name} className="card lift flex flex-col p-6">
                  <h3 className="text-2xl text-text">{service.name}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">{service.detail}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Programs */}
        <section id="programs" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-16 sm:px-6 sm:py-20">
          <SectionHeading
            eyebrow="Structured programs"
            title="PCOD / PCOS and diabetes reversal"
            description="These run as tracked programs rather than generic memberships, because the plan and the food have to follow the condition."
          />

          <div className="mt-10 grid grid-cols-1 gap-5 lg:grid-cols-2">
            {brand.programmes.map((programme) => (
              <article key={programme.name} className="card card-emphasis lift p-7">
                <h3 className="text-3xl text-text">{programme.name}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted">{programme.detail}</p>
              </article>
            ))}
          </div>

          <p className="mt-6 text-xs leading-relaxed text-muted">
            Training and nutrition guidance is not a substitute for medical care. Members in these
            programs are advised to keep following their doctor and share test reports at each
            review.
          </p>
        </section>

        {/* Trainer */}
        <section className="border-y border-white/5 bg-surface/40">
          <div className="mx-auto grid max-w-6xl grid-cols-1 gap-10 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-2 lg:items-center">
            <div>
              <SectionHeading eyebrow="Your trainer" title={brand.trainer.name} />
              <p className="mt-4 text-sm leading-relaxed text-muted">
                {brand.trainer.role} at {brand.name}. {brand.trainer.note}
              </p>
              <ul className="mt-6 grid grid-cols-1 gap-2 sm:grid-cols-2">
                {brand.trainer.certifications.map((certification) => (
                  <li
                    key={certification}
                    className="flex items-center gap-2.5 rounded-chip border border-white/8 bg-white/[0.03] px-4 py-3 text-sm text-text"
                  >
                    <ShieldCheck className="h-4 w-4 shrink-0 text-brand-red" aria-hidden />
                    {certification}
                  </li>
                ))}
              </ul>
              <div className="mt-8 flex flex-wrap gap-3">
                <ButtonLink href={callHref} variant="outline">
                  Call the gym
                </ButtonLink>
                <ButtonLink
                  href={instagramUrl}
                  variant="ghost"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Instagram @{brand.instagramHandle}
                </ButtonLink>
              </div>
            </div>
            <PhotoSlot
              label="Trainer photo"
              className="aspect-[4/3] w-full shadow-[0_34px_80px_-34px_rgba(0,0,0,0.95)]"
            />
          </div>
        </section>

        {/* Pricing teaser */}
        <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <SectionHeading
              eyebrow="Memberships"
              title="Straightforward pricing"
              description={
                monthlyPrice > 0
                  ? "Plans run month to month or longer. Longer plans cost less per month, and the yearly plan carries the free personal training month."
                  : "Call or WhatsApp for current plans. The price board is also on the pricing page."
              }
            />
            <Link
              href="/pricing"
              className="inline-flex shrink-0 items-center gap-2 rounded-chip border border-brand-red/60 bg-brand-red/10 px-5 py-3 text-[11px] font-bold uppercase tracking-[0.12em] text-text transition-colors hover:bg-brand-red"
            >
              See all plans
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>

          {plans.length > 0 ? (
            <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {plans.map((plan) => {
                const featured = plan.includesFreeTrainingMonth;
                const perMonth = Math.round(plan.price / plan.months);
                return (
                  <article
                    key={plan.id}
                    className={`card lift relative flex flex-col p-6 ${
                      featured ? "card-emphasis" : ""
                    }`}
                  >
                    {featured ? (
                      <span className="absolute -top-3 left-6 rounded-chip bg-brand-red px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-text shadow-[0_10px_24px_-10px_rgb(227_30_36/0.9)]">
                        Most popular
                      </span>
                    ) : null}

                    <h3 className="text-2xl text-text">{plan.name}</h3>
                    <p className="mt-1 text-[11px] font-bold uppercase tracking-[0.14em] text-muted">
                      {plan.months} month{plan.months === 1 ? "" : "s"}
                    </p>

                    <p className="mt-5 font-display text-4xl text-brand-gold">
                      {formatRupees(plan.price)}
                    </p>
                    <p className="mt-1 text-xs text-muted">
                      {formatRupees(perMonth)} per month
                    </p>

                    {plan.highlight ? (
                      <p className="mt-4 text-xs leading-relaxed text-muted">{plan.highlight}</p>
                    ) : null}
                    {featured ? (
                      <p className="mt-4 rounded-chip border border-brand-gold/30 bg-brand-gold/10 px-3 py-2 text-xs leading-relaxed text-brand-gold">
                        Free PT month, diet plan, body analysis and fitness test
                      </p>
                    ) : null}
                  </article>
                );
              })}
            </div>
          ) : null}
        </section>

        {/* Cafe */}
        <section id="cafe" className="scroll-mt-20 border-y border-white/5 bg-surface/40">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
            <SectionHeading
              eyebrow="Inside the gym"
              title={brand.cafe.name}
              description={brand.cafe.intro}
            />
            <div className="mt-10 grid grid-cols-1 gap-5 lg:grid-cols-3">
              {brand.cafe.items.map((item) => (
                <article key={item.name} className="card lift p-6">
                  <h3 className="text-2xl text-text">{item.name}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">{item.detail}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="mx-auto max-w-3xl scroll-mt-20 px-4 py-16 sm:px-6 sm:py-20">
          <SectionHeading eyebrow="Questions" title="Straight answers" />
          <div className="mt-10 space-y-3">
            {brand.faqs.map((faq) => (
              <details key={faq.question} className="card group p-5">
                <summary className="flex cursor-pointer items-center justify-between gap-4 text-lg text-text marker:hidden">
                  {faq.question}
                  <ChevronDown
                    className="h-5 w-5 shrink-0 text-brand-red transition-transform duration-200 group-open:rotate-180"
                    aria-hidden
                  />
                </summary>
                <p className="mt-3 border-t border-white/5 pt-3 text-sm leading-relaxed text-muted">
                  {faq.answer}
                </p>
              </details>
            ))}
          </div>
        </section>

        {/* Location */}
        <section className="border-y border-white/5 bg-surface/40">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
            <SectionHeading
              eyebrow="Find us"
              title={brand.area}
              description={`${brand.address.line1}, ${brand.address.line2}. ${brand.hours}.`}
            />

            <div className="mt-10 grid grid-cols-1 gap-5 lg:grid-cols-[1fr_1.2fr]">
              <div className="card p-6">
                <ul className="space-y-4 text-sm text-muted">
                  <li className="flex gap-3">
                    <MapPin className="h-4 w-4 shrink-0 text-brand-red" aria-hidden />
                    <span>
                      {brand.address.line1}
                      <br />
                      {brand.address.line2}
                      <br />
                      {brand.address.line3}
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <Clock className="h-4 w-4 shrink-0 text-brand-red" aria-hidden />
                    <span>{brand.hours}</span>
                  </li>
                  <li className="flex gap-3">
                    <GymLogo className="h-4 w-4 shrink-0" />
                    <a href={callHref} className="text-brand-red hover:underline">
                      {brand.phoneDisplay}
                    </a>
                  </li>
                </ul>
                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                  <ButtonLink href={googleMapDirectionsUrl()} variant="outline" target="_blank" rel="noopener noreferrer">
                    Get directions
                  </ButtonLink>
                  <ButtonLink
                    href={whatsappLink(
                      `Hi ${brand.name}, I would like to visit and try a free session. When can I come?`,
                    )}
                    variant="ghost"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Ask about a visit
                  </ButtonLink>
                </div>
              </div>

              <div className="overflow-hidden rounded-card border border-white/10 shadow-card">
                <iframe
                  title={`Map showing ${brand.name} in ${brand.area}`}
                  src={googleMapEmbedUrl()}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="h-full min-h-80 w-full"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Enquiry */}
        <section id="enquiry" className="scroll-mt-20">
          <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-2 lg:items-start">
            <div>
              <SectionHeading
                eyebrow="Free trial"
                title="Come and try before you join"
                description="Send your number and the owner calls you back, then you train a session at no cost. No payment needed to visit."
              />
              <ul className="mt-8 space-y-3">
                {[
                  "Body analysis and fitness test on your first visit",
                  "A written workout and diet plan after the trial",
                  "No joining fee pressure. You decide after you have trained with us",
                ].map((point) => (
                  <li
                    key={point}
                    className="flex items-start gap-3 rounded-chip border border-white/8 bg-white/[0.03] px-4 py-3 text-sm text-muted"
                  >
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand-red" aria-hidden />
                    {point}
                  </li>
                ))}
              </ul>
            </div>
            <EnquiryForm />
          </div>
        </section>
      </main>

      <SiteFooter />
      <ContactFloaters />
    </>
  );
}