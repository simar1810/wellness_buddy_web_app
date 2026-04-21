export const DEFAULT_FORM_FIELDS = [
  // 1. Weight (kg/lbs) – underlying fields first
  {
    title: "Weight In KGs",
    value: "26",
    optimalRangeText: "Optimal Range:\nMatched actual age or lower,\nHigher Poor Health",
    icon: "/svgs/body.svg",
    name: "weightInKgs",
    id: 9,
    getMaxValue: () => 120,
    getMinValue: () => 1,
  },
  {
    title: "Weight In Pounds",
    value: "26",
    optimalRangeText: "Optimal Range:\nMatched actual age or lower,\nHigher Poor Health",
    icon: "/svgs/body.svg",
    name: "weightInPounds",
    id: 10,
    getMaxValue: () => 260,
    getMinValue: () => 1,
  },
  // 2. Fat
  {
    label: "Fat",
    value: "15%",
    info: "Optimal Range:\n10–20% for Men\n20–30% for Women",
    icon: "/svgs/fats.svg",
    name: "fat",
    title: "Fat",
    id: 3,
    getMaxValue: () => 20,
    getMinValue: () => 10,
    type: "default-hide"
  },
  // 3. Resting Metabolism
  {
    label: "Resting Metabolism",
    value: "15%",
    info: "Optimal Range: Varies by age,\ngender, and activity level",
    icon: "/svgs/meta.svg",
    name: "rm",
    title: "Resting Metabolism",
    id: 4,
    getMaxValue: () => 3000,
    getMinValue: () => 1500,
    type: "default-hide"
  },
  // 4. BMI
  {
    label: "BMI",
    value: "23.4",
    desc: "Healthy",
    info: "Optimal: 18–23\nOverweight: 23–27\nObese: 27–32",
    icon: "/svgs/bmi.svg",
    name: "bmi",
    title: "BMI",
    id: 1,
    getMaxValue: () => 25,
    getMinValue: () => 18,
  },
  // 5. Body Age
  {
    label: "Body Age",
    value: "26",
    info: "Optimal Range:\nMatched actual age or lower,\nHigher Poor Health",
    icon: "/svgs/body.svg",
    name: "bodyAge",
    title: "Body Age",
    id: 6,
    getMaxValue: () => 67,
    getMinValue: () => 33,
    type: "default-hide"
  },
  // 6. Muscle
  {
    label: "Muscle",
    value: "15%",
    info: "Optimal Range: 32–36% for men, 24–30% for women\nAthletes: 38–42%",
    icon: "/svgs/muscle.svg",
    name: "muscle",
    title: "Muscle",
    id: 2,
    getMaxValue: () => 45,
    getMinValue: () => 30,
    type: "default-hide"
  },
  // 7. Subcutaneous Fat
  {
    label: "Subcuatneous Fat",
    value: "26",
    info: "Optimal Range:\nMatched actual age or lower,\nHigher Poor Health",
    icon: "/svgs/body.svg",
    name: "sub_fat",
    title: "Subcutaneous Fat",
    id: 7,
    getMaxValue: ({ gender }) => gender === "male" ? 5 : 20,
    getMinValue: ({ gender }) => gender === "male" ? 2 : 10,
    type: "default-hide"
  },
  // 8. Ideal weight
  {
    label: "Weight",
    value: "65 Kg",
    desc: "Ideal 75",
    info: "Ideal weight Range:\n118. This varies by height and weight",
    icon: "/svgs/weight.svg",
    name: "ideal_weight",
    title: "Ideal Weight",
    id: 5,
    getMaxValue: ({ value }) => value + 5,
    getMinValue: ({ value }) => value - 5,
  },
  // Any additional metrics come after the above core ordering
  {
    label: "Visceral Fat",
    value: "26",
    info: "Optimal Range:\nMatched actual age or lower,\nHigher Poor Health",
    icon: "/svgs/body.svg",
    name: "visceral_fat",
    title: "Visceral Fat",
    id: 8,
    getMaxValue: () => 12,
    getMinValue: () => 1,
    type: "default-hide"
  },
];
