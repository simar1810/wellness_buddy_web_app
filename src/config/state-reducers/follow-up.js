import { addDays, format, parse } from "date-fns";
import { followUpInitialState } from "../state-data/follow-up";

export function followUpReducer(state, action) {
  switch (action.type) {
    case "CHANGE_FIELD_VALUE":
      return {
        ...state,
        healthMatrix: {
          ...state.healthMatrix,
          [action.payload.name]: action.payload.value
        }
      }
    case "SET_CURRENT_STAGE":
      return {
        ...state,
        stage: action.payload
      }
    case "SET_NEXT_FOLLOW_UP_DATE":
      return {
        ...state,
        nextFollowUpDate: action.payload
      }
    case "CHANGE_WEIGHT_UNIT":
      return {
        ...state,
        healthMatrix: {
          ...state.healthMatrix,
          weightUnit: action.payload,
          weightInKgs: action.payload.toLowerCase() === "kg"
            ? (Number(state.healthMatrix.weightInPounds) * 0.453592).toFixed(2)
            : state.healthMatrix.weightInKgs,
          weightInPounds: action.payload.toLowerCase() === "pounds"
            ? (Number(state.healthMatrix.weightInKgs) / 0.453592).toFixed(2)
            : state.healthMatrix.weightInPounds,
        }
      }
    case "SET_HEALTH_MATRICES":
      return {
        ...state,
        healthMatrix: {
          ...state.healthMatrix,
          ...action.payload
        }
      }
    default:
      return state;
  }
}

export function changeFieldvalue(name, value) {
  return {
    type: "CHANGE_FIELD_VALUE",
    payload: {
      name,
      value
    }
  }
}

export function setCurrentStage(payload) {
  return {
    type: "SET_CURRENT_STAGE",
    payload
  }
}

export function setNextFollowUpDate(payload) {
  return {
    type: "SET_NEXT_FOLLOW_UP_DATE",
    payload
  }
}

export function setHealthMatrices(payload) {
  return {
    type: "SET_HEALTH_MATRICES",
    payload
  }
}

export function changeWeightUnit(payload) {
  return {
    type: "CHANGE_WEIGHT_UNIT",
    payload
  }
}

export function init(data) {
  return {
    ...followUpInitialState,
    healthMatrix: {
      ...followUpInitialState.healthMatrix,
      heightUnit: data.healthMatrix.heightUnit,
      heightCms: data.healthMatrix.heightUnit.toLowerCase() === "cm"
        ? data.healthMatrix.height
        : "",
      heightFeet: data.healthMatrix.heightUnit.toLowerCase() === "inches"
        ? (data.healthMatrix.height.split("."))[0]
        : "",
      heightInches: data.healthMatrix.heightUnit.toLowerCase() === "inches"
        ? (data.healthMatrix.height.split("."))[1]
        : ""

    }
  }
}

const fields = ["weightUnit", "height", "heightUnit", "bmi", "body_composition", "visceral_fat", "rm", "muscle", "fat", "ideal_weight", "bodyAge"];
export function generateRequestPayload(state) {
  const payload = {
    healthMatrix: {

    }
  };
  if (state.healthMatrix["weightUnit"].toLowerCase() === "kg") {
    payload.healthMatrix.weight = String(state.healthMatrix.weightInKgs);
  } else {
    payload.healthMatrix.weight = String(state.healthMatrix.weightInPounds);
  };
  if (state.healthMatrix["heightUnit"].toLowerCase() === "cm") {
    payload.healthMatrix.height = String(state.healthMatrix["heightCms"]);
  } else {
    payload.healthMatrix.height = String(`${state.healthMatrix["heightFeet"]}.${state.healthMatrix["heightInches"]}`);
  }
  for (const field of fields) {
    if (Boolean(state.healthMatrix[field])) payload.healthMatrix[field] = String(state.healthMatrix[field]);
  }
  payload.nextFollowUpDate = (state.healthMatrix.followUpType === "custom")
    ? format(parse(state.nextFollowUpDate, 'yyyy-MM-dd', new Date()), 'dd-MM-yyyy')
    : format(addDays(new Date(), 8), 'dd-MM-yyyy');
  payload.healthMatrix.createdDate = format(parse(state.healthMatrix.date, 'yyyy-MM-dd', new Date()), 'dd-MM-yyyy');
  return payload;
}

const stage1fields = ["date", "weightUnit", "body_composition"];
export function stage1Completed(data) {
  for (const field of stage1fields) {
    if (!data.healthMatrix[field]) return { success: false, field }
  }
  if (data.healthMatrix.weightUnit?.toLowerCase() === "kg" && !data.healthMatrix.weightInKgs) {
    return { success: false, field: "weight (kg)" }
  } else if (data.healthMatrix.weightUnit?.toLowerCase() === "pounds" && !data.healthMatrix.weightInPounds) {
    return { success: false, field: "weight (pounds)" }
  };
  if (!data.nextFollowUpDate && data.healthMatrix.followUpType === "custom") return { success: false, field: "nextFollowUpDate" }
  return { success: true };
}