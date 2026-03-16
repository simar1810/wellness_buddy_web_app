import { fetchData } from "@/lib/api";
import useSWR from "swr";
import FormSelect from "./FormSelect";

export default function SelectClient({ selectedClient, onChange }) {
  const { isLoading, error, data } = useSWR("app/clients-list", () =>
    fetchData("app/downline/clients-list/admin"),
  );
  if (isLoading)
    return (
      <div className="flex justify-center">
        <div
          style={{ clipPath: "polygon(0% 0%, 100% 100%, 0% 100%)" }}
          className="w-8 aspect-square border-4 border-[#1C8CB8] rounded-full animate-spin"
        />
      </div>
    );
  if (error || data?.status_code !== 200) {
    return (
      <div className="text-sm text-gray-800">
        {error || data?.message || "Something went wrong"}
      </div>
    );
  }
  const clients = Array.isArray(data?.data) ? data.data : [];

  return (
    <FormSelect
      label="Client"
      value={selectedClient}
      onChange={onChange}
      options={clients.map((client) => ({
        label: client.name,
        value: client._id,
        clientId: client.clientId,
        mobileNumber: client.mobileNumber,
      }))}
      placeholder="ObjectId"
    />
  );
}
