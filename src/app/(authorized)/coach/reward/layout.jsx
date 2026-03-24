"use client";

import { useAppSelector } from "@/providers/global/hooks";
import { ShieldAlert } from "lucide-react";

export default function Layout({ children }) {
  const { clubType } = useAppSelector(state => state.coach.data);
  if (!["System Leader"].includes(clubType)) return (
    <div className="content-container content-height-screen !mt-0 flex items-center justify-center">
      <div className="text-center space-y-4">
        <ShieldAlert className="mx-auto h-10 w-10 text-gray-500" />
        <h2 className="text-lg font-semibold">
          Access Restricted
        </h2>
        <p className="text-sm text-gray-500 max-w-sm">
          You do not have permission to access this feature.
          Please contact your system administrator if you believe this is an error.
        </p>
      </div>
    </div>
  )
  return children;
}