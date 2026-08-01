"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent, type ChangeEvent } from "react";
import { motion } from "framer-motion";
import { z } from "zod";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { adminCreateDriver } from "@/integrations/supabase/admin-actions";
import { toast } from "sonner";
import {
  ArrowLeft,
  Upload,
  Loader2,
  CheckCircle2,
  X,
  FileText,
  Copy,
} from "lucide-react";

import { DRIVER_TYPES, LOCATIONS, OTHER_VALUE } from "@/lib/options";

const schema = z
  .object({
    first_name: z.string().trim().min(1).max(60),
    surname: z.string().trim().min(1).max(60),
    email: z.string().trim().email().max(255),
    phone: z.string().trim().min(7).max(20),
    driver_type: z.string().min(1),
    driver_type_other: z.string().max(80).optional().or(z.literal("")),
    location: z.string().min(1),
    location_other: z.string().max(80).optional().or(z.literal("")),
  })
  .refine(
    (v) => v.driver_type !== OTHER_VALUE || (v.driver_type_other?.trim().length ?? 0) > 0,
    { path: ["driver_type_other"], message: "Fill in the driver-type 'Other' value" },
  )
  .refine(
    (v) => v.location !== OTHER_VALUE || (v.location_other?.trim().length ?? 0) > 0,
    { path: ["location_other"], message: "Fill in the location 'Other' value" },
  );

type Field = keyof z.infer<typeof schema>;

