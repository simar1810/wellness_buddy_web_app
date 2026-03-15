"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import SelectMultiple from "@/components/SelectMultiple";
import { useAppSelector } from "@/providers/global/hooks";
import { sendData } from "@/lib/api";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { mutate } from "swr";
import SessionVideoURLComponent from "@/features/sessions/components/SessionVideoURLComponent";
import { buildSessionCreationPayload } from "@/features/sessions/utils/request-payload";
import { handleSessionVideoUpload, uploadChunks } from "@/features/sessions/utils/file-upload";

export default function SessionsPage() {
  const { client_categories } = useAppSelector(state => state.coach.data);
  const [videoConfig, setVideoConfig] = useState({
    videoType: "link", // link, yt
    status: "idle", // idle, initiate-uploading, uploading, upload-complete
    file: "",
    uploadProgress: 0
  })

  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    trainerName: "",
    day: "",
    date: "",
    workoutType: "",
    time: "",
    videoUrl: "",
    availability: [],
    status: "active"
  });

  const router = useRouter()

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const availabilityOptions = [
    { id: 1, name: "All Client", value: "client" },
    ...client_categories.map((category, index) => ({
      id: index + 2,
      name: category.name,
      value: category.name
    }))
  ]

  async function createSession() {
    try {
      setIsLoading(true);

      if (videoConfig.videoType === "yt" && !(videoConfig.file instanceof File)) {
        throw new Error("Please select a video to proceed!")
      }

      const payload = buildSessionCreationPayload(formData, videoConfig, "create")
      const response = await sendData("app/workout/sessions", payload);
      if (response.status_code !== 200) throw new Error(response.message);

      if (videoConfig.videoType === "yt") {
        setVideoConfig(prev => ({ ...prev, status: "initiate-uploading" }))
        await handleSessionVideoUpload(response, videoConfig, setVideoConfig);
      }

      mutate("sessions");
      router.push("/coach/workouts/sessions/list")
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="content-container content-height-screen">
      <div className="max-w-[650px] mx-auto">

        <div className="bg-[var(--comp-2)] p-4 border-2 rounded-[10px] space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Session Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              placeholder="Enter session name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="trainerName">Trainer Name</Label>
            <Input
              id="trainerName"
              value={formData.trainerName}
              onChange={(e) =>
                handleInputChange("trainerName", e.target.value)
              }
              placeholder="Enter trainer name"
              required
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="day">Day</Label>
              <Select
                value={formData.day}
                onValueChange={(value) => handleInputChange("day", value)}
              >
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
              <Label htmlFor="time">Time</Label>
              <Input
                id="time"
                type="time"
                value={formData.time}
                onChange={(e) => handleInputChange("time", e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) => handleInputChange("date", e.target.value)}
              required
            />
          </div>

          <div className="gap-4 grid grid-cols-1 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="workoutType">Workout Type</Label>
              <Select
                value={formData.workoutType}
                onValueChange={(value) =>
                  handleInputChange("workoutType", value)
                }
                className="w-full block"
              >
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
              <Label htmlFor="availability">Availability</Label>
              <SelectMultiple
                options={availabilityOptions}
                value={formData.availability}
                onChange={value => handleInputChange("availability", value)}
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

          <Button
            onClick={createSession}
            variant="wz"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? "Creating..." : "Create Session"}
          </Button>
        </div>
      </div>
    </div>
  );
}
