import type { Metadata } from "next";
import { Camera, Clock, MapPin, MessageCircle, Phone } from "lucide-react";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { ContactFloaters } from "@/components/site/contact-floaters";
import { EnquiryForm } from "@/components/site/enquiry-form";
import { SectionHeading } from "@/components/site/section-heading";
import {
  brand,
  callHref,
  googleMapDirectionsUrl,
  googleMapEmbedUrl,
  instagramUrl,
  whatsappLink,
} from "@/lib/brand";

export const metadata: Metadata = {
  title: "Contact and free trial",
  description: `Visit ${brand.name} in Tungarphata, Vasai East. Call ${brand.phoneDisplay}, WhatsApp us, or send a free trial request and the owner calls you back.`,
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <>
      <SiteHeader />

      <main className="flex-1">
        <section className="border-b border-white/5">
          <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
            <SectionHeading
              eyebrow="Contact"
              title="Come in, call, or WhatsApp"
              description="The fastest way to start is a free trial request. If you would rather talk first, the number below reaches the gym directly."
            />

            <div className="mt-10 grid grid-cols-1 gap-5 lg:grid-cols-[1.1fr_1fr] lg:items-start">
              <div>
                <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <li className="card lift p-5">
                    <span className="icon-chip"><Phone className="h-5 w-5" aria-hidden /></span>
                    <h2 className="mt-3 text-xl text-text">Call the gym</h2>
                    <a
                      href={callHref}
                      className="mt-1 block text-sm text-muted hover:text-text hover:underline"
                    >
                      {brand.phoneDisplay}
                    </a>
                  </li>
                  <li className="card lift p-5">
                    <span className="icon-chip"><MessageCircle className="h-5 w-5" aria-hidden /></span>
                    <h2 className="mt-3 text-xl text-text">WhatsApp</h2>
                    <a
                      href={whatsappLink(
                        `Hi ${brand.name}, I would like a free trial session at the gym.`,
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1 block text-sm text-muted hover:text-text hover:underline"
                    >
                      Send a message
                    </a>
                  </li>
                  <li className="card lift p-5">
                    <span className="icon-chip"><Clock className="h-5 w-5" aria-hidden /></span>
                    <h2 className="mt-3 text-xl text-text">Hours</h2>
                    <p className="mt-1 text-sm text-muted">{brand.hours}</p>
                  </li>
                  <li className="card lift p-5">
                    <span className="icon-chip"><Camera className="h-5 w-5" aria-hidden /></span>
                    <h2 className="mt-3 text-xl text-text">Instagram</h2>
                    <a
                      href={instagramUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1 block text-sm text-muted hover:text-text hover:underline"
                    >
                      @{brand.instagramHandle}
                    </a>
                  </li>
                </ul>

                <div className="card mt-5 p-6">
                  <h2 className="flex items-center gap-2 text-xl text-text">
                    <MapPin className="h-5 w-5 text-brand-red" aria-hidden />
                    Address
                  </h2>
                  <address className="mt-3 text-sm not-italic leading-relaxed text-muted">
                    {brand.address.line1}
                    <br />
                    {brand.address.line2}
                    <br />
                    {brand.address.line3}
                  </address>
                  <a
                    href={googleMapDirectionsUrl()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-5 inline-block rounded-chip border border-brand-red bg-brand-red/10 px-4 py-2.5 text-[11px] font-bold uppercase tracking-[0.12em] text-text transition-colors hover:bg-brand-red"
                  >
                    Get directions
                  </a>
                </div>

                <div className="mt-5 overflow-hidden rounded-card border border-white/10 shadow-card">
                  <iframe
                    title={`Map showing ${brand.name} in ${brand.area}`}
                    src={googleMapEmbedUrl()}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    className="h-80 w-full"
                  />
                </div>
              </div>

              <div>
                <h2 className="text-3xl text-text">Request a free trial</h2>
                <p className="mt-3 text-sm leading-relaxed text-muted">
                  Send your number and {brand.trainer.name.split(" ")[0]} will call you back, usually
                  the same evening. You get a body analysis, a fitness test and a full session at no
                  cost.
                </p>
                <EnquiryForm className="mt-6" />
              </div>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
      <ContactFloaters />
    </>
  );
}