"use client"
import { TabsContent } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import ContentError from "@/components/common/ContentError"
import ContentLoader from "@/components/common/ContentLoader"
import { getPhysicalAttendance, getPhysicalMemberships } from "@/lib/fetchers/app"
import { _throwError, getMembershipType } from "@/lib/formatter"
import useSWR, { mutate } from "swr"
import { format } from "date-fns"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog"
import { useState } from "react"
import { toast } from "sonner"
import { sendData } from "@/lib/api"
import { Trash2, X } from "lucide-react"
import { AlertDialogTrigger } from "@/components/ui/alert-dialog"
import DualOptionActionModal from "@/components/modals/DualOptionActionModal"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

export default function PhysicalClub() {
  return <TabsContent
    value="physical-club"
    className="space-y-6"
  >
    <MembershipData />
    {/* <PhysicalClubAttendance /> */}
  </TabsContent>
}

function MembershipData() {
  const { id: clientId } = useParams()
  const { isLoading, error, data } = useSWR(
    `app/physical-club/memberships/${clientId}`,
    () =>
      getPhysicalMemberships({
        person: "coach",
        populate: "client:name|mobileNumber|rollno|isPhysicalClubActive",
        clientId
      })
  )

  if (isLoading)
    return (<ContentLoader />)

  if (error || !Boolean(data) || data?.status_code !== 200)
    return (<ContentError className="mt-0" title={error || data?.message} />)

  const membership = data.data?.results?.[0]

  if (membership.isActive === false) return <div className="bg-[var(--comp-1)] p-4 mb-4 border-1 rounded-[8px] flex items-center justify-between">
    <p>Service Status</p>
    <div>
      <UpdatePhysicalServiceStatus
        status={Boolean(membership.isActive)}
        clientId={clientId}
      />
    </div>
  </div>

  if (!membership) {
    return (
      <>
        <h2>Memberships</h2>
        <div className="h-[200px] flex flex-col gap-4 items-center justify-center border-1 bg-[var(--comp-1)] rounded-[10px]">
          <AddMembershipDialog
            overdues={membership?.overdue}
            clientId={clientId}
          />
          <p className="text-sm text-muted-foreground">No membership found</p>
        </div>
      </>
    )
  }

  return (
    <div>
      <div className="bg-[var(--comp-1)] p-4 mb-4 border-1 rounded-[8px] flex items-center justify-between">
        <p>Service Status</p>
        <div>
          <UpdatePhysicalServiceStatus
            status={Boolean(membership.isActive)}
            clientId={clientId}
          />
        </div>
      </div>
      <div
        value="physical-club"
        className="bg-[var(--comp-1)] p-4 border-1 rounded-[8px]"
      >
        <div className="space-y-6">
          <ClientDetails membership={membership} />
          <SubscriptionHistoryTable history={membership.history} />
        </div>
      </div>
    </div>
  )
}

