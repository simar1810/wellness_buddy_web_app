import AutoConfigureMembership from "@/components/common/AutoAddMembership";
import FormControl from "@/components/FormControl";
import SelectControl from "@/components/Select";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { MEMBERSHIP_TIER_CONFIG } from "@/config/data/membership";
import { sendData } from "@/lib/api";
import { cn } from "@/lib/utils";
import { addDays, addMonths, format, parse } from "date-fns";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { mutate } from "swr";

export default function AddSubscriptionModal({ _id, onSubmit }) {
  const [tier, setTier] = useState("") // none, demo, silver, gold
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    amount: "",
    invoice: "",
    paymentMode: "cash",
    startDate: format(new Date(), "yyyy-MM-dd"),
    endDate: format(
      addMonths(new Date(), 1),
      "yyyy-MM-dd"
    ),
    description: ""
  });
  const closeBtnRef = useRef(null);

  async function addSubscription() {
    try {
      setLoading(true);
      const response = await sendData(`addSubscription/${_id}`, formData, "POST");
      if (!response.status) throw new Error(response.message);
      toast.success(response.message);
      mutate(`getClientSubscriptions/${_id}`)
      if (onSubmit) onSubmit()
      closeBtnRef.current.click();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  }

  return <Dialog>
    <DialogTrigger className="font-semibold text-[12px] text-[var(--primary-1)] bg-[var(--accent-1)] px-4 py-2 rounded-[8px]">
      Add Membership
    </DialogTrigger>
    <DialogContent className="!max-w-[450px] max-h-[70vh] border-0 px-0 py-0 overflow-auto gap-0 overflow-y-auto">
      <DialogTitle className="text-[20px] p-4 border-b-1">Add Membership</DialogTitle>
      {/* <AutoConfigureMembership userType="client" /> */}
      <SelectTierType
        tier={tier}
        setTier={setTier}
        setFormData={setFormData}
      />
      <div className="p-4">
        <FormControl
          value={formData.amount}
          onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
          label="Amount"
          type="number"
          placeholder="Enter Amount"
          className="block mb-4"
        />
        <FormControl
          value={formData.startDate}
          onChange={(e) => setFormData({
            ...formData,
            startDate: e.target.value,
            endDate: tier.toLowerCase() === "demo"
              ? format(
                addDays(parse(e.target.value, "yyyy-MM-dd", new Date()), 3),
                "yyyy-MM-dd"
              )
              : format(
                addMonths(parse(e.target.value, "yyyy-MM-dd", new Date()), 1),
                "yyyy-MM-dd"
              )
          })}
          label="Start Date"
          type="date"
          className="block mb-4"
        />
        <FormControl
          value={formData.endDate}
          onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
          label="End Date"
          type="date"
          className="block mb-4"
        />
        <FormControl
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          label="Description"
          type="text"
          placeholder="Enter Description"
          className="block mb-4"
        />
        <SelectControl
          value={formData.paymentMode}
          onChange={(e) => setFormData({ ...formData, paymentMode: e.target.value })}
          label="Payment Mode"
          className="block mb-4"
          options={[{ id: 1, name: "Cash", value: "cash" }, { id: 2, name: "UPI", value: "upi" }, { id: 3, name: "Net Banking", value: "online" }]}
        />
        <div className="mt-2 grid grid-cols-2 gap-4">
          <DialogClose asChild ref={closeBtnRef}>
            <Button
              size="sm"
              variant="secondary"
              className="border-1"
            >
              Cancel
            </Button>
          </DialogClose>
          <Button
            variant="wz"
            size="sm"
            disabled={loading}
            onClick={addSubscription}
            className="w-full"
          >
            Save
          </Button>
        </div>
      </div>
    </DialogContent>
  </Dialog>
}

function SelectTierType({
  tier,
  setTier,
  setFormData
}) {

  const onChangeFormData = function (curr) {
    const config = MEMBERSHIP_TIER_CONFIG[curr];
    setFormData({
      amount: config.amount,
      invoice: "",
      paymentMode: "cash",
      startDate: format(new Date(), "yyyy-MM-dd"),
      endDate: config.calcEndDate(new Date()),
      description: "",
      tier: curr
    })
    setTier(curr)
  }

  return <div className="bg-slate-50 m-4 mb-0 px-4 py-2 grid grid-cols-4 gap-4 border-1 rounded-[6px]">
    {["demo", "silver", "gold", "physical"].map((curr) => (
      <button
        key={curr}
        type="button"
        onClick={() => onChangeFormData(curr)}
        data-state={tier === curr ? "active" : "inactive"}
        className="flex-1 px-4 py-[6px] text-sm font-medium transition-all duration-200 border rounded-xl
           bg-transparent border-slate-300/80 text-slate-500 hover:border-slate-400
           data-[state=active]:bg-[#67bc2a]/[0.06] 
           data-[state=active]:text-[#67bc2a]
           data-[state=active]:border-[#67bc2a]/30
           data-[state=active]:shadow-[0_0_12px_rgba(103,188,42,0.12)]"
      >
        {curr.charAt(0).toUpperCase() + curr.slice(1)}
      </button>
    ))}
  </div>
}