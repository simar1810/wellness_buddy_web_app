import GlobalStateProvider from "@/providers/GlobalStateProvider";
import "./globals.css";
import { Toaster } from "sonner";
import { SWRConfig } from "swr";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { use } from "react";

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
      </body>
    </html>
  );
}
