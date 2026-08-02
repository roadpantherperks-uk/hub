"use client";

import { useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Camera, Loader2, User } from "lucide-react";

const MAX_BYTES = 5 * 1024 * 1024;
const ACCEPTED = ["image/jpeg", "image/png", "image/webp"];

/**
 * Card photo upload. Goes straight to the private member-photos bucket from the
 * browser — the storage policy confines each driver to their own <uid>/ folder,
 * so there's no anonymous write path and nothing to proxy through a server
 * action (which would hit Next's 1MB body cap anyway).
 */
export function PhotoUpload({
  userId,
  initialPath,
  initialSignedUrl,
}: {
  userId: string;
  initialPath: string | null;
  initialSignedUrl: string | null;
}) {
  const [preview, setPreview] = useState<string | null>(initialSignedUrl);
  const [hasPhoto, setHasPhoto] = useState(!!initialPath);
  const [busy, setBusy] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const onPick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ACCEPTED.includes(file.type)) {
      toast.error("Use a JPEG, PNG or WebP image");
      return;
    }
    if (file.size > MAX_BYTES) {
      toast.error("That image is over 5MB — try a smaller one");
      return;
    }

    setBusy(true);
    try {
      const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
      // Fixed filename per user so a re-upload replaces rather than accumulates.
      const path = `${userId}/photo.${ext}`;

      const { error: upErr } = await supabase.storage
        .from("member-photos")
        .upload(path, file, { upsert: true, contentType: file.type });
      if (upErr) throw new Error(upErr.message);

      const { error: dbErr } = await supabase
        .from("drivers")
        .update({ photo_url: path })
        .eq("id", userId);
      if (dbErr) throw new Error(dbErr.message);

      const { data: signed } = await supabase.storage
        .from("member-photos")
        .createSignedUrl(path, 60 * 30);

      setPreview(signed?.signedUrl ?? null);
      setHasPhoto(true);
      toast.success("Photo updated — it's on your member card now");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div className="hairline rounded-2xl p-5 bg-card-soft space-y-4">
      <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
        <Camera className="size-3.5" /> Member card photo
      </div>

      <div className="flex items-center gap-5">
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt="Your card photo" className="size-20 rounded-xl object-cover hairline" />
        ) : (
          <div className="size-20 rounded-xl grid place-items-center hairline bg-background">
            <User className="size-8 text-muted-foreground" strokeWidth={1.5} />
          </div>
        )}

        <div className="min-w-0">
          <p className="text-sm text-muted-foreground leading-relaxed">
            A clear head-and-shoulders photo. Partners check it matches the person claiming
            the offer.
          </p>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={busy}
            className="mt-3 inline-flex items-center gap-2 h-10 px-4 rounded-full bg-foreground text-background text-sm font-semibold hover:bg-foreground/90 transition-colors disabled:opacity-50"
          >
            {busy ? (
              <><Loader2 className="size-4 animate-spin" /> Uploading…</>
            ) : (
              <><Camera className="size-4" /> {hasPhoto ? "Replace photo" : "Upload photo"}</>
            )}
          </button>
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED.join(",")}
        onChange={onPick}
        className="hidden"
      />
    </div>
  );
}
