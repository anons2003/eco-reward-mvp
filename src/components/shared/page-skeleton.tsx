import type { CSSProperties } from "react";

type SkeletonVariant = "user" | "admin";

function SkeletonBlock({ className = "", style }: { className?: string; style?: CSSProperties }) {
  return <div className={`skeleton-shimmer rounded-2xl bg-[#e7f0e7] ${className}`} style={style} />;
}

function UserPageSkeleton() {
  return (
    <div className="space-y-5" aria-label="Đang tải trang" aria-busy="true">
      <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_280px]">
        <div className="relative overflow-hidden rounded-[28px] border border-[#d9e5da] bg-white/82 p-6 shadow-[0_12px_40px_rgba(21,29,24,0.05)] md:p-8">
          <SkeletonBlock className="h-8 w-48" />
          <SkeletonBlock className="mt-5 h-4 w-full max-w-xl" />
          <SkeletonBlock className="mt-3 h-4 w-4/5 max-w-lg" />
          <SkeletonBlock className="mt-7 h-12 w-40 rounded-full" />
          <SkeletonBlock className="absolute -bottom-8 right-8 hidden size-36 rounded-[36px] md:block" />
        </div>
        <div className="hidden rounded-[28px] border border-[#d9e5da] bg-white/82 p-4 shadow-[0_12px_34px_rgba(21,29,24,0.06)] xl:block">
          <SkeletonBlock className="h-6 w-28 rounded-full" />
          <SkeletonBlock className="mt-4 aspect-[16/10] w-full rounded-3xl" />
          <SkeletonBlock className="mt-4 h-4 w-4/5" />
          <SkeletonBlock className="mt-3 h-6 w-24" />
        </div>
      </section>

      <section className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div className="rounded-[22px] border border-[#d9e5da] bg-white p-4 shadow-[0_8px_24px_rgba(21,29,24,0.04)]" key={index}>
            <div className="flex items-center gap-3">
              <SkeletonBlock className="size-11 rounded-2xl" />
              <div className="min-w-0 flex-1">
                <SkeletonBlock className="h-3 w-24" />
                <SkeletonBlock className="mt-2 h-6 w-20" />
              </div>
            </div>
          </div>
        ))}
      </section>

      <section className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="rounded-[28px] border border-[#d9e5da] bg-white/82 p-6 shadow-[0_12px_40px_rgba(21,29,24,0.05)]">
          <div className="flex items-start justify-between gap-4">
            <div>
              <SkeletonBlock className="h-5 w-44" />
              <SkeletonBlock className="mt-3 h-4 w-60" />
            </div>
            <SkeletonBlock className="h-9 w-24 rounded-full" />
          </div>
          <div className="mt-8 flex h-56 items-end gap-3">
            {[62, 78, 44, 88, 70, 96, 84].map((height, index) => (
              <div className="flex flex-1 flex-col items-center gap-3" key={index}>
                <SkeletonBlock className="w-full rounded-full" style={{ height: `${height}%` } as CSSProperties} />
                <SkeletonBlock className="h-3 w-6" />
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[28px] border border-[#d9e5da] bg-white/82 p-6 shadow-[0_12px_40px_rgba(21,29,24,0.05)]">
          <div className="flex items-center justify-between">
            <SkeletonBlock className="h-5 w-24" />
            <SkeletonBlock className="h-4 w-16" />
          </div>
          <div className="mt-5 space-y-3">
            {Array.from({ length: 4 }).map((_, index) => (
              <div className="flex items-center justify-between gap-3 rounded-[22px] p-2" key={index}>
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <SkeletonBlock className="size-11 shrink-0 rounded-full" />
                  <div className="min-w-0 flex-1">
                    <SkeletonBlock className="h-4 w-3/4" />
                    <SkeletonBlock className="mt-2 h-3 w-24" />
                  </div>
                </div>
                <SkeletonBlock className="h-7 w-20 rounded-full" />
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function AdminPageSkeleton() {
  return (
    <div className="space-y-6" aria-label="Đang tải trang quản trị" aria-busy="true">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="w-full max-w-2xl">
          <SkeletonBlock className="h-3 w-24" />
          <SkeletonBlock className="mt-4 h-10 w-72" />
          <SkeletonBlock className="mt-3 h-4 w-full" />
          <SkeletonBlock className="mt-2 h-4 w-2/3" />
        </div>
        <SkeletonBlock className="h-11 w-40 rounded-full" />
      </div>

      <section className="grid gap-4 md:grid-cols-5">
        {Array.from({ length: 5 }).map((_, index) => (
          <div className="eco-card rounded-[24px] p-4" key={index}>
            <SkeletonBlock className="size-10 rounded-xl" />
            <SkeletonBlock className="mt-4 h-7 w-16" />
            <SkeletonBlock className="mt-2 h-4 w-24" />
          </div>
        ))}
      </section>

      <section className="eco-card overflow-hidden rounded-[32px] p-6">
        <div className="flex items-center justify-between">
          <SkeletonBlock className="h-6 w-36" />
          <SkeletonBlock className="h-4 w-20" />
        </div>
        <div className="mt-5 grid gap-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div className="grid gap-4 rounded-2xl border border-[#e6e7ef] bg-white p-4 md:grid-cols-[1fr_160px_140px] md:items-center" key={index}>
              <div>
                <SkeletonBlock className="h-4 w-48" />
                <SkeletonBlock className="mt-2 h-3 w-72 max-w-full" />
              </div>
              <SkeletonBlock className="h-5 w-20" />
              <SkeletonBlock className="h-7 w-24 rounded-full" />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export function PageSkeleton({ variant = "user" }: { variant?: SkeletonVariant }) {
  return variant === "admin" ? <AdminPageSkeleton /> : <UserPageSkeleton />;
}
