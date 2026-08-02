/**
 * Canonical lists used across signup, profile, and admin forms.
 * Update HERE only — every form pulls from these constants.
 */

export const DRIVER_TYPES = [
  "Private Hire Taxi Driver",
  "Hackney Taxi Driver",
  "Uber Driver (Taxi)",
  "Bolt Driver (Taxi)",
  "Food Delivery Driver",
  "Driving Instructor",
  "Tradesperson",
  "Courier / Parcel Delivery",
  "Other",
] as const;

export type DriverType = (typeof DRIVER_TYPES)[number];

export const LOCATIONS = [
  "Newcastle",
  "Gateshead",
  "Sunderland",
  "Durham",
  "Middlesbrough",
  "Stockton",
  "Hartlepool",
  "Other",
] as const;

export type Location = (typeof LOCATIONS)[number];

/**
 * Business categories, per client spec (Aug 2026). These are the trades a
 * partner business belongs to — distinct from `perk_categories` in the
 * database, which categorises the individual offers. The two lists are kept
 * deliberately identical so a business and its offer never file under
 * different names; the DB seed lives in the matching migration.
 */
export const BUSINESS_CATEGORIES = [
  "MOT & Services",
  "Car Repair",
  "Tyres",
  "Car Wash",
  "Car Sales Garages",
  "Barbers",
  "Beauty, Nail & Hair Salons",
  "Gyms",
  "Food & Drink",
  "Mobile Phone Shops",
  "Other",
] as const;

export type BusinessCategory = (typeof BUSINESS_CATEGORIES)[number];

export const OTHER_VALUE = "Other";

/** Membership number as it appears on the card: 10001 -> "RPP-10001". */
export function memberId(n: number | null | undefined): string {
  if (!n) return "RPP-—";
  return `RPP-${String(n).padStart(5, "0")}`;
}

/** Cards show "Ahmed E." — full first name, surname initial only. */
export function cardName(first: string, surname: string): string {
  const initial = surname?.trim()?.[0];
  return initial ? `${first} ${initial.toUpperCase()}.` : first;
}

/**
 * Resolves the user-facing label for a driver type, falling back to a custom value if "Other".
 */
export function displayDriverType(
  type: string | null | undefined,
  other: string | null | undefined,
) {
  if (!type) return "—";
  if (type === OTHER_VALUE && other) return `Other — ${other}`;
  return type;
}

export function displayLocation(
  loc: string | null | undefined,
  other: string | null | undefined,
) {
  if (!loc) return "—";
  if (loc === OTHER_VALUE && other) return `Other — ${other}`;
  return loc;
}

export function displayBusinessCategory(
  category: string | null | undefined,
  other: string | null | undefined,
) {
  if (!category) return "—";
  if (category === OTHER_VALUE && other) return `Other — ${other}`;
  return category;
}
