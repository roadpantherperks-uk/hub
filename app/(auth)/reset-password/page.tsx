"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import { Label } from "@/components/ui/label";
import { updatePassword } from "@/integrations/supabase/auth-actions";
import { toast } from "sonner";
import { ArrowRight, Loader2, CheckCircle2 } from "lucide-react";

const easeOut = [0.22, 1, 0.36, 1] as const;

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      toast.error("Use at least 8 characters");
      return;
    }
    if (password !== confirm) {
      toast.error("Passwords don't match");
      return;
    }
    setLoading(true);
    const res = await updatePassword(password);
    if (!res.ok) {
      toast.error(res.error);
      setLoading(false);
      return;
    }
    setDone(true);
    setTimeout(() => router.push("/dashboard"), 1500);
  };

  if (done) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md text-center"
      >
        <div className="size-16 mx-auto rounded-full bg-brand/10 grid place-items-center mb-6">
          <CheckCircle2 className="size-8 text-brand" strokeWidth={1.5} />
        </div>
        <h1 className="text-3xl font-semibold tracking-[-0.03em]">Password updated</h1>
        <p className="text-muted-foreground mt-4">Redirecting…</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: easeOut }}
      className="w-full max-w-md"
    >
      <div className="mb-10 text-center">
        <h1 className="text-3xl md:text-4xl font-semibold tracking-[-0.03em] leading-[1.05]">
          Set a new <span className="text-brand">password</span>.
        </h1>
      </div>

      <form onSubmit={onSubmit} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="password" className="text-sm font-medium">
            New password
          </Label>
          <input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 8 characters"
            autoComplete="new-password"
            className="block w-full h-12 rounded-xl bg-card-soft hairline px-4 text-[15px] placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-brand/40 transition-colors"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirm" className="text-sm font-medium">
            Confirm password
          </Label>
          <input
            id="confirm"
            type="password"
            required
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            autoComplete="new-password"
            className="block w-full h-12 rounded-xl bg-card-soft hairline px-4 text-[15px] placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-brand/40 transition-colors"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="group w-full inline-flex items-center justify-center gap-2 bg-foreground text-background font-semibold text-[15px] h-12 rounded-full hover:bg-foreground/90 transition-colors disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Updating…
            </>
          ) : (
            <>
              Update password
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
            </>
          )}
        </button>
        <p className="text-sm text-center text-muted-foreground">
          <Link href="/login" className="hover:text-foreground transition-colors">
            ← Back to sign in
          </Link>
        </p>
      </form>
    </motion.div>
  );
}
