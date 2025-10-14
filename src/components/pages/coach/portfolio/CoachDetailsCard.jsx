import {
  Avatar,
  AvatarFallback,
  AvatarImage
} from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardHeader
} from "@/components/ui/card";
import {
  Clipboard,
  Link2,
} from "lucide-react";
import { coachPortfolioFields } from "@/config/data/ui";
import UpdateCoachAboutModal from "@/components/modals/coach/UpdateCoachAboutModal";
import UpdateCoachSpecializationModal from "@/components/modals/coach/UpdateCoachSpecializationModal";
import Link from "next/link";
import UpdatePersonalDetails from "@/components/modals/coach/UpdateDetailsModal";
import { Button } from "@/components/ui/button";
import { copyText } from "@/lib/utils";
import { useAppSelector } from "@/providers/global/hooks";
import { toast } from "sonner";

const COACH_WEBSITE_BASE_LINK = "https://app.waytowellness.in"

export default function CoachDetailsCard({ coachData }) {
  const { coachId } = useAppSelector(state => state.coach.data);

  function copyInviteLink() {
    copyText(`Hey! 👋

I just joined *Wellness Buddy*, an amazing wellness & coaching app 💚

Register now using my link and let’s begin your health journey together 💪👇
https://app.waytowellness.in/app/coachCode?coachID=${coachId}`)
    toast.success("Invite Link copied")
  }

  return <Card className="bg-white rounded-[18px] shadow-none">
    <CardHeader className="relative flex items-start gap-4 md:gap-8">
      <Avatar className="w-[100px] h-[100px]">
        <AvatarImage src={coachData.profilePhoto} />
        <AvatarFallback>SN</AvatarFallback>
      </Avatar>
      <div>
        <h4 className="my-2">{coachData.name}</h4>
        <p className="text-[14px] text-[var(--dark-2)] font-semibold leading-[1] mb-2">
          <Button
            onClick={() => {
              copyText(coachId)
              toast.success("Coach ID copied")
            }}
            variant="icon"
            className="text-[var(--accent-1)] h-auto py-0"
          >
            <Clipboard className="w-[20px] h-[20px]" strokeWidth={3} />
          </Button>
          ID #{coachData.coachId}
        </p>
      </div>
    </CardHeader>
    <CardContent>
      <div className="flex items-center justify-between">
        <h4>About</h4>
        <UpdateCoachAboutModal defaultValue={coachData.about} />
      </div>
      <p className="text-[14px] text-[var(--dark-2)] leading-[1.3] mt-2 pb-4 border-b-1">{coachData.about}</p>
      <div className="mt-4 flex items-center justify-between">
        <h4>Specialization</h4>
        <UpdateCoachSpecializationModal defaultValue={coachData.specialization} />
      </div>
      <p className="text-[14px] text-[var(--dark-2)] leading-[1.3] mt-2 pb-4 border-b-1">{coachData.specialization}</p>
      <div className="mt-4 flex items-center justify-between">
        <h4>Personal Information</h4>
        <UpdatePersonalDetails coachData={coachData} />
      </div>
      <div className="mt-4 pl-4 pb-4 border-b-1">
        {coachPortfolioFields.map(field => <div key={field.id} className="text-[13px] mb-1 grid grid-cols-4 items-center gap-2">
          <p>{field.title}</p>
          <p className="text-[var(--dark-2)] col-span-2">:&nbsp;{coachData[field.name]}</p>
        </div>)}
      </div>
      <div className="mt-4 flex items-center justify-between">
        <h4>Personal Portfolio</h4>
        <Link
          target="_blank"
          href={`${COACH_WEBSITE_BASE_LINK}/${coachData.coachId}`}
          className="bg-[var(--accent-1)] text-white text-[14px] font-bold px-3 py-1 flex items-center gap-2 rounded-[4px]"
        >
          <Link2 />
          Go To Store
        </Link>
      </div>
      <div className="mt-4 flex items-center justify-between">
        <h4>Invite Link</h4>
        <Button
          variant="wz"
          className="w-auto h-auto py-1 !font-bold gap-2 rounded-[4px]"
          onClick={copyInviteLink}
        >
          <Link2 size={48} className="!w-[24px] !h-[24px]" />
          Invite Link
        </Button>
      </div>
    </CardContent>
  </Card>
}