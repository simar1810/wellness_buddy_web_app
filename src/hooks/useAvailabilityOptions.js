"use client";

import { useMemo } from "react";
import { checkArray } from "@/lib/formatter";
import { useAppSelector } from "@/providers/global/hooks";

export function useAvailabilityOptions() {
  const client_categories =
    useAppSelector((state) => state.coach?.data?.client_categories) || [];

  return useMemo(
    () => [
      { id: 1, name: "All Client", value: "client" },
      { id: 2, name: "Coach", value: "coach" },
      ...checkArray(client_categories).map((category, index) => ({
        id: index + 3,
        name: category.name,
        value: ["Client", "All Client", "coach", "Coach"].includes(category.name)
          ? category.name?.toLowerCase()
          : category.name,
      })),
    ],
    [client_categories]
  );
}
