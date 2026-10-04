import type { Metadata } from "next";
import { Bebas_Neue, Inter } from "next/font/google";
import "./globals.css";
import { brand, addressOneLine, instagramUrl } from "@/lib/brand";

const bebasNeue = Bebas_Neue({
  variable: "--font-bebas",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

import { siteUrl } from "@/lib/site-url";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${brand.name} | ${brand.tagline}`,
    template: `%s | ${brand.name}`,
  },
  description: `${brand.positioning}. Fully air conditioned gym in Tungarphata, Vasai East with hi-tech equipment, personal training, diet counselling and in-house Right Nutrition Café.`,
  keywords: [
    "gym in Vasai East",
    "gym in Tungarphata",
    "24 hour gym Vasai",
    "gym in Sativali",
    "personal trainer Vasai",
    "weight loss gym Vasai East",
    "PCOD PCOS exercise Vasai",
    "diabetes reversal program Vasai",
    brand.name,
  ],
  authors: [{ name: brand.name }],
  creator: brand.name,
  openGraph: {
    type: "website",
    locale: "en_IN",
    siteName: brand.name,
    title: `${brand.name} | ${brand.tagline}`,
    description: `${brand.positioning}. ${brand.facilityHighlights.join(". ")}.`,
    url: siteUrl,
  },
  twitter: {
    card: "summary_large_image",
    title: `${brand.name} | ${brand.tagline}`,
    description: `${brand.positioning}. ${brand.facilityHighlights.join(". ")}.`,
  },
  alternates: { canonical: "/" },
  other: {
    "geo:region": "IN-MH",
    "geo:placename": brand.area,
    "geo:latitude": "19.3919",
    "geo:longitude": "72.8397",
  },
};

/** Local business schema, so the gym can surface for "gym in Vasai East" searches. */
const localBusinessJsonLd = {
  "@context": "https://schema.org",
  "@type": ["HealthClub", "Gym"],
  name: brand.name,
  slogan: brand.tagline,
  description: `${brand.positioning}. Air conditioned gym with hi-tech equipment, personal training and diet counselling in Tungarphata, Vasai East.`,
  telephone: `+${brand.whatsappNumber}`,
  url: siteUrl,
  sameAs: [instagramUrl],
  address: {
    "@type": "PostalAddress",
    streetAddress: brand.address.line1,
    addressLocality: "Vasai East",
    addressRegion: "Maharashtra",
    postalCode: "401208",
    addressCountry: "IN",
  },
  geo: { "@type": "GeoCoordinates", latitude: 19.3919, longitude: 72.8397 },
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday",
      ],
      opens: "00:00",
      closes: "23:59",
    },
  ],
  priceRange: "₹₹",
  founder: { "@type": "Person", name: "Rahul Rajbali Singh", jobTitle: "Founder and Head Trainer" },
  makesOffer: [
    "Body Building",
    "Weightlifting",
    "Powerlifting",
    "Weight Loss",
    "Weight Gain",
    "Cardio",
    "Diet Counselling",
    "PCOD/PCOS programs",
    "Diabetes Reversal Programs",
  ].map((name) => ({ "@type": "Offer", itemOffered: { "@type": "Service", name } })),
  addressDescription: addressOneLine,
};

export const viewport = {
  themeColor: "#0D0D0D",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en-IN"
      // globals.css sets scroll-behavior: smooth; this tells the App Router it is
      // intentional so route changes still jump instantly.
      data-scroll-behavior="smooth"
      className={`${bebasNeue.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <script
          type="application/ld+json"
          // Structured data for local SEO. Serialised once at build time from
          // static brand values, so it contains no user input.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessJsonLd) }}
        />
        {children}
      </body>
    </html>
  );
}
