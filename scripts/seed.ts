import { Admin } from "@/models";

/**
 * Creates or resets the owner account. Safe to run more than once: it only
 * writes when the username does not exist yet unless --force is passed.
 *
 *   npm run seed                    -> plans, demo members, payments, enquiries
 *   npm run seed -- --clean         -> wipe all gym data, keep only owner + plans
 *   npm run seed -- --force         -> also reset the owner password
 *   npm run seed -- --clean --force -> clean everything and reset the owner
 *
 * --clean is what you run before going live: it drops every member, payment,
 * attendance entry, note and enquiry, and puts the plan prices back to the
 * defaults so the owner can set the real ones in the admin panel.
 */
const RESET_ADMIN = process.argv.includes("--force");
const CLEAN = process.argv.includes("--clean");

const ADMIN_NAME = "Rahul Rajbali Singh";

const OWNER_PHONE = "9970249993";
const OWNER_WHATSAPP = "919970249993";

/**
 * Read after loadEnvConfig() has run, so ADMIN_PASSWORD in .env.local is
 * actually picked up instead of silently falling back to the default.
 */
let adminUsername = "rahul";
let adminPassword = "NeverGiveUp@2026";

function readAdminEnv() {
  adminUsername = process.env.ADMIN_USERNAME?.trim() || "rahul";
  adminPassword = process.env.ADMIN_PASSWORD?.trim() || "NeverGiveUp@2026";
}

async function upsertOwner() {
  const existing = await Admin.findOne({ username: adminUsername });

  if (existing && !RESET_ADMIN) {
    console.log(`  Owner account "${adminUsername}" already exists, left untouched.`);
    return;
  }

  const { hash } = await import("bcryptjs");
  const passwordHash = await hash(adminPassword, 12);

  await Admin.findOneAndUpdate(
    { username: adminUsername },
    {
      $set: {
        name: ADMIN_NAME,
        passwordHash,
        role: "owner",
        lastLoginAt: null,
      },
    },
    { upsert: true, returnDocument: "after", setDefaultsOnInsert: true },
  );

  if (existing) {
    console.log(`  Owner password reset for "${adminUsername}".`);
  } else {
    console.log(`  Owner account created. Username: ${adminUsername}`);
  }
}

/** Inclusive day arithmetic in IST so seeded dates land on the days we intend. */
function daysFromToday(days: number) {
  const shifted = new Date(Date.now() + 5.5 * 60 * 60 * 1000);
  const base = Date.UTC(shifted.getUTCFullYear(), shifted.getUTCMonth(), shifted.getUTCDate());
  return new Date(base + days * 86_400_000);
}

const PLAN_SEED = [
  {
    name: "Monthly",
    months: 1,
    price: 1500,
    highlight: "Gym floor access, 24/7",
    features: [
      "24/7 gym access",
      "Air conditioned training floor",
      "All hi-tech equipment",
      "Locker facility",
    ],
    includesFreeTrainingMonth: false,
    sortOrder: 1,
  },
  {
    name: "Quarterly",
    months: 3,
    price: 4000,
    highlight: "Three months of consistent work",
    features: [
      "Everything in Monthly",
      "One body composition check",
      "Basic diet guidance",
      "Priority locker",
    ],
    includesFreeTrainingMonth: false,
    sortOrder: 2,
  },
  {
    name: "Half Yearly",
    months: 6,
    price: 7500,
    highlight: "Best value for a serious commitment",
    features: [
      "Everything in Quarterly",
      "Two progress reviews",
      "Structured diet plan",
      "Guest pass for one friend",
    ],
    includesFreeTrainingMonth: false,
    sortOrder: 3,
  },
  {
    name: "Yearly",
    months: 12,
    price: 14000,
    highlight: "Free 1 month personal training + diet plan + body analysis + fitness test",
    features: [
      "Everything in Half Yearly",
      "Free 1 month personal training",
      "Free personalised diet plan",
      "Free body analysis",
      "Free fitness test",
    ],
    includesFreeTrainingMonth: true,
    sortOrder: 4,
  },
];

type MemberSeed = {
  name: string;
  phone: string;
  age: number;
  gender: "male" | "female";
  goal: string;
  planMonths: number;
  planName: string;
  planPrice: number;
  joinedDaysAgo: number;
  dues?: number;
  duesNote?: string;
  freeTrainingMonthIncluded?: boolean;
  freeTrainingMonthUsed?: boolean;
  attendanceDaysAgo: number[];
  workouts?: string;
  diet?: string;
  notes?: string;
};

