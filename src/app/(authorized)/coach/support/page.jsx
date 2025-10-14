import { IoLogoWhatsapp } from "react-icons/io";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Phone } from "lucide-react";

export default function Page() {
  return <div className="content-height-screen content-container">
    <h4>Link Generator</h4>
    <div className="relative">
      <Image
        src="/illustrations/support.svg"
        alt=""
        height={300}
        width={300}
        className="object-contain mx-auto mt-24"
      />
      <h3 className="text-[24px] text-center my-4">Help and Support</h3>
      <Button variant="wz_outline" className="max-w-[40ch] w-full text-black h-auto mb-2 flex justify-start mx-auto border-2">
        <IoLogoWhatsapp className="text-[var(--accent-1)]" />
        Whatsapp Support (9876543210)
      </Button>
      <Button variant="wz_outline" className="max-w-[40ch] w-full text-black h-auto flex justify-start mx-auto border-2">
        <Phone fill="#01a809" className="text-[var(--accent-1)]" />
        Call Support (9876543210)
      </Button>
    </div>
  </div>
}