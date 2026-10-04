import { listPlans } from "@/lib/dal/admin";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { DeletePlanButton, PlanEditor, TogglePlanButton } from "@/components/admin/plan-editor";
import { EmptyState } from "@/components/admin/empty-state";
import { formatRupees } from "@/lib/format";

export const metadata = { title: "Plans" };

export default async function AdminPlansPage() {
  const plans = await listPlans();

  // Cheapest monthly price, used to show the saving on longer plans.
  const monthlyPrice = plans.find((plan) => plan.months === 1)?.price ?? 0;

  return (
    <>
      <AdminPageHeader
        title="Plans"
        description="Expiry dates are calculated from these months on every signup and renewal."
        action={<PlanEditor />}
      />

      {plans.length === 0 ? (
        <EmptyState
          title="No plans yet"
          description="Add your first membership plan to start signing members up."
        />
      ) : (
        <ul className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {plans.map((plan) => {
            const fullPrice = monthlyPrice * plan.months;
            const saving = fullPrice > 0 ? fullPrice - plan.price : 0;
            const savingPercent =
              fullPrice > 0 ? Math.round((saving / fullPrice) * 100) : 0;

            // Mongoose lean() does not carry the array element type through.
            const planFeatures: string[] = plan.features ?? [];

            return (
              <li
                key={String(plan._id)}
                className={`card flex flex-col p-5 ${plan.active ? "" : "opacity-60"}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h2 className="text-3xl text-text">{plan.name}</h2>
                    <p className="mt-1 text-xs uppercase tracking-[0.16em] text-muted">
                      {plan.months} month{plan.months === 1 ? "" : "s"}
                    </p>
                  </div>
                  <span
                    className={`px-2 py-1 text-[10px] font-bold uppercase tracking-[0.14em] ${
                      plan.active
                        ? "border border-status-active/50 text-status-active"
                        : "border border-line text-muted"
                    }`}
                  >
                    {plan.active ? "Active" : "Hidden"}
                  </span>
                </div>

                <p className="mt-4 font-display text-4xl text-brand-gold">
                  {formatRupees(plan.price)}
                </p>

                {saving > 0 ? (
                  <p className="mt-1 text-xs text-muted">
                    <span className="text-status-active">Save {formatRupees(saving)}</span> ({savingPercent}%
                    off month to month)
                  </p>
                ) : null}

                {plan.highlight ? (
                  <p className="mt-3 text-sm leading-relaxed text-text">{plan.highlight}</p>
                ) : null}

                {plan.includesFreeTrainingMonth ? (
                  <p className="mt-3 border-l-4 border-brand-gold bg-brand-gold/5 px-3 py-2 text-xs text-brand-gold">
                    Free 1 month PT + diet plan + body analysis + fitness test
                  </p>
                ) : null}

                {planFeatures.length > 0 ? (
                  <ul className="mt-4 flex-1 space-y-1.5">
                    {planFeatures.map((feature) => (
                      <li key={feature} className="flex gap-2 text-xs leading-relaxed text-muted">
                        <span className="mt-1.5 h-1 w-1 shrink-0 bg-brand-red" aria-hidden />
                        {feature}
                      </li>
                    ))}
                  </ul>
                ) : null}

                <div className="mt-5 flex items-center gap-2 border-t border-line pt-4">
                  <PlanEditor
                    plan={{
                      id: String(plan._id),
                      name: plan.name,
                      months: plan.months,
                      price: plan.price,
                      highlight: plan.highlight,
                      features: plan.features,
                      includesFreeTrainingMonth: plan.includesFreeTrainingMonth,
                      active: plan.active,
                    }}
                  />
                  <TogglePlanButton planId={String(plan._id)} isActive={plan.active} />
                  <DeletePlanButton planId={String(plan._id)} planName={plan.name} />
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <p className="mt-6 text-xs leading-relaxed text-muted">
        Changing a plan&apos;s price or months never rewrites existing memberships. Each member
        keeps the price and duration they joined on. To change someone&apos;s plan, edit them from
        the members list.
      </p>
    </>
  );
}