function PhysicalClubAttendance() {
  const { id: clientId } = useParams();
  const { isLoading, error, data } = useSWR(
    `app/physical-club/attendance/${clientId}`,
    () =>
      getPhysicalAttendance({
        person: "coach",
        populate:
          "membership:membershipType|pendingServings|endDate,attendance.meeting:meetingType|description|banner|allowed_client_type|topics|wellnessZLink",
        clientId
      })
  )

  if (isLoading)
    return (<ContentLoader />)

  if (error || !Boolean(data) || data?.status_code !== 200)
    return (<ContentError className="mt-0" title={error || data?.message} />)

  const attendanceClient = data.data?.results?.[0]

  if (!attendanceClient) {
    return <>
      <h2>Physical Attendance</h2>
      <p className="text-sm text-muted-foreground">No Attendance found</p>
    </>
  }

  const attendanceRecords = attendanceClient?.attendance || []
  const statusVariant = {
    "present": "wz_fill",
    "absent": "destructive",
    "requested": "default"
  }
  return (
    <div
      className="bg-[var(--comp-1)] p-4 border-1 rounded-[8px]"
    >
      <h2>Attendance</h2>
      <div className="mt-4 overflow-x-auto rounded-lg border">
        <Table className="bg-white">
          <TableHeader>
            <TableRow>
              <TableHead>Sr No.</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Marked At</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {attendanceRecords.map((record, i) => (
              <TableRow key={i}>
                <TableCell>{i + 1}</TableCell>
                <TableCell>{format(new Date(record.date), "dd-MM-yyyy")}</TableCell>
                <TableCell>{format(new Date(record.markedAt), "dd-MM-yyyy hh:mm a")}</TableCell>
                <TableCell>
                  <Badge
                    className="capitalize font-semibold text-[10px]"
                    variant={statusVariant[record.status]}
                  >{record.status}</Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

function ClientDetails({ membership }) {
  const { id: clientId } = useParams()
  const { end, type } = getMembershipType(membership)
  const active = membership.client.isPhysicalClubActive

  return (
    <div className="flex flex-row items-center justify-between">
      <div>
        <h2>Memberships</h2>
        <div className="mt-1 flex items-center gap-2">
          {type === "Servings"
            ? <div className="text-sm">Pending Servings - {membership.pendingServings}</div>
            : <div className="text-sm">End Date - {end}</div>}
        </div>
        <div className="text-sm">Overdue - {membership?.overdue || 0}</div>
        <div>
          {active
            ? <Badge variant="wz_fill">Active</Badge>
            : <Badge variant="destructive">In Active</Badge>}
        </div>
      </div>
      <AddMembershipDialog
        overdues={membership?.overdue}
        clientId={clientId}
      />
    </div>
  )
}

function SubscriptionHistoryTable({ history }) {
  if (!history || history.length === 0) {
    return <p className="text-sm text-muted-foreground">No subscription history found</p>
  }

  return (
    <div className="overflow-x-auto rounded-lg border">
      <Table className="bg-white">
        <TableHeader>
          <TableRow>
            <TableHead>Amount</TableHead>
            <TableHead>Mode</TableHead>
            <TableHead>Membership Type</TableHead>
            <TableHead>Servings</TableHead>
            <TableHead>Start Date</TableHead>
            <TableHead>End Date</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {history.map((item, i) => {
            const { type, end } = getMembershipType(item)
            return (
              <TableRow key={i}>
                <TableCell>₹{item.amount}</TableCell>
                <TableCell>{item.paymentMode}</TableCell>
                <TableCell>{type}</TableCell>
                {type === "Servings"
                  ? <TableCell className="text-center">{end}</TableCell>
                  : <TableCell className="text-center">-</TableCell>}
                {item.startDate
                  ? <TableCell className="text-center">{format(item.startDate, "dd/MM/yyyy")}</TableCell>
                  : <TableCell className="text-center">-</TableCell>}
                {type === "Monthly"
                  ? <TableCell className="text-center">{format(item.endDate, "dd/MM/yyyy")}</TableCell>
                  : <TableCell className="text-center">-</TableCell>}
                <TableCell>
                  <DeleteSubscription membershipId={item._id} />
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}

function DeleteSubscription({ membershipId }) {
  const { id: clientId } = useParams()

  async function deleteSubscription(setLoading, closeBtnRef) {
    try {
      setLoading(true);
      const response = await sendData(
        "app/physical-club/memberships/",
        { membershipId, clientId },
        "DELETE"
      );
      if (response.status_code !== 200) throw new Error(response.message);
      toast.success(response.message);
      mutate(`app/physical-club/memberships/${clientId}`);
      closeBtnRef.current.click();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  }
  return <DualOptionActionModal
    description="Are you sure to delete this subscription?"
    action={(setLoading, closeBtnRef) => deleteSubscription(setLoading, closeBtnRef)}
  >
    <AlertDialogTrigger>
      <Trash2 className="w-[16px] h-[16px] text-[var(--accent-2)] cursor-pointer" />
    </AlertDialogTrigger>
  </DualOptionActionModal>
}

export function validateMembershipData(payload) {
  const { clientId, membershipType, startDate, endDate, servings, amount, paymentMode } = payload;

  if (!clientId) {
    return { valid: false, message: "clientId is required and must be a valid ObjectId." }
  }

  if (!membershipType || ![1, 2].includes(membershipType)) {
    return { valid: false, message: "Invalid membershipType. Must be either 1 (Monthly) or 2 (Servings)." }
  }

  if (!paymentMode || !["Online", "Offline"].includes(paymentMode)) {
    return { valid: false, message: "Invalid payment mode. Must be either Online or Offline." }
  }

  if (amount < 0) {
    return { valid: false, message: "Amount cannot be negative." }
  }

  if (membershipType === 1) {
    if (!startDate || !endDate) {
      return { valid: false, message: "Start Date and End Date are required for Monthly membership." }
    }
  } else if (membershipType === 2) {
    // Servings are optional for type 2, but if provided must be positive
    if (servings && servings <= 0) {
      return { valid: false, message: "If servings are provided, they must be greater than 0." }
    }
  }

  return { valid: true }
}


function AddMembershipDialog({
  clientId,
  overdues
}) {
  const [clearOverdues, setClearOverdues] = useState(false);
  const [loading, setLoading] = useState(false)
  const [payload, setPayload] = useState({
    clientId,
    membershipType: 1,
    paymentMode: "Online",
    amount: 0,
    startDate: "",
    endDate: "",
    servings: 0,
    overdue: 0
  })

  const handleChange = (field, value) => {
    setPayload(prev => ({ ...prev, [field]: value }))
  }
  async function createMembership() {
    try {
      setLoading(true);
      const { valid, message } = validateMembershipData(payload)
      if (!valid) _throwError(message)
      const response = await sendData("app/physical-club/memberships", payload, "POST");
      if (response.status_code !== 200) throw new Error(response.message);
      toast.success(response.message);
      mutate(`app/physical-club/memberships/${clientId}`,);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="sm" variant="wz">Add</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] max-h-[75vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Membership</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-2">
          <div className="flex flex-col">
            <label>Membership Type</label>
            <select
              value={payload.membershipType}
              onChange={e => handleChange("membershipType", Number(e.target.value))}
              className="border rounded px-2 py-1"
            >
              <option value={1}>Monthly</option>
              <option value={2}>Servings</option>
            </select>
          </div>
          <div className="flex flex-col">
            <label>Payment Mode</label>
            <select
              value={payload.paymentMode}
              onChange={e => handleChange("paymentMode", e.target.value)}
              className="border rounded px-2 py-1"
            >
              <option value="Online">Online</option>
              <option value="Offline">Offline</option>
            </select>
          </div>
          <div className="flex flex-col">
            <label>Amount</label>
            <input
              type="number"
              value={payload.amount}
              onChange={e => handleChange("amount", Number(e.target.value))}
              className="border rounded px-2 py-1"
            />
          </div>

          <div className="flex flex-col">
            <label>Start Date</label>
            <input
              type="date"
              value={payload.startDate}
              onChange={e => handleChange("startDate", e.target.value)}
              className="border rounded px-2 py-1"
              required
            />
          </div>
          {payload.membershipType === 1 && (<div className="flex flex-col">
            <label>End Date</label>
            <input
              type="date"
              value={payload.endDate}
              onChange={e => handleChange("endDate", e.target.value)}
              className="border rounded px-2 py-1"
              required
            />
          </div>
          )}
          {payload.membershipType === 2 && (
            <div className="flex flex-col">
              <label>Servings (Optional)</label>
              <input
                type="number"
                value={payload.servings}
                onChange={e => handleChange("servings", Number(e.target.value))}
                className="border rounded px-2 py-1"
                placeholder="Enter number of servings"
              />
            </div>
          )}
          <div className="flex items-center justify-between">
            <div>
              <h2>Do You want to clear overdues?</h2>
              <p className="text-sm font-bold text-[#808080]">{overdues} overdue!</p>
            </div>
            <Button
              size="sm"
              onClick={() => setClearOverdues(true)}
              variant="wz"
            >
              Yes
            </Button>
          </div>
          {clearOverdues && <div className="flex flex-col">
            <div className="mb-2 flex items-center justify-between">
              <label>How Many Overdues You want to clear</label>
              <Button
                size="sm"
                onClick={() => {
                  setClearOverdues(false)
                  handleChange("overdue", 0)
                }}
                variant="destructive"
              >
                <X />
              </Button>
            </div>
            <input
              type="number"
              value={payload.overdue}
              onChange={e => handleChange("overdue", Number(e.target.value))}
              className="border rounded px-2 py-1"
            />
          </div>}
        </div>
        <Button
          variant="wz"
          onClick={createMembership}
          disabled={loading}
        >Save</Button>
      </DialogContent>
    </Dialog>
  )
}

function UpdatePhysicalServiceStatus({
  status = false,
  clientId
}) {
  async function updatePhysicalServiceStatus(setLoading, closeBtnRef) {
    try {
      setLoading(true);
      const response = await sendData(
        "app/physical-club/update-status",
        { clientId, status: !status },
        "PATCH"
      );
      if (response.status_code !== 200) throw new Error(response.message);
      toast.success(response.message);
      mutate(`app/physical-club/memberships/${clientId}`);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
      closeBtnRef.current.click();
    }
  }
  return <DualOptionActionModal
    description="Are you sure to update physical service status?"
    action={updatePhysicalServiceStatus}
  >
    <AlertDialogTrigger asChild>
      <div className="flex items-center space-x-2">
        <Switch checked={status} id="active-status" />
        <Label htmlFor="active-status">Active</Label>
      </div>
    </AlertDialogTrigger>
  </DualOptionActionModal>
}