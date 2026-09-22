import { Gift } from "lucide-react";
import DeleteReward from "./DeleteReward";
import UpdateReward from "./UpdateReward";
import { RowCheckbox } from "@/components/bulk/bulkSelection";

export function RewardCard({
  item,
  currentSWRKey,
  selected = [],
  onSelectionChange,
  showCheckbox = false,
}) {
  return (
    <div className="group relative bg-white border border-slate-200 rounded-2xl overflow-hidden hover:shadow-md transition-all duration-300">
      <div className="relative aspect-video w-full bg-slate-50 border-b border-slate-100 overflow-hidden">
        {showCheckbox && onSelectionChange && (
          <div className="absolute top-2 left-2 z-10 bg-white/90 rounded p-1 border shadow-sm">
            <RowCheckbox
              id={item._id}
              selected={selected}
              onChange={onSelectionChange}
            />
          </div>
        )}
        {item.image ? (
          <img
            src={item.image}
            alt={item.title}
            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-slate-300">
            <Gift size={40} strokeWidth={1.5} />
          </div>
        )}

        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <UpdateReward
            item={item}
            currentSWRKey={currentSWRKey}
          />
          <DeleteReward
            rewardId={item._id}
            currentSWRKey={currentSWRKey}
          />
        </div>
      </div>

      <div className="p-4">
        <div className="flex justify-between items-start mb-1">
          <h3 className="text-sm font-bold text-slate-800 line-clamp-1">
            {item.title}
          </h3>
        </div>
        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed min-h-[32px]">
          {item.description || "No description provided."}
        </p>
      </div>
    </div>
  );
}