"use client";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { TabsContent } from "@/components/ui/tabs";
import { dateWiseAttendanceSplit, getPresentAbsent, manualAttendanceWithRange } from "@/lib/physical-attendance";
import { nameInitials } from "@/lib/formatter";
import { cn } from "@/lib/utils";
import { CheckCircle, X } from "lucide-react";
import { CustomCalendar } from "@/components/common/CustomCalender";
import ChangeClientAttendanceStatus from "./ChangeClientAttendanceStatus";
import { endOfMonth, format, startOfMonth } from "date-fns";
import Link from "next/link";

export default function ManualAttendance({
  data,
  query,
  range,
  setRange
}) {
  const clients = manualAttendanceWithRange(data, range)
    .filter(client => new RegExp(query, "i").test(client?.name))

  return (<TabsContent value="manual-attendance" className="flex gap-6">
    <AttendanceClients clients={clients} />
    <div className="flex-1">
      <AttendanceCalendar
        range={range}
        data={data}
        setRange={setRange}
      />
      <AttendanceSummary data={data} clients={clients} />
    </div>
  </TabsContent>
  );
}

export function AttendanceClients({ clients }) {
  return (
    <div className="flex-1 space-y-2 bg-[var(--comp-1)] border-1 p-2 rounded-[8px]">
      <div className="mb-4 text-lg font-semibold">
        Total Records <span className="text-gray-500 text-sm">({clients.length})</span>
      </div>
      <div className="space-y-3">
        {clients.map((client, i) => (
          <div key={i} className="flex justify-between items-center border-b pb-2">
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarImage src={client.profilePhoto} />
                <AvatarFallback>{nameInitials(client.name)}</AvatarFallback>
              </Avatar>
              <Link href={`/coach/clients/${client.clientId}?tab=physical-club`}>{client.name}</Link>
              <span className="text-[12px] mt-1">{format(client.date, "dd-MM-yyyy")}</span>
            </div>
            <div className="flex gap-2">
              <ChangeClientAttendanceStatus
                clientId={client.clientId}
                date={client.date}
                status="present"
              >
                <Button
                  size="sm"
                  variant="outline"
                  className={cn("rounded-full font-bold hover:text-[var(--accent-1)]", client.status === "present"
                    ? "bg-[var(--accent-1)] hover:bg-[var(--accent-1)] hover:border-[var(--accent-1)] text-white hover:text-white"
                    : "text-[var(--accent-1)] border-[var(--accent-1)] hover:border-[var(--accent-1)]")}
                >
                  <CheckCircle className={cn(client.status === "present"
                    ? "text-white"
                    : "text-[var(--accent-1)]"
                  )} />
                  Present
                </Button>
              </ChangeClientAttendanceStatus>
              <ChangeClientAttendanceStatus
                date={client.date}
                clientId={client.clientId}
                status="absent"
              >
                <Button
                  size="sm"
                  variant="outline"
                  className={cn("rounded-full font-bold hover:text-[var(--accent-1)]", client.status === "absent"
                    ? "bg-[var(--accent-2)] hover:bg-[var(--accent-2)] text-white hover:text-white"
                    : "text-[var(--accent-2)] hover:text-[var(--accent-2)] border-[var(--accent-2)]")}
                >
                  <X className={cn(client.status === "absent"
                    ? "bg-white text-[var(--accent-2)] rounded-full p-[2px]"
                    : "bg-[var(--accent-2)] text-white rounded-full p-[2px]"
                  )} />
                  Absent
                </Button>
              </ChangeClientAttendanceStatus>
            </div>
          </div>
        ))}
        {clients.length === 0 && <div className="bg-white border-1 rounded-[6px] h-[200px] flex items-center justify-center font-bold">
          No Matches Found!
        </div>}
      </div>
    </div>
  );
}

export function AttendanceCalendar({
  data = [],
  range,
  setRange,
}) {
  const clients = manualAttendanceWithRange(data, {
    from: startOfMonth(range.from),
    to: endOfMonth(range.from)
  })

  const badgeData = dateWiseAttendanceSplit(clients)
  return (
    <div className="w-full">
      <CustomCalendar
        range={range}
        badgeData={badgeData}
        onRangeSelect={setRange}
        mode="single"
      />
    </div>
  );
}

export function AttendanceSummary({
  data = []
}) {
  return <></>
  const { absent, present, requested } = getPresentAbsent(data)
  return (
    <Card className="mt-4 p-4 gap-0 bg-[var(--comp-1)] shadow-none">
      <div className="pb-2 mb-4 border-b-2 border-[var(--accent-1)] flex items-center justify-between">
        <h2>Attendance Summary</h2>
        {/* <div className="text-sm text-gray-600 mb-2">16 September, 2025</div> */}
      </div>
      <div className="grid grid-cols-2 divide-x-2">
        <div className="flex justify-between text-sm pr-4">
          <span>Total Clients:</span>
          <span className="font-semibold">{data.length}</span>
        </div>
        <div className="pl-4">
          <div className="flex justify-between text-sm text-green-600">
            <span>Present Clients:</span>
            <span className="font-semibold">{present}</span>
          </div>
          <div className="flex justify-between text-sm text-red-600">
            <span>Absent Clients:</span>
            <span className="font-semibold">{absent}</span>
          </div>
          <div className="flex justify-between text-sm text-[#808080]">
            <span>Requested Clients:</span>
            <span className="font-semibold">{requested}</span>
          </div>
        </div>
      </div>
    </Card>
  );
}