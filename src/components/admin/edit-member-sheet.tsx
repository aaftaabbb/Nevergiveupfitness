"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, TextArea, TextInput } from "@/components/ui/field";
import { Modal } from "@/components/admin/modal";
import { InlineNotice } from "@/components/admin/empty-state";
import { formatRupees } from "@/lib/format";
import { addMonths, todayIst, toDateKey } from "@/lib/dates";

export type PlanOption = {
  id: string;
  name: string;
  months: number;
  price: number;
  includesFreeTrainingMonth: boolean;
};

type MemberDetail = {
  id: string;
  name: string;
  phone: string;
  email: string;
  age: number | null;
  gender: string;
  goal: string;
  joiningDate: Date;
  currentPlanName: string;
  currentPlanMonths: number;
  dues: number;
  duesNote: string;
  workoutPlan: string;
  dietPlan: string;
  notes: string;
  freeTrainingMonthIncluded: boolean;
  freeTrainingMonthUsed: boolean;
};

type EditableState = {
  name: string;
  phone: string;
  email: string;
  age: string;
  gender: string;
  goal: string;
  joiningDate: string;
  planId: string;
  dues: string;
  duesNote: string;
  workoutPlan: string;
  dietPlan: string;
  notes: string;
};

function toEditableState(member: MemberDetail, plans: PlanOption[]): EditableState {
  const matchingPlan = plans.find((plan) => plan.months === member.currentPlanMonths);
  return {
    name: member.name,
    phone: member.phone,
    email: member.email,
    age: member.age === null ? "" : String(member.age),
    gender: member.gender,
    goal: member.goal,
    joiningDate: toDateKey(member.joiningDate),
    planId: matchingPlan?.id ?? "",
    dues: String(member.dues),
    duesNote: member.duesNote,
    workoutPlan: member.workoutPlan,
    dietPlan: member.dietPlan,
    notes: member.notes,
  };
}

