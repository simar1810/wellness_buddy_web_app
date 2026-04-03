
import { Button } from "@/components/ui/button";
import { copyText } from "@/lib/utils";
import { compareAsc, parse } from "date-fns";
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
      <div className="grid items-stretch lg:gr id-cols-2 gap-4">
        <Section title="Overall Analytics">
          <StatsGrid
            coachSubscriptionsLevel1={overall.coachSubscriptionsLevel1}
            clientSubscriptions={overall.clientSubscriptions}
            clusterClientSubscriptions={overall.clientSubscriptions + overall.clusterSubscriptions?.clientSubscriptions}
            clusterCoachSubscriptions={overall.coachSubscriptionsLevel1 + overall.clusterSubscriptions?.coachSubscriptions}
          />
        </Section>
        <MonthlyAnalytics rawData={monthlyData} />
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

function MonthlyAnalytics({ rawData }) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const sortedData = Object.entries(rawData)
    .map(([key, val]) => ({ month: key, ...val }))
    .sort((a, b) => {
      const dateA = parse(a.month, 'MM-yyyy', new Date());
      const dateB = parse(b.month, 'MM-yyyy', new Date());
      return compareAsc(dateA, dateB);
    });

  const totalPages = Math.ceil(sortedData.length / itemsPerPage);
  const currentItems = sortedData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="border-1 border-slate-200 bg-slate-100 rounded-2xl overflow-hidden">
      <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-white">
        <h2 className="font-bold text-[16px]">Monthly Analytics</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-slate-50/50">
              <th className="px-8 py-4 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider">Month</th>
              <th className="px-8 py-4 text-right text-[11px] font-bold text-slate-500 uppercase tracking-wider">Lvl 1 Coaches</th>
              <th className="px-8 py-4 text-right text-[11px] font-bold text-slate-500 uppercase tracking-wider">Client Subs</th>
              <th className="px-8 py-4 text-right text-[11px] font-bold text-slate-500 uppercase tracking-wider">Cluster Clients</th>
              <th className="px-8 py-4 text-right text-[11px] font-bold text-slate-500 uppercase tracking-wider">Cluster Coaches</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {currentItems.map((item) => (
              <tr key={item.month} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-8 py-4 font-medium">{item.month}</td>
                <td className="px-8 py-4 text-right text-slate-600">{item.coachSubscriptionsLevel1 || 0}</td>
                <td className="px-8 py-4 text-right text-slate-600">{item.clientSubscriptions || 0}</td>
                <td className="px-8 py-4 text-right text-slate-600">{item.clusterSubscriptions?.clientSubscriptions || 0}</td>
                <td className="px-8 py-4 text-right text-slate-600">{item.clusterSubscriptions?.coachSubscriptions || 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {totalPages > 1 && (
        <div className="px-8 py-4 border-t border-slate-100 flex items-center justify-between bg-white">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="text-sm font-semibold text-slate-600 hover:text-slate-900 disabled:opacity-30"
          >
            Previous
          </button>
          <div className="flex gap-2">
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                className={`w-8 h-8 text-xs font-bold rounded-lg transition-all ${currentPage === i + 1 ? 'bg-green-600 text-white' : 'text-slate-400 hover:bg-slate-100'}`}
              >
                {i + 1}
              </button>
            ))}
          </div>
          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="text-sm font-semibold text-slate-600 hover:text-slate-900 disabled:opacity-30"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}