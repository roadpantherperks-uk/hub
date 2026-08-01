"use client";

import Link from "next/link";
import { useState, type ChangeEvent, type FormEvent, type ReactNode, type DragEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { signUpDriver } from "@/integrations/supabase/auth-actions";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowRight,
  CheckCircle2,
  Upload,
  Loader2,
  X,
  FileText,
  Mail,
} from "lucide-react";

import { DRIVER_TYPES, LOCATIONS, OTHER_VALUE } from "@/lib/options";

const schema = z
  .object({
    first_name: z.string().trim().min(1, "Enter your first name").max(60),
    surname: z.string().trim().min(1, "Enter your surname").max(60),
    email: z.string().trim().email("Enter a valid email").max(255),
    phone: z.string().trim().min(7, "Enter a valid phone").max(20),
    password: z.string().min(8, "Use at least 8 characters").max(72),
    driver_type: z.string().min(1, "Select your driver type"),
    driver_type_other: z.string().max(80).optional().or(z.literal("")),
    location: z.string().min(1, "Select your location"),
    location_other: z.string().max(80).optional().or(z.literal("")),
  })
  .refine(
    (v) => v.driver_type !== OTHER_VALUE || (v.driver_type_other?.trim().length ?? 0) > 0,
    { path: ["driver_type_other"], message: "Tell us your driver type" },
  )
  .refine(
    (v) => v.location !== OTHER_VALUE || (v.location_other?.trim().length ?? 0) > 0,
    { path: ["location_other"], message: "Tell us your location" },
  );

type Field = keyof z.infer<typeof schema>;

const easeOut = [0.22, 1, 0.36, 1] as const;

