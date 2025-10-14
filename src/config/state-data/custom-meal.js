export const customMealInitialState = {
  stage: 1,
  mode: "daily", // e.g. daily, weekly, monthly, 
  title: "",
  file: "",
  image: "",
  description: "",
  selectedDate: "",
  selectedPlan: "daily",
  selectedMealType: "Breakfast",
  plans: {},
  selectedPlans: {
    daily: [
      {
        mealType: "Breakfast",
        meals: []
      }
    ]
  }, // { daily: [{ mealType: "Breakfast", meals: [] }
}