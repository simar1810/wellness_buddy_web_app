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
  name: "",
  description: "",
  icon: null,
  status: "active",
  availability: [],
};

export default function ToolTabFormDialog({
  open,
  onOpenChange,
  editing,
  onSaved,
}) {
  const availabilityOptions = useAvailabilityOptions();
  const fileRef = useRef(null);
  const [form, setForm] = useState(emptyForm);
  const [existingIcon, setExistingIcon] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (editing) {
      setForm({
        name: editing.name || "",
        description: editing.description || "",
        icon: null,
        status: editing.status || "active",
        availability: checkArray(editing.availability),
      });
      setExistingIcon(editing.icon || "");
    } else {
      setForm(emptyForm);
      setExistingIcon("");
    }
  }, [open, editing]);

  async function handleSave() {
    try {
      if (!form.name?.trim() || form.name.trim().length < 3) {
        throw new Error("Tab name must be at least 3 characters");
      }
      setSaving(true);
      const payload = {
        name: form.name.trim(),
        description: form.description || "",
        status: form.status || "active",
        availability: checkArray(form.availability),
      };
      if (editing) payload.toolTabId = editing._id;

      if (form.icon) {
        const uploadToast = toast.loading("Uploading icon.");
        const compressed = await imageCompression(form.icon, {
          maxSizeMB: 0.4,
          maxWidthOrHeight: 800,
          useWebWorker: true,
        });
        const upload = await uploadImage(compressed);
        toast.dismiss(uploadToast);
        if (upload instanceof Error || !upload?.img) {
          throw new Error(upload?.message || "Icon upload failed");
        }
        payload.icon = upload.img;
      } else if (editing && existingIcon) {
        payload.icon = existingIcon;
      }

      if (!payload.icon) throw new Error("Please upload a tab icon");

      const response = await sendData(
        "app/tool-tabs",
        payload,
        editing ? "PUT" : "POST"
      );
      if (response instanceof Error || response?.status_code !== 200) {
        throw new Error(response?.message || "Failed to save tab");
      }
      toast.success(editing ? "Tab updated" : "Tab created");
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
        <DialogTitle>{editing ? "Edit Tool Tab" : "Create Tool Tab"}</DialogTitle>
        <div className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label htmlFor="tab-name">Name</Label>
            <Input
              id="tab-name"
              value={form.name}
              maxLength={40}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="e.g. Training Videos / ट्रेनिंग वीडियो"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tab-desc">Description</Label>
            <Textarea
              id="tab-desc"
              value={form.description}
              maxLength={2000}
              onChange={(e) =>
                setForm((f) => ({ ...f, description: e.target.value }))
              }
              placeholder="What this Tools tab contains"
            />
          </div>
          <div className="space-y-2">
            <Label>Icon</Label>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) =>
                setForm((f) => ({ ...f, icon: e.target.files?.[0] || null }))
              }
            />
            <button
              type="button"
              className="cursor-pointer flex items-center gap-3 rounded-[12px] border border-[var(--comp-3)] bg-[var(--comp-2)] p-3 w-full text-left hover:border-[var(--accent-1)]"
              onClick={() => fileRef.current?.click()}
            >
              {(form.icon || existingIcon) ? (
                <img
                  src={form.icon ? getObjectUrl(form.icon) : existingIcon}
                  alt=""
                  className="h-11 w-11 rounded-full object-cover"
                />
              ) : (
                <span className="h-11 w-11 rounded-full bg-[var(--dark-3)]" />
              )}
              <span className="text-sm text-[var(--dark-3)]">
                Tap to upload a square icon
              </span>
            </button>
          </div>
          <div className="space-y-2">
            <Label htmlFor="tab-status">Status</Label>
            <select
              id="tab-status"
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
            {saving ? "Saving..." : editing ? "Update Tab" : "Create Tab"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
