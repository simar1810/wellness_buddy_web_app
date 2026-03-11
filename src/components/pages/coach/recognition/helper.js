export function validateRecognitionPayload(payload) {
  if (!/^[a-f\d]{24}$/i.test(payload.coach)) {
    return { valid: false, message: "Invalid coach id" };
  }
  if (!["active", "inactive", "archive"].includes(payload.status)) {
    return { valid: false, message: "Status must be active, inactive or archive" };
  }
  if (isNaN(Date.parse(payload.recognisedAt))) {
    return { valid: false, message: "Invalid recognisedAt date" };
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