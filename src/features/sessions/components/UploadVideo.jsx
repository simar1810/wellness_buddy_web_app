import React, { useRef } from 'react';
import { Upload, FileVideo, X } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import UploadProgress from './UploadProgress';

export default function UploadVideo({
  formData,
  handleInputChange,
  videoConfig,
  setVideoConfig
}) {
  const inputVideoRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setVideoConfig(prev => ({
        ...prev,
        file: file
      }));
      handleInputChange("videoFile", file);
    }
  };

  const clearFile = (e) => {
    e.stopPropagation();
    setVideoConfig(prev => ({ ...prev, file: null }));
    if (inputVideoRef.current) inputVideoRef.current.value = "";
  };

  const canSelectFile = videoConfig.status === "idle"

  return (
    <div className="w-full">
      <input
        type="file"
        accept="video/*"
        onChange={handleFileChange}
        hidden
        ref={inputVideoRef}
      />

      <div
        onClick={() => {
          if (canSelectFile) inputVideoRef.current.click()
        }}
        className={`
          relative h-[120px] w-full rounded-[10px] border-1 border-dashed 
          transition-all duration-200 flex flex-col items-center justify-center gap-2
          ${canSelectFile && "cursor-pointer"}
          ${videoConfig.file
            ? "border-blue-500 bg-blue-50/30 dark:bg-blue-900/10"
            : "border-slate-200 bg-slate-50 hover:border-slate-400 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900"}
        `}
      >
        {videoConfig.file ? (
          <>
            <div className="overflow-clip flex items-center gap-3 px-4">
              <div className="rounded-[6px] bg-blue-500 p-2 text-white">
                <FileVideo size={20} />
              </div>
              <div className="flex flex-col overflow-hidden">
                <span className="max-w-[300px] truncate text-ellipsis text-sm font-medium text-slate-700 dark:text-slate-200">
                  {videoConfig.file.name}
                </span>
                <span className="text-xs text-slate-500">
                  {(videoConfig.file.size / (1024 * 1024)).toFixed(2)} MB
                </span>
              </div>
              <button
                onClick={clearFile}
                className="ml-2 rounded-full p-1 hover:bg-slate-200 dark:hover:bg-slate-700"
              >
                <X size={16} className="text-slate-500" />
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="rounded-full bg-white p-2 shadow-sm dark:bg-slate-800">
              <Upload size={18} className="text-slate-600 dark:text-slate-400" />
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                Click to upload video
              </p>
              <p className="text-xs text-slate-500">MP4, MOV up to 50MB</p>
            </div>
          </>
        )}
      </div>
      {["initiate-uploading", "uploading", "upload-complete"].includes(videoConfig.status) && <Progress
        className="mt-4"
        value={videoConfig.uploadProgress}
      />}
      <UploadProgress videoConfig={videoConfig} />
    </div>
  );
}