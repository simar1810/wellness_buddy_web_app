/** Category labels that mean App Coach audience. */
const COACH_ALIASES = new Set([
  "coach",
  "coaches",
  "app coach",
  "app coaches",
]);

const CLIENT_ALIASES = new Set(["client", "all client"]);

export function normalizeAvailabilityValue(name) {
  if (name == null) return name;
  const raw = String(name).trim();
  if (!raw) return raw;
  const lower = raw.toLowerCase();
  if (CLIENT_ALIASES.has(lower)) return "client";
  if (COACH_ALIASES.has(lower)) return "coach";
  return raw;
}

export function availabilityOptionValue(categoryName) {
  return normalizeAvailabilityValue(categoryName);
}
