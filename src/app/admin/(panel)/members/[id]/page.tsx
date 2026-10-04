import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { MemberProfileView } from "@/components/admin/member-profile-view";
import { getMemberDetail, listPlans } from "@/lib/dal/admin";
import { todayKey } from "@/lib/dates";
import type { PlanOption } from "@/components/admin/member-form-parts";

export const metadata = { title: "Member profile" };

export default async function AdminMemberDetailPage({
  params,
}: PageProps<"/admin/members/[id]">) {
  const { id } = await params;
  const [member, plans] = await Promise.all([getMemberDetail(id), listPlans()]);

  if (!member) notFound();

  const planOptions: PlanOption[] = plans.map((plan) => ({
    id: String(plan._id),
    name: plan.name,
    months: plan.months,
    price: plan.price,
    includesFreeTrainingMonth: plan.includesFreeTrainingMonth,
  }));

  return (
    <>
      <Link
        href="/admin/members"
        className="mb-4 inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-muted transition-colors hover:text-brand-red"
      >
        <ChevronLeft className="h-3.5 w-3.5" />
        All members
      </Link>

      <MemberProfileView
        member={{
          id: member.id,
          name: member.name,
          phone: member.phone,
          email: member.email,
          photoUrl: member.photoUrl,
          age: member.age,
          gender: member.gender,
          goal: member.goal,
          joiningDate: member.joiningDate,
          expiryDate: member.expiryDate,
          currentPlanName: member.currentPlanName,
          currentPlanMonths: member.currentPlanMonths,
          currentPlanPrice: member.currentPlanPrice,
          freeTrainingMonthIncluded: member.freeTrainingMonthIncluded,
          freeTrainingMonthUsed: member.freeTrainingMonthUsed,
          dues: member.dues,
          duesNote: member.duesNote,
          workoutPlan: member.workoutPlan,
          dietPlan: member.dietPlan,
          notes: member.notes,
          status: member.status,
          payments: member.payments,
          activityNotes: member.activityNotes,
          attendanceCount: member.attendanceCount,
          recentAttendanceDates: member.recentAttendanceDates,
          attendanceWindow: member.attendanceWindow,
        }}
        plans={planOptions}
        today={todayKey()}
      />
    </>
  );
}
