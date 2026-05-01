"use client";
import ContentError from "@/components/common/ContentError";
import ContentLoader from "@/components/common/ContentLoader";
import Pagination from "@/components/common/Pagination";
import CreateYTRecipe from "@/components/yt-recipes/CreateYTRecipe";
import RecipeCard from "@/components/yt-recipes/RecipeCard";
import { fetchData } from "@/lib/api";
import { buildUrlWithQueryParams } from "@/lib/formatter";
import { RefreshCcw, Utensils } from "lucide-react";
import { useMemo, useState } from "react";
import useSWR from "swr";

export default function RecipePage() {
  const [paginate, setPaginate] = useState({
    limit: 10,
    page: 1
  });

  const endpoint = useMemo(
    () => buildUrlWithQueryParams("app/yt-recipe/video-library?person=coach", paginate),
    [paginate]
  );

  const { isLoading, error, data, mutate, isValidating } = useSWR(endpoint, () => fetchData(endpoint));

  if (isLoading || isValidating) return <ContentLoader />;

  if (error || data?.status_code !== 200)
    return (<ContentError title={error || data?.message} />);

  const recipes = Array.isArray(data?.data) ? data.data : [];

  const hasNext = paginate.page < (data.pagination?.total / paginate.limit);
  const hasPrev = paginate.page > 1;

  return (
    <div className="content-container content-height-screen mt-0 space-y-6">
      <div className="flex items-center justify-between border rounded-xl bg-white px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-orange-50">
            <Utensils className="w-4 h-4 text-orange-500" />
          </div>
          <div>
            <h2 className="text-sm font-semibold">Video Recipes</h2>
            <p className="text-xs text-muted-foreground">Manage your cooking tutorials</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => mutate()}
            className="flex items-center gap-2 text-sm border rounded-md px-3 py-1.5 hover:bg-muted transition"
          >
            <RefreshCcw className={`w-4 h-4 ${isValidating ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <CreateYTRecipe currentSWRKey={endpoint} />
        </div>
      </div>

      {recipes.length === 0 && (
        <div className="py-24 text-center text-sm text-muted-foreground border rounded-xl bg-white">
          No recipes found. Start by adding one!
        </div>
      )}

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {recipes.map((item) => (
          <RecipeCard
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
  );
}