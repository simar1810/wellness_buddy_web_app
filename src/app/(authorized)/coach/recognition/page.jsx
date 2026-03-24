"use client";

import ContentError from "@/components/common/ContentError";
import ContentLoader from "@/components/common/ContentLoader";
import CreateRecognitionModal from "@/components/pages/coach/recognition/CreateRecognitionModal";
import { fetchData } from "@/lib/api";
import { buildUrlWithQueryParams, trimString } from "@/lib/formatter";
import { useMemo, useState } from "react";
import useSWR from "swr";
import { ChevronLeft, ChevronRight, Calendar, User, Sparkles, RefreshCcw, Copy, UserCheck, Globe } from "lucide-react";
import DeleteRecognition from "@/components/pages/coach/recognition/DeleteRecognition";
import UpdateRecognitionModal from "@/components/pages/coach/recognition/UpdateRecognitionModal";
import Pagination from "@/components/common/Pagination";

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
    active: "bg-green-100 text-green-700 border-green-200",
    inactive: "bg-gray-100 text-gray-700 border-gray-200",
    archive: "bg-amber-100 text-amber-700 border-amber-200",
  };

  return (
    <div className="group border rounded-2xl bg-white overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col">
      <div className="h-44 bg-slate-50 flex items-center justify-center overflow-hidden relative">
        {item.image ? (
          <img
            src={item.image}
            alt="Recognition"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="flex flex-col items-center gap-2">
            <div className="p-3 bg-white rounded-full shadow-sm">
              <User className="w-6 h-6 text-slate-300" />
            </div>
            <span className="text-[10px] uppercase tracking-widest text-slate-400 font-medium">No Image</span>
          </div>
        )}
        <div className="absolute top-3 right-3 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="bg-white/90 backdrop-blur-sm p-1.5 rounded-xl border shadow-sm flex gap-1">
            <UpdateRecognitionModal currentCacheKey={endpoint} recognition={item} />
            <DeleteRecognition currentCacheKey={endpoint} recognitionId={item._id} />
          </div>
        </div>
        <div className="absolute bottom-3 left-3">
          <span className="bg-black/60 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-1 rounded-lg uppercase tracking-wider">
            {item.person}
          </span>
        </div>
      </div>
      <div className="p-5 space-y-2 flex-grow">
        <div>
          <h5>{item.title}</h5>
          {/* <p className="text-xs text-gray-500 leading-tight mt-[2px] mb-4">{trimString(item.description || "", 20)}</p> */}
        </div>
        <div className="space-y-1">
          {item.coach?.name ? (
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              {item.coach.name}
              <span className="text-[11px] font-normal text-slate-400">#{item.coach.coachId}</span>
            </h3>
          ) : (
            <h3 className="text-sm font-bold text-slate-400 italic flex items-center gap-2">
              {item.client?.name || <span className="text-xs italic text-gray-400">Unknown User</span>}
              <span className="text-[11px] font-normal text-slate-400">#{item.client?.clientId}</span>
            </h3>
          )}

          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Calendar className="w-3.5 h-3.5" />
            {new Date(item.recognisedAt?.$date || item.recognisedAt).toLocaleDateString(undefined, {
              month: 'short', day: 'numeric', year: 'numeric'
            })}
          </div>
        </div>
        <hr className="border-slate-100" />
        <div className="flex items-center justify-between mt-auto">
          <div className="pt-3 border-t border-slate-50 flex items-center justify-between">
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight block">
                Visible To
              </span>
              <div className="flex flex-wrap gap-1">
                {item.availability?.map((role) => (
                  <span
                    key={role}
                    className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200 capitalize"
                  >
                    {role}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-tight mb-1.5">Status</p>
            <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${statusColor[item.status] || statusColor.inactive}`}>
              {item.status.toUpperCase()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}