"use client";

import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, type ChangeEvent, type FormEvent, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  adminUpdateDriver,
  adminReplaceVerificationDoc,
  adminUpdateWaitlist,
  adminReplaceWaitlistDoc,
} from "@/integrations/supabase/admin-actions";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StatusBadge, type SignupStatus } from "@/components/StatusBadge";
import { DRIVER_TYPES, LOCATIONS, OTHER_VALUE } from "@/lib/options";
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  FileText,
  Loader2,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Upload,
  Save,
} from "lucide-react";
import { toast } from "sonner";

type Source = "drivers" | "waitlist";

type EditState = {
  first_name: string;
  surname: string;
  email: string;
  phone: string;
  driver_type: string;
  driver_type_other: string;
  location: string;
  location_other: string;
  admin_note: string;
};

type View = {
  id: string;
  display_name: string;
  email: string;
  phone: string;
  driver_type: string;
  driver_type_other: string | null;
  location: string;
  location_other: string | null;
  status: SignupStatus;
  admin_note: string | null;
  verification_file_url: string | null;
  created_at: string;
};

export default function DriverDetails() {
  const params = useParams<{ id: string }>();
  const search = useSearchParams();
  const id = params.id;
  const source = (search.get("source") ?? "waitlist") as Source;
  const router = useRouter();

  const [driver, setDriver] = useState<View | null>(null);
  const [edit, setEdit] = useState<EditState | null>(null);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const load = async () => {
    if (!id) return;
    if (source === "drivers") {
      const { data, error } = await supabase
        .from("drivers")
        .select("*")
        .eq("id", id)
        .single();
      if (error || !data) {
        toast.error(error?.message ?? "Driver not found");
        return;
      }
      const view: View = {
        id: data.id,
        display_name: `${data.first_name} ${data.surname}`,
        email: data.email,
        phone: data.phone,
        driver_type: data.driver_type,
        driver_type_other: data.driver_type_other,
        location: data.location,
        location_other: data.location_other,
        status: data.status,
        admin_note: data.admin_note,
        verification_file_url: data.verification_doc_url,
        created_at: data.created_at,
      };
      setDriver(view);
      setEdit({
        first_name: data.first_name,
        surname: data.surname,
        email: data.email,
        phone: data.phone,
        driver_type: data.driver_type,
        driver_type_other: data.driver_type_other ?? "",
        location: data.location,
        location_other: data.location_other ?? "",
        admin_note: data.admin_note ?? "",
      });
      if (data.verification_doc_url) {
        const { data: signed } = await supabase.storage
          .from("verification")
          .createSignedUrl(data.verification_doc_url, 3600);
        setFileUrl(signed?.signedUrl ?? null);
      }
    } else {
      const { data, error } = await supabase
        .from("driver_signups")
        .select("*")
        .eq("id", id)
        .single();
      if (error || !data) {
        toast.error(error?.message ?? "Waitlist entry not found");
        return;
      }
      const view: View = {
        id: data.id,
        display_name: data.full_name,
        email: data.email,
        phone: data.phone,
        driver_type: data.driver_type,
        driver_type_other: data.driver_type_other,
        location: data.location,
        location_other: data.location_other,
        status: data.status,
        admin_note: data.admin_note,
        verification_file_url: data.verification_file_url,
        created_at: data.created_at,
      };
      setDriver(view);
      setEdit({
        first_name: data.full_name.split(" ")[0] ?? "",
        surname: data.full_name.split(" ").slice(1).join(" "),
        email: data.email,
        phone: data.phone,
        driver_type: data.driver_type,
        driver_type_other: data.driver_type_other ?? "",
        location: data.location,
        location_other: data.location_other ?? "",
        admin_note: data.admin_note ?? "",
      });
      if (data.verification_file_url) {
        const { data: signed } = await supabase.storage
          .from("verification")
          .createSignedUrl(data.verification_file_url, 3600);
        setFileUrl(signed?.signedUrl ?? null);
      }
    }
  };

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, source]);

  const updateStatus = async (status: "approved" | "rejected") => {
    if (!edit) return;
    setBusy(true);
    const table = source === "drivers" ? "drivers" : "driver_signups";
    const { error } = await supabase
      .from(table)
      .update({ status, admin_note: edit.admin_note || null })
      .eq("id", id);
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(`${source === "drivers" ? "Driver" : "Applicant"} ${status}`);
    router.push("/admin/drivers");
  };

  const saveEdits = async (e: FormEvent) => {
    e.preventDefault();
    if (!edit) return;
    if (edit.driver_type === OTHER_VALUE && !edit.driver_type_other.trim()) {
      toast.error("Fill in the driver-type 'Other' value");
      return;
    }
    if (edit.location === OTHER_VALUE && !edit.location_other.trim()) {
      toast.error("Fill in the location 'Other' value");
      return;
    }
    setSaving(true);
    let res;
    if (source === "drivers") {
      res = await adminUpdateDriver({
        driver_id: id,
        first_name: edit.first_name,
        surname: edit.surname,
        email: edit.email,
        phone: edit.phone,
        driver_type: edit.driver_type,
        driver_type_other:
          edit.driver_type === OTHER_VALUE ? edit.driver_type_other.trim() : null,
        location: edit.location,
        location_other:
          edit.location === OTHER_VALUE ? edit.location_other.trim() : null,
        admin_note: edit.admin_note || null,
      });
    } else {
      res = await adminUpdateWaitlist({
        signup_id: id,
        full_name: `${edit.first_name} ${edit.surname}`.trim(),
        email: edit.email,
        phone: edit.phone,
        driver_type: edit.driver_type,
        driver_type_other:
          edit.driver_type === OTHER_VALUE ? edit.driver_type_other.trim() : null,
        location: edit.location,
        location_other:
          edit.location === OTHER_VALUE ? edit.location_other.trim() : null,
        admin_note: edit.admin_note || null,
      });
    }
    setSaving(false);
    if (!res.ok) {
      toast.error(res.error);
      return;
    }
    toast.success("Saved");
    void load();
  };

  const onReplaceFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    e.target.value = ""; // allow re-selecting same file
    if (!f) return;
    if (f.size > 10 * 1024 * 1024) {
      toast.error("File too large (max 10MB)");
      return;
    }
    setUploading(true);
    try {
      const ext = f.name.split(".").pop();
      const newPath = `${crypto.randomUUID()}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from("verification")
        .upload(newPath, f);
      if (upErr) throw upErr;
      const res =
        source === "drivers"
          ? await adminReplaceVerificationDoc({ driver_id: id, new_path: newPath })
          : await adminReplaceWaitlistDoc({ signup_id: id, new_path: newPath });
      if (!res.ok) throw new Error(res.error);
      toast.success("Verification document replaced");
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  if (!driver || !edit) {
    return (
      <div className="grid place-items-center py-20">
        <Loader2 className="animate-spin text-primary size-8" />
      </div>
    );
  }

  const isImage = driver.verification_file_url?.match(/\.(png|jpe?g|webp|gif)$/i);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Link
        href="/admin/drivers"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> Back to dashboard
      </Link>

      <div className="glass-strong rounded-3xl p-6 md:p-10 shadow-elegant space-y-10">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground mb-2">
              {source === "drivers" ? "Driver account" : "Waitlist application"}
            </div>
            <h1 className="font-display font-black text-3xl md:text-4xl">
              {driver.display_name}
            </h1>
            <div className="text-sm text-muted-foreground mt-1">
              {source === "drivers" ? "Signed up" : "Joined"}{" "}
              {new Date(driver.created_at).toLocaleString()}
            </div>
          </div>
          <StatusBadge status={driver.status} />
        </div>

        {/* Editable form */}
        <form onSubmit={saveEdits} className="space-y-5">
          <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">
            Editable details
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="First name">
              <CleanInput
                value={edit.first_name}
                onChange={(e) => setEdit({ ...edit, first_name: e.target.value })}
              />
            </Field>
            <Field label="Surname">
              <CleanInput
                value={edit.surname}
                onChange={(e) => setEdit({ ...edit, surname: e.target.value })}
              />
            </Field>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Email" icon={Mail}>
              <CleanInput
                type="email"
                value={edit.email}
                onChange={(e) => setEdit({ ...edit, email: e.target.value })}
              />
            </Field>
            <Field label="Phone" icon={Phone}>
              <CleanInput
                type="tel"
                value={edit.phone}
                onChange={(e) => setEdit({ ...edit, phone: e.target.value })}
              />
            </Field>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Driver type" icon={Briefcase}>
              <Select
                value={edit.driver_type}
                onValueChange={(v) => setEdit({ ...edit, driver_type: v })}
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
                  {/* allow legacy values to remain selectable */}
                  {!DRIVER_TYPES.includes(
                    edit.driver_type as (typeof DRIVER_TYPES)[number],
                  ) && edit.driver_type ? (
                    <SelectItem value={edit.driver_type}>
                      {edit.driver_type} (legacy)
                    </SelectItem>
                  ) : null}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Location" icon={MapPin}>
              <Select
                value={edit.location}
                onValueChange={(v) => setEdit({ ...edit, location: v })}
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
                  {!LOCATIONS.includes(edit.location as (typeof LOCATIONS)[number]) &&
                  edit.location ? (
                    <SelectItem value={edit.location}>{edit.location} (legacy)</SelectItem>
                  ) : null}
                </SelectContent>
              </Select>
            </Field>
          </div>

          {edit.driver_type === OTHER_VALUE && (
            <Field label="Driver type — Other">
              <CleanInput
                value={edit.driver_type_other}
                onChange={(e) =>
                  setEdit({ ...edit, driver_type_other: e.target.value })
                }
                placeholder="e.g. Limo driver"
              />
            </Field>
          )}

          {edit.location === OTHER_VALUE && (
            <Field label="Location — Other">
              <CleanInput
                value={edit.location_other}
                onChange={(e) => setEdit({ ...edit, location_other: e.target.value })}
                placeholder="e.g. South Shields"
              />
            </Field>
          )}

          <Field label="Admin note">
            <Textarea
              value={edit.admin_note}
              onChange={(e) => setEdit({ ...edit, admin_note: e.target.value })}
              rows={3}
              placeholder="Internal notes — only admins see this"
            />
          </Field>

          <div className="flex">
            <Button
              type="submit"
              variant="hero"
              size="lg"
              disabled={saving}
            >
              {saving ? (
                <>
                  <Loader2 className="size-4 animate-spin" /> Saving…
                </>
              ) : (
                <>
                  <Save className="size-4" /> Save changes
                </>
              )}
            </Button>
          </div>
        </form>

        {/* Verification doc */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="text-xs uppercase tracking-wider text-muted-foreground">
              Verification file
            </div>
            <label className="inline-flex items-center gap-1.5 text-xs font-medium text-brand cursor-pointer hover:underline">
              <Upload className="size-3.5" />
              {uploading ? "Uploading…" : "Replace"}
              <input
                type="file"
                accept="image/*,application/pdf"
                className="hidden"
                onChange={onReplaceFile}
              />
            </label>
          </div>
          {fileUrl ? (
            <div className="glass rounded-xl p-4">
              {isImage ? (
                <img src={fileUrl} alt="Verification" className="max-h-96 rounded-lg mx-auto" />
              ) : (
                <a
                  href={fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-3 hover:text-primary"
                >
                  <FileText className="size-6 text-primary" />
                  <span>Open verification document</span>
                </a>
              )}
            </div>
          ) : (
            <div className="glass rounded-xl p-6 text-sm text-muted-foreground">
              No file uploaded.
            </div>
          )}
        </div>

        {/* Decision */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            onClick={() => updateStatus("approved")}
            disabled={busy}
            variant="hero"
            size="lg"
            className="flex-1"
          >
            <CheckCircle2 /> Approve
          </Button>
          <Button
            onClick={() => updateStatus("rejected")}
            disabled={busy}
            variant="destructive"
            size="lg"
            className="flex-1"
          >
            <XCircle /> Reject
          </Button>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  icon: Icon,
  children,
}: {
  label: string;
  icon?: typeof Mail;
  children: ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label className="flex items-center gap-1.5 text-sm font-medium">
        {Icon ? <Icon className="size-3.5 text-muted-foreground" /> : null}
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
