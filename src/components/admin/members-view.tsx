"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Download, Search } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AddMemberButton, DeleteMemberButton, type PlanOption } from "@/components/admin/member-form-parts";
import { StatusBadge } from "@/components/ui/status-badge";
import { DataTable, type Column } from "@/components/admin/data-table";
import { EmptyState } from "@/components/admin/empty-state";
import { formatRupees, initialsOf } from "@/lib/format";
import { formatDate } from "@/lib/dates";
import type { MemberListItem } from "@/lib/dal/admin";

const STATUS_FILTERS = [
  { value: "all", label: "All" },
  { value: "active", label: "Active" },
  { value: "expiring", label: "Expiring" },
  { value: "expired", label: "Expired" },
];

function MemberAvatar({ name, photoUrl }: { name: string; photoUrl: string }) {
  if (photoUrl) {
    // Member photos are arbitrary user-supplied URLs, so plain img avoids
    // next/image remote pattern configuration for every host the owner uses.
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={photoUrl}
        alt={`${name} photo`}
        className="h-9 w-9 shrink-0 border border-line object-cover"
        loading="lazy"
      />
    );
  }
  return (
    <span
      aria-hidden
      className="flex h-9 w-9 shrink-0 items-center justify-center border border-line bg-surface-raised text-[11px] font-bold text-muted"
    >
      {initialsOf(name)}
    </span>
  );
}

function ExpiryHint({ member }: { member: MemberListItem }) {
  const { status, daysRemaining } = member.status;
  if (status === "expired") {
    return <span className="text-brand-red">Expired {Math.abs(daysRemaining)}d ago</span>;
  }
  if (status === "expiring") {
    return (
      <span className="text-brand-gold">
        {daysRemaining === 0 ? "Expires today" : `${daysRemaining}d left`}
      </span>
    );
  }
  return <span className="text-muted">Active</span>;
}

