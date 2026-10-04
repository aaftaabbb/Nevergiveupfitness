import "server-only";

import { connectToDatabase } from "@/lib/db/mongoose";
import { Plan } from "@/models";

export type PublicPlan = {
  id: string;
  name: string;
  months: number;
  price: number;
  highlight: string;
  features: string[];
  includesFreeTrainingMonth: boolean;
};

/**
 * Active plans for the public pricing page. Deliberately has no session check,
 * and never throws: a pricing page that 500s because the database is briefly
 * unreachable is worse than a page that asks the visitor to call.
 */
export async function listPublicPlans(): Promise<PublicPlan[]> {
  try {
    await connectToDatabase();
    const plans = await Plan.find({ active: true }).sort({ sortOrder: 1, months: 1 }).lean();

    return plans.map((plan) => ({
      id: String(plan._id),
      name: plan.name,
      months: plan.months,
      price: plan.price,
      highlight: plan.highlight,
      features: plan.features ?? [],
      includesFreeTrainingMonth: plan.includesFreeTrainingMonth,
    }));
  } catch (error) {
    console.error("Could not load public plans:", error);
    return [];
  }
}