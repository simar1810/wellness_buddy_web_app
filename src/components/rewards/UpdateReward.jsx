"use client";

import { Dialog, DialogClose, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { X, Edit2 } from "lucide-react";
import { useRevalidateAndClearCache } from "../pages/coach/recognition/useRevalidateAndClearCache";
import { useRef, useState, useEffect } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import Image from "next/image";
import { getObjectUrl } from "@/lib/utils";
import { toast } from "sonner";
import { sendDataWithFormData } from "@/lib/api";

export default function UpdateReward({ item, currentSWRKey }) {
  const revalidate = useRevalidateAndClearCache();
  const fileRef = useRef();
  const closeRef = useRef();

  const [formData, setFormData] = useState({
    image: item?.image || "",
    title: item?.title || "",
    description: item?.description || ""
  });
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (item) {
      setFormData({
        image: "",
        title: item.title || "",
        description: item.description || ""
      });
    }
  }, [item]);

  const onFieldChange = (field) => (e) => {
    if (field === "image" && !e?.target) {
      return setFormData(prev => ({ ...prev, image: "" }));
    }

    const isFile = e.target.type === "file";
    const file = e.target.files?.[0];
    setFormData((prev) => ({
      ...prev,
      [field]: isFile ? (file || prev[field]) : e.target.value
    }));
  };

  const updateReward = async function () {
    const toastId = toast.loading("Updating reward...");
    try {
      setUpdating(true);
      const payload = new FormData();

      payload.set("awardId", item._id);
      payload.set("title", formData.title);
      payload.set("description", formData.description);
      payload.set("rewardId", item._id);

      if (formData.image instanceof File) {
        payload.set("image", formData.image);
      }

      const response = await sendDataWithFormData("app/reward", payload, "PUT");

      if (response.status_code !== 200) throw new Error(response.message);

      toast.success(response.message || "Updated successfully");
      revalidate(currentSWRKey, "app/reward");
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
        <button className="p-2 bg-white/90 backdrop-blur shadow-sm rounded-full text-slate-600 hover:text-blue-600">
          <Edit2 size={14} />
        </button>
      </DialogTrigger>
      <DialogContent className="gap-0 space-y-0 p-0 max-h-[90vh] overflow-y-auto sm:max-w-[450px]">
        <DialogTitle className="p-4 border-b">Update Reward</DialogTitle>
        <div className="p-4 space-y-4">

          <div className="space-y-2">
            <Label>Reward Image</Label>
            <div className="relative border rounded-lg bg-gray-50 overflow-hidden group">
              <div
                className="cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => fileRef.current.click()}
              >
                <Image
                  src={formData.image ? getObjectUrl(formData.image) : (item.image || "/not-found.png")}
                  height={400}
                  width={400}
                  className="w-full h-[200px] object-contain bg-white"
                  alt=""
                />
              </div>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={onFieldChange("image")}
              />
              {formData.image && (
                <button
                  onClick={() => onFieldChange("image")(null)}
                  className="absolute top-2 right-2 p-1 bg-white shadow-sm rounded-full hover:bg-red-50 hover:text-red-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold uppercase text-slate-500">Title</Label>
            <Input
              placeholder="Enter reward title"
              value={formData.title}
              onChange={onFieldChange("title")}
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold uppercase text-slate-500">Description</Label>
            <Input
              placeholder="Enter reward description"
              value={formData.description}
              onChange={onFieldChange("description")}
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
              onClick={updateReward}
            >
              {updating ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}