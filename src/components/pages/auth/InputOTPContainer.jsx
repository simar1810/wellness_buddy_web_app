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

export default function InputOTPContainer() {
  const {
    isFirstTime,
    mobileNumber,
    otp,
    otpChannel,
    dispatch,
    user
  } = useCurrentStateContext();

  const dispatchRedux = useAppDispatch();
  const router = useRouter();
  const [isResendingOtp, setIsResendingOtp] = useState(false);

  async function verifyOtp() {
    try {
      const data = {
        mobileNumber,
        otp
      }
      const response = await sendData("app/verifyOtp", data);
      if (
        response.status_code !== 200 &&
        !response.success
      ) throw new Error(response.error);
      toast.success(response.message);

      const authHeaderResponse = await fetch("/api/login", {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          refreshToken: user.webRefreshTokenList?.pop(),
          _id: user._id,
          userType: "coach"
        })
      })
      const authHeaderData = await authHeaderResponse.json()
      if (authHeaderData.status_code !== 200) throw new Error(authHeaderData.message);
      dispatchRedux(store({ ...user, refreshToken: response.refreshToken }));

      if (isFirstTime) {
        dispatch(coachfirstTimeRegistration(user.coachId));
        return;
      } else {
        router.push("/coach/dashboard");
      }
    } catch (error) {
      toast.error(error.message || "Please try again Later!");
    }
  }

  async function requestOtp(channel = otpChannel) {
    if (mobileNumber.length !== 10) {
      throw new Error("Mobile number should be 10 digits longer!");
    }
    const data = {
      credential: "+91" + mobileNumber,
      fcmToken: "",
      otpChannel: channel,
    };
    const response = await sendData("app/signin?authMode=mob&clientType=web", data);
    if (response.status_code === 400) throw new Error(response.message);
    dispatch({
      type: "UPDATE_CURRENT_STATE",
      payload: {
        stage: 2,
        user: response.data.user
      }
    });
    if (channel !== otpChannel) {
      dispatch(updateOtpChannel(channel));
    }
    return response;
  }

  async function resendOtp(channel = otpChannel) {
    if (isResendingOtp) return;
    try {
      setIsResendingOtp(true);
      const response = await requestOtp(channel);
      dispatch({ type: "UPDATE_OTP", payload: "" });
      const message = response.message
        || (channel === "whatsapp" ? "OTP sent on WhatsApp" : "OTP sent successfully!");
      toast.success(message);
    } catch (error) {
      toast.error(error.message || " Please try again Later!")
    } finally {
      setIsResendingOtp(false);
    }
  }

  function goBack() {
    dispatch(updateOtpChannel("sms"));
    dispatch(changeCurrentStage(1));
  }

  const deliveryMethod = otpChannel === "whatsapp" ? "WhatsApp" : "SMS";

  return <div>
    <h3 className="text-[32px] leading-[1]">Security Code</h3>
    <button
      onClick={goBack}
      className="mb-4 flex items-center gap-1"
    >
      <MoveLeft size={20} />
      <p>Back</p>
    </button>
    <p className="text-[var(--dark-1)]/25 text-[14px] mb-8">
      <span>Enter 4-Digit OTP sent via {deliveryMethod} on </span>
      <span className="text-black">+91 {mobileNumber}</span>
    </p>
    <InputOTP
      maxLength={4}
      value={otp}
      onChange={(value) => dispatch({ type: "UPDATE_OTP", payload: value })}
    >
      <InputOTPGroup>
        {Array.from({ length: 4 }, (_, i) => i).map(index => <InputOTPSlot
          index={index}
          key={index}
          className="h-[48px] w-[48px] bg-[var(--comp-1)] focus:outline-none data-[active=true]:ring-0 !rounded-[10px] mr-2 border-1"
        />)}
      </InputOTPGroup>
    </InputOTP>
    <div className="text-[14px] mt-4 space-y-2">
      <div className="flex items-center gap-1">
        <p className="text-[var(--dark-1)]/50">Didn&apos;t received OTP?</p>
        <button
          className="font-bold disabled:opacity-50"
          onClick={() => resendOtp()}
          disabled={isResendingOtp}
        >
          {isResendingOtp ? "Sending..." : "Resend OTP"}
        </button>
      </div>
      {otpChannel === "sms" ? (
        <button
          type="button"
          className="block font-bold text-[#128C7E] disabled:opacity-50"
          onClick={() => resendOtp("whatsapp")}
          disabled={isResendingOtp}
        >
          Request code via WhatsApp
        </button>
      ) : (
        <button
          type="button"
          className="block font-bold disabled:opacity-50"
          onClick={() => resendOtp("sms")}
          disabled={isResendingOtp}
        >
          Switch back to SMS
        </button>
      )}
    </div>
    <Button
      variant="wz"
      size="lg"
      className="block px-12 mx-auto mt-10"
      onClick={verifyOtp}
    >
      Sign In
    </Button>
  </div>
}
