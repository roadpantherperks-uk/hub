/**
 * Partner pricing tiers. Pure data — safe to import from both client and server.
 * The `plan` column on businesses stores one of these keys.
 */

export type PlanKey = "basic" | "advanced";

export type Tier = {
  key: PlanKey;
  label: string;
  pence: number; // monthly price in pence
  offers: number; // max driver offers (perks) allowed
  badge: string; // partner badge shown publicly
  recommended: boolean;
  features: string[];
};

export const TIERS: Record<PlanKey, Tier> = {
  basic: {
    key: "basic",
    label: "Basic Listing",
    pence: 900,
    offers: 1,
    badge: "Road Panther Partner",
    recommended: false,
    features: [
      "Business profile",
      "Contact details visible",
      "Category listing",
      "One driver offer",
      "Standard Partner badge",
    ],
  },
  advanced: {
    key: "advanced",
    label: "Advanced Listing",
    pence: 2400,
    offers: 3,
    badge: "Recommended Road Panther Partner",
    recommended: true,
    features: [
      "Everything in Basic",
      "Appear higher in category results",
      "“Recommended” Partner badge",
      "Up to 3 driver offers",
      "Featured to drivers (offer broadcasts coming soon)",
    ],
  },
};

export const DEFAULT_PLAN: PlanKey = "basic";

/** Normalise any stored plan string to a known tier (older rows may say 'founding_partner'). */
export function resolveTier(plan: string | null | undefined): Tier {
  if (plan === "advanced") return TIERS.advanced;
  return TIERS.basic;
}

export function poundsLabel(pence: number): string {
  return `£${(pence / 100).toFixed(pence % 100 === 0 ? 0 : 2)}`;
}
