import { addDays, addMonths, format } from "date-fns";

export const MEMBERSHIP_TIER_CONFIG = {
  none: {
    amount: 0,
    days: 0,
    calcEndDate: (date) => format(date, "yyyy-MM-dd")
  },
  demo: {
    amount: 0,
    days: 2,
    calcEndDate: (date) => format(
      addDays(date, 2),
      "yyyy-MM-dd"
    )
  },
  silver: {
    amount: 4500,
    days: 30,
    calcEndDate: (date) => format(
      addMonths(date, 1),
      "yyyy-MM-dd"
    )
  },
  gold: {
    amount: 6990,
    days: 30,
    calcEndDate: (date) => format(
      addMonths(date, 1),
      "yyyy-MM-dd"
    )
  },
}