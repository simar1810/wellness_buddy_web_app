"use client";
import ContentError from "@/components/common/ContentError";
import ContentLoader from "@/components/common/ContentLoader";
import Pagination from "@/components/common/Pagination";
import CreateReward from "@/components/rewards/CreateReward";
import { RewardCard } from "@/components/rewards/RewardCard";
import BulkUploadDialog from "@/components/bulk/BulkUploadDialog";
import BulkDeleteToolbar from "@/components/bulk/BulkDeleteToolbar";
import BulkAvailabilityField, {
  DEFAULT_BULK_AVAILABILITY,
} from "@/components/bulk/BulkAvailabilityField";
import { SelectAllCheckbox } from "@/components/bulk/bulkSelection";
import { fetchData } from "@/lib/api";
import { submitBulkCreate, submitBulkDelete } from "@/lib/bulkCatalog";
import { buildUrlWithQueryParams, checkArray } from "@/lib/formatter";
import { Input } from "@/components/ui/input";
import { RefreshCcw, Sparkles } from "lucide-react";
import { useMemo, useState } from "react";
import useSWR from "swr";
import { useAppSelector } from "@/providers/global/hooks";

export default function Page() {
  const coach = useAppSelector((state) => state.coach.data);
  const isSystemLeader = coach?.clubType === "System Leader";

  const [paginate, setPaginate] = useState({
    limit: 10,
    page: 1,
  });
  const [selected, setSelected] = useState([]);

  const endpoint = useMemo(
    () => buildUrlWithQueryParams("app/reward?person=coach", paginate),
    [paginate]
  );

  const { isLoading, error, data, mutate, isValidating } = useSWR(endpoint, () =>
    fetchData(endpoint)
  );

  if (isLoading || isValidating) return <ContentLoader />;

  if (error || data?.status_code !== 200)
    return <ContentError title={error || data?.message} />;

  const rewards = Array.isArray(data?.data) ? data.data : [];
  const rewardIds = rewards.map((item) => item._id);

  const hasNext = paginate.page < data.pagination?.total / paginate.limit;
  const hasPrev = paginate.page > 1;

  return (
    <div className="content-container content-height-screen mt-0 space-y-6">
      <div className="flex items-center justify-between border rounded-xl bg-white px-5 py-4 flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-muted">
            <Sparkles className="w-4 h-4 text-muted-foreground" />
          </div>
          <div>
            <h2 className="text-sm font-semibold">Rewards</h2>
            <p className="text-xs text-muted-foreground">
              Manage rewards and gifts
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {isSystemLeader && rewards.length > 0 && (
            <div className="flex items-center gap-2 mr-1">
              <SelectAllCheckbox
                ids={rewardIds}
                selected={selected}
                onChange={setSelected}
              />
              <span className="text-xs text-muted-foreground">Select all</span>
            </div>
          )}
          <button
            onClick={mutate}
            className="flex items-center gap-2 text-sm border rounded-md px-3 py-1.5 hover:bg-muted transition"
          >
            <RefreshCcw className="w-4 h-4" />
            Refresh
          </button>
          {isSystemLeader && (
            <BulkUploadDialog
              title="Bulk Upload Rewards"
              createEmptyRow={() => ({
                title: "",
                description: "",
                image: null,
                availability: DEFAULT_BULK_AVAILABILITY,
              })}
              renderRow={(row, _i, onChange) => (
                <div className="space-y-2">
                  <Input
                    placeholder="Title"
                    value={row.title}
                    onChange={(e) => onChange({ title: e.target.value })}
                  />
                  <Input
                    placeholder="Description"
                    value={row.description}
                    onChange={(e) => onChange({ description: e.target.value })}
                  />
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                      onChange({ image: e.target.files?.[0] || null })
                    }
                  />
                  <BulkAvailabilityField
                    value={row.availability}
                    onChange={(availability) => onChange({ availability })}
                  />
                </div>
              )}
              onSubmit={async (rows) => {
                const result = await submitBulkCreate(
                  "app/reward/bulk",
                  rows,
                  (row, imageUrl) => {
                    if (!row.title?.trim() || !row.description?.trim()) {
                      throw new Error("Each row needs title and description");
                    }
                    if (!imageUrl) throw new Error("Each row needs an image");
                    return {
                      title: row.title,
                      description: row.description,
                      image: imageUrl,
                      availability: checkArray(row.availability).length
                        ? row.availability
                        : DEFAULT_BULK_AVAILABILITY,
                    };
                  }
                );
                mutate();
                setSelected([]);
                return result;
              }}
            />
          )}
          <CreateReward currentSWRKey={endpoint} />
        </div>
      </div>

      {isSystemLeader && (
        <BulkDeleteToolbar
          selectedCount={selected.length}
          label="rewards"
          onClear={() => setSelected([])}
          onConfirmDelete={async () => {
            await submitBulkDelete("app/reward/bulk", {
              rewardIds: selected,
            });
            setSelected([]);
            mutate();
          }}
        />
      )}

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
            selected={selected}
            onSelectionChange={setSelected}
            showCheckbox={isSystemLeader}
          />
        ))}
      </div>

      <Pagination
        page={paginate.page}
        hasNext={hasNext}
        hasPrev={hasPrev}
        onPrev={() => setPaginate((p) => ({ ...p, page: p.page - 1 }))}
        onNext={() => setPaginate((p) => ({ ...p, page: p.page + 1 }))}
      />
    </div>
  );
}
