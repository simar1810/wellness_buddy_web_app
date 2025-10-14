import { changeMonthlyDate, customWorkoutUpdateField, deleteMonthlyDate } from "@/config/state-reducers/custom-meal";
import useCurrentStateContext from "@/providers/CurrentStateContext";
import { Button } from "@/components/ui/button";
import AddDayModal from "./AddDayModal";
import CopyMealPlanModal from "./CopyMealPlanModal";
import { Pen } from "lucide-react";
import { Dialog } from "@radix-ui/react-dialog";
import { DialogClose, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useRef, useState } from "react";
import { format, parse } from "date-fns";
import { cn } from "@/lib/utils";

export default function MonthlyMealCreation() {
  const { dispatch, selectedPlans, selectedPlan } = useCurrentStateContext();

  const days = Object.keys(selectedPlans);

  return <>
    <div className="flex items-center justify-between">
      <h3 className="mt-4">Days</h3>
      <CopyMealPlanModal to={selectedPlan} />
    </div>
    <div className="mt-4 flex gap-2 overflow-x-auto pb-4">
      {days.length === 0 && <div className="bg-[var(--comp-1)] border-1 p-2 rounded-[6px] grow text-center mr-auto"
      >
        Please select a date
      </div>}
      {days.map((day, index) => <div
        key={index}
        className={cn(
          "pr-4 flex items-center gap-0 rounded-[10px] border-1 border-[var(--accent-1)]",
          selectedPlan === day && "bg-[var(--accent-1)]"
        )}
      >
        <Button
          variant={selectedPlan === day ? "wz" : "wz_outline"}
          onClick={() => dispatch(customWorkoutUpdateField("selectedPlan", day))}
          className="border-0"
        >
          {day.at(0).toUpperCase() + day.slice(1)}
        </Button>
        <UpdateDate
          defaultValue={day}
        />
      </div>)}
      <AddDayModal />
    </div>
  </>
}

const regex = /^(0[1-9]|[12][0-9]|3[01])-(0[1-9]|1[0-2])-\d{4}$/

function UpdateDate({ defaultValue = "" }) {
  const [value, setValue] = useState(
    regex.test(defaultValue)
      ? format(parse(defaultValue, "dd-MM-yyyy", new Date()), "yyyy-MM-dd")
      : "")
  const { dispatch } = useCurrentStateContext();

  const closeRef = useRef();

  return <Dialog>
    <DialogTrigger>
      <Pen
        className="w-[14px] h-[14px]"
      />
    </DialogTrigger>
    <DialogContent className="p-0">
      <DialogTitle className="p-4 border-b-1">Update Date</DialogTitle>
      <div className="p-4">
        <Input
          placeholder="Update Date"
          type="date"
          value={value}
          onChange={e => setValue(e.target.value)}
        />
        <div className="mt-4 flex gap-4 [&_button]:grow">
          <Button
            variant="wz"
            onClick={() => {
              dispatch(changeMonthlyDate({
                prev: defaultValue,
                new: format(parse(value, "yyyy-MM-dd", new Date()), "dd-MM-yyyy")
              }))
              closeRef.current.click();
            }}
          >Save</Button>
          <Button
            variant="destructive"
            onClick={() => {
              dispatch(deleteMonthlyDate(defaultValue));
              closeRef.current.click();
            }}
          >
            Delete
          </Button>
        </div>
      </div>
      <DialogClose ref={closeRef} />
    </DialogContent>
  </Dialog>
}