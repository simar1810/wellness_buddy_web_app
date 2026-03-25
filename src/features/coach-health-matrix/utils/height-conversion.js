const cmToFeetInches = function (cm) {
  const totalInches = cm / 2.54;
  const feet = Math.floor(totalInches / 12);
  const inches = Math.round(totalInches % 12);
  return { feet, inches };
}

const feetInchesToCm = function (feet, inches) {
  const parseFeet = parseFloat(feet)
  const parseInches = parseFloat(inches)
  return Math.round(((parseFeet * 12) + parseInches) * 2.54);
}

export const updateHeight = function (height, changes) {
  let updated = { ...height, ...changes };

  if (changes.unit) {
    if (changes.unit === "cms") {
      const cms = feetInchesToCm(updated.feet, updated.inches);
      updated.cms = cms;
    } else if (changes.unit === "inches") {
      const { feet, inches } = cmToFeetInches(updated.cms);
      updated.feet = feet;
      updated.inches = inches;
    }
  }

  return updated;
}

export const buildHeightObject = function (height, heightUnit) {
  if (["cm", "cms"].includes(heightUnit?.toLowerCase())) {
    const { feet, inches } = cmToFeetInches(height)
    return {
      unit: "cms",
      cms: height,
      feet,
      inches,
      heightCms: height,
      heightInches: feet,
      heightFeet: inches,
    }
  }
  const [feet, inches] = (String(height || "0.0")).split(".")
  const cms = feetInchesToCm(height)
  return {
    unit: "inches",
    cms,
    feet,
    inches,
    heightCms: cms,
    heightInches: feet,
    heightFeet: inches,
  }
}

export const buildHeightStr = function (height) {
  if (["cm", "cms"].includes(height?.unit?.toLowerCase())) {
    return {
      height: height.cms,
      heightUnit: "cms"
    }
  }

  return {
    height: parseFloat(`${height.feet || 0}.${height.inches || 0}`),
    heightUnit: "inches"
  }
}