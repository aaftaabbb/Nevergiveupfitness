import {
  Inbox,
  Users,
  CalendarCheck,
  UserCheck,
  Clock,
  Receipt,
  MessageCircle,
} from "lucide-react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { CollectionCard, StatCard } from "@/components/admin/stat-card";
import { StatusBadge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/admin/empty-state";
import { getDashboardStats } from "@/lib/dal/admin";
import { formatRupees, pluralize } from "@/lib/format";
import { formatDate, formatMonthYear, formatDateTime } from "@/lib/dates";
import { whatsappLink, whatsappMemberLink } from "@/lib/brand";
import Link from "next/link";

export const metadata = { title: "Dashboard" };

export default async function AdminDashboardPage() {
  const stats = await getDashboardStats();
  const monthLabel = formatMonthYear(new Date());

  return (
    <>
      <AdminPageHeader
        title="Dashboard"
        description={`${monthLabel} · updated just now`}
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          label="Active members"
          value={stats.activeMembers}
          icon={Users}
          hint={`${stats.totalMembers} members in total`}
          tone="green"
          href="/admin/members?status=active"
        />
        <StatCard
          label="Expiring in 7 days"
          value={stats.expiringSoon}
          icon={Clock}
          hint={stats.expiringSoon > 0 ? "Send a renewal reminder" : "Nothing expiring soon"}
          tone="gold"
          href="/admin/members?status=expiring"
        />
        <StatCard
          label="Pending dues"
          value={formatRupees(stats.pendingDues)}
          icon={Receipt}
          hint={`${pluralize(stats.expired, "expired membership")}`}
          tone={stats.pendingDues > 0 ? "red" : "default"}
        />
        <StatCard
          label="New enquiries"
          value={stats.newEnquiries}
          icon={Inbox}
          hint={stats.newEnquiries > 0 ? "Trial requests waiting" : "Inbox clear"}
          tone={stats.newEnquiries > 0 ? "red" : "default"}
          href="/admin/enquiries?status=new"
        />
      </div>

      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <CollectionCard amount={stats.monthCollection} />
        <StatCard
          label="Present today"
          value={stats.todayAttendance}
          icon={CalendarCheck}
          hint="Marked from the floor"
          href="/admin/attendance"
        />
        <StatCard
          label="Expired memberships"
          value={stats.expired}
          icon={UserCheck}
          hint={stats.expired > 0 ? "Collect dues or renew" : "All memberships valid"}
          tone={stats.expired > 0 ? "red" : "green"}
          href="/admin/members?status=expired"
        />
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section>
          <div className="mb-3 flex items-center justify-between gap-4">
            <h2 className="text-2xl text-text">Expiring soon</h2>
            <Link
              href="/admin/members?status=expiring"
              className="text-[11px] font-bold uppercase tracking-[0.14em] text-brand-red hover:underline"
            >
              View all
            </Link>
          </div>

          {stats.expiringList.length === 0 ? (
            <EmptyState
              title="No expiring memberships"
              description="Nobody's plan ends in the next 7 days. Good place to be."
            />
          ) : (
            <ul className="space-y-2">
              {stats.expiringList.map((member) => (
                <li key={member.id} className="card p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-text">{member.name}</p>
                      <p className="mt-1 text-xs text-muted">
                        {member.phone} · {member.planName}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusBadge status={member.status.status} />
                      <a
                        href={whatsappMemberLink(
                          member.phone,
                          `Hello ${member.name}, this is a reminder from Never Give Up Fitness. Your membership is valid till ${formatDate(
                            member.expiryDate,
                          )}. Renew it before it expires to keep your slot and your current plan. Call or WhatsApp 99702 49993.`,
                        )}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`Send renewal reminder to ${member.name} on WhatsApp`}
                        className="flex items-center gap-1.5 border border-status-active/50 px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-status-active transition-colors hover:bg-status-active hover:text-ink"
                      >
                        <MessageCircle className="h-3.5 w-3.5" aria-hidden />
                        {member.status.daysRemaining === 0
                          ? "Remind today"
                          : `${member.status.daysRemaining}d left`}
                      </a>
                    </div>
                  </div>
                  <p className="mt-2 text-xs text-muted">
                    Expires {formatDate(member.expiryDate)}
                    {member.dues > 0 ? ` · dues ${formatRupees(member.dues)}` : ""}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section>
          <div className="mb-3 flex items-center justify-between gap-4">
            <h2 className="text-2xl text-text">Recent payments</h2>
            <Link
              href="/admin/payments"
              className="text-[11px] font-bold uppercase tracking-[0.14em] text-brand-red hover:underline"
            >
              View all
            </Link>
          </div>

          {stats.recentPayments.length === 0 ? (
            <EmptyState
              title="No payments recorded"
              description="Collect a membership fee and it will show up here."
            />
          ) : (
            <ul className="space-y-2">
              {stats.recentPayments.map((payment) => (
                <li key={payment.id} className="card flex items-center justify-between gap-3 p-4">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-text">
                      {payment.memberName}
                    </p>
                    <p className="mt-1 text-xs text-muted">
                      {formatDate(payment.paidOn)} · {payment.mode}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <StatusBadge status={payment.status} />
                    <span className="font-display text-xl text-brand-gold">
                      {formatRupees(payment.amount)}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <section className="mt-8">
        <div className="mb-3 flex items-center justify-between gap-4">
          <h2 className="text-2xl text-text">Recent enquiries</h2>
          <Link
            href="/admin/enquiries"
            className="text-[11px] font-bold uppercase tracking-[0.14em] text-brand-red hover:underline"
          >
            Open inbox
          </Link>
        </div>

        {stats.recentEnquiries.length === 0 ? (
          <EmptyState
            title="No enquiries yet"
            description="Free trial requests from the website will land here."
          />
        ) : (
          <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {stats.recentEnquiries.map((enquiry) => (
              <li key={enquiry.id} className="card p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-text">{enquiry.name}</p>
                    <p className="mt-1 text-xs text-muted">
                      {enquiry.phone}
                      {enquiry.interest ? ` · ${enquiry.interest}` : ""}
                    </p>
                  </div>
                  <StatusBadge status={enquiry.status} />
                </div>
                <div className="mt-3 flex items-center justify-between gap-3">
                  <p className="text-xs text-muted">{formatDateTime(enquiry.createdAt)}</p>
                  <a
                    href={whatsappLink(
                      `Hello ${enquiry.name}, this is Rahul from Never Give Up Fitness. Thanks for your interest in a free trial. When would you like to visit?`,
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-status-active hover:underline"
                  >
                    <MessageCircle className="h-3.5 w-3.5" aria-hidden />
                    WhatsApp
                  </a>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
