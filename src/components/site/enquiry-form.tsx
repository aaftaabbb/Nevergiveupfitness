"use client";

import { useState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, TextArea, TextInput } from "@/components/ui/field";
import { brand, callHref, whatsappLink } from "@/lib/brand";

const INTEREST_OPTIONS = [
  { value: "Gym membership", label: "Gym membership" },
  { value: "Free trial", label: "Free trial" },
  { value: "Personal training", label: "Personal training" },
  { value: "Weight loss", label: "Weight loss" },
  { value: "Weight gain", label: "Weight gain" },
  { value: "PCOD / PCOS program", label: "PCOD / PCOS program" },
  { value: "Diabetes reversal program", label: "Diabetes reversal program" },
  { value: "Diet counselling", label: "Diet counselling" },
];

type Errors = Partial<Record<"name" | "phone" | "email" | "interest" | "message" | "form", string>>;

export function EnquiryForm({ className = "" }: { className?: string }) {
  const [errors, setErrors] = useState<Errors>({});
  const [pending, setPending] = useState(false);
  const [done, setDone] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrors({});
    setPending(true);

    const form = event.currentTarget;
    const data = new FormData(form);
    const payload = {
      name: String(data.get("name") ?? ""),
      phone: String(data.get("phone") ?? ""),
      email: String(data.get("email") ?? ""),
      interest: String(data.get("interest") ?? ""),
      message: String(data.get("message") ?? ""),
      // Honeypot: hidden from humans, filled by bots.
      company: String(data.get("company") ?? ""),
    };

    try {
      const response = await fetch("/api/enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json();

      if (!response.ok) {
        setErrors({ form: result.error ?? "Something went wrong. Please try again." });
        setPending(false);
        return;
      }

      form.reset();
      setDone(true);
      setPending(false);
    } catch {
      setErrors({
        form: "Network problem. Please WhatsApp or call us and we will note it down.",
      });
      setPending(false);
    }
  }

  if (done) {
    return (
      <div className={`card p-6 ${className}`}>
        <CheckCircle2 className="h-9 w-9 text-status-active" aria-hidden />
        <h3 className="mt-4 text-2xl text-text">Request received</h3>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          {brand.trainer.name.split(" ")[0]} will call you back on the number you gave us, usually
          the same evening. If you want to talk right now, call or WhatsApp.
        </p>
        <div className="mt-5 flex flex-col gap-2 sm:flex-row">
          <a
            href={callHref}
            className="border border-brand-red px-4 py-3 text-center text-[11px] font-bold uppercase tracking-[0.12em] text-text transition-colors hover:bg-brand-red"
          >
            Call {brand.phoneDisplay}
          </a>
          <a
            href={whatsappLink("Hi, I just sent a free trial request on your website.")}
            target="_blank"
            rel="noopener noreferrer"
            className="border border-status-active px-4 py-3 text-center text-[11px] font-bold uppercase tracking-[0.12em] text-text transition-colors hover:bg-status-active"
          >
            WhatsApp now
          </a>
        </div>
        <button
          type="button"
          onClick={() => setDone(false)}
          className="mt-4 text-[11px] font-bold uppercase tracking-[0.12em] text-muted underline underline-offset-4 hover:text-text"
        >
          Send another request
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className={`card relative p-5 sm:p-6 ${className}`}>
      {errors.form ? (
        <p className="mb-4 border-l-4 border-brand-red bg-brand-red/10 px-3 py-2 text-sm text-text">
          {errors.form}
        </p>
      ) : null}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <TextInput
          label="Your name"
          name="name"
          required
          autoComplete="name"
          maxLength={80}
          error={errors.name}
          placeholder="Full name"
        />
        <TextInput
          label="Phone"
          name="phone"
          type="tel"
          inputMode="numeric"
          required
          autoComplete="tel"
          maxLength={15}
          error={errors.phone}
          placeholder="10 digit mobile number"
        />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <TextInput
          label="Email"
          name="email"
          type="email"
          autoComplete="email"
          maxLength={120}
          error={errors.email}
          hint="Optional"
          placeholder="you@example.com"
        />
        <Select
          label="Interested in"
          name="interest"
          error={errors.interest}
          options={INTEREST_OPTIONS}
          placeholder="Pick one"
        />
      </div>

      <div className="mt-4">
        <TextArea
          label="Message"
          name="message"
          rows={4}
          maxLength={600}
          error={errors.message}
          hint="Optional. Tell us your goal and we will tell you honestly what it takes."
          placeholder="I want to lose 10 kg in 4 months, currently 78 kg."
        />
      </div>

      {/* Honeypot field: hidden from people, tempting for bots. */}
      <div className="absolute -left-[9999px]" aria-hidden>
        <label htmlFor="company">Company</label>
        <input id="company" name="company" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="mt-5">
        <Button type="submit" size="lg" fullWidth disabled={pending}>
          {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          {pending ? "Sending…" : "Request a free trial"}
        </Button>
      </div>

      <p className="mt-3 text-center text-xs leading-relaxed text-muted">
        We only use your number to call you about the gym. No spam, no added lists.
      </p>
    </form>
  );
}