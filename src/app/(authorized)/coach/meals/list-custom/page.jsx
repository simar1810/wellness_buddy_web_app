"use client";
import ContentError from "@/components/common/ContentError";
import ContentLoader from "@/components/common/ContentLoader";
import AssignMealModal from "@/components/modals/Assignmealmodal";
import { Badge } from "@/components/ui/badge";
import { getCustomMealPlans } from "@/lib/fetchers/app";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import useSWR from "swr";

export default function Page() {
  const { isLoading, error, data } = useSWR("custom-meal-plans", () => getCustomMealPlans("coach"));
  const searchParams = useSearchParams();
  const mode = searchParams.get("mode");
  if (isLoading) return <ContentLoader />
  if (error || data?.status_code !== 200) return <ContentError title={error || data?.message} />
  const filteredMealPlansmeals = ["daily", "monthly", "weekly"].includes(mode)
    ? data.data.filter(meal => meal.mode === mode)
    : data.data
  return <main className="content-container content-height-screen">
    <div className="flex items-center justify-between">
      <h4>Meal Plans</h4>
      {mode && <Link
        className="px-4 py-2 rounded-[10px] bg-[var(--accent-1)] text-white font-bold leading-[1] text-[14px]"
        href={`/coach/meals/add-custom/${mode}`}
      >
        Add
      </Link>}
    </div>
    <div className="mt-6 grid grid-cols-4 gap-4">
      {filteredMealPlansmeals.map(meal => <div
        key={meal._id}
        className="bg-[var(--comp-2)] flex flex-col rounded-[12px] border-1 overflow-clip relative"
      >
        <Link href={`/coach/meals/list-custom/${meal._id}`}>
          <Image
            src={meal.image || "/not-found.png"}
            alt=""
            height={200}
            width={200}
            className="w-full max-h-[140px] object-cover border-b-1"
            onError={e => e.target.src = "/not-found.png"}
          />
        </Link>
        <div className="grow p-3 flex flex-col">
          <Link href={`/coach/meals/list-custom/${meal._id}`}>
            <h3>{meal.title}</h3>
          </Link>
          <div className="mt-auto pt-2 flex items-center justify-between">
            <Badge className="capitalize">{meal.mode}</Badge>
            <AssignMealModal planId={meal._id} type="custom" />
          </div>
        </div>
        {meal.admin && <Badge
          variant="wz"
          className="text-[10px] font-bold absolute top-2 right-2"
        >
          Admin
        </Badge>}
      </div>)}
    </div>
    {(filteredMealPlansmeals.length === 0) && <ContentError title="No Meal Plans Found!" className="font-bold mt-0 border-0" />}
  </main>
}