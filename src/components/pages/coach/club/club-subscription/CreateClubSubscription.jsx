"use client";

import { useRef, useState } from "react";
import { addMonths, format, parse } from "date-fns";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { sendData } from "@/lib/api";

export default function CreateSubscriptionDialog({
  coachId,
  onCreated,
  subscription = {},
  type = "new",
  trigger,
  coachName,
}) {
  const defaultForm = () => ({
    startDate: subscription.startDate
      ? format(new Date(subscription.startDate), "yyyy-MM-dd")
      : format(new Date(), "yyyy-MM-dd"),
    endDate: subscription.endDate
      ? format(new Date(subscription.endDate), "yyyy-MM-dd")
      : format(addMonths(new Date(), 1), "yyyy-MM-dd"),
    amount: subscription.amount ? subscription.amount : "",
    paymentMode: subscription.paymentMode ? subscription.paymentMode : "Cash",
    description: subscription.description || ""
  });

  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState(defaultForm);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const closeRef = useRef()

  const handleChange = (field) => (e) => {
    setFormData({
      ...formData,
      [field]: e.target.value,
      ...(field === "startDate" && {
        endDate: format(
          addMonths(parse(e.target.value, "yyyy-MM-dd", new Date()), 1),
          "yyyy-MM-dd"
        )
      })
    });
  };

  const handleSelect = (field) => (value) => {
    setFormData({ ...formData, [field]: value });
  };

  const validateForm = () => {
    if (!formData.startDate || !formData.endDate || !formData.amount || !formData.paymentMode) {
      toast.error("All fields are required");
      return false;
    }
    if (new Date(formData.startDate) >= new Date(formData.endDate)) {
      toast.error("End date must be after start date");
      return false;
    }
    if (parseFloat(formData.amount) <= 0) {
      toast.error("Amount must be greater than 0");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const payload = {
        startDate: parse(formData.startDate, "yyyy-MM-dd", new Date()),
        endDate: parse(formData.endDate, "yyyy-MM-dd", new Date()),
        amount: parseFloat(formData.amount),
        paymentMode: formData.paymentMode,
        description: formData.description,
        coachId,
      };

      const response =
        type === "new"
          ? await sendData(`app/clubSubscription/coach/${coachId}`, payload, "POST")
          : await sendData(`app/clubSubscription/coach/${coachId}`, payload, "PUT");

      if (response instanceof Error) throw response;
      if (response?.error || (response?.status_code && response.status_code !== 200 && response.status !== true)) {
        toast.error(response.error || response.message || "Failed to create subscription");
      } else {
        toast.success("Membership updated successfully!");
        onCreated?.();
        setFormData(defaultForm());
        setOpen(false);
      }
    } catch (err) {
      toast.error(err?.message || "Failed to create subscription");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) setFormData(defaultForm());
      }}
    >
      <DialogTrigger asChild>
        {trigger || <Button type="button">New</Button>}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit} className="space-y-4">
          <DialogHeader>
            <DialogTitle>
              {type === "new"
                ? coachName
                  ? `Update Membership — ${coachName}`
                  : "Create New Subscription"
                : "Edit Subscription"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Amount */}
            <div className="flex flex-col space-y-1">
              <Label>Amount (INR)</Label>
              <Input
                type="number"
                min={0}
                step={0.01}
                value={formData.amount}
                onChange={handleChange("amount")}
                required
              />
            </div>

            {/* Start Date */}
            <div className="flex flex-col space-y-1">
              <Label>Start Date</Label>
              <Input
                type="date"
                value={formData.startDate}
                onChange={handleChange("startDate")}
                required
              />
            </div>

            {/* End Date */}
            <div className="flex flex-col space-y-1">
              <Label>End Date</Label>
              <Input
                type="date"
                value={formData.endDate}
                min={formData.startDate || new Date().toISOString().split("T")[0]}
                onChange={handleChange("endDate")}
                required
              />
            </div>

            {/* Description */}
            <div className="flex flex-col space-y-1">
              <Label>Description</Label>
              <Input
                value={formData.description}
                onChange={handleChange("description")}
                required
              />
            </div>

            {/* Payment Mode */}
            <div className="flex flex-col space-y-1">
              <Label>Payment Mode</Label>
              <Select
                value={formData.paymentMode}
                onValueChange={handleSelect("paymentMode")}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select mode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Cash">Cash</SelectItem>
                  <SelectItem value="UPI">UPI</SelectItem>
                  <SelectItem value="Net Banking">Net Banking</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => closeRef.current.click()}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-[var(--accent-1)] hover:bg-[var(--accent-1)] hover:opacity-80"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}