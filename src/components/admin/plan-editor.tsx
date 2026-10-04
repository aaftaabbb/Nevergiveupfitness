"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/admin/modal";
import { InlineNotice } from "@/components/admin/empty-state";
export type EditablePlan = {
  id: string;
  name: string;
  months: number;
  price: number;
  highlight: string;
  features: string[];
  includesFreeTrainingMonth: boolean;
  active: boolean;
};

type PlanFormState = {
  name: string;
  months: string;
  price: string;
  highlight: string;
  features: string;
  includesFreeTrainingMonth: boolean;
  active: boolean;
};

function toFormState(plan?: EditablePlan): PlanFormState {
  return {
    name: plan?.name ?? "",
    months: plan ? String(plan.months) : "1",
    price: plan ? String(plan.price) : "",
    highlight: plan?.highlight ?? "",
    features: plan?.features.join("\n") ?? "",
    includesFreeTrainingMonth: plan?.includesFreeTrainingMonth ?? false,
    active: plan?.active ?? true,
  };
}

export function PlanEditor({ plan }: { plan?: EditablePlan }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<PlanFormState>(() => toFormState(plan));
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const isEditing = Boolean(plan);

  function close() {
    setOpen(false);
    setError(null);
    setForm(toFormState(plan));
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setPending(true);

    const payload = {
      name: form.name,
      months: Number(form.months),
      price: Number(form.price),
      highlight: form.highlight,
      // One feature per line keeps the form quick to fill on a phone.
      features: form.features
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean),
      includesFreeTrainingMonth: form.includesFreeTrainingMonth,
      active: form.active,
    };

    try {
      const response = await fetch(
        plan ? `/api/admin/plans/${plan.id}` : "/api/admin/plans",
        {
          method: plan ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );
      const result = await response.json();

      if (!response.ok) {
        setError(result.error ?? "Could not save the plan.");
        setPending(false);
        return;
      }

      close();
      router.refresh();
    } catch {
      setError("Network problem. Please try again.");
      setPending(false);
    }
  }

  return (
    <>
      {isEditing ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="border border-line px-3 py-2 text-[10px] font-bold uppercase tracking-[0.12em] text-muted transition-colors hover:border-brand-red hover:text-text"
        >
          Edit
        </button>
      ) : (
        <Button onClick={() => setOpen(true)}>
          <Plus className="h-4 w-4" />
          Add plan
        </Button>
      )}

      <Modal
        open={open}
        onClose={close}
        title={isEditing ? `Edit ${plan?.name}` : "Add plan"}
        description="Months drive the expiry calculation on every membership."
        footer={
          <div className="flex gap-3">
            <Button type="submit" form="plan-form" fullWidth disabled={pending}>
              {pending ? "Saving…" : "Save plan"}
            </Button>
            <Button type="button" variant="ghost" onClick={close} disabled={pending}>
              Cancel
            </Button>
          </div>
        }
      >
        <form id="plan-form" onSubmit={onSubmit} className="space-y-4" noValidate>
          {error ? <InlineNotice>{error}</InlineNotice> : null}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="sm:col-span-2">
              <label htmlFor="plan-name" className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.16em] text-muted">
                Plan name <span className="text-brand-red">*</span>
              </label>
              <input
                id="plan-name"
                required
                maxLength={40}
                value={form.name}
                onChange={(event) => setForm((s) => ({ ...s, name: event.target.value }))}
                placeholder="e.g. Yearly"
                className="w-full border border-line bg-ink px-3 py-3 text-sm text-text focus:border-brand-red focus:outline-none"
              />
            </div>
            <div>
              <label htmlFor="plan-months" className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.16em] text-muted">
                Months <span className="text-brand-red">*</span>
              </label>
              <input
                id="plan-months"
                type="number"
                inputMode="numeric"
                required
                min={1}
                max={36}
                value={form.months}
                onChange={(event) => setForm((s) => ({ ...s, months: event.target.value }))}
                className="w-full border border-line bg-ink px-3 py-3 text-sm text-text focus:border-brand-red focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="plan-price" className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.16em] text-muted">
                Price (₹) <span className="text-brand-red">*</span>
              </label>
              <input
                id="plan-price"
                type="number"
                inputMode="numeric"
                required
                min={0}
                step={100}
                value={form.price}
                onChange={(event) => setForm((s) => ({ ...s, price: event.target.value }))}
                className="w-full border border-line bg-ink px-3 py-3 text-sm text-text focus:border-brand-red focus:outline-none"
              />
            </div>
            <div>
              <label htmlFor="plan-highlight" className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.16em] text-muted">
                Highlight
              </label>
              <input
                id="plan-highlight"
                maxLength={120}
                value={form.highlight}
                onChange={(event) => setForm((s) => ({ ...s, highlight: event.target.value }))}
                placeholder="Short line shown on the pricing page"
                className="w-full border border-line bg-ink px-3 py-3 text-sm text-text focus:border-brand-red focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label htmlFor="plan-features" className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.16em] text-muted">
              Features
            </label>
            <textarea
              id="plan-features"
              rows={5}
              value={form.features}
              onChange={(event) => setForm((s) => ({ ...s, features: event.target.value }))}
              placeholder={"24/7 access\nAir conditioned floor\nOne feature per line"}
              className="w-full resize-y border border-line bg-ink px-3 py-3 text-sm text-text focus:border-brand-red focus:outline-none"
            />
          </div>

          <label className="flex cursor-pointer items-start gap-3 border border-line p-3">
            <input
              type="checkbox"
              checked={form.includesFreeTrainingMonth}
              onChange={(event) =>
                setForm((s) => ({ ...s, includesFreeTrainingMonth: event.target.checked }))
              }
              className="mt-0.5 h-4 w-4 shrink-0 accent-[#E31E24]"
            />
            <span className="text-sm text-muted">
              Includes the free personal training month, diet plan, body analysis and fitness
              test. Shown against every member on this plan.
            </span>
          </label>

          <label className="flex cursor-pointer items-start gap-3 border border-line p-3">
            <input
              type="checkbox"
              checked={form.active}
              onChange={(event) => setForm((s) => ({ ...s, active: event.target.checked }))}
              className="mt-0.5 h-4 w-4 shrink-0 accent-[#E31E24]"
            />
            <span className="text-sm text-muted">
              Active. Inactive plans stay on existing memberships but stop showing as options.
            </span>
          </label>
        </form>
      </Modal>
    </>
  );
}

