import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUser, getSupabaseServerClient } from "@/integrations/supabase/server";
import { MemberCard } from "@/components/dashboard/MemberCard";
import { Clock, Camera, ArrowRight } from "lucide-react";

export const metadata = { title: "My member card" };

// The signed photo URL is short-lived, so this must never be cached.
export const dynamic = "force-dynamic";

export default async function MemberCardPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  const sb = await getSupabaseServerClient();
  const { data: driver } = await sb
    .from("drivers")
    .select(
      "first_name, surname, member_number, driver_type, driver_type_other, status, created_at, photo_url",
    )
    .eq("id", user.id)
    .maybeSingle();

  if (!driver) redirect("/dashboard");

  // Only an approved member gets a card — an unapproved one would be showing a
  // merchant a "verified" badge we haven't actually verified.
  if (driver.status !== "approved") {
    return (
      <div className="max-w-xl">
        <h1 className="text-3xl font-semibold tracking-[-0.03em]">Your member card</h1>
        <div className="hairline rounded-2xl bg-card-soft p-8 mt-6">
          <Clock className="size-6 text-brand mb-4" strokeWidth={1.5} />
          <h2 className="text-xl font-semibold tracking-tight">Not ready yet</h2>
          <p className="text-muted-foreground mt-3 leading-relaxed">
            Your card unlocks as soon as your account is verified. We check every member by
            hand so partners can trust the badge — you&apos;ll get an email the moment
            it&apos;s done.
          </p>
        </div>
      </div>
    );
  }

  // Private bucket: mint a short-lived signed URL rather than exposing the file.
  let photoUrl: string | null = null;
  if (driver.photo_url) {
    const { data: signed } = await sb.storage
      .from("member-photos")
      .createSignedUrl(driver.photo_url, 60 * 30);
    photoUrl = signed?.signedUrl ?? null;
  }

  return (
    <div className="space-y-8">
      <div className="max-w-xl">
        <div className="inline-flex items-center gap-2 text-xs font-medium text-brand mb-4">
          <span className="block w-6 h-px bg-brand" />
          Member card
        </div>
        <h1 className="text-3xl md:text-4xl font-semibold tracking-[-0.03em]">
          Show this to claim your perks.
        </h1>
        <p className="text-muted-foreground mt-4 leading-relaxed">
          Present this card at a partner business to redeem an offer. Keep this page
          bookmarked — the date at the bottom updates daily, so partners can tell it&apos;s live.
        </p>
      </div>

      {!driver.photo_url && (
        <div className="hairline rounded-2xl bg-card-soft p-6 max-w-xl flex items-start gap-4">
          <Camera className="size-5 text-brand shrink-0 mt-0.5" strokeWidth={1.5} />
          <div>
            <h2 className="font-semibold">Add your photo</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Partners check the photo matches the person claiming the offer. Without one,
              some may turn the card down.
            </p>
            <Link
              href="/dashboard/profile"
              className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-brand hover:underline"
            >
              Upload a photo <ArrowRight className="size-3.5" />
            </Link>
          </div>
        </div>
      )}

      <MemberCard
        firstName={driver.first_name}
        surname={driver.surname}
        memberNumber={driver.member_number}
        driverType={driver.driver_type}
        driverTypeOther={driver.driver_type_other}
        memberSince={driver.created_at}
        photoUrl={photoUrl}
        verified
      />
    </div>
  );
}
