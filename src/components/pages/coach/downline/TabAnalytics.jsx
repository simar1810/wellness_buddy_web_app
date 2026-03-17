
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import { useMemo, useState, useRef, useEffect } from "react";

export default function TabsAnalytics({ coach }) {
  const monthlyData = coach?.monthlyDownlineAnalytics || {};
  const overall = coach?.downlineAnalytics || {};
  const percentages = coach?.percentages || {};

  const monthKeys = Object.keys(monthlyData);

  const [selectedMonths, setSelectedMonths] = useState(monthKeys);
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredStats = useMemo(() => {
    return selectedMonths.reduce(
      (acc, month) => {
        const data = monthlyData[month];
        if (!data) return acc;
        acc.coachSubscriptionsLevel1 += data?.coachSubscriptionsLevel1 || 0;
        acc.clientSubscriptions += data?.clientSubscriptions || 0;
        acc.clusterClientSubscriptions +=
          data.clusterSubscriptions?.clientSubscriptions || 0;
        acc.clusterCoachSubscriptions +=
          data.clusterSubscriptions?.coachSubscriptions || 0;
        return acc;
      },
      {
        coachSubscriptionsLevel1: 0,
        clientSubscriptions: 0,
        clusterClientSubscriptions: 0,
        clusterCoachSubscriptions: 0,
      }
    );
  }, [selectedMonths, monthlyData]);

  const toggleMonth = (month) => {
    setSelectedMonths((prev) =>
      prev.includes(month)
        ? prev.filter((m) => m !== month)
        : [...prev, month]
    );
  };

  return (
    <div className="space-y-8 bg-white">
      <div className="grid items-stretch lg:grid-cols-2 gap-4">
        <Section title="Overall Analytics">
          <StatsGrid
            coachSubscriptionsLevel1={overall.coachSubscriptionsLevel1}
            clientSubscriptions={overall.clientSubscriptions}
            clusterClientSubscriptions={overall.clusterSubscriptions?.clientSubscriptions}
            clusterCoachSubscriptions={overall.clusterSubscriptions?.coachSubscriptions}
          />
        </Section>
        <Section
          title="Monthly Analytics"
          rightElement={
            <div className="relative" ref={dropdownRef}>
              <Button
                variant="wz_outline"
                onClick={() => setOpen(!open)}
                className="bg-[var(--accent-1)]/10 flex items-center justify-between gap-2 min-w-[140px] border px-3 py-2 text-sm rounded-md"
              >
                <span>
                  {selectedMonths?.length === monthKeys.length
                    ? "All Months"
                    : `${selectedMonths.length} Selected`}
                </span>
                <ChevronDown
                  size={16}
                  className={`transition-transform duration-200 ${open ? "rotate-180" : ""
                    }`}
                />
              </Button>
              {open && (
                <div className="absolute right-0 mt-2 w-48 border rounded-md bg-white z-20">
                  <div className="max-h-60 overflow-auto">
                    {monthKeys.map((month) => (
                      <label
                        key={month}
                        className="flex items-center gap-2 px-3 py-2 text-sm border-b last:border-b-0 select-none cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={selectedMonths.includes(month)}
                          onChange={() => toggleMonth(month)}
                        />
                        {formatMonth(month)}
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
          }
        >
          <StatsGrid {...filteredStats} />
        </Section>
      </div>
      <Section title="Achievement Progress">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {Object.entries(percentages).map(([key, value]) => (
            <AchievementCard
              key={key}
              label={formatLabel(key)}
              value={Number(value)}
            />
          ))}
        </div>
      </Section>
    </div>
  );
}

function Section({ title, children, rightElement }) {
  return (
    <div className="bg-gray-50 border rounded-xl p-4 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-base font-semibold">{title}</h2>
        {rightElement}
      </div>
      {children}
    </div>
  );
}

function StatsGrid({
  coachSubscriptionsLevel1,
  clientSubscriptions,
  clusterClientSubscriptions,
  clusterCoachSubscriptions,
}) {
  const items = useMemo(() => [
    { label: "Level 1 Coaches", value: coachSubscriptionsLevel1, },
    { label: "Client Subscriptions", value: clientSubscriptions, },
    { label: "Cluster Client Subs", value: clusterClientSubscriptions, },
    { label: "Cluster Coach Subs", value: clusterCoachSubscriptions, },
  ], [coachSubscriptionsLevel1, clientSubscriptions, clusterClientSubscriptions, clusterCoachSubscriptions]);
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
      {items.map((item) => (
        <div key={item.label} className="space-y-1">
          <p className="text-xs text-gray-500">{item.label}</p>
          <p className="text-2xl font-semibold">{item.value || 0}</p>
        </div>
      ))}
    </div>
  );
}

function AchievementCard({ label, value }) {
  return (
    <div className="border rounded-lg p-4 space-y-3 bg-white">
      <div className="flex justify-between items-center">
        <span className="text-xs text-gray-600">
          {label}
        </span>
        <span className="text-sm font-semibold">
          {value}%
        </span>
      </div>
      <div className="w-full border-1 border-black rounded-full h-3 overflow-hidden bg-gray-300">
        <div
          className="h-full bg-[var(--accent-1)] transition-all"
          style={{ width: `${Math.min(value, 100)}%` }}
        />
      </div>
    </div>
  );
}

function formatMonth(month) {
  const [m, y] = month.split("-");
  const date = new Date(`${y}-${m}-01`);
  return date.toLocaleString("default", { month: "short", year: "numeric" });
}

function formatLabel(label) {
  return label.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase());
}