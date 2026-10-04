import "server-only";

import { verifySession } from "@/lib/auth/verify-session";
import { connectToDatabase } from "@/lib/db/mongoose";
import {
  addDays,
  currentIstMonthRange,
  formatDateTime,
  toDateKey,
  todayIst,
} from "@/lib/dates";
import { EXPIRING_WINDOW_DAYS, membershipStatusOf } from "@/lib/membership";
import { Attendance, Enquiry, Member, MemberNote, Payment, Plan } from "@/models";

/**
 * Data access layer for the admin panel. Every function verifies the session
 * first, so a new admin screen cannot accidentally read data unauthenticated.
 */

export type MemberListItem = {
  id: string;
  name: string;
  phone: string;
  photoUrl: string;
  joiningDate: Date;
  expiryDate: Date;
  planName: string;
  planMonths: number;
  dues: number;
  freeTrainingMonthIncluded: boolean;
  freeTrainingMonthUsed: boolean;
  status: ReturnType<typeof membershipStatusOf>;
};

function toMemberListItem(member: {
  _id: unknown;
  name: string;
  phone: string;
  photoUrl: string;
  joiningDate: Date;
  expiryDate: Date;
  currentPlanName: string;
  currentPlanMonths: number;
  dues: number;
  freeTrainingMonthIncluded: boolean;
  freeTrainingMonthUsed: boolean;
}): MemberListItem {
  return {
    id: String(member._id),
    name: member.name,
    phone: member.phone,
    photoUrl: member.photoUrl,
    joiningDate: member.joiningDate,
    expiryDate: member.expiryDate,
    planName: member.currentPlanName,
    planMonths: member.currentPlanMonths,
    dues: member.dues,
    freeTrainingMonthIncluded: member.freeTrainingMonthIncluded,
    freeTrainingMonthUsed: member.freeTrainingMonthUsed,
    status: membershipStatusOf({ expiryDate: member.expiryDate, dues: member.dues }),
  };
}

const MEMBER_SUMMARY_FIELDS =
  "name phone photoUrl joiningDate expiryDate currentPlanName currentPlanMonths dues freeTrainingMonthIncluded freeTrainingMonthUsed";

export type MemberFilters = {
  search?: string;
  status?: "all" | "active" | "expiring" | "expired";
  planMonths?: number;
};

export async function listMembers(filters: MemberFilters = {}) {
  await verifySession();
  await connectToDatabase();

  const query: Record<string, unknown> = {};

  if (filters.search) {
    // Escaped so a search for "a(b" cannot break the regex.
    const safe = filters.search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    query.$or = [
      { name: { $regex: safe, $options: "i" } },
      { phone: { $regex: safe } },
    ];
  }

  const now = new Date();
  if (filters.status && filters.status !== "all") {
    if (filters.status === "expired") {
      query.expiryDate = { $lt: todayIst(now) };
    } else if (filters.status === "expiring") {
      query.expiryDate = {
        $gte: todayIst(now),
        $lte: addDays(todayIst(now), EXPIRING_WINDOW_DAYS),
      };
    } else {
      query.expiryDate = { $gt: addDays(todayIst(now), EXPIRING_WINDOW_DAYS) };
    }
  }

  if (filters.planMonths) {
    query.currentPlanMonths = Number(filters.planMonths);
  }

  const members = await Member.find(query)
    .select(MEMBER_SUMMARY_FIELDS)
    .sort({ name: 1 })
    .lean();

  const items = members.map((member) => toMemberListItem(member as never));

  // A mixed "expiring" set is easier to act on sorted by urgency.
  if (filters.status === "expiring") {
    items.sort((a, b) => a.status.daysRemaining - b.status.daysRemaining);
  }

  return items;
}

