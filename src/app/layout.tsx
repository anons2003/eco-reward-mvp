import type { Metadata } from "next";
import { Suspense } from "react";
import { AppToast } from "@/components/shared/app-toast";
import "./globals.css";

export const metadata: Metadata = {
  title: "Eco-Reward",
  description: "Tích điểm xanh khi phân loại rác đúng cách.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="vi">
      <body>
        {children}
        <Suspense fallback={null}>
          <AppToast />
        </Suspense>
      </body>
    </html>
  );
}
