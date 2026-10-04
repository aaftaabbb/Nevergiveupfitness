import type { Metadata } from "next";
import Link from "next/link";
import { Check, ChevronDown } from "lucide-react";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { ContactFloaters } from "@/components/site/contact-floaters";
import { SectionHeading } from "@/components/site/section-heading";
import { listPublicPlans } from "@/lib/dal/public";
import { brand, callHref, whatsappLink } from "@/lib/brand";
import { formatRupees } from "@/lib/format";

/** Same interval as the home page, so plan edits appear without a redeploy. */
export const revalidate = 300;

export const metadata: Metadata = {
  title: "Membership plans and pricing",
  description: `${brand.name} membership plans in Tungarphata, Vasai East. Month to month and longer plans, all with 24/7 access and air conditioned floors.`,
  alternates: { canonical: "/pricing" },
};

export default async function PricingPage() {
  const plans = await listPublicPlans();
  const monthlyPrice = plans.find((plan) => plan.months === 1)?.price ?? 0;

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: brand.faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: { "@type": "Answer", text: faq.answer },
    })),
  };

  return (
    <>
      <SiteHeader />

      <main className="flex-1">
        <section className="border-b border-white/5">
          <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
            <SectionHeading
              eyebrow="Memberships"
              title="Plans and pricing"
              description="Every plan includes 24/7 access, the air conditioned floor and hi-tech equipment. Longer plans work out cheaper per month."
            />

            {plans.length === 0 ? (
              <div className="card mt-10 p-6">
                <h3 className="text-2xl text-text">Current prices on the floor</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  The online price board is being updated. Call or WhatsApp and we will send you the
                  plans straight away, with no obligation.
                </p>
                <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                  <a
                    href={callHref}
                    className="rounded-chip border border-brand-red px-5 py-3 text-center text-[11px] font-bold uppercase tracking-[0.12em] text-text transition-colors hover:bg-brand-red"
                  >
                    Call {brand.phoneDisplay}
                  </a>
                  <a
                    href={whatsappLink("Hi, please send me the current membership plans and prices.")}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-chip border border-white/10 px-5 py-3 text-center text-[11px] font-bold uppercase tracking-[0.12em] text-text transition-colors hover:border-brand-red"
                  >
                    WhatsApp for prices
                  </a>
                </div>
              </div>
            ) : (
              <ul className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {plans.map((plan) => {
                  const fullPrice = monthlyPrice * plan.months;
                  const saving = fullPrice > 0 ? fullPrice - plan.price : 0;
                  const perMonth = plan.months > 0 ? Math.round(plan.price / plan.months) : 0;

                  return (
                    <li
                      key={plan.id}
                      className={`card lift relative flex flex-col p-6 ${
                        plan.includesFreeTrainingMonth ? "card-emphasis" : ""
                      }`}
                    >
                      {plan.includesFreeTrainingMonth ? (
                        <span className="absolute -top-3 left-6 rounded-chip bg-brand-red px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-text shadow-[0_10px_24px_-10px_rgb(227_30_36/0.9)]">
                          Most popular
                        </span>
                      ) : null}
                      <h2 className="text-3xl text-text">{plan.name}</h2>
                      <p className="mt-1 text-[11px] font-bold uppercase tracking-[0.14em] text-muted">
                        {plan.months} month{plan.months === 1 ? "" : "s"}
                      </p>

                      <p className="mt-5 font-display text-5xl text-brand-gold">
                        {formatRupees(plan.price)}
                      </p>
                      {plan.months > 1 ? (
                        <p className="mt-1 text-xs text-muted">
                          {formatRupees(perMonth)} per month
                        </p>
                      ) : null}

                      {saving > 0 ? (
                        <p className="mt-3 inline-block rounded-chip border border-status-active/40 bg-status-active/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-status-active">
                          Save {formatRupees(saving)} vs month to month
                        </p>
                      ) : null}

                      {plan.highlight ? (
                        <p className="mt-4 text-sm leading-relaxed text-text">{plan.highlight}</p>
                      ) : null}

                      {plan.includesFreeTrainingMonth ? (
                        <p className="mt-4 rounded-chip border border-brand-gold/30 bg-brand-gold/10 px-3 py-2 text-xs leading-relaxed text-brand-gold">
                          Free 1 month personal training, written diet plan, body analysis and fitness
                          test.
                        </p>
                      ) : null}

                      {plan.features.length > 0 ? (
                        <ul className="mt-4 flex-1 space-y-2">
                          {plan.features.map((feature) => (
                            <li key={feature} className="flex gap-2 text-xs text-muted">
                              <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-red" aria-hidden />
                              {feature}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <ul className="mt-4 flex-1 space-y-2">
                          {brand.facilityHighlights.map((highlight) => (
                            <li key={highlight} className="flex gap-2 text-xs text-muted">
                              <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-red" aria-hidden />
                              {highlight}
                            </li>
                          ))}
                        </ul>
                      )}

                      <div className="mt-6 flex flex-col gap-2">
                        <a
                          href={whatsappLink(
                            `Hi ${brand.name}, I am interested in the ${plan.name} plan (${plan.months} months, ${formatRupees(plan.price)}). Is it available?`,
                          )}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`w-full rounded-chip px-4 py-3 text-center text-[11px] font-bold uppercase tracking-[0.12em] transition-colors ${
                            plan.includesFreeTrainingMonth
                              ? "bg-brand-gold text-ink hover:bg-[#e0c400]"
                              : "bg-brand-red text-text hover:bg-brand-red-dark"
                          }`}
                        >
                          Enquire about this plan
                        </a>
                        <Link
                          href="/#enquiry"
                          className="w-full rounded-chip border border-white/10 bg-white/[0.02] px-4 py-3 text-center text-[11px] font-bold uppercase tracking-[0.12em] text-muted transition-colors hover:border-brand-red hover:text-text"
                        >
                          Request a free trial
                        </Link>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}

            <p className="mt-8 max-w-3xl text-xs leading-relaxed text-muted">
              Prices exclude anything not listed on the plan. Personal training sessions outside the
              free month are charged separately, and the price is agreed with you before the first
              session. {brand.promo.note}
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
          <SectionHeading eyebrow="Questions" title="Before you join" />
          <div className="mt-8 space-y-3">
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
      </main>

      <SiteFooter />
      <ContactFloaters />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
    </>
  );
}