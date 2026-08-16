"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import useSWR, { mutate } from "swr";
import { ArrowLeft, Download, Plus } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import ContentError from "@/components/common/ContentError";
import ContentLoader from "@/components/common/ContentLoader";
import YouTubeEmbed from "@/components/common/YoutubeEmbed";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { sendData } from "@/lib/api";
import { getToolTab } from "@/lib/fetchers/app";
import { downloadCsv } from "@/lib/tool-tabs";
import { useAppSelector } from "@/providers/global/hooks";
import ToolPostFormDialog from "@/components/custom-tools/ToolPostFormDialog";
import ToolPostGrid from "@/components/custom-tools/ToolPostGrid";

export default function CoachCustomTabDetailPage() {
  const { tabId } = useParams();
  const coach = useAppSelector((state) => state.coach.data);
  const isSystemLeader = coach?.clubType === "System Leader";
  const cacheKey = `catalog-tool-tab-${tabId}`;

  const { isLoading, error, data } = useSWR(cacheKey, () =>
    getToolTab(tabId, "coach", 1, 50)
  );

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [preview, setPreview] = useState(null);

  if (isLoading) return <ContentLoader />;
  if (error || data?.status_code !== 200) {
    return <ContentError title={error || data?.message} />;
  }

  const tab = data?.data?.tab;
  const posts = data?.data?.posts || [];

  async function handleDelete(toolTabPostId) {
    const response = await sendData(
      "app/tool-tab-posts",
      { toolTabPostId },
      "DELETE"
    );
    if (response?.status_code !== 200) {
      throw new Error(response?.message || "Failed to delete");
    }
    toast.success("Post deleted");
    mutate(cacheKey);
    mutate("catalog-tool-tabs");
  }

  async function persistPostOrder(nextIds) {
    const previous = posts;
    mutate(
      cacheKey,
      (current) => {
        if (!current?.data?.posts) return current;
        const map = new Map(current.data.posts.map((post) => [post._id, post]));
        return {
          ...current,
          data: {
            ...current.data,
            posts: nextIds
              .map((id, index) =>
                map.has(id) ? { ...map.get(id), sortOrder: index } : null
              )
              .filter(Boolean),
          },
        };
      },
      false
    );
    try {
      const response = await sendData(
        "app/tool-tab-posts/reorder",
        { toolTabPostIds: nextIds },
        "PUT"
      );
      if (response?.status_code !== 200) {
        throw new Error(response?.message || "Failed to save order");
      }
      mutate(cacheKey);
      toast.success("Order saved");
    } catch (err) {
      mutate(
        cacheKey,
        { ...data, data: { ...data?.data, posts: previous } },
        false
      );
      toast.error(err.message);
    }
  }

  return (
    <div className="content-container content-height-screen">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex items-start gap-3">
          <Link href="/coach/tools/custom-tabs" className="pt-1">
            {isSystemLeader && (
              <ArrowLeft className="w-5 h-5 text-[var(--dark-3)]" />
            )}
          </Link>
          <div className="flex items-center gap-3">
            {tab?.icon && (
              <img
                src={tab.icon}
                alt=""
                className="h-11 w-11 rounded-full object-cover"
              />
            )}
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">
                {tab?.name}
              </h1>
              {tab?.description && (
                <p className="text-sm text-[var(--dark-3)] mt-1 max-w-xl">
                  {tab.description}
                </p>
              )}
              {isSystemLeader && posts.length > 1 && (
                <p className="text-xs text-[var(--dark-3)] mt-2">
                  Drag the grip on a card to change post order.
                </p>
              )}
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="wz_outline"
            className="cursor-pointer"
            onClick={() =>
              downloadCsv(
                `${tab?.name || "tab"}-posts.csv`,
                posts.map((post) => ({
                  title: post.title,
                  mediaType: post.mediaType,
                  status: post.status,
                  availability: (post.availability || []).join(" | "),
                })),
                [
                  { key: "title", label: "Title" },
                  { key: "mediaType", label: "Media" },
                  { key: "status", label: "Status" },
                  { key: "availability", label: "Availability" },
                ]
              )
            }
          >
            <Download className="w-4 h-4" />
            Export
          </Button>
          {isSystemLeader && (
            <Button
              variant="wz"
              className="cursor-pointer"
              onClick={() => {
                setEditing(null);
                setOpen(true);
              }}
            >
              <Plus className="w-4 h-4" />
              Add Post
            </Button>
          )}
        </div>
      </div>

      {posts.length === 0 ? (
        <div className="text-center py-16 rounded-[12px] bg-[var(--comp-2)] border border-[var(--comp-3)]">
          <p className="text-[var(--dark-3)] mb-4">
            No posts in this tab yet.
          </p>
          {isSystemLeader && (
            <Button
              variant="wz"
              className="cursor-pointer"
              onClick={() => {
                setEditing(null);
                setOpen(true);
              }}
            >
              Add the first post
            </Button>
          )}
        </div>
      ) : (
        <ToolPostGrid
          posts={posts}
          isSystemLeader={isSystemLeader}
          canReorder={isSystemLeader && posts.length > 1}
          onReorder={persistPostOrder}
          onPreview={(post) => setPreview(post)}
          onEdit={(post) => {
            setEditing(post);
            setOpen(true);
          }}
          onDelete={handleDelete}
        />
      )}

      {isSystemLeader && (
        <ToolPostFormDialog
          open={open}
          onOpenChange={setOpen}
          tabId={tabId}
          editing={editing}
          onSaved={() => {
            mutate(cacheKey);
            mutate("catalog-tool-tabs");
            mutate("sidebar-tool-tabs");
          }}
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
