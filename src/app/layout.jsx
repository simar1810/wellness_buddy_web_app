import GlobalStateProvider from "@/providers/GlobalStateProvider";
import "./globals.css";
import { Toaster } from "sonner";
import { SWRConfig } from "swr";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { use } from "react";
import Link from "next/link";

export const metadata = {
  title: "Wellness Buddy",
  description: "All in One Business Platform for Wellness Professionals",
};

export default function RootLayout({ children }) {
  const headersList = use(headers());
  const userAgent = headersList.get('user-agent') || '';

  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|Tablet/i.test(userAgent);

  if (isMobile) {
    redirect('https://app.waytowellness.in/app');
  }
  return (
    <html lang="en">
      <body className="antialiased">
        <Toaster richColors />
        <GlobalStateProvider>
          <SWRConfig value={{ revalidateOnFocus: false, revalidateIfStale: false }}>
            {children}
          </SWRConfig>
        </GlobalStateProvider>
        <p className="text-gray-600 text-sm sm:text-base font-bold text-center sm:text-left flex items-center justify-center sticky bottom-0 bg-white py-[4px] border-t-1">
          Powered by&nbsp;
          <Link
            href="https://wellnessz.in/"
            target="_blank"
            className="font-semibold text-[#67BC2A]"
          >
            wellnessz.in
          </Link>
        </p>
      </body>
    </html>
  );
}
