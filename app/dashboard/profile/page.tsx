import { redirect } from "next/navigation";
import { getSessionUser, getSupabaseServerClient } from "@/integrations/supabase/server";
import { ProfileForm } from "./ProfileForm";

export const metadata = {
  title: "Profile",
};

export default async function ProfilePage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  const sb = await getSupabaseServerClient();
  const { data: driver } = await sb
    .from("drivers")
    .select(
      "first_name, surname, email, phone, driver_type, driver_type_other, location, location_other",
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

      <ProfileForm initial={driver} />
    </div>
  );
}
