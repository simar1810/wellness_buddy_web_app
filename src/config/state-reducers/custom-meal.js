import { format, parse } from "date-fns";
import { customMealInitialState } from "../state-data/custom-meal";
import { DAYS } from "../data/ui";

export function customMealReducer(state, action) {
  switch (action.type) {
    case "SELECT_MEAL_TYPE":
      if (action.payload === "daily") return {
        ...state,
        stage: 2,
        mode: "daily",
        creationType: "new",
        selectedPlan: "daily",
        selectedMealType: "Breakfast",
        selectedPlans: {
          daily: [{ mealType: "Breakfast", meals: [] }]
        },
      }
      else if (action.payload === "weekly") return {
        ...state,
        stage: 2,
        mode: "weekly",
        creationType: "new",
        selectedPlan: "sun",
        selectedMealType: "Breakfast",
        selectedPlans: DAYS.reduce((acc, curr) => {
          acc[curr] = [{ mealType: "Breakfast", meals: [] }];
          return acc;
        }, {})
      }
      return {
        ...state,
        stage: 2,
        mode: "monthly",
        creationType: "new",
        selectedPlan: format(new Date(), 'dd-MM-yyyy'),
        selectedMealType: "Breakfast",
        selectedPlans: {
          [format(new Date(), 'dd-MM-yyyy')]: [{ mealType: "Breakfast", meals: [] }]
        }
      }

    case "INITIAL_STATE_DIFFERENT_CREATION":
      return {
        ...state,
        ...action.payload,
        stage: 2,
        mode: action.payload.mode,
        creationType: action.payload.creationType,
        selectedPlan: action.payload.selectedPlan,
        selectedPlans: action.payload.selectedPlans,
        editPlans: action.payload.editPlans
      }
    case "CUSTOM_MEAL_UPDATE_FIELD":
      return {
        ...state,
        [action.payload.name]: action.payload.value
      }
    case "CHANGE_MEAL_PLAN":
      return {
        ...state,
        plans: {
          ...state.plans,
          [action.payload.day]: action.payload.plan._id
        },
        selectedPlans: {
          ...state.selectedPlans,
          [action.payload.day]: action.payload.plan
        }
      }
    case "REMOVE_MEAL_TO_PLAN":
      delete state.plans[action.payload]
      delete state.selectedPlans[action.payload]
      return {
        ...state
      };
    case "SELECT_PLAN_TYPE":
      return {
        ...state,
        selectedPlan: action.payload
      }
    case "SELECT_MEAL_PLAN_TYPE":
      return {
        ...state,
        selectedMealType: action.payload,
      }
    case "CHANGE_SELECTED_PLAN":
      return {
        ...state,
        selectedPlan: action.payload,
        selectedMealType: state.selectedPlans[action.payload]?.at(0).mealType
      }
    case "SAVE_MEAL_TYPE":
      if (action.payload.type === "new") {
        return {
          ...state,
          selectedPlans: {
            ...state.selectedPlans,
            [state.selectedPlan]: [
              ...state.selectedPlans[state.selectedPlan],
              {
                mealType: action.payload.mealType,
                meals: []
              }
            ]
          },
          selectedMealType: action.payload.mealType
        }
      } else if (action.payload.type === "edit") {
        return {
          ...state,
          selectedPlans: {
            ...state.selectedPlans,
            [state.selectedPlan]: state.selectedPlans[state.selectedPlan].map((mealPlan, index) => index === action.payload.index
              ? { ...mealPlan, mealType: action.payload.mealType }
              : mealPlan),
          },
          selectedMealType: action.payload.mealType,
        }
      } else {
        return {
          ...state,
          selectedPlans: {
            ...state.selectedPlans,
            [state.selectedPlan]: state.selectedPlans[state.selectedPlan].filter((_, index) => index !== action.payload.index),
          },
          selectedMealType: state.selectedPlans[state.selectedPlan]?.at(state.selectedPlans[state.selectedPlan].length - 2)?.mealType || "",
        }
      }
    case "SAVE_RECIPE":
      if (action.payload.index || action.payload.index === 0) {
        const dishesPayload = !action.payload.isNew
          ? {
            ...action.payload.recipe,
            dish_name: action.payload.recipe.dish_name || action.payload.recipe.title,
            image: action.payload.recipe.image || action.payload.recipe.image,
            fats: action.payload.recipe.fats || action.payload.recipe?.calories?.fats,
            calories: action.payload.recipe?.calories?.total || action.payload.recipe.calories,
            protein: action.payload.recipe.protein || action.payload.recipe?.calories?.proteins,
            carbohydrates: action.payload.recipe.carbohydrates || action.payload.recipe?.calories?.carbs,
            isNew: !action.payload.recipe.time || false
          }
          : {
            isNew: false
          }
        return {
          ...state,
          selectedPlans: {
            ...state.selectedPlans,
            [state.selectedPlan]: state.selectedPlans[state.selectedPlan]
              .map((mealType => mealType.mealType === state.selectedMealType
                ? {
                  ...mealType,
                  meals: mealType.meals.map((meal, index) => index === action.payload.index
                    ? {
                      ...meal,
                      ...dishesPayload
                    }
                    : meal)
                } : mealType
              ))
          }
        }
      }
      return {
        ...state,
        selectedPlans: {
          ...state.selectedPlans,
          [state.selectedPlan]: state.selectedPlans[state.selectedPlan].map((mealType => mealType.mealType === state.selectedMealType
            ? {
              ...mealType,
              meals: [...(mealType.meals || []), {
                ...action.payload.recipe,
                dish_name: action.payload.recipe.dish_name || action.payload.recipe.name,
                fats: action.payload.recipe.fats || action.payload.recipe?.calories?.fats,
                calories: action.payload.recipe.calories || action.payload.recipe?.calories?.total,
                protein: action.payload.recipe.protein || action.payload.recipe?.calories?.proteins,
                carbohydrates: action.payload.recipe.carbohydrates || action.payload.recipe?.calories?.carbs,
                isNew: true
              }]
            }
            : mealType
          ))
        }
      }
    case "DELETE_RECIPE":
      return {
        ...state,
        selectedPlans: {
          ...state.selectedPlans,
          [state.selectedPlan]: state.selectedPlans[state.selectedPlan]
            .map((mealType => mealType.mealType === state.selectedMealType
              ? {
                ...mealType,
                meals: mealType.meals.filter((_, index) => index !== action.payload)
              } : mealType
            ))
        }
      }
    case "MEAL_PLAN_CREATED":
      return {
        ...state,
        plans: {
          [action.payload.type]: action.payload.value
        }
      }

    case "ADD_NEW_PLAN_TYPE":
      const formatted = format(parse(action.payload, "yyyy-MM-dd", new Date()), "dd-MM-yyyy");
      return {
        ...state,
        selectedPlans: {
          ...state.selectedPlans,
          [formatted]: [{ mealType: "Breakfast", meals: [] }]
        },
        selectedPlan: formatted,
        selectedMealType: "Breakfast"
      }

    case "COPY_ALL_MEAL_PLANS":
      return {
        ...state,
        selectedPlans: {
          ...state.selectedPlans,
          [action.payload.to]: state.selectedPlans[action.payload.from]
        }
      }

    case "DELETE_MONTHLY_DATE":
      delete state.selectedPlans[action.payload]
      return {
        ...state,
        selectedPlans: {
          ...state.selectedPlans,
        }
      }
    case "CHANGE_MONTHLY_DATE":
      const {
        selectedPlans: {
          [action.payload.prev]: previous,
          ...selectedPlans
        },
        ...rest
      } = state;
      return {
        ...rest,
        selectedPlans: {
          ...selectedPlans,
          [action.payload.new]: previous
        },
        selectedPlan: action.payload.new,
      };
    default:
      return state;
  }
}

