"use client";

import { useEffect, useRef, useState } from "react";
import imageCompression from "browser-image-compression";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import SelectMultiple from "@/components/SelectMultiple";
import { sendData, uploadImage } from "@/lib/api";
import { getObjectUrl } from "@/lib/utils";
import { checkArray } from "@/lib/formatter";
import { useAvailabilityOptions } from "@/hooks/useAvailabilityOptions";

const emptyForm = {
  title: "",
  description: "",
  mediaType: "image",
  image: null,
  ytLink: "",
  status: "active",
  availability: [],
};

export default function ToolPostFormDialog({
  open,
  onOpenChange,
  tabId,
  editing,
  onSaved,
}) {
  const availabilityOptions = useAvailabilityOptions();
  const fileRef = useRef(null);
  const [form, setForm] = useState(emptyForm);
  const [existingImage, setExistingImage] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (editing) {
      setForm({
        title: editing.title || "",
        description: editing.description || "",
        mediaType: editing.mediaType || "image",
        image: null,
        ytLink: editing.ytLink || "",
        status: editing.status || "active",
        availability: checkArray(editing.availability),
      });
      setExistingImage(editing.image || "");
    } else {
      setForm(emptyForm);
      setExistingImage("");
    }
  }, [open, editing]);

  async function handleSave() {
    try {
      if (!form.title?.trim() || form.title.trim().length < 3) {
        throw new Error("Title must be at least 3 characters");
      }
      if (form.mediaType === "youtube" && !form.ytLink?.trim()) {
        throw new Error("YouTube link is required");
      }
      setSaving(true);
      const payload = {
        tabId,
        title: form.title.trim(),
        description: form.description || "",
        mediaType: form.mediaType,
        status: form.status || "active",
        availability: checkArray(form.availability),
      };
      if (editing) payload.toolTabPostId = editing._id;

      if (form.mediaType === "youtube") {
        payload.ytLink = form.ytLink.trim();
      } else if (form.image) {
        const uploadToast = toast.loading("Uploading image.");
        const compressed = await imageCompression(form.image, {
          maxSizeMB: 0.5,
          maxWidthOrHeight: 1600,
          useWebWorker: true,
        });
        const upload = await uploadImage(compressed);
        toast.dismiss(uploadToast);
        if (upload instanceof Error || !upload?.img) {
          throw new Error(upload?.message || "Image upload failed");
        }
        payload.image = upload.img;
      } else if (editing && existingImage) {
        payload.image = existingImage;
      }

      if (form.mediaType === "image" && !payload.image) {
        throw new Error("Please select an image");
      }

      const response = await sendData(
        "app/tool-tab-posts",
        payload,
        editing ? "PUT" : "POST"
      );
      if (response instanceof Error || response?.status_code !== 200) {
        throw new Error(response?.message || "Failed to save post");
      }
      toast.success(editing ? "Post updated" : "Post created");
      onOpenChange(false);
      onSaved?.();
    } catch (err) {
      toast.error(err.message || "Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto motion-reduce:transition-none">
        <DialogTitle>{editing ? "Edit Post" : "Add Post"}</DialogTitle>
        <div className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label htmlFor="post-title">Title</Label>
            <Input
              id="post-title"
              value={form.title}
              maxLength={150}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              placeholder="Post title"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="post-desc">Description</Label>
            <Textarea
              id="post-desc"
              value={form.description}
              maxLength={2000}
              onChange={(e) =>
                setForm((f) => ({ ...f, description: e.target.value }))
              }
            />
          </div>
          <div className="space-y-2">
            <Label>Media</Label>
            <div className="flex gap-2">
              {["image", "youtube"].map((type) => (
                <Button
                  key={type}
                  type="button"
                  variant={form.mediaType === type ? "wz" : "wz_outline"}
                  className="cursor-pointer capitalize"
                  onClick={() => setForm((f) => ({ ...f, mediaType: type }))}
                >
                  {type}
                </Button>
              ))}
            </div>
          </div>
          {form.mediaType === "image" ? (
            <div className="space-y-2">
              <Label>Image</Label>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) =>
                  setForm((f) => ({ ...f, image: e.target.files?.[0] || null }))
                }
              />
              <button
                type="button"
                className="cursor-pointer w-full rounded-[12px] border border-[var(--comp-3)] overflow-hidden"
                onClick={() => fileRef.current?.click()}
              >
                {(form.image || existingImage) ? (
                  <img
                    src={form.image ? getObjectUrl(form.image) : existingImage}
                    alt=""
                    className="w-full aspect-video object-cover"
                  />
                ) : (
                  <span className="block py-10 text-sm text-[var(--dark-3)]">
                    Upload cover image
                  </span>
                )}
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="post-yt">YouTube URL</Label>
              <Input
                id="post-yt"
                value={form.ytLink}
                onChange={(e) =>
                  setForm((f) => ({ ...f, ytLink: e.target.value }))
                }
                placeholder="https://youtube.com/watch?v=..."
              />
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="post-status">Status</Label>
            <select
              id="post-status"
              className="w-full h-9 rounded-md border border-[var(--comp-3)] bg-transparent px-3 text-sm"
              value={form.status}
              onChange={(e) =>
                setForm((f) => ({ ...f, status: e.target.value }))
              }
            >
              <option value="active">active</option>
              <option value="inactive">inactive</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label>Availability</Label>
            <SelectMultiple
              options={availabilityOptions}
              value={form.availability}
              onChange={(value) =>
                setForm((f) => ({ ...f, availability: value }))
              }
            />
          </div>
          <Button
            variant="wz"
            className="w-full cursor-pointer"
            disabled={saving}
            onClick={handleSave}
          >
            {saving ? "Saving..." : editing ? "Update Post" : "Create Post"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
