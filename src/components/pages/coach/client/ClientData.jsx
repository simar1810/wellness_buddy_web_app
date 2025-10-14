"use client";
import ContentError from "@/components/common/ContentError";
import ContentLoader from "@/components/common/ContentLoader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getClientMealPlanById, getClientOrderHistory, getClientWorkouts, getMarathonClientTask } from "@/lib/fetchers/app";
import { BarChart2, Bot, Briefcase, CalendarIcon, Clock, Dumbbell, FileText, Flag, ShoppingBag, Users, Utensils } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import useSWR from "swr";
import { useState } from "react";
import ClientClubDataComponent from "./ClientClubDataComponent";
import { useAppSelector } from "@/providers/global/hooks";
import ClientStatisticsData from "./ClientStatisticsData";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { trimString } from "@/lib/formatter";
import AIAgentHistory from "./AIAgentHistory";
import ClientReports from "./ClientReports";
import { useParams, usePathname, useRouter, useSearchParams } from "next/navigation";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import FormControl from "@/components/FormControl";
import { sendData } from "@/lib/api";
import { toast } from "sonner";
import DisplayClientQuestionaire from "../questionaire/display/DisplayClientQuestionaire";
import PhysicalClub from "./PhysicalClub";

const tabItems = [
  { icon: <BarChart2 className="w-[16px] h-[16px]" />, value: "statistics", label: "Statistics" },
  { icon: <Utensils className="w-[16px] h-[16px]" />, value: "meal", label: "Meal" },
  { icon: <Dumbbell className="w-[16px] h-[16px]" />, value: "workout", label: "Workout" },
  { icon: <ShoppingBag className="w-[16px] h-[16px]" />, value: "retail", label: "Retail", showIf: ({ organisation }) => organisation.toLowerCase() === "herbalife" },
  { icon: <Flag className="w-[16px] h-[16px]" />, value: "marathon", label: "Marathon" },
  { icon: <Users className="w-[16px] h-[16px]" />, value: "club", label: "Club" },
  { icon: <Bot className="w-[16px] h-[16px]" />, value: "ai-agent", label: "AI History" },
  { icon: <FileText className="w-[16px] h-[16px]" />, value: "client-reports", label: "Client Reports" },
  { icon: <FileText className="w-[16px] h-[16px]" />, value: "physical-club", label: "Physical Club", showIf: ({ features }) => features.includes(3) },
  { icon: <Briefcase className="w-[16px] h-[16px]" />, value: "case-file", label: "Questionaire", },
]

export default function ClientData({ clientData }) {
  const router = useRouter();
  const pathname = usePathname();

  const params = useSearchParams();
  const selectedTab = tabItems.map(item => item.value).includes(params.get("tab"))
    ? params.get("tab")
    : "statistics"
  const { organisation } = useAppSelector(state => state.coach.data);

  function tabChange(value) {
    const newParams = new URLSearchParams(params.toString());
    newParams.set("tab", value);
    router.replace(`${pathname}?${newParams.toString()}`, { scroll: false });
  };
  return <div className="bg-white h-auto p-4 rounded-[18px] border-1">
    <Tabs defaultValue={selectedTab} onValueChange={tabChange}>
      <Header />
      <ClientStatisticsData clientData={clientData} />
      <ClientMealData _id={clientData._id} />
      {organisation.toLowerCase() === "herbalife" && <ClientRetailData clientId={clientData.clientId} />}
      <ClientClubDataComponent clientData={clientData} />
      <MarathonData clientData={clientData} />
      <WorkoutContainer id={clientData._id} />
      <AIAgentHistory />
      <ClientReports />
      <CaseFile sections={clientData.onboarding_questionaire || []} />
      <PhysicalClub />
    </Tabs>
  </div>
}

function ClientMealData({ _id }) {
  const { isLoading, error, data } = useSWR(`app/getClientMealPlanById?clientId=${_id}`, () => getClientMealPlanById(_id));

  if (isLoading) return <TabsContent value="meal">
    <ContentLoader />
  </TabsContent>

  if (error || data.status_code !== 200) return <TabsContent value="meal">
    <ContentError className="mt-0" title={error || data.message} />
  </TabsContent>
  const meals = data?.data?.plans || data?.data || [];
  return <TabsContent value="meal">
    {meals && meals?.map((meal, index) => <CustomMealDetails
      key={index}
      meal={meal}
    />)}
    {meals.length === 0 && <ContentError title="No Meal plan assigned to this client" />}
  </TabsContent>
}

