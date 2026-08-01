import "server-only";

import { adminClient } from "./admin-client";
import { resolveTier } from "@/lib/tiers";
import { OTHER_VALUE } from "@/lib/options";

/**
 * Public read helpers for the marketing pages. These run on the server with the
 * service-role key and return ONLY safe columns — never Stripe ids, redemption
 * codes, or contact details — so nothing sensitive reaches the browser.
 */

export type PublicPartner = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  category: string | null;
  location: string | null;
  logo_url: string | null;
  website: string | null;
  badge: string;
  recommended: boolean;
};

export async function getApprovedPartners(): Promise<PublicPartner[]> {
  try {
    const sb = adminClient();
    const { data } = await sb
      .from("businesses")
      .select("id, name, slug, description, category, category_other, location, logo_url, website, plan")
      .eq("status", "approved");

    type Row = Omit<PublicPartner, "badge" | "recommended" | "category"> & {
      category: string | null;
      category_other: string | null;
      plan: string | null;
    };
    const rows = (data as Row[] | null) ?? [];

    return rows
      .map(({ category, category_other, ...r }) => {
        const tier = resolveTier(r.plan);
        return {
          ...r,
          // Publicly a business is whatever it actually does — show the typed
          // trade rather than the bare word "Other".
          category: category === OTHER_VALUE ? category_other || null : category,
          badge: tier.badge,
          recommended: tier.recommended,
        };
      })
      // Advanced (recommended) partners rank above Basic, then alphabetical.
      .sort((a, b) => Number(b.recommended) - Number(a.recommended) || a.name.localeCompare(b.name));
  } catch (err) {
    // Missing env (e.g. service key not set yet) shouldn't 500 a marketing page.
    console.error("[public-data] getApprovedPartners:", err);
    return [];
  }
}

export type PublicPerk = {
  id: string;
  title: string;
  summary: string | null;
  discount_label: string | null;
  location_label: string | null;
  category_name: string | null;
  category_slug: string | null;
  business_name: string | null;
  business_logo: string | null;
  recommended: boolean;
};

export async function getActivePerks(): Promise<PublicPerk[]> {
  try {
    const sb = adminClient();
    // Note: no `code`/`link` here — redemption details are gated to approved
    // drivers in the dashboard (Phase 2), never exposed on the public preview.
    const { data } = await sb
      .from("perks")
      .select(
        `id, title, summary, discount_label, location_label, sort_order,
         perk_categories ( name, slug ),
         businesses!inner ( name, logo_url, status, plan )`,
      )
      .eq("is_active", true);

    type Row = {
      id: string;
      title: string;
      summary: string | null;
      discount_label: string | null;
      location_label: string | null;
      sort_order: number;
      perk_categories: { name: string; slug: string } | null;
      businesses: { name: string; logo_url: string | null; status: string; plan: string | null } | null;
    };

    return ((data as Row[] | null) ?? [])
      .filter((r) => r.businesses?.status === "approved")
      .map((r) => {
        const recommended = resolveTier(r.businesses?.plan).recommended;
        return {
          id: r.id,
          title: r.title,
          summary: r.summary,
          discount_label: r.discount_label,
          location_label: r.location_label,
          category_name: r.perk_categories?.name ?? null,
          category_slug: r.perk_categories?.slug ?? null,
          business_name: r.businesses?.name ?? null,
          business_logo: r.businesses?.logo_url ?? null,
          recommended,
          _sort: r.sort_order,
        };
      })
      // Advanced partners' offers rank above Basic within the listing, then sort_order.
      .sort((a, b) => Number(b.recommended) - Number(a.recommended) || a._sort - b._sort)
      .map(({ _sort, ...rest }) => { void _sort; return rest; });
  } catch (err) {
    console.error("[public-data] getActivePerks:", err);
    return [];
  }
}

export type PerkCategory = { id: string; name: string; slug: string };

export async function getPerkCategories(): Promise<PerkCategory[]> {
  try {
    const sb = adminClient();
    const { data } = await sb
      .from("perk_categories")
      .select("id, name, slug")
      .order("sort_order", { ascending: true });
    return (data as PerkCategory[] | null) ?? [];
  } catch (err) {
    console.error("[public-data] getPerkCategories:", err);
    return [];
  }
}
