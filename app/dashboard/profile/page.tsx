import { redirect } from "next/navigation";
import { getSessionUser, getSupabaseServerClient } from "@/integrations/supabase/server";
import { ProfileForm } from "./ProfileForm";
import { PhotoUpload } from "@/components/dashboard/PhotoUpload";

export const metadata = {
  title: "Profile",
};

// Signed photo URLs are short-lived, so don't cache this page.
export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  const sb = await getSupabaseServerClient();
  const { data: driver } = await sb
    .from("drivers")
    .select(
      "first_name, surname, email, phone, driver_type, driver_type_other, location, location_other, photo_url",
    )
    .eq("id", user.id)
    .maybeSingle();

  if (!driver) {
    return (
      <div className="max-w-2xl">
        <h1 className="text-3xl font-semibold tracking-[-0.03em]">Profile not ready</h1>
        <p className="text-muted-foreground mt-3">
          Confirm your email first, then refresh.
        </p>
      </div>
    );
  }

  let photoSignedUrl: string | null = null;
  if (driver.photo_url) {
    const { data: signed } = await sb.storage
      .from("member-photos")
      .createSignedUrl(driver.photo_url, 60 * 30);
    photoSignedUrl = signed?.signedUrl ?? null;
  }

  return (
    <div className="max-w-xl">
      <div className="mb-10">
        <div className="inline-flex items-center gap-2 text-xs font-medium text-brand mb-4">
          <span className="block w-6 h-px bg-brand" />
          Profile
        </div>
        <h1 className="text-3xl md:text-4xl font-semibold tracking-[-0.03em]">
          Your details
        </h1>
        <p className="text-muted-foreground mt-3">
          Keep these up to date — businesses use them to confirm membership.
        </p>
      </div>

      <div className="space-y-8">
        <PhotoUpload
          userId={user.id}
          initialPath={driver.photo_url}
          initialSignedUrl={photoSignedUrl}
        />
        <ProfileForm initial={driver} />
      </div>
    </div>
  );
}
