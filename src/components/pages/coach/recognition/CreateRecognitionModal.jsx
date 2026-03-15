"use client";
import { useRef, useState } from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import Loader from "@/components/common/Loader";
import { X } from "lucide-react";
import Image from "next/image";
import { getObjectUrl } from "@/lib/utils";
import { toast } from "sonner";
import { sendData, uploadImage } from "@/lib/api";
import SelectCoach from "./SelectCoach";
import { validateRecognitionPayload } from "./helper";
import { useRevalidateAndClearCache } from "./useRevalidateAndClearCache";

export default function CreateRecognitionModal({ onSuccess, currentCacheKey }) {
  const revalidate = useRevalidateAndClearCache()
  const [image, setImage] = useState(null);
  const [status, setStatus] = useState("");
  const [selectedCoach, setSelectedCoach] = useState("");
  const [recognisedAt, setRecognisedAt] = useState("");
  const [creating, setCreating] = useState(false);

  const closeRef = useRef()
  const fileRef = useRef();

  const handleSubmit = async function () {
    const toastId = toast.loading("Have patience...");
    try {
      setCreating(true)

      const payload = {
        coach: selectedCoach,
        status,
        recognisedAt: new Date(recognisedAt)
      }
      const { valid, message } = validateRecognitionPayload(payload)

      if (!valid) {
        throw new Error(message);
      }

      const uploadImageToast = toast.loading("Uploading image.");
      const imageUploadResponse = await uploadImage(image);
      if (imageUploadResponse instanceof Error) {
        toast.dismiss(uploadImageToast)
        throw new Error(imageUploadResponse);
      }
      toast.dismiss(uploadImageToast)

      payload.image = imageUploadResponse.img;

      const response = await sendData("app/recognition", payload)
      if (response.status_code !== 200) throw new Error(response.message)
      toast.success(response.message || "Successfull");
      if ((typeof onSuccess).toLowerCase() === "function") {
        onSuccess();
      }
      revalidate(currentCacheKey, "app/recognition")
      closeRef.current.click()
    } catch (error) {
      toast.error(error.message || "something went wrong!");
    }
    setCreating(false)
    toast.dismiss(toastId);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Create Recognition</Button>
      </DialogTrigger>
      <DialogContent className="p-0 sm:max-w-md max-h-[70vh] overflow-y-auto">
        <DialogClose ref={closeRef} />
        <DialogHeader className="px-4 pb-4 border-b-1">
          <DialogTitle>Create Recognition</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 p-4">
          <div className="space-y-2">
            <Label>Recognition Image</Label>
            <div className="relative border-1 bg-gray-50">
              <Image
                src={Boolean(image) ? getObjectUrl(image) : "/not-found.png"}
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
                onChange={e => setImage(e.target.files[0])}
              />
              {image && <X
                className="absolute top-[-10px] right-[-10px] cursor-pointer"
                onClick={() => setImage()}
              />}
            </div>
          </div>

          <div className="space-y-2">
            <SelectCoach
              selectedCoach={selectedCoach}
              onChange={val => setSelectedCoach(val)}
            />
          </div>

          <div className="space-y-2">
            <Label>Status</Label>
            <Select onValueChange={setStatus}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="archive">Archive</SelectItem>
              </SelectContent>
            </Select>

          </div>

          <div className="space-y-2">
            <Label>Recognised At</Label>

            <Input
              type="date"
              value={recognisedAt}
              onChange={(e) => setRecognisedAt(e.target.value)}
            />
          </div>

          <Button
            disabled={creating}
            className="w-full"
            onClick={handleSubmit}
          >
            {creating
              ? <Loader className="!w-6 !border-2" />
              : <>Create Recognition</>}
          </Button>
        </div>

      </DialogContent>
    </Dialog>
  );
}