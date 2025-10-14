import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { copyAllMealPlans } from "@/config/state-reducers/custom-meal";
import useCurrentStateContext from "@/providers/CurrentStateContext";
import { useRef } from "react";

export default function CopyMealPlanModal({ to }) {
  const { selectedPlans, dispatch } = useCurrentStateContext()
  const dialogcloseBtn = useRef()
  const plans = Object.keys(selectedPlans).filter(plan => plan !== to)
  return <Dialog>
    <DialogTrigger asChild>
      <Button size="sm" variant="wz">Copy</Button>
    </DialogTrigger>
    <DialogContent className="p-0 gap-0">
      <DialogTitle className="p-4 border-b-1">Copy Meal Plan From</DialogTitle>
      <div className="p-4">
        <div className="grid grid-cols-4 gap-4">
          {plans.map((plan, index) => <Button
            key={index}
            onClick={() => {
              dispatch(copyAllMealPlans(plan, to))
              dialogcloseBtn.current.click();
            }}
          >
            {plan}
          </Button>)}
        </div>
      </div>
      <DialogClose ref={dialogcloseBtn} />
    </DialogContent>
  </Dialog>
}