"use client";
import ContentError from "@/components/common/ContentError";
import ContentLoader from "@/components/common/ContentLoader";
import AssignWorkoutModal from "@/components/modals/AssignModal";
import CreateWorkoutModal from "@/components/modals/tools/CreateWorkoutModal";
import { Button } from "@/components/ui/button";
import { DialogTrigger } from "@/components/ui/dialog";
import { getWorkoutDetails } from "@/lib/fetchers/app";
import { useAppSelector } from "@/providers/global/hooks";
import { Pause, Pencil, SkipBack, SkipForward } from "lucide-react";
import Image from "next/image";
import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import useSWR from "swr";

export default function Page() {
  const { id } = useParams();
  const { isLoading, error, data } = useSWR(`app/getWorkoutDetails/${id}`, () => getWorkoutDetails(id));

  if (isLoading) return <ContentLoader />

  if (error || data?.status_code !== 200) return <ContentError title={error || data?.message} />
  const workoutDetails = data.data[0];
  return <div className="content-container">
    <div className="p-4 grid grid-cols-1 md:grid-cols-2 md:divide-x-1">
      <WorkoutDetails workoutDetails={workoutDetails} />
      {workoutDetails.workouts.length > 0 && <WorkoutVideos workouts={workoutDetails.workouts} />}
    </div>
  </div>
}

function WorkoutDetails({ workoutDetails }) {
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const MAX_LENGTH = 350;
  if (!Boolean(workoutDetails)) return <ContentError title="No Workout Details Found" />
  const instructions = workoutDetails.instructions || "";
  const isLong = instructions.length > MAX_LENGTH;
  const visibleText = expanded ? instructions : instructions.slice(0, MAX_LENGTH);
  return <div className="md:pr-10 mb-5">
    <div className="flex flex-col md:flex-row gap-2 md:gap-0 mb-2 md:mb-0 justify-between">
      <h4>{workoutDetails.title}</h4>
      <CreateWorkoutModal setModal={() => setOpen()} defaultOpen={open} data={workoutDetails}>
        <DialogTrigger
          className="bg-[var(--accent-1)] text-white w-18 md:w-auto text-[14px] font-bold pl-4 pr-4 py-1 flex items-center gap-1 rounded-[8px]"
        >
          <Pencil className="w-[16px]" />
          Edit
        </DialogTrigger>
      </CreateWorkoutModal>
    </div>
    <AssignWorkoutModal type="normal" workoutId={workoutDetails._id} />
    <Image
      src={workoutDetails.thumbnail.replaceAll(" ", "")}
      alt=""
      width={1024}
      height={1024}
      className="w-full max-h-[300px] mt-4 object-cover border-1 rounded-[10px]"
    />
    <h4 className="!text-[28px] mt-6 mb-2">Instructions</h4>
      <p className="text-[12px] leading-[1.4]">
        {visibleText}
        {!expanded && isLong && "... "}
        {isLong && (
          <button
            className="text-zinc-500 ml-1 underline"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? "Show Less" : "Read More"}
          </button>
        )}
      </p>
    {/* <h4 className="!text-[28px] mt-6 mb-2">Related Videos</h4>
    <div className="w-full flex gap-4 overflow-x-auto">
      {workoutDetails.workouts.map(workout => <div className="min-w-[200px] border-1 rounded-[8px] overflow-clip" key={workout._id}>
        <Image
          src={workout.thumbnail.replaceAll(" ", "")}
          alt=""
          height={540}
          width={540}
          className="w-full h-[120px] border-b-1 object-cover"
        />
        <div className="p-2">
          <h3 className="mb-1 leading-[1]">{workout.title}</h3>
          <p className="text-[12px] leading-[1.2] text-[var(--dark-1)]/35">{workout.description}</p>
        </div>
      </div>)}
    </div> */}
  </div>
}

function WorkoutVideos({ workouts }) {
  const [selected, setSelected] = useState(0);

  const filteredWorkouts = workouts
    .filter(workout => Boolean(workout.video_link));
  const workoutVideo = filteredWorkouts[selected]
  if (filteredWorkouts.length <= 0) return <></>
  return <div className="md:ml-10">
    <h3 className="mb-4">{workoutVideo.title}</h3>
    <VideoPlayer
      src={workoutVideo.video_link}
      prev={() => selected === 0
        ? toast.error("This is the first video")
        : setSelected(prev => prev - 1)}
      next={() => setSelected(prev => prev === filteredWorkouts.length - 1
        ? prev
        : prev + 1)}
    />
    <div className="max-h-[60 0px] mt-10 overflow-y-auto">
      {filteredWorkouts
        .filter(workout => Boolean(workout.video_link))
        .map((workout, index) => <div className="mb-4 flex flex-col md:flex-row items-start cursor-pointer" onClick={() => setSelected(index)} key={workout._id}>
          <Image
            src={workout.thumbnail.replaceAll(" ", "")}
            alt=""
            height={540}
            width={540}
            className="w-full h-[200px] md:w-[180px] md:h-[120px] border-1 object-cover"
          />
          <div className="p-2">
            <h3 className="mb-1 leading-[1]">{workout.title}</h3>
            <p className="text-[14px] leading-[1.2] text-[var(--dark-1)]/35">{workout.description}</p>
          </div>
        </div>)}
    </div>
  </div>
}

export function VideoPlayer({
  src,
  prev,
  next,
}) {
  const videoRef = useRef(null);

  function togglePause() {
    if (videoRef.current.paused) {
      videoRef.current.play()
    } else {
      videoRef.current.pause();
    }
  }

  useEffect(() => {
    if (videoRef.current) {
      try {
        videoRef.current.load();
        videoRef.current.play().catch()
      } catch (error) { }
    }
  }, [src]);

  return (
    <div className="w-full mx-auto p-1">
      <video
        key={src}
        width="100%"
        className="h-[400px] bg-black"
        ref={videoRef}
        onEnded={next}
      >
        <source src={src} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      <div className="mt-4 flex gap-4">
        {prev && <Button onClick={prev} variant="wz" className="grow">
          <SkipBack />
         <span className="hidden md:block">Previous</span>
        </Button>}
        {togglePause && <Button onClick={togglePause} variant="wz" className="grow">
          <Pause />
          <span className="hidden md:block">Pause / Play</span>
        </Button>}
        {next && <Button onClick={() => next(true)} variant="wz" className="grow">
          <SkipForward />
          <span className="hidden md:block">Next</span>
        </Button>}
      </div>
    </div>
  );
};