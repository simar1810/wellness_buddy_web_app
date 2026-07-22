"use client";

import ContentError from "@/components/common/ContentError";
import ContentLoader from "@/components/common/ContentLoader";
import YouTubeEmbed from "@/components/common/YoutubeEmbed";
import { getExclusiveSessions } from "@/lib/fetchers/app";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { youtubeVideoId } from "@/lib/utils";
import { Play } from "lucide-react";
import { useState } from "react";
import useSWR from "swr";

function thumbFromLink(url) {
  const id = youtubeVideoId(url);
  return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : "/not-found.png";
}

export default function ClientExclusiveSessionsPage() {
  const { isLoading, error, data } = useSWR("client-exclusive-sessions", () =>
    getExclusiveSessions("client")
  );
  const [preview, setPreview] = useState(null);

  if (isLoading) return <ContentLoader />;
  if (error || data?.status_code !== 200) {
    return <ContentError title={error || data?.message} />;
  }

  const sessions = data?.data || [];

  return (
    <div className="content-container content-height-screen">
      <h1 className="text-2xl font-semibold mb-2">Exclusive Sessions</h1>
      <p className="text-sm text-[var(--dark-3)] mb-6">
        Curated YouTube sessions — watch them here in the portal.
      </p>

      {sessions.length === 0 ? (
        <div className="text-center py-16 text-[var(--dark-3)]">
          No exclusive sessions available for you yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {sessions.map((session) => (
            <div
              key={session._id}
              className="rounded-[14px] overflow-hidden bg-[#0f1a12] border border-[var(--comp-3)]"
            >
              <button
                type="button"
                className="relative w-full aspect-video"
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
              <div className="p-4 space-y-1">
                <h3 className="font-semibold text-white">{session.title}</h3>
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

      <Dialog open={!!preview} onOpenChange={() => setPreview(null)}>
        <DialogContent className="max-w-3xl">
          <DialogTitle>{preview?.title}</DialogTitle>
          {preview?.url && <YouTubeEmbed link={preview.url} />}
        </DialogContent>
      </Dialog>
    </div>
  );
}