const MEMBER_SEED: MemberSeed[] = [
  {
    name: "Prashant Jadhav",
    phone: "9820114477",
    age: 29,
    gender: "male",
    goal: "Weight loss",
    planMonths: 12,
    planName: "Yearly",
    planPrice: 14000,
    joinedDaysAgo: 210,
    freeTrainingMonthIncluded: true,
    freeTrainingMonthUsed: true,
    attendanceDaysAgo: [0, 1, 3, 4, 5, 8],
    workouts:
      "Mon / Wed / Fri: Chest, shoulders, triceps.\nTue / Thu: Back and biceps.\nSat: Legs and core.\nCardio: 15 min incline walk after every session.",
    diet: "2,100 kcal. 180g protein. Rice at lunch, roti at dinner. No sugar, no fried food. One fruit daily.",
    notes: "Left shoulder impingement. Keep overhead press to neutral grip only.",
  },
  {
    name: "Sneha Patil",
    phone: "9769112845",
    age: 27,
    gender: "female",
    goal: "PCOD / PCOS",
    planMonths: 6,
    planName: "Half Yearly",
    planPrice: 7500,
    joinedDaysAgo: 96,
    attendanceDaysAgo: [1, 2, 4, 6, 7],
    workouts:
      "Mon / Thu: Lower body and glutes.\nTue / Fri: Upper body push.\nWed / Sat: Upper body pull and core.\nDaily: 8,000 steps minimum.",
    diet: "1,700 kcal, low glycemic. No maida, no packaged snacks. Add 1 tsp flaxseed daily. Cycle tracking noted in the app sheet.",
    notes: "PCOD. Tracking cycle and weight weekly. Referring gynaecologist advised low-carb approach.",
  },
  {
    name: "Imran Shaikh",
    phone: "9004551288",
    age: 34,
    gender: "male",
    goal: "Diabetes reversal",
    planMonths: 3,
    planName: "Quarterly",
    planPrice: 4000,
    joinedDaysAgo: 58,
    attendanceDaysAgo: [0, 2, 3, 5, 6],
    workouts:
      "Mon / Wed / Fri: Full body compound circuit.\nTue / Thu: 30 min brisk walk, 5.5 km/h target.\nSat: Mobility and stretching only.",
    diet: "1,800 kcal. Zero sugar, zero juice. Two portions of vegetables at every meal. HbA1c retest in 6 weeks.",
    notes: "Type 2 diabetes, HbA1c 8.1 in May. Tracking sugar readings every Sunday.",
  },
  {
    name: "Anjali More",
    phone: "9321456708",
    age: 24,
    gender: "female",
    goal: "Weight gain",
    planMonths: 1,
    planName: "Monthly",
    planPrice: 1500,
    joinedDaysAgo: 22,
    dues: 1500,
    duesNote: "July renewal not collected yet",
    attendanceDaysAgo: [1, 3, 5, 7],
    workouts:
      "Mon / Wed / Fri: Push day.\nTue / Thu: Pull day.\nSat: Legs.\nFocus on compound lifts, progressive overload.",
    diet: "2,600 kcal, 120g protein. Peanut butter sandwich post workout, banana and milk twice a day.",
  },
  {
    name: "Vikram Rathod",
    phone: "8087745612",
    age: 41,
    gender: "male",
    goal: "Powerlifting",
    planMonths: 6,
    planName: "Half Yearly",
    planPrice: 7500,
    joinedDaysAgo: 140,
    freeTrainingMonthIncluded: false,
    attendanceDaysAgo: [0, 1, 2, 3, 4, 5, 6],
    workouts:
      "Squat and bench twice a week, deadlift once. Accessories after main lifts. 5 x 5 on the big three.",
    diet: "2,900 kcal, 200g protein. Ghee and dry fruits included. Weigh-in every month, same day, morning.",
    notes: "Preparing for a 90 kg deadlift attempt. Very consistent, no missed weeks.",
  },
  {
    name: "Kavita Nair",
    phone: "9867245910",
    age: 31,
    gender: "female",
    goal: "Weight loss",
    planMonths: 1,
    planName: "Monthly",
    planPrice: 1500,
    joinedDaysAgo: 8,
    attendanceDaysAgo: [0, 2],
    workouts:
      "Mon / Fri: Full body.\nTue / Wed / Thu / Sat: 30 min brisk walk.\nSunday: rest.",
    diet: "1,600 kcal. Two meals plus one snack. Weigh-in every Monday, morning, empty stomach.",
    notes: "New join. Post part two, cleared for training by her doctor.",
  },
  {
    name: "Rohit Deshmukh",
    phone: "9022558890",
    age: 26,
    gender: "male",
    goal: "Muscle building",
    planMonths: 3,
    planName: "Quarterly",
    planPrice: 4000,
    joinedDaysAgo: 74,
    attendanceDaysAgo: [1, 3, 4, 6, 8, 9],
    workouts:
      "Push / Pull / Legs split, six days a week. One rest day, Sunday. Track every set in the phone notes.",
    diet: "2,400 kcal, 170g protein. Whey protein with milk after training. Home cooked food only otherwise.",
  },
  {
    name: "Meera Kamble",
    phone: "9978552301",
    age: 37,
    gender: "female",
    goal: "General fitness",
    planMonths: 3,
    planName: "Quarterly",
    planPrice: 4000,
    joinedDaysAgo: 80,
    dues: 2000,
    duesNote: "Partial payment received, balance pending",
    attendanceDaysAgo: [0, 3, 6],
    workouts: "Mon / Wed / Fri: Full body circuit. Tue / Thu: Yoga and stretching. Sat: Family walk.",
    diet: "1,900 kcal, balanced plate method. No strict restrictions, portion control only.",
  },
  {
    name: "Sandeep Yadav",
    phone: "9158874120",
    age: 45,
    gender: "male",
    goal: "Weight loss",
    planMonths: 12,
    planName: "Yearly",
    planPrice: 14000,
    joinedDaysAgo: 300,
    freeTrainingMonthIncluded: true,
    freeTrainingMonthUsed: true,
    attendanceDaysAgo: [0, 1, 2, 4, 5],
    workouts:
      "Mon / Wed / Fri: Machine based strength, low impact.\nTue / Thu: 25 min cycle.\nDaily target: 7,000 steps.",
    diet: "1,850 kcal. Knee friendly protein sources. Blood sugar checked monthly, currently stable.",
    notes: "Knee replacement in 2024. No heavy loaded squats. Cleared for guided machine work.",
  },
  {
    name: "Pooja Bhosale",
    phone: "9633447812",
    age: 22,
    gender: "female",
    goal: "Weight loss",
    planMonths: 1,
    planName: "Monthly",
    planPrice: 1500,
    joinedDaysAgo: 25,
    dues: 1500,
    duesNote: "Renewal due, reminder sent on WhatsApp",
    attendanceDaysAgo: [1, 2, 4, 6],
    workouts: "Mon / Wed / Fri: Strength. Tue / Thu / Sat: Cardio 25 min. Sunday rest.",
    diet: "1,650 kcal, 110g protein. Two litres of water daily. No late night eating.",
  },
];