export default function SignupPage() {
  const [form, setForm] = useState({
    first_name: "",
    surname: "",
    email: "",
    phone: "",
    password: "",
    driver_type: "",
    driver_type_other: "",
    location: "",
    location_other: "",
  });
  const [errors, setErrors] = useState<Partial<Record<Field, string>>>({});
  const [fileError, setFileError] = useState<string | undefined>();
  const [file, setFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const upd = (k: Field) => (e: ChangeEvent<HTMLInputElement> | string) => {
    const v = typeof e === "string" ? e : e.target.value;
    setForm((f) => ({ ...f, [k]: v }));
    if (errors[k]) setErrors((p) => ({ ...p, [k]: undefined }));
  };

  const handleFile = (f: File | null) => {
    if (!f) {
      setFile(null);
      setFilePreview(null);
      return;
    }
    if (f.size > 10 * 1024 * 1024) {
      toast.error("File too large (max 10MB)");
      return;
    }
    setFile(f);
    setFileError(undefined);
    if (f.type.startsWith("image/")) {
      setFilePreview(URL.createObjectURL(f));
    } else {
      setFilePreview(null);
    }
  };

  const onDrop = (e: DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setDragOver(false);
    handleFile(e.dataTransfer.files?.[0] ?? null);
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const result = schema.safeParse(form);
    const missingFile = !file;
    if (!result.success || missingFile) {
      const fieldErrors: Partial<Record<Field, string>> = {};
      if (!result.success) {
        for (const issue of result.error.issues) {
          const key = issue.path[0] as Field;
          if (!fieldErrors[key]) fieldErrors[key] = issue.message;
        }
      }
      setErrors(fieldErrors);
      setFileError(missingFile ? "Upload a verification document to continue" : undefined);
      toast.error("Please fix the highlighted fields");
      return;
    }

    setLoading(true);
    try {
      // Upload verification doc first (anon insert allowed by storage policy)
      const ext = file!.name.split(".").pop();
      const path = `${crypto.randomUUID()}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from("verification")
        .upload(path, file!);
      if (upErr) throw upErr;

      const res = await signUpDriver({
        first_name: result.data.first_name,
        surname: result.data.surname,
        email: result.data.email,
        phone: result.data.phone,
        password: result.data.password,
        driver_type: result.data.driver_type,
        driver_type_other:
          result.data.driver_type === OTHER_VALUE
            ? (result.data.driver_type_other ?? undefined)
            : undefined,
        location: result.data.location,
        location_other:
          result.data.location === OTHER_VALUE
            ? (result.data.location_other ?? undefined)
            : undefined,
        verification_doc_url: path,
      });
      if (!res.ok) throw new Error(res.error);
      setDone(true);
    } catch (err) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : "Sign-up failed");
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: easeOut }}
        className="w-full max-w-md text-center pt-4"
      >
        <motion.div
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200, damping: 14 }}
          className="size-16 mx-auto rounded-full bg-brand/10 grid place-items-center mb-8"
        >
          <Mail className="size-8 text-brand" strokeWidth={1.5} />
        </motion.div>
        <h1 className="text-3xl md:text-4xl font-semibold tracking-[-0.03em] leading-[1.05]">
          Check your <span className="text-brand">inbox</span>.
        </h1>
        <p className="text-muted-foreground mt-5 leading-relaxed">
          We&apos;ve sent a confirmation link to <strong>{form.email}</strong>.
          Click it to verify your email — then we&apos;ll review your application.
        </p>
        <Link
          href="/login"
          className="inline-flex items-center gap-2 mt-10 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Already verified? Sign in →
        </Link>
      </motion.div>
    );
  }

  return (
    <div className="w-full max-w-xl">
      <div className="mb-10 text-center">
        <div className="inline-flex items-center gap-2 text-xs font-medium text-brand mb-4">
          <span className="block w-6 h-px bg-brand" />
          Driver Account
        </div>
        <h1 className="text-4xl md:text-5xl font-semibold tracking-[-0.03em] leading-[1.05]">
          Create your <span className="text-brand">account</span>.
        </h1>
        <p className="mt-4 text-muted-foreground leading-relaxed">
          Free for verified drivers. Takes under 90 seconds.
        </p>
      </div>

      <motion.form
        onSubmit={onSubmit}
        initial="hidden"
        animate="show"
        variants={{
          hidden: {},
          show: { transition: { staggerChildren: 0.05, delayChildren: 0.1 } },
        }}
        className="space-y-5"
        noValidate
      >
        <div className="grid sm:grid-cols-2 gap-4">
          <FieldRow id="first_name" label="First name" error={errors.first_name}>
            <CleanInput
              id="first_name"
              value={form.first_name}
              onChange={upd("first_name")}
              autoComplete="given-name"
              invalid={!!errors.first_name}
            />
          </FieldRow>
          <FieldRow id="surname" label="Surname" error={errors.surname}>
            <CleanInput
              id="surname"
              value={form.surname}
              onChange={upd("surname")}
              autoComplete="family-name"
              invalid={!!errors.surname}
            />
          </FieldRow>
        </div>

        <FieldRow id="email" label="Email" error={errors.email}>
          <CleanInput
            id="email"
            type="email"
            value={form.email}
            onChange={upd("email")}
            placeholder="you@example.com"
            autoComplete="email"
            invalid={!!errors.email}
          />
        </FieldRow>

        <FieldRow id="phone" label="Phone" error={errors.phone}>
          <CleanInput
            id="phone"
            type="tel"
            value={form.phone}
            onChange={upd("phone")}
            placeholder="07000 000000"
            autoComplete="tel"
            invalid={!!errors.phone}
          />
        </FieldRow>

        <FieldRow id="password" label="Password" error={errors.password}>
          <CleanInput
            id="password"
            type="password"
            value={form.password}
            onChange={upd("password")}
            placeholder="At least 8 characters"
            autoComplete="new-password"
            invalid={!!errors.password}
          />
        </FieldRow>

        <div className="grid sm:grid-cols-2 gap-4">
          <FieldRow id="driver_type" label="Driver type" error={errors.driver_type}>
            <Select
              value={form.driver_type}
              onValueChange={upd("driver_type") as (v: string) => void}
            >
              <SelectTrigger className="h-12 rounded-xl bg-card-soft hairline px-4 text-[15px]">
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                {DRIVER_TYPES.map((d) => (
                  <SelectItem key={d} value={d}>
                    {d}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FieldRow>
          <FieldRow id="location" label="Location" error={errors.location}>
            <Select
              value={form.location}
              onValueChange={upd("location") as (v: string) => void}
            >
              <SelectTrigger className="h-12 rounded-xl bg-card-soft hairline px-4 text-[15px]">
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                {LOCATIONS.map((l) => (
                  <SelectItem key={l} value={l}>
                    {l}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FieldRow>
        </div>

        {form.driver_type === OTHER_VALUE && (
          <FieldRow
            id="driver_type_other"
            label="Tell us your driver type"
            error={errors.driver_type_other}
          >
            <CleanInput
              id="driver_type_other"
              value={form.driver_type_other}
              onChange={upd("driver_type_other")}
              placeholder="e.g. Limo driver"
              invalid={!!errors.driver_type_other}
            />
          </FieldRow>
        )}

        {form.location === OTHER_VALUE && (
          <FieldRow
            id="location_other"
            label="Tell us your location"
            error={errors.location_other}
          >
            <CleanInput
              id="location_other"
              value={form.location_other}
              onChange={upd("location_other")}
              placeholder="e.g. South Shields"
              invalid={!!errors.location_other}
            />
          </FieldRow>
        )}

        {/* Verification upload */}
        <motion.div
          variants={{
            hidden: { opacity: 0, y: 10 },
            show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: easeOut } },
          }}
          className="space-y-2"
        >
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">ID verification</Label>
            {file ? (
              <button
                type="button"
                onClick={() => handleFile(null)}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1"
              >
                <X className="size-3" />
                Remove
              </button>
            ) : null}
          </div>

          <AnimatePresence mode="wait">
            {file ? (
              <motion.div
                key="preview"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="hairline rounded-xl bg-card-soft p-3 flex items-center gap-3"
              >
                {filePreview ? (
                  <img
                    src={filePreview}
                    alt="Verification preview"
                    className="size-14 rounded-lg object-cover hairline"
                  />
                ) : (
                  <div className="size-14 rounded-lg hairline grid place-items-center">
                    <FileText className="size-5 text-muted-foreground" strokeWidth={1.5} />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{file.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {(file.size / 1024 / 1024).toFixed(2)} MB · ready
                  </div>
                </div>
                <CheckCircle2 className="size-5 text-brand shrink-0" strokeWidth={1.5} />
              </motion.div>
            ) : (
              <motion.label
                key="dropzone"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={onDrop}
                className={`block rounded-xl bg-card-soft cursor-pointer transition-all px-6 py-8 text-center border ${
                  dragOver
                    ? "border-brand/60 bg-brand/5"
                    : fileError
                      ? "border-destructive"
                      : "border-border hover:border-brand/30"
                }`}
              >
                <Upload className="size-5 text-muted-foreground mx-auto mb-3" strokeWidth={1.5} />
                <div className="text-sm font-medium">
                  Drop file here or <span className="text-brand">browse</span>
                </div>
                <div className="text-xs text-muted-foreground mt-1.5">
                  Taxi badge, Uber/Bolt screenshot, instructor badge — PDF or image, max 10MB
                </div>
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  className="hidden"
                  onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
                />
              </motion.label>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {fileError ? (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="text-xs text-destructive font-medium"
              >
                {fileError}
              </motion.div>
            ) : null}
          </AnimatePresence>
        </motion.div>

        <motion.div
          variants={{
            hidden: { opacity: 0, y: 10 },
            show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: easeOut } },
          }}
          className="pt-2 space-y-4"
        >
          <button
            type="submit"
            disabled={loading}
            className="group w-full inline-flex items-center justify-center gap-2 bg-foreground text-background font-semibold text-[15px] h-12 rounded-full hover:bg-foreground/90 transition-colors disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Creating account…
              </>
            ) : (
              <>
                Create account
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
              </>
            )}
          </button>
          <p className="text-[11px] text-center text-muted-foreground leading-relaxed">
            By creating an account you agree to our{" "}
            <Link href="/terms" className="underline">Terms</Link> and{" "}
            <Link href="/privacy" className="underline">Privacy Policy</Link>.
          </p>
          <p className="text-sm text-center text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="text-foreground font-semibold">
              Sign in
            </Link>
          </p>
        </motion.div>
      </motion.form>
    </div>
  );
}

function FieldRow({
  id,
  label,
  error,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 10 },
        show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: easeOut } },
      }}
      className="space-y-2"
    >
      <Label htmlFor={id} className="text-sm font-medium">
        {label}
      </Label>
      {children}
      <AnimatePresence>
        {error ? (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="text-xs text-destructive font-medium"
          >
            {error}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </motion.div>
  );
}

function CleanInput({
  invalid,
  className,
  ...props
}: React.ComponentPropsWithoutRef<"input"> & { invalid?: boolean }) {
  return (
    <input
      {...props}
      className={`block w-full h-12 rounded-xl bg-card-soft hairline px-4 text-[15px] placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand/40 transition-colors ${
        invalid ? "border-destructive" : ""
      } ${className ?? ""}`}
    />
  );
}