export function CustomMealDetails({ meal }) {
  if (meal.custom) return <Link href={`/coach/meals/list-custom/${meal._id}`} className="relative border-1 rounded-[10px] overflow-clip block mb-4">
    <Image
      alt=""
      src={meal.image || "/not-found.png"}
      height={400}
      width={400}
      className="w-full object-cover max-h-[200px]"
    />
    <Badge className="absolute top-4 right-4 font-bold" variant="wz_fill">Custom</Badge>
    <div className="p-4">
      <div className="flex justify-between items-center">
        <h3>{meal.title}</h3>
        <Badge className="capitalize">{meal.mode}</Badge>
      </div>
      <p>{trimString(meal.description, 80)}</p>
    </div>
  </Link>
  if (meal?.isRoutine) return <Link href={`/coach/meals/list/${meal._id}`} className="relative border-1 rounded-[10px] overflow-clip block mb-4">
    <Image
      alt=""
      src={meal.image || "/not-found.png"}
      height={400}
      width={400}
      className="w-full object-cover max-h-[200px]"
    />
    <Badge className="absolute top-4 right-4 font-bold" variant="wz_fill">Routine</Badge>
    <div className="p-4">
      <h3 className="mb-2">{meal.name}</h3>
      <p className="text-sm leading-tight">{trimString(meal.description, 80)}</p>
    </div>
  </Link>
}

function ClientRetailData({ clientId }) {
  const { id } = useParams()
  const { isLoading, error, data } = useSWR(`app/getClientOrderHistory/${clientId}`, () => getClientOrderHistory(id));

  if (isLoading) return <TabsContent value="meal">
    <ContentLoader />
  </TabsContent>

  if (error || data.status_code !== 200) return <TabsContent value="meal">
    <ContentError title={error || data.message} />
  </TabsContent>

  const orderHistoryClient = data?.data;
  const completed = data?.data?.Completed || {}
  const incomplete = data?.data?.Pending || {}

  if (orderHistoryClient?.orderHistory?.length === 0) return <TabsContent value="retail">
    <ContentError className="mt-0" title="0 retails for this client!" />
  </TabsContent>

  return <TabsContent value="retail">
    {(completed?.orders || []).map(order => <RetailOrderDetailCard
      key={order._id}
      order={order}
    />)}
    {(incomplete?.orders || []).map(order => <RetailOrderDetailCard
      key={order._id}
      order={order}
    />)}
  </TabsContent>
}

function RetailOrderDetailCard({ order }) {

  return <Card className="bg-[var(--comp-1)] mb-2 gap-2 border-1 shadow-none px-4 py-2 rounded-[4px]">
    <CardHeader className="px-0">
      {order.status === "Completed"
        ?
        <RetailCompletedLabel />
        : <RetailPendingLabel />}
    </CardHeader>
    <CardContent className="px-0 flex gap-4">
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
        <p className="text-[12px] text-[var(--dark-1)]/25">{order.productModule?.at(0)?.productDescription}</p>
      </div>
      <div className="text-[20px] text-nowrap font-bold ml-auto">₹ {order.sellingPrice}</div>
    </CardContent>
    <CardFooter className="px-0 items-end justify-between">
      <div className="text-[12px]">
        <p className="text-[var(--dark-1)]/25">Order From: <span className="text-[var(--dark-1)]">{order?.clientId?.name}</span></p>
        <p className="text-[var(--dark-1)]/25">Order Date: <span className="text-[var(--dark-1)]">{order.createdAt}</span></p>
        <p className="text-[var(--dark-1)]/25">Pending Amount: <span className="text-[var(--dark-1)]">₹ {Math.max(order.pendingAmount, 0)}</span></p>
        <p className="text-[var(--dark-1)]/25">Paid Amount: <span className="text-[var(--dark-1)]">₹ {Math.max(order.paidAmount, 0)}</span></p>
      </div>
      {/* <Link className="underline text-[var(--accent-1)] text-[12px] flex items-center" href="/">
        Order Now&nbsp;{">"}
      </Link> */}
      {order.pendingAmount > 0
        ? <UpdateClientOrderAmount order={order} />
        : <Badge variant="wz">Paid</Badge>}
    </CardFooter>
  </Card>
}

