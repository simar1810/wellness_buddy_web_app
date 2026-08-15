"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import useSWR from "swr";
import ContentError from "@/components/common/ContentError";
import ContentLoader from "@/components/common/ContentLoader";
import YouTubeEmbed from "@/components/common/YoutubeEmbed";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { getToolTab } from "@/lib/fetchers/app";
import ToolPostGrid from "@/components/custom-tools/ToolPostGrid";

export default function ClientCustomTabPage() {
  const { tabId } = useParams();
  const { isLoading, error, data } = useSWR(
    `client-tool-tab-${tabId}`,
    () => getToolTab(tabId, "client", 1, 50)
  );
  const [preview, setPreview] = useState(null);

  if (isLoading) return <ContentLoader />;
  if (error || data?.status_code !== 200) {
    return <ContentError title={error || data?.message} />;
  }

  const tab = data?.data?.tab;
  const posts = data?.data?.posts || [];

  return (
    <div className="content-container content-height-screen">
      <div className="flex items-center gap-3 mb-6">
        {tab?.icon && (
          <img
            src={tab.icon}
            alt=""
            className="h-11 w-11 rounded-full object-cover"
          />
        )}
        <div>
          <h1 className="text-2xl font-semibold">{tab?.name}</h1>
          {tab?.description && (
            <p className="text-sm text-[var(--dark-3)] mt-1">
              {tab.description}
            </p>
          )}
        </div>
      </div>

      {posts.length === 0 ? (
        <div className="text-center py-16 text-[var(--dark-3)]">
          Nothing in this tab for you yet.
        </div>
      ) : (
        <ToolPostGrid
          posts={posts}
          onPreview={(post) => setPreview(post)}
        />
      )}

      <Dialog open={!!preview} onOpenChange={() => setPreview(null)}>
        <DialogContent className="max-w-3xl">
          <DialogTitle>{preview?.title}</DialogTitle>
          {preview?.mediaType === "youtube" && preview?.ytLink ? (
            <YouTubeEmbed link={preview.ytLink} />
          ) : preview?.image ? (
            <img
              src={preview.image}
              alt={preview.title}
              className="w-full rounded-[12px]"
            />
          ) : null}
          {preview?.description && (
            <p className="text-sm text-[var(--dark-3)]">{preview.description}</p>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