export async function getMemberDetail(id: string) {
  await verifySession();
  await connectToDatabase();

  const member = await Member.findById(id).lean();
  if (!member) return null;

  const [payments, notes, attendanceCount, recentAttendance] = await Promise.all([
    Payment.find({ member: member._id }).sort({ paidOn: -1, createdAt: -1 }).lean(),
    MemberNote.find({ member: member._id }).sort({ createdAt: -1 }).lean(),
    Attendance.countDocuments({ member: member._id }),
    Attendance.find({ member: member._id })
      .sort({ date: -1 })
      .limit(14)
      .select("date")
      .lean(),
]);

  return {
    id: String(member._id),
    name: member.name,
    phone: member.phone,
    email: member.email,
    age: member.age,
    gender: member.gender as string,
    photoUrl: member.photoUrl,
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
    status: membershipStatusOf({ expiryDate: member.expiryDate, dues: member.dues }),
    payments: payments.map((payment) => ({
      id: String(payment._id),
      amount: payment.amount,
      paidOn: payment.paidOn,
      mode: payment.mode as string,
      status: payment.status as string,
      planMonths: payment.planMonths,
      planName: payment.planName,
      note: payment.note,
      collectedAt: payment.collectedAt,
    })),
    activityNotes: notes.map((note) => ({
      id: String(note._id),
      body: note.body,
      createdAt: note.createdAt,
    })),
    attendanceCount,
    recentAttendanceDates: recentAttendance.map((entry) => entry.date),
    // The last 14 IST days, newest first, so the profile can render a fixed
    // attendance strip without touching the clock during render.
    attendanceWindow: Array.from({ length: 14 }, (_, offset) =>
      toDateKey(addDays(todayIst(), -offset)),
    ),
  };
}

export async function listPlans({ includeInactive = true } = {}) {
  await verifySession();
  await connectToDatabase();
  return Plan.find(includeInactive ? {} : { active: true })
    .sort({ sortOrder: 1, months: 1 })
    .lean();
}

export type DashboardStats = {
  totalMembers: number;
  activeMembers: number;
  expiringSoon: number;
  expired: number;
  monthCollection: number;
  pendingDues: number;
  todayAttendance: number;
  newEnquiries: number;
  expiringList: MemberListItem[];
  recentPayments: {
    id: string;
    memberName: string;
    amount: number;
    paidOn: Date;
    mode: string;
    status: string;
  }[];
  recentEnquiries: {
    id: string;
    name: string;
    phone: string;
    interest: string;
    status: string;
    createdAt: Date;
  }[];
};

