import DualOptionActionModal from "@/components/modals/DualOptionActionModal";
import { AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { sendData } from "@/lib/api";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useRevalidateAndClearCache } from "./useRevalidateAndClearCache";

export default function DeleteRecognition({ recognitionId, currentCacheKey }) {
  const revalidate = useRevalidateAndClearCache()

  async function deleteRecognition(setLoading, closeBtnRef) {
    try {
      setLoading(true);
      const response = await sendData("app/recognition", { recognitionId }, "DELETE");
      console.log(response)
      if (response.status_code !== 200) throw new Error(response.message);
      toast.success(response.message);
      revalidate(currentCacheKey, "app/recognition")
      closeBtnRef.current.click();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  }

  return <DualOptionActionModal
    description="Are you sure you want to recognition this note? This action cannot be undone."
    action={(setLoading, btnRef) => deleteRecognition(setLoading, btnRef)}
  >
    <AlertDialogTrigger>
      <Trash2 className="w-[20px] h-[20px] text-white bg-[var(--accent-2)] p-1 rounded-[4px]" />
    </AlertDialogTrigger>
  </DualOptionActionModal>
}