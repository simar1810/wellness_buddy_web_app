import InputGroup from "@/components/common/InputGroup"
import { buildWeightStr, updateWeight } from "../utils/weight-conversion"

export default function WeightInput({ weight, setWeight }) {
  const handleUnitChange = function (value) {
    const updates = updateWeight(weight, { unit: value })
    const { weight: newWeight, weightUnit } = buildWeightStr(updates)
    setWeight({
      weight: newWeight,
      weightUnit
    })
  }
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Weight</h3>
        <div className="flex gap-4 text-sm">
          <button
            onClick={() => handleUnitChange("kgs")}
            className={weight.unit === "kgs" ? "text-blue-600" : "text-gray-400"}
          >
            Kgs
          </button>
          <button
            onClick={() => handleUnitChange("pounds")}
            className={weight.unit === "pounds" ? "text-blue-600" : "text-gray-400"}
          >
            LBS
          </button>
        </div>
      </div>
      <WeightInputContainer
        weight={weight}
        setWeight={setWeight}
      />
    </div>
  )
}

function WeightInputContainer({ weight, setWeight }) {
  const handleUpdateHeight = function (key, value) {
    const updates = updateWeight(weight, { [key]: value })
    const { weight: newWeight, weightUnit } = buildWeightStr(updates)
    setWeight({
      weight: newWeight,
      weightUnit
    })
  }

  if (weight.unit === "kgs") return (
    <InputGroup
      type="number"
      value={weight.kgs || ""}
      onChange={(e) => handleUpdateHeight("kgs", Number(e.target.value))}
      placeholder="Enter height in cm"
    />
  )

  return (
    <InputGroup
      type="number"
      value={weight.pounds || ""}
      onChange={(e) => handleUpdateHeight("pounds", Number(e.target.value))}
      placeholder="Pounds"
    />
  )
}