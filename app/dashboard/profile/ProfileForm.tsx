"use client";

import { useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { updateOwnEmail } from "@/integrations/supabase/auth-actions";
import { DRIVER_TYPES, LOCATIONS, OTHER_VALUE } from "@/lib/options";
import { toast } from "sonner";
import { Loader2, Check, Mail } from "lucide-react";

type Initial = {
  first_name: string;
  surname: string;
  email: string;
  phone: string;
  driver_type: string;
  driver_type_other: string | null;
  location: string;
  location_other: string | null;
};

export function ProfileForm({ initial }: { initial: Initial }) {
  const [form, setForm] = useState({
    phone: initial.phone,
    driver_type: initial.driver_type,
    driver_type_other: initial.driver_type_other ?? "",
    location: initial.location,
    location_other: initial.location_other ?? "",
  });
  const [email, setEmail] = useState(initial.email);
  const [saving, setSaving] = useState(false);
  const [emailSaving, setEmailSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (form.driver_type === OTHER_VALUE && !form.driver_type_other.trim()) {
      toast.error("Tell us your driver type");
      return;
    }
    if (form.location === OTHER_VALUE && !form.location_other.trim()) {
      toast.error("Tell us your location");
      return;
    }
    setSaving(true);
    const { error } = await supabase
      .from("drivers")
      .update({
        phone: form.phone,
        driver_type: form.driver_type,
        driver_type_other:
          form.driver_type === OTHER_VALUE ? form.driver_type_other.trim() : null,
        location: form.location,
        location_other:
          form.location === OTHER_VALUE ? form.location_other.trim() : null,
      })
      .eq("email", initial.email);
    setSaving(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    setSavedAt(Date.now());
    toast.success("Profile updated");
  };

  const onChangeEmail = async (e: FormEvent) => {
    e.preventDefault();
    if (email.trim() === initial.email) {
      toast.info("That's already your email");
      return;
    }
    setEmailSaving(true);
    const res = await updateOwnEmail(email.trim());
    setEmailSaving(false);
    if (!res.ok) {
      toast.error(res.error);
      return;
    }
    toast.success("We've sent a confirmation link to your new email");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      {/* Read-only identity */}
      <div className="grid sm:grid-cols-2 gap-4">
        <Disabled label="First name" value={initial.first_name} />
        <Disabled label="Surname" value={initial.surname} />
      </div>

      {/* Email — separate change-email mini-flow */}
      <form onSubmit={onChangeEmail} className="space-y-3 hairline rounded-2xl p-5 bg-card-soft">
        <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
          <Mail className="size-3.5" /> Email
        </div>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="block w-full h-11 rounded-xl bg-background hairline px-4 text-[15px] focus:outline-none focus:ring-2 focus:ring-brand/40 transition-colors"
        />
        <p className="text-[11px] text-muted-foreground leading-relaxed">
          Changing your email triggers a confirmation link to the new address.
          Your account updates once you click that link.
        </p>
        <button
          type="submit"
          disabled={emailSaving || email.trim() === initial.email}
          className="inline-flex items-center justify-center gap-2 bg-foreground text-background font-semibold text-sm px-5 h-10 rounded-full hover:bg-foreground/90 transition-colors disabled:opacity-50"
        >
          {emailSaving ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Sending…
            </>
          ) : (
            "Update email"
          )}
        </button>
      </form>

      {/* Main editable fields */}
      <form onSubmit={onSubmit} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="phone" className="text-sm font-medium">
            Phone
          </Label>
          <input
            id="phone"
            type="tel"
            value={form.phone}
            onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
            className="block w-full h-12 rounded-xl bg-card-soft hairline px-4 text-[15px] focus:outline-none focus:ring-2 focus:ring-brand/40 transition-colors"
          />
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium">Driver type</Label>
            <Select
              value={form.driver_type}
              onValueChange={(v) => setForm((f) => ({ ...f, driver_type: v }))}
            >
              <SelectTrigger className="h-12 rounded-xl bg-card-soft hairline px-4 text-[15px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DRIVER_TYPES.map((d) => (
                  <SelectItem key={d} value={d}>
                    {d}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-medium">Location</Label>
            <Select
              value={form.location}
              onValueChange={(v) => setForm((f) => ({ ...f, location: v }))}
            >
              <SelectTrigger className="h-12 rounded-xl bg-card-soft hairline px-4 text-[15px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LOCATIONS.map((l) => (
                  <SelectItem key={l} value={l}>
                    {l}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {form.driver_type === OTHER_VALUE && (
          <div className="space-y-2">
            <Label htmlFor="driver_type_other" className="text-sm font-medium">
              Tell us your driver type
            </Label>
            <input
              id="driver_type_other"
              value={form.driver_type_other}
              onChange={(e) =>
                setForm((f) => ({ ...f, driver_type_other: e.target.value }))
              }
              placeholder="e.g. Limo driver"
              className="block w-full h-12 rounded-xl bg-card-soft hairline px-4 text-[15px] focus:outline-none focus:ring-2 focus:ring-brand/40 transition-colors"
            />
          </div>
        )}

        {form.location === OTHER_VALUE && (
          <div className="space-y-2">
            <Label htmlFor="location_other" className="text-sm font-medium">
              Tell us your location
            </Label>
            <input
              id="location_other"
              value={form.location_other}
              onChange={(e) =>
                setForm((f) => ({ ...f, location_other: e.target.value }))
              }
              placeholder="e.g. South Shields"
              className="block w-full h-12 rounded-xl bg-card-soft hairline px-4 text-[15px] focus:outline-none focus:ring-2 focus:ring-brand/40 transition-colors"
            />
          </div>
        )}

        <div className="pt-2 flex items-center gap-3">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center justify-center gap-2 bg-foreground text-background font-semibold text-[15px] px-6 h-12 rounded-full hover:bg-foreground/90 transition-colors disabled:opacity-50"
          >
            {saving ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Saving…
              </>
            ) : (
              "Save changes"
            )}
          </button>
          {savedAt && Date.now() - savedAt < 4000 ? (
            <span className="inline-flex items-center gap-1.5 text-sm text-brand">
              <Check className="size-4" /> Saved
            </span>
          ) : null}
        </div>
      </form>
    </motion.div>
  );
}

function Disabled({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">{label}</Label>
      <div className="flex w-full h-12 rounded-xl bg-card-soft hairline px-4 text-[15px] text-muted-foreground items-center cursor-not-allowed">
        {value}
      </div>
    </div>
  );
}
