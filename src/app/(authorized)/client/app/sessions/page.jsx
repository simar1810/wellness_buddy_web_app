"use client"
import ContentError from "@/components/common/ContentError";
import ContentLoader from "@/components/common/ContentLoader";
import YouTubeEmbed from "@/components/common/YoutubeEmbed";
import { getWzSessions } from "@/lib/fetchers/app";
import { format } from "date-fns";
import useSWR from "swr";

export default function Page() {
  const { isLoading, error, data } = useSWR("wzsessions", () => getWzSessions("client"));

  if (isLoading) return <ContentLoader />

  if (error || data?.status_code !== 200) return <ContentError title={error || data?.message} />
  const sessions = data.data;

  return <div className="content-container content-height-screen">
    <h4 className="mb-6">Sessions</h4>
    <div className="grid grid-cols-3 gap-x-4 gap-y-8">
      {sessions.map(session => <div key={session._id}>
        <div className="max-h-[40vh]">
          <YouTubeEmbed link={session.videoUrl} />
        </div>
        <h2>{session.name}</h2>
        <p>{session.day},&nbsps;{format(session.date, "MMM d, yyyy 'at' hh:mm a")}</p>
        <div className="flex gap-4 items-center">
          <p>Trainer: {session.trainerName}</p>
          <p>Type: {session.workoutType}</p>
        </div>
      </div>)}
    </div>
  </div>
}