const ENQUIRY_SEED = [
  {
    name: "Nikhil Chavan",
    phone: "9167332288",
    interest: "Yearly membership",
    message: "Interested in the yearly plan with free personal training. Can I visit this evening?",
    status: "new" as const,
  },
  {
    name: "Farhan Qureshi",
    phone: "9988224466",
    interest: "Weight loss",
    message: "Want to lose 12 kg before December. Please share your evening batch timings.",
    status: "new" as const,
  },
  {
    name: "Ritu Sharma",
    phone: "8855667744",
    interest: "PCOD / PCOS program",
    message: "Looking for the PCOS program. Is the diet plan included or charged separately?",
    status: "contacted" as const,
    handledNote: "Called at 7 pm, asked her to visit for a free body analysis on Saturday.",
  },
  {
    name: "Ajay Pawar",
    phone: "7722994466",
    interest: "Monthly membership",
    message: "Just shifting to Tungarphata. Do you have monthly plans without annual commitment?",
    status: "new" as const,
  },
];

async function seed() {
  // Loaded before any module reads process.env, so MONGODB_URI and
  // SESSION_SECRET resolve the same way they do in the Next.js runtime.
  const { loadEnvConfig } = await import("@next/env");
  loadEnvConfig(process.cwd());
  readAdminEnv();

  const { connectToDatabase } = await import("../src/lib/db/mongoose");
  const { Plan, Member, Payment, Attendance, Enquiry, MemberNote } = await import(
    "../src/models"
  );
  const { membershipStatusOf, calculateExpiryDate } = await import("../src/lib/membership");

  console.log("Never Give Up Fitness - seed script\n");

  await connectToDatabase();
  console.log("Connected to MongoDB.");

  console.log("\nOwner account");
  await upsertOwner();

  console.log("\nPlans");
  for (const plan of PLAN_SEED) {
    await Plan.findOneAndUpdate(
      { name: plan.name },
      { $set: { ...plan, active: true } },
      { upsert: true, returnDocument: "after", setDefaultsOnInsert: true },
    );
    console.log(`  ${plan.name} (${plan.months} months) - Rs ${plan.price}`);
  }

  const plans = await Plan.find().lean();
  const planByMonths = new Map(plans.map((plan) => [plan.months, plan]));

  if (CLEAN) {
    console.log("\nCleaning gym data");
    const [members, payments, attendance, notes, enquiries] = await Promise.all([
      Member.deleteMany({}),
      Payment.deleteMany({}),
      Attendance.deleteMany({}),
      MemberNote.deleteMany({}),
      Enquiry.deleteMany({}),
    ]);
    console.log(`  Removed ${members.deletedCount} members`);
    console.log(`  Removed ${payments.deletedCount} payments`);
    console.log(`  Removed ${attendance.deletedCount} attendance entries`);
    console.log(`  Removed ${notes.deletedCount} notes`);
    console.log(`  Removed ${enquiries.deletedCount} enquiries`);

    console.log(
      `\nDone. Empty gym: plans and the owner account are ready, no member data.`,
    );
    if (!RESET_ADMIN) {
      console.log(
        `Sign in at /admin/login with username "${adminUsername}" and the ADMIN_PASSWORD from .env.local.`,
      );
    }
    return;
  }

  console.log("\nMembers");
  for (const seedMember of MEMBER_SEED) {
    const plan = planByMonths.get(seedMember.planMonths);
    const joiningDate = daysFromToday(-seedMember.joinedDaysAgo);
    const expiryDate = calculateExpiryDate({
      joiningDate,
      months: seedMember.planMonths,
      mode: "new",
    });
    const status = membershipStatusOf({ expiryDate });

    const member = await Member.findOneAndUpdate(
      { phone: seedMember.phone },
      {
        $set: {
          name: seedMember.name,
          age: seedMember.age,
          gender: seedMember.gender,
          goal: seedMember.goal,
          joiningDate,
          expiryDate,
          currentPlanMonths: seedMember.planMonths,
          currentPlanName: plan?.name ?? seedMember.planName,
          currentPlanPrice: plan?.price ?? seedMember.planPrice,
          freeTrainingMonthIncluded:
            seedMember.freeTrainingMonthIncluded ?? Boolean(plan?.includesFreeTrainingMonth),
          freeTrainingMonthUsed: seedMember.freeTrainingMonthUsed ?? false,
          dues: seedMember.dues ?? 0,
          duesNote: seedMember.duesNote ?? "",
          workoutPlan: seedMember.workouts ?? "",
          dietPlan: seedMember.diet ?? "",
          notes: seedMember.notes ?? "",
        },
      },
      { upsert: true, returnDocument: "after", setDefaultsOnInsert: true },
    );

    await Payment.findOneAndUpdate(
      { member: member._id, paidOn: joiningDate },
      {
        $set: {
          amount: plan?.price ?? seedMember.planPrice,
          mode: "cash",
          status: "paid",
          planMonths: seedMember.planMonths,
          planName: plan?.name ?? seedMember.planName,
          note: "Joining payment",
          collectedAt: joiningDate,
        },
      },
      { upsert: true, returnDocument: "after", setDefaultsOnInsert: true },
    );

    for (const daysAgo of seedMember.attendanceDaysAgo) {
      await Attendance.findOneAndUpdate(
        { member: member._id, date: isoDateKey(daysFromToday(-daysAgo)) },
        { $set: { markedBy: "owner" } },
        { upsert: true, returnDocument: "after", setDefaultsOnInsert: true },
      );
    }

    if (seedMember.notes) {
      await MemberNote.create({
        member: member._id,
        body: `Intake note (${joiningDate.toISOString().slice(0, 10)}): ${seedMember.notes}`,
      });
    }

    console.log(
      `  ${seedMember.name} - ${plan?.name ?? seedMember.planName}, expires ${expiryDate
        .toISOString()
        .slice(0, 10)} (${status.status})`,
    );
  }

  console.log("\nEnquiries");
  for (const enquiry of ENQUIRY_SEED) {
    const existing = await Enquiry.findOne({ phone: enquiry.phone });
    if (existing) continue;
    await Enquiry.create({
      ...enquiry,
      source: "website",
      handledAt: enquiry.status === "new" ? null : new Date(),
    });
    console.log(`  ${enquiry.name} (${enquiry.phone}) - ${enquiry.status}`);
  }

  const [memberCount, paymentCount, attendanceCount, enquiryCount] = await Promise.all([
    Member.countDocuments({}),
    Payment.countDocuments({}),
    Attendance.countDocuments({}),
    Enquiry.countDocuments({}),
  ]);

  console.log(
    `\nDone. ${memberCount} members, ${paymentCount} payments, ${attendanceCount} attendance entries, ${enquiryCount} enquiries.`,
  );
  if (!RESET_ADMIN) {
    console.log(
    `\nSign in at /admin/login with username "${adminUsername}" and the ADMIN_PASSWORD from .env.local.`,
  );
  }
  console.log(`\nWhatsApp reminders for the gym go to ${OWNER_WHATSAPP.slice(2)} (phone ${OWNER_PHONE}).`);
}

function isoDateKey(value: Date) {
  return value.toISOString().slice(0, 10);
}

seed()
  .then(async () => {
    const mongoose = (await import("mongoose")).default;
    await mongoose.disconnect();
    process.exit(0);
  })
  .catch(async (error) => {
    console.error("\nSeed failed:", error);
    const mongoose = (await import("mongoose")).default;
    await mongoose.disconnect();
    process.exit(1);
  });
