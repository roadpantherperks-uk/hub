import Link from "next/link";
import { Mail } from "lucide-react";

export const metadata = {
  title: "Verify your email",
};

export default function VerifyEmailPage() {
  return (
    <div className="w-full max-w-md text-center">
      <div className="size-16 mx-auto rounded-full bg-brand/10 grid place-items-center mb-6">
        <Mail className="size-8 text-brand" strokeWidth={1.5} />
      </div>
      <h1 className="text-3xl md:text-4xl font-semibold tracking-[-0.03em]">
        Check your <span className="text-brand">email</span>.
      </h1>
      <p className="text-muted-foreground mt-5 leading-relaxed">
        We&apos;ve sent you a confirmation link. Click it to verify your email
        address and complete your driver application.
      </p>
      <p className="text-xs text-muted-foreground mt-6">
        Didn&apos;t arrive? Check spam, or wait a minute and try{" "}
        <Link href="/login" className="text-foreground font-semibold">
          signing in
        </Link>{" "}
        — we may have already verified you.
      </p>
    </div>
  );
}
