import { sendData, sendDataWithFormData } from "@/lib/api";
import { _throwError } from "@/lib/formatter";

export const uploadChunks = async function (file, ytVideoDocRef, setProgress) {
  console.log(file)
  try {
    const CHUNK_SIZE = 5242880;
    const TOTAL_CHUNKS = Math.ceil(file.size / CHUNK_SIZE);
    const CHUNKS = []
    for (let index = 0; index < TOTAL_CHUNKS; index++) {
      const start = CHUNK_SIZE * index;
      const end = start + CHUNK_SIZE;
      CHUNKS.push(new File([file.slice(start, end)], file.name, { type: file.type }))
    }

    // console.log(CHUNKS)
    // throw new Error("notworking")
    let uploadedChunks = 0;
    for (const chunk of CHUNKS) {
      const { status, message } = await uploadChunk(ytVideoDocRef, chunk)
      if (!status) _throwError(message)
      uploadedChunks++
      setProgress(Math.ceil(uploadedChunks / TOTAL_CHUNKS * 100))
    }
    return { status: true }
  } catch (error) {
    return {
      status: false,
      message: error.message || "Something went wrong!"
    }
  }
}

export const uploadChunk = async function (ytVideoDocRef, chunk) {
  try {
    const payload = new FormData()
    payload.append("ytVideoDocRef", ytVideoDocRef)
    payload.append("chunk", chunk)
    const response = await sendDataWithFormData(
      "app/youtube/upload-videos",
      payload,
      "PUT"
    );
    if (response.status_code !== 200) _throwError(response.message);
    return { status: true }
  } catch (error) {
    return {
      status: false,
      message: error.message || "Something went wrong"
    }
  }
}

export const handleSessionVideoUpload = async function (response, videoConfig, setVideoConfig) {
  try {

    const ytSessionInitiateResponse = await sendData(
      "app/youtube/upload-videos",
      { fileSize: videoConfig.file?.size },
      "POST"
    )

    setVideoConfig(prev => ({ ...prev, status: "uploading" }))
    await sendData(`app/workout/session/${response?.data?._id}/video-upload`, {
      sessionId: response?.data?._id,
      ytVideoDocRef: ytSessionInitiateResponse?.ytDoc?._id
    })

    const { status, message } = await uploadChunks(
      videoConfig.file,
      ytSessionInitiateResponse?.ytDoc?._id,
      (value) => setVideoConfig(prev => ({ ...prev, uploadProgress: value }))
    )

    await sendData(
      `app/workout/session/${response?.data?._id}/video-upload`,
      {
        sessionId: response?.data?._id,
        ytVideoDocRef: ytSessionInitiateResponse?.ytDoc?._id,
      },
      "PUT"
    )
    setVideoConfig(prev => ({ ...prev, status: "upload-complete" }))
    return { status: true, message: "Video Saved Successfully!" }
  } catch (error) {
    return { status: false, message: error.message || "Something went wrong!" }
  }
}