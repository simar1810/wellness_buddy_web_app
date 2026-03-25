"use client";
import useSWR from "swr";
import ContentLoader from "@/components/common/ContentLoader";
import ContentError from "@/components/common/ContentError";
import { fetchData } from "@/lib/api";
import { copyText } from "@/lib/utils";
import { RefreshCcw } from "lucide-react";
import DeleteCoachHealthMatrix from "@/features/coach-health-matrix/components/DeleteCoachHealthMatrix";
import CreateHealthMatrix from "@/features/coach-health-matrix/components/CreateCoachHealthMatrix";
import UpdateCoachHealthMatrix from "@/features/coach-health-matrix/components/UpdateCoachHealthMatrix";

export default function Page() {
  const { isLoading, error, data, mutate } = useSWR(
    "app/coach/health-matrix",
    () => fetchData("app/coach/health-matrix"),
  );

  if (isLoading) return <ContentLoader />;
  if (error || data.status_code !== 200)
    return <ContentError title={error || data.message} />;

  const matrices = data.data.healthMatrix || [];

  return (
    <div className="content-container content-height-screen mt-0 space-y-6">

      <div className="flex items-center justify-between border rounded-2xl px-6 py-4 bg-white">
        <div>
          <h1 className="text-lg font-semibold">Health Matrices</h1>
          <p className="text-sm text-muted-foreground">
            Manage and track all body metrics
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => mutate()}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border text-sm hover:bg-gray-50 transition"
          >
            <RefreshCcw className="w-4 h-4" />
            Refresh
          </button>
          <CreateHealthMatrix />
        </div>
      </div>

      <div className="border rounded-2xl bg-white overflow-hidden">
        {matrices.length === 0 ? (
          <div className="h-[300px] flex items-center justify-center text-muted-foreground text-sm">
            No health matrices available
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr className="text-left">
                  <th className="px-6 py-3 font-medium">Date</th>
                  <th className="px-6 py-3 font-medium">Weight</th>
                  <th className="px-6 py-3 font-medium">Height</th>
                  <th className="px-6 py-3 font-medium">BMI</th>
                  <th className="px-6 py-3 font-medium">Fat</th>
                  <th className="px-6 py-3 font-medium">Muscle</th>
                  <th className="px-6 py-3 font-medium">Visceral Fat</th>
                  <th className="px-6 py-3 font-medium">RM</th>
                  <th className="px-6 py-3 font-medium">Body Age</th>
                  <th className="px-6 py-3 font-medium">Ideal Weight</th>
                  <th className="px-6 py-3 font-medium">Composition</th>
                  <th className="px-6 py-3 font-medium">Actions</th>
                </tr>
              </thead>

              <tbody>
                {matrices.map((item) => (
                  <tr
                    key={item._id}
                    className="border-b hover:bg-gray-50 transition"
                  >
                    <td className="px-6 py-4">{item.createdDate}</td>
                    <td className="px-6 py-4">
                      {item.weight} {item.weightUnit}
                    </td>
                    <td className="px-6 py-4">
                      {item.height} {item.heightUnit}
                    </td>
                    <td className="px-6 py-4">{item.bmi}</td>
                    <td className="px-6 py-4">{item.fat}%</td>
                    <td className="px-6 py-4">{item.muscle}%</td>
                    <td className="px-6 py-4">{item.visceral_fat}</td>
                    <td className="px-6 py-4">{item.rm}</td>
                    <td className="px-6 py-4">{item.bodyAge}</td>
                    <td className="px-6 py-4">
                      {item.ideal_weight} kg
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 rounded-full text-xs bg-black text-white">
                        {item.body_composition}
                      </span>
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <UpdateCoachHealthMatrix
                          currentSWRKey={"app/coach/health-matrix"}
                          matrix={item}
                        />
                        <DeleteCoachHealthMatrix
                          currentSWRKey={"app/coach/health-matrix"}
                          matrixId={item._id}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}