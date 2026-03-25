"use client";

import { useEffect, useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
  DialogClose
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { sendData } from "@/lib/api";
import { BODY_COMPOSITION_OPTIONS } from "@/features/coach-health-matrix/utils/config";
import Image from "next/image";
import { useRevalidateAndClearCache } from "@/components/pages/coach/recognition/useRevalidateAndClearCache";
import { Input } from "@/components/ui/input";
import HeightInput from "./HeightInput";
import InputGroup from "@/components/common/InputGroup";
import { buildHeightObject } from "../utils/height-conversion";
import WeightInput from "./WeightInput";
import { buildWeightObject } from "../utils/weight-conversion";
import BodyComposition from "./BodyComposition";
import { useAppSelector } from "@/providers/global/hooks";
import { buildAge, buildRequestPayload } from "../utils";
import { calculateBMIFinal, calculateBMRFinal, calculateBodyAgeFinal, calculateBodyFatFinal, calculateIdealWeightFinal, calculateSMPFinal } from "@/lib/client/statistics";

export default function CreateHealthMatrix() {
  const { gender = "male", age, dob } = useAppSelector(state => state.coach.data);
  const revalidate = useRevalidateAndClearCache();
  const closeRef = useRef();

  const [creating, setCreating] = useState(false);

  const [formData, setFormData] = useState({
    age: buildAge(age, dob),
    gender,
    weight: "",
    height: "",
    weightUnit: "KG",
    heightUnit: "Cms",
    bmi: "",
    body_composition: "Medium",
    rm: "",
    muscle: "",
    fat: "",
    visceral_fat: "",
    bodyAge: "",
    ideal_weight: ""
  });

  const setField = (field, value) => {
    setFormData((p) => ({
      ...p,
      [field]: value
    }));
  };

  const createMatrix = async () => {
    const toastId = toast.loading("Creating...");
    try {
      setCreating(true);

      const payload = buildRequestPayload(formData, { creationType: "create" })
      console.log(payload)
      const res = await sendData("app/coach/health-matrix", payload);
      if (res.status_code !== 200) throw new Error(res.message);

      toast.success("Created");
      revalidate("app/coach/health-matrix");
      closeRef.current.click();
    } catch (err) {
      toast.error(err.message);
    }

    setCreating(false);
    toast.dismiss(toastId);
  };

  useEffect(() => {
    if (!formData.height || !formData.weight) return;

    const payload = {
      ...formData,
      ...buildHeightObject(formData.height, formData.heightUnit),
      ...buildWeightObject(formData.weight, formData.weightUnit)
    };

    const clienthealthStats = {
      bmi: calculateBMIFinal(payload),
      muscle: calculateSMPFinal(payload),
      fat: calculateBodyFatFinal(payload),
      rm: calculateBMRFinal(payload),
      ideal_weight: calculateIdealWeightFinal(payload),
      bodyAge: calculateBodyAgeFinal(payload),
    };

    setFormData(prev => ({
      ...prev,
      ...clienthealthStats
    }));

  }, [
    formData.height,
    formData.weight,
    formData.heightUnit,
    formData.weightUnit,
    formData.age,
    formData.gender,
    formData.body_composition
  ]);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add Matrix
        </Button>
      </DialogTrigger>

      <DialogContent className="p-0 max-w-3xl rounded-2xl overflow-hidden">
        <DialogTitle className="px-6 py-4 border-b text-base font-semibold">
          Create Health Matrix
        </DialogTitle>

        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">

          <HeightInput
            height={buildHeightObject(formData.height, formData.heightUnit)}
            setHeight={({ height, heightUnit }) => setFormData(prev => ({
              ...prev,
              height,
              heightUnit
            }))}
          />
          <WeightInput
            weight={buildWeightObject(formData.weight, formData.weightUnit)}
            setWeight={({ weight, weightUnit }) => setFormData(prev => ({
              ...prev,
              weight,
              weightUnit
            }))}
          />

          <div className="space-y-4">
            <h3 className="font-semibold">Body Composition</h3>
            <BodyComposition
              selectedValue={formData.body_composition}
              updateBodyComposition={(value) => setField("body_composition", value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <InputGroup
              label="BMI"
              value={formData.bmi}
              onChange={(e) => setField("bmi", e.target.value)}
            />
            <InputGroup
              label="Muscle %"
              value={formData.muscle}
              onChange={(e) => setField("muscle", e.target.value)}
            />
            <InputGroup
              label="Fat %"
              value={formData.fat}
              onChange={(e) => setField("fat", e.target.value)}
            />
            <InputGroup
              label="Visceral Fat"
              value={formData.visceral_fat}
              onChange={(e) => setField("visceral_fat", e.target.value)}
            />
            <InputGroup
              label="RM"
              value={formData.rm}
              onChange={(e) => setField("rm", e.target.value)}
            />
            <InputGroup
              label="Body Age"
              value={formData.bodyAge}
              onChange={(e) => setField("bodyAge", e.target.value)}
            />
            <InputGroup
              label="Ideal Weight"
              value={formData.ideal_weight}
              onChange={(e) => setField("ideal_weight", e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <DialogClose ref={closeRef} asChild>
              <Button variant="secondary" className="w-full border-1">
                Cancel
              </Button>
            </DialogClose>

            <Button
              className="w-full"
              disabled={creating}
              onClick={createMatrix}
            >
              {creating ? "Creating..." : "Create"}
            </Button>
          </div>

        </div>
      </DialogContent>
    </Dialog>
  );
}