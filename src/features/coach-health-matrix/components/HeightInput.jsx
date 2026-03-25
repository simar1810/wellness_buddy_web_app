import InputGroup from "@/components/common/InputGroup";
import { buildHeightStr, updateHeight } from "../utils/height-conversion";

export default function HeightInput({ height, setHeight }) {
  const handleUnitChange = function (value) {
    const updates = updateHeight(height, { unit: value })
    const { height: newHeight, heightUnit } = buildHeightStr(updates)
    setHeight({
      height: newHeight,
      heightUnit
    })
  }
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Height</h3>
        <div className="flex gap-4 text-sm">
          <button
            onClick={() => handleUnitChange("inches")}
            className={height.unit === "inches" ? "text-blue-600" : "text-gray-400"}
          >
            Ft In
          </button>
          <button
            onClick={() => handleUnitChange("cms")}
            className={height.unit === "cms" ? "text-blue-600" : "text-gray-400"}
          >
            CM
          </button>
        </div>
      </div>
      <HeightInputContainer
        height={height}
        setHeight={setHeight}
      />
    </div>
  );
}

function HeightInputContainer({ height, setHeight }) {
  const handleUpdateHeight = function (key, value) {
    const updates = updateHeight(height, { [key]: value })
    const { height: newHeight, heightUnit } = buildHeightStr(updates)
    setHeight({
      height: newHeight,
      heightUnit
    })
  }

  if (height.unit === "cms") return (
    <InputGroup
      type="number"
      value={height.cms || ""}
      onChange={(e) => handleUpdateHeight("cms", Number(e.target.value))}
      placeholder="Enter height in cm"
    />
  )

  return (
    <div className="grid grid-cols-2 gap-3">
      <InputGroup
        type="number"
        value={height.feet || ""}
        onChange={(e) => handleUpdateHeight("feet", Number(e.target.value))}
        placeholder="Feet"
      />
      <InputGroup
        type="number"
        value={height.inches || ""}
        onChange={(e) => handleUpdateHeight("inches", Number(e.target.value))}
        placeholder="Inches"
      />
    </div>
  )
}