"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { IndianRupee, MessageCircle, NotebookPen, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { Modal } from "@/components/admin/modal";
import { InlineNotice } from "@/components/admin/empty-state";
import {
  EditMemberSheet,
  RenewMembershipButton,
  type PlanOption,
} from "@/components/admin/edit-member-sheet";
import { formatRupees, initialsOf } from "@/lib/format";
import { formatDate, formatDateTime } from "@/lib/dates";
import { whatsappLink } from "@/lib/brand";

type MemberProfile = {
  id: string;
  name: string;
  phone: string;
  email: string;
  photoUrl: string;
  age: number | null;
  gender: string;
  goal: string;
  joiningDate: Date;
  expiryDate: Date;
  currentPlanName: string;
  currentPlanMonths: number;
  currentPlanPrice: number;
  freeTrainingMonthIncluded: boolean;
  freeTrainingMonthUsed: boolean;
  dues: number;
  duesNote: string;
  workoutPlan: string;
  dietPlan: string;
  notes: string;
  status: { status: string; daysRemaining: number; hasDues: boolean };
  payments: {
    id: string;
    amount: number;
    paidOn: Date;
    mode: string;
    status: string;
    planName: string;
    planMonths: number;
    note: string;
    collectedAt: Date | null;
  }[];
  activityNotes: { id: string; body: string; createdAt: Date }[];
  attendanceCount: number;
  recentAttendanceDates: string[];
  attendanceWindow: string[];
};

