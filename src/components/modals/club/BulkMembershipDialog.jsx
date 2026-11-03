"use client";

import { useMemo, useState } from "react";
import { format, parse } from "date-fns";
import { Upload } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { sendData } from "@/lib/api";

const MAX_PHONES = 100;

function parsePhoneNumbers(raw) {
  const parts = String(raw || "")
    .split(/[\s,;]+/)
    .map((p) => p.replace(/\D/g, ""))
    .filter((p) => p.length >= 10);

  return [...new Set(parts)];
}

function toApiDate(isoYmd) {
  if (!isoYmd) return "";
  return format(parse(isoYmd, "yyyy-MM-dd", new Date()), "dd-MM-yyyy");
}

export default function BulkMembershipDialog() {
  const [open, setOpen] = useState(false);
  const [phonesRaw, setPhonesRaw] = useState("");
  const [startDate, setStartDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [endDate, setEndDate] = useState("");
  const [confirming, setConfirming] = useState(false);
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState(null);

  const phoneNumbers = useMemo(() => parsePhoneNumbers(phonesRaw), [phonesRaw]);

  function reset() {
    setPhonesRaw("");
    setStartDate(format(new Date(), "yyyy-MM-dd"));
    setEndDate("");
    setConfirming(false);
    setSaving(false);
    setResult(null);
  }

  async function handleSubmit() {
    if (phoneNumbers.length === 0) {
      toast.error("Paste at least one valid mobile number");
      return;
    }
    if (phoneNumbers.length > MAX_PHONES) {
      toast.error(`Maximum ${MAX_PHONES} numbers per run`);
      return;
    }
    if (!startDate || !endDate) {
      toast.error("Start and end dates are required");
      return;
    }
    if (new Date(startDate) >= new Date(endDate)) {
      toast.error("End date must be after start date");
      return;
    }
    if (!confirming) {
      setConfirming(true);
      return;
    }

    const toastId = toast.loading("Assigning club membership...");
    try {
      setSaving(true);
      const response = await sendData(
        "bulk-add-subscription",
        {
          phoneNumbers,
          startDate: toApiDate(startDate),
          endDate: toApiDate(endDate),
        },
        "POST"
      );

      if (response instanceof Error) throw response;
      if (!response?.status) {
        throw new Error(response?.message || "Bulk membership failed");
      }

      const summary = response?.data?.summary || {};
      const failed = response?.data?.failed || [];
      setResult({
        successful: summary.successful ?? response?.data?.successful?.length ?? 0,
        failed: summary.failed ?? failed.length,
        failedRows: failed,
        message: response.message,
      });
      setConfirming(false);

      if ((summary.failed ?? failed.length) === 0) {
        toast.success(
          `Membership set for ${summary.successful ?? phoneNumbers.length} coach(es)`
        );
      } else {
        toast.warning(
          `Done: ${summary.successful ?? 0} ok, ${summary.failed ?? failed.length} failed`
        );
      }
    } catch (err) {
      toast.error(err?.message || "Bulk membership failed");
      setConfirming(false);
    } finally {
      setSaving(false);
      toast.dismiss(toastId);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) reset();
      }}
    >
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className="min-h-11 gap-2 rounded-xl border-[var(--comp-3)] shadow-sm"
        >
          <Upload className="w-4 h-4" />
          Bulk Membership
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[520px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Bulk Membership</DialogTitle>
          <DialogDescription>
            Assign club membership to coaches by mobile number. Existing club
            membership for each matched coach is replaced.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="bulk-phones">Mobile numbers</Label>
            <Textarea
              id="bulk-phones"
              value={phonesRaw}
              onChange={(e) => {
                setPhonesRaw(e.target.value);
                setConfirming(false);
                setResult(null);
              }}
              placeholder={"9876543210\n9876501234\nor comma-separated"}
              className="min-h-[120px] font-mono text-sm"
              disabled={saving}
            />
            <p className="text-xs text-muted-foreground">
              {phoneNumbers.length} valid number
              {phoneNumbers.length === 1 ? "" : "s"} detected
              {phoneNumbers.length > MAX_PHONES
                ? ` (max ${MAX_PHONES})`
                : ""}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="bulk-start">Start date</Label>
              <Input
                id="bulk-start"
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  setConfirming(false);
                }}
                disabled={saving}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="bulk-end">End date</Label>
              <Input
                id="bulk-end"
                type="date"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  setConfirming(false);
                }}
                disabled={saving}
              />
            </div>
          </div>

          {confirming && (
            <div
              role="alert"
              className="rounded-lg border border-amber-500/40 bg-amber-50 px-3 py-2 text-sm text-amber-950"
            >
              This replaces existing club membership for{" "}
              <strong>{phoneNumbers.length}</strong> coach
              {phoneNumbers.length === 1 ? "" : "es"}. Press confirm again to
              continue.
            </div>
          )}

          {result && (
            <div className="rounded-lg border border-[var(--comp-3)] bg-[var(--comp-1)] px-3 py-2 text-sm space-y-1">
              <p>
                <span className="text-green-700 font-medium">
                  {result.successful} succeeded
                </span>
                {" · "}
                <span className="text-red-700 font-medium">
                  {result.failed} failed
                </span>
              </p>
              {result.failedRows?.length > 0 && (
                <ul className="max-h-28 overflow-y-auto text-xs text-red-800 space-y-0.5">
                  {result.failedRows.map((row) => (
                    <li key={`${row.phoneNumber}-${row.reason}`}>
                      {row.phoneNumber}: {row.reason}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-2">
          <Button
            type="button"
            variant="outline"
            disabled={saving}
            onClick={() => {
              setOpen(false);
              reset();
            }}
          >
            Close
          </Button>
          <Button
            type="button"
            variant="wz"
            disabled={saving || phoneNumbers.length === 0}
            className="min-h-11"
            onClick={handleSubmit}
          >
            {saving
              ? "Working…"
              : confirming
                ? "Confirm assign"
                : "Assign membership"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
