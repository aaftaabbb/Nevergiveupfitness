export const brand = {
  name: "Never Give Up Fitness",
  tagline: "Strength & Devotion",
  positioning: "1st 24/7 GYM in Tungarphata & Sativali",
  phone: "9970249993",
  phoneDisplay: "+91 99702 49993",
  whatsappNumber: "919970249993",
  instagramHandle: "Never_giveup_fitness",
  address: {
    line1: "2nd Floor, Beside Rudra Shelter International Hotel",
    line2: "Tungarphata, Vasai (E)",
    line3: "Dist. Palghar - 401 208",
  },
  area: "Tungarphata, Vasai East, Palghar",
  mapQuery: "Rudra Shelter International Hotel, Tungarphata, Vasai East, Palghar, Maharashtra 401208",
  hours: "Open 24 hours, all 7 days",
  facilityHighlights: [
    "24/7 access",
    "Fully air conditioned",
    "All hi-tech gym equipment",
  ],
  trainer: {
    name: "Rahul Rajbali Singh",
    role: "Founder and Head Trainer",
    certifications: [
      "Certified Personal Trainer",
      "Certified Nutritionist",
      "Advanced Dietician",
      "Life Coach",
    ],
    note: "Every plan is written and reviewed by the owner. You train under the person who designed the program.",
  },
  /** Everything on the gym floor, grouped so the page reads like a price board. */
  services: [
    {
      name: "Body Building",
      detail: "Hypertrophy blocks built around volume, split routines and honest progress photos.",
    },
    {
      name: "Weightlifting",
      detail: "Squat, bench and deadlift technique first. The bar goes up slowly on purpose.",
    },
    {
      name: "Powerlifting",
      detail: "Total based training with a peaking cycle for tested lifts.",
    },
    {
      name: "Weight Loss",
      detail: "Calorie targets you can actually eat, checked every fortnight on the floor.",
    },
    {
      name: "Weight Gain",
      detail: "Lean mass with a surplus that is tracked, not guessed.",
    },
    {
      name: "Cardio",
      detail: "Treadmill, cross trainer, cycle and rowing, coached to your heart rate.",
    },
    {
      name: "Diet Counselling",
      detail: "Indian food, real portions, written down so you can follow it at home.",
    },
  ],
  /** Structured programs run with medical or lifestyle context. */
  programmes: [
    {
      name: "PCOD / PCOS",
      detail:
        "Strength work plus a calorie and activity plan built for hormonal, not crash, fat loss.",
    },
    {
      name: "Diabetes Reversal",
      detail:
        "Progressive training and diet coaching alongside your doctor's medication. Sugar markers are tracked every month.",
    },
  ],
  promo: {
    eyebrow: "Yearly membership offer",
    headline: "Join for a year, get a month free",
    points: [
      "1 month free personal training",
      "Written diet plan",
      "Body analysis",
      "Fitness test",
    ],
    note: "Talk to the owner before you pay. The offer is applied by hand on the floor.",
  },
  faqs: [
    {
      question: "Is the gym really open 24 hours?",
      answer:
        "Yes, all 7 days, including public holidays. Your access card works at any hour, so a night shift or an early gym before work both work.",
    },
    {
      question: "Do I need experience to join?",
      answer:
        "No. First timers start with a body analysis and a fitness test, then a plan that assumes nothing. Many members here had never touched a barbell before.",
    },
    {
      question: "Is personal training included?",
      answer:
        "Personal training is charged per session unless you take the yearly membership, which carries a free month of PT along with a written diet plan.",
    },
    {
      question: "Can I eat inside the gym?",
      answer:
        "Yes. Right Nutrition Café is inside the gym, with high protein sandwiches, cold pressed juices and natural peanut butter so a diet does not mean eating outside.",
    },
    {
      question: "Do you help with PCOD/PCOS and diabetes?",
      answer:
        "Both run as structured programs with progressive training and diet counselling. For diabetes, train with us and keep following your doctor's medication; we do not replace medical advice.",
    },
    {
      question: "How do I start?",
      answer:
        "Send the free trial request below, call the gym, or WhatsApp us. Rahul will show you the floor and explain the plans in person before you pay anything.",
    },
  ],
  cafe: {
    name: "Right Nutrition Café",
    intro:
      "Eat inside the gym without breaking your diet. The café is run on the same principle as the floor: measure it, then do it.",
    items: [
      {
        name: "High Protein Sandwiches",
        detail: "Grilled chicken, paneer and egg options with a macro count on the board.",
      },
      {
        name: "Healthy Juices",
        detail: "Cold pressed, no sugar added, available in regular and high-protein sizes.",
      },
      {
        name: "Peanut Butter",
        detail: "Natural, single-ingredient peanut butter. Ask for a scoop with your shake.",
      },
    ],
  },
} as const;

export type Brand = typeof brand;

/** Pre-filled WhatsApp deep link, used by the floating button and renewal reminders. */
export function whatsappLink(message: string) {
  return `https://wa.me/${brand.whatsappNumber}?text=${encodeURIComponent(message)}`;
}

/**
 * Pre-filled WhatsApp deep link to a member's own number, so a renewal reminder
 * opens a chat with that person rather than with the gym.
 */
export function whatsappMemberLink(phone: string, message: string) {
  const digits = phone.replace(/\D/g, "").replace(/^0+/, "");
  const withCountryCode = digits.length === 10 ? `91${digits}` : digits;
  if (!withCountryCode) return whatsappLink(message);
  return `https://wa.me/${withCountryCode}?text=${encodeURIComponent(message)}`;
}

export function instagramProfileUrl() {
  return `https://www.instagram.com/${brand.instagramHandle}/`;
}

export const instagramUrl = instagramProfileUrl();

/** tel: link used for every call to action, valid on desktop and mobile. */
export const callHref = `tel:+91${brand.phone}`;

/** Plain-text address for map links and structured data. */
export const addressOneLine = `${brand.address.line1}, ${brand.address.line2}, ${brand.address.line3}`;

export function googleMapEmbedUrl() {
  return `https://www.google.com/maps?q=${encodeURIComponent(brand.mapQuery)}&output=embed`;
}

export function googleMapDirectionsUrl() {
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(brand.mapQuery)}`;
}
