export default function UploadProgress({ videoConfig }) {
  return <div className="mt-6 space-y-3 animate-in fade-in slide-in-from-top-2 duration-500">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        {videoConfig.status === "uploading" ? (
          <div className="h-2 w-2 animate-pulse rounded-full bg-blue-500" />
        ) : (
          <div className="h-2 w-2 rounded-full bg-green-500" />
        )}
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          {videoConfig.status === "upload-complete" ? "Uploaded" : "Uploading Video"}
        </span>
      </div>
      <span className="text-sm font-mono font-medium text-slate-700 dark:text-slate-300">
        {Math.round(videoConfig.uploadProgress)}%
      </span>
    </div>
    <div className="relative h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
      <div
        className={`h-full transition-all duration-500 ease-out ${videoConfig.status === "upload-complete"
          ? "bg-green-500"
          : "bg-blue-600 shadow-[0_0_8px_rgba(37,99,235,0.4)]"
          }`}
        style={{ width: `${videoConfig.uploadProgress}%` }}
      />
      {videoConfig.status === "uploading" && (
        <div className="absolute inset-0 animate-shimmer bg-gradient-to-r from-transparent via-white/20 to-transparent"
          style={{ backgroundSize: '200% 100%' }}
        />
      )}
    </div>
    {videoConfig.status === "upload-complete" && <p className="text-[11px] text-slate-400">
      Upload successful. You can now proceed.
    </p>}
  </div>
}