export default function AdminNewDriverPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    first_name: "",
    surname: "",
    email: "",
    phone: "",
    driver_type: "",
    driver_type_other: "",
    location: "",
    location_other: "",
  });
  const [adminNote, setAdminNote] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [created, setCreated] = useState<{ email: string; tempPassword: string } | null>(null);

  const upd = (k: Field) => (e: ChangeEvent<HTMLInputElement> | string) => {
    const v = typeof e === "string" ? e : e.target.value;
    setForm((f) => ({ ...f, [k]: v }));
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
    setFilePreview(f.type.startsWith("image/") ? URL.createObjectURL(f) : null);
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const result = schema.safeParse(form);
    if (!result.success) {
      toast.error(result.error.issues[0].message);
      return;
    }
    if (!file) {
      toast.error("Upload a verification document");
      return;
    }
    setLoading(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `${crypto.randomUUID()}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from("verification")
        .upload(path, file);
      if (upErr) throw upErr;

      const res = await adminCreateDriver({
        first_name: result.data.first_name,
        surname: result.data.surname,
        email: result.data.email,
        phone: result.data.phone,
        driver_type: result.data.driver_type,
        driver_type_other:
          result.data.driver_type === OTHER_VALUE
            ? result.data.driver_type_other?.trim() || undefined
            : undefined,
        location: result.data.location,
        location_other:
          result.data.location === OTHER_VALUE
            ? result.data.location_other?.trim() || undefined
            : undefined,
        verification_doc_url: path,
        admin_note: adminNote || undefined,
      });
      if (!res.ok) throw new Error(res.error);

      setCreated({
        email: result.data.email,
        tempPassword: res.data?.temp_password ?? "",
      });
      toast.success("Driver created");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create driver");
    } finally {
      setLoading(false);
    }
  };

  if (created) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-xl mx-auto space-y-6"
      >
        <Link
          href="/admin/drivers"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" /> Back to dashboard
        </Link>

        <div className="glass-strong rounded-3xl p-8 md:p-10">
          <div className="size-14 rounded-full bg-brand/15 grid place-items-center mb-6">
            <CheckCircle2 className="size-7 text-brand" strokeWidth={1.5} />
          </div>
          <h1 className="font-display font-black text-3xl">Driver created</h1>
          <p className="text-muted-foreground mt-2">
            Account is verified and approved. Share these credentials with the driver
            (encourage them to reset their password on first login).
          </p>

          <div className="mt-8 space-y-3">
            <CredRow label="Email" value={created.email} />
            <CredRow label="Temporary password" value={created.tempPassword} mono />
          </div>

          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <Button
              variant="hero"
              size="lg"
              className="flex-1"
              onClick={() => {
                setCreated(null);
                setForm({
                  first_name: "",
                  surname: "",
                  email: "",
                  phone: "",
                  driver_type: "",
                  driver_type_other: "",
                  location: "",
                  location_other: "",
                });
                setAdminNote("");
                setFile(null);
                setFilePreview(null);
              }}
            >
              Add another
            </Button>
            <Button
              variant="outline_glow"
              size="lg"
              className="flex-1"
              onClick={() => router.push("/admin/drivers")}
            >
              Back to dashboard
            </Button>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <Link
        href="/admin/drivers"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> Back to dashboard
      </Link>

      <div className="glass-strong rounded-3xl p-6 md:p-10 space-y-6">
        <div>
          <h1 className="font-display font-black text-3xl">Add driver manually</h1>
          <p className="text-muted-foreground text-sm mt-2">
            Creates a verified, approved driver account immediately. Skips email
            confirmation. Use for drivers you&apos;ve met in person.
          </p>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <Row id="first_name" label="First name">
              <CleanInput
                id="first_name"
                value={form.first_name}
                onChange={upd("first_name")}
              />
            </Row>
            <Row id="surname" label="Surname">
              <CleanInput
                id="surname"
                value={form.surname}
                onChange={upd("surname")}
              />
            </Row>
          </div>
          <Row id="email" label="Email">
            <CleanInput
              id="email"
              type="email"
              value={form.email}
              onChange={upd("email")}
            />
          </Row>
          <Row id="phone" label="Phone">
            <CleanInput
              id="phone"
              type="tel"
              value={form.phone}
              onChange={upd("phone")}
            />
          </Row>
          <div className="grid sm:grid-cols-2 gap-4">
            <Row id="driver_type" label="Driver type">
              <Select
                value={form.driver_type}
                onValueChange={upd("driver_type") as (v: string) => void}
              >
                <SelectTrigger className="h-11 rounded-xl bg-card-soft hairline px-4 text-[15px]">
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
            </Row>
            <Row id="location" label="Location">
              <Select
                value={form.location}
                onValueChange={upd("location") as (v: string) => void}
              >
                <SelectTrigger className="h-11 rounded-xl bg-card-soft hairline px-4 text-[15px]">
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
            </Row>
          </div>

          {form.driver_type === OTHER_VALUE && (
            <Row id="driver_type_other" label="Tell us the driver type">
              <CleanInput
                id="driver_type_other"
                value={form.driver_type_other}
                onChange={upd("driver_type_other")}
                placeholder="e.g. Limo driver"
              />
            </Row>
          )}

          {form.location === OTHER_VALUE && (
            <Row id="location_other" label="Tell us the location">
              <CleanInput
                id="location_other"
                value={form.location_other}
                onChange={upd("location_other")}
                placeholder="e.g. South Shields"
              />
            </Row>
          )}

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">ID verification</Label>
              {file ? (
                <button
                  type="button"
                  onClick={() => handleFile(null)}
                  className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
                >
                  <X className="size-3" /> Remove
                </button>
              ) : null}
            </div>
            {file ? (
              <div className="hairline rounded-xl bg-card-soft p-3 flex items-center gap-3">
                {filePreview ? (
                  <img
                    src={filePreview}
                    alt=""
                    className="size-12 rounded-lg object-cover hairline"
                  />
                ) : (
                  <div className="size-12 rounded-lg hairline grid place-items-center">
                    <FileText className="size-5 text-muted-foreground" strokeWidth={1.5} />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{file.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </div>
                </div>
              </div>
            ) : (
              <label className="block hairline rounded-xl bg-card-soft px-6 py-6 text-center cursor-pointer hover:border-brand/40 transition-colors">
                <Upload
                  className="size-5 text-muted-foreground mx-auto mb-2"
                  strokeWidth={1.5}
                />
                <div className="text-sm font-medium">Upload verification file</div>
                <div className="text-xs text-muted-foreground mt-1">
                  Image or PDF · max 10MB
                </div>
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  className="hidden"
                  onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
                />
              </label>
            )}
          </div>

          <Row id="admin_note" label="Admin note (optional)">
            <textarea
              id="admin_note"
              value={adminNote}
              onChange={(e) => setAdminNote(e.target.value)}
              rows={3}
              placeholder="Internal notes — visible to admins only"
              className="block w-full rounded-xl bg-card-soft hairline px-4 py-3 text-[15px] focus:outline-none focus:ring-2 focus:ring-brand/40 transition-colors"
            />
          </Row>

          <Button
            type="submit"
            disabled={loading}
            variant="hero"
            size="lg"
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin size-4" /> Creating…
              </>
            ) : (
              "Create driver"
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}

function Row({
  id,
  label,
  children,
}: {
  id: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-sm font-medium">
        {label}
      </Label>
      {children}
    </div>
  );
}

function CleanInput(props: React.ComponentPropsWithoutRef<"input">) {
  return (
    <input
      {...props}
      className="block w-full h-11 rounded-xl bg-card-soft hairline px-4 text-[15px] placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-brand/40 transition-colors"
    />
  );
}

function CredRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  const copy = async () => {
    await navigator.clipboard.writeText(value);
    toast.success(`${label} copied`);
  };
  return (
    <div className="hairline rounded-xl bg-card-soft p-4 flex items-center gap-3">
      <div className="flex-1 min-w-0">
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
          {label}
        </div>
        <div
          className={`mt-1 text-sm font-medium truncate ${mono ? "font-mono" : ""}`}
        >
          {value}
        </div>
      </div>
      <button
        type="button"
        onClick={copy}
        className="hairline rounded-lg p-2 hover:border-brand/40 transition-colors"
        aria-label={`Copy ${label}`}
      >
        <Copy className="size-4" />
      </button>
    </div>
  );
}
