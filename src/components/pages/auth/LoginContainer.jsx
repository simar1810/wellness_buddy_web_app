import useCurrentStateContext from "@/providers/CurrentStateContext";
import InputMobileNumber from "./InputMobileNumber";
import InputOTPContainer from "./InputOTPContainer";
import { useAppSelector } from "@/providers/global/hooks";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import RegisterContainer from "./RegisterContainer";

export default function LoginContainer() {
  const { stage } = useCurrentStateContext();
  const { isLoggedIn } = useAppSelector(state => state.coach);

  const router = useRouter();

  const Component = (function () {
    switch (stage) {
      case 1:
        return InputMobileNumber;
      case 2:
        return InputOTPContainer;
      case 3:
        return RegisterContainer;
    }
  })();

  useEffect(function () {
    if (isLoggedIn) router.push("/coach/dashboard");
  }, [])

  return <div className="grow">
    <Component />
  </div>
}