export async function getDashboardStats(): Promise<DashboardStats> {
  await verifySession();
  await connectToDatabase();

  const now = new Date();
  const startOfToday = todayIst(now);
  const endOfWindow = addDays(startOfToday, EXPIRING_WINDOW_DAYS);
  const monthRange = currentIstMonthRange(now);
  const todayKey = toDateKey(now);

  const [
    totalMembers,
    activeCount,
    expiringCount,
    expiredCount,
    collectionTotal,
    duesTotal,
    todayAttendance,
    newEnquiryCount,
    expiringDocs,
    recentPayments,
    recentEnquiries,
  ] = await Promise.all([
    Member.countDocuments({}),
    Member.countDocuments({ expiryDate: { $gt: endOfWindow } }),
    Member.countDocuments({ expiryDate: { $gte: startOfToday, $lte: endOfWindow } }),
    Member.countDocuments({ expiryDate: { $lt: startOfToday } }),
    // Sums happen inside MongoDB. Pulling every paid row into memory to add it
    // up in JS got slower as soon as the gym had a few hundred payments.
    Payment.aggregate<{ total: number }>([
      { $match: { status: "paid", paidOn: { $gte: monthRange.from, $lt: monthRange.to } } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]),
    Member.aggregate<{ total: number }>([
      { $match: { dues: { $gt: 0 } } },
      { $group: { _id: null, total: { $sum: "$dues" } } },
    ]),
    Attendance.countDocuments({ date: todayKey }),
    Enquiry.countDocuments({ status: "new" }),
    Member.find({ expiryDate: { $gte: startOfToday, $lte: endOfWindow } })
      .select(MEMBER_SUMMARY_FIELDS)
      .lean(),
    Payment.find({})
      .sort({ createdAt: -1 })
      .limit(6)
      .populate("member", "name")
      .lean(),
    Enquiry.find({}).sort({ createdAt: -1 }).limit(6).lean(),
  ]);

  const expiringList = expiringDocs
    .map((member) => toMemberListItem(member as never))
    .sort((a, b) => a.status.daysRemaining - b.status.daysRemaining);

  return {
    totalMembers,
    activeMembers: activeCount,
    expiringSoon: expiringCount,
    expired: expiredCount,
    monthCollection: collectionTotal[0]?.total ?? 0,
    pendingDues: duesTotal[0]?.total ?? 0,
    todayAttendance,
    newEnquiries: newEnquiryCount,
    expiringList,
    recentPayments: recentPayments.map((payment) => {
      const member = payment.member as unknown as { name: string } | null;
      return {
        id: String(payment._id),
        memberName: member?.name ?? "Removed member",
        amount: payment.amount,
        paidOn: payment.paidOn,
        mode: payment.mode as string,
        status: payment.status as string,
      };
    }),
    recentEnquiries: recentEnquiries.map((enquiry) => ({
      id: String(enquiry._id),
      name: enquiry.name,
      phone: enquiry.phone,
      interest: enquiry.interest,
      status: enquiry.status as string,
      createdAt: enquiry.createdAt,
    })),
  };
}

export type PaymentListItem = {
  id: string;
  memberId: string;
  memberName: string;
  memberPhone: string;
  amount: number;
  paidOn: Date;
  mode: string;
  status: string;
  planName: string;
  planMonths: number;
  note: string;
  collectedAt: Date | null;
};

export async function listPayments(filters: { search?: string; status?: string } = {}) {
  await verifySession();
  await connectToDatabase();

  const query: Record<string, unknown> = {};
  if (filters.status && filters.status !== "all") query.status = filters.status;

  const rows = await Payment.find(query)
    .populate("member", "name phone")
    .sort({ paidOn: -1, createdAt: -1 })
    .limit(200)
    .lean();

  const search = filters.search?.toLowerCase().trim();
  return rows
    .map((row) => {
      const member = row.member as unknown as { _id: unknown; name: string; phone: string } | null;
      return {
        id: String(row._id),
        memberId: member ? String(member._id) : "",
        memberName: member?.name ?? "Removed member",
        memberPhone: member?.phone ?? "",
        amount: row.amount,
        paidOn: row.paidOn,
        mode: row.mode as string,
        status: row.status as string,
        planName: row.planName,
        planMonths: row.planMonths,
        note: row.note,
        collectedAt: row.collectedAt,
      } satisfies PaymentListItem;
    })
    .filter((row) => {
      if (!search) return true;
      return (
        row.memberName.toLowerCase().includes(search) ||
        row.memberPhone.includes(search)
      );
    });
}

export async function listEnquiries(status = "all") {
  await verifySession();
  await connectToDatabase();

  const query = status && status !== "all" ? { status } : {};
  return Enquiry.find(query).sort({ createdAt: -1 }).limit(200).lean();
}

export type AttendanceDayView = {
  date: string;
  count: number;
  members: {
    id: string;
    name: string;
    phone: string;
    photoUrl: string;
    time: string;
  }[];
};

export async function getAttendanceForDay(dateKey: string): Promise<AttendanceDayView> {
  await verifySession();
  await connectToDatabase();

  const entries = await Attendance.find({ date: dateKey })
    .populate("member", "name phone photoUrl")
    .sort({ updatedAt: -1 })
    .lean();

  return {
    date: dateKey,
    count: entries.length,
    members: entries.map((entry) => {
      const member = entry.member as unknown as {
        _id: unknown;
        name: string;
        phone: string;
        photoUrl: string;
      };
      return {
        id: String(member._id),
        name: member.name,
        phone: member.phone,
        photoUrl: member.photoUrl,
        time: formatDateTime(entry.updatedAt),
      };
    }),
  };
}

/** Everyone on the roster for the day, flagged present or not, for check in. */
export type RosterMember = {
  id: string;
  name: string;
  phone: string;
  present: boolean;
  time: string;
};

export async function getAttendanceRoster(dateKey: string): Promise<RosterMember[]> {
  await verifySession();
  await connectToDatabase();

  const [members, entries] = await Promise.all([
    Member.find({})
      .select("name phone")
      .sort({ name: 1 })
      .limit(500)
      .lean(),
    Attendance.find({ date: dateKey })
      .populate("member", "name phone")
      .sort({ updatedAt: -1 })
      .lean(),
  ]);

  const entryByMemberId = new Map<string, (typeof entries)[number]>();
  for (const entry of entries) {
    const member = entry.member as unknown as { _id: unknown } | null;
    if (member) entryByMemberId.set(String(member._id), entry);
  }

  const roster = members.map((member) => {
    const entry = entryByMemberId.get(String(member._id));
    return {
      id: String(member._id),
      name: member.name,
      phone: member.phone,
      present: Boolean(entry),
      time: entry ? formatDateTime(entry.updatedAt) : "",
    };
  });

  // Checked in members first so the floor list is scannable.
  return roster.sort((a, b) => {
    if (a.present !== b.present) return a.present ? -1 : 1;
    return a.name.localeCompare(b.name);
  });
}

/** Recently active members, used to prefill the attendance search box. */
export async function listMembersForPicker() {
  await verifySession();
  await connectToDatabase();
  return Member.find({})
    .select("name phone photoUrl expiryDate dues")
    .sort({ name: 1 })
    .limit(500)
    .lean();
}
