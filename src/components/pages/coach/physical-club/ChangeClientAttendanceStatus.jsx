import DualOptionActionModal from "@/components/modals/DualOptionActionModal";
import { AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { sendData } from "@/lib/api";
import { _throwError } from "@/lib/formatter";
import { toast } from "sonner";
import { mutate } from "swr";

export default function ChangeClientAttendanceStatus({
  children,
  date,
  status,
  clientId
}) {

  async function changeClientAttendanceStatus(setLoading, closeBtnRef) {
    try {
      setLoading(true);
      const response = await sendData(
        "app/physical-club/attendance?person=coach",
        { status, clientId, date },
        "PUT"
      );
      if (response.status_code !== 200) throw new Error(response.message);
      toast.success(response.message);
      mutate("app/physical-club/attendance");
      closeBtnRef.current.click();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  }

  return <DualOptionActionModal
    description={`Are you sure of changing the attendance? You are changing the status to ${status}!`}
    action={(setLoading, btnRef) => changeClientAttendanceStatus(setLoading, btnRef)}
  >
    <AlertDialogTrigger asChild>
      {children}
    </AlertDialogTrigger>
  </DualOptionActionModal>
}