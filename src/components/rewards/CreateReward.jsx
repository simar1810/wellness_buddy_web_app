import { Dialog, DialogClose, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { X } from "lucide-react";
import { useRevalidateAndClearCache } from "../pages/coach/recognition/useRevalidateAndClearCache";
import { useRef, useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import Image from "next/image";
import { getObjectUrl } from "@/lib/utils";
import { toast } from "sonner";
import { sendDataWithFormData } from "@/lib/api";
import { useAppSelector } from "@/providers/global/hooks";
import SelectMultiple from "../SelectMultiple";
import { checkArray } from "@/lib/formatter";

export default function CreateReward({ currentSWRKey }) {
  const { client_categories } = useAppSelector(state => state.coach.data)
  const revalidate = useRevalidateAndClearCache()
  const fileRef = useRef()
  const closeRef = useRef()
  const [formData, setFormData] = useState({
    image: "",
    title: "",
    description: "",
    availability: []
  })
  const [creating, setCreating] = useState(false);

  const onFieldChange = (field) => (e) => {
    const isFile = e.target.type === "file";
    const file = e.target.files?.[0];
    setFormData((prev) => ({
      ...prev,
      [field]: isFile
        ? (file || prev[field])
        : e.target.value
    }));
  };

  const createReward = async function () {
    const toastId = toast.loading("Have patience...");
    try {
      setCreating(true)
      const payload = new FormData()
      payload.set("title", formData.title)
      payload.set("image", formData.image)
      payload.set("description", formData.description)
      for (const item of formData.availability) {
        payload.append("availability", item);
      }
      const response = await sendDataWithFormData("app/reward", payload)
      if (response.status_code !== 200) throw new Error(response.message)
      toast.success(response.message || "Successfull");
      revalidate(currentSWRKey, "app/reward")
      closeRef.current.click()
    } catch (error) {
      toast.error(error.message || "something went wrong!");
    }
    setCreating(false)
    toast.dismiss(toastId);
  };

  return <Dialog>
    <DialogTrigger asChild>
      <Button size="sm">New Reward</Button>
    </DialogTrigger>
    <DialogContent className="gap-0 space-y-0 p-0 max-h-[70vh] overflow-y-auto">
      <DialogTitle className="p-4 border-b-1">New Award</DialogTitle>
      <div className="p-4 space-y-4">
        <div className="space-y-2">
          <Label>Reward Image</Label>
          <div className="relative border-1 bg-gray-50">
            <Image
              src={Boolean(formData.image) ? getObjectUrl(formData.image) : "/not-found.png"}
              height={400}
              width={400}
              className="w-full h-[250px] object-contain"
              alt=""
              onClick={() => fileRef.current.click()}
            />
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              hidden
              onChange={onFieldChange("image")}
            />
            {formData.image && <X
              className="absolute top-[-10px] right-[-10px] cursor-pointer"
              onClick={onFieldChange("image")}
            />}
          </div>
        </div>

        <div className="space-y-1">
          <Label>Title</Label>
          <Input
            placeholder="Fill title"
            value={formData.title}
            onChange={onFieldChange("title")}
          />
        </div>

        <div className="space-y-1">
          <Label>Description</Label>
          <Input
            placeholder="Fill description"
            value={formData.description}
            onChange={onFieldChange("description")}
          />
        </div>


        <div className="space-y-2">
          <Label className="text-xs font-semibold uppercase text-slate-500">Availability</Label>
          <SelectMultiple
            options={checkArray(client_categories).map((category, index) => ({
              id: index + 3,
              name: category.name,
              value: ["Client", "All Client", "coach", "Coach"].includes(category.name) ? category.name?.toLowerCase() : category.name
            }))}
            value={checkArray(formData.availability)}
            onChange={val => setFormData((prev) => ({
              ...prev,
              availability: val
            }))}
          />
        </div>
        
        <div className="grid grid-cols-2 items-center gap-2">
          <DialogClose ref={closeRef} asChild>
            <Button
              className="w-full"
              variant="secondary"
              size="sm"
            >
              Cancel
            </Button>
          </DialogClose>
          <Button
            className="w-full"
            variant="wz"
            size="sm"
            disabled={creating}
            onClick={createReward}
          >
            {creating
              ? <>Creating...</>
              : <>Create</>}
          </Button>
        </div>
      </div>
    </DialogContent>
  </Dialog>
}