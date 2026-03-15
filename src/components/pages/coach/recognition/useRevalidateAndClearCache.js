"use client";
import { useCallback } from "react";
import { useSWRConfig } from "swr";

export const useRevalidateAndClearCache = function () {
  const { cache, mutate } = useSWRConfig();
  const revalidateAndClear = useCallback(async (currentKey, prefix) => {
    for (const key of cache.keys()) {
      if (
        typeof key === "string" &&
        key !== currentKey &&
        (!prefix || key.startsWith(prefix))
      ) {
        cache.delete(key);
      }
    }

    await mutate(currentKey);
  }, [cache, mutate]);

  return revalidateAndClear;
}