export function selectWorkoutType(payload) {
  return {
    type: "SELECT_MEAL_TYPE",
    payload
  }
}

export function customWorkoutUpdateField(name, value) {
  return {
    type: "CUSTOM_MEAL_UPDATE_FIELD",
    payload: {
      name,
      value
    }
  }
}

export function changeWorkoutPlans(day, plan) {
  return {
    type: "CHANGE_MEAL_PLAN",
    payload: {
      day,
      plan
    }
  }
}

export function removeWorkoutFromPlans(payload) {
  return {
    type: "REMOVE_MEAL_TO_PLAN",
    payload
  }
}

export function selectMealPlanType(payload) {
  return {
    type: "SELECT_MEAL_PLAN_TYPE",
    payload
  }
}

export function changeSelectedPlan(payload) {
  return {
    type: "CHANGE_SELECTED_PLAN",
    payload
  }
}

export function saveMealType(mealType, type, index) {
  return {
    type: "SAVE_MEAL_TYPE",
    payload: {
      mealType,
      type,
      index
    }
  }
}

export function saveRecipe(recipe, index, isNew) {
  return {
    type: "SAVE_RECIPE",
    payload: {
      recipe,
      index,
      isNew
    }
  }
}

export function exportRecipe(payload) {
  return {
    type: "DELETE_RECIPE",
    payload
  }
}

export function mealPlanCreated(type, value) {
  return {
    type: "MEAL_PLAN_CREATED",
    payload: {
      type,
      value
    }
  }
}

export function addNewPlanType(payload) {
  return {
    type: "ADD_NEW_PLAN_TYPE",
    payload
  }
}

export function customMealIS(type, state) {
  if (type === "new") {
    return customMealInitialState;
  } else {
    return {
      ...customMealInitialState
    }
  }
}

export function changeStateDifferentCreationMeal(payload) {
  return {
    type: "INITIAL_STATE_DIFFERENT_CREATION",
    payload
  }
}

export function copyAllMealPlans(from, to) {
  return {
    type: "COPY_ALL_MEAL_PLANS",
    payload: {
      from, to
    }
  }
}

export function mealPlanCreationRP(state) {
  return {
    name: undefined,
    description: undefined,
    joiningDate: undefined,
    // _id: undefined,
    notes: undefined,
    image: undefined,
    meals: state.map(item => ({ mealType: item.mealType, meals: item.meals }))
  }
}

export function dailyMealRP(state) {
  return {
    title: state.title,
    description: state.description,
    mode: state.mode,
    image: state.image
  }
}

export function weeklyMealRP(state) {
  return {
    title: state.title,
    description: state.description,
    mode: state.mode,
    plans: state.plans
  }
}

export function monthlyMealRP(state) {
  return {
    title: state.title,
    description: state.description,
    mode: state.mode,
    plans: payload
  }
}

export function changeMonthlyDate(payload) {
  return {
    type: "CHANGE_MONTHLY_DATE",
    payload
  }
}

export function deleteMonthlyDate(payload) {
  return {
    type: "DELETE_MONTHLY_DATE",
    payload
  }
}