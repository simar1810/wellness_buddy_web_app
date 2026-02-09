import { endOfMonth, format, subMonths } from "date-fns";

export const CLUB_LEADER_JR_QUALIFICATION_DURATION = 2;

export const buildListOfMonths = function (duration) {
  // duration in months
  return Array.from({ length: duration }, (_, i) =>
    format(endOfMonth(subMonths(new Date(), i + 1)), "MM-yyyy"),
  );
};

export const calculateCurrentSubscriptions = function (coach = {}) {
  const { downlineAnalytics } = coach;
  return (
    (downlineAnalytics?.clientSubscriptions || 0) +
    (downlineAnalytics?.coachSubscriptionsLevel1 || 0)
  );
};

export const getClusterSubscriptions = function (coach, clubTypeQualifiedFor) {
  const { downlineAnalytics = {} } = coach;
  const { clusterSubscriptions } = downlineAnalytics
  return (
    downlineAnalytics?.clientSubscriptions +
    downlineAnalytics?.coachSubscriptionsLevel1
  );
};
