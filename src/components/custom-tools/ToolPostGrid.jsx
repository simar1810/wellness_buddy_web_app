"use client";

import { Play, Pencil, Trash2 } from "lucide-react";
import DualOptionActionModal from "@/components/modals/DualOptionActionModal";
import { AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { postCover } from "@/lib/tool-tabs";

export default function ToolPostGrid({
  posts,
  isSystemLeader = false,
  onPreview,
  onEdit,
  onDelete,
}) {
  return (
    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
      {posts.map((post) => {
        const cover = postCover(post);
        const isYoutube = post.mediaType === "youtube";
        return (
          <div
            key={post._id}
            className="rounded-[14px] overflow-hidden bg-[var(--dark-4)] border border-[var(--comp-3)]"
          >
            <button
              type="button"
              className="relative w-full aspect-video group cursor-pointer"
              onClick={() => onPreview(post)}
            >
              {cover ? (
                <img
                  src={cover}
                  alt={post.title}
                  className="w-full h-full object-cover opacity-90"
                />
              ) : (
                <span className="block w-full h-full bg-[var(--comp-2)]" />
              )}
              {isYoutube && (
                <span className="absolute inset-0 flex items-center justify-center bg-black/35">
                  <span className="rounded-full bg-[var(--accent-1)] p-3">
                    <Play className="text-white w-6 h-6" />
                  </span>
                </span>
              )}
            </button>
            <div className="p-4 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-semibold leading-snug line-clamp-2">
                  {post.title}
                </h3>
                {isSystemLeader && (
                  <div className="flex gap-1 shrink-0">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="cursor-pointer"
                      onClick={() => onEdit(post)}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <DualOptionActionModal
                      title={`Delete ${post.title}?`}
                      description="This cannot be undone."
                      action={async (setLoading, btnRef) => {
                        try {
                          setLoading(true);
                          await onDelete(post._id);
                          btnRef?.current?.click();
                        } finally {
                          setLoading(false);
                        }
                      }}
                    >
                      <AlertDialogTrigger asChild>
                        <Button size="icon" variant="ghost" className="cursor-pointer">
                          <Trash2 className="w-4 h-4 text-red-400" />
                        </Button>
                      </AlertDialogTrigger>
                    </DualOptionActionModal>
                  </div>
                )}
              </div>
              {post.description && (
                <p className="text-sm text-[var(--dark-3)] line-clamp-2">
                  {post.description}
                </p>
              )}
              <Badge variant="wz" className="capitalize">
                {post.mediaType}
              </Badge>
            </div>
          </div>
        );
      })}
    </div>
  );
}
