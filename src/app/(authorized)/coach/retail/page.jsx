"use client";
import ContentError from "@/components/common/ContentError";
import ContentLoader from "@/components/common/ContentLoader";
import RetailMarginDropDown from "@/components/drop-down/RetailMarginDropDown";
import FormControl from "@/components/FormControl";
import DualOptionActionModal from "@/components/modals/DualOptionActionModal";
import PDFRenderer from "@/components/modals/PDFRenderer";
import AddRetailModal from "@/components/modals/tools/AddRetailModal";
import { UpdateClientOrderAmount } from "@/components/pages/coach/client/ClientData";
import { AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList } from "@/components/ui/tabs";
import { sendData } from "@/lib/api";
import { excelRetailOrdersData, exportToExcel } from "@/lib/excel";
import { getOrderHistory, getRetail } from "@/lib/fetchers/app";
import { buildUrlWithQueryParams } from "@/lib/formatter";
import { invoicePDFData } from "@/lib/pdf";
import { cn } from "@/lib/utils";
import { useAppSelector } from "@/providers/global/hooks";
import { TabsTrigger } from "@radix-ui/react-tabs";
import { parse } from "date-fns";
import { Clock, EllipsisVertical, Eye, EyeClosed } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import useSWR from "swr";

export default function Page() {
  const { isWhitelabel } = useAppSelector(state => state.coach.data)

  const {
    isLoading: retailLoading,
    error: retailError,
    data: retailData
  } = useSWR("app/coach-retail", () => getRetail(isWhitelabel ? "thewellnessspot" : false));
  const {
    isLoading: ordersLoading,
    error: ordersError,
    data: ordersData
  } = useSWR("app/order-history", getOrderHistory);
  if (retailLoading || ordersLoading) return <ContentLoader />

  if (
    ordersError || retailError ||
    retailData.status_code !== 200 || ordersData.status_code !== 200
  ) return <ContentError title={ordersError || retailError || ordersData.message || retailData.message} />

  const retails = retailData.data;
  const orders = ordersData.data;

  return <div className="mt-4">
    <RetailStatisticsCards
      totalSales={retails.totalSale}
      totalOrders={orders.myOrder.length}
    />
    <div className="content-container">
      <RetailContainer
        orders={ordersData.data}
        retails={retails}
      />
    </div>
  </div>
}

function RetailStatisticsCards({ totalSales, totalOrders }) {
  const [hide, setHide] = useState(true);
  return <div className="grid grid-cols-3 gap-4">
    <Card className="bg-linear-to-tr from-[var(--accent-1)] to-[#04BE51] p-4 rounded-[10px]">
      <CardHeader className="text-white p-0 mb-0">
        <CardTitle className="">
          <span className="w-full">Total Sales</span>
          {hide
            ? <EyeClosed
              className="w-[16px] h-[16px] cursor-pointer inline-block ml-auto"
              onClick={() => setHide(false)}
            />
            : <Eye
              className="w-[16px] h-[16px] cursor-pointer inline-block ml-auto"
              onClick={() => setHide(true)}
            />}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <h4 className={cn("text-white !text-[28px]", hide && "text-transparent")}>₹ {totalSales}</h4>
      </CardContent>
    </Card>
    <Card className="p-4 rounded-[10px] shadow-none">
      <CardHeader className="p-0 mb-0">
        <CardTitle>Total Orders</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <h4 className="!text-[28px]">₹ {totalOrders}</h4>
      </CardContent>
    </Card>
  </div>
}

function RetailContainer({ orders, retails }) {
  return <Tabs defaultValue="brands">
    <TabsList className="w-full bg-transparent p-0 mb-4 flex justify-start gap-4 border-b-2 rounded-none">
      <TabsTrigger
        className="pb-4 px-4 font-semibold rounded-none data-[state=active]:bg-transparent data-[state=active]:text-[var(--accent-1)] data-[state=active]:shadow-none data-[state=active]:!border-b-2 data-[state=active]:border-b-[var(--accent-1)]"
        value="brands"
      >
        New Order
      </TabsTrigger>
      <TabsTrigger
        className="pb-4 px-4 font-semibold rounded-none data-[state=active]:bg-transparent data-[state=active]:text-[var(--accent-1)] data-[state=active]:shadow-none data-[state=active]:!border-b-2 data-[state=active]:border-b-[var(--accent-1)]"
        value="order-history"
      >
        Order History
      </TabsTrigger>
    </TabsList>
    <Brands brands={retails.brands} />
    <Orders orders={orders} />
  </Tabs>
}