export function TogglePlanButton({ planId, isActive }: { planId: string; isActive: boolean }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function toggle() {
    setPending(true);
    await fetch(`/api/admin/plans/${planId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !isActive }),
    });
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={pending}
      aria-label={isActive ? "Deactivate plan" : "Activate plan"}
      className="border border-line p-2 text-muted transition-colors hover:border-brand-red hover:text-text"
    >
      {isActive ? (
        <Check className="h-4 w-4 text-status-active" />
      ) : (
        <X className="h-4 w-4 text-brand-red" />
      )}
    </button>
  );
}

export function DeletePlanButton({ planId, planName }: { planId: string; planName: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onConfirm() {
    setError(null);
    setPending(true);

    const response = await fetch(`/api/admin/plans/${planId}`, { method: "DELETE" });
    const payload = await response.json();

    if (!response.ok) {
      setError(payload.error ?? "Could not delete the plan.");
      setPending(false);
      return;
    }

    setOpen(false);
    router.refresh();
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={`Delete ${planName}`}
        className="border border-line px-3 py-2 text-[10px] font-bold uppercase tracking-[0.12em] text-muted transition-colors hover:border-brand-red hover:text-brand-red"
      >
        Delete
      </button>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={`Delete ${planName}?`}
        description="Members already on this plan keep their membership. It will only be removed from future signups."
        footer={
          <div className="flex gap-3">
            <Button variant="danger" fullWidth onClick={onConfirm} disabled={pending}>
              {pending ? "Deleting…" : "Yes, delete"}
            </Button>
            <Button variant="ghost" onClick={() => setOpen(false)} disabled={pending}>
              Cancel
            </Button>
          </div>
        }
      >
        {error ? <InlineNotice>{error}</InlineNotice> : null}
        <p className="text-sm text-muted">
          Deactivating the plan instead keeps it available for existing members to renew onto.
        </p>
      </Modal>
    </>
  );
}
