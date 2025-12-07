"use client"
import ContentError from "@/components/common/ContentError"
import { useAppSelector } from "@/providers/global/hooks"

export default function Layout({ children }) {
  const { clubType } = useAppSelector(state => state.coach.data)

  if (!["System Leader", "Club Leader", "Club Leader Jr", "Club Captain"].includes(clubType)) {
    return <ContentError title="You are not authorized to access this page" />
  }
  return children
}