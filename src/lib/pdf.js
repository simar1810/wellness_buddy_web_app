import { differenceInYears, format, parse } from "date-fns"
import { calculateBMIFinal, calculateBMRFinal, calculateBodyFatFinal, calculateSMPFinal } from "./client/statistics"

function calcAge(data) {
  if (data?.dob?.split("-")[0]?.length === 2) return differenceInYears(new Date(), parse(data.dob, 'dd-MM-yyyy', new Date()));
  return data.age || 0
}

export function clientStatisticsPDFData(data, statistics, coach, index) {
  return {
    clientName: data.name,
    age: calcAge(data),
    bodyAge: statistics?.at(index)?.bodyAge || 0,
    gender: data.gender,
    joined: statistics?.at(index).createdDate,
    weight: statistics?.at(index).weight,
    height: `${statistics?.at(index)?.height} ${statistics?.at(index)?.heightUnit}`,
    bmi: statistics?.at(index)?.bmi || calculateBMIFinal(statistics?.at(index)),
    fatPercentage: statistics?.at(index)?.fat || calculateBodyFatFinal(statistics?.at(index)),
    musclePercentage: statistics?.at(index)?.muscle || calculateSMPFinal(statistics?.at(index)),
    restingMetabolism: statistics?.at(index)?.rm || calculateBMRFinal(statistics?.at(index)),
    bodyComposition: statistics?.at(index)?.body_composition,
    coachName: coach.name,
    coachDescription: coach.specialization,
    coachProfileImage: coach.profilePhoto
  }
}

function standardWeight({
  weightUnit,
  weight
}) {
  if (weightUnit) {
    return Number(weight);
  }
  return Number(weight) * 0.453592;
}

export function comparisonPDFData(data, statistics, coach, index) {
  return {
    clientName: data.name,
    age: data.age || 0,
    gender: data.gender,
    joined: data.joiningDate,
    weight: statistics?.at(index).weight,
    avgWeight: (statistics.reduce((acc, curr) => acc + standardWeight(curr), 0) / statistics.length).toFixed(1),
    height: `${statistics?.at(index)?.height} ${statistics?.at(index)?.heightUnit}`,
    bmi: statistics[index].bmi,
    avgBmi: (statistics.reduce((acc, curr) => acc + (Number(curr.bmi) || calculateBMIFinal(curr)), 0) / statistics.length).toFixed(1),
    rm: statistics[index].rm,
    avgRm: (statistics.reduce((acc, curr) => acc + (Number(curr.rm) || calculateBMRFinal(curr)), 0) / statistics.length).toFixed(1),
    muscle: statistics[index].muscle,
    avgMuscle: (statistics.reduce((acc, curr) => acc + (Number(curr.muscle) || calculateSMPFinal(curr)), 0) / statistics.length).toFixed(1),
    fat: statistics[index].fat,
    avgFat: (statistics.reduce((acc, curr) => acc + (Number(curr.fat) || calculateBodyFatFinal(curr)), 0) / statistics.length).toFixed(1),
    brandLogo: "/brandLogo.png",
    sideImage: "/side.png",
    bottomStripImage: "/bottom.png",
    allStatsList: statistics,
    coachName: coach.name,
    coachDescription: coach.specialization,
    coachProfileImage: coach.profilePhoto,
    coachWeightLoss: coach.weightLoss,
  }
}

export function mealPlanDetailsPDFData(plan) {
  return {
    id: plan._id,
    planName: plan.name,
    coachName: 'John Doe',
    coachDescription: 'Certified Health Coach',
    coachImage: '/coach.jpg',
    brandLogo: '/logo.png',
    mealTypes: ['Breakfast', 'Lunch', 'Snack', 'Dinner', 'After Dinner'],
    meals: []
  }
}

export function invoicePDFData(order, coach) {
  const subtotal = order.productModule
    .reduce((acc, product) =>
      acc + (Number(product.quantity) * Number(product.productMrpList["0"]))
      , 0)

  return {
    clientName: order.clientName,
    age: order?.clientId?.age || '21',
    address: 'New Amritsar, Punjab',
    city: 'Amritsar',
    phone: order?.clientId?.mobileNumber || '9XXXXXXXXX',
    invoiceNo: order?.invoiceNumber || 'INVXXXXXX',
    date: order.createdAt || format(new Date(), 'dd-MM-yyyy'),
    coachName: 'Wellness Coach',
    coachPhone: '9876543210',
    coachCity: coach?.city || 'Ludhiana',
    subtotal: (order.sellingPrice * 100 * Number(coach.margin)) || "0",
    discount: 100 - Number(coach.margin), // how to get this field
    total: '3000',
    logoUrl: '/logo.png',
    products: [...order.productModule.map(product => (
      {
        productName: product.productName || "Product",
        quantity: product.quantity || 1,
        price: product?.productMrpList["50"] || 0
      })),
    { productName: 'Subtotal', quantity: "", price: subtotal },
    { productName: 'Discount', quantity: "", price: Math.abs(subtotal - (Number(order.sellingPrice) || subtotal)) },
    { productName: 'Total', quantity: "", price: order.sellingPrice || subtotal },
    ]
  }
}