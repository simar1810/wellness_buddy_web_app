"use client";
import Stage1 from "@/components/pages/coach/meal-plan/add/Stage1";
import Stage2 from "@/components/pages/coach/meal-plan/add/Stage2";
import { changeStateDifferentCreationMeal, customMealIS, customMealReducer, selectWorkoutType } from "@/config/state-reducers/custom-meal";
import { getCustomMealPlans } from "@/lib/fetchers/app";
import useCurrentStateContext, { CurrentStateProvider } from "@/providers/CurrentStateContext"
import { format, isValid, parse } from "date-fns";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";

const TIME_FORMATS = [
  { regex: /^\d{2}:\d{2}\s(AM|PM)$/i, format: "hh:mm a", },
  { regex: /^\d{2}:\d{2}$/, format: "HH:mm", },
  { regex: /^\d{2}:\d{2}:\d{2}$/, format: "HH:mm:ss", },
];

export function getFormattedTime(
  dateStr,
  mode = "24h"
) {
  if (!dateStr) return "";
  for (const { regex, format: detectedFormat } of TIME_FORMATS) {
    if (new RegExp(regex).test(dateStr)) {
      const parsed = parse(dateStr, detectedFormat, new Date());
      if (isValid(parsed)) {
        return format(parsed, mode === "24h" ? "HH:mm" : "hh:mm a");
      }
    }
  }
  return "";
}

export default function Page() {
  return <div className="content-container">
    <CurrentStateProvider
      state={customMealIS("new")}
      reducer={customMealReducer}
    >
      <CustomWorkoutContainer />
    </CurrentStateProvider>
  </div>
}

function CustomWorkoutContainer() {
  const searchParams = useSearchParams();
  const mode = searchParams.get("mode")
  const creationType = searchParams.get("creationType");
  const mealId = searchParams.get("mealId")
  const router = useRouter();

  const { dispatch, stage } = useCurrentStateContext();
  const Component = selectCreationStage(stage)

  useEffect(function () {
    ; (async function () {
      if (["edit", "copy_edit"].includes(creationType) && Boolean(mealId)) {
        const response = await getCustomMealPlans("coach", mealId)
        if (response.status_code !== 200) {
          toast.error(response.message);
          router.push("/coach/meals/list-custom");
        }
        const mealPlan = response.data
        const plans = {};
        const editPlans = {}
        for (const field in mealPlan.plans) {
          plans[field] = mealPlan.plans[field].meals?.map(meal => {
            return ({
              ...meal,
              meals: meal.meals.map(item => ({
                ...item,
                time: getFormattedTime(item.meal_time)
              }))
            })
          }) || []
          editPlans[field] = mealPlan.plans[field]._id
        }
        dispatch(changeStateDifferentCreationMeal({
          mode,
          creationType,
          selectedPlans: plans,
          editPlans: editPlans,
          selectedPlan: Object.keys(plans)?.at(0),
          selectedMealType: Object.values(plans)?.at(0)?.at(0)?.mealType,
          thumbnail: mealPlan.image,
          title: mealPlan.title,
          description: mealPlan.description,
          id: mealPlan._id
        }))
      } else if (["daily", "weekly", "monthly"].includes(mode)) {
        dispatch(selectWorkoutType(mode))
      }
    })();
  }, [])

  return Component
}

function selectCreationStage(stage) {
  switch (stage) {
    case 1:
      return <Stage1 />
    case 2:
      return <Stage2 />
    default:
      break;
  }
}