function Brands({ brands }) {
  return <TabsContent value="brands">
    <div className="flex items-center gap-2 justify-between">
      <h4>Brands</h4>
      {/* <Button variant="wz" size="sm">
        <Plus />
        Add New Kit
      </Button> */}
    </div>
    <div className="mt-4 grid grid-cols-6">
      {brands.map(brand => <Brand key={brand._id} brand={brand} />)}
    </div>
  </TabsContent>
}

function Brand({
  brand,
  children
}) {
  const [margin, setMargin] = useState();
  const coachId = useAppSelector(state => state.coach.data._id);
  const [retailModal, setRetailModal] = useState(false)
  return <Card className="p-0 shadow-none border-0 gap-2 relative">
    <RetailMarginDropDown
      margins={brand.margins}
      setMargin={setMargin}
      setOpen={setRetailModal}
      brand={brand}
      children={children}
    />
    <AddRetailModal
      payload={{
        coachId,
        margin,
        selectedBrandId: brand._id,
        margins: brand.margins,
        clientId: brand.clientId || "",
        productModule: brand.productModule || [],
        orderId: brand.orderId || "",
        status: brand.status || "Completed",
      }}
      open={retailModal}
      setOpen={setRetailModal}
    />
  </Card>
}

function Orders({ orders }) {
  const myOrders = [...orders.myOrder, ...orders.retailRequest]
    .sort((a, b) => {
      const dateA = parse(a.createdAt, 'dd-MM-yyyy', new Date());
      const dateB = parse(b.createdAt, 'dd-MM-yyyy', new Date());
      return dateB - dateA;
    })
    .sort((a, b) => a.status === "Completed");

  return <TabsContent value="order-history">
    <ExportOrdersoExcel orders={orders} />
    <div className="grid grid-cols-3 gap-4">
      {myOrders.map(order => <Order key={order._id} order={order} />)}
    </div>
  </TabsContent>
}

function Order({ order }) {
  const coach = useAppSelector(state => state.coach.data);
  return <Card className="bg-[var(--comp-1)] mb-2 gap-2 border-1 shadow-none px-4 py-2 rounded-[4px]">
    <CardHeader className="px-0">
      <div className="flex justify-between items-center">
        {order.status === "Completed" && <RetailCompletedLabel status={order.status} />}
        {order.status === "Pending" && <RetailPendingLabel status={order.status} />}
        {order.status === "Cancelled" && <RetailCancelledLabel status={order.status} />}
        <DropdownMenu>
          <DropdownMenuTrigger asChild className="text-black w-[16px]">
            <EllipsisVertical className="cursor-pointer" />
          </DropdownMenuTrigger>
          <DropdownMenuContent className="font-semibold px-2 py-[6px]">
            <PDFRenderer pdfTemplate="PDFInvoice" data={invoicePDFData(order, coach)}>
              <DialogTrigger className="w-full text-[12px] font-bold flex items-center gap-2">
                Invoice
              </DialogTrigger>
            </PDFRenderer>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </CardHeader>
    <CardContent className="px-0">
      <div className="flex gap-4">
        <Image
          height={100}
          width={100}
          unoptimized
          src={order.productModule?.at(0)?.productImage}
          alt=""
          className="bg-black w-[64px] h-[64px] object-cover rounded-md"
        />
        <div>
          <h4>{order.productModule.map(product => product.productName).join(", ")}</h4>
          <p className="text-[10px] text-[var(--dark-1)]/25 leading-[1.2]">{order.productModule?.at(0)?.productDescription}</p>
          {order.sellingPrice && <div className="text-[20px] text-nowrap font-bold ml-auto">₹ {order.sellingPrice}</div>}
        </div>
      </div>
    </CardContent>
    <CardFooter className="px-0 items-end justify-between">
      <div className="text-[12px]">
        <p className="text-[var(--dark-1)]/25">Order From: <span className="text-[var(--dark-1)]">{order?.clientId?.name || "-"}</span></p>
        <p className="text-[var(--dark-1)]/25">Order Date: <span className="text-[var(--dark-1)]">{order.createdAt || "-"}</span></p>
        <p className="text-[var(--dark-1)]/25">Pending Amount: <span className="text-[var(--dark-1)]">₹ {Math.max(order.pendingAmount || 0)}</span></p>
        <p className="text-[var(--dark-1)]/25">Paid Amount: <span className="text-[var(--dark-1)]">₹ {Math.max(order.paidAmount || 0)}</span></p>
      </div>
      {order.pendingAmount > 0
        ? <UpdateClientOrderAmount order={order} />
        : <Badge variant="wz">Paid</Badge>}
    </CardFooter>
    <div>
      {order.status === "Pending" && <AcceptRejectOrder order={order} />}
    </div>
  </Card>
}

