"use client";

import { Dialog, DialogClose, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Edit2 } from "lucide-react";
import { useRevalidateAndClearCache } from "../pages/coach/recognition/useRevalidateAndClearCache";
import { useRef, useState, useEffect } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { toast } from "sonner";
import { sendData } from "@/lib/api";
import SelectMultiple from "../SelectMultiple";
import { checkArray } from "@/lib/formatter";
import { useAppSelector } from "@/providers/global/hooks";

export default function UpdateRecipeVideo({ item, currentSWRKey }) {
  const { client_categories } = useAppSelector(state => state.coach.data);
  const revalidate = useRevalidateAndClearCache();
  const closeRef = useRef();
  const endpoint = "app/yt-recipe/video-library";

  const [formData, setFormData] = useState({
    title: item?.title || "",
    description: item?.description || "",
    ytLink: item?.ytLink || "",
    availability: checkArray(item?.availability)
  });
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (item) {
      setFormData({
        ytRecipeId: item._id,
        title: item.title || "",
        description: item.description || "",
        ytLink: item.ytLink || "",
        availability: checkArray(item?.availability)
      });
    }
  }, [item]);

  const onFieldChange = (field) => (e) => {
    setFormData((prev) => ({
      ...prev,
      [field]: e.target.value
    }));
  };

  const updateRecipe = async function () {
    const toastId = toast.loading("Updating recipe video...");
    try {
      setUpdating(true);
      const response = await sendData(endpoint, formData, "PUT");

      if (response.status_code !== 200) throw new Error(response.message);

      toast.success(response.message || "Updated successfully");
      revalidate(currentSWRKey, endpoint);
      closeRef.current?.click();
    } catch (error) {
      toast.error(error.message || "Something went wrong!");
    } finally {
      setUpdating(false);
      toast.dismiss(toastId);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="p-2 bg-white/90 backdrop-blur shadow-sm rounded-full text-slate-600 hover:text-blue-600 transition-colors">
          <Edit2 size={14} />
        </button>
      </DialogTrigger>
      <DialogContent className="gap-0 space-y-0 p-0 max-h-[90vh] overflow-y-auto sm:max-w-[450px]">
        <DialogTitle className="p-4 border-b">Update Video Recipe</DialogTitle>
        <div className="p-4 space-y-4">
          
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold uppercase text-slate-500">Title</Label>
            <Input
              placeholder="Enter recipe title"
              value={formData.title}
              onChange={onFieldChange("title")}
              maxLength={150}
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold uppercase text-slate-500">YouTube URL</Label>
            <Input
              placeholder="https://youtube.com/..."
              value={formData.ytLink}
              onChange={onFieldChange("ytLink")}
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold uppercase text-slate-500">Description</Label>
            <Textarea
              placeholder="Enter recipe description"
              value={formData.description}
              onChange={onFieldChange("description")}
              maxLength={1000}
              className="resize-none h-24"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase text-slate-500">Availability</Label>
            <SelectMultiple
              options={checkArray(client_categories).map((category, index) => ({
                id: index + 3,
                name: category.name,
                value: ["Client", "All Client", "coach", "Coach"].includes(category.name) 
                  ? category.name?.toLowerCase() 
                  : category.name
              }))}
              value={checkArray(formData.availability)}
              onChange={val => setFormData((prev) => ({
                ...prev,
                availability: val
              }))}
            />
          </div>

          <div className="grid grid-cols-2 items-center gap-3 pt-2">
            <DialogClose ref={closeRef} asChild>
              <Button variant="outline" size="sm">Cancel</Button>
            </DialogClose>
            <Button
              variant="wz"
              size="sm"
              disabled={updating}
              onClick={updateRecipe}
            >
              {updating ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}