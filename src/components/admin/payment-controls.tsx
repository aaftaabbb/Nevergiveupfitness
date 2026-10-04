"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { IndianRupee, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, TextInput } from "@/components/ui/field";
import { Modal } from "@/components/admin/modal";
import { InlineNotice } from "@/components/admin/empty-state";
import { formatRupees } from "@/lib/format";
import { formatDate, toDateKey, todayIst } from "@/lib/dates";

export type PickerMember = {
  id: string;
  name: string;
  phone: string;
  expiryDate: Date;
  dues: number;
};

export type PlanForPayment = {
  id: string;
  name: string;
  months: number;
  price: number;
};

export function RecordPaymentButton({
  members,
  plans,
}: {
  members: PickerMember[];
  plans: PlanForPayment[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [memberId, setMemberId] = useState("");
  const [amount, setAmount] = useState("");
  const [paidOn, setPaidOn] = useState(toDateKey(todayIst()));
  const [mode, setMode] = useState("cash");
  const [status, setStatus] = useState("paid");
  const [planId, setPlanId] = useState("");
  const [note, setNote] = useState("");
  const [memberSearch, setMemberSearch] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const selectedMember = members.find((member) => member.id === memberId);
  const selectedPlan = plans.find((plan) => plan.id === planId);

  // A membership payment extends the membership. A top-up against dues does not,
  // so the plan field is only offered for the former.
  const extendsMembership = status === "paid" && selectedPlan !== undefined && selectedPlan !== null;

  const filteredMembers = useMemo(() => {
    const query = memberSearch.trim().toLowerCase();
    if (!query) return members;
    return members.filter(
      (member) =>
        member.name.toLowerCase().includes(query) || member.phone.includes(query),
    );
  }, [members, memberSearch]);

  function pickMember(id: string) {
    setMemberId(id);
    const member = members.find((item) => item.id === id);
    if (member && member.dues > 0) {
      setAmount(String(member.dues));
    }
  }

  function pickPlan(id: string) {
    setPlanId(id);
    const plan = plans.find((item) => item.id === id);
    if (plan) setAmount(String(plan.price));
  }

  function close() {
    setOpen(false);
    setMemberId("");
    setAmount("");
    setPlanId("");
    setNote("");
    setError(null);
    setStatus("paid");
    setPaidOn(toDateKey(todayIst()));
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setPending(true);

    try {
      const response = await fetch("/api/admin/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          memberId,
          amount: Number(amount),
          paidOn,
          mode,
          status,
          planMonths: extendsMembership ? selectedPlan?.months : 0,
          planName: extendsMembership ? selectedPlan?.name : "",
          note,
        }),
      });
      const payload = await response.json();

      if (!response.ok) {
        setError(payload.error ?? "Could not record the payment.");
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
      <Button onClick={() => setOpen(true)}>
        <IndianRupee className="h-4 w-4" />
        Record payment
      </Button>

      <Modal
        open={open}
        onClose={close}
        title="Record payment"
        description="Pick a membership plan to extend the membership, or log a part payment against dues."
        footer={
          <div className="flex gap-3">
            <Button type="submit" form="record-payment-form" fullWidth disabled={pending}>
              {pending ? "Saving…" : "Save payment"}
            </Button>
            <Button type="button" variant="ghost" onClick={close} disabled={pending}>
              Cancel
            </Button>
          </div>
        }
      >
        <form id="record-payment-form" onSubmit={onSubmit} className="space-y-4" noValidate>
          {error ? <InlineNotice>{error}</InlineNotice> : null}

          <div>
            <label htmlFor="payment-member-search" className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.16em] text-muted">
              Find member
            </label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
              <input
                id="payment-member-search"
                value={memberSearch}
                onChange={(event) => setMemberSearch(event.target.value)}
                placeholder="Name or phone"
                className="w-full border border-line bg-ink py-3 pl-9 pr-3 text-sm text-text placeholder:text-muted/60 focus:border-brand-red focus:outline-none"
              />
            </div>
          </div>

          <Select
            label="Member"
            required
            value={memberId}
            onChange={(event) => pickMember(event.target.value)}
            options={filteredMembers.map((member) => ({
              value: member.id,
              label: `${member.name} · ${member.phone}`,
            }))}
            placeholder="Select a member"
          />

          {selectedMember ? (
            <p className="border-l-4 border-line bg-surface px-3 py-2 text-xs text-muted">
              {selectedMember.name} · expires {formatDate(selectedMember.expiryDate)}
              {selectedMember.dues > 0
                ? ` · ${formatRupees(selectedMember.dues)} pending`
                : " · no pending dues"}
            </p>
          ) : null}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Select
              label="Payment type"
              value={status}
              onChange={(event) => setStatus(event.target.value)}
              options={[
                { value: "paid", label: "Collected now" },
                { value: "pending", label: "Promised, not collected" },
              ]}
            />
            <Select
              label="Mode"
              value={mode}
              onChange={(event) => setMode(event.target.value)}
              options={[
                { value: "cash", label: "Cash" },
                { value: "UPI", label: "UPI" },
              ]}
            />
          </div>

          <Select
            label="Membership renewal"
            value={planId}
            onChange={(event) => pickPlan(event.target.value)}
            options={plans.map((plan) => ({
              value: plan.id,
              label: `${plan.name} · ${plan.months} months · ${formatRupees(plan.price)}`,
            }))}
            placeholder="No renewal, just a payment"
            hint={
              status === "pending"
                ? "Pending payments never change the expiry date."
                : "Leave empty for a part payment or dues top up."
            }
          />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <TextInput
              label="Amount (₹)"
              type="number"
              inputMode="numeric"
              required
              min={1}
              step={100}
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
            />
            <TextInput
              label="Date"
              type="date"
              required
              value={paidOn}
              onChange={(event) => setPaidOn(event.target.value)}
            />
          </div>

          <TextInput
            label="Note"
            maxLength={200}
            value={note}
            onChange={(event) => setNote(event.target.value)}
            placeholder="Optional"
          />

          {extendsMembership ? (
            <p className="border-l-4 border-brand-gold bg-brand-gold/5 px-3 py-2 text-xs text-brand-gold">
              This will extend the membership by {selectedPlan?.months} months from the current
              expiry date.
            </p>
          ) : null}
        </form>
      </Modal>
    </>
  );
}

export function MarkAsPaidButton({ paymentId }: { paymentId: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function markPaid() {
    setPending(true);
    const response = await fetch("/api/admin/payments", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ paymentId }),
    });
    setPending(false);
    if (response.ok) router.refresh();
  }

  return (
    <button
      type="button"
      onClick={markPaid}
      disabled={pending}
      className="border border-status-active/50 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.12em] text-status-active transition-colors hover:bg-status-active hover:text-ink"
    >
      {pending ? "…" : "Mark paid"}
    </button>
  );
}
