"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import { Label } from "@/components/ui/label";
import { signInWithPassword } from "@/integrations/supabase/auth-actions";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ArrowRight, Loader2 } from "lucide-react";

const easeOut = [0.22, 1, 0.36, 1] as const;

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await signInWithPassword({ email, password });
    if (!res.ok) {
      toast.error(res.error);
      setLoading(false);
      return;
    }
    // Decide where to send them based on role.
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) {
      router.push("/dashboard");
      return;
    }
    const { data: adminRow } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", u.user.id)
      .eq("role", "admin")
      .maybeSingle();
    toast.success("Welcome back");
    router.push(adminRow ? "/admin" : "/dashboard");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: easeOut }}
      className="w-full max-w-md"
    >
      <div className="mb-10 text-center">
        <div className="inline-flex items-center gap-2 text-xs font-medium text-brand mb-4">
          <span className="block w-6 h-px bg-brand" />
          Sign in
        </div>
        <h1 className="text-3xl md:text-4xl font-semibold tracking-[-0.03em] leading-[1.05]">
          Welcome <span className="text-brand">back</span>.
        </h1>
        <p className="mt-3 text-muted-foreground">
          Sign in to your driver account
        </p>
      </div>

      <motion.form
        onSubmit={onSubmit}
        initial="hidden"
        animate="show"
        variants={{
          hidden: {},
          show: { transition: { staggerChildren: 0.07, delayChildren: 0.15 } },
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
              className="block w-full h-12 rounded-xl bg-card-soft hairline px-4 text-[15px] placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-brand/40 transition-colors"
            />
          </div>
        </Reveal>

        <Reveal>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="text-sm font-medium">
                Password
              </Label>
              <Link
                href="/forgot-password"
                className="text-xs text-muted-foreground hover:text-brand transition-colors"
              >
                Forgot?
              </Link>
            </div>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
              className="block w-full h-12 rounded-xl bg-card-soft hairline px-4 text-[15px] placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-brand/40 transition-colors"
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

        <Reveal>
          <p className="text-sm text-center text-muted-foreground">
            New here?{" "}
            <Link href="/signup" className="text-foreground font-semibold">
              Create an account
            </Link>
          </p>
        </Reveal>
      </motion.form>
    </motion.div>
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
