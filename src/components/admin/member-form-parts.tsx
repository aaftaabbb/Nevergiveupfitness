"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, TextArea, TextInput } from "@/components/ui/field";
import { Modal } from "@/components/admin/modal";
import { InlineNotice } from "@/components/admin/empty-state";
import { formatRupees } from "@/lib/format";
import { addMonths, formatDate, parseDateKey, todayIst, toDateKey } from "@/lib/dates";

export type PlanOption = {
  id: string;
  name: string;
  months: number;
  price: number;
  includesFreeTrainingMonth: boolean;
};

type FormState = {
  name: string;
  phone: string;
  email: string;
  age: string;
  gender: string;
  goal: string;
  photoUrl: string;
  joiningDate: string;
  planId: string;
  amount: string;
  mode: string;
  workoutPlan: string;
  dietPlan: string;
  notes: string;
};

function initialFormState(plans: PlanOption[]): FormState {
  const today = toDateKey(todayIst());
  return {
    name: "",
    phone: "",
    email: "",
    age: "",
    gender: "",
    goal: "",
    photoUrl: "",
    joiningDate: today,
    planId: plans[0]?.id ?? "",
    amount: plans[0] ? String(plans[0].price) : "",
    mode: "cash",
    workoutPlan: "",
    dietPlan: "",
    notes: "",
  };
}

