import type { Metadata } from "next";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = {
  title: "Owner login | Never Give Up Fitness",
  description: "Private admin access for the owner of Never Give Up Fitness.",
  robots: { index: false, follow: false },
};

export default function AdminLoginPage() {
  // Signed-in owners are already redirected to the dashboard by the proxy.
  return <LoginForm />;
}
