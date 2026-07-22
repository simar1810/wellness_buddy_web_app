"use client";

import { useMemo, useState } from "react";
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
import { sendData } from "@/lib/api";
import { getExclusiveSessions } from "@/lib/fetchers/app";
import { useAppSelector } from "@/providers/global/hooks";
import { youtubeVideoId } from "@/lib/utils";
import { Pencil, Play, Plus, Trash2, Sparkles } from "lucide-react";
import { toast } from "sonner";

const emptyForm = {
  title: "",
  description: "",
  ytLink: "",
  thumbnail: "",
  status: "active",
  availability: [],
};

function thumbFromLink(url) {
  const id = youtubeVideoId(url);
  return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : "/not-found.png";
}

export default function CoachExclusiveSessionsPage() {
  const coach = useAppSelector((state) => state.coach.data);
  const client_categories = coach?.client_categories || [];
  const isSystemLeader = coach?.clubType === "System Leader";

  const { isLoading, error, data } = useSWR("catalog-exclusive-sessions", () =>
    getExclusiveSessions("coach")
  );

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState(null);

  const availabilityOptions = useMemo(
    () => [
      { id: 1, name: "All Client", value: "client" },
      { id: 2, name: "Coach", value: "coach" },
      ...client_categories.map((category, index) => ({
        id: index + 3,
        name: category.name,
        value: category.name,
      })),
    ],
    [client_categories]
  );

  if (isLoading) return <ContentLoader />;
  if (error || data?.status_code !== 200) {
    return <ContentError title={error || data?.message} />;
  }

  const sessions = data?.data || [];

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setOpen(true);
  }

  function openEdit(session) {
    setEditing(session);
    setForm({
      title: session.title || "",
      description: session.description || "",
      ytLink: session.ytLink || "",
      thumbnail: session.thumbnail || "",
      status: session.status || "active",
      availability: session.availability || [],
    });
    setOpen(true);
  }

  async function handleSave() {
    try {
      if (!form.title?.trim()) throw new Error("Title is required");
      if (!form.ytLink?.trim()) throw new Error("YouTube link is required");

      setSaving(true);
      const payload = {
        title: form.title,
        description: form.description,
        ytLink: form.ytLink,
        thumbnail: form.thumbnail || undefined,
        status: form.status || "active",
        availability: form.availability || [],
      };
      if (editing) payload.exclusiveSessionId = editing._id;

      const response = await sendData(
        "app/exclusive-sessions",
        payload,
        editing ? "PUT" : "POST"
      );
      if (response.status_code !== 200) {
        throw new Error(response.message || "Failed to save session");
      }

      toast.success(editing ? "Session updated" : "Session created");
      setOpen(false);
      mutate("catalog-exclusive-sessions");
    } catch (err) {
      toast.error(err.message || "Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(exclusiveSessionId) {
    try {
      const response = await sendData(
        "app/exclusive-sessions",
        { exclusiveSessionId },
        "DELETE"
      );
      if (response.status_code !== 200) {
        throw new Error(response.message || "Failed to delete");
      }
      toast.success("Session deleted");
      mutate("catalog-exclusive-sessions");
    } catch (err) {
      toast.error(err.message || "Something went wrong");
    }
  }

  return (
    <div className="content-container content-height-screen">
      <div className="flex items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[var(--accent-1)]" />
            Exclusive Sessions
          </h1>
          <p className="text-sm text-[var(--dark-3)] mt-1">
            YouTube sessions played in-app only — targeted by category and coach audience.
          </p>
        </div>
        {isSystemLeader && (
          <Button variant="wz" onClick={openCreate}>
            <Plus className="w-4 h-4" />
            Add Session
          </Button>
        )}
      </div>

      {sessions.length === 0 ? (
        <div className="text-center py-16 rounded-[12px] bg-[var(--comp-2)] border border-[var(--comp-3)]">
          <p className="text-[var(--dark-3)]">No exclusive sessions yet.</p>
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {sessions.map((session) => (
            <div
              key={session._id}
              className="rounded-[14px] overflow-hidden bg-[#0f1a12] border border-[var(--comp-3)]"
            >
              <button
                type="button"
                className="relative w-full aspect-video group"
                onClick={() =>
                  setPreview({ url: session.ytLink, title: session.title })
                }
              >
                <img
                  src={session.thumbnail || thumbFromLink(session.ytLink)}
                  alt={session.title}
                  className="w-full h-full object-cover opacity-90"
                />
                <span className="absolute inset-0 flex items-center justify-center bg-black/35">
                  <span className="rounded-full bg-[var(--accent-1)] p-3">
                    <Play className="text-white w-6 h-6" />
                  </span>
                </span>
              </button>
              <div className="p-4 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold leading-snug text-white">
                    {session.title}
                  </h3>
                  {isSystemLeader && (
                    <div className="flex gap-1 shrink-0">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="text-white/80"
                        onClick={() => openEdit(session)}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <DualOptionActionModal
                        title="Delete exclusive session?"
                        description="This cannot be undone."
                        action={async (setLoading, btnRef) => {
                          try {
                            setLoading(true);
                            await handleDelete(session._id);
                            btnRef?.current?.click();
                          } finally {
                            setLoading(false);
                          }
                        }}
                      >
                        <AlertDialogTrigger asChild>
                          <Button size="icon" variant="ghost">
                            <Trash2 className="w-4 h-4 text-red-400" />
                          </Button>
                        </AlertDialogTrigger>
                      </DualOptionActionModal>
                    </div>
                  )}
                </div>
                {session.description && (
                  <p className="text-sm text-white/70 line-clamp-2">
                    {session.description}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogTitle>
            {editing ? "Edit Exclusive Session" : "Create Exclusive Session"}
          </DialogTitle>
          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                placeholder="Session title"
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Input
                value={form.description}
                onChange={(e) =>
                  setForm((f) => ({ ...f, description: e.target.value }))
                }
                placeholder="Short description"
              />
            </div>
            <div className="space-y-2">
              <Label>YouTube URL *</Label>
              <Input
                value={form.ytLink}
                onChange={(e) => setForm((f) => ({ ...f, ytLink: e.target.value }))}
                placeholder="https://youtube.com/watch?v=..."
              />
            </div>
            <div className="space-y-2">
              <Label>Thumbnail URL (optional)</Label>
              <Input
                value={form.thumbnail}
                onChange={(e) =>
                  setForm((f) => ({ ...f, thumbnail: e.target.value }))
                }
                placeholder="Leave blank to use YouTube thumbnail"
              />
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
              className="w-full"
              disabled={saving}
              onClick={handleSave}
            >
              {saving ? "Saving..." : editing ? "Update Session" : "Create Session"}
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
