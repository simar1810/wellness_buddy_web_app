"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { fetchData, sendData } from "@/lib/api";
import { Lock } from "lucide-react";
import { toast } from "sonner";

const PIN_REGEX = /^\d{4}$/;

export default function CoachPinSecurityCard() {
  const [hasPin, setHasPin] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [currentPin, setCurrentPin] = useState("");
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");

  async function loadPinStatus() {
    try {
      setLoadingStatus(true);
      const res = await fetchData("app/pinStatus");
      if (res?.status_code !== 200) {
        throw new Error(res?.message || "Could not load PIN status");
      }
      setHasPin(Boolean(res.data?.hasPin));
    } catch (error) {
      toast.error(error.message || "Could not load PIN status");
    } finally {
      setLoadingStatus(false);
    }
  }

  useEffect(() => {
    loadPinStatus();
  }, []);

  function resetForm() {
    setCurrentPin("");
    setPin("");
    setConfirmPin("");
  }

  function digitsOnly(value, max = 4) {
    return String(value ?? "").replace(/\D/g, "").slice(0, max);
  }

  async function handleSetOrChange() {
    if (!PIN_REGEX.test(pin)) {
      toast.error("PIN must be exactly 4 digits");
      return;
    }
    if (pin !== confirmPin) {
      toast.error("PIN and confirm PIN do not match");
      return;
    }
    if (hasPin && !PIN_REGEX.test(currentPin)) {
      toast.error("Enter your current PIN to change it");
      return;
    }
    if (submitting) return;
    try {
      setSubmitting(true);
      const body = {
        pin,
        confirmPin,
        action: "set",
      };
      if (hasPin) body.currentPin = currentPin;
      const res = await sendData("app/setupPin", body);
      if (res?.status_code !== 200) {
        throw new Error(res?.message || "Failed to save PIN");
      }
      toast.success(res.message || (hasPin ? "PIN updated" : "PIN set successfully"));
      setHasPin(Boolean(res.data?.hasPin));
      resetForm();
    } catch (error) {
      toast.error(error.message || "Failed to save PIN");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleRemove() {
    if (!PIN_REGEX.test(currentPin)) {
      toast.error("Enter your current PIN to remove it");
      return;
    }
    if (submitting) return;
    try {
      setSubmitting(true);
      const res = await sendData("app/setupPin", {
        action: "clear",
        currentPin,
        pin: "",
        confirmPin: "",
      });
      if (res?.status_code !== 200) {
        throw new Error(res?.message || "Failed to remove PIN");
      }
      toast.success(res.message || "PIN removed");
      setHasPin(false);
      resetForm();
    } catch (error) {
      toast.error(error.message || "Failed to remove PIN");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Card className="bg-white rounded-[18px] shadow-none">
      <CardHeader className="flex flex-row items-center gap-2 space-y-0">
        <Lock className="w-5 h-5 text-[var(--accent-1)]" />
        <CardTitle className="text-lg">Security / App PIN</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-[var(--dark-2)]">
          {loadingStatus
            ? "Checking PIN status..."
            : hasPin
              ? "App PIN is enabled. Use it to sign in faster without OTP."
              : "No App PIN set. After you set one, login will ask for PIN instead of OTP."}
        </p>

        {hasPin && (
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="currentPin">
              Current PIN
            </label>
            <Input
              id="currentPin"
              type="password"
              inputMode="numeric"
              autoComplete="current-password"
              maxLength={4}
              value={currentPin}
              onChange={(e) => setCurrentPin(digitsOnly(e.target.value))}
              placeholder="••••"
              className="min-h-[44px] max-w-[200px] tracking-widest"
            />
          </div>
        )}

        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="newPin">
            {hasPin ? "New PIN" : "PIN"}
          </label>
          <Input
            id="newPin"
            type="password"
            inputMode="numeric"
            autoComplete="new-password"
            maxLength={4}
            value={pin}
            onChange={(e) => setPin(digitsOnly(e.target.value))}
            placeholder="••••"
            className="min-h-[44px] max-w-[200px] tracking-widest"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="confirmPin">
            Confirm PIN
          </label>
          <Input
            id="confirmPin"
            type="password"
            inputMode="numeric"
            autoComplete="new-password"
            maxLength={4}
            value={confirmPin}
            onChange={(e) => setConfirmPin(digitsOnly(e.target.value))}
            placeholder="••••"
            className="min-h-[44px] max-w-[200px] tracking-widest"
          />
        </div>

        <div className="flex flex-wrap gap-2 pt-2">
          <Button
            variant="wz"
            className="min-h-[44px]"
            disabled={submitting || loadingStatus}
            onClick={handleSetOrChange}
          >
            {submitting ? "Saving..." : hasPin ? "Change PIN" : "Set PIN"}
          </Button>
          {hasPin && (
            <Button
              variant="outline"
              className="min-h-[44px]"
              disabled={submitting || loadingStatus}
              onClick={handleRemove}
            >
              Remove PIN
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
