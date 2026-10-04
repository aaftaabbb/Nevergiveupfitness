"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Search, X } from "lucide-react";
import { Modal } from "@/components/admin/modal";

export type RosterMember = {
  id: string;
  name: string;
  phone: string;
  present: boolean;
};

/** One tap marks present, a second tap on the same day undoes it. */
export function AttendanceToggle({
  memberId,
  date,
  present,
}: {
  memberId: string;
  date: string;
  present: boolean;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function toggle() {
    setPending(true);
    const response = await fetch("/api/admin/attendance", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ memberId, date }),
    });
    setPending(false);
    if (response.ok) router.refresh();
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={pending}
      aria-pressed={present}
      className={`flex w-full items-center justify-center gap-2 border px-4 py-3 text-[11px] font-bold uppercase tracking-[0.12em] transition-colors ${
        present
          ? "border-status-active bg-status-active text-ink"
          : "border-line text-muted hover:border-brand-red hover:text-text"
      }`}
    >
      {present ? <Check className="h-4 w-4" /> : null}
      {pending ? "…" : present ? "Present" : "Mark present"}
    </button>
  );
}

export function UndoCheckIn({ memberId, date }: { memberId: string; date: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function undo() {
    setPending(true);
    await fetch("/api/admin/attendance", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ memberId, date }),
    });
    setPending(false);
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={undo}
      disabled={pending}
      aria-label="Remove check in"
      className="shrink-0 border border-line p-2.5 text-muted transition-colors hover:border-brand-red hover:text-brand-red"
    >
      <X className="h-4 w-4" />
    </button>
  );
}

export function CheckInSearch({ members, date }: { members: RosterMember[]; date: string }) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);

  const results = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return members.slice(0, 8);
    return members
      .filter(
        (member) => member.name.toLowerCase().includes(term) || member.phone.includes(term),
      )
      .slice(0, 12);
  }, [members, query]);

  return (
    <>
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
        <input
          type="search"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder="Search member name or phone to check in"
          className="w-full border border-line bg-ink py-3 pl-9 pr-3 text-sm text-text placeholder:text-muted/60 focus:border-brand-red focus:outline-none"
        />
      </div>

      <Modal
        open={open && results.length > 0}
        onClose={() => setOpen(false)}
        title={`Check in · ${date}`}
        description="Tap present to mark arrival. Tap again to undo."
      >
        <ul className="divide-y divide-line">
          {results.map((member) => (
            <li key={member.id} className="flex items-center justify-between gap-3 py-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-text">{member.name}</p>
                <p className="text-xs text-muted">{member.phone}</p>
              </div>
              <div className="w-40 shrink-0">
                <AttendanceToggle memberId={member.id} date={date} present={member.present} />
              </div>
            </li>
          ))}
        </ul>
      </Modal>
    </>
  );
}