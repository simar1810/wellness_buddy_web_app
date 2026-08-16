"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import useSWR, { mutate } from "swr";
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
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Layers, Plus, Search, Download } from "lucide-react";
import { toast } from "sonner";
import ContentError from "@/components/common/ContentError";
import DualOptionActionModal from "@/components/modals/DualOptionActionModal";
import { AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { sendData } from "@/lib/api";
import { getToolTabs } from "@/lib/fetchers/app";
import { downloadCsv } from "@/lib/tool-tabs";
import { useAppSelector } from "@/providers/global/hooks";
import ToolTabFormDialog from "@/components/custom-tools/ToolTabFormDialog";
import {
  MoveButtons,
  SortableHandle,
} from "@/components/custom-tools/SortableHandle";
import { ShieldAlert, Pencil, Trash2 } from "lucide-react";

function TabTableSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="h-14 rounded-[12px] bg-[var(--comp-2)] animate-pulse"
        />
      ))}
    </div>
  );
}

function CoachCustomTabsPageInner() {
  const coach = useAppSelector((state) => state.coach.data);
  const isSystemLeader = coach?.clubType === "System Leader";
  const router = useRouter();
  const searchParams = useSearchParams();

  const q = searchParams.get("q") || "";
  const status = searchParams.get("status") || "all";
  const sort = searchParams.get("sort") || "order";

  const { isLoading, error, data } = useSWR("catalog-tool-tabs", () =>
    getToolTabs("coach", 1, 50)
  );

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [selected, setSelected] = useState([]);
  const [query, setQuery] = useState(q);
  const [savingOrder, setSavingOrder] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  useEffect(() => {
    const t = setTimeout(() => {
      const next = new URLSearchParams(searchParams.toString());
      if (query) next.set("q", query);
      else next.delete("q");
      router.replace(`?${next.toString()}`, { scroll: false });
    }, 280);
    return () => clearTimeout(t);
  }, [query]);

  function setParam(key, value) {
    const next = new URLSearchParams(searchParams.toString());
    if (!value || value === "all") next.delete(key);
    else next.set(key, value);
    router.replace(`?${next.toString()}`, { scroll: false });
  }

  const tabs = data?.data || [];
  const filtered = useMemo(() => {
    let rows = tabs;
    if (q) {
      const needle = q.toLowerCase();
      rows = rows.filter(
        (tab) =>
          tab.name?.toLowerCase().includes(needle) ||
          tab.description?.toLowerCase().includes(needle)
      );
    }
    if (status !== "all") {
      rows = rows.filter((tab) => tab.status === status);
    }
    const copy = [...rows];
    if (sort === "name") copy.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
    else if (sort === "updated") {
      copy.sort(
        (a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0)
      );
    } else {
      copy.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
    }
    return copy;
  }, [tabs, q, status, sort]);

  if (!isSystemLeader) {
    return (
      <div className="content-container content-height-screen !mt-0 flex items-center justify-center">
        <div className="text-center space-y-4">
          <ShieldAlert className="mx-auto h-10 w-10 text-[var(--dark-3)]" />
          <h2 className="text-lg font-semibold">Access Restricted</h2>
          <p className="text-sm text-[var(--dark-3)] max-w-sm">
            Only a System Leader can create Custom Tools tabs.
          </p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="content-container content-height-screen">
        <TabTableSkeleton />
      </div>
    );
  }
  if (error || data?.status_code !== 200) {
    return <ContentError title={error || data?.message} />;
  }

  async function handleDelete(toolTabId, name) {
    const response = await sendData("app/tool-tabs", { toolTabId }, "DELETE");
    if (response?.status_code !== 200) {
      throw new Error(response?.message || "Failed to delete");
    }
    toast.success(`Deleted ${name}`);
    mutate("catalog-tool-tabs");
    mutate("sidebar-tool-tabs");
  }

  async function bulkStatus(nextStatus, ids = selected) {
    const response = await sendData(
      "app/tool-tabs/bulk",
      { toolTabIds: ids, status: nextStatus },
      "PUT"
    );
    if (response?.status_code !== 200) {
      throw new Error(response?.message || "Bulk update failed");
    }
    mutate("catalog-tool-tabs");
    mutate("sidebar-tool-tabs");
    setSelected([]);
    if (nextStatus === "inactive") {
      toast("Marked inactive", {
        action: {
          label: "Undo",
          onClick: () => bulkStatus("active", ids),
        },
        duration: 8000,
      });
    } else {
      toast.success("Updated");
    }
  }

  async function persistTabOrder(nextIds) {
    const previous = tabs;
    mutate(
      "catalog-tool-tabs",
      (current) => {
        if (!current?.data) return current;
        const map = new Map(current.data.map((tab) => [tab._id, tab]));
        const reordered = nextIds
          .map((id, index) =>
            map.has(id) ? { ...map.get(id), sortOrder: index } : null
          )
          .filter(Boolean);
        const leftover = current.data.filter((tab) => !nextIds.includes(tab._id));
        return { ...current, data: [...reordered, ...leftover] };
      },
      false
    );
    try {
      setSavingOrder(true);
      const response = await sendData(
        "app/tool-tabs/reorder",
        { toolTabIds: nextIds },
        "PUT"
      );
      if (response?.status_code !== 200) {
        throw new Error(response?.message || "Failed to save order");
      }
      mutate("catalog-tool-tabs");
      mutate("sidebar-tool-tabs");
      toast.success("Order saved");
    } catch (err) {
      mutate("catalog-tool-tabs", { ...data, data: previous }, false);
      toast.error(err.message);
    } finally {
      setSavingOrder(false);
    }
  }

  function handleDragEnd(event) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const ids = filtered.map((tab) => tab._id);
    const oldIndex = ids.indexOf(active.id);
    const newIndex = ids.indexOf(over.id);
    if (oldIndex < 0 || newIndex < 0) return;
    persistTabOrder(arrayMove(ids, oldIndex, newIndex));
  }

  function moveTab(index, direction) {
    const ids = filtered.map((tab) => tab._id);
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= ids.length) return;
    persistTabOrder(arrayMove(ids, index, nextIndex));
  }

  const canReorder = !q && status === "all" && sort === "order";

  const allSelected =
    filtered.length > 0 && filtered.every((tab) => selected.includes(tab._id));

  return (
    <div className="content-container content-height-screen">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
            <Layers className="w-5 h-5 text-[var(--accent-1)]" />
            Custom Tools
          </h1>
          <p className="text-sm text-[var(--dark-3)] mt-1">
            Create Tools tabs, then post images or YouTube videos with the same
            visibility rules as Events.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="wz_outline"
            className="cursor-pointer"
            onClick={() =>
              downloadCsv(
                "custom-tool-tabs.csv",
                filtered.map((tab) => ({
                  name: tab.name,
                  status: tab.status,
                  posts: tab.postCount,
                  availability: (tab.availability || []).join(" | "),
                })),
                [
                  { key: "name", label: "Name" },
                  { key: "status", label: "Status" },
                  { key: "posts", label: "Posts" },
                  { key: "availability", label: "Availability" },
                ]
              )
            }
          >
            <Download className="w-4 h-4" />
            Export CSV
          </Button>
          <Button
            variant="wz"
            className="cursor-pointer"
            onClick={() => {
              setEditing(null);
              setOpen(true);
            }}
          >
            <Plus className="w-4 h-4" />
            Add Tab
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 mb-4">
        <div className="relative min-w-[220px] flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--dark-3)]" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search tabs"
            className="pl-9"
          />
        </div>
        <select
          className="h-9 rounded-md border border-[var(--comp-3)] bg-transparent px-3 text-sm cursor-pointer"
          value={status}
          onChange={(e) => setParam("status", e.target.value)}
        >
          <option value="all">All statuses</option>
          <option value="active">active</option>
          <option value="inactive">inactive</option>
        </select>
        <select
          className="h-9 rounded-md border border-[var(--comp-3)] bg-transparent px-3 text-sm cursor-pointer"
          value={sort}
          onChange={(e) => setParam("sort", e.target.value)}
        >
          <option value="order">Sort: order</option>
          <option value="name">Sort: name</option>
          <option value="updated">Sort: updated</option>
        </select>
      </div>
      <p className="text-xs text-[var(--dark-3)] mb-4">
        {canReorder
          ? "Drag the grip or use the arrows to change the tab order."
          : "Clear search and status, and sort by order, to rearrange tabs."}
      </p>

      {selected.length > 0 && (
        <div className="mb-4 flex items-center gap-3 rounded-[12px] border border-[var(--comp-3)] bg-[var(--comp-2)] p-3">
          <span className="text-sm tabular-nums">{selected.length} selected</span>
          <Button
            size="sm"
            variant="wz_outline"
            className="cursor-pointer"
            onClick={() => bulkStatus("inactive")}
          >
            Mark inactive
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="cursor-pointer"
            onClick={() => setSelected([])}
          >
            Clear
          </Button>
        </div>
      )}

      {tabs.length === 0 ? (
        <div className="text-center py-16 rounded-[12px] bg-[var(--comp-2)] border border-[var(--comp-3)]">
          <p className="text-[var(--dark-3)] mb-4">No custom tools yet.</p>
          <Button
            variant="wz"
            className="cursor-pointer"
            onClick={() => {
              setEditing(null);
              setOpen(true);
            }}
          >
            Create the first tab
          </Button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 rounded-[12px] bg-[var(--comp-2)] border border-[var(--comp-3)]">
          <p className="text-[var(--dark-3)] mb-4">No matches for these filters.</p>
          <Button
            variant="wz_outline"
            className="cursor-pointer"
            onClick={() => {
              setQuery("");
              router.replace("?");
            }}
          >
            Clear filters
          </Button>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10">
                <Checkbox
                  checked={allSelected}
                  onCheckedChange={(checked) =>
                    setSelected(checked ? filtered.map((tab) => tab._id) : [])
                  }
                />
              </TableHead>
              <TableHead className="w-16">Order</TableHead>
              <TableHead>Tab</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right tabular-nums">Posts</TableHead>
              <TableHead>Availability</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {canReorder ? (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={filtered.map((tab) => tab._id)}
                  strategy={verticalListSortingStrategy}
                >
                  {filtered.map((tab, index) => (
                    <SortableTabRow
                      key={tab._id}
                      tab={tab}
                      index={index}
                      lastIndex={filtered.length - 1}
                      canReorder={canReorder}
                      savingOrder={savingOrder}
                      selected={selected}
                      setSelected={setSelected}
                      router={router}
                      onMove={moveTab}
                      onEdit={() => {
                        setEditing(tab);
                        setOpen(true);
                      }}
                      onDelete={handleDelete}
                    />
                  ))}
                </SortableContext>
              </DndContext>
            ) : (
              filtered.map((tab, index) => (
                <TabRow
                  key={tab._id}
                  tab={tab}
                  index={index}
                  lastIndex={filtered.length - 1}
                  canReorder={false}
                  savingOrder={savingOrder}
                  selected={selected}
                  setSelected={setSelected}
                  router={router}
                  onMove={moveTab}
                  onEdit={() => {
                    setEditing(tab);
                    setOpen(true);
                  }}
                  onDelete={handleDelete}
                />
              ))
            )}
          </TableBody>
        </Table>
      )}

      <ToolTabFormDialog
        open={open}
        onOpenChange={setOpen}
        editing={editing}
        onSaved={() => {
          mutate("catalog-tool-tabs");
          mutate("sidebar-tool-tabs");
        }}
      />
    </div>
  );
}

