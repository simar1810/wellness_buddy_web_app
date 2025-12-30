"use client";
import { permit } from "@/lib/permit";
import { useAppSelector } from "@/providers/global/hooks";
import Image from "next/image";

export default function Layout({ children }) {
  const { roles, clubType, _id } = useAppSelector(state => state.coach.data);

  const clubFeaturesPermitted = permit("club", roles);
  if (!clubFeaturesPermitted && !["System Leader", "Club Leader"].includes(clubType)) return <div className="content-height-screen content-container">
    <div className="relative">
      <Image
        src="/illustrations/support.svg"
        alt=""
        height={300}
        width={300}
        className="object-contain mx-auto mt-24"
      />
      <p className="text-center mt-4 font-medium text-[#808080]">Access to this page is restricted</p>
    </div>
  </div>

  return children
}