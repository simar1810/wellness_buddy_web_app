export function validateRecognitionPayload(payload) {
  if (payload.person === "coach" && !/^[a-f\d]{24}$/i.test(payload.coach)) {
    return { valid: false, message: "Invalid coach id" };
  }
  if (payload.person === "client" && !/^[a-f\d]{24}$/i.test(payload.client)) {
    return { valid: false, message: "Invalid client id" };
  }
  if (!["active", "inactive", "archive"].includes(payload.status)) {
    return { valid: false, message: "Status must be active, inactive or archive" };
  }
  if (isNaN(Date.parse(payload.recognisedAt))) {
    return { valid: false, message: "Invalid recognisedAt date" };
  }
  if (!payload.person || !["client", "coach"].includes(payload.person)) {
    return { valid: false, message: "Person is required and must be 'client' or 'coach'" };
  }
  if (!Array.isArray(payload.availability) || payload.availability.length === 0) {
    return { valid: false, message: "Availibility must be a non-empty array" };
  }
  if (!payload.availability?.every(item => ["client", "coach"].includes(item))) {
    return { valid: false, message: "Each item in availibility must be 'client' or 'coach'" };
  }
  return { valid: true };
}

export const updateQueryCache = function (cache, currentKey, mutate) {
  for (const key of cache.keys()) {
    if (
      typeof key === "string" &&
      key.startsWith("app/recognition") &&
      key !== currentKey
    ) {
      mutate(key, undefined, { revalidate: false });
    }
  }
};