function SortableTabRow(props) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: props.tab._id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.55 : 1,
    position: "relative",
    zIndex: isDragging ? 10 : undefined,
  };
  return (
    <TabRow
      {...props}
      rowRef={setNodeRef}
      style={style}
      handleProps={{ attributes, listeners }}
    />
  );
}

function TabRow({
  tab,
  index,
  lastIndex,
  canReorder,
  savingOrder,
  selected,
  setSelected,
  router,
  onMove,
  onEdit,
  onDelete,
  rowRef,
  style,
  handleProps,
}) {
  return (
    <tr
      ref={rowRef}
      style={style}
      className="hover:bg-muted/50 data-[state=selected]:bg-muted border-b transition-colors"
    >
      <TableCell>
        <Checkbox
          checked={selected.includes(tab._id)}
          onCheckedChange={(checked) =>
            setSelected((prev) =>
              checked ? [...prev, tab._id] : prev.filter((id) => id !== tab._id)
            )
          }
        />
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-1 text-[var(--dark-3)]">
          <SortableHandle
            disabled={!canReorder || savingOrder}
            attributes={handleProps?.attributes}
            listeners={handleProps?.listeners}
          />
          <MoveButtons
            index={index}
            lastIndex={lastIndex}
            disabled={!canReorder || savingOrder}
            onMove={onMove}
          />
        </div>
      </TableCell>
      <TableCell>
        <button
          type="button"
          className="flex items-center gap-3 cursor-pointer text-left"
          onClick={() => router.push(`/coach/tools/custom-tabs/${tab._id}`)}
        >
          <img
            src={tab.icon}
            alt=""
            className="h-10 w-10 rounded-full object-cover shrink-0"
          />
          <span>
            <span className="block font-medium line-clamp-1 max-w-[28ch]">
              {tab.name}
            </span>
            {tab.description && (
              <span className="block text-xs text-[var(--dark-3)] line-clamp-1 max-w-[36ch]">
                {tab.description}
              </span>
            )}
          </span>
        </button>
      </TableCell>
      <TableCell>
        <Badge variant={tab.status === "active" ? "wz_fill" : "wz"}>
          {tab.status}
        </Badge>
      </TableCell>
      <TableCell className="text-right tabular-nums">
        {tab.postCount || 0}
      </TableCell>
      <TableCell className="text-xs text-[var(--dark-3)] max-w-[24ch] truncate">
        {(tab.availability || []).join(", ") || "—"}
      </TableCell>
      <TableCell className="text-right">
        <div className="inline-flex">
          <Button
            size="icon"
            variant="ghost"
            className="cursor-pointer"
            onClick={onEdit}
          >
            <Pencil className="w-4 h-4" />
          </Button>
          <DualOptionActionModal
            title={`Delete ${tab.name}?`}
            description="This also deletes every post in the tab. This cannot be undone."
            action={async (setLoading, btnRef) => {
              try {
                setLoading(true);
                await onDelete(tab._id, tab.name);
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
      </TableCell>
    </tr>
  );
}

export default function CoachCustomTabsPage() {
  return (
    <Suspense fallback={<TabTableSkeleton />}>
      <CoachCustomTabsPageInner />
    </Suspense>
  );
}
