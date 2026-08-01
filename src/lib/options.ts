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

export const OTHER_VALUE = "Other";

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
