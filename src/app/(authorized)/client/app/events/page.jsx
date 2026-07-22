"use client";

import ContentError from "@/components/common/ContentError";
import ContentLoader from "@/components/common/ContentLoader";
import YouTubeEmbed from "@/components/common/YoutubeEmbed";
import { getEvents } from "@/lib/fetchers/app";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { format } from "date-fns";
import { Play } from "lucide-react";
import { useState } from "react";
import useSWR from "swr";

export default function ClientEventsPage() {
  const { isLoading, error, data } = useSWR("client-events", () =>
    getEvents("client")
  );
  const [preview, setPreview] = useState(null);

  if (isLoading) return <ContentLoader />;
  if (error || data?.status_code !== 200) {
    return <ContentError title={error || data?.message} />;
  }

  const events = data?.data || [];

  return (
    <div className="content-container content-height-screen">
      <h1 className="text-2xl font-semibold mb-2">Upcoming Events</h1>
      <p className="text-sm text-[var(--dark-3)] mb-6">
        Images and videos from sessions coming up for you.
      </p>

      {events.length === 0 ? (
        <div className="text-center py-16 text-[var(--dark-3)]">
          No upcoming events right now.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {events.map((event) => (
            <div
              key={event._id}
              className="rounded-[14px] overflow-hidden bg-[var(--comp-2)] border border-[var(--comp-3)]"
            >
              <button
                type="button"
                className="relative w-full aspect-video group"
                onClick={() => {
                  if (event.ytLink) {
                    setPreview({ url: event.ytLink, title: event.title });
                  }
                }}
              >
                <img
                  src={event.image || "/not-found.png"}
                  alt={event.title}
                  className="w-full h-full object-cover"
                />
                {event.ytLink && (
                  <span className="absolute inset-0 flex items-center justify-center bg-black/25 opacity-0 group-hover:opacity-100 transition">
                    <Play className="text-white w-10 h-10" />
                  </span>
                )}
              </button>
              <div className="p-4 space-y-1">
                {event.eventDate && (
                  <p className="text-xs font-medium text-[var(--accent-1)]">
                    {format(new Date(event.eventDate), "MMM d, yyyy")}
                  </p>
                )}
                <h3 className="font-semibold">{event.title}</h3>
                {event.description && (
                  <p className="text-sm text-[var(--dark-3)] line-clamp-3">
                    {event.description}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={!!preview} onOpenChange={() => setPreview(null)}>
        <DialogContent className="max-w-3xl">
          <DialogTitle>{preview?.title}</DialogTitle>
          {preview?.url && <YouTubeEmbed link={preview.url} />}
        </DialogContent>
      </Dialog>
    </div>
  );
}