export function RetailCompletedLabel({ status }) {
  return <div className="text-[#03632C] text-[14px] font-bold flex items-center gap-1">
    <Clock className="bg-[#03632C] text-white w-[28px] h-[28px] p-1 rounded-full" />
    <p>{status}</p>
  </div>
}

export function RetailPendingLabel({ status }) {
  return <div className="text-[#FF964A] text-[14px] font-bold flex items-center gap-1">
    <Clock className="bg-[#FF964A] text-white w-[28px] h-[28px] p-1 rounded-full" />
    <p>{status}</p>
  </div>
}

export function RetailCancelledLabel({ status }) {
  return <div className="text-red-600 text-[14px] font-bold flex items-center gap-1">
    <Clock className="bg-red-600 text-white w-[28px] h-[28px] p-1 rounded-full" />
    <p>{status}</p>
  </div>
}

function ExportOrdersoExcel({ orders }) {
  const [dates, setDates] = useState({
    startDate: "",
    endDate: ""
  });

  function exportExcelSheet() {
    try {
      const data = excelRetailOrdersData(orders, dates)
      exportToExcel(data, "Retail Orders", "orders.xlsx")
    } catch (error) {
      toast.error(error.message)
    }
  }
  return <Dialog>
    <DialogTrigger asChild>
      <Button
        variant="wz"
        className="block mb-4 ml-auto"
      >Export</Button>
    </DialogTrigger>
    <DialogContent className="p-0">
      <DialogTitle className="p-4 border-b-1">Export Orders Via Excel</DialogTitle>
      <div className="p-4 gap-0">
        <div className="grid grid-cols-2 gap-4">
          <FormControl
            type="date"
            label="Start Date"
            value={dates.startDate}
            onChange={e => setDates(prev => ({ ...prev, startDate: e.target.value }))}
          />
          <FormControl
            type="date"
            label="End Date"
            value={dates.endDate}
            onChange={e => setDates(prev => ({ ...prev, endDate: e.target.value }))}
          />
        </div>
        <Button
          variant="wz"
          className="block mt-8 mx-auto"
          onClick={exportExcelSheet}
        >Export Now</Button>
      </div>
    </DialogContent>
  </Dialog>
}

function AcceptRejectOrder({ order = {} }) {
  return <div className="mt-4 flex items-center gap-2">
    <AcceptRetailsOrder order={order} />
    <RejectOrderAction
      status="cancel"
      id={order.orderId}
    />
  </div>
}

function RejectOrderAction({
  status,
  id
}) {
  async function handleOrderStatus(setLoading) {
    try {
      setLoading(true);
      const endpoint = buildUrlWithQueryParams(
        "app/accept-order",
        { id, status }
      )
      const response = await sendData(endpoint, {}, "PUT");
      if (response.status_code !== 200) throw new Error(response.message);
      toast.success(response.message);
      location.reload();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  }
  return <DualOptionActionModal
    description="Are you sure of this. This action cannot be undone."
    action={(setLoading, btnRef) => handleOrderStatus(setLoading, btnRef)}
  >
    <AlertDialogTrigger asChild>
      <Button
        className="text-[12px] font-bold"
        size="sm"
        variant="destructive"
      >Reject</Button>
    </AlertDialogTrigger>
  </DualOptionActionModal>
}

function AcceptRetailsOrder({ order }) {
  return <div>
    <Brand
      brand={{
        ...order.brand,
        clientId: order.clientId,
        productModule: order.productModule,
        status: order.status,
        orderId: order.orderId,
        status: "Pending"
      }}
    >
      <Button
        size="sm"
        variant="wz">Accept</Button>
    </Brand>
  </div >
}