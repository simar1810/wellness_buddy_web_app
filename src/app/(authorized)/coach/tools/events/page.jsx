"use client";

import { useMemo, useRef, useState } from "react";
import useSWR, { mutate } from "swr";
import ContentError from "@/components/common/ContentError";
import ContentLoader from "@/components/common/ContentLoader";
import YouTubeEmbed from "@/components/common/YoutubeEmbed";
import SelectMultiple from "@/components/SelectMultiple";
import DualOptionActionModal from "@/components/modals/DualOptionActionModal";
import { AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { sendData, uploadImage } from "@/lib/api";
import { getEvents } from "@/lib/fetchers/app";
import { useAppSelector } from "@/providers/global/hooks";
import { getObjectUrl } from "@/lib/utils";
import { checkArray } from "@/lib/formatter";
import {
  CalendarDays,
  Pencil,
  Play,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import Image from "next/image";
import imageCompression from "browser-image-compression";

const emptyForm = {
  image: null,
  title: "",
  description: "",
  ytLink: "",
  eventDate: "",
  status: "active",
  availability: [],
};

export default function CoachEventsPage() {
  const coach = useAppSelector((state) => state.coach.data);
  const client_categories = coach?.client_categories || [];
  const isSystemLeader = coach?.clubType === "System Leader";

  const { isLoading, error, data } = useSWR("catalog-events", () =>
    getEvents("coach")
  );

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [existingImageUrl, setExistingImageUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState(null);
  const fileRef = useRef(null);

  const availabilityOptions = useMemo(
    () => [
      { id: 1, name: "All Client", value: "client" },
      { id: 2, name: "Coach", value: "coach" },
      ...checkArray(client_categories).map((category, index) => ({
        id: index + 3,
        name: category.name,
        value: ["Client", "All Client", "coach", "Coach"].includes(category.name)
          ? category.name?.toLowerCase()
          : category.name,
      })),
    ],
    [client_categories]
  );

  if (isLoading) return <ContentLoader />;
  if (error || data?.status_code !== 200) {
    return <ContentError title={error || data?.message} />;
  }

  const events = data?.data || [];

  function openCreate() {
    setEditing(null);
    setFormData(emptyForm);
    setExistingImageUrl("");
    setOpen(true);
  }

  function openEdit(event) {
    setEditing(event);
    setFormData({
      image: null,
      title: event.title || "",
      description: event.description || "",
      ytLink: event.ytLink || "",
      eventDate: event.eventDate
        ? format(new Date(event.eventDate), "yyyy-MM-dd")
        : "",
      status: event.status || "active",
      availability: checkArray(event.availability),
    });
    setExistingImageUrl(event.image || "");
    setOpen(true);
  }

  const onFieldChange = (field) => (e) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
  };

  async function handleSave() {
    const toastId = toast.loading("Have patience...");
    try {
      setSaving(true);

      // Same as CreateRecognitionModal: uploadImage → then JSON sendData
      const payload = {
        title: formData.title,
        description: formData.description || "",
        eventDate: new Date(formData.eventDate).toISOString(),
        status: formData.status || "active",
        availability: checkArray(formData.availability),
      };
      if (formData.ytLink) payload.ytLink = formData.ytLink;
      if (editing) payload.eventId = editing._id;

      if (formData.image) {
        const uploadImageToast = toast.loading("Uploading image.");
        // Same compression as Meals — keeps server-action payload small
        const compressed = await imageCompression(formData.image, {
          maxSizeMB: 0.5,
          maxWidthOrHeight: 1600,
          useWebWorker: true,
        });
        const imageUploadResponse = await uploadImage(compressed);
        if (imageUploadResponse instanceof Error) {
          toast.dismiss(uploadImageToast);
          throw new Error(
            imageUploadResponse.message?.includes("<!DOCTYPE")
              ? "Upload failed — restart the web app after .env change, then retry."
              : imageUploadResponse.message || "Image upload failed"
          );
        }
        if (!imageUploadResponse?.img) {
          toast.dismiss(uploadImageToast);
          throw new Error("Image upload returned empty URL. Check AWS/.env.");
        }
        toast.dismiss(uploadImageToast);
        payload.image = imageUploadResponse.img;
      } else if (editing && existingImageUrl) {
        payload.image = existingImageUrl;
      }

      if (!editing && !payload.image) {
        throw new Error("Please select a cover image");
      }

      const response = await sendData(
        "app/events",
        payload,
        editing ? "PUT" : "POST"
      );
      if (response instanceof Error) {
        throw new Error(
          response.message?.includes("<!DOCTYPE")
            ? "API returned HTML instead of JSON. Restart Next.js (port 3050) so it picks up localhost API."
            : response.message
        );
      }
      if (response?.status_code !== 200) {
        throw new Error(response?.message || "Failed to save event");
      }

      toast.success(response.message || "Successfull");
      setOpen(false);
      mutate("catalog-events");
    } catch (err) {
      toast.error(err.message || "something went wrong!");
    } finally {
      setSaving(false);
      toast.dismiss(toastId);
    }
  }

  async function handleDelete(eventId) {
    try {
      const response = await sendData("app/events", { eventId }, "DELETE");
      if (response.status_code !== 200) {
        throw new Error(response.message || "Failed to delete");
      }
      toast.success("Event deleted");
      mutate("catalog-events");
    } catch (err) {
      toast.error(err.message || "Something went wrong");
    }
  }

  return (
    <div className="content-container content-height-screen">
      <div className="flex items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Upcoming Events</h1>
          <p className="text-sm text-[var(--dark-3)] mt-1">
            Share images and YouTube previews of upcoming sessions with targeted audiences.
          </p>
        </div>
        {isSystemLeader && (
          <Button variant="wz" onClick={openCreate}>
            <Plus className="w-4 h-4" />
            Add Event
          </Button>
        )}
      </div>

      {events.length === 0 ? (
        <div className="text-center py-16 rounded-[12px] bg-[var(--comp-2)] border border-[var(--comp-3)]">
          <CalendarDays className="mx-auto mb-3 text-[var(--accent-1)]" />
          <p className="text-[var(--dark-3)]">No events yet.</p>
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {events.map((event) => (
            <div
              key={event._id}
              className="rounded-[14px] overflow-hidden bg-[var(--comp-2)] border border-[var(--comp-3)]"
            >
              <button
                type="button"
                className="relative w-full aspect-video group"
                onClick={() =>
                  event.ytLink
                    ? setPreview({ url: event.ytLink, title: event.title })
                    : null
                }
              >
                <img
                  src={event.image || "/not-found.png"}
                  alt={event.title}
                  className="w-full h-full object-cover"
                />
                {event.ytLink && (
                  <span className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition">
                    <Play className="text-white w-10 h-10" />
                  </span>
                )}
              </button>
              <div className="p-4 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold leading-snug">{event.title}</h3>
                  {isSystemLeader && (
                    <div className="flex gap-1 shrink-0">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => openEdit(event)}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <DualOptionActionModal
                        title="Delete event?"
                        description="This cannot be undone."
                        action={async (setLoading, btnRef) => {
                          try {
                            setLoading(true);
                            await handleDelete(event._id);
                            btnRef?.current?.click();
                          } finally {
                            setLoading(false);
                          }
                        }}
                      >
                        <AlertDialogTrigger asChild>
                          <Button size="icon" variant="ghost">
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </AlertDialogTrigger>
                      </DualOptionActionModal>
                    </div>
                  )}
                </div>
                {event.eventDate && (
                  <p className="text-xs text-[var(--accent-1)] font-medium">
                    {format(new Date(event.eventDate), "MMM d, yyyy")}
                  </p>
                )}
                {event.description && (
                  <p className="text-sm text-[var(--dark-3)] line-clamp-2">
                    {event.description}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="gap-0 space-y-0 p-0 max-h-[70vh] overflow-y-auto max-w-lg">
          <DialogTitle className="p-4 border-b">
            {editing ? "Edit Event" : "Create Event"}
          </DialogTitle>
          <div className="p-4 space-y-4">
            <div className="space-y-2">
              <Label>Cover Image</Label>
              <div className="relative border bg-gray-50">
                <Image
                  src={
                    Boolean(formData.image)
                      ? getObjectUrl(formData.image)
                      : existingImageUrl || "/not-found.png"
                  }
                  height={400}
                  width={400}
                  className="w-full h-[220px] object-contain"
                  alt=""
                  onClick={() => fileRef.current?.click()}
                />
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      image: e.target.files?.[0] || null,
                    }))
                  }
                />
                {formData.image && (
                  <X
                    className="absolute top-[-10px] right-[-10px] cursor-pointer"
                    onClick={() =>
                      setFormData((prev) => ({ ...prev, image: null }))
                    }
                  />
                )}
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

            <div className="space-y-1">
              <Label>Event Date</Label>
              <Input
                type="date"
                value={formData.eventDate}
                onChange={onFieldChange("eventDate")}
              />
            </div>

            <div className="space-y-1">
              <Label>YouTube URL (optional)</Label>
              <Input
                placeholder="https://youtube.com/watch?v=..."
                value={formData.ytLink}
                onChange={onFieldChange("ytLink")}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase text-slate-500">
                Availability
              </Label>
              <SelectMultiple
                options={availabilityOptions}
                value={checkArray(formData.availability)}
                onChange={(val) =>
                  setFormData((prev) => ({ ...prev, availability: val }))
                }
              />
            </div>

            <Button
              className="w-full"
              variant="wz"
              disabled={saving}
              onClick={handleSave}
            >
              {saving ? "Saving..." : editing ? "Update Event" : "Create Event"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!preview} onOpenChange={() => setPreview(null)}>
        <DialogContent className="max-w-3xl">
          <DialogTitle>{preview?.title}</DialogTitle>
          {preview?.url && <YouTubeEmbed link={preview.url} />}
        </DialogContent>
      </Dialog>
    </div>
  );
}
