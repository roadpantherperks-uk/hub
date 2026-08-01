"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/Logo";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ArrowLeft, ArrowRight, Loader2, Lock } from "lucide-react";

const easeOut = [0.22, 1, 0.36, 1] as const;

export default function AdminLogin() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      toast.error(error.message);
      setLoading(false);
      return;
    }
    const { data: roles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", data.user.id)
      .eq("role", "admin")
      .maybeSingle();
    if (!roles) {
      await supabase.auth.signOut();
      toast.error("This account is not an admin.");
      setLoading(false);
      return;
    }
    toast.success("Welcome back");
    router.push("/admin");
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6 py-12 relative overflow-hidden">
      <div className="absolute inset-0 -z-10 pointer-events-none">
        <img
          src="/hero.jpg"
          alt=""
          className="absolute inset-0 size-full object-cover opacity-25"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/95 to-background" />
      </div>

      <Link
        href="/"
        className="group absolute top-6 left-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-0.5" />
        Back
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: easeOut }}
        className="w-full max-w-md"
      >
        <div className="flex flex-col items-center text-center mb-10">
          <Logo />
          <div className="mt-8 inline-flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <Lock className="size-3.5" strokeWidth={1.5} />
            Restricted access
          </div>
          <h1 className="mt-3 text-3xl md:text-4xl font-semibold tracking-[-0.03em]">
            Admin sign in
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Sign in to manage driver signups
          </p>
        </div>

        <motion.form
          onSubmit={onSubmit}
          initial="hidden"
          animate="show"
          variants={{
            hidden: {},
            show: { transition: { staggerChildren: 0.07, delayChildren: 0.2 } },
          }}
          className="space-y-5"
        >
          <Reveal>
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
                className="block w-full h-12 rounded-xl bg-card-soft hairline px-4 text-[15px] placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand/40 transition-colors"
              />
            </div>
          </Reveal>
          <Reveal>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">
                Password
              </Label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                className="block w-full h-12 rounded-xl bg-card-soft hairline px-4 text-[15px] placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand/40 transition-colors"
              />
            </div>
          </Reveal>
          <Reveal>
            <button
              type="submit"
              disabled={loading}
              className="group w-full inline-flex items-center justify-center gap-2 bg-foreground text-background font-semibold text-[15px] h-12 rounded-full hover:bg-foreground/90 transition-colors disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Signing in…
                </>
              ) : (
                <>
                  Sign in
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                </>
              )}
            </button>
          </Reveal>
        </motion.form>
      </motion.div>
    </div>
  );
}

function Reveal({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 10 },
        show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: easeOut } },
      }}
    >
      {children}
    </motion.div>
  );
}
