import Link from "next/link";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { MarkAsPaidButton, RecordPaymentButton } from "@/components/admin/payment-controls";
import { StatusBadge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/admin/empty-state";
import { listMembersForPicker, listPayments, listPlans } from "@/lib/dal/admin";
import { formatRupees } from "@/lib/format";
import { formatDate } from "@/lib/dates";

export const metadata = { title: "Payments" };

type PaymentsPageProps = {
  searchParams: Promise<{ search?: string; status?: string }>;
};

export default async function AdminPaymentsPage({ searchParams }: PaymentsPageProps) {
  const { search = "", status = "all" } = await searchParams;

  const [payments, members, plans] = await Promise.all([
    listPayments({ search: search || undefined, status }),
    listMembersForPicker(),
    listPlans({ includeInactive: false }),
  ]);

  const collectedTotal = payments
    .filter((payment) => payment.status === "paid")
    .reduce((sum, payment) => sum + payment.amount, 0);
  const pendingTotal = payments
    .filter((payment) => payment.status === "pending")
    .reduce((sum, payment) => sum + payment.amount, 0);

  const pickerMembers = members.map((member) => ({
    id: String(member._id),
    name: member.name,
    phone: member.phone,
    expiryDate: member.expiryDate,
    dues: member.dues,
  }));

  const planOptions = plans.map((plan) => ({
    id: String(plan._id),
    name: plan.name,
    months: plan.months,
    price: plan.price,
  }));

  const statusLinks = [
    { value: "all", label: "All" },
    { value: "paid", label: "Collected" },
    { value: "pending", label: "Pending" },
  ];

  return (
    <>
      <AdminPageHeader
        title="Payments"
        description={`${formatRupees(collectedTotal)} collected · ${formatRupees(pendingTotal)} promised`}
        action={<RecordPaymentButton members={pickerMembers} plans={planOptions} />}
      />

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <form className="flex flex-1 gap-2 sm:max-w-sm">
          <label htmlFor="payment-search" className="sr-only">
            Search payments
          </label>
          <input
            id="payment-search"
            name="search"
            defaultValue={search}
            placeholder="Search member name or phone"
            className="w-full border border-line bg-ink px-3 py-3 text-sm text-text placeholder:text-muted/60 focus:border-brand-red focus:outline-none"
          />
          <button
            type="submit"
            className="border border-brand-red px-4 text-[11px] font-bold uppercase tracking-[0.12em] text-text transition-colors hover:bg-brand-red"
          >
            Go
          </button>
        </form>

        <div className="flex gap-2">
          {statusLinks.map((link) => (
            <Link
              key={link.value}
              href={`/admin/payments?status=${link.value}${search ? `&search=${encodeURIComponent(search)}` : ""}`}
              className={`border px-3 py-2.5 text-[10px] font-bold uppercase tracking-[0.12em] transition-colors ${
                status === link.value
                  ? "border-brand-red bg-brand-red text-text"
                  : "border-line text-muted hover:border-brand-red hover:text-text"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>

      {payments.length === 0 ? (
        <EmptyState
          title="No payments here"
          description={
            search
              ? `Nothing matched "${search}". Try a different name or phone.`
              : "Record a payment to start the ledger."
          }
        />
      ) : (
        <>
          {/* Phone layout */}
          <ul className="space-y-2 lg:hidden">
            {payments.map((payment) => (
              <li key={payment.id} className="card p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <Link
                      href={`/admin/members/${payment.memberId}`}
                      className="block truncate text-sm font-semibold text-text underline-offset-2 hover:underline"
                    >
                      {payment.memberName}
                    </Link>
                    <p className="mt-1 text-xs text-muted">{payment.memberPhone}</p>
                  </div>
                  <StatusBadge status={payment.status} />
                </div>

                <p className="mt-3 text-xs text-muted">
                  {formatDate(payment.paidOn)} · {payment.mode}
                  {payment.planMonths > 0 ? ` · ${payment.planName} (${payment.planMonths}m)` : ""}
                </p>
                {payment.note ? <p className="mt-1 text-xs text-muted">{payment.note}</p> : null}

                <div className="mt-3 flex items-center justify-between gap-3">
                  <span className="font-display text-2xl text-brand-gold">
                    {formatRupees(payment.amount)}
                  </span>
                  {payment.status === "pending" ? <MarkAsPaidButton paymentId={payment.id} /> : null}
                </div>
              </li>
            ))}
          </ul>

          {/* Desktop layout */}
          <div className="scrollbar-thin hidden overflow-x-auto lg:block">
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-line">
                  {["Member", "Plan", "Date", "Mode", "Status", "Amount", ""].map((header) => (
                    <th
                      key={header}
                      scope="col"
                      className={`px-4 py-3 text-[11px] font-bold uppercase tracking-[0.14em] text-muted ${
                        header === "Amount" ? "text-right" : ""
                      }`}
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {payments.map((payment) => (
                  <tr key={payment.id} className="border-b border-line/60 last:border-0">
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/members/${payment.memberId}`}
                        className="font-semibold text-text underline-offset-2 hover:text-brand-red hover:underline"
                      >
                        {payment.memberName}
                      </Link>
                      <p className="text-xs text-muted">{payment.memberPhone}</p>
                    </td>
                    <td className="px-4 py-3 text-muted">
                      {payment.planMonths > 0 ? `${payment.planName} (${payment.planMonths}m)` : "—"}
                      {payment.note ? <p className="text-xs">{payment.note}</p> : null}
                    </td>
                    <td className="px-4 py-3 text-muted">{formatDate(payment.paidOn)}</td>
                    <td className="px-4 py-3 text-muted">{payment.mode}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={payment.status} />
                    </td>
                    <td className="px-4 py-3 text-right font-display text-lg text-brand-gold">
                      {formatRupees(payment.amount)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {payment.status === "pending" ? (
                        <MarkAsPaidButton paymentId={payment.id} />
                      ) : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </>
  );
}
