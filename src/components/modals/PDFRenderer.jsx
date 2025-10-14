"use client"
import PDFComparison from "@/components/pages/coach/client/PDFComparison";
import PDFShareStatistics from "@/components/pages/coach/client/PDFShareStatistics";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import PDFInvoice from "../pages/coach/meals/PDFInvoice";
import PDFMealPlan from "../pages/coach/meals/PDFMealPlan";
import useSWR from "swr";
import { getPersonalBranding } from "@/lib/fetchers/app";
import ContentLoader from "../common/ContentLoader";
import ContentError from "../common/ContentError";
import { getBase64ImageFromUrl } from "@/lib/image";
import { useEffect, useState } from "react";

const Templates = {
  PDFComparison,
  PDFShareStatistics,
  PDFInvoice,
  PDFMealPlan
}

export default function PDFRenderer({ children, pdfTemplate, data }) {
  const Component = Templates[pdfTemplate]
  return <Dialog>
    {children}
    <DialogContent className="h-[95vh] min-w-[95vw] border-b-0 p-0 block gap-0 overflow-y-auto">
      <DialogHeader className="p-0 z-100">
        <DialogTitle className="text-[24px]" />
      </DialogHeader>
      <Container
        Component={Component}
        pdfData={data}
      />
    </DialogContent>
  </Dialog>
}

function Container({ Component, pdfData }) {
  const [brandLogo, setBrandLogo] = useState("");
  const { isLoading, error, data } = useSWR("app/personalBranding", getPersonalBranding);

  const brands = data?.data;
  const lastIndex = brands?.length - 1
  useEffect(function () {
    if (brands?.at(lastIndex)?.brandLogo) getBase64ImageFromUrl(brands[lastIndex]?.brandLogo).then(setBrandLogo)
  }, [brands])

  if (isLoading) return <ContentLoader />

  if (error || data?.status_code !== 200) return <ContentError title={error.message || data?.message} />
  return <Component
    data={pdfData}
    brand={{
      ...(brands[0] || {}),
      brandLogo,
      primaryColor: `#${brands[lastIndex]?.primaryColor?.slice(0, 6)}` || "#000000",
      textColor: `#${brands[lastIndex]?.textColor?.slice(0, 6)}` || "#000000",
    }}
  />
}