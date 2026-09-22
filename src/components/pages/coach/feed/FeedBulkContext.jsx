"use client";

import { createContext, useContext } from "react";

export const FeedBulkContext = createContext({
  selected: [],
  setSelected: () => {},
  selectable: false,
});

export function useFeedBulk() {
  return useContext(FeedBulkContext);
}
