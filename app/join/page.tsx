import { redirect } from "next/navigation";

// /join was the original waitlist; we've consolidated to /signup.
// Preserve the URL with a permanent redirect so old links keep working.
export default function JoinRedirect() {
  redirect("/signup");
}
