import type { Metadata } from "next";
import { Suspense } from "react";
import { AppToast } from "@/components/shared/app-toast";
import { GlobalLoadingProvider } from "@/components/shared/loading-ui";
import "maplibre-gl/dist/maplibre-gl.css";
import "./globals.css";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

export const metadata: Metadata = {
  title: "SeaTech",
  description: "Tích điểm xanh khi phân loại rác đúng cách.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="vi" className={cn("font-sans", geist.variable)}>
      <body suppressHydrationWarning>
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