export function MemberProfileView({
  member,
  plans,
  today,
}: {
  member: MemberProfile;
  plans: PlanOption[];
  today: string;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [noteOpen, setNoteOpen] = useState(false);
  const [noteBody, setNoteBody] = useState("");
  const [noteError, setNoteError] = useState<string | null>(null);
  const [notePending, setNotePending] = useState(false);
  const [removingPaymentId, setRemovingPaymentId] = useState<string | null>(null);
  const [confirmPaymentId, setConfirmPaymentId] = useState<string | null>(null);

  const totalPaid = member.payments
    .filter((payment) => payment.status === "paid")
    .reduce((sum, payment) => sum + payment.amount, 0);

  const confirmPayment = confirmPaymentId
    ? member.payments.find((payment) => payment.id === confirmPaymentId)
    : undefined;

  async function addNote(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNoteError(null);
    setNotePending(true);

    try {
      const response = await fetch("/api/admin/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ memberId: member.id, body: noteBody }),
      });
      const payload = await response.json();

      if (!response.ok) {
        setNoteError(payload.error ?? "Could not save the note.");
        setNotePending(false);
        return;
      }

      setNoteBody("");
      setNoteOpen(false);
      router.refresh();
    } catch {
      setNoteError("Network problem. Please try again.");
      setNotePending(false);
    }
  }

  async function markPaid(paymentId: string) {
    setRemovingPaymentId(paymentId);
    await fetch("/api/admin/payments", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ paymentId }),
    });
    router.refresh();
  }

  async function deletePayment(paymentId: string) {
    setRemovingPaymentId(paymentId);
    try {
      const response = await fetch(`/api/admin/payments?id=${paymentId}`, { method: "DELETE" });
      if (!response.ok) {
        setRemovingPaymentId(null);
        setConfirmPaymentId(null);
        return;
      }
      setConfirmPaymentId(null);
      router.refresh();
    } finally {
      setRemovingPaymentId(null);
    }
  }

  return (
    <>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-4">
          {member.photoUrl ? (
            // Owner-supplied photo URL, so next/image remote patterns would
            // need every possible host configured.
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={member.photoUrl}
              alt={`${member.name} photo`}
              className="h-16 w-16 border border-line object-cover"
            />
          ) : (
            <span
              aria-hidden
              className="flex h-16 w-16 items-center justify-center border border-line bg-surface text-lg font-bold text-muted"
            >
              {initialsOf(member.name)}
            </span>
          )}

          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-4xl text-text">{member.name}</h1>
              <StatusBadge status={member.status.status} />
            </div>
            <p className="mt-2 text-sm text-muted">
              {member.phone} · {member.currentPlanName} ({member.currentPlanMonths} months)
              {member.goal ? ` · ${member.goal}` : ""}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
            Edit
          </Button>
          <RenewMembershipButton
            memberId={member.id}
            currentExpiry={member.expiryDate}
            currentPlanMonths={member.currentPlanMonths}
          />
          <a
            href={whatsappLink(
              `Hello ${member.name}, this is Rahul from Never Give Up Fitness.`,
            )}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 border border-status-active/50 px-4 py-2.5 text-[11px] font-bold uppercase tracking-[0.12em] text-status-active transition-colors hover:bg-status-active hover:text-ink"
          >
            <MessageCircle className="h-4 w-4" />
            WhatsApp
          </a>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div className="card p-4">
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-muted">Joined</p>
          <p className="mt-2 font-display text-2xl text-text">{formatDate(member.joiningDate)}</p>
        </div>
        <div className="card p-4">
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-muted">Expires</p>
          <p className="mt-2 font-display text-2xl text-text">{formatDate(member.expiryDate)}</p>
          <p className="mt-1 text-xs text-muted">
            {member.status.daysRemaining < 0
              ? `Expired ${Math.abs(member.status.daysRemaining)} days ago`
              : `${member.status.daysRemaining} days left`}
          </p>
        </div>
        <div className="card p-4">
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-muted">Total paid</p>
          <p className="mt-2 font-display text-2xl text-brand-gold">{formatRupees(totalPaid)}</p>
        </div>
        <div className="card p-4">
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-muted">Dues</p>
          <p
            className={`mt-2 font-display text-2xl ${
              member.dues > 0 ? "text-brand-red" : "text-status-active"
            }`}
          >
            {member.dues > 0 ? formatRupees(member.dues) : "Clear"}
          </p>
          {member.duesNote ? <p className="mt-1 text-xs text-muted">{member.duesNote}</p> : null}
        </div>
      </div>

      {member.freeTrainingMonthIncluded ? (
        <p className="mt-3 border-l-4 border-brand-gold bg-surface px-4 py-3 text-sm text-brand-gold">
          Yearly plan includes 1 month free personal training, a personalised diet plan, body
          analysis and a fitness test.{" "}
          {member.freeTrainingMonthUsed ? "Already used." : "Not yet used."}
        </p>
      ) : null}

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <PlanBlock
          title="Workout plan"
          body={member.workoutPlan}
          empty="No workout plan written yet."
        />
        <PlanBlock title="Diet plan" body={member.dietPlan} empty="No diet plan written yet." />
      </div>

      {member.notes ? (
        <section className="mt-6">
          <h2 className="mb-3 text-2xl text-text">Notes</h2>
          <p className="card p-4 text-sm leading-relaxed text-muted">{member.notes}</p>
        </section>
      ) : null}

      <section className="mt-6">
        <div className="mb-3 flex items-center justify-between gap-4">
          <h2 className="text-2xl text-text">Payment history</h2>
          <a
            href={`/admin/payments?search=${encodeURIComponent(member.name)}`}
            className="text-[11px] font-bold uppercase tracking-[0.14em] text-brand-red hover:underline"
          >
            Open payments
          </a>
        </div>

        {member.payments.length === 0 ? (
          <p className="card hatch px-4 py-8 text-center text-sm text-muted">
            No payments recorded for this member yet.
          </p>
        ) : (
          <ul className="space-y-2">
            {member.payments.map((payment) => (
              <li key={payment.id} className="card flex flex-wrap items-center justify-between gap-3 p-4">
                <div className="min-w-0">
                  <p className="text-sm text-text">
                    {payment.planName || "Membership"}
                    {payment.planMonths > 0 ? ` · ${payment.planMonths} months` : ""}
                  </p>
                  <p className="mt-1 text-xs text-muted">
                    {formatDate(payment.paidOn)} · {payment.mode}
                    {payment.note ? ` · ${payment.note}` : ""}
                  </p>
                </div>

                <div className="flex shrink-0 items-center gap-3">
                  <StatusBadge status={payment.status} />
                  <span className="font-display text-xl text-brand-gold">
                    {formatRupees(payment.amount)}
                  </span>
                  {payment.status === "pending" ? (
                    <button
                      type="button"
                      onClick={() => markPaid(payment.id)}
                      disabled={removingPaymentId === payment.id}
                      className="border border-status-active/50 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.12em] text-status-active transition-colors hover:bg-status-active hover:text-ink"
                    >
                      Mark paid
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setConfirmPaymentId(payment.id)}
                      disabled={removingPaymentId === payment.id}
                      aria-label="Delete payment"
                      className="border border-line p-2 text-muted transition-colors hover:border-brand-red hover:text-brand-red"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-8">
        <div className="mb-3 flex items-center justify-between gap-4">
          <h2 className="text-2xl text-text">Activity notes</h2>
          <Button variant="ghost" size="sm" onClick={() => setNoteOpen(true)}>
            <NotebookPen className="h-4 w-4" />
            Add note
          </Button>
        </div>

        {member.activityNotes.length === 0 ? (
          <p className="card hatch px-4 py-8 text-center text-sm text-muted">
            No notes yet. Use this for form corrections, call logs and progress remarks.
          </p>
        ) : (
          <ul className="space-y-2">
            {member.activityNotes.map((note) => (
              <li key={note.id} className="card p-4">
                <p className="text-sm leading-relaxed text-text">{note.body}</p>
                <p className="mt-2 text-xs text-muted">{formatDateTime(note.createdAt)}</p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-8">
        <h2 className="mb-3 text-2xl text-text">
          Attendance · {member.attendanceCount} visits
        </h2>
        <p className="text-sm text-muted">
          Present today:{" "}
          <span
            className={
              member.recentAttendanceDates.includes(today) ? "text-status-active" : "text-muted"
            }
          >
            {member.recentAttendanceDates.includes(today) ? "Yes" : "No"}
          </span>
        </p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {member.attendanceWindow.map((key) => {
            const present = member.recentAttendanceDates.includes(key);
            return (
              <span
                key={key}
                title={key}
                className={`flex h-8 w-8 items-center justify-center border text-[10px] ${
                  present
                    ? "border-status-active/60 bg-status-active/15 text-status-active"
                    : "border-line text-muted"
                }`}
              >
                {key.slice(8, 10)}
              </span>
            );
          })}
        </div>
      </section>

      {editing ? (
        <EditMemberSheet member={member} plans={plans} onClose={() => setEditing(false)} />
      ) : null}

      <Modal
        open={noteOpen}
        onClose={() => setNoteOpen(false)}
        title="Add activity note"
        description="Anything worth remembering about this member."
        footer={
          <div className="flex gap-3">
            <Button type="submit" form="add-note-form" fullWidth disabled={notePending}>
              {notePending ? "Saving…" : "Save note"}
            </Button>
            <Button type="button" variant="ghost" onClick={() => setNoteOpen(false)}>
              Cancel
            </Button>
          </div>
        }
      >
        <form id="add-note-form" onSubmit={addNote} className="space-y-4" noValidate>
          {noteError ? <InlineNotice>{noteError}</InlineNotice> : null}
          <div>
            <label htmlFor="note-body" className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.16em] text-muted">
              Note
            </label>
            <textarea
              id="note-body"
              rows={4}
              value={noteBody}
              onChange={(event) => setNoteBody(event.target.value)}
              placeholder="e.g. Missed two days, asked to hold the plan"
              className="w-full resize-y border border-line bg-ink px-3 py-3 text-sm text-text placeholder:text-muted/60 focus:border-brand-red focus:outline-none"
            />
          </div>
          <p className="flex items-center gap-2 text-xs text-muted">
            <IndianRupee className="h-3.5 w-3.5" aria-hidden />
            Notes are visible only in this panel.
          </p>
        </form>
      </Modal>

      <Modal
        open={confirmPaymentId !== null}
        onClose={() => setConfirmPaymentId(null)}
        title="Delete this payment record?"
        description={
          confirmPayment
            ? `${formatRupees(confirmPayment.amount)} recorded on ${formatDate(confirmPayment.paidOn)} will be removed permanently and the member's total will change.`
            : undefined
        }
        footer={
          <div className="flex gap-3">
            <Button
              variant="danger"
              fullWidth
              onClick={() => confirmPaymentId && deletePayment(confirmPaymentId)}
              disabled={removingPaymentId !== null}
            >
              {removingPaymentId !== null ? "Deleting…" : "Yes, delete payment"}
            </Button>
            <Button
              variant="ghost"
              onClick={() => setConfirmPaymentId(null)}
              disabled={removingPaymentId !== null}
            >
              Cancel
            </Button>
          </div>
        }
      >
        <p className="text-sm text-muted">
          Payment records are kept for your accounting, so this cannot be undone. If the amount was
          entered by mistake, cancel and add the correct payment instead.
        </p>
      </Modal>
    </>
  );
}

function PlanBlock({ title, body, empty }: { title: string; body: string; empty: string }) {
  return (
    <section>
      <h2 className="mb-3 text-2xl text-text">{title}</h2>
      {body ? (
        <p className="card p-4 text-sm leading-relaxed whitespace-pre-line text-muted">{body}</p>
      ) : (
        <p className="card hatch px-4 py-8 text-center text-sm text-muted">{empty}</p>
      )}
    </section>
  );
}
