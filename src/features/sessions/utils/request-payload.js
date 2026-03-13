export const buildSessionCreationPayload = function (
  formData,
  videoConfig,
  action = "create"
) {
  return {
    name: formData.name,
    trainerName: formData.trainerName,
    day: formData.day,
    date: formData.date,
    workoutType: formData.workoutType,
    time: formData.time,
    availability: formData.availability,
    status: formData.status,
    videoType: videoConfig.videoType,
    ...(action === "update" && { sessionId: formData.sessionId }),
    videoUrl: videoConfig.videoType === "link"
      ? formData.videoUrl
      : ""
  }
}