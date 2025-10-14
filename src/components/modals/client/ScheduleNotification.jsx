import { Textarea } from "@/components/ui/textarea";
import { sendData } from "@/lib/api";
import { format, parse } from "date-fns";
import FormControl from "@/components/FormControl";
import SelectControl from "@/components/Select";
import SelectMultiple from "@/components/SelectMultiple";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { RadioGroup } from "@/components/ui/radio-group";
import { toast } from "sonner";
import useSWR from "swr";
import { retrieveCoachClientList, retrieveClientNudges } from "@/lib/fetchers/app";
import Loader from "@/components/common/Loader";
import TimePicker from "@/components/common/TimePicker";
import { CircleMinus, CirclePlus, Clock, Calendar } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useNotificationSchedulerCache } from "@/hooks/useNotificationSchedulerCache";

export default function ScheduleNotificationWrapper({
  children,
  selectedClients,
  defaultPayload = {}
}) {
  const { data, isLoading, error } = useSWR("coach-client-list", () => retrieveCoachClientList())

  if (isLoading) return <Loader />

  if (error || data.status_code !== 200) {
    toast.error(data.message || error || "Something went wrong!")
    return
  }

  const clients = (data.data || []).map((client, index) => ({
    id: index + 1,
    name: client.name,
    value: client._id
  }))

  return <ScheduleNotification
    children={children}
    selectedClients={selectedClients}
    clients={clients}
    defaultPayload={defaultPayload}
  />
}

function formatDate(date) {
  if (!date) return ""
  try {
    const parsedDate = parse(date, "dd-MM-yyyy", new Date())
    // Check if the parsed date is valid
    if (isNaN(parsedDate.getTime())) {
      return ""
    }
    return format(parsedDate, "yyyy-MM-dd")
  } catch (error) {
    return ""
  }
}

function formatTime(timeStr) {
  if (!timeStr) return "00:00:00"
  
  try {
    // Handle TimePicker format (hh:mm a) - like "02:30 PM"
    if (timeStr.match(/^\d{1,2}:\d{2}\s+(AM|PM)$/i)) {
      const parsed = parse(timeStr, "hh:mm a", new Date())
      return format(parsed, "HH:mm:ss")
    }
    
    // Handle 24-hour format (HH:mm) - like "14:30"
    if (timeStr.match(/^\d{2}:\d{2}$/)) {
      return `${timeStr}:00`
    }
        if (timeStr.match(/^\d{2}:\d{2}:\d{2}$/)) {
      return timeStr
    }
    
    return "00:00:00"
  } catch (error) {
    return "00:00:00"
  }
}


