import { Dialog, DialogClose, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useRevalidateAndClearCache } from "../pages/coach/recognition/useRevalidateAndClearCache";
import { useRef, useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { toast } from "sonner";
import { sendData } from "@/lib/api";
import { useAppSelector } from "@/providers/global/hooks";
import SelectMultiple from "../SelectMultiple";
import { checkArray } from "@/lib/formatter";

export default function CreateYTRecipe({ currentSWRKey }) {
  const { client_categories } = useAppSelector(state => state.coach.data);
  const revalidate = useRevalidateAndClearCache();
  const closeRef = useRef();
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    ytLink: "",
    availability: []
  });
  const [creating, setCreating] = useState(false);

  const onFieldChange = (field) => (e) => {
    setFormData((prev) => ({
      ...prev,
      [field]: e.target.value
    }));
  };

  const createResource = async function () {
    if (!formData.title || !formData.ytLink) {
      return toast.error("Title and YouTube link are required");
    }

    const toastId = toast.loading("Creating resource...");
    try {
      setCreating(true);

      const response = await sendData("app/yt-recipe/video-library", formData);
      
      if (response.status_code !== 200) throw new Error(response.message);
      
      toast.success(response.message || "Resource created successfully");
      revalidate(currentSWRKey, "app/video-resource");
      closeRef.current.click();
      
      // Reset form
      setFormData({ title: "", description: "", ytLink: "", availability: [] });
      
    } catch (error) {
      toast.error(error.message || "Something went wrong!");
    } finally {
      setCreating(false);
      toast.dismiss(toastId);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="sm">New Video Resource</Button>
      </DialogTrigger>
      <DialogContent className="gap-0 space-y-0 p-0 max-h-[85vh] overflow-y-auto">
        <DialogTitle className="p-4 border-b">Add New Video</DialogTitle>
        
        <div className="p-4 space-y-4">
          <div className="space-y-1">
            <Label>Title *</Label>
            <Input
              placeholder="Enter video title"
              value={formData.title}
              onChange={onFieldChange("title")}
              maxLength={150}
            />
            <p className="text-[10px] text-muted-foreground text-right">
              {formData.title.length}/150
            </p>
          </div>

          <div className="space-y-1">
            <Label>YouTube URL *</Label>
            <Input
              placeholder="https://www.youtube.com/watch?v=..."
              value={formData.ytLink}
              onChange={onFieldChange("ytLink")}
            />
          </div>

          <div className="space-y-1">
            <Label>Description (Optional)</Label>
            <Textarea
              placeholder="Briefly describe this video..."
              value={formData.description}
              onChange={onFieldChange("description")}
              maxLength={1000}
              className="resize-none"
            />
            <p className="text-[10px] text-muted-foreground text-right">
              {formData.description.length}/1000
            </p>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase text-slate-500">
              Availability
            </Label>
            <SelectMultiple
              options={checkArray(client_categories).map((category, index) => ({
                id: index + 3,
                name: category.name,
                value: ["Client", "All Client", "coach", "Coach"].includes(category.name) 
                  ? category.name?.toLowerCase() 
                  : category.name
              }))}
              value={checkArray(formData.availability)}
              onChange={(val) => setFormData((prev) => ({
                ...prev,
                availability: val
              }))}
            />
          </div>

          <div className="grid grid-cols-2 items-center gap-2 pt-2">
            <DialogClose ref={closeRef} asChild>
              <Button className="w-full" variant="secondary" size="sm">
                Cancel
              </Button>
            </DialogClose>
            <Button
              className="w-full"
              variant="wz"
              size="sm"
              disabled={creating}
              onClick={createResource}
            >
              {creating ? "Creating..." : "Create Resource"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}