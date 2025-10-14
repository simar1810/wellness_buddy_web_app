"use client";
import ContentError from "@/components/common/ContentError";
import ContentLoader from "@/components/common/ContentLoader";
import { CustomCalendar } from "@/components/common/CustomCalender";
import MonthYearPicker from "@/components/common/MonthYearPicker";
import { ClientwiseHistory } from "@/components/pages/coach/physical-club/ClientwiseHistory";
import ClubHistoryPage from "@/components/pages/coach/physical-club/ClubHistory";
import PhysicalClubReports from "@/components/pages/coach/physical-club/PhysicalClubReports";
import ManualAttendance from "@/components/pages/coach/physical-club/ManualAttendance";
import QRCodeModal from "@/components/pages/coach/physical-club/QRCodeModal";
import ShakeRequestsTable from "@/components/pages/coach/physical-club/ShakeRequestsTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetClose, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { exportToExcel } from "@/lib/excel";
import { getPhysicalAttendance } from "@/lib/fetchers/app";
import { _throwError } from "@/lib/formatter";
import { physicalAttendanceExcelDownload } from "@/lib/physical-attendance";
import { endOfDay, getMonth, getYear, startOfDay, startOfMonth } from "date-fns";
import { ClipboardCheck, Bell, Users, Building2, CalendarDays, ExternalLink, CalendarRange } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import useSWR from "swr";

const tabItems = [
  {
    icon: <ClipboardCheck className="w-[16px] h-[16px]" />,
    value: "manual-attendance",
    label: "Manual Attendance"
  },
  {
    icon: <Bell className="w-[16px] h-[16px]" />,
    value: "shake-requests",
    label: "Shake Requests",
    badge: 15
  },
  {
    icon: <Users className="w-[16px] h-[16px]" />,
    value: "clientwise-history",
    label: "Clientwise History"
  },
  {
    icon: <Building2 className="w-[16px] h-[16px]" />,
    value: "club-history",
    label: "Club History"
  },
  {
    icon: <CalendarDays className="w-[16px] h-[16px]" />,
    value: "reports",
    label: "Reports"
  },
];

const CalendarMap = {
  "manual-attendance": {
    from: startOfDay(new Date()),
    to: endOfDay(new Date())
  },
  "shake-requests": {
    from: startOfDay(new Date()),
    to: endOfDay(new Date())
  },
  "clientwise-history": {
    from: startOfMonth(new Date()),
    to: endOfDay(new Date())
  },
  "club-history": {
    from: startOfDay(new Date()),
    to: endOfDay(new Date())
  },
  "club-history": {
    from: startOfDay(new Date()),
    to: endOfDay(new Date())
  },
  "physical-club": {
    month: getMonth(new Date()).toString(),
    year: getYear(new Date()).toString(),
  },
  "reports": {
    from: startOfDay(new Date()),
    to: endOfDay(new Date())
  }
};

export default function Page() {
  const [calendarRange, setCalendarRange] = useState(CalendarMap)
  const [tab, setTab] = useState("manual-attendance");
  const [query, setQuery] = useState("");

  const { isLoading, error, data } = useSWR(
    "app/physical-club/attendance",
    () => getPhysicalAttendance({
      person: "coach",
      populate: "client:name|mobileNumber|rollno|profilePhoto|isPhysicalClubActive,membership:membershipType|pendingServings|endDate|isActive",
      limit: 1000000
    })
  );

  if (isLoading) return <ContentLoader />

  if (error || data.status_code !== 200) return <ContentError title={error || data.message} />

  const attendance = (data?.data?.results || [])
    .filter(record => record.membership?.isActive);

  const range = calendarRange[tab];


  function onChangeCalendarRange(payload) {
    setCalendarRange(prev => ({
      ...prev,
      [tab]: payload
    }))
  }

  return <div className="content-container content-height-screen">
    <div className="mb-8 flex items-center justify-between">
      <h4>Attendance Management System</h4>
      <QRCodeModal />
    </div>

    <Tabs value={tab} onValueChange={setTab}>
      <Header />
      <ToolsBar
        data={attendance} tab={tab}
        query={query} setQuery={setQuery}
        range={range} setRange={onChangeCalendarRange}
      />
      <ManualAttendance
        range={range} setRange={onChangeCalendarRange}
        query={query} data={attendance}
      />
      <ShakeRequestsTable
        range={range} setRange={onChangeCalendarRange}
        query={query} data={attendance}
      />
      <ClientwiseHistory
        range={range} setRange={onChangeCalendarRange}
        query={query} data={attendance}
      />
      <ClubHistoryPage
        range={range} setRange={onChangeCalendarRange}
        query={query} data={attendance}
      />
      <PhysicalClubReports
        range={range} setRange={onChangeCalendarRange}
        query={query} data={attendance}
      />
    </Tabs>
  </div>
}

function Header() {
  return <TabsList className="w-full h-auto bg-transparent p-0 mb-4 flex items-start gap-x-2 gap-y-3 flex-wrap rounded-none no-scrollbar">
    {tabItems.map(({ icon, value, label, showIf }) =>
      <TabsTrigger
        key={value}
        className="min-w-[110px] mb-[-5px] px-2 font-semibold flex-1 basis-0 flex items-center gap-1 rounded-[10px] py-2
             data-[state=active]:bg-[var(--accent-1)] data-[state=active]:text-[var(--comp-1)]
             data-[state=active]:shadow-none text-[#808080] bg-[var(--comp-1)] border-1 border-[#EFEFEF]"
        value={value}
      >
        {icon}
        {label}
      </TabsTrigger>
    )}
  </TabsList>
}

function ToolsBar({
  data,
  tab,
  query,
  setQuery,
  range,
  setRange
}) {
  async function downloadExcelSheet() {
    try {
      const excelData = physicalAttendanceExcelDownload(tab, data, range)
      exportToExcel(excelData)
    } catch (error) {
      toast.error(error.message || "Something went wrong!");
    }
  }
  return <div className="flex items-center justify-between gap-4 mb-4">
    <Input
      placeholder="Search Client"
      className="w-64 mr-auto"
      value={query}
      onChange={e => setQuery(e.target.value)}
    />
    {["physical-club"].includes(tab) && <MonthYearPicker
      month={range.month}
      year={range.year}
      setRange={setRange}
    />}
    {[
      "shake-requests", "club-history",
      "clientwise-history"
    ].includes(tab) && <SelectDateRange
        range={range}
        setRange={setRange}
      />}
    <Button
      onClick={downloadExcelSheet}
      variant="wz"
    >
      Export
      <ExternalLink />
    </Button>
  </div>
}

function SelectDateRange({
  range,
  setRange
}) {
  return <Sheet>
    <SheetTrigger asChild>
      <Button className="font-bold">
        Select Date Range
        <CalendarRange strokeWidth={2.4} />
      </Button>
    </SheetTrigger>
    <SheetContent align="start" className="!max-w-[600px] !w-[600px]">
      <SheetTitle className="text-[28px] p-4 border-b-1">Date Range</SheetTitle>
      <div className="p-4">
        <CustomCalendar
          range={range}
          onRangeSelect={setRange}
          mode="both"
        />
        <SheetClose asChild>
          <Button className="w-full mt-4">Done</Button>
        </SheetClose>
      </div>
    </SheetContent>
  </Sheet>
}