function ScheduleNotification({
  children,
  clients,
  selectedClients,
  defaultPayload
}) {
  const [loading, setLoading] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const subjectRef = useRef(null);
  const dropdownRef = useRef(null);
  
  const { 
    addNotificationToCache, 
    getCachedNotificationsByContext, 
    getCachedNotificationsForClientByContext 
  } = useNotificationSchedulerCache();

  const [payload, setPayload] = useState({
    subject: defaultPayload.subject || "",
    message: defaultPayload.message || "",
    notificationType: defaultPayload.schedule_type || "schedule",
    time: defaultPayload.time || "",
    date: formatDate(defaultPayload.date),
    reocurrence: defaultPayload.reocurrence || [],
    clients: selectedClients || defaultPayload.clients || [],
    actionType: Boolean(defaultPayload?._id) ? "UPDATE" : undefined,
    id: Boolean(defaultPayload?._id) ? defaultPayload._id : undefined
  })

  const clientId = selectedClients?.[0];
  const isClientNudgesContext = !!clientId;
  const context = isClientNudgesContext ? 'client_nudges' : 'notifications';
  
  const cachedHistory = clientId 
    ? getCachedNotificationsForClientByContext(clientId, context)
    : getCachedNotificationsByContext(context);
  const { data: apiHistoryData } = useSWR(
    clientId ? `client/nudges/history/${clientId}` : null,
    () => retrieveClientNudges(clientId, { limit: 50 })
  );
  
  const apiHistoryNudges = apiHistoryData?.data?.results || [];
  const allHistoryNudges = [...cachedHistory, ...apiHistoryNudges];
  
  const uniqueHistoryNudges = allHistoryNudges
    .filter((nudge, index, self) => 
      index === self.findIndex(n => 
        n.subject === nudge.subject && n.message === nudge.message
      )
    )
    .sort((a, b) => {
      const timeA = a.createdAt || a.createdDate || 0;
      const timeB = b.createdAt || b.createdDate || 0;
      return timeB - timeA;
    });

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target) && 
          subjectRef.current && !subjectRef.current.contains(event.target)) {
        setShowHistory(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleHistorySelect = (nudge) => {
    setPayload(prev => ({
      ...prev,
      subject: nudge.subject || "",
      message: nudge.message || "",
      notificationType: nudge.schedule_type || nudge.notificationType || "schedule",
      time: nudge.time ? nudge.time.substring(0, 5) : "",
      date: nudge.date ? formatDate(nudge.date) : "",
      reocurrence: nudge.reocurrence || [],
      clients: nudge.clients || []
    }));
    setShowHistory(false);
  };

  async function scheduleNotification() {
    const toastId = toast.loading("Please wait...")
    try {
      setLoading(true);
      const formData = generatePayload(payload);
      const response = await sendData(
        `app/notifications-schedule`,
        formData,
        defaultPayload._id ? "PUT" : "POST"
      );
      if (response.status_code !== 200) throw new Error(response.message);
      
      if (!defaultPayload._id) {
        const clientNames = payload.clients.map(clientId => {
          const client = clients.find(c => c.value === clientId);
          return client ? client.name : `Client ${clientId}`;
        });

        addNotificationToCache({
          subject: payload.subject,
          message: payload.message,
          notificationType: payload.notificationType,
          time: payload.time,
          date: payload.date,
          reocurrence: payload.reocurrence,
          clients: payload.clients,
          clientNames: clientNames
        }, context);
      }
      
      toast.success(response.message);
      location.reload()
    } catch (error) {
      toast.error(error.message);
      toast.dismiss(toastId);
    } finally {
      setLoading(false);
      toast.dismiss(toastId);
    }
  }

  return <Dialog>
    <DialogTrigger asChild>
      <span>
        {!children && <Button className="font-bold">Schedule</Button>}
        {children}
      </span>
    </DialogTrigger>
    <DialogContent className="!max-w-[450px] max-h-[65vh] border-0 p-0 overflow-auto">
      <DialogTitle className="bg-[var(--comp-2)] py-6 h-[56px] border-b-1 text-black text-[20px] ml-5">
        {defaultPayload._id ? "Update Client Nudges" : "Add Client Nudges"}
      </DialogTitle>
      <div className="px-4 pb-8">
        <div className="relative mb-4">
          <Label className="text-[14px] mb-2 block">
            Subject
            {uniqueHistoryNudges.length > 0 && (
              <span className="text-xs text-gray-500 ml-2">({uniqueHistoryNudges.length} history available)</span>
            )}
          </Label>
          <input
            ref={subjectRef}
            type="text"
            placeholder="Subject"
            value={payload.subject}
            onChange={e => setPayload(prev => ({ ...prev, subject: e.target.value }))}
            onFocus={() => uniqueHistoryNudges.length > 0 && setShowHistory(true)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-[var(--comp-1)]"
          />
          {showHistory && uniqueHistoryNudges.length > 0 && (
            <div 
              ref={dropdownRef}
              className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-80 overflow-y-auto"
            >
              <div className="px-3 py-2 bg-gray-50 border-b border-gray-200 rounded-t-lg">
                <div className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                  Notification History
                </div>
                <div className="text-xs text-gray-500">
                  {uniqueHistoryNudges.length} {uniqueHistoryNudges.length === 1 ? 'item' : 'items'} available
                </div>
              </div>
              {uniqueHistoryNudges.map((nudge, index) => (
                <div
                  key={index}
                  onClick={() => handleHistorySelect(nudge)}
                  className="px-4 py-3 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0 last:rounded-b-lg transition-colors duration-150"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="font-semibold text-sm text-gray-900 flex-1 truncate">
                      {nudge.subject}
                    </div>
                    <div className="flex items-center gap-1">
                      {nudge.schedule_type && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          {nudge.schedule_type}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="text-sm text-gray-600 mb-2" style={{
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}>
                    {nudge.message}
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {nudge.time && (
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Clock className="w-3 h-3" />
                          <span>{nudge.time.substring(0, 5)}</span>
                        </div>
                      )}
                      {nudge.date && nudge.schedule_type === "schedule" && (
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Calendar className="w-3 h-3" />
                          <span>{nudge.date}</span>
                        </div>
                      )}
                    </div>
                    
                    {(nudge.clientNames && nudge.clientNames.length > 0) && (
                      <div className="text-xs text-blue-600 font-medium bg-blue-50 px-2 py-1 rounded-full">
                        {nudge.clientNames.length} client{nudge.clientNames.length > 1 ? 's' : ''}
                      </div>
                    )}
                  </div>
                  
                  {nudge.clientNames && nudge.clientNames.length > 0 && (
                    <div className="mt-2 text-xs text-gray-600">
                      <span className="font-medium">Clients:</span> {nudge.clientNames.join(', ')}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="mb-4">
          <Label className="text-[14px] mb-2 block">Message</Label>
          <Textarea
            placeholder="Message"
            value={payload.message}
            onChange={e => setPayload(prev => ({ ...prev, message: e.target.value }))}
            className="h-[120px] bg-[var(--comp-1)]"
          />
        </div>
        <div className="mb-4">
          <Label className="text-[14px] mb-2 block">Notification Type</Label>
          <RadioGroup className="flex flex-wrap items-center gap-x-6">
            <div className="flex items-center gap-1">
              <input
                type="radio"
                id="notification-type-schedule"
                onChange={() => setPayload(prev => ({ ...prev, notificationType: "schedule" }))}
                checked={payload.notificationType === "schedule"}
              />
              <Label htmlFor="notification-type-schedule">Schedule</Label>
            </div>
            <div className="flex items-center gap-1">
              <input
                type="radio"
                id="notification-type-reocurr"
                onChange={() => setPayload(prev => ({ ...prev, notificationType: "reocurr" }))}
                checked={payload.notificationType === "reocurr"}
              />
              <Label htmlFor="notification-type-reocurr">Reocurr</Label>
            </div>
          </RadioGroup>
        </div>
        
        {(!selectedClients || selectedClients?.length <= 0) && (
          <div className="mb-4">
            <SelectMultiple
              label="Select Clients"
              options={clients}
              value={payload.clients}
              onChange={value => setPayload(prev => ({ ...prev, clients: value }))}
              className="[&_.option]:px-4 [&_.option]:py-2"
              selectAll={true}
            />
          </div>
        )}
        <div className="mb-4">
          <Label className="text-[14px] mb-2 block">Time</Label>
          <TimePicker
            selectedTime={payload.time}
            setSelectedTime={value => setPayload(prev => ({ ...prev, time: value }))}
          />
        </div>
        
        {payload.notificationType === "schedule" && (
          <div className="mb-4">
            <FormControl
              label="Date"
              value={payload.date}
              onChange={e => setPayload(prev => ({ ...prev, date: e.target.value }))}
              type="date"
              className="[&_.input]:bg-[var(--comp-1)]"
            />
          </div>
        )}
        {payload.notificationType === "reocurr" && (
          <NotificationRepeat
            formData={{ reocurrence: payload.reocurrence }}
            dispatch={setPayload}
          />
        )}
        <div className="flex gap-2 mt-4">
          <Button
            onClick={scheduleNotification}
            disabled={loading}
            variant="wz"
          >
            {defaultPayload._id ? "Update" : "Save"}
          </Button>
        </div>
      </div>
    </DialogContent>
  </Dialog>
}

function generatePayload(payload) {
  for (const field of ["subject", "message", "time"]) {
    if (!payload[field]) throw new Error(`${field} is mandatory.`);
  }
  
  if (payload.notificationType === "reocurr") {
    const result = {
      subject: payload.subject,
      message: payload.message,
      notificationType: "reocurr",
      schedule_type: "reocurr",
      time: formatTime(payload.time),
      reocurrence: payload.reocurrence,
      clients: payload.clients
    };
    
    // Only add actionType and id if they have values
    if (payload.actionType) result.actionType = payload.actionType;
    if (payload.id) result.id = payload.id;
    
    return result;
  } else if (payload.notificationType === "schedule") {
    if (!payload.date) throw new Error(`date is mandatory.`);
    
    try {
      const parsedDate = parse(payload.date, "yyyy-MM-dd", new Date());
      if (isNaN(parsedDate.getTime())) {
        throw new Error("Invalid date format");
      }
      
      const result = {
        subject: payload.subject,
        message: payload.message,
        notificationType: "schedule",
        schedule_type: "schedule",
        date: format(parsedDate, "dd-MM-yyyy"),
        time: formatTime(payload.time),
        clients: payload.clients
      };
      
      // Only add actionType and id if they have values
      if (payload.actionType) result.actionType = payload.actionType;
      if (payload.id) result.id = payload.id;
      
      return result;
    } catch (error) {
      throw new Error(`Invalid date format: ${payload.date}`);
    }
  }
  throw new Error("Type of notification is mandatory.")
}

const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function NotificationRepeat({
  formData: { reocurrence = [] },
  dispatch
}) {
  return <div className="mb-4">
    <div className="mb-2 text-[14px]">Repeat</div>
    <div className="w-full flex items-center gap-2 overflow-x-auto no-scrollbar">
      {days.map((day, index) => <Badge
        variant="wz_fill"
        className={`rounded-full border-0 font-bold cursor-pointer ${!reocurrence.includes(index) && "text-[var(--dark-1)]/25 bg-[var(--comp-1)] opacity-50"}`}
        key={index}
        onClick={reocurrence.includes(index)
          ? () => dispatch(prev => ({ ...prev, reocurrence: reocurrence.filter(item => item !== index) }))
          : () => dispatch(prev => ({ ...prev, reocurrence: [...reocurrence, index] }))
        }>
        <span>{day}</span>
        {reocurrence.includes(index)
          ? <CircleMinus className="w-[12px] h-[12px]" />
          : <CirclePlus className="w-[12px] h-[12px]" />}
      </Badge>)}
    </div>
  </div>
}