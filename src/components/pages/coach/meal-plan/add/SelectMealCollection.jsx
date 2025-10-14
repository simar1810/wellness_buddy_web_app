import ContentError from "@/components/common/ContentError";
import ContentLoader from "@/components/common/ContentLoader";
import Loader from "@/components/common/Loader";
import RecipeModal from "@/components/modals/RecipeModal";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { saveRecipe } from "@/config/state-reducers/custom-meal";
import useDebounce from "@/hooks/useDebounce";
import { getRecipesCalorieCounter } from "@/lib/fetchers/app";
import { cn } from "@/lib/utils";
import useCurrentStateContext from "@/providers/CurrentStateContext";
import { Flame, PlusCircle } from "lucide-react";
import { useRef, useState } from "react";
import useSWR from "swr";

export default function SelectMealCollection({ children, index }) {
  return <Dialog>
    {children}
    {!Boolean(children) && <DialogTrigger className="w-full mt-4">
      <h3 className="text-left">Select Meals</h3>
      <div className="w-full h-[120px] border-1 mt-4 flex items-center justify-center rounded-[8px]">
        <PlusCircle size={32} className="text-[var(--accent-1)]" />
      </div>
    </DialogTrigger>}
    <DialogContent className="min-w-[850px] p-0 gap-0">
      <DialogHeader className="p-4 border-b-1">
        <DialogTitle>Add Meals</DialogTitle>
      </DialogHeader>
      <RecipeesContainer index={index} />
    </DialogContent>
  </Dialog>
}

function RecipeesContainer({ index }) {
  const [query, setQuery] = useState("rajma");
  const debouncedSearchQuery = useDebounce(query, 1000);
  const { isLoading, error, data } = useSWR(
    `recipees/${debouncedSearchQuery}`,
    () => getRecipesCalorieCounter(debouncedSearchQuery)
  );
  const [selected, setSelected] = useState();
  const closeRef = useRef();
  const { dispatch } = useCurrentStateContext();
  if (isLoading) return <ContentLoader />
  if (error || data?.status_code !== 200) return <div className="p-4">
    <Input
      placeholder="Enter Meal Plan"
      value={query}
      onChange={e => setQuery(e.target.value)}
    />
    <ContentError title={error || data?.message || "No recipes found!"} />
  </div>
  const recipees = data.data;
  return <div className="p-4">
    <div className="flex items-center gap-4 pb-2">
      <Input
        placeholder="Enter Meal Plan"
        value={query}
        onChange={e => setQuery(e.target.value)}
      />
      {isLoading && <Loader />}
    </div>
    <div className="mb-4 flex items-center justify-between gap-4">
      {/* <strong>{recipees.length} Results found</strong> */}
      <p className="ml-auto text-black/70 text-sm font-bold">Can't find a Meal, Add your own</p>
      <RecipeModal type="new" />
    </div>
    <div className="max-h-[55vh] mb-4 overflow-y-auto grid grid-cols-2 gap-4 no-scrollbar">
      {recipees.map((recipe, index) => <RecipeDeatils
        key={index}
        recipe={recipe}
        selected={selected}
        setSelected={setSelected}
      />)}
    </div>
    {selected && <Button
      onClick={() => {
        dispatch(saveRecipe(selected, index))
        closeRef.current.click()
      }}
      variant="wz"
      className="w-full"
    >
      Add
    </Button>}
    <DialogClose ref={closeRef} />
  </div>
}

function RecipeDeatils({
  recipe,
  selected,
  setSelected
}) {
  return <div
    className={cn(
      "w-full flex flex-col cursor-pointer border-1 rounded-[10px] py-2 px-4",
      isSameRecipe(selected, recipe) && "border-[var(--accent-1)] shadow-lg bg-[var(--comp-2)]"
    )}
    onClick={() => !isSameRecipe(selected, recipe) ? setSelected(recipe) : setSelected()}
  >
    <h3>{recipe.dish_name || recipe.title}</h3>
    {typeof recipe.calories === "object"
      ? <RecipeCalories recipe={recipe} />
      : <DishCalories recipe={recipe} />}
  </div>
}

function DishCalories({ recipe }) {
  return <div className="text-xs text-black/70 mt-auto pt-2 flex flex-wrap gap-x-6 gap-y-1">
    <div className="flex items-center gap-1">
      <Flame className="w-[16px] h-[16px] text-[var(--accent-1)]" />
      Calories - <span className="text-black/40 font-bold">{recipe.calories}</span>
    </div>
    <div className="flex items-center gap-1">
      <Flame className="w-[16px] h-[16px] text-[var(--accent-1)]" />
      Protein - <span className="text-black/40 font-bold">{recipe.protein}</span>
    </div>
    <div className="flex items-center gap-1">
      <Flame className="w-[16px] h-[16px] text-[var(--accent-1)]" />
      Fats - <span className="text-black/40 font-bold">{recipe.fats}</span>
    </div>
    <div className="flex items-center gap-1">
      <Flame className="w-[16px] h-[16px] text-[var(--accent-1)]" />
      Carbs - <span className="text-black/40 font-bold">{recipe.carbohydrates}</span>
    </div>
  </div>
}

function RecipeCalories({ recipe }) {
  return <div className="text-xs text-black/70 mt-auto pt-2 flex flex-wrap gap-x-6 gap-y-1">
    <div className="flex items-center gap-1">
      <Flame className="w-[16px] h-[16px] text-[var(--accent-1)]" />
      Calories - <span className="text-black/40 font-bold">{recipe?.calories?.total}</span>
    </div>
    <div className="flex items-center gap-1">
      <Flame className="w-[16px] h-[16px] text-[var(--accent-1)]" />
      Protein - <span className="text-black/40 font-bold">{recipe?.calories.proteins}</span>
    </div>
    <div className="flex items-center gap-1">
      <Flame className="w-[16px] h-[16px] text-[var(--accent-1)]" />
      Fats - <span className="text-black/40 font-bold">{recipe?.calories.fats}</span>
    </div>
    <div className="flex items-center gap-1">
      <Flame className="w-[16px] h-[16px] text-[var(--accent-1)]" />
      Carbs - <span className="text-black/40 font-bold">{recipe?.calories.carbs}</span>
    </div>
  </div>
}

const isSameRecipe = (selected, currrent) => selected?._id === currrent?._id ||
  (selected?._id?.$oid === currrent?._id?.$oid && Boolean(selected?._id?.$oid))