/** Opens the add-member sheet. Named for how it is used in headers. */
export function AddMemberButton({ plans }: { plans: PlanOption[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FormState>(() => initialFormState(plans));
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const activePlan = useMemo(
    () => plans.find((plan) => plan.id === form.planId),
    [plans, form.planId],
  );

  // Mirrors the server's calculateExpiryDate so the owner sees the expiry the
  // moment a plan is picked, before anything is saved.
  const previewExpiry = useMemo(() => {
    if (!activePlan || !form.joiningDate) return null;
    const parsed = parseDateKey(form.joiningDate);
    return parsed ? addMonths(parsed, activePlan.months) : null;
  }, [activePlan, form.joiningDate]);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function selectPlan(planId: string) {
    const plan = plans.find((item) => item.id === planId);
    setForm((current) => ({
      ...current,
      planId,
      // Pre-fill with the full plan price; the owner can part-pay if needed.
      amount: plan ? String(plan.price) : "",
    }));
  }

  function close() {
    setOpen(false);
    setError(null);
    setForm(initialFormState(plans));
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setPending(true);

    try {
      const response = await fetch("/api/admin/members", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          phone: form.phone,
          email: form.email,
          age: form.age ? Number(form.age) : null,
          gender: form.gender,
          goal: form.goal,
          photoUrl: form.photoUrl,
          joiningDate: form.joiningDate,
          planId: form.planId,
          amount: form.amount ? Number(form.amount) : 0,
          mode: form.mode,
          workoutPlan: form.workoutPlan,
          dietPlan: form.dietPlan,
          notes: form.notes,
          dues: 0,
          duesNote: "",
        }),
      });
      const payload = await response.json();

      if (!response.ok) {
        setError(payload.error ?? "Could not save the member.");
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
        <Plus className="h-4 w-4" />
        Add member
      </Button>

      <Modal
        open={open}
        onClose={close}
        title="Add member"
        description="Joining date and plan decide the expiry date automatically."
        size="lg"
        footer={
          <div className="flex gap-3">
            <Button type="submit" form="add-member-form" fullWidth disabled={pending}>
              {pending ? "Saving…" : "Save member"}
            </Button>
            <Button type="button" variant="ghost" onClick={close} disabled={pending}>
              Cancel
            </Button>
          </div>
        }
      >
        <form id="add-member-form" onSubmit={onSubmit} className="space-y-4" noValidate>
          {error ? <InlineNotice>{error}</InlineNotice> : null}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <TextInput
              label="Full name"
              name="name"
              required
              maxLength={80}
              placeholder="e.g. Prashant Jadhav"
              value={form.name}
              onChange={(event) => update("name", event.target.value)}
            />
            <TextInput
              label="Phone"
              name="phone"
              type="tel"
              inputMode="numeric"
              required
              maxLength={13}
              placeholder="10 digit mobile"
              value={form.phone}
              onChange={(event) => update("phone", event.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <TextInput
              label="Age"
              name="age"
              type="number"
              inputMode="numeric"
              min={10}
              max={100}
              placeholder="Optional"
              value={form.age}
              onChange={(event) => update("age", event.target.value)}
            />
            <Select
              label="Gender"
              name="gender"
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
              name="goal"
              maxLength={120}
              placeholder="Weight loss, PCOD…"
              value={form.goal}
              onChange={(event) => update("goal", event.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <TextInput
              label="Joining date"
              name="joiningDate"
              type="date"
              required
              value={form.joiningDate}
              onChange={(event) => update("joiningDate", event.target.value)}
            />
            <Select
              label="Plan"
              name="planId"
              required
              value={form.planId}
              onChange={(event) => selectPlan(event.target.value)}
              options={plans.map((plan) => ({
                value: plan.id,
                label: `${plan.name} · ${plan.months} months · ${formatRupees(plan.price)}`,
              }))}
            />
          </div>

          {previewExpiry ? (
            <p className="-mt-2 text-xs text-muted">
              Membership will run until{" "}
              <span className="text-status-active">{formatDate(previewExpiry)}</span>.
            </p>
          ) : null}

          {activePlan?.includesFreeTrainingMonth ? (
            <p className="border-l-4 border-brand-gold bg-brand-gold/5 px-3 py-2 text-xs text-brand-gold">
              Yearly plan: the free personal training month, diet plan, body analysis and fitness
              test are noted against this member.
            </p>
          ) : null}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <TextInput
              label="Amount collected now"
              name="amount"
              type="number"
              inputMode="numeric"
              min={0}
              step={100}
              value={form.amount}
              onChange={(event) => update("amount", event.target.value)}
              hint={
                activePlan && form.amount && Number(form.amount) < activePlan.price
                  ? `Balance ${formatRupees(activePlan.price - Number(form.amount))} will be saved as dues`
                  : "Leave blank to record the membership without a payment"
              }
            />
            <Select
              label="Payment mode"
              name="mode"
              value={form.mode}
              onChange={(event) => update("mode", event.target.value)}
              options={[
                { value: "cash", label: "Cash" },
                { value: "UPI", label: "UPI" },
              ]}
            />
          </div>

          <TextInput
            label="Photo URL"
            name="photoUrl"
            placeholder="Optional image link"
            value={form.photoUrl}
            onChange={(event) => update("photoUrl", event.target.value)}
            hint="Paste any hosted image link. Leave blank and the member shows initials."
          />

          <TextArea
            label="Workout plan"
            name="workoutPlan"
            rows={3}
            placeholder="Split, sets, reps, cardio"
            value={form.workoutPlan}
            onChange={(event) => update("workoutPlan", event.target.value)}
          />
          <TextArea
            label="Diet plan"
            name="dietPlan"
            rows={3}
            placeholder="Calories, protein, meal timing"
            value={form.dietPlan}
            onChange={(event) => update("dietPlan", event.target.value)}
          />
          <TextArea
            label="Notes"
            name="notes"
            rows={2}
            placeholder="Injuries, medical history, anything to remember"
            value={form.notes}
            onChange={(event) => update("notes", event.target.value)}
          />
        </form>
      </Modal>
    </>
  );
}

export function DeleteMemberButton({ memberId, memberName }: { memberId: string; memberName: string }) {
  const router = useRouter();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onConfirm() {
    setError(null);
    setPending(true);

    try {
      const response = await fetch(`/api/admin/members/${memberId}`, { method: "DELETE" });
      const payload = await response.json();

      if (!response.ok) {
        setError(payload.error ?? "Could not delete the member.");
        setPending(false);
        return;
      }

      setConfirmOpen(false);
      router.refresh();
    } catch {
      setError("Network problem. Please try again.");
      setPending(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setConfirmOpen(true)}
        aria-label={`Delete ${memberName}`}
        className="border border-line p-2 text-muted transition-colors hover:border-brand-red hover:text-brand-red"
      >
        <Trash2 className="h-4 w-4" />
      </button>

      <Modal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title={`Delete ${memberName}?`}
        description="This removes the member along with their payments, attendance and notes. It cannot be undone."
        footer={
          <div className="flex gap-3">
            <Button variant="danger" fullWidth onClick={onConfirm} disabled={pending}>
              {pending ? "Deleting…" : "Yes, delete"}
            </Button>
            <Button variant="ghost" onClick={() => setConfirmOpen(false)} disabled={pending}>
              Keep member
            </Button>
          </div>
        }
      >
        {error ? <InlineNotice>{error}</InlineNotice> : null}
        <p className="text-sm leading-relaxed text-muted">
          If the member is only leaving for a while, cancel the membership instead and keep the
          record.
        </p>
      </Modal>
    </>
  );
}
