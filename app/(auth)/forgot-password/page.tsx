"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import { Label } from "@/components/ui/label";
import { requestPasswordReset } from "@/integrations/supabase/auth-actions";
import { toast } from "sonner";
import { ArrowRight, Loader2, Mail } from "lucide-react";

const easeOut = [0.22, 1, 0.36, 1] as const;

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await requestPasswordReset(email);
    if (!res.ok) {
      toast.error(res.error);
      setLoading(false);
      return;
    }
    setDone(true);
  };

  if (done) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: easeOut }}
        className="w-full max-w-md text-center"
      >
        <div className="size-16 mx-auto rounded-full bg-brand/10 grid place-items-center mb-6">
          <Mail className="size-8 text-brand" strokeWidth={1.5} />
        </div>
        <h1 className="text-3xl font-semibold tracking-[-0.03em]">Check your email</h1>
        <p className="text-muted-foreground mt-4 leading-relaxed">
          If an account exists for <strong>{email}</strong>, we&apos;ve sent a reset
          link. The link expires in 1 hour.
        </p>
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 mt-8 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          ← Back to sign in
        </Link>
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
          Reset your <span className="text-brand">password</span>.
        </h1>
        <p className="mt-3 text-muted-foreground">
          Enter your email and we&apos;ll send you a link.
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium">
            Email
          </Label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            autoComplete="email"
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
              Sending…
            </>
          ) : (
            <>
              Send reset link
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
            </>
          )}
        </button>
        <p className="text-sm text-center text-muted-foreground">
          Remembered it?{" "}
          <Link href="/login" className="text-foreground font-semibold">
            Sign in
          </Link>
        </p>
      </form>
    </motion.div>
  );
}
