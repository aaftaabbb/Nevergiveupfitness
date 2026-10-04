import Link from "next/link";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { CheckInSearch, UndoCheckIn } from "@/components/admin/attendance-controls";
import { EmptyState } from "@/components/admin/empty-state";
import { getAttendanceForDay, getAttendanceRoster } from "@/lib/dal/admin";
import {
  addDaysToKey,
  formatDateLong,
  isValidDateKey,
  todayKey,
} from "@/lib/dates";

export const metadata = { title: "Attendance" };

type AttendancePageProps = {
  searchParams: Promise<{ date?: string }>;
};

export default async function AdminAttendancePage({ searchParams }: AttendancePageProps) {
  const { date: requested } = await searchParams;
  // A hand edited or missing date must not break the screen.
  const dateKey = requested && isValidDateKey(requested) ? requested : todayKey();
  const day = formatDateLong(dateKey);
  const isToday = dateKey === todayKey();

  const [dayView, roster] = await Promise.all([
    getAttendanceForDay(dateKey),
    getAttendanceRoster(dateKey),
  ]);

  const searchRoster = roster.map((member) => ({
    id: member.id,
    name: member.name,
    phone: member.phone,
    present: member.present,
  }));

  const previous = addDaysToKey(dateKey, -1);
  const next = addDaysToKey(dateKey, 1);

  return (
    <>
      <AdminPageHeader title="Attendance" description={day} />

      <div className="mb-4 flex items-center justify-between gap-2 border border-line bg-surface p-2">
        <Link
          href={`/admin/attendance?date=${previous}`}
          aria-label="Previous day"
          className="border border-line p-3 text-muted transition-colors hover:border-brand-red hover:text-text"
        >
          <ChevronLeft className="h-4 w-4" />
        </Link>

        <Link
          href="/admin/attendance"
          className={`flex items-center gap-2 px-3 py-2 text-[11px] font-bold uppercase tracking-[0.14em] transition-colors ${
            isToday
              ? "text-brand-red"
              : "text-muted hover:text-text"
          }`}
        >
          <CalendarDays className="h-4 w-4" />
          {isToday ? "Today" : "Back to today"}
        </Link>

        <Link
          href={`/admin/attendance?date=${next}`}
          aria-label="Next day"
          className="border border-line p-3 text-muted transition-colors hover:border-brand-red hover:text-text"
        >
          <ChevronRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="card p-4">
        <CheckInSearch members={searchRoster} date={dateKey} />
      </div>

      <section className="mt-6">
        <div className="mb-3 flex items-baseline justify-between">
          <h2 className="text-xl text-text">Checked in</h2>
          <p className="text-xs uppercase tracking-[0.16em] text-muted">
            {dayView.count} {dayView.count === 1 ? "member" : "members"}
          </p>
        </div>

        {dayView.count === 0 ? (
          <EmptyState
            title="No check ins on this day"
            description={
              isToday
                ? "Search for a member above and tap mark present. It takes one tap per member."
                : "Nobody was recorded for this day. Use the arrows to move to another date."
            }
          />
        ) : (
          <ul className="card divide-y divide-line">
            {dayView.members.map((member) => (
              <li key={member.id} className="flex items-center justify-between gap-3 p-4">
                <div className="min-w-0">
                  <Link
                    href={`/admin/members/${member.id}`}
                    className="block truncate text-sm font-semibold text-text underline-offset-2 hover:underline"
                  >
                    {member.name}
                  </Link>
                  <p className="text-xs text-muted">
                    {member.phone} · {member.time}
                  </p>
                </div>
                <UndoCheckIn memberId={member.id} date={dateKey} />
              </li>
            ))}
          </ul>
        )}
      </section>

      <p className="mt-6 text-xs leading-relaxed text-muted">
        Check ins are stored as a date plus time. Undo removes the entry, so a mistaken tap never
        leaves a fake record behind.
      </p>
    </>
  );
}