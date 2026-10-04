"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { Modal } from "@/components/admin/modal";
import { InlineNotice } from "@/components/admin/empty-state";
import { callHref, brand } from "@/lib/brand";

const STATUSES = [
  { value: "new", label: "New" },
  { value: "contacted", label: "Contacted" },
  { value: "converted", label: "Converted" },
  { value: "dropped", label: "Dropped" },
] as const;

export function EnquiryStatusSelect({
  enquiryId,
  status,
}: {
  enquiryId: string;
  status: string;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function update(nextStatus: string) {
    setPending(true);
    await fetch(`/api/admin/enquiries/${enquiryId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: nextStatus, handledNote: "" }),
    });
    setPending(false);
    router.refresh();
  }

  return (
    <label className="block">
      <span className="sr-only">Enquiry status</span>
      <select
        value={status}
        disabled={pending}
        onChange={(event) => update(event.target.value)}
        className="w-full border border-line bg-ink px-3 py-2.5 text-xs font-bold uppercase tracking-[0.1em] text-text focus:border-brand-red focus:outline-none disabled:opacity-60"
      >
        {STATUSES.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export function EnquiryActions({ enquiryId, name }: { enquiryId: string; name: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function remove() {
    setError(null);
    setPending(true);
    const response = await fetch(`/api/admin/enquiries/${enquiryId}`, { method: "DELETE" });
    const payload = await response.json();

    if (!response.ok) {
      setError(payload.error ?? "Could not delete the enquiry.");
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
        aria-label={`Delete enquiry from ${name}`}
        className="shrink-0 border border-line p-2.5 text-muted transition-colors hover:border-brand-red hover:text-brand-red"
      >
        <Trash2 className="h-4 w-4" />
      </button>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={`Delete enquiry from ${name}?`}
        description="This cannot be undone. Set the status to dropped if you only want to hide it."
        footer={
          <div className="flex gap-3">
            <button
              type="button"
              onClick={remove}
              disabled={pending}
              className="w-full border border-brand-red bg-brand-red px-4 py-3 text-[11px] font-bold uppercase tracking-[0.12em] text-text disabled:opacity-60"
            >
              {pending ? "Deleting…" : "Yes, delete"}
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              disabled={pending}
              className="border border-line px-4 py-3 text-[11px] font-bold uppercase tracking-[0.12em] text-muted"
            >
              Cancel
            </button>
          </div>
        }
      >
        {error ? <InlineNotice>{error}</InlineNotice> : null}
        <p className="text-sm text-muted">
          Call back first on{" "}
          <a href={callHref} className="text-brand-red underline underline-offset-4">
            {brand.phoneDisplay}
          </a>{" "}
          so the enquiry is not lost with the record.
        </p>
      </Modal>
    </>
  );
}