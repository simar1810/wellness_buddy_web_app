import DualOptionActionModal from "@/components/modals/DualOptionActionModal";
import { AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { sendData } from "@/lib/api";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useRevalidateAndClearCache } from "../pages/coach/recognition/useRevalidateAndClearCache";

export default function DeleteReward({ rewardId, currentSWRKey }) {
  const revalidate = useRevalidateAndClearCache()

  async function deleteAward(setLoading, closeBtnRef) {
    try {
      setLoading(true);
      const response = await sendData("app/reward", { rewardId }, "DELETE");
      if (response.status_code !== 200) throw new Error(response.message);
      toast.success(response.message);
      revalidate(currentSWRKey, "app/reward")
      closeBtnRef.current.click();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  }

  return <DualOptionActionModal
    description="This will permanently remove the reward and its associated data from the system."
    action={deleteAward}
  >
    <AlertDialogTrigger asChild>
      <button className="p-2 bg-white/90 backdrop-blur shadow-sm rounded-full text-slate-600 hover:text-red-600">
        <Trash2 size={14} />
      </button>
    </AlertDialogTrigger>
  </DualOptionActionModal>
}