import ContentError from "@/components/common/ContentError"
import ContentLoader from "@/components/common/ContentLoader"
import ScheduleNotificationWrapper from "@/components/modals/client/ScheduleNotification"
import DualOptionActionModal from "@/components/modals/DualOptionActionModal"
import { AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { sendData } from "@/lib/api"
import { retrieveClientNudges } from "@/lib/fetchers/app"
import { cn } from "@/lib/utils"
import { Pen, Trash2, Calendar, Clock } from "lucide-react"
import { useParams } from "next/navigation"
import { toast } from "sonner"
import useSWR, { mutate } from "swr"
import { format, parse, getDay, isAfter, isToday, isTomorrow, isYesterday, subDays } from "date-fns"
import { useState } from "react"
import { useNotificationSchedulerCache } from "@/hooks/useNotificationSchedulerCache"

const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function groupNudgesByDay(notifications) {
  const groupedNudges = {
    Sunday: [],
    Monday: [],
    Tuesday: [],
    Wednesday: [],
    Thursday: [],
    Friday: [],
    Saturday: []
  };

  notifications.forEach(notification => {
    if (notification.schedule_type === "reocurr" && notification.reocurrence) {
      // For recurring nudges, add to each selected day
      notification.reocurrence.forEach(dayIndex => {
        const dayName = days[dayIndex];
        if (dayName) {
          groupedNudges[dayName].push(notification);
        }
      });
    } else if (notification.schedule_type === "schedule" && notification.date) {
      // For scheduled nudges, determine the day from the date
      try {
        const parsedDate = parse(notification.date, "dd-MM-yyyy", new Date());
        const dayIndex = getDay(parsedDate);
        const dayName = days[dayIndex];
        if (dayName) {
          groupedNudges[dayName].push(notification);
        }
      } catch (error) { }
    }
  });

  return groupedNudges;
}

function getRecentNudges(notifications) {
  // Sort all notifications by date (most recent first)
  const sortedNotifications = notifications.sort((a, b) => {
    if (a.schedule_type === "schedule" && b.schedule_type === "schedule") {
      try {
        const dateA = parse(a.date, "dd-MM-yyyy", new Date());
        const dateB = parse(b.date, "dd-MM-yyyy", new Date());
        return dateB - dateA; // Most recent first
      } catch {
        return 0;
      }
    } else if (a.schedule_type === "reocurr" && b.schedule_type === "reocurr") {
      // For recurring nudges, sort by creation time or keep original order
      return 0;
    } else if (a.schedule_type === "reocurr") {
      return -1; // Recurring nudges first
    } else {
      return 1;
    }
  });

  // Return only the 4 most recent
  return sortedNotifications.slice(0, 4);
}

function RecentSection({ nudges }) {
  return (
    <div className="border border-gray-200 rounded-lg p-4">
      <div className="flex items-center gap-2 mb-4">
        <Calendar className="w-4 h-4 text-green-600" />
        <h3 className="font-semibold text-lg text-gray-800">Recent Nudges</h3>
        <Badge variant="secondary" className="text-xs">
          {nudges.length} {nudges.length === 1 ? 'nudge' : 'nudges'}
        </Badge>
      </div>
      <div className="space-y-2">
        {nudges.map(notification => (
          <NotificationItem key={notification._id || notification.id} item={notification} />
        ))}
      </div>
    </div>
  );
}

export default function ClientNudges() {
  const { id } = useParams()
  const { isLoading, data, error } = useSWR(`client/nudges/${id}`, () => retrieveClientNudges(id, { limit: Infinity }))
  const [selectedDays, setSelectedDays] = useState([])

  const { getCachedNotificationsForClientByContext } = useNotificationSchedulerCache()
  const cachedNotifications = getCachedNotificationsForClientByContext(id, 'client_nudges')

  if (isLoading) return <ContentLoader />

  if (error || data.status_code !== 200) return <ContentError title={error.message || data.message} />

  const apiNotifications = data?.data?.results || []
  const allNotifications = [...cachedNotifications, ...apiNotifications]

  const notifications = allNotifications
    .filter((notification, index, self) =>
      index === self.findIndex(n =>
        n.subject === notification.subject && n.message === notification.message
      )
    )
    .sort((a, b) => {
      const timeA = a.createdAt || a.createdDate || 0
      const timeB = b.createdAt || b.createdDate || 0
      return timeB - timeA
    })
  const groupedNudges = groupNudgesByDay(notifications)
  const recentNudges = getRecentNudges(notifications)

  const toggleDay = (day) => {
    setSelectedDays(prev =>
      prev.includes(day)
        ? prev.filter(d => d !== day)
        : [...prev, day]
    )
  }

  const selectAllDays = () => {
    setSelectedDays(days)
  }

  const clearAllDays = () => {
    setSelectedDays([])
  }

  // Determine what to show based on selection
  const showRecentView = selectedDays.length === 0
  const daysToShow = selectedDays.length === 0 ? [] : selectedDays

  return <div className="bg-white border-1 p-4 mt-8 rounded-[16px]">
    <div className="mb-4 flex items-center justify-between">
      <div>
        <h4>Client Nudges</h4>
        <p className="text-sm text-[#808080]">{notifications.length} total</p>
      </div>
      <ScheduleNotificationWrapper selectedClients={[id]}>
        <Button variant="wz">
          Add
        </Button>
      </ScheduleNotificationWrapper>
    </div>

    {/* Day Filter Buttons */}
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-sm font-medium text-gray-700">Filter by day:</span>
        <Button
          variant={showRecentView ? "wz" : "outline"}
          size="sm"
          onClick={clearAllDays}
          className="text-xs"
        >
          Recent
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={selectAllDays}
          className="text-xs"
        >
          All Days
        </Button>
      </div>
      <div className="flex flex-wrap gap-2">
        {days.map(day => (
          <Button
            key={day}
            variant={selectedDays.includes(day) ? "wz" : "outline"}
            size="sm"
            onClick={() => toggleDay(day)}
            className={cn(
              "text-xs font-medium transition-colors",
              selectedDays.includes(day)
                ? "bg-[var(--accent-1)] text-white hover:bg-[var(--accent-1)]/80"
                : "hover:bg-gray-50"
            )}
          >
            {day}
            {groupedNudges[day]?.length > 0 && (
              <Badge
                variant="secondary"
                className="ml-2 text-[10px] px-1 py-0"
              >
                {groupedNudges[day].length}
              </Badge>
            )}
          </Button>
        ))}
      </div>
    </div>

    <div className="space-y-6">
      {showRecentView ? (
        // Show recent nudges grouped by day
        <>
          {recentNudges.length > 0 ? (
            <RecentSection nudges={recentNudges} />
          ) : (
            <Card className="p-6 text-center text-muted-foreground">
              No recent nudges found.
            </Card>
          )}
        </>
      ) : (
        // Show selected days
        <>
          {daysToShow.map(day => {
            const dayNudges = groupedNudges[day];
            if (dayNudges.length === 0) return null;

            return (
              <DaySection key={day} dayName={day} nudges={dayNudges} />
            );
          })}
          {daysToShow.every(day => groupedNudges[day]?.length === 0) && (
            <Card className="p-6 text-center text-muted-foreground">
              No nudges found for the selected days.
            </Card>
          )}
        </>
      )}

      {notifications.length === 0 && <Card className="p-6 text-center text-muted-foreground">
        No notifications found.
      </Card>}
    </div>
  </div>
}

function DaySection({ dayName, nudges }) {
  return (
    <div className="border border-gray-200 rounded-lg p-4">
      <div className="flex items-center gap-2 mb-3">
        <Calendar className="w-4 h-4 text-blue-600" />
        <h3 className="font-semibold text-lg text-gray-800">{dayName}</h3>
        <Badge variant="secondary" className="text-xs">
          {nudges.length} {nudges.length === 1 ? 'nudge' : 'nudges'}
        </Badge>
      </div>
      <div className="space-y-2">
        {nudges.map(notification => (
          <NotificationItem key={notification._id || notification.id} item={notification} />
        ))}
      </div>
    </div>
  );
}

export function NotificationItem({ item = {} }) {
  const { id } = useParams()
  const { _id, message, subject, isRead, notificationType, schedule_type, time, date, createdAt } = item;

  const isCached = createdAt && !_id;
  const formatTime = (timeStr) => {
    if (!timeStr) return "";
    try {
      const time = timeStr.includes(':') ? timeStr.substring(0, 5) : timeStr;
      return time;
    } catch {
      return timeStr;
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    try {
      return format(parse(dateStr, "dd-MM-yyyy", new Date()), "MMM dd, yyyy");
    } catch {
      return dateStr;
    }
  };

  return (
    <Card
      className={cn("p-3 bg-white border border-gray-200 hover:shadow-sm transition-shadow", !isRead && "border-primary/20 ring-1 ring-primary/20")}
      role="article"
      aria-labelledby={`notif-${_id}-title`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            {!isRead ? (
              <Badge variant="outline" className="text-[8px] font-bold border-primary/30 bg-primary/10 text-primary" aria-label="Unread">
                Unread
              </Badge>
            ) : (
              <Badge variant="secondary" className="text-[8px] font-bold" aria-label="Read">
                Read
              </Badge>
            )}

            {schedule_type ? (
              <Badge variant="wz_fill" className="text-[8px] font-bold capitalize">
                {schedule_type}
              </Badge>
            ) : null}

            {time && (
              <div className="flex items-center gap-1 text-xs text-gray-600">
                <Clock className="w-3 h-3" />
                <span>{formatTime(time)}</span>
              </div>
            )}

            {date && schedule_type === "schedule" && (
              <div className="flex items-center gap-1 text-xs text-gray-600">
                <Calendar className="w-3 h-3" />
                <span>{formatDate(date)}</span>
              </div>
            )}
          </div>

          <h3 id={`notif-${_id}-title`} className="text-pretty text-base font-medium mb-1">
            {subject || "(no subject)"}
          </h3>

          <p className="text-sm leading-tight text-[#808080]">
            {message}
          </p>
        </div>
        <div className="shrink-0 flex items-center gap-2">
          <ScheduleNotificationWrapper selectedClients={[id]} defaultPayload={item}>
            <Pen className="w-[24px] h-[24px] text-white bg-[var(--accent-1)] p-[4px] rounded-[4px] cursor-pointer hover:bg-[var(--accent-1)]/80" />
          </ScheduleNotificationWrapper>
          <DeleteClientNotification id={item._id} />
        </div>
      </div>
    </Card>
  )
}

function DeleteClientNotification({ id }) {
  const { removeNotificationFromCache } = useNotificationSchedulerCache()

  async function deleteNotification(setLoading, closeBtnRef) {
    try {
      setLoading(true);
      const response = await sendData("app/notifications-schedule", { actionType: "DELETE", id }, "PUT");
      if (response.status_code !== 200) throw new Error(response.message);

      removeNotificationFromCache(id);

      toast.success(response.message);
      closeBtnRef.current.click();
      location.reload();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  }
  return <DualOptionActionModal
    description="Are you sure of deleting this notification!"
    action={(setLoading, btnRef) => deleteNotification(setLoading, btnRef)}
  >
    <AlertDialogTrigger>
      <Trash2 className="w-[24px] h-[24px] text-white bg-[var(--accent-2)] p-[4px] rounded-[4px] cursor-pointer hover:bg-[var(--accent-2)]/80" />
    </AlertDialogTrigger>
  </DualOptionActionModal>
}