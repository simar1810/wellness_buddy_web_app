"use client";

import { Play, Pencil, Trash2 } from "lucide-react";
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  rectSortingStrategy,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import DualOptionActionModal from "@/components/modals/DualOptionActionModal";
import { AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { postCover } from "@/lib/tool-tabs";
import {
  MoveButtons,
  SortableHandle,
} from "@/components/custom-tools/SortableHandle";

export default function ToolPostGrid({
  posts,
  isSystemLeader = false,
  canReorder = false,
  onReorder,
  onPreview,
  onEdit,
  onDelete,
}) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  function handleDragEnd(event) {
    const { active, over } = event;
    if (!over || active.id === over.id || !onReorder) return;
    const ids = posts.map((post) => post._id);
    const oldIndex = ids.indexOf(active.id);
    const newIndex = ids.indexOf(over.id);
    if (oldIndex < 0 || newIndex < 0) return;
    onReorder(arrayMove(ids, oldIndex, newIndex));
  }

  function movePost(index, direction) {
    if (!onReorder) return;
    const ids = posts.map((post) => post._id);
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= ids.length) return;
    onReorder(arrayMove(ids, index, nextIndex));
  }

  const grid = (
    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
      {posts.map((post, index) =>
        canReorder ? (
          <SortablePostCard
            key={post._id}
            post={post}
            index={index}
            lastIndex={posts.length - 1}
            isSystemLeader={isSystemLeader}
            canReorder
            onMove={movePost}
            onPreview={onPreview}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ) : (
          <PostCard
            key={post._id}
            post={post}
            index={index}
            lastIndex={posts.length - 1}
            isSystemLeader={isSystemLeader}
            canReorder={false}
            onPreview={onPreview}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        )
      )}
    </div>
  );

  if (!canReorder) return grid;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={posts.map((post) => post._id)}
        strategy={rectSortingStrategy}
      >
        {grid}
      </SortableContext>
    </DndContext>
  );
}

function SortablePostCard({ post, ...rest }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: post._id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
    zIndex: isDragging ? 10 : undefined,
  };
  return (
    <div ref={setNodeRef} style={style}>
      <PostCard
        post={post}
        handleProps={{ attributes, listeners }}
        {...rest}
      />
    </div>
  );
}

function PostCard({
  post,
  index,
  lastIndex,
  isSystemLeader,
  canReorder,
  onMove,
  onPreview,
  onEdit,
  onDelete,
  handleProps,
}) {
  const cover = postCover(post);
  const isYoutube = post.mediaType === "youtube";
  return (
    <div className="rounded-[14px] overflow-hidden bg-[var(--comp-2)] border border-[var(--comp-3)]">
      <div className="relative">
        {canReorder && (
          <div className="absolute top-2 left-2 z-10 rounded-md bg-black/50 text-white">
            <SortableHandle
              className="hover:bg-white/10"
              attributes={handleProps?.attributes}
              listeners={handleProps?.listeners}
            />
          </div>
        )}
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
      </div>
      <div className="p-4 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold leading-snug line-clamp-2">
            {post.title}
          </h3>
          {isSystemLeader && (
            <div className="flex items-start gap-1 shrink-0">
              {canReorder && (
                <MoveButtons
                  index={index}
                  lastIndex={lastIndex}
                  onMove={onMove}
                />
              )}
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
}
