"use client";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  calculateBMIFinal,
  calculateBMRFinal,
  calculateBodyAgeFinal,
  calculateBodyFatFinal,
  calculateIdealWeightFinal,
  calculateSMPFinal,
  calculateSubcutaneousFat,
} from "@/lib/client/statistics";
import { cn, extractNumber } from "@/lib/utils";
import { Pencil } from "lucide-react";
import Image from "next/image";
import { useRef, useState } from "react";
import FormControl from "../FormControl";
import { Button } from "../ui/button";
import { Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { DEFAULT_FORM_FIELDS } from "@/config/data/health-matrix";

const defaultFields = DEFAULT_FORM_FIELDS.map(field => field.name)

const healtMetrics = [
  {
    title: "BMI",
    value: "23.4",
    desc: "Healthy",
    optimalRangeText: "Optimal: 18-23\nOverweight: 23-27\nObese: 27-32",
    icon: "/svgs/bmi.svg",
    name: "bmi",
    id: 1,
    getMaxValue: () => 25,
    getMinValue: () => 18,
  },
  {
    title: "Muscle",
    value: "15%",
    optimalRangeText:
      "Optimal Range: 32–36% for men, 24–30% for women\nAthletes: 38–42%",
    icon: "/svgs/muscle.svg",
    name: "muscle",
    id: 2,
    getMaxValue: () => 45,
    getMinValue: () => 30,
    type: "default-hide"
  },
  {
    title: "Fat",
    value: "15%",
    optimalRangeText: "Optimal Range:\n10–20% for Men\n20–30% for Women",
    icon: "/svgs/fats.svg",
    name: "fat",
    id: 3,
    getMaxValue: () => 20,
    getMinValue: () => 10,
    type: "default-hide"
  },
  {
    title: "Resting Metabolism",
    value: "15%",
    optimalRangeText:
      "Optimal Range: Varies by age,\ngender, and activity level",
    icon: "/svgs/meta.svg",
    name: "rm",
    id: 4,
    getMaxValue: () => 3000,
    getMinValue: () => 1500,
    type: "default-hide"
  },
  {
    title: "Ideal Weight",
    value: "65 Kg",
    desc: "Ideal 75",
    optimalRangeText:
      "Ideal weight Range:\n118. This varies by height and weight",
    icon: "/svgs/weight.svg",
    name: "idealWeight",
    id: 5,
    getMaxValue: ({ value }) => value + 5,
    getMinValue: ({ value }) => value - 5,
  },
  {
    title: "Body Age",
    value: "26",
    optimalRangeText:
      "Optimal Range:\nMatched actual age or lower,\nHigher Poor Health",
    icon: "/svgs/body.svg",
    name: "bodyAge",
    id: 6,
    getMaxValue: () => 67,
    getMinValue: () => 33,
    type: "default-hide"
  },
  {
    title: "Visceral Fat",
    value: "26",
    optimalRangeText: "Optimal Range:\nMatched actual age or lower,\nHigher Poor Health",
    icon: "/svgs/body.svg",
    name: "visceral_fat",
    id: 7,
    getMaxValue: () => 12,
    getMinValue: () => 1,
    type: "default-hide"
  },
  {
    title: "Weight In KGs",
    value: "26",
    optimalRangeText: "Optimal Range:\nMatched actual age or lower,\nHigher Poor Health",
    icon: "/svgs/body.svg",
    name: "weightInKgs",
    id: 8,
    getMaxValue: () => 120,
    getMinValue: () => 1,
  },
  {
    title: "Weight In Pounds",
    value: "26",
    optimalRangeText: "Optimal Range:\nMatched actual age or lower,\nHigher Poor Health",
    icon: "/svgs/body.svg",
    name: "weightInPounds",
    id: 9,
    getMaxValue: () => 260,
    getMinValue: () => 1,
  },
  {
    title: "Subcutaneous Fat",
    value: "26",
    optimalRangeText: "Optimal Range:\nMatched actual age or lower,\nHigher Poor Health",
    icon: "/svgs/body.svg",
    name: "sub_fat",
    id: 9,
    getMaxValue: () => 20,
    getMinValue: () => 15,
    type: "default-hide"
  },
];

export default function HealthMetrics({ calculateByFormulaes = true, hideHealthMatrices, data, onUpdate, fields, showAll = false }) {
  const payload = {
    bmi: calculateByFormulaes
      ? extractNumber(data.bmi) || calculateBMIFinal(data)
      : extractNumber(data.bmi),
    muscle: calculateByFormulaes
      ? extractNumber(data.muscle) || calculateSMPFinal(data)
      : extractNumber(data.muscle),
    fat: calculateByFormulaes
      ? extractNumber(data.fat) || calculateBodyFatFinal(data)
      : extractNumber(data.fat),
    rm: calculateByFormulaes
      ? extractNumber(data.rm) || calculateBMRFinal(data)
      : extractNumber(data.rm),
    idealWeight: calculateByFormulaes
      ? extractNumber(data.idealWeight) || data.ideal_weight || calculateIdealWeightFinal(data)
      : extractNumber(data.idealWeight) || data.ideal_weight,
    bodyAge: calculateByFormulaes
      ? extractNumber(data.bodyAge) || calculateBodyAgeFinal(data)
      : extractNumber(data.bodyAge),
    visceral_fat: extractNumber(data.visceral_fat),
    weightInKgs: updateWeightField() === "weightInKgs"
      ? extractNumber(data.weightInKgs)
      : undefined,
    weightInPounds: updateWeightField() === "weightInPounds"
      ? extractNumber(data.weightInPounds)
      : undefined,
    sub_fat: calculateByFormulaes
      ? extractNumber(data.sub_fat) || calculateSubcutaneousFat(data)?.subcutaneousPercent
      : extractNumber(data.sub_fat),
    ...data
  };

  function updateWeightField() {
    if (["kgs", "kg"].includes(data?.weightUnit?.toLowerCase())) {
      return "weightInKgs"
    } else return "weightInPounds"
  }

  const metricsToDisplay = fields || healtMetrics;

  try {
    return (
      <>
        {metricsToDisplay
          .filter((metric) => (
            !isNaN(payload[metric.name]) &&
            payload[metric.name] !== 0 &&
            payload[metric.name] !== "" ||
            (showAll && !defaultFields.includes(metric.name))
          ) &&
            (!calculateByFormulaes ? ![null, undefined, ""].includes(payload[metric.name]) : true)
          )
          .filter(item =>
            hideHealthMatrices ? item.type !== "default-hide" : true
          )
          .map((metric) => (
            <MetricProgress
              key={metric.id || metric.name}
              {...metric}
              title={metric.title || metric.label}
              value={payload[metric.name] || 0}
              maxPossibleValue={metric.getMaxValue ? metric.getMaxValue({
                value: payload[metric.name] || 0,
                gender: data.gender
              }) : (metric.maxValue || 100)}
              maxThreshold={metric.getMaxValue ? metric.getMaxValue({
                value: payload[metric.name] || 0,
                gender: data.gender
              }) : (metric.maxValue || 100)}
              minThreshold={metric.getMinValue ? metric.getMinValue({
                value: payload[metric.name] || 0,
                gender: data.gender
              }) : (metric.minValue || 0)}
              name={metric.name}
              payload={payload}
              _id={data._id}
              onUpdate={onUpdate}
            />
          ))}
      </>
    );
  } catch (error) {
    return <div className="h-[200px]">
      No Health Matrix added!
    </div>
  }
}

export function MetricProgress({
  value = 15,
  title = "Muscle",
  maxThreshold = 100,
  minThreshold,
  icon,
  className,
  onUpdate,
  payload,
  _id,
  name
}) {
  const radius = 70;
  const { strokeDasharray, strokeDashoffset } = getStrokeDashoffset(value, maxThreshold, radius);
  function getColor() {
    if (value < minThreshold) return "#E8B903";
    if (value > maxThreshold) return "#FF0000";
    return "#67BC2A";
  }
  return (
    <Card 
    className={cn("w-full md:max-w-xs shadow-none relative", className)}
    >
      <CardHeader className="pb-2">
        <div 
        className="flex flex-col sm:flex-row items-center gap-2 md:gap-4"
       
        >
          <Image
            src={icon}
            height={28}
            width={28}
            alt=""
            className="object-contain"
          />
          <h2 
          className="text-[10px] md:text-[16px] font-bold min-w-0 text-center sm:text-left"
  title={title}
          
          >{title.length > 12 ? title.slice(0, 12) + "…" : title}</h2>
          {onUpdate && <EditHealthMatric
            matrix={{
              title,
              name,
              defaultValue: payload,
              _id,
            }}
            name={name}
            payload={payload}
            onUpdate={onUpdate}
          />}
        </div>
      </CardHeader>
      <CardContent className="mt-auto">
        <div className="relative flex items-center justify-center  mb -8">
          <svg 
          width="160" height="160" viewBox="0 0 160 160"
          
          >
            <circle
              cx="80"
              cy="80"
              r={radius}
              fill="none"
              stroke="#f0f0f0"
              strokeWidth="16"
            />
            <circle
              cx="80"
              cy="80"
              r={radius}
              fill="none"
              stroke={getColor()}
              strokeWidth="16"
              strokeDasharray={strokeDasharray}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              transform="rotate(-90 80 80)"
            />
          </svg>
          <div className="absolute text-center">
            <span 
            className="text-xl md:text-4xl font-bold whitespace-nowrap"
            >{value}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function EditHealthMatric({
  matrix,
  payload,
  onUpdate,
  name
}) {
  const [formData, setFormData] = useState(payload)
  const closeBtnRef = useRef(null);

  async function saveHealthMatrix() {
    if (onUpdate) onUpdate(formData, name, closeBtnRef)
  }
  return <Dialog>
    <DialogTrigger>
      <Pencil className="w-4 h-4 absolute bottom-2 right-2" />
    </DialogTrigger>
    <DialogContent className="p-0 gap-0">
      <DialogHeader className="p-4 border-b">
        <DialogTitle>Edit Health Matrix</DialogTitle>
      </DialogHeader>
      <div className="max-h-[65vh] h-full overflow-y-auto p-4">
        <FormControl
          type="number"
          placeholder={"Please enter value"}
          label={matrix.title}
          value={formData[name]}
          onChange={(e) => setFormData(prev => ({
            ...prev,
            [matrix.name]: String(e.target.value)
          }))}
          className="block mb-4"
        />
        <Button variant="wz" onClick={saveHealthMatrix}>Save</Button>
      </div>
      <DialogClose ref={closeBtnRef} />
    </DialogContent>
  </Dialog>
}

function getStrokeDashoffset(value, maxValue, radius) {
  const circumference = 2 * Math.PI * radius;
  const fullValue = maxValue * 1.5;
  const clampedValue = Math.min(value, fullValue);
  const progressRatio = clampedValue / fullValue;
  const visibleLength = progressRatio * circumference;
  const dashOffset = circumference - visibleLength;
  return {
    strokeDasharray: circumference,
    strokeDashoffset: dashOffset,
  };
}
