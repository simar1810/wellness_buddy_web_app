import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import UploadVideo from "./UploadVideo";

export default function SessionVideoURLComponent({
  formData,
  handleInputChange,
  videoConfig,
  setVideoConfig
}) {
  return <div className="space-y-2">
    <div className="flex flex-col gap-2.5">
      <div className="flex items-center justify-between">
        <Label
          htmlFor="update-videoUrl"
          className="text-sm font-medium text-slate-700 dark:text-slate-300"
        >
          Video Source
        </Label>
        <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50/50 p-1.5 px-2 dark:border-slate-800 dark:bg-slate-900/50">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            YouTube
          </span>
          <Switch
            disabled={videoConfig.status === "uploading"}
            checked={videoConfig.videoType === "yt"}
            className="ml-auto"
            onCheckedChange={() => setVideoConfig(prev => ({
              ...prev,
              videoType: videoConfig.videoType === "yt"
                ? "link"
                : "yt"
            }))}
          />
        </div>
      </div>
    </div>
    <Container
      formData={formData}
      handleInputChange={handleInputChange}
      videoConfig={videoConfig}
      setVideoConfig={setVideoConfig}
    />
  </div>
}

function Container({
  formData,
  handleInputChange,
  videoConfig,
  setVideoConfig
}) {
  if (videoConfig.videoType === "link") {
    return (
      <Input
        id="update-videoUrl"
        type="url"
        value={formData.videoUrl}
        onChange={(e) => handleInputChange("videoUrl", e.target.value)}
        placeholder="https://example.com/video"
      />
    )
  }

  return <UploadVideo
    formData={formData}
    handleInputChange={handleInputChange}
    videoConfig={videoConfig}
    setVideoConfig={setVideoConfig}
  />
}