export function MembersView({ members, plans }: { members: MemberListItem[]; plans: PlanOption[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("search") ?? "");

  const activeStatus = searchParams.get("status") ?? "all";
  const activePlan = searchParams.get("plan") ?? "all";

  function applyFilters(next: { status?: string; plan?: string; search?: string }) {
    const params = new URLSearchParams(searchParams.toString());
    if (next.status !== undefined) params.set("status", next.status);
    if (next.plan !== undefined) params.set("plan", next.plan);
    if (next.search !== undefined) {
      if (next.search) params.set("search", next.search);
      else params.delete("search");
    }
    router.push(`/admin/members?${params.toString()}`);
  }

  const columns: Column<MemberListItem>[] = [
    {
      key: "member",
      header: "Member",
      cell: (member) => (
        <div className="flex items-center gap-3">
          <MemberAvatar name={member.name} photoUrl={member.photoUrl} />
          <div className="min-w-0">
            <p className="truncate font-semibold text-text">{member.name}</p>
            <p className="text-xs text-muted">{member.phone}</p>
          </div>
        </div>
      ),
    },
    {
      key: "plan",
      header: "Plan",
      cell: (member) => (
        <div>
          <p className="text-text">{member.planName}</p>
          <p className="text-xs text-muted">{member.planMonths} months</p>
        </div>
      ),
    },
    {
      key: "joining",
      header: "Joined",
      cell: (member) => <span className="text-muted">{formatDate(member.joiningDate)}</span>,
    },
    {
      key: "expiry",
      header: "Expiry",
      cell: (member) => (
        <div>
          <p className="text-text">{formatDate(member.expiryDate)}</p>
          <p className="text-xs">
            <ExpiryHint member={member} />
          </p>
        </div>
      ),
    },
    {
      key: "dues",
      header: "Dues",
      align: "right",
      cell: (member) =>
        member.dues > 0 ? (
          <span className="text-brand-red">{formatRupees(member.dues)}</span>
        ) : (
          <span className="text-muted">—</span>
        ),
    },
    {
      key: "status",
      header: "Status",
      cell: (member) => <StatusBadge status={member.status.status} />,
    },
    {
      key: "actions",
      header: "",
      align: "right",
      cell: (member) => (
        <div className="flex items-center justify-end gap-2">
          <a
            href={`/admin/members/${member.id}`}
            className="border border-line px-3 py-2 text-[10px] font-bold uppercase tracking-[0.12em] text-muted transition-colors hover:border-brand-red hover:text-text"
          >
            Open
          </a>
          <DeleteMemberButton memberId={member.id} memberName={member.name} />
        </div>
      ),
    },
  ];

  return (
    <>
      <AdminPageHeader
        title="Members"
        description={`${members.length} shown · ${plans.length} active plans`}
        action={
          <div className="flex flex-wrap gap-2">
            {/* A real CSV download from an API route, so an <a> with download is correct. */}
            <a
              href="/api/admin/members"
              download="members.csv"
              className="inline-flex items-center gap-2 border border-line px-4 py-3 text-[11px] font-bold uppercase tracking-[0.12em] text-muted transition-colors hover:border-brand-red hover:text-text"
            >
              <Download className="h-4 w-4" />
              Export CSV
            </a>
            <AddMemberButton plans={plans} />
          </div>
        }
      />

      <div className="card mb-4 p-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <form
            onSubmit={(event) => {
              event.preventDefault();
              applyFilters({ search });
            }}
            className="lg:col-span-2"
          >
            <label htmlFor="member-search" className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.16em] text-muted">
              Search
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                <input
                  id="member-search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Name or phone"
                  className="w-full border border-line bg-ink py-3 pl-9 pr-3 text-sm text-text placeholder:text-muted/60 focus:border-brand-red focus:outline-none"
                />
              </div>
              <button
                type="submit"
                className="border border-brand-red px-4 text-[11px] font-bold uppercase tracking-[0.12em] text-text transition-colors hover:bg-brand-red"
              >
                Go
              </button>
            </div>
          </form>

          <div>
            <label htmlFor="status-filter" className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.16em] text-muted">
              Status
            </label>
            <select
              id="status-filter"
              value={activeStatus}
              onChange={(event) => applyFilters({ status: event.target.value })}
              className="w-full border border-line bg-ink px-3 py-3 text-sm text-text focus:border-brand-red focus:outline-none"
            >
              {STATUS_FILTERS.map((filter) => (
                <option key={filter.value} value={filter.value}>
                  {filter.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="plan-filter" className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.16em] text-muted">
              Plan
            </label>
            <select
              id="plan-filter"
              value={activePlan}
              onChange={(event) => applyFilters({ plan: event.target.value })}
              className="w-full border border-line bg-ink px-3 py-3 text-sm text-text focus:border-brand-red focus:outline-none"
            >
              <option value="all">All plans</option>
              {plans.map((plan) => (
                <option key={plan.id} value={String(plan.months)}>
                  {plan.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <DataTable
        columns={columns}
        rows={members}
        rowKey={(member) => member.id}
        emptyState={
          <EmptyState
            title="No members match"
            description="Try a different search or clear the status filter."
          />
        }
        mobileCard={(member) => (
          <div className="card p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <MemberAvatar name={member.name} photoUrl={member.photoUrl} />
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-text">{member.name}</p>
                  <p className="text-xs text-muted">{member.phone}</p>
                </div>
              </div>
              <StatusBadge status={member.status.status} />
            </div>

            <dl className="mt-3 grid grid-cols-2 gap-2 text-xs">
              <div>
                <dt className="text-muted">Plan</dt>
                <dd className="text-text">{member.planName}</dd>
              </div>
              <div>
                <dt className="text-muted">Expiry</dt>
                <dd className="text-text">{formatDate(member.expiryDate)}</dd>
              </div>
              <div>
                <dt className="text-muted">Remaining</dt>
                <dd>
                  <ExpiryHint member={member} />
                </dd>
              </div>
              <div>
                <dt className="text-muted">Dues</dt>
                <dd className={member.dues > 0 ? "text-brand-red" : "text-muted"}>
                  {member.dues > 0 ? formatRupees(member.dues) : "—"}
                </dd>
              </div>
            </dl>

            <div className="mt-3 flex items-center gap-2">
              <a
                href={`/admin/members/${member.id}`}
                className="flex-1 border border-brand-red px-3 py-2.5 text-center text-[11px] font-bold uppercase tracking-[0.12em] text-text"
              >
                Open profile
              </a>
              <DeleteMemberButton memberId={member.id} memberName={member.name} />
            </div>
          </div>
        )}
      />
    </>
  );
}
