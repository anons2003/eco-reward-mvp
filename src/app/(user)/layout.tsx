import { TopBar } from "@/components/shared/top-bar";

export default function UserLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <TopBar />
      <main className="mx-auto min-h-screen max-w-6xl px-4 py-6">{children}</main>
    </>
  );
}
