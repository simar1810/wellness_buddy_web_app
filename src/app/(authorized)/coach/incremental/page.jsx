"use client";
import useSWR, { mutate } from "swr";
import { useState } from "react";
import toast from "sonner"
import { sendData } from "@/lib/api";
import DualOptionActionModal from "@/components/modals/DualOptionActionModal";
import { retrieveIncrement } from "@/lib/fetchers/app";
import ContentError from "@/components/common/ContentError";
import ContentLoader from "@/components/common/ContentLoader";
import { useAppSelector } from "@/providers/global/hooks";

const clubTypes = ["System Leader", "Club Leader", "Club Captain"];

function ClubTypeSelect({ selectedFor, clubType, coachId }) {
  const [selected, setSelected] = useState(clubType || "");

  const handleChange = (e) => {
    setSelected(e.target.value);
  };

  async function updateCoachClubType(setLoading, closeRef) {
    try {
      setLoading(true);
      const { data: response } = await sendData("way-to-wellness/increment", {
        clubType: selectedFor,
        coachId,
      }, "PUT");
      if (response.status_code !== 200) throw new Error(response.message);
      toast.success(response.message);
      mutate("way-to-wellness/increment");
      closeRef.current.click();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex w-full items-center gap-2">
      {clubType !== selected && (
        <DualOptionActionModal
          description="Are you sure you want to change the club type of this coach?"
          action={updateCoachClubType}
          onClose={() => { }}
          defaultOpen={false}
        >
          <button className="rounded-[10px] bg-green-600 px-4 py-2 font-bold leading-tight text-white">
            Accept
          </button>
        </DualOptionActionModal>
      )}
    </div>
  );
}

function CoachCard({ selectedFor, coach }) {
  return (
    <div className="rounded-2xl border bg-white p-4 shadow-sm">
      <div className="mb-2 font-medium">{coach.coach}</div>
      <div className="mb-4 text-sm text-gray-600">{coach.mobileNumber}</div>
      <ClubTypeSelect
        selectedFor={selectedFor}
        clubType={coach.clubType}
        coachId={coach._id}
      />
    </div>
  );
}

function CoachList({ increments }) {
  const totalCoaches = Object.values(increments).flat().length;

  if (totalCoaches === 0) {
    return (
      <div className="box-container flex h-96 font-bold items-center justify-center">
        <p className="text-gray-500">No coaches available to display</p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {Object.entries(increments).map(([role, coaches]) =>
        coaches.length > 0 ? (
          <div key={role}>
            <h2 className="mb-3 text-lg font-semibold">{role}</h2>
            <div className="space-y-4">
              {coaches.map((coach) => (
                <CoachCard
                  selectedFor={role}
                  key={coach._id}
                  coach={coach}
                />
              ))}
            </div>
          </div>
        ) : null
      )}
    </div>
  );
}

export default function Page() {
  const { _id } = useAppSelector(state => state.coach.data)

  const {
    isLoading,
    error,
    data = {},
  } = useSWR("way-to-wellness/increment", () => retrieveIncrement({ coachId: _id }));

  if (isLoading) return <ContentLoader />;

  if (error || data.status_code !== 200) return <ContentError
    title={error?.message || data.message}
  />;

  return (
    <div className="p-4">
      <CoachList increments={data.data} />
    </div>
  );
}
