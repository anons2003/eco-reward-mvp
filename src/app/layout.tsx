import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Eco-Reward",
  description: "Tích điểm xanh khi phân loại rác đúng cách.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="vi">
      <body>{children}</body>
    </html>
  );
}
