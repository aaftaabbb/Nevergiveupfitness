import { Suspense } from "react";
import { SkeletonRows } from "@/components/admin/empty-state";
import { MembersView } from "@/components/admin/members-view";
import { listMembers, listPlans } from "@/lib/dal/admin";
import type { PlanOption } from "@/components/admin/member-form-parts";

export const metadata = { title: "Members" };

type MembersPageProps = {
  searchParams: Promise<{ status?: string; plan?: string; search?: string }>;
};

export default async function AdminMembersPage({ searchParams }: MembersPageProps) {
  const { status = "all", plan = "all", search = "" } = await searchParams;

  const validStatuses = ["all", "active", "expiring", "expired"] as const;
  const statusFilter = validStatuses.includes(status as never)
    ? (status as (typeof validStatuses)[number])
    : "all";
  const planMonths = plan !== "all" ? Number(plan) : undefined;

  const [members, plans] = await Promise.all([
    listMembers({
      search: search || undefined,
      status: statusFilter,
      planMonths: Number.isFinite(planMonths) ? planMonths : undefined,
    }),
    listPlans({ includeInactive: false }),
  ]);

  const planOptions: PlanOption[] = plans.map((planDoc) => ({
    id: String(planDoc._id),
    name: planDoc.name,
    months: planDoc.months,
    price: planDoc.price,
    includesFreeTrainingMonth: planDoc.includesFreeTrainingMonth,
  }));

  return (
    <Suspense fallback={<SkeletonRows rows={6} />}>
      <MembersView members={members} plans={planOptions} />
    </Suspense>
  );
}
