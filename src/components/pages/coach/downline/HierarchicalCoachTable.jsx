"use client";
import React, { useState, useMemo, useRef } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ChevronRight,
  ChevronDown,
  RefreshCw,
  ChevronsDown,
  ChevronUp,
  Eye,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { SyncCoachComponent } from "@/app/(authorized)/coach/downline/page";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { sendData } from "@/lib/api";
import { mutate } from "swr";
import DualOptionActionModal from "@/components/modals/DualOptionActionModal";
import { AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { useAppSelector } from "@/providers/global/hooks";

export default function HierarchicalCoachTable({ coaches = [], onMakeTop }) {
  const [expandedLevels, setExpandedLevels] = useState(new Set([1]));
  const groupedCoaches = useMemo(() => {
    const groups = {};

    coaches.forEach((coach) => {
      const level = coach.downline.depth;
      if (!groups[level]) {
        groups[level] = [];
      }
      groups[level].push(coach);
    });

    return groups;
  }, [coaches]);

  const levels = useMemo(() => {
    return Object.keys(groupedCoaches).sort((a, b) => Number(a) - Number(b));
  }, [groupedCoaches]);

  const toggleLevel = (level) => {
    setExpandedLevels((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(level)) {
        newSet.delete(level);
      } else {
        newSet.add(level);
      }
      return newSet;
    });
  };

  const expandAll = () => {
    setExpandedLevels(new Set(levels.map(Number)));
  };

  const showFirstLevelOnly = () => {
    setExpandedLevels(new Set([1]));
  };

  const getVisibleDownlineCount = (coach) => {
    return (
      coach.visibleDownlineCount ||
      coach.downlineCount ||
      coach.visible_downline_count ||
      0
    );
  };

  const getSupervisorLevel = (coach) => {
    return coach.supervisorLevel || coach.level || coach.hierarchyLevel || 1;
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col items-start md:items-center gap-1 md:gap-3 p-3 bg-white border rounded-md shadow-sm">
        <span className="font-semibold text-sm text-gray-700">Legend</span>
        <div className="flex flex-wrap items-center justify-start gap-1 md:gap-3">
          <div className="flex items-center gap-2 md:ml-2">
            <span className="text-xs text-gray-600">= Make Top</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={expandAll}
            className="flex items-center gap-1 text-xs h-8 px-2"
          >
            <ChevronsDown className="w-3 h-3" />
            Expand All Levels
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={showFirstLevelOnly}
            className="flex items-center gap-1 text-xs h-8 px-2"
          >
            <ChevronUp className="w-3 h-3" />
            Show 1st Level Only
          </Button>
        </div>
      </div>

      <div className="border rounded-md overflow-hidden bg-white space-y-4">
        {levels.map((level, index) => (
          <LevelTable
            key={index}
            level={level}
            expandedLevels={expandedLevels}
            groupedCoaches={groupedCoaches}
            toggleLevel={toggleLevel}
          />
        ))}
      </div>

      {levels.length > 0 && (
        <div className="flex justify-end gap-6 text-sm font-semibold p-3 bg-blue-50 rounded-md border border-blue-200">
          <span className="text-gray-700">
            Total Coaches:{" "}
            <span className="text-blue-700">{coaches.length}</span>
          </span>
          <span className="text-gray-700">
            Total Visible Downline:{" "}
            <span className="text-blue-700">
              {coaches.reduce(
                (sum, coach) => sum + getVisibleDownlineCount(coach),
                0,
              )}
            </span>
          </span>
        </div>
      )}
    </div>
  );
}

