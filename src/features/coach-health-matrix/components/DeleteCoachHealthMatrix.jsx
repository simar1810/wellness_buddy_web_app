import DualOptionActionModal from "@/components/modals/DualOptionActionModal";
import { AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { sendData } from "@/lib/api";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useRevalidateAndClearCache } from "../../../components/pages/coach/recognition/useRevalidateAndClearCache";

export default function DeleteCoachHealthMatrix({ currentSWRKey, matrixId }) {
  const revalidate = useRevalidateAndClearCache()

  const deleteCoachHealthMatrix = async function (setLoading, closeBtnRef) {
    try {
      setLoading(true);
      const response = await sendData("app/coach/health-matrix", { matrixId }, "DELETE");
      console.log(response)
      if (response.status_code !== 200) throw new Error(response.message);
      toast.success(response.message);
      revalidate(currentSWRKey, "app/coach/health-matrix")
      closeBtnRef.current.click();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  }

  return <DualOptionActionModal
    description="You are deleting the health matrix note! This action cannot be undone."
    action={(setLoading, btnRef) => deleteCoachHealthMatrix(setLoading, btnRef)}
  >
    <AlertDialogTrigger>
      <Trash2 className="w-[28px] h-[28px] text-white bg-[var(--accent-2)] p-[7px] rounded-[4px]" />
    </AlertDialogTrigger>
  </DualOptionActionModal>
}