export function EditMemberSheet({
  member,
  plans,
  onClose,
}: {
  member: MemberDetail;
  plans: PlanOption[];
  onClose: () => void;
}) {
  const router = useRouter();
  const [form, setForm] = useState<EditableState>(() => toEditableState(member, plans));
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const activePlan = plans.find((plan) => plan.id === form.planId);

  function update<K extends keyof EditableState>(key: K, value: EditableState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setPending(true);

    try {
      const response = await fetch(`/api/admin/members/${member.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          phone: form.phone,
          email: form.email,
          age: form.age ? Number(form.age) : null,
          gender: form.gender,
          goal: form.goal,
          joiningDate: form.joiningDate,
          planId: form.planId || undefined,
          dues: Number(form.dues || 0),
          duesNote: form.duesNote,
          workoutPlan: form.workoutPlan,
          dietPlan: form.dietPlan,
          notes: form.notes,
        }),
      });
      const payload = await response.json();

      if (!response.ok) {
        setError(payload.error ?? "Could not save the changes.");
        setPending(false);
        return;
      }

      onClose();
      router.refresh();
    } catch {
      setError("Network problem. Please try again.");
      setPending(false);
    }
  }

  return (
    <Modal
      open
      onClose={onClose}
      title={`Edit ${member.name}`}
      description="Changing the plan or joining date recalculates the expiry date."
      size="lg"
      footer={
        <div className="flex gap-3">
          <Button type="submit" form="edit-member-form" fullWidth disabled={pending}>
            <Save className="h-4 w-4" />
            {pending ? "Saving…" : "Save changes"}
          </Button>
          <Button type="button" variant="ghost" onClick={onClose} disabled={pending}>
            Cancel
          </Button>
        </div>
      }
    >
      <form id="edit-member-form" onSubmit={onSubmit} className="space-y-4" noValidate>
        {error ? <InlineNotice>{error}</InlineNotice> : null}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <TextInput
            label="Full name"
            required
            maxLength={80}
            value={form.name}
            onChange={(event) => update("name", event.target.value)}
          />
          <TextInput
            label="Phone"
            type="tel"
            inputMode="numeric"
            required
            maxLength={13}
            value={form.phone}
            onChange={(event) => update("phone", event.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <TextInput
            label="Age"
            type="number"
            inputMode="numeric"
            min={10}
            max={100}
            value={form.age}
            onChange={(event) => update("age", event.target.value)}
          />
          <Select
            label="Gender"
            value={form.gender}
            onChange={(event) => update("gender", event.target.value)}
            options={[
              { value: "male", label: "Male" },
              { value: "female", label: "Female" },
              { value: "other", label: "Other" },
            ]}
            placeholder="Not specified"
          />
          <TextInput
            label="Goal"
            maxLength={120}
            value={form.goal}
            onChange={(event) => update("goal", event.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <TextInput
            label="Joining date"
            type="date"
            required
            value={form.joiningDate}
            onChange={(event) => update("joiningDate", event.target.value)}
          />
          <Select
            label="Plan"
            value={form.planId}
            onChange={(event) => update("planId", event.target.value)}
            options={plans.map((plan) => ({
              value: plan.id,
              label: `${plan.name} · ${plan.months} months · ${formatRupees(plan.price)}`,
            }))}
            placeholder="Select a plan"
            hint={
              activePlan
                ? `Expiry recalculates from the joining date for ${activePlan.months} months.`
                : undefined
            }
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <TextInput
            label="Dues pending"
            type="number"
            inputMode="numeric"
            min={0}
            step={100}
            value={form.dues}
            onChange={(event) => update("dues", event.target.value)}
            hint="Amount still to be collected from this member"
          />
          <TextInput
            label="Dues note"
            maxLength={200}
            value={form.duesNote}
            onChange={(event) => update("duesNote", event.target.value)}
            placeholder="e.g. July renewal not collected"
          />
        </div>

        <TextArea
          label="Workout plan"
          rows={3}
          value={form.workoutPlan}
          onChange={(event) => update("workoutPlan", event.target.value)}
        />
        <TextArea
          label="Diet plan"
          rows={3}
          value={form.dietPlan}
          onChange={(event) => update("dietPlan", event.target.value)}
        />
        <TextArea
          label="Notes"
          rows={2}
          value={form.notes}
          onChange={(event) => update("notes", event.target.value)}
        />
      </form>
    </Modal>
  );
}

/**
 * Extends a membership by whole months from the current expiry, without
 * recording a payment. Used when the owner renews over WhatsApp and logs the
 * payment separately.
 */
export function RenewMembershipButton({
  memberId,
  currentExpiry,
  currentPlanMonths,
}: {
  memberId: string;
  currentExpiry: Date;
  currentPlanMonths: number;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [months, setMonths] = useState(String(currentPlanMonths));
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const previewExpiry = addMonths(
    currentExpiry.getTime() > todayIst().getTime() ? currentExpiry : todayIst(),
    Number(months || 0),
  );

  async function onConfirm() {
    setError(null);
    setPending(true);

    try {
      const response = await fetch(`/api/admin/members/${memberId}/renew`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ months: Number(months) }),
      });
      const payload = await response.json();

      if (!response.ok) {
        setError(payload.error ?? "Could not renew the membership.");
        setPending(false);
        return;
      }

      setOpen(false);
      router.refresh();
    } catch {
      setError("Network problem. Please try again.");
      setPending(false);
    }
  }

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        <Plus className="h-3.5 w-3.5" />
        Extend
      </Button>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Extend membership"
        description="Adds months to the current expiry. Record the payment from the Payments screen."
        footer={
          <div className="flex gap-3">
            <Button fullWidth onClick={onConfirm} disabled={pending}>
              {pending ? "Extending…" : "Confirm extension"}
            </Button>
            <Button variant="ghost" onClick={() => setOpen(false)} disabled={pending}>
              Cancel
            </Button>
          </div>
        }
      >
        {error ? (
          <div className="mb-4">
            <InlineNotice>{error}</InlineNotice>
          </div>
        ) : null}

        <div className="space-y-4">
          <TextInput
            label="Months to add"
            type="number"
            inputMode="numeric"
            min={1}
            max={36}
            value={months}
            onChange={(event) => setMonths(event.target.value)}
          />
          <p className="text-sm text-muted">
            New expiry date: <span className="text-text">{toDateKey(previewExpiry)}</span>
          </p>
        </div>
      </Modal>
    </>
  );
}
