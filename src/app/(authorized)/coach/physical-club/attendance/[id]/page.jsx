"use client"
import { useState, useMemo } from "react"
import useSWR from "swr"
import ContentLoader from "@/components/common/ContentLoader"
import ContentError from "@/components/common/ContentError"
import { getPhysicalAttendance } from "@/lib/fetchers/app"
import { useParams } from "next/navigation"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { format, isWithinInterval, parseISO } from "date-fns"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { CalendarIcon, X } from "lucide-react"

export default function Page() {
  const { id } = useParams()
  const { isLoading, error, data } = useSWR(
    `app/physical-club/attendance/${id}`,
    () =>
      getPhysicalAttendance({
        person: "coach",
        clientId: id,
        populate:
          "client:name|mobileNumber|rollno,membership:membershipType|pendingServings|endDate,attendance.meeting:meetingType|description|banner|allowed_client_type|topics|wellnessZLink",
      })
  )

  const [startDate, setStartDate] = useState(null)
  const [endDate, setEndDate] = useState(null)

  const [clientAttendance] = data?.data?.results || [{}]

  const attendances = clientAttendance.attendance || []

  const filteredAttendances = useMemo(() => {
    if (!startDate && !endDate) return attendances
    return attendances.filter((attendance) => {
      const date = parseISO(attendance.date)
      if (startDate && endDate) {
        return isWithinInterval(date, { start: startDate, end: endDate })
      }
      if (startDate) return date >= startDate
      if (endDate) return date <= endDate
      return true
    })
  }, [attendances, startDate, endDate])

  if (isLoading) return <ContentLoader />
  if (error || data.status_code !== 200) return <ContentError title={error || data.message} />

  if (!Boolean(clientAttendance)) return <ContentError title="No attendance found" />

  return (
    <div className="content-container content-height-screen">
      <h1 className="text-2xl font-semibold mb-6">
        Attendance for {clientAttendance.client?.name}
      </h1>

      <div className="flex items-center gap-4 mb-4">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-[220px] justify-between font-normal"
            >
              <span className="flex items-center">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {startDate ? format(startDate, "dd-MM-yyyy") : "Pick start date"}
              </span>
              {startDate && (
                <span
                  onClick={(e) => {
                    e.stopPropagation() // prevent popover from opening
                    setStartDate(null)
                  }}
                >
                  <X className="h-4 w-4 cursor-pointer text-muted-foreground" />
                </span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={startDate}
              onSelect={setStartDate}
              initialFocus
            />
          </PopoverContent>
        </Popover>

        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-[220px] justify-between font-normal"
            >
              <span className="flex items-center">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {endDate ? format(endDate, "dd-MM-yyyy") : "Pick end date"}
              </span>
              {endDate && (
                <span
                  onClick={(e) => {
                    e.stopPropagation() // prevent popover from opening
                    setEndDate(null)
                  }}
                >
                  <X className="h-4 w-4 cursor-pointer text-muted-foreground" />
                </span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={endDate}
              onSelect={setEndDate}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* Attendance Table */}
      <Table className="bg-[var(--comp-1)] mt-4 border-1">
        <TableHeader>
          <TableRow>
            <TableHead>Sr No</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Marked At</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredAttendances.length > 0 ? (
            filteredAttendances.map((attendance, index) => (
              <TableRow key={index}>
                <TableCell>{index + 1}</TableCell>
                <TableCell>{format(parseISO(attendance.date), "dd-MM-yyyy")}</TableCell>
                <TableCell>{format(parseISO(attendance.markedAt), "hh:mm a")}</TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={3} className="text-center py-4">
                No attendance found in selected range
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
