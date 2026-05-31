import type { Metadata } from "next";
import { Suspense } from "react";
import { AppToast } from "@/components/shared/app-toast";
import { GlobalLoadingProvider } from "@/components/shared/loading-ui";
import "./globals.css";

export const metadata: Metadata = {
  title: "Eco-Reward",
  description: "Tích điểm xanh khi phân loại rác đúng cách.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="vi">
      <body>
        <GlobalLoadingProvider>
          {children}
          <Suspense fallback={null}>
            <AppToast />
          </Suspense>
        </GlobalLoadingProvider>
      </body>
    </html>
  );
}
