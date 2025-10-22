import GlobalStateProvider from "@/providers/GlobalStateProvider";
import "./globals.css";
import { Toaster } from "sonner";
import { SWRConfig } from "swr";
import Link from "next/link";
import Image from "next/image";

export const metadata = {
  title: "Wellness Buddy",
  description: "All in One Business Platform for Wellness Professionals",
};

export default function RootLayout({ children }) {

  return (
    <html lang="en">
      <body className="antialiased">
        <Toaster richColors />
        <GlobalStateProvider>
          <SWRConfig value={{ revalidateOnFocus: false, revalidateIfStale: false }}>
            {children}
          </SWRConfig>
        </GlobalStateProvider>
        <div className="w-full sticky bottom-0 flex flex-col sm:flex-row gap-1 sm:gap-2 justify-center sm:justify-center items-center h-auto py-2 bg-white border-t border-gray-200 px-3 sm:px-4">
          <Image
            src="/zw.png"
            alt="Wellnessz Logo"
            width={100}
            height={56}
            className="object-contain"
          />
          <p className="text-gray-600 text-sm sm:text-base font-medium text-center sm:text-left">
            Powered by&nbsp;
            <Link
              href="https://ayushmanhealth.org/"
              target="_blank"
              className="font-semibold text-gray-800"
            >
              Wellnessz.in
            </Link>
          </p>
        </div>
      </body>
    </html>
  );
}
