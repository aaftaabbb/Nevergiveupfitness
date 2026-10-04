import type { Metadata } from "next";
import { verifySession } from "@/lib/auth/verify-session";
import { AdminShell } from "@/components/admin/admin-shell";

export const metadata: Metadata = {
  title: { default: "Admin", template: "%s | Admin | Never Give Up Fitness" },
  robots: { index: false, follow: false },
};

/**
 * Route group so /admin/login sits outside this layout and stays reachable
 * without a session. The layout verifies the session, which means every screen
 * inside it inherits the check even if the proxy matcher changes.
 */
export default async function AdminPanelLayout({ children }: LayoutProps<"/admin">) {
  const session = await verifySession();

  return <AdminShell ownerName={session.name}>{children}</AdminShell>;
}
