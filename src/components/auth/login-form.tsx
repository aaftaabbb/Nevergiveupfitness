"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { GymLogo } from "@/components/brand/gym-logo";
import { Button } from "@/components/ui/button";
import { TextInput } from "@/components/ui/field";
import { InlineNotice } from "@/components/admin/empty-state";
import { brand } from "@/lib/brand";

export function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  // An already signed-in owner who lands here gets moved to the dashboard.
  useEffect(() => {
    document.title = "Owner login | Never Give Up Fitness";
  }, []);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setPending(true);

    const form = new FormData(event.currentTarget);
    // Forwarded so the API can send the owner back to the page the proxy
    // interrupted. Read from location instead of useSearchParams to keep this
    // page statically prerenderable.
    const from = new URLSearchParams(window.location.search).get("from");
    try {
      const response = await fetch(
        from ? `/api/auth/login?from=${encodeURIComponent(from)}` : "/api/auth/login",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: form.get("username"),
            password: form.get("password"),
          }),
        },
      );
      const payload = await response.json();

      if (!response.ok) {
        setError(payload.error ?? "Could not sign you in.");
        setPending(false);
        return;
      }

      router.replace(payload.redirectTo ?? "/admin");
      router.refresh();
    } catch {
      setError("Network problem. Check your connection and try again.");
      setPending(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-5 py-10">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center text-center">
          <GymLogo className="h-20 w-20" />
          <h1 className="mt-5 text-3xl text-text">Owner Login</h1>
          <p className="mt-2 text-xs uppercase tracking-[0.2em] text-muted">
            {brand.name} · Admin
          </p>
        </div>

        <form onSubmit={onSubmit} className="card mt-8 space-y-4 p-6" noValidate>
          <TextInput
            label="Username"
            name="username"
            autoComplete="username"
            required
            maxLength={60}
            placeholder="Your gym username"
          />
          <TextInput
            label="Password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            maxLength={200}
            placeholder="Your password"
          />

          {error ? <InlineNotice>{error}</InlineNotice> : null}

          <Button type="submit" fullWidth disabled={pending}>
            {pending ? "Signing in…" : "Sign in"}
          </Button>
        </form>

        <p className="mt-6 text-center text-xs leading-relaxed text-muted">
          This panel is for the gym owner only. If you are locked out, call{" "}
          <a href={`tel:+${brand.whatsappNumber}`} className="text-brand-red underline">
            {brand.phoneDisplay}
          </a>
          .
        </p>
      </div>
    </div>
  );
}
