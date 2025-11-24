import { changeSelectedPlan } from "@/config/state-reducers/custom-meal";
import useCurrentStateContext from "@/providers/CurrentStateContext";
import { Button } from "@/components/ui/button";
import CopyMealPlanModal from "./CopyMealPlanModal";

export default function WeeklyMealCreation() {
  const { dispatch, selectedPlan, selectedPlans } = useCurrentStateContext();
  const days = Object.keys(selectedPlans)
  return <>
    <div className="flex items-center mt-2 md:mt-0 justify-between">
      <h3>Days</h3>
      <CopyMealPlanModal to={selectedPlan} />
    </div>
    <div className="mt-4 flex w-[80vw] md:w-auto gap-2 overflow-x-auto no-scrollbar">
      {days.map((day, index) => <Button
        key={index}
        variant={selectedPlan === day ? "wz" : "wz_outline"}
        onClick={() => dispatch(changeSelectedPlan(day))}
      >
        {day.at(0).toUpperCase() + day.slice(1)}
      </Button>)}
    </div>
  </>
}