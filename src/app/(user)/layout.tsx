import { TopBar } from "@/components/shared/top-bar";

export default function UserLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="eco-shell min-h-screen">
      <TopBar />
      <main className="mx-auto min-h-screen max-w-7xl px-4 py-6 sm:px-6 lg:px-8">{children}</main>
    </div>
  );
}
