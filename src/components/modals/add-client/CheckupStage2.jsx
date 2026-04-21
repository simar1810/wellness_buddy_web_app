import HealthMetrics from "@/components/common/HealthMatrixPieCharts";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { DEFAULT_FORM_FIELDS } from "@/config/data/health-matrix";
import { setCurrentStage, updateMatrices, changeFieldvalue, toggleHideHealthMatrices } from "@/config/state-reducers/add-client-checkup";
import { calculateBMIFinal, calculateBMRFinal, calculateBodyAgeFinal, calculateBodyFatFinal, calculateIdealWeightFinal, calculateSMPFinal } from "@/lib/client/statistics";
import useCurrentStateContext from "@/providers/CurrentStateContext"
import { useAppSelector } from "@/providers/global/hooks";
import { differenceInYears, parse } from "date-fns";
import { Info } from "lucide-react";
import { useEffect, useMemo } from "react";

export default function CheckupStage2() {
  const { dispatch, hideHealthMatrices, ...state } = useCurrentStateContext();
  const { coachHealthMatrixFields } = useAppSelector(state => state.coach.data);


  const formFields = useMemo(() => {
    if (!coachHealthMatrixFields) return DEFAULT_FORM_FIELDS;

    const { defaultFields = [], coachAddedFields = [] } = coachHealthMatrixFields;

    const activeDefaultFields = DEFAULT_FORM_FIELDS.filter(field =>
      [...defaultFields, "weightInKgs", "weightInPounds"].includes(field.name) ||
      (field.name === "ideal_weight" && (defaultFields.includes("ideal_weight") || defaultFields.includes("idealWeight")))
    );

    const customFields = coachAddedFields.map(field => ({
      label: field.title,
      value: "0",
      info: `Range: ${field.minValue} - ${field.maxValue}`,
      icon: SVG_ICONS[field.svg] || "/svgs/checklist.svg",
      name: field.fieldLabel,
      title: field.title,
      id: field._id || field.fieldLabel,
      getMaxValue: () => field.maxValue,
      getMinValue: () => field.minValue,
    }));

    return [...activeDefaultFields, ...customFields];
  }, [coachHealthMatrixFields]);

  const age = state.dob
    ? differenceInYears(new Date(), parse(state.dob, 'yyyy-MM-dd', new Date()))
    : 0

  const payload = {
    bmi: calculateBMIFinal(state),
    muscle: calculateSMPFinal({ ...state, age }),
    fat: calculateBodyFatFinal({ ...state, age }),
    rm: calculateBMRFinal({ ...state, age }),
    ideal_weight: calculateIdealWeightFinal(state),
    bodyAge: calculateBodyAgeFinal({ ...state, age }),
  }
  useEffect(function () {
    dispatch(updateMatrices(formFields, payload));
  }, []);

  return <div className="p-6 pt-0">
    <div className="grid grid-cols-2 sm:grid-cols-2 gap-y-1 text-sm border-b border-gray-200 py-4">
      <div>
        Name: <span className="font-semibold">{state.name}</span>
      </div>
      <div>
        Height:&nbsp;
        <span className="font-semibold">
          {state.heightUnit.toLowerCase() === "cm"
            ? `${state.heightCms} cm`
            : `${state.heightFeet} ft. ${state.heightInches} in`}
        </span>
      </div>
      <div>
        D.O.B: <span className="font-semibold">{state.dob}</span>
      </div>
      <div>
        Age: <span className="font-semibold">{differenceInYears(new Date(), parse(state.dob, 'yyyy-MM-dd', new Date()))} yrs</span>
      </div>
      <div>
        Gender: <span className="font-semibold">{state.gender.split("")[0]?.toUpperCase() + state.gender.slice(1)}</span>
      </div>
    </div>
    <div className="flex items-center justify-between max-md:flex-col max-md:items-start max-md:gap-2">
      <h3 className="font-semibold my-4 max-md:my-2">Statistics</h3>
      <label>
        <div className="select-none cursor-pointer flex items-center gap-2 px-4 pt-4 max-md:px-0 max-md:pt-2">
          Hide Body Metrics
          <Tooltip>
            <TooltipTrigger asChild>
              <button type="button" className="text-[var(--dark-2)] hover:text-[var(--accent-1)] transition-colors cursor-pointer">
                <Info className="w-3.5 h-3.5" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="top" sideOffset={4} className="max-w-[220px]">
              When enabled, detailed body metrics like BMI, body fat, and muscle mass won't be recorded for this client.
            </TooltipContent>
          </Tooltip>
          <Switch
            checked={hideHealthMatrices}
            onCheckedChange={value => dispatch(toggleHideHealthMatrices(value))}
          />
        </div>
      </label>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <HealthMetrics
        onUpdate={(payload, fieldName, closeBtnRef) => {
          dispatch(changeFieldvalue(fieldName, payload[fieldName]));
          closeBtnRef.current.click()
        }}
        hideHealthMatrices={hideHealthMatrices}
        data={{ ...state, age }}
        fields={formFields}
        showAll={true}
      />
    </div>
    <div className="mt-10 flex items-center gap-4">
      <Button className="grow" variant="wz_outline" onClick={() => dispatch(setCurrentStage(1))}>Previous</Button>
      <Button
        onClick={() => dispatch(setCurrentStage(3))}
        variant="wz"
        className="grow"
      >
        Next
      </Button>
    </div>
  </div>
}