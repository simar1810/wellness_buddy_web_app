"use client";

import React, { useState, useMemo } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ChevronRight, ChevronDown, RefreshCw, ChevronsDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

/**
 * HierarchicalCoachTable Component
 * Displays coaches in a hierarchical table grouped by supervisor level
 */
export default function HierarchicalCoachTable({ coaches = [], onMakeTop }) {
  const [expandedLevels, setExpandedLevels] = useState(new Set([1])); // Level 1 expanded by default
  const [selectedCoaches, setSelectedCoaches] = useState(new Set());

  // Group coaches by supervisor level
  const groupedCoaches = useMemo(() => {
    const groups = {};

    coaches.forEach((coach) => {
      // Support multiple field names for supervisor level
      const level = coach.supervisorLevel || coach.level || coach.hierarchyLevel || 1;
      if (!groups[level]) {
        groups[level] = [];
      }
      groups[level].push(coach);
    });

    return groups;
  }, [coaches]);

  // Get sorted level keys
  const levels = useMemo(() => {
    return Object.keys(groupedCoaches).sort((a, b) => Number(a) - Number(b));
  }, [groupedCoaches]);

  // Toggle level expansion
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

  // Expand all levels
  const expandAll = () => {
    setExpandedLevels(new Set(levels.map(Number)));
  };

  // Show only first level
  const showFirstLevelOnly = () => {
    setExpandedLevels(new Set([1]));
  };

  // Toggle coach selection
  const toggleCoachSelection = (coachId) => {
    setSelectedCoaches((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(coachId)) {
        newSet.delete(coachId);
      } else {
        newSet.add(coachId);
      }
      return newSet;
    });
  };

  // Select all coaches in a level
  const toggleLevelSelection = (level) => {
    const levelCoaches = groupedCoaches[level] || [];
    const allSelected = levelCoaches.every((coach) => selectedCoaches.has(coach._id));

    setSelectedCoaches((prev) => {
      const newSet = new Set(prev);
      if (allSelected) {
        levelCoaches.forEach((coach) => newSet.delete(coach._id));
      } else {
        levelCoaches.forEach((coach) => newSet.add(coach._id));
      }
      return newSet;
    });
  };

  // Calculate visible downline count for a coach
  const getVisibleDownlineCount = (coach) => {
    return coach.visibleDownlineCount || coach.downlineCount || coach.visible_downline_count || 0;
  };

  // Get supervisor level for a coach
  const getSupervisorLevel = (coach) => {
    return coach.supervisorLevel || coach.level || coach.hierarchyLevel || 1;
  };

  return (
    <div className="space-y-4">
      {/* Legend Controls */}
      <div className="flex items-center gap-3 p-3 bg-white border rounded-md shadow-sm">
        <span className="font-semibold text-sm text-gray-700">Legend</span>
        <div className="flex items-center gap-2 ml-2">
          {/* <Checkbox className="w-3 h-3" /> */}
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

      {/* Hierarchical Table */}
      <div className="border rounded-md overflow-hidden bg-white">
        <Table>
          <TableHeader>
            <TableRow className="bg-[#4a5568] hover:bg-[#4a5568] border-b-2 border-gray-600">
              <TableHead className="text-white font-bold text-center w-[80px] py-3">Sr No.</TableHead>
              {/* <TableHead className="text-white font-bold w-[60px] py-3">
                <Checkbox
                  className="border-white"
                  checked={selectedCoaches.size === coaches.length && coaches.length > 0}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setSelectedCoaches(new Set(coaches.map((c) => c._id)));
                    } else {
                      setSelectedCoaches(new Set());
                    }
                  }}
                />
              </TableHead> */}
              <TableHead className="text-white font-bold py-3">Name</TableHead>
              <TableHead className="text-white font-bold text-center w-[180px] py-3">Supervisor Level</TableHead>
              <TableHead className="text-white font-bold text-center w-[220px] py-3">Visible Downline Count</TableHead>
              <TableHead className="text-white font-bold text-center w-[220px] py-3"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {levels.map((level) => {
              const levelNum = Number(level);
              const isExpanded = expandedLevels.has(levelNum);
              const levelCoaches = groupedCoaches[level] || [];
              const allLevelSelected = levelCoaches.every((coach) => selectedCoaches.has(coach._id));

              return (
                <React.Fragment key={level}>
                  {/* Level Header Row */}
                  <TableRow className="bg-[#e2e8f0] hover:bg-[#cbd5e0] border-y">
                    <TableCell colSpan={5} className="font-semibold py-2">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => toggleLevel(levelNum)}
                          className="p-0.5 hover:bg-gray-300 rounded transition-colors"
                        >
                          {isExpanded ? (
                            <ChevronDown className="w-4 h-4 text-blue-600" />
                          ) : (
                            <ChevronRight className="w-4 h-4 text-blue-600" />
                          )}
                        </button>
                        <span className="text-gray-800">Level {level}</span>
                        <span className="text-sm text-gray-600 ml-1">
                          ({levelCoaches.length} {levelCoaches.length === 1 ? 'coach' : 'coaches'})
                        </span>
                      </div>
                    </TableCell>
                  </TableRow>

                  {/* Level Coaches */}
                  {isExpanded &&
                    levelCoaches.map((coach, index) => {
                      const coachName = coach.name || `${coach.firstName || ''} ${coach.lastName || ''}`.trim() || 'Unknown';
                      return (
                        <TableRow key={coach._id || index} className="hover:bg-gray-50">
                          <TableCell className="text-center">{index + 1}</TableCell>
                          {/* <TableCell>
                            <Checkbox
                              checked={selectedCoaches.has(coach._id)}
                              onCheckedChange={() => toggleCoachSelection(coach._id)}
                            />
                          </TableCell> */}
                          <TableCell className="font-medium">
                            {coachName}
                          </TableCell>
                          <TableCell className="text-center">{getSupervisorLevel(coach)}</TableCell>
                          <TableCell className="text-center">
                            {getVisibleDownlineCount(coach)}
                          </TableCell>
                        </TableRow>
                      );
                    })}

                  {/* Level Total Row (shown when expanded) */}
                  {isExpanded && levelCoaches.length > 0 && (
                    <TableRow className="bg-blue-50 font-semibold border-b-2 border-blue-200">
                      <TableCell colSpan={4} className="text-right py-2 text-blue-900">
                        Level {level} Total:
                      </TableCell>
                      <TableCell className="text-center py-2 text-blue-900">
                        {levelCoaches.reduce((sum, coach) => sum + getVisibleDownlineCount(coach), 0)}
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              );
            })}

            {/* Empty state */}
            {levels.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                  No coaches found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Overall Summary */}
      {levels.length > 0 && (
        <div className="flex justify-end gap-6 text-sm font-semibold p-3 bg-blue-50 rounded-md border border-blue-200">
          <span className="text-gray-700">Total Coaches: <span className="text-blue-700">{coaches.length}</span></span>
          <span className="text-gray-700">
            Total Visible Downline:{" "}
            <span className="text-blue-700">{coaches.reduce((sum, coach) => sum + getVisibleDownlineCount(coach), 0)}</span>
          </span>
        </div>
      )}
    </div>
  );
}

