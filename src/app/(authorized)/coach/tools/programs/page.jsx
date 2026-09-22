"use client"
import ContentError from "@/components/common/ContentError";
import ContentLoader from "@/components/common/ContentLoader";
import DualOptionActionModal from "@/components/modals/DualOptionActionModal";
import EditProgramModal from "@/components/modals/tools/EditProgramModal";
import BulkUploadDialog from "@/components/bulk/BulkUploadDialog";
import BulkDeleteToolbar from "@/components/bulk/BulkDeleteToolbar";
import { RowCheckbox, SelectAllCheckbox } from "@/components/bulk/bulkSelection";
import { AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { sendData } from "@/lib/api";
import { submitBulkCreate, submitBulkDelete } from "@/lib/bulkCatalog";
import { getClientPrograms } from "@/lib/fetchers/app";
import { DndContext } from "@dnd-kit/core";
import { arrayMove, SortableContext, useSortable } from '@dnd-kit/sortable';
import { Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import useSWR, { mutate } from "swr";
import { CSS } from '@dnd-kit/utilities';
import { Badge } from "@/components/ui/badge";

export default function Page() {
  const [isBeingShuffled, setIsBeingShuffled] = useState(false);
  const [selected, setSelected] = useState([]);
  const { isLoading, error, data } = useSWR("client/programs", getClientPrograms);
  if (isLoading) return <ContentLoader />
  if (error || data?.status_code !== 200) return <ContentError title={error || data?.message} />
  const programs = data.data;
  const programIds = programs.map((p) => p._id);

  return <div className="content-container content-height-screen">
    <div className="mb-10 flex items-center justify-between gap-2 flex-wrap">
      <h2>Programs</h2>
      <div className="flex items-center gap-2 flex-wrap ml-auto">
        {!isBeingShuffled && programs.length > 0 && (
          <div className="flex items-center gap-2 mr-1">
            <SelectAllCheckbox
              ids={programIds}
              selected={selected}
              onChange={setSelected}
            />
            <span className="text-xs text-muted-foreground">Select all</span>
          </div>
        )}
        {!isBeingShuffled && (
          <BulkUploadDialog
            title="Bulk Upload Programs"
            createEmptyRow={() => ({
              name: "",
              subTitle: "",
              link: "",
              image: null,
            })}
            renderRow={(row, _i, onChange) => (
              <div className="space-y-2">
                <Input
                  placeholder="Name"
                  value={row.name}
                  onChange={(e) => onChange({ name: e.target.value })}
                />
                <Input
                  placeholder="Subtitle"
                  value={row.subTitle}
                  onChange={(e) => onChange({ subTitle: e.target.value })}
                />
                <Input
                  placeholder="Link"
                  value={row.link}
                  onChange={(e) => onChange({ link: e.target.value })}
                />
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    onChange({ image: e.target.files?.[0] || null })
                  }
                />
              </div>
            )}
            onSubmit={async (rows) => {
              const result = await submitBulkCreate(
                "app/programs/bulk",
                rows,
                (row, imageUrl) => {
                  if (!row.name?.trim()) {
                    throw new Error("Each row needs a name");
                  }
                  if (!imageUrl) throw new Error("Each row needs an image");
                  return {
                    name: row.name,
                    subTitle: row.subTitle || "",
                    link: row.link || "",
                    image: imageUrl,
                    isActive: true,
                  };
                }
              );
              mutate("client/programs");
              setSelected([]);
              return result;
            }}
          />
        )}
        <Link href="/coach/tools/programs/add" className="bg-green-700 text-white px-4 py-2 rounded-[10px] font-bold">Add</Link>
        {!isBeingShuffled
          ? <Button onClick={() => setIsBeingShuffled(true)} className="font-bold">Shuffle</Button>
          : <Button onClick={() => setIsBeingShuffled(false)} variant="secondary" className="font-bold ">Cancel</Button>}
      </div>
    </div>

    {!isBeingShuffled && (
      <BulkDeleteToolbar
        selectedCount={selected.length}
        label="programs"
        onClear={() => setSelected([])}
        onConfirmDelete={async () => {
          await submitBulkDelete("app/programs/bulk", { programIds: selected });
          setSelected([]);
          mutate("client/programs");
        }}
      />
    )}

    {isBeingShuffled
      ? <ShufflePrograms
        programs={programs}
        setIsBeingShuffled={setIsBeingShuffled}
      />
      : <ProgramList
        programs={programs}
        selected={selected}
        onSelectionChange={setSelected}
      />}
  </div>
}

function ProgramList({ programs, selected = [], onSelectionChange }) {
  return <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
    {programs.map((program, index) => <div
      key={program._id || index}
      className="bg-[var(--comp-1)] rounded-[10px] border-1 overflow-clip hover:[&_.actions]:opacity-100 relative"
    >
      <div className="absolute top-2 left-2 z-10 bg-white/90 rounded p-1 border shadow-sm">
        <RowCheckbox
          id={program._id}
          selected={selected}
          onChange={onSelectionChange}
        />
      </div>
      <div className="relative">
        <div className="absolute bottom-2 right-2 flex items-center gap-1">
          <div className="bg-white px-2 py-1 rounded-[10px] border-1 actions opacity-0 flex items-center gap-1">
            <EditProgramModal program={{ ...program, order: index }} />
            <DeleteProgramAction id={program._id} />
          </div>
          {program.isActive === "true"
            ? <Badge variant="wz_fill">Active</Badge>
            : <Badge variant="destructive">In Active</Badge>}
        </div>
        <Image
          src={program.image || "/not-found.png"}
          onError={e => e.target.src = "/not-found.png"}
          alt=""
          height={400}
          width={400}
          className="h-auto aspect-video object-cover"
        />
      </div>
      <div className="p-4">
        <h2>{program.name}</h2>
        <Link href={program.link || "/"} target="_blank" className="text-green-700 text-[14px] hover:text-underline font-bold">Open Link</Link>
      </div>
    </div>)}
  </div>
}

function ShufflePrograms({ programs, setIsBeingShuffled }) {
  const [programOrder, setProgramOrder] = useState(programs.map(p => p._id));
  const [loading, setLoading] = useState(false);

  function handleDragEnd(event) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = programOrder.indexOf(active.id);
    const newIndex = programOrder.indexOf(over.id);
    setProgramOrder((items) => arrayMove(items, oldIndex, newIndex));
  }

  async function saveProgramsOrder() {
    try {
      setLoading(true);
      const response = await sendData("app/programs", { programOrder }, "PATCH");
      if (response.status_code !== 200) throw new Error(response.message);
      toast.success(response.message);
      mutate("client/programs");
      setIsBeingShuffled(false)
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  }

  return <DndContext onDragEnd={handleDragEnd}>
    <SortableContext items={programOrder}>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {programOrder.map((id) => {
          const program = programs.find(p => p._id === id);
          return <SortableProgram key={id} program={program} />;
        })}
      </div>
    </SortableContext>
    <Button
      variant="wz"
      className="mt-10"
      disabled={loading}
      onClick={saveProgramsOrder}
    >
      Save
    </Button>
  </DndContext>
}

function SortableProgram({ program }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: program._id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    cursor: isDragging ? "grabbing" : "grab",
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <Program program={program} />
    </div>
  );
}

function Program({ program }) {
  return <div
    draggable={true}
    className="bg-[var(--comp-1)] rounded-[10px] border-1 overflow-clip hover:[&_.actions]:opacity-100 animate-wiggle"
  >
    <div>
      <Image
        src={program.image || "/not-found.png"}
        onError={e => e.target.src = "/not-found.png"}
        alt=""
        height={400}
        width={400}
        className="h-auto aspect-video object-cover"
        draggable={false}
      />
    </div>
    <div className="p-4">
      <h2>{program.name}</h2>
    </div>
  </div>
}

function DeleteProgramAction({ id }) {
  async function deleteProgramAction(setLoading, btnRef) {
    try {
      setLoading(true);
      const response = await sendData("app/programs", { programId: id }, "DELETE");
      if (response.status_code !== 200) throw new Error(response.message);
      toast.success(response.message);
      mutate("client/programs");
      btnRef.current.click();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  }

  return <DualOptionActionModal
    action={(setLoading, btnRef) => deleteProgramAction(setLoading, btnRef)}
    description="Are you sure to delete this program?"
  >
    <AlertDialogTrigger>
      <Trash2 className="text-[var(--accent-2)] cursor-pointer w-[18px] h-[18px]" />
    </AlertDialogTrigger>
  </DualOptionActionModal>
}
