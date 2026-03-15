"use client";

import ContentError from "@/components/common/ContentError";
import ContentLoader from "@/components/common/ContentLoader";
import CreateRecognitionModal from "@/components/pages/coach/recognition/CreateRecognitionModal";
import { fetchData } from "@/lib/api";
import { buildUrlWithQueryParams } from "@/lib/formatter";
import { useMemo, useState } from "react";
import useSWR from "swr";
import { ChevronLeft, ChevronRight, Calendar, User, Sparkles, RefreshCcw, Copy } from "lucide-react";
import DeleteRecognition from "@/components/pages/coach/recognition/DeleteRecognition";
import UpdateRecognitionModal from "@/components/pages/coach/recognition/UpdateRecognitionModal";

export default function Page() {
  const [paginate, setPaginate] = useState({
    limit: 10,
    page: 1
  });

  const endpoint = useMemo(
    () => buildUrlWithQueryParams("app/recognition?person=coach", paginate),
    [paginate]
  );

  const { isLoading, error, data, mutate, isValidating } = useSWR(endpoint, () => fetchData(endpoint));

  if (isLoading || isValidating) return <ContentLoader />;

  if (error || data?.status_code !== 200)
    return (<ContentError title={error || data?.message} />);

  const recognitions = Array.isArray(data?.data) ? data.data : [];

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
              Recognitions
            </h2>
            <p className="text-xs text-muted-foreground">
              Manage recognitions and achievements
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
          <CreateRecognitionModal currentCacheKey={endpoint} />
        </div>
      </div>

      {recognitions.length === 0 && (
        <div className="py-24 text-center text-sm text-muted-foreground border rounded-xl">
          No recognitions available
        </div>
      )}

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {recognitions.map((item) => (
          <RecognitionCard
            key={item._id}
            endpoint={endpoint}
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
  );
}

function RecognitionCard({ item, endpoint }) {
  const statusColor = {
    active: "bg-green-100 text-green-700",
    inactive: "bg-gray-100 text-gray-600",
    archive: "bg-yellow-100 text-yellow-700"
  };

  return (
    <div className="border rounded-xl bg-white overflow-hidden hover:shadow-sm transition">
      <div className="h-40 bg-gray-100 flex items-center justify-center overflow-hidden relative">
        {item.image ? (
          <img
            src={item.image}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-xs text-gray-400">No Image</span>
        )}
        <div className="absolute bg-white px-4 py-1 rounded-full border-1 flex items-center gap-2 bottom-2 right-4">
          <DeleteRecognition currentCacheKey={endpoint} recognitionId={item._id} />
          <UpdateRecognitionModal currentCacheKey={endpoint} recognition={item} />
        </div>
      </div>
      <div className="p-4 space-y-3">
        {item.coach && (
          <div className="flex items-center gap-2 text-sm font-medium">
            <User className="w-4 h-4 text-muted-foreground" />
            {item.coach.name}
            <span className="text-xs text-muted-foreground">
              ({item.coach.coachId})
            </span>
          </div>
        )}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Calendar className="w-3.5 h-3.5" />
          {new Date(item.recognisedAt).toLocaleDateString()}
        </div>
        <div>
          <span
            className={`text-xs px-3 py-1 rounded-full capitalize ${statusColor[item.status]}`}
          >
            {item.status}
          </span>
        </div>
      </div>
    </div>
  );
}

function Pagination({ page, hasPrev, hasNext, onPrev, onNext }) {
  return (
    <div className="flex items-center justify-between">
      <div className="text-sm text-muted-foreground">
        Page {page}
      </div>
      <div className="flex items-center gap-2">
        <button
          disabled={!hasPrev}
          onClick={onPrev}
          className="flex items-center gap-1 px-3 py-1.5 text-sm border rounded-md disabled:opacity-40 hover:bg-gray-50 transition"
        >
          <ChevronLeft className="w-4 h-4" />
          Prev
        </button>
        <button
          disabled={!hasNext}
          onClick={onNext}
          className="flex items-center gap-1 px-3 py-1.5 text-sm border rounded-md disabled:opacity-40 hover:bg-gray-50 transition"
        >
          Next
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}