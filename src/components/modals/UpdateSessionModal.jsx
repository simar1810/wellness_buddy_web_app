"use client"

import { useRef, useState } from "react"
import { Dialog, DialogClose, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import SelectMultiple from "@/components/SelectMultiple"
import { useAppSelector } from "@/providers/global/hooks"
import { toast } from "sonner"
import { mutate } from "swr"
import { ExternalLink, Pen, RefreshCcw, Youtube } from "lucide-react"
import { format } from "date-fns"
import { sendData } from "@/lib/api"
import SessionVideoURLComponent from "@/features/sessions/components/SessionVideoURLComponent"
import { buildSessionCreationPayload } from "@/features/sessions/utils/request-payload"
import { handleSessionVideoUpload } from "@/features/sessions/utils/file-upload"

export default function UpdateSessionModal({ session }) {
  const { client_categories } = useAppSelector((state) => state.coach.data)
  const [videoConfig, setVideoConfig] = useState({
    videoType: session.videoType, // link, yt
    status: "idle", // idle, initiate-uploading, uploading, upload-complete
    file: "",
    uploadProgress: 0
  })
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    sessionId: session._id,
    name: session.name || "",
    trainerName: session.trainerName || "",
    day: session.day || "",
    date: format(new Date(session.date), "yyyy-MM-dd"),
    workoutType: session.workoutType || "",
    time: session.time || "",
    videoUrl: session.videoUrl || "",
    availability: session.availability || [],
    status: session.status || "active"
  })

  const closeBtnRef = useRef()

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const availabilityOptions = [
    { id: 1, name: "All Client", value: "client" },
    ...client_categories.map((category, index) => ({
      id: index + 2,
      name: category.name,
      value: category.name,
    })),
  ]

  async function saveSession() {
    try {
      setIsLoading(true);

      if (videoConfig.videoType === "yt" && !(videoConfig.file instanceof File)) {
        throw new Error("Please select a video to proceed!")
      }

      const payload = buildSessionCreationPayload(formData, videoConfig, "update")
      const response = await sendData("app/workout/sessions", payload, "PUT");
      if (response.status_code !== 200) throw new Error(response.message);

      if (videoConfig.videoType === "yt") {
        setVideoConfig(prev => ({ ...prev, status: "initiate-uploading" }))
        await handleSessionVideoUpload(response, videoConfig, setVideoConfig);
      }

      mutate("sessions");
      toast.success(response.message || "Successfull")
      setVideoConfig(prev => ({ ...prev, status: "idle" }))
      closeBtnRef.current.click();
    } catch (error) {
      console.error(error)
      toast.error(error.message || "Something went wrong!");
    } finally {
      setIsLoading(false);
    }
  }

  const handleUpdateSession = async (e) => {
    e.preventDefault()
    if (!session) return
    await saveSession()
  }

  return (
    <Dialog>
      <DialogTrigger>
        <Pen className="w-[16px] h-[16px] cursor-pointer hover:scale-[1.1] text-[var(--accent-1)]" />
      </DialogTrigger>
      <DialogContent className="max-w-[450px] max-h-[85vh] overflow-y-auto">
        <DialogTitle>Update Session</DialogTitle>

        <form onSubmit={handleUpdateSession} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="update-name">Session Name</Label>
            <Input
              id="update-name"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              placeholder="Enter session name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="update-trainerName">Trainer Name</Label>
            <Input
              id="update-trainerName"
              value={formData.trainerName}
              onChange={(e) => handleInputChange("trainerName", e.target.value)}
              placeholder="Enter trainer name"
              required
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="update-day">Day</Label>
              <Select value={formData.day} onValueChange={(value) => handleInputChange("day", value)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select day" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Monday">Monday</SelectItem>
                  <SelectItem value="Tuesday">Tuesday</SelectItem>
                  <SelectItem value="Wednesday">Wednesday</SelectItem>
                  <SelectItem value="Thursday">Thursday</SelectItem>
                  <SelectItem value="Friday">Friday</SelectItem>
                  <SelectItem value="Saturday">Saturday</SelectItem>
                  <SelectItem value="Sunday">Sunday</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="update-status">Status</Label>
              <Select value={formData.status} onValueChange={(value) => handleInputChange("status", value)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">In Active</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="update-time">Time</Label>
              <Input
                id="update-time"
                type="time"
                value={formData.time}
                onChange={(e) => handleInputChange("time", e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="update-date">Date</Label>
            <Input
              id="update-date"
              type="date"
              value={formData.date}
              onChange={(e) => handleInputChange("date", e.target.value)}
              required
            />
          </div>

          <div className="gap-4 grid grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="update-workoutType">Workout Type</Label>
              <Select value={formData.workoutType} onValueChange={(value) => handleInputChange("workoutType", value)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select workout type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="strength">Strength Training</SelectItem>
                  <SelectItem value="cardio">Cardio</SelectItem>
                  <SelectItem value="yoga">Yoga</SelectItem>
                  <SelectItem value="pilates">Pilates</SelectItem>
                  <SelectItem value="hiit">HIIT</SelectItem>
                  <SelectItem value="crossfit">CrossFit</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="update-availability">Availability</Label>
              <SelectMultiple
                options={availabilityOptions}
                value={formData.availability}
                onChange={(value) => handleInputChange("availability", value)}
                className="mb-4"
              />
            </div>
          </div>

          <SessionVideoURLComponent
            formData={formData}
            handleInputChange={handleInputChange}
            videoConfig={videoConfig}
            setVideoConfig={setVideoConfig}
          />

          {
            session.videoUrl &&
            videoConfig.videoType === "yt" &&
            <ExternalYoutubeLinkDisplay setVideoConfig={setVideoConfig} session={session} />
          }

          <div className="flex gap-2 pt-4">
            <Button type="submit" variant="wz" className="flex-1" disabled={isLoading}>
              {isLoading ? "Updating..." : "Update Session"}
            </Button>
          </div>
        </form>
        <DialogClose ref={closeBtnRef} />
      </DialogContent>
    </Dialog>
  )
}


function ExternalYoutubeLinkDisplay({ session, setVideoConfig }) {
  return (
    <div className="mt-4 max-w-[450px] animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="group relative overflow-hidden rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:border-red-200 dark:border-slate-800 dark:bg-slate-950">

        <div className="flex items-center gap-4">
          <div className="relative flex h-16 w-24 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-slate-900 shadow-inner">
            <Youtube size={28} className="text-red-600 group-hover:scale-110 transition-transform" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          </div>

          <div className="flex flex-1 flex-col min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-red-600">
                YouTube Source
              </span>
              <span className="h-1 w-1 rounded-full bg-slate-300" />
              <span className="text-[10px] font-medium text-slate-400">Linked</span>
            </div>

            <h4 className="truncate !text-sm font-medium text-slate-700 dark:text-slate-200 mt-0.5">
              {session.videoUrl}
            </h4>

            <div className="mt-2 flex items-center gap-3">
              <a
                href={session.videoUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400"
              >
                View Video <ExternalLink size={12} />
              </a>
            </div>
          </div>
        </div>

        <div className="absolute -right-4 -top-4 opacity-[0.03] transition-opacity group-hover:opacity-[0.08]">
          <Youtube size={100} />
        </div>
      </div>
    </div>
  )
}