import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/integrations/supabase/server";
import { Logo } from "@/components/Logo";
import { SignOutButton } from "@/components/dashboard/SignOutButton";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 inset-x-0 z-40 bg-background/70 backdrop-blur-xl hairline-b">
        <div className="max-w-6xl mx-auto px-6 lg:px-8 h-16 flex items-center justify-between">
          <Logo />
          <nav className="flex items-center gap-6">
            <Link
              href="/dashboard"
              className="text-sm font-medium hover:text-brand transition-colors"
            >
              Home
            </Link>
            <Link
              href="/dashboard/profile"
              className="text-sm font-medium hover:text-brand transition-colors"
            >
              Profile
            </Link>
            <SignOutButton />
          </nav>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-6 lg:px-8 py-12 md:py-16">{children}</main>
    </div>
  );
}
