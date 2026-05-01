import DualOptionActionModal from "@/components/modals/DualOptionActionModal";
import { AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { sendData } from "@/lib/api";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useRevalidateAndClearCache } from "../pages/coach/recognition/useRevalidateAndClearCache";

export default function DeleteYTRecipeVideo({ videoId, currentSWRKey }) {
  const revalidate = useRevalidateAndClearCache();

  async function handleDelete(setLoading, closeBtnRef) {
    try {
      setLoading(true);
      const response = await sendData("app/yt-recipe/video-library", { ytRecipeId: videoId }, "DELETE");      
      if (response.status_code !== 200) {
        throw new Error(response.message || "Failed to delete video");
      }
      toast.success(response.message || "Video deleted successfully");
      revalidate(currentSWRKey, "app/yt-recipe/video-library");
      
      closeBtnRef.current.click();
    } catch (error) {
      toast.error(error.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <DualOptionActionModal
      title="Delete Video Recipe?"
      description="Are you sure? This will permanently remove this video tutorial. This action cannot be undone."
      action={handleDelete}
      actionText="Delete"
    >
      <AlertDialogTrigger asChild>
        <button className="p-2 bg-white/90 backdrop-blur shadow-sm rounded-full text-slate-600 hover:text-red-600 transition-colors">
          <Trash2 size={14} />
        </button>
      </AlertDialogTrigger>
    </DualOptionActionModal>
  );
}