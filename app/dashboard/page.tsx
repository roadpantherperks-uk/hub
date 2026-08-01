import { redirect } from "next/navigation";
import { getSessionUser, getSupabaseServerClient } from "@/integrations/supabase/server";
import { StatusBadge, type SignupStatus } from "@/components/StatusBadge";
import { Clock, ShieldCheck, Sparkles, XCircle } from "lucide-react";

export const metadata = {
  title: "Dashboard",
};

export default async function DashboardHome() {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  const sb = await getSupabaseServerClient();
  const { data: driver } = await sb
    .from("drivers")
    .select("first_name, surname, status, driver_type, location, created_at, admin_note")
    .eq("id", user.id)
    .maybeSingle();

  if (!driver) {
    // Logged in but no driver row — likely still confirming email
    return (
      <div className="max-w-2xl">
        <div className="inline-flex items-center gap-2 text-xs font-medium text-brand mb-4">
          <span className="block w-6 h-px bg-brand" />
          Welcome
        </div>
        <h1 className="text-3xl md:text-4xl font-semibold tracking-[-0.03em]">
          Almost there.
        </h1>
        <p className="text-muted-foreground mt-4 leading-relaxed">
          We&apos;ve got your details but haven&apos;t completed your verification record
          yet. If you just signed up, please confirm your email — then refresh this page.
        </p>
      </div>
    );
  }

  const status = driver.status as SignupStatus;

  return (
    <div className="space-y-12">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-medium text-brand mb-4">
            <span className="block w-6 h-px bg-brand" />
            Driver portal
          </div>
          <h1 className="text-3xl md:text-4xl font-semibold tracking-[-0.03em]">
            Hi, {driver.first_name}.
          </h1>
        </div>
        <StatusBadge status={status} />
      </header>

      {status === "pending" && (
        <div className="hairline rounded-2xl bg-card-soft p-8 max-w-2xl">
          <Clock className="size-6 text-brand mb-4" strokeWidth={1.5} />
          <h2 className="text-xl font-semibold tracking-tight">Application under review</h2>
          <p className="text-muted-foreground mt-3 leading-relaxed text-[15px]">
            Our team is checking your verification document. You&apos;ll get an email
            the moment we approve you — usually within 24 hours.
          </p>
        </div>
      )}

      {status === "approved" && (
        <div className="hairline rounded-2xl bg-card-soft p-8 max-w-2xl">
          <ShieldCheck className="size-6 text-brand mb-4" strokeWidth={1.5} />
          <h2 className="text-xl font-semibold tracking-tight">You&apos;re verified.</h2>
          <p className="text-muted-foreground mt-3 leading-relaxed text-[15px]">
            Welcome to the network. The offers feed opens at launch — we&apos;ll
            email you the moment exclusive deals go live.
          </p>
          <div className="mt-6 inline-flex items-center gap-2 text-xs text-muted-foreground">
            <Sparkles className="size-3.5 text-brand" />
            Member since {new Date(driver.created_at).toLocaleDateString("en-GB")}
          </div>
        </div>
      )}

      {status === "rejected" && (
        <div className="hairline rounded-2xl bg-card-soft p-8 max-w-2xl border-destructive/30">
          <XCircle className="size-6 text-destructive mb-4" strokeWidth={1.5} />
          <h2 className="text-xl font-semibold tracking-tight">Application not approved</h2>
          {driver.admin_note ? (
            <p className="text-muted-foreground mt-3 leading-relaxed text-[15px]">
              <strong className="text-foreground">Note from admin:</strong> {driver.admin_note}
            </p>
          ) : (
            <p className="text-muted-foreground mt-3 leading-relaxed text-[15px]">
              We couldn&apos;t verify your driver status from the document you uploaded.
              You can re-apply with another document at any time.
            </p>
          )}
          <a
            href="mailto:hello@roadpantherperks.co.uk"
            className="inline-flex items-center gap-1.5 mt-5 text-sm text-brand hover:underline"
          >
            Get in touch →
          </a>
        </div>
      )}

      <section className="grid sm:grid-cols-2 gap-4 max-w-2xl">
        <Info label="Driver type" value={driver.driver_type} />
        <Info label="Location" value={driver.location} />
      </section>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="hairline rounded-xl bg-card-soft p-5">
      <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-1.5 font-medium text-[15px]">{value}</div>
    </div>
  );
}
