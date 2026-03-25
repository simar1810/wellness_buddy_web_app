"use client";
import ContentError from "@/components/common/ContentError";
import ContentLoader from "@/components/common/ContentLoader";
import Pagination from "@/components/common/Pagination";
import CreateReward from "@/components/rewards/CreateReward";
import { RewardCard } from "@/components/rewards/RewardCard";
import { fetchData } from "@/lib/api";
import { buildUrlWithQueryParams } from "@/lib/formatter";
import { RefreshCcw, Sparkles } from "lucide-react";
import { useMemo, useState } from "react";
import useSWR from "swr";

export default function Page() {
  const [paginate, setPaginate] = useState({
    limit: 10,
    page: 1
  });

  const endpoint = useMemo(
    () => buildUrlWithQueryParams("app/reward?person=coach", paginate),
    [paginate]
  );

  const { isLoading, error, data, mutate, isValidating } = useSWR(endpoint, () => fetchData(endpoint));

  if (isLoading || isValidating) return <ContentLoader />;

  if (error || data?.status_code !== 200)
    return (<ContentError title={error || data?.message} />);

  const rewards = Array.isArray(data?.data) ? data.data : [];

  const hasNext = paginate.page < data.pagination?.total / paginate.limit;
  const hasPrev = paginate.page > 1;

  return (
    <div className="content-container content-height-screen mt-0 space-y-6">
      <div className="flex items-center justify-between border rounded-xl bg-white px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-muted">
            <Sparkles className="w-4 h-4 text-muted-foreground" />
          </div>
          <div>
            <h2 className="text-sm font-semibold">
              Rewards
            </h2>
            <p className="text-xs text-muted-foreground">
              Manage rewards and gifts
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={mutate}
            className="flex items-center gap-2 text-sm border rounded-md px-3 py-1.5 hover:bg-muted transition"
          >
            <RefreshCcw className="w-4 h-4" />
            Refresh
          </button>
          <CreateReward currentSWRKey={endpoint} />
        </div>
      </div>

      {rewards.length === 0 && (
        <div className="py-24 text-center text-sm text-muted-foreground border rounded-xl">
          No Rewards available
        </div>
      )}

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {rewards.map((item) => (
          <RewardCard
            currentSWRKey={endpoint}
            key={item._id}
            item={item}
          />
        ))}
      </div>

      <Pagination
        page={paginate.page}
        hasNext={hasNext}
        hasPrev={hasPrev}
        onPrev={() => setPaginate(p => ({ ...p, page: p.page - 1 }))}
        onNext={() => setPaginate(p => ({ ...p, page: p.page + 1 }))}
      />

    </div>
  )
}