const state = {
  stage: 1, // 1 mobile, 2 OTP, 3 register, 4 PIN
  mobileNumber: "",
  otp: "",
  pin: "",
  otpChannel: "sms", // "sms" | "whatsapp"
  hasPin: false,
  isFirstTime: false,
  loginType: "coach", // "coach" or "user"
  userLogin: {
    userId: "",
    password: ""
  },
  registration: {
    name: "",
    expectedNoOfClients: "",
    city: "",
    coachId: "",
    organisation: "",
    terms: false,
    coachRef: ""
  }
}

export default state;