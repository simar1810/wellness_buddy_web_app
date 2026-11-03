import { Button } from "@/components/ui/button";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot
} from "@/components/ui/input-otp";
import { changeCurrentStage, coachfirstTimeRegistration, updateOtpChannel } from "@/config/state-reducers/login";
import { sendData } from "@/lib/api";
import useCurrentStateContext from "@/providers/CurrentStateContext";
import { useAppDispatch } from "@/providers/global/hooks";
import { store } from "@/providers/global/slices/coach";
import { MoveLeft } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function InputPinContainer() {
  const {
    mobileNumber,
    pin,
    dispatch,
  } = useCurrentStateContext();

  const dispatchRedux = useAppDispatch();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);

  async function loginWithPin() {
    if (String(pin).length !== 4) {
      toast.error("Please enter your 4-digit PIN.");
      return;
    }
    if (isSubmitting) return;
    try {
      setIsSubmitting(true);
      const response = await sendData("app/loginWithPin", {
        credential: "+91" + mobileNumber,
        pin,
        fcmToken: "",
      });
      if (
        response?.status_code !== 200 &&
        !response?.success
      ) {
        throw new Error(response?.message || response?.error || "Wrong PIN. Please try again.");
      }

      const user = response.data.user;
      const isFirstTime = response.data.isFirstTime;
      toast.success(response.message || "Logged in with PIN");

      const refreshToken =
        user.refreshToken || user.webRefreshTokenList?.slice(-1)[0];
      const authHeaderResponse = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          refreshToken,
          _id: user._id,
          userType: "coach",
        }),
      });
      const authHeaderData = await authHeaderResponse.json();
      if (authHeaderData.status_code !== 200) {
        throw new Error(authHeaderData.message);
      }
      dispatchRedux(store({ ...user, refreshToken }));

      if (isFirstTime) {
        dispatch(coachfirstTimeRegistration(user.coachId));
        return;
      }
      router.push("/coach/dashboard");
    } catch (error) {
      toast.error(error.message || "Please try again later!");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function useOtpInstead() {
    if (isSendingOtp) return;
    try {
      setIsSendingOtp(true);
      const data = {
        credential: "+91" + mobileNumber,
        fcmToken: "",
        otpChannel: "sms",
      };
      const response = await sendData(
        "app/signin?authMode=mob&clientType=web",
        data
      );
      if (response.status_code === 400) throw new Error(response.message);
      dispatch(updateOtpChannel("sms"));
      dispatch({
        type: "UPDATE_CURRENT_STATE",
        payload: {
          stage: 2,
          user: response.data.user,
          isFirstTime: response.data.isFirstTime,
          hasPin: true,
        },
      });
      toast.success(response.message || "OTP sent successfully!");
    } catch (error) {
      toast.error(error.message || "Please try again later!");
    } finally {
      setIsSendingOtp(false);
    }
  }

  function goBack() {
    dispatch({ type: "UPDATE_PIN", payload: "" });
    dispatch(changeCurrentStage(1));
  }

  return (
    <div>
      <h3 className="text-[32px] leading-[1]">App PIN</h3>
      <button
        type="button"
        onClick={goBack}
        className="mb-4 flex items-center gap-1 min-h-[44px]"
      >
        <MoveLeft size={20} />
        <p>Back</p>
      </button>
      <p className="text-[var(--dark-1)]/25 text-[14px] mb-8">
        <span>Enter your 4-digit PIN for </span>
        <span className="text-black">+91 {mobileNumber}</span>
      </p>
      <InputOTP
        maxLength={4}
        value={pin}
        onChange={(value) => dispatch({ type: "UPDATE_PIN", payload: value })}
      >
        <InputOTPGroup>
          {Array.from({ length: 4 }, (_, i) => i).map((index) => (
            <InputOTPSlot
              index={index}
              key={index}
              className="h-[48px] w-[48px] bg-[var(--comp-1)] focus:outline-none data-[active=true]:ring-0 !rounded-[10px] mr-2 border-1"
            />
          ))}
        </InputOTPGroup>
      </InputOTP>
      <div className="text-[14px] mt-4 space-y-2">
        <button
          type="button"
          className="font-bold min-h-[44px] disabled:opacity-50"
          onClick={useOtpInstead}
          disabled={isSendingOtp}
        >
          {isSendingOtp ? "Sending OTP..." : "Use OTP instead"}
        </button>
      </div>
      <Button
        variant="wz"
        size="lg"
        className="block px-12 mx-auto mt-10 min-h-[44px]"
        onClick={loginWithPin}
        disabled={isSubmitting || String(pin).length !== 4}
      >
        {isSubmitting ? "Signing in..." : "Sign In"}
      </Button>
    </div>
  );
}