function LevelTable({ expandedLevels, level, groupedCoaches, toggleLevel }) {
  const levelNum = Number(level);
  const isExpanded = expandedLevels.has(levelNum);
  const levelCoaches = groupedCoaches[level] || [];
  const { clubType } = useAppSelector(state => state.coach.data)

  const hasEditAccess = (coachClubType) => ["System Leader", "Club Leader", "Club Leader Jr"].includes(clubType) &&
    (["Club Leader", "Club Leader Jr"].includes(coachClubType) ? clubType === "System Leader" : true)

  return (
    <Table>
      <TableHeader>
        <TableRow className="text-white bg-[#4a5568] hover:bg-[#4a5568] border-b-2 border-gray-600">
          <TableCell colSpan={8} className="font-semibold py-2">
            <button
              onClick={() => toggleLevel(levelNum)}
              className="w-full flex items-center gap-2 cursor-pointer"
            >
              <div className="p-0.5 hover:bg-gray-300 rounded transition-colors">
                {isExpanded ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </div>
              <span className="text-white">Level {level}</span>
              <span className="text-sm text-gray-600 ml-1">
                ({levelCoaches.length}{" "}
                {levelCoaches.length === 1 ? "coach" : "coaches"})
              </span>
            </button>
          </TableCell>
        </TableRow>
      </TableHeader>

      <React.Fragment>
        {isExpanded && (
          <TableHeader>
            <TableRow className="bg-[#e2e8f0] hover:bg-[#cbd5e0] border-y">
              <TableHead className="text-gray-800 font-bold text-center w-[80px] py-3">
                Sr No.
              </TableHead>
              <TableHead className="text-gray-800 font-bold py-3">
                Name
              </TableHead>
              <TableHead className="text-gray-800 font-bold text-center w-[180px] py-3">
                Club Type
              </TableHead>
              <TableHead className="text-gray-800 font-bold text-center w-[220px] py-3">
                Sync Status
              </TableHead>
              <TableHead className="text-gray-800 font-bold text-center w-[220px] py-3">
                Subscription Status
              </TableHead>
              <TableHead className="text-gray-800 font-bold text-center w-[220px] py-3">
                Personal Subscriptions
              </TableHead>
              <TableHead className="text-gray-800 font-bold text-center w-[220px] py-3">
                Cluster Subscriptions
              </TableHead>
              <TableHead className="text-gray-800 font-bold text-center w-[220px] py-3"></TableHead>
            </TableRow>
          </TableHeader>
        )}
        <TableBody>
          {isExpanded &&
            levelCoaches.map((coach, index) => {
              const coachName =
                coach.name ||
                `${coach.firstName || ""} ${coach.lastName || ""}`.trim() ||
                "Unknown";
              return (
                <TableRow key={coach._id || index} className="hover:bg-gray-50">
                  <TableCell className="text-center">{index + 1}</TableCell>
                  <TableCell className="hover:underline text-gray-900 font-bold">
                    <Link href={`/coach/downline/coach/${coach._id}`}>
                      {coachName}
                    </Link>
                  </TableCell>
                  <TableCell className="text-center">
                    {hasEditAccess(coach.clubType)
                      ? <UpdateCoachClubType coach={coach} />
                      : coach.clubType}
                  </TableCell>
                  <TableCell className="flex justify-center">
                    <SyncCoachComponent coach={coach} />
                  </TableCell>
                  <TableCell className="text-center font-bold">
                    {coach?.clubSubscription?.status === "Active" ? (
                      <Badge variant="wz_fill">Active</Badge>
                    ) : (
                      <Badge variant="destructive">In Active</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    {!isNaN(coach?.downlineAnalytics?.clientSubscriptions) ? coach?.downlineAnalytics?.clientSubscriptions : 0}
                  </TableCell>
                  <TableCell className="text-center">
                    {!isNaN(coach?.downlineAnalytics?.clusterSubscriptions?.clientSubscriptions)
                      ? coach?.downlineAnalytics?.clusterSubscriptions?.clientSubscriptions
                      : 0}
                  </TableCell>
                  <TableCell className="">
                    <div className="flex items-center justify-end gap-2 pr-8">
                      <Link href={`/coach/downline/coach/${coach._id}`}>
                        <Eye className="w-[20px] h-[20px] mx-auto" />
                      </Link>
                      {hasEditAccess(coach.clubType)
                        && <DeleteDownlineCoach coachId={coach._id} />}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}

          {isExpanded && levelCoaches.length > 0 && (
            <TableRow className="bg-blue-50 font-semibold border-b-2 border-blue-200">
              <TableCell />
              <TableCell colSpan={6} className="text-right py-2 text-blue-900">
                Level {level} Total:
              </TableCell>
              <TableCell className="text-center py-2 text-blue-900">
                {levelCoaches?.length}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </React.Fragment>
    </Table>
  );
}
const CLUB_TYPES = [
  "System Leader",
  "Club Leader",
  "Club Leader Jr",
  "Club Captain",
  "Wellness Coach",
  "Gold Member",
  "Silver Member",
];

function UpdateCoachClubType({ coach }) {
  const [selected, setSelected] = useState(coach.clubType || "Wellness Coach");
  const [loginDevices, setLoginDevices] = useState(coach.login_sessions);
  const [loading, setLoading] = useState(false);

  const closeRef = useRef();

  async function handleUpdate() {
    try {
      setLoading(true);
      const payload = {
        coachId: coach._id,
        clubType: selected,
        loginDevices: !isNaN(loginDevices) ? loginDevices : 0,
      };
      const response = await sendData("app/downline/coach/club-type", payload);
      if (response.status_code !== 200) throw new Error(response.message);
      toast.success("Club type updated successfully!");
      mutate("app/downline/coaches");
      closeRef.current.click();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="text-sm font-medium capitalize"
        >
          {coach.clubType || "Wellness Coach"}
        </Button>
      </DialogTrigger>

      <DialogContent className="p-0 max-w-[400px] gap-0">
        <DialogTitle className="p-4 border-b text-lg font-semibold">
          Update Club Type
        </DialogTitle>

        <div className="p-4 space-y-1">
          <div>Club Type</div>
          <Select value={selected} onValueChange={setSelected}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select club type" />
            </SelectTrigger>
            <SelectContent>
              {CLUB_TYPES.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button onClick={handleUpdate} disabled={loading} className="mt-4 w-full">
            {loading ? "Updating..." : "Update Club Type"}
          </Button>
        </div>
        <DialogClose ref={closeRef} />
      </DialogContent>
    </Dialog>
  );
}

function DeleteDownlineCoach({ coachId }) {
  async function deleteDownlineCoach(setLoading, btnRef) {
    try {
      setLoading(true);
      const response = await sendData(
        "app/downline/coach-manage",
        { coachId },
        "DELETE",
      );
      if (response.status_code !== 200) throw new Error(response.message);
      toast.success(response.message);
      location.reload();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  }
  return (
    <DualOptionActionModal
      title="Delete Coach"
      description="Are you sure you want to delete this coach? This action cannot be undone."
      action={(setLoading, btnRef) => deleteDownlineCoach(setLoading, btnRef)}
    >
      <AlertDialogTrigger asChild>
        <Trash2
          className="w-[16px] h-[16px] text-[var(--accent-2)] cursor-pointer"
          strokeWidth={2.5}
        />
      </AlertDialogTrigger>
    </DualOptionActionModal>
  );
}