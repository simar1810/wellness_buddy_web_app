import { ddMMyyyy } from "@/config/data/regex"
import { differenceInYears, parse } from "date-fns"

const DEFFAULT_AGE = 40;

export const buildAge = function (age, dob) {
  if (!isNaN(age)) return age
  if (ddMMyyyy.test(dob)) return Math.abs(
    differenceInYears(
      new Date(),
      parse(dob, "dd-MM-yyyy", new Date())
    )
  )
  return DEFFAULT_AGE
}

export const buildRequestPayload = function (formData, {
  creationType // create, udpate
}) {
  const allFields = [
    "height", "weight", "heightUnit", "weightUnit", "bmi",
    "body_composition", "rm", "muscle", "fat", "visceral_fat",
    "bodyAge", "ideal_weight"
  ]
  if (creationType === "update") {
    allFields.push("matrixId")
  }

  return allFields
    .reduce((acc, curr) => ({
      ...acc,
      [curr]: String(formData[curr])
    }), {})
}