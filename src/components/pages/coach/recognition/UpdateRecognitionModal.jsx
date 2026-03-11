"use client";
import { useEffect, useRef, useState } from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
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
import { X, Pencil } from "lucide-react";
import Image from "next/image";
import { getObjectUrl } from "@/lib/utils";
import { toast } from "sonner";
import { sendData, uploadImage } from "@/lib/api";
import SelectCoach from "./SelectCoach";
import { validateRecognitionPayload } from "./helper";
import { useRevalidateAndClearCache } from "./useRevalidateAndClearCache";

export default function UpdateRecognitionModal({
  recognition,
  onSuccess,
  currentCacheKey
}) {
  const revalidate = useRevalidateAndClearCache()
  const [image, setImage] = useState(null);
  const [status, setStatus] = useState("");
  const [selectedCoach, setSelectedCoach] = useState("");
  const [recognisedAt, setRecognisedAt] = useState("");
  const [updating, setUpdating] = useState(false);

  const closeRef = useRef()
  const fileRef = useRef();

  useEffect(() => {
    if (!recognition) return;

    setStatus(recognition.status || "");
    setSelectedCoach(recognition?.coach?._id || "");
    setRecognisedAt(
      recognition.recognisedAt
        ? new Date(recognition.recognisedAt).toISOString().split("T")[0]
        : ""
    );
  }, [recognition]);

  const handleSubmit = async function () {
    const toastId = toast.loading("Updating recognition...");
    try {
      setUpdating(true);

      const payload = {
        recognitionId: recognition._id,
        coach: selectedCoach,
        status,
        recognisedAt: new Date(recognisedAt)
      };

      const { valid, message } = validateRecognitionPayload(payload);

      if (!valid) {
        throw new Error(message);
      }

      if (image) {
        const uploadToast = toast.loading("Uploading image...");
        const imageUploadResponse = await uploadImage(image);

        toast.dismiss(uploadToast);

        if (imageUploadResponse instanceof Error) {
          throw new Error(imageUploadResponse);
        }

        payload.image = imageUploadResponse.img;
      }

      const response = await sendData(
        `app/recognition`,
        payload,
        "PUT"
      );

      if (response.status_code !== 200) throw new Error(response.message);

      toast.success(response.message || "Recognition updated");

      if ((typeof onSuccess).toLowerCase() === "function") {
        onSuccess();
      }

      revalidate(currentCacheKey, "app/recognition")
      closeRef.current.click()

    } catch (error) {
      toast.error(error.message || "Something went wrong");
    }

    setUpdating(false);
    toast.dismiss(toastId);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Pencil className="w-4 h-4" />
      </DialogTrigger>
      <DialogClose ref={closeRef} />
      <DialogContent className="sm:max-w-md max-h-[70vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Update Recognition</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Recognition Image</Label>
            <div className="relative border bg-gray-50">
              <Image
                src={
                  image
                    ? getObjectUrl(image)
                    : recognition.image || "/not-found.png"
                }
                height={400}
                width={400}
                className="w-full h-[250px] object-contain cursor-pointer"
                alt=""
                onClick={() => fileRef.current.click()}
              />
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                hidden
                onChange={e => setImage(e.target.files?.[0])}
              />
              {image && (
                <X
                  className="absolute top-[-10px] right-[-10px] cursor-pointer"
                  onClick={() => setImage(null)}
                />
              )}
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

            <Select
              value={status}
              onValueChange={setStatus}
            >
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
            disabled={updating}
            className="w-full"
            onClick={handleSubmit}
          >
            {updating
              ? <Loader className="!w-6 !border-2" />
              : <>Update Recognition</>}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}