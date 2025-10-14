"use client";
import ContentError from "@/components/common/ContentError";
import ContentLoader from "@/components/common/ContentLoader";
import ClientData from "@/components/pages/coach/client/ClientData";
import ClientDetailsCard from "@/components/pages/coach/client/ClientDetailsCard";
import { getAppClientPortfolioDetails } from "@/lib/fetchers/app";
import { useParams } from "next/navigation";
import useSWR from "swr";

export default function Page() {
  const { id } = useParams();
  const { isLoading, error, data } = useSWR(`clientDetails/${id}`, () => getAppClientPortfolioDetails(id));
  if (isLoading) return <ContentLoader />
  if (error || data.status_code !== 200) return <ContentError title={error || data.message} />
  const clientData = data.data;
  clientData.weightLoss = data.weightLost;
  return <div className="mt-4 grid md:grid-cols-2 items-start gap-4">
    <ClientDetailsCard clientData={clientData} />
    <ClientData clientData={clientData} />
  </div>
}