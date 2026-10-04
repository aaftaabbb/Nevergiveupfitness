/**
 * Single source of truth for the public origin, used by the sitemap, robots.txt
 * and the metadata in the root layout.
 *
 * Trailing slashes are stripped on purpose: a value pasted into Vercel as
 * "https://site.com/" would otherwise produce "https://site.com//pricing".
 */
const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim() || "http://localhost:3000";

export const siteUrl = raw.replace(/\/+$/, "");