export function UpdateClientOrderAmount({ order }) {
  const [loading, setLoading] = useState(false);
  const [value, setValue] = useState("");

  async function updateRetailAmount() {
    try {
      setLoading(true);
      const response = await sendData(
        `app/client/retail-order/${order.clientId}`,
        { orderId: order._id, amount: value },
        "PUT"
      );
      if (response.status_code !== 200) throw new Error(response.message);
      toast.success(response.message);
      location.reload()
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  }

  return <Dialog>
    <DialogTrigger className="px-4 py-2 rounded-[10px] bg-[var(--accent-1)] font-bold text-white text-[14px]">Pay</DialogTrigger>
    <DialogContent className="p-0 gap-0">
      <DialogTitle className="p-4 border-b-1">Order Amount</DialogTitle>
      <div className="p-4">
        <p> Pending Amount - ₹{order.pendingAmount}</p>
        <FormControl
          label="Add Amount"
          value={value}
          onChange={e => setValue(e.target.value)}
          placeholder="Enter Amount"
          className="block mt-4"
        />
        <Button
          variant="wz"
          className="block mt-4"
          disabled={loading}
          onClick={updateRetailAmount}
        >
          Update
        </Button>
      </div>
    </DialogContent>
  </Dialog>
}

function RetailCompletedLabel() {
  return <div className="text-[#03632C] text-[14px] font-bold flex items-center gap-1">
    <Clock className="bg-[#03632C] text-white w-[28px] h-[28px] p-1 rounded-full" />
    <p>Completed</p>
  </div>
}

function RetailPendingLabel() {
  return <div className="text-[#FF964A] text-[14px] font-bold flex items-center gap-1">
    <Clock className="bg-[#FF964A] text-white w-[28px] h-[28px] p-1 rounded-full" />
    <p>Pending</p>
  </div>
}

function MarathonData({ clientData }) {
  const [date, setDate] = useState(format(new Date(), "dd-MM-yyyy"));
  const { isLoading, error, data } = useSWR(
    `client/marathon?clientId=${clientData._id}&date=${date}`,
    () => getMarathonClientTask(clientData._id, date)
  );

  if (isLoading) return <TabsContent value="marathon">
    <ContentLoader />
  </TabsContent>

  if (error || !Boolean(data) || data?.status_code !== 200) return <TabsContent value="retail">
    <ContentError className="mt-0" title={error || data?.message} />
  </TabsContent>
  const marathons = data.data;

  const totalPoints = marathons.reduce((acc, marathon) => acc + marathon.totalPoints, 0)

  return <TabsContent value="marathon">
    <div className="flex items-center justify-between">
      <h3 className="text-[var(--dark-1)] font-semibold text-lg">Marathon Tasks</h3>
      <DatePicker date={date} setDate={setDate} />
    </div>
    <p className="mb-8 px-2 pt-1">{totalPoints} points</p>
    <div className="w-full max-w-3xl mx-auto">
      <Accordion defaultValue={1} type="single" collapsible className="space-y-2">
        {marathons.map((marathon, index) => (
          <AccordionItem className="bg-[var(--comp-1)] border-0" key={index} value={index + 1}>
            <AccordionTrigger className="bg-[var(--dark-1)]/10 text-left font-semibold text-lg p-4">
              {marathon.marathonTitle} ({marathon.date})
            </AccordionTrigger>
            <p className="px-4 py-2">{marathon.totalPoints} points</p>
            <AccordionContent>
              <div className="space-y-4 px-4 mt-2">
                {marathon.tasks.map((task) => (
                  <div
                    key={task.taskId}
                    className="bg-white p-4 border rounded-lg"
                  >
                    <h4 className="font-medium">{task.title}</h4>
                    <p className="text-sm text-muted-foreground">{task.description}</p>
                    <div className="text-sm mt-2 flex flex-wrap gap-3">
                      <span>🎯 Points: {task.points}</span>
                      <span>📽 Video: {task.videoSubmission ? 'Yes' : 'No'}</span>
                      <span>📷 Photo: {task.photoSubmission ? 'Yes' : 'No'}</span>
                      <span>{task.isCompleted ? '✅ Completed' : '❌ Incomplete'}</span>
                    </div>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  </TabsContent>
}

function Header() {
  const { organisation, features } = useAppSelector(state => state.coach.data);
  return <TabsList className="w-full h-auto bg-transparent p-0 mb-10 flex items-start gap-x-2 gap-y-3 flex-wrap rounded-none no-scrollbar">
    {tabItems.map(({ icon, value, label, showIf }) => {
      if (showIf && !showIf({ organisation, features })) return null;
      return (
        <TabsTrigger
          key={value}
          className="min-w-[110px] mb-[-5px] px-2 font-semibold flex-1 basis-0 flex items-center gap-1 rounded-[10px] py-2
             data-[state=active]:bg-[var(--accent-1)] data-[state=active]:text-[var(--comp-1)]
             data-[state=active]:shadow-none text-[#808080] bg-[var(--comp-1)] border-1 border-[#EFEFEF]"
          value={value}
        >
          {icon}
          {label}
        </TabsTrigger>
      );
    })}
  </TabsList>
}

function DatePicker({ date, setDate }) {
  return <Popover>
    <PopoverTrigger asChild>
      <Button
        variant="outline"
        className="w-[220px] justify-start text-left font-normal"
      >
        <CalendarIcon className="mr-2 h-4 w-4" />
        {date || <span>Pick a date</span>}
      </Button>
    </PopoverTrigger>
    <PopoverContent className="w-auto p-0">
      <Calendar
        mode="single"
        selected={date}
        onSelect={value => setDate(format(value, "dd-MM-yyyy"))}
        initialFocus
      />
    </PopoverContent>
  </Popover>
}

function WorkoutContainer({ id }) {
  const { isLoading, error, data } = useSWR("client/workouts", () => getClientWorkouts(id));

  if (isLoading) return <TabsContent value="workout">
    <ContentLoader />
  </TabsContent>

  if (error || !Boolean(data) || data?.status_code !== 200) return <TabsContent value="workout">
    <ContentError className="mt-0" title={error || data?.message} />
  </TabsContent>
  const workouts = data?.data;

  return <TabsContent value="workout">
    {workouts && workouts?.map((workout, index) => <WorkoutDetails
      key={index}
      workout={workout}
    />)}
  </TabsContent>
}

export function WorkoutDetails({ workout }) {
  if (workout.custom) return <Link
    href={`/coach/workouts/list-custom/${workout._id}`}
    className="relative border-1 rounded-[10px] overflow-clip block mb-4"
  >
    <Image
      alt=""
      src={workout?.image?.trim() || "/not-found.png"}
      height={400}
      width={400}
      className="w-full object-cover max-h-[200px]"
    />
    <Badge className="absolute top-4 right-4 font-bold" variant="wz_fill">Custom</Badge>
    <div className="p-4">
      <div className="flex justify-between items-center">
        <h3>{workout.title}</h3>
        <Badge className="capitalize">{workout.mode}</Badge>
      </div>
      <p className="text-sm leading-tight mt-2">{trimString(workout.description, 80)}</p>
    </div>
  </Link>
  const routineWorkout = workout?.plans?.daily
  if (routineWorkout) return <Link
    href={`/coach/workouts/list/${routineWorkout._id}`}
    className="relative border-1 rounded-[10px] overflow-clip block mb-4"
  >
    <Image
      alt=""
      src={routineWorkout?.thumbnail?.trim() || "/not-found.png"}
      height={400}
      width={400}
      className="w-full object-cover max-h-[200px]"
    />
    <Badge className="absolute top-4 right-4 font-bold" variant="wz_fill">Routine</Badge>
    <div className="p-4">
      <h3 className="mb-2">{routineWorkout.title}</h3>
      <p className="text-sm leading-tight">{trimString(routineWorkout.instructions, 80)}</p>
    </div>
  </Link>
}

function CaseFile({ sections }) {
  if (sections?.length === 0) return <TabsContent
    className="h-[200px] leading-[200px] text-center bg-[var(--comp-1)] border-1 rounded-[10px]"
    value="case-file"
  >
    No Questions Answered
  </TabsContent>
  return <TabsContent value="case-file">
    <DisplayClientQuestionaire data={sections} />
  </TabsContent>
}