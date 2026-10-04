import { MessageCircle } from "lucide-react";
import { brand, callHref, whatsappLink } from "@/lib/brand";

const message = `Hi ${brand.name}, I want to know about membership and a free trial. Please share the plans.`;

/**
 * Fixed WhatsApp and call buttons. They sit above the content on phones, which
 * is where most enquiries come from, and stay out of the way on desktop.
 */
export function ContactFloaters() {
  return (
    <div className="fixed bottom-5 right-5 z-40 flex flex-col gap-3">
      <a
        href={whatsappLink(message)}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat with us on WhatsApp"
        className="flex h-14 w-14 items-center justify-center rounded-full border border-status-active/50 bg-[#128c4a] p-3.5 text-text shadow-[0_14px_34px_-12px_rgba(18,140,74,0.9)] transition-transform hover:scale-105"
      >
        <MessageCircle className="h-6 w-6" aria-hidden />
      </a>
      <a
        href={callHref}
        aria-label={`Call ${brand.phoneDisplay}`}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-red p-3.5 font-display text-2xl leading-none text-text shadow-[0_14px_34px_-12px_rgba(227,30,36,0.95)] transition-transform hover:scale-105"
      >
        <span aria-hidden>☎</span>
      </a>
    </div>
  );
}