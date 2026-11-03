import useCurrentStateContext from "@/providers/CurrentStateContext";
import InputMobileNumber from "./InputMobileNumber";
import InputOTPContainer from "./InputOTPContainer";
import InputPinContainer from "./InputPinContainer";
import { useAppSelector } from "@/providers/global/hooks";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import RegisterContainer from "./RegisterContainer";

export default function LoginContainer() {
  const { stage } = useCurrentStateContext();
  const { isLoggedIn } = useAppSelector(state => state.coach);

  const router = useRouter();

  // stage: 1 mobile, 2 OTP, 3 register, 4 PIN
  const Component = (function () {
    switch (stage) {
      case 1:
        return InputMobileNumber;
      case 2:
        return InputOTPContainer;
      case 3:
        return RegisterContainer;
      case 4:
        return InputPinContainer;
      default:
        return InputMobileNumber;
    }
  })();

  useEffect(function () {
    if (isLoggedIn) router.push("/coach/dashboard");
  }, [])

  return <div className="grow">
    <Component />
  </div>
}