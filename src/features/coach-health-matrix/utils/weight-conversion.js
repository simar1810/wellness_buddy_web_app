const kgToLbs = function (kg) {
  return kg * 2.20462;
}

const lbsToKg = function (lbs) {
  return lbs / 2.20462;
}

export const buildWeightObject = function (weight, weightUnit) {
  if (["kg", "kgs"].includes(weightUnit?.toLowerCase())) {
    const pounds = kgToLbs(weight)
    return {
      unit: "kgs",
      kgs: weight,
      pounds,
    }
  }
  const kgs = lbsToKg(weight)
  return {
    unit: "pounds",
    pounds: weight,
    kgs
  }
}

export const updateWeight = function (weightObj, changes) {
  let updated = { ...weightObj, ...changes };

  if (changes.unit) {
    if (changes.unit.toLowerCase() === "kgs") {
      updated.kgs = lbsToKg(updated.pounds);
      updated.unit = "kgs";
    } else if (changes.unit.toLowerCase() === "pounds") {
      updated.pounds = kgToLbs(updated.kgs);
      updated.unit = "pounds";
    }
  }
  return updated;
}

export const buildWeightStr = function (weight) {
  if (["kg", "kgs"].includes(weight.unit?.toLowerCase())) {
    return {
      weight: parseFloat(weight.kgs),
      weightUnit: "kgs"
    }
  }
  return {
    weight: parseFloat(weight.pounds),
    weightUnit: "pounds"
  }
}