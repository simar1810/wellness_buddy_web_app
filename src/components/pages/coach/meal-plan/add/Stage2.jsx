import useCurrentStateContext from "@/providers/CurrentStateContext";
import MonthlyMealCreation from "./MonthlyMealCreation";
import { Button } from "@/components/ui/button";
import {
	customWorkoutUpdateField,
	dailyMealRP,
	mealPlanCreationRP,
} from "@/config/state-reducers/custom-meal";
import WeeklyMealCreation from "./WeeklyMealCreation";
import CustomMealMetaData from "./CustomMealMetaData";
import SelectMeals from "./SelectMeals";
import { useState } from "react";
import { toast } from "sonner";
import { sendData, uploadImage } from "@/lib/api";
import { useSWRConfig } from "swr";
import { useRouter } from "next/navigation";
import { _throwError, format24hr_12hr } from "@/lib/formatter";

export default function Stage2() {
	const [loading, setLoading] = useState(false);
	const { dispatch, ...state } = useCurrentStateContext();
	const component = selectWorkoutCreationComponent(state.mode);
	const { cache } = useSWRConfig();

	const router = useRouter();

	async function saveCustomWorkout() {
		try {
			for (const field of ["title", "description"]) {
				if (!Boolean(state[field]))
					_throwError(`${field} - for the meal plan is required!`);
			}

			for (const day in state.selectedPlans) {
				if (state.selectedPlans[day]?.length === 0)
					_throwError(`There are no plans assigned for the day - ${day}!`);
				for (const mealType of state.selectedPlans[day]) {
					if (!mealType.meals || mealType.meals?.length === 0)
						_throwError(
							`On ${day}, for ${
								mealType.mealType || "First Meal Type"
							} at least one meal should be assigned!`
						);
					for (const meal of mealType.meals) {
						delete meal.isNew;
						for (const field of ["time", "dish_name"]) {
							if (!meal[field])
								_throwError(
									`${field} should be selected for all the meals. Not provided for ${mealType.mealType}`
								);
						}
						// if (!meal._id && !meal.mealId) _throwError(`Please select a dish from the options`);
						meal.meal_time = format24hr_12hr(meal.time);
					}
				}
			}

			if (["new", "copy_edit"].includes(state.creationType)) {
				newWorkout();
			} else if (["edit"].includes(state.creationType)) {
				editWorkout();
			}
		} catch (error) {
			toast.error(error.message || "Something went wrong!");
		}
	}

	async function editWorkout() {
		try {
			setLoading(true);

			let thumbnail;
			if (state.file) {
				const toastId = toast.loading("Uploading Thumbnail...");
				thumbnail = await uploadImage(state.file);
				dispatch(customWorkoutUpdateField("image", thumbnail.img));
				toast.dismiss(toastId);
			}
			const plans = {};
			for (const key in state.selectedPlans) {
				const toastId = toast.loading(`Creating Meal Plan - ${key}...`);
				let createdMealPlan;
				if (state.editPlans[key]) {
					createdMealPlan = await sendData(
						`app/update-custom-plan?id=${state.editPlans[key]}`,
						mealPlanCreationRP(state.selectedPlans[key]),
						"PUT"
					);
				} else {
					createdMealPlan = await sendData(
						"app/create-custom-plan",
						mealPlanCreationRP(state.selectedPlans[key]),
						"POST"
					);
				}
				if (createdMealPlan.status_code !== 200) {
					toast.dismiss(toastId);
					_throwError(createdMealPlan.message);
				}
				plans[key] =
					createdMealPlan?.data?.planId || createdMealPlan?.data?._id;
				toast.dismiss(toastId);
			}

			const toastId = toast.loading("Creating The Custom Meal Plan...");
			const formData = dailyMealRP(state);

			const response = await sendData(
				`app/meal-plan/custom`,
				{
					...formData,
					image: thumbnail?.img || state.thumbnail,
					plans: state.selectedPlans,
					id: state.id,
					planIds: plans,
				},
				"PUT"
			);
			toast.dismiss(toastId);
			if (response.status_code !== 200) _throwError(response.message);
			toast.success(response.message);
			window.location.href = `/coach/meals/list-custom?mode=${state.mode}`;
		} catch (error) {
			toast.error(error.message || "Something went wrong!");
		} finally {
			setLoading(false);
		}
	}

	async function newWorkout() {
		try {
			setLoading(true);
			const plans = {};
			for (const key in state.selectedPlans) {
				const toastId = toast.loading(`Creating Meal Plan - ${key}...`);
				const createdMealPlan = await sendData(
					"app/create-custom-plan",
					mealPlanCreationRP(state.selectedPlans[key])
				);
				if (createdMealPlan.status_code !== 200) {
					toast.dismiss(toastId);
					_throwError(createdMealPlan.message);
				}
				plans[key] = createdMealPlan?.data?.planId;
				toast.dismiss(toastId);
			}

			let thumbnail;
			if (state.file) {
				const toastId = toast.loading("Uploading Thumbnail...");
				thumbnail = await uploadImage(state.file);
				dispatch(customWorkoutUpdateField("image", thumbnail.img));
				toast.dismiss(toastId);
			}

			const toastId = toast.loading("Creating The Custom Meal Plan...");
			const formData = dailyMealRP(state);
			const response = await sendData(`app/meal-plan/custom`, {
				...formData,
				image: thumbnail?.img || state.thumbnail,
				plans,
			});
			toast.dismiss(toastId);
			if (response.status_code !== 200) _throwError(response.message);
			cache.delete("custom-meal-plans");
			toast.success(response.message);
			router.push(`/coach/meals/list-custom?mode=${state.mode}`);
		} catch (error) {
			toast.error(error.message || "Something went wrong!");
		} finally {
			setLoading(false);
		}
	}

	return (
		<div>
			<div className="flex flex-col gap-y-4">
				<div className="grid grid-cols-2 divide-x-2">
					<CustomMealMetaData />
					<div className="pl-8">
						{component}
						<SelectMeals
							key={`${state.selectedPlan}${state.selectedMealType}`}
						/>
						<Button
							disabled={loading}
							variant="wz"
							className="w-full mt-8"
							onClick={saveCustomWorkout}
						>
							Save Meal
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
}

function selectWorkoutCreationComponent(mode) {
	switch (mode) {
		case "daily":
			return (() => <></>)();
		case "weekly":
			return <WeeklyMealCreation />;
		case "monthly":
			return <MonthlyMealCreation />;
	}
}
