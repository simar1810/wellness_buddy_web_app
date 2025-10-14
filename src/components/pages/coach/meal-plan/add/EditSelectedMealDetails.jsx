import { Dialog, DialogClose, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { DialogTitle } from "@radix-ui/react-dialog";
import { Search, } from "lucide-react";
import SelectMealCollection from "./SelectMealCollection";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import FormControl from "@/components/FormControl";
import { useRef, useState } from "react";
import useCurrentStateContext from "@/providers/CurrentStateContext";
import { saveRecipe } from "@/config/state-reducers/custom-meal";
import UploadImage from "@/components/modals/UploadImage";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export default function EditSelectedMealDetails({
  defaultOpen,
  children,
  recipe,
  index
}) {
  const [open, setOpen] = useState(defaultOpen);
  const [formData, setFormData] = useState(recipe);
  const { dispatch } = useCurrentStateContext();
  const onChangeHandler = e => setFormData({ ...formData, [e.target.name]: e.target.value });
  const closeBtnRef = useRef()

  function updateDish(open) {
    if (open === true) return;
    for (const field of ["dish_name", "time"]) {
      if (!formData[field]) {
        toast.error(`${field} is required.`)
        return
      }
    }
    dispatch(saveRecipe(formData, index))
    closeBtnRef.current.click()
    setOpen(false)
  }

  function onOpenChange() {
    dispatch(saveRecipe(formData, index, true))
    setOpen(!open)
  }

  return <Dialog open={open} onOpenChange={onOpenChange}>
    {!children && <DialogTrigger className="w-full">
      <div className="mt-4 flex items-start gap-4">
        <Image
          alt=""
          src={recipe.image || "/not-found.png"}
          height={100}
          width={100}
          className="rounded-lg max-h-[100px] bg-[var(--comp-1)] object-contain border-1"
        />
        <div className="text-left">
          <h3>{recipe.dish_name || recipe.title}</h3>
          <p>{recipe.meal_time}</p>
          <div className="mt-2 flex flex-wrap gap-1 overflow-x-auto no-scrollbar">
            {typeof recipe.calories === "object"
              ? <RecipeCalories recipe={recipe} />
              : <MealCalories recipe={recipe} />}
          </div>
        </div>
      </div>
    </DialogTrigger>}
    {children}
    <DialogContent className="p-0 gap-0 max-h-[70vh] overflow-y-auto">
      <DialogTitle className="p-4 border-b-1">Details</DialogTitle>
      <div className="p-4">
        <Image
          alt=""
          src={recipe.image || "/not-found.png"}
          height={100}
          width={100}
          className="w-full h-[250px] bg-[var(--comp-1)] rounded-lg object-contain border-1"
        />
        <div className="mt-2 mb-6 flex justify-between items-center">
          <SelectMealCollection index={index}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Search />
                Search
              </Button>
            </DialogTrigger>
          </SelectMealCollection>
          {recipe._id && <UploadImage setter={(image) => setFormData({ ...formData, image })} />}
        </div>
        <FormControl
          value={formData.dish_name || formData.name || ""}
          name="dish_name"
          onChange={onChangeHandler}
          placeholder="Dish Name"
          className="block mb-4"
        />
        <FormControl
          value={formData.description || ""}
          name="description"
          onChange={onChangeHandler}
          placeholder="Description"
          className="block mb-4"
        />
        <FormControl
          type="time"
          value={formData.time || ""}
          name="time"
          onChange={onChangeHandler}
          className="block mb-4"
        />
        <h3>Nutrition Values</h3>
        <label className="flex justify-between items-center">
          <span>Serving Size</span>
          <FormControl
            value={formData.serving_size || ""}
            name="serving_size"
            onChange={onChangeHandler}
          />
        </label>
        <label className="flex justify-between items-center">
          <span>Calories</span>
          <FormControl
            value={formData.calories || ""}
            name="calories"
            onChange={onChangeHandler}
          />
        </label>
        <label className="flex justify-between items-center">
          <span>Proteins</span>
          <FormControl
            value={formData.protein || ""}
            name="protein"
            onChange={onChangeHandler}
          />
        </label>
        <label className="flex justify-between items-center">
          <span>Carbohydrates</span>
          <FormControl
            value={formData.carbohydrates || ""}
            name="carbohydrates"
            onChange={onChangeHandler}
          />
        </label>
        <label className="flex justify-between items-center">
          <span>Fats</span>
          <FormControl
            value={formData.fats || ""}
            name="fats"
            onChange={onChangeHandler}
          />
        </label>
        <Button
          className="w-full mt-4"
          variant="wz"
          onClick={updateDish}
        >
          Save
        </Button>
        <DialogClose ref={closeBtnRef} />
      </div>
    </DialogContent>
  </Dialog>
}

function MealCalories({ recipe }) {
  return <>
    <Badge className="bg-[#EFEFEF] text-black"><span className="text-black/40">Serving Size -</span>{recipe?.serving_size}</Badge>
    <Badge className="bg-[#EFEFEF] text-black"><span className="text-black/40">Kcal -</span>{recipe?.calories}</Badge>
    <Badge className="bg-[#EFEFEF] text-black"><span className="text-black/40">Protien -</span> {recipe.protein}</Badge>
    <Badge className="bg-[#EFEFEF] text-black"><span className="text-black/40">Carbs -</span> {recipe.carbohydrates}</Badge>
    <Badge className="bg-[#EFEFEF] text-black"><span className="text-black/40">Fats -</span> {recipe.fats}</Badge>
  </>
}

function RecipeCalories({ recipe }) {
  return <>
    <Badge className="bg-[#EFEFEF] text-black"><span className="text-black/40">Protien -</span> {recipe?.calories?.proteins}</Badge>
    <Badge className="bg-[#EFEFEF] text-black"><span className="text-black/40">Carbs -</span> {recipe?.calories?.carbs}</Badge>
    <Badge className="bg-[#EFEFEF] text-black"><span className="text-black/40">Fats -</span> {recipe?.calories?.fats}</Badge>
    <Badge className="bg-[#EFEFEF] text-black"><span className="text-black/40">Kcal -</span>{recipe?.calories?.total}</Badge>
  </>
}