"use client";
import AddPostModal from "@/components/modals/AddPostmodal";
import Feeds from "@/components/pages/coach/feed/Feeds";
import FeedsPersonal from "@/components/pages/coach/feed/FeedsPersonal";
import {
  FeedBulkContext,
  useFeedBulk,
} from "@/components/pages/coach/feed/FeedBulkContext";
import BulkUploadDialog from "@/components/bulk/BulkUploadDialog";
import BulkDeleteToolbar from "@/components/bulk/BulkDeleteToolbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { feedDataInitialState } from "@/config/state-data/feed";
import { changeFeedType, feedReducer, paginate } from "@/config/state-reducers/feed";
import { submitBulkCreate, submitBulkDelete } from "@/lib/bulkCatalog";
import useCurrentStateContext, { CurrentStateProvider } from "@/providers/CurrentStateContext";
import { CircleUserRound, Globe, Users } from "lucide-react";
import { useMemo, useState } from "react";
import { mutate } from "swr";

export default function Page() {
  const [selected, setSelected] = useState([]);
  const bulkValue = useMemo(
    () => ({ selected, setSelected, selectable: true }),
    [selected]
  );

  return (
    <FeedBulkContext.Provider value={bulkValue}>
      <CurrentStateProvider
        state={feedDataInitialState}
        reducer={feedReducer}
      >
        <div className="mt-8">
          <Header />
          <BulkFeedToolbar />
          <FeedContainer />
          <FeedPagination />
        </div>
      </CurrentStateProvider>
    </FeedBulkContext.Provider>
  );
}

function Header() {
  const { dispatch, type, page } = useCurrentStateContext();
  const { setSelected } = useFeedBulk();

  return (
    <div className="flex items-center gap-4 pb-4 border-b flex-wrap">
      <Button
        className={`text-[12px] font-bold hover:bg-[var(--accent-1)] hover:text-white rounded-[16px] 
        ${type === "our" ? "bg-[var(--accent-1)] text-white" : "bg-[var(--dark-1)]/10 text-[var(--dark-2)]"}`}
        onClick={() => {
          setSelected([]);
          dispatch(changeFeedType("our"));
        }}
      >
        <Users />
        <p className="hidden md:block">My Community</p>
      </Button>
      <Button
        className={`text-[12px] font-bold hover:bg-[var(--accent-1)] hover:text-white rounded-[16px] 
        ${type === "global" ? "bg-[var(--accent-1)] text-white" : "bg-[var(--dark-1)]/10 text-[var(--dark-2)]"}`}
        onClick={() => {
          setSelected([]);
          dispatch(changeFeedType("global"));
        }}
      >
        <Globe />
        <p className="hidden md:block">Global Community</p>
      </Button>
      <Button
        className={`text-[12px] font-bold hover:bg-[var(--accent-1)] hover:text-white rounded-[16px] 
        ${type === "mine" ? "bg-[var(--accent-1)] text-white" : "bg-[var(--dark-1)]/10 text-[var(--dark-2)]"}`}
        onClick={() => {
          setSelected([]);
          dispatch(changeFeedType("mine"));
        }}
      >
        <CircleUserRound />
        <p className="hidden md:block">My Posts</p>
      </Button>
      <div className="ml-auto flex items-center gap-2">
        <BulkUploadDialog
          title="Bulk Upload Feed Posts"
          createEmptyRow={() => ({
            caption: "",
            image: null,
            contentType: "img",
            type: "our",
          })}
          renderRow={(row, _i, onChange) => (
            <div className="space-y-2">
              <Input
                placeholder="Caption"
                value={row.caption}
                onChange={(e) => onChange({ caption: e.target.value })}
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
              "app/feed/bulk",
              rows,
              (row, imageUrl) => {
                if (!imageUrl) throw new Error("Each row needs an image");
                return {
                  caption: row.caption || "",
                  contentType: "img",
                  images: [imageUrl],
                  type: "our",
                };
              }
            );
            setSelected([]);
            mutate(`app/getAppFeeds?page=${page}&type=our`);
            mutate(`app/getAppFeeds?page=${page}&type=${type}`);
            mutate(`app/my-posts/page=${page}/10000000000`);
            return result;
          }}
        />
        <AddPostModal />
      </div>
    </div>
  );
}

function BulkFeedToolbar() {
  const { selected, setSelected } = useFeedBulk();
  const { page, type } = useCurrentStateContext();

  return (
    <div className="max-w-[650px] mx-auto mt-4">
      <BulkDeleteToolbar
        selectedCount={selected.length}
        label="posts"
        onClear={() => setSelected([])}
        onConfirmDelete={async () => {
          await submitBulkDelete("app/feed/bulk", { postIds: selected });
          setSelected([]);
          mutate(`app/getAppFeeds?page=${page}&type=${type}`);
          mutate(`app/my-posts/page=${page}/10000000000`);
        }}
      />
    </div>
  );
}

function FeedContainer() {
  const { type } = useCurrentStateContext();
  return (
    <div className="max-w-[650px] bg-white mt-10 mx-auto relative border-1 border-b-0 rounded-t-[10px]">
      {type === "mine" ? <FeedsPersonal /> : <Feeds />}
    </div>
  );
}

function FeedPagination() {
  const { page, finalPage, dispatch } = useCurrentStateContext();
  const { setSelected } = useFeedBulk();

  function previous() {
    if (page === 1) return;
    setSelected([]);
    dispatch(paginate(page - 1));
  }

  function next() {
    if (page > finalPage) return;
    setSelected([]);
    dispatch(paginate(page + 1));
  }
  return (
    <Pagination className="my-8">
      <PaginationContent className="gap-4">
        {page > 1 && <PaginationPrevious onClick={previous} />}
        {page > 1 && (
          <PaginationItem className="cursor-pointer" onClick={previous}>
            {page - 1}
          </PaginationItem>
        )}
        <PaginationItem>
          <PaginationLink isActive>{page}</PaginationLink>
        </PaginationItem>
        {page < finalPage && (
          <PaginationItem className="cursor-pointer" onClick={next}>
            {page + 1}
          </PaginationItem>
        )}
        {page < finalPage && <PaginationNext onClick={next} />}
      </PaginationContent>
    </Pagination>
  );
}
