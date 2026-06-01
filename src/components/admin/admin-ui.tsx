import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import type { SubmissionStatus } from "@/core/entities/types";

type AdminPageHeaderProps = {
  eyebrow?: string;
  title: string;
  body?: string;
  action?: ReactNode;
};

export function AdminPageHeader({ eyebrow, title, body, action }: AdminPageHeaderProps) {
  return (
    <section className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between" data-admin-reveal>
      <div className="min-w-0">
        {eyebrow ? <p className="text-xs font-black uppercase tracking-[0.14em] text-[#006d37]">{eyebrow}</p> : null}
        <h1 className="mt-1 text-3xl font-black leading-tight tracking-[-0.04em] text-[#1b1c1b] lg:text-4xl">{title}</h1>
        {body ? <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-[#6e7a70]">{body}</p> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </section>
  );
}

export function AdminCard({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <section className={`rounded-2xl border border-[#d9e5da] bg-white shadow-[0_8px_24px_rgba(21,29,24,0.035)] ${className}`} data-admin-reveal>
      {children}
    </section>
  );
}

export function AdminMetric({
  label,
  value,
  Icon,
  tone = "green",
  valueClassName = "text-2xl leading-tight",
}: {
  label: string;
  value: string;
  Icon?: LucideIcon;
  tone?: "green" | "blue" | "amber" | "red";
  valueClassName?: string;
}) {
  const toneClass = {
    green: "bg-[#d8f5df] text-[#006d37]",
    blue: "bg-[#e8f5ff] text-[#006496]",
    amber: "bg-[#fff7e6] text-[#bd7700]",
    red: "bg-[#ffdad6]/45 text-[#ba1a1a]",
  }[tone];

  return (
    <div className="rounded-2xl border border-[#d9e5da] bg-[#fbf9f8] p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-black uppercase tracking-[0.08em] text-[#6e7a70]">{label}</p>
        {Icon ? (
          <span className={`grid size-9 shrink-0 place-items-center rounded-xl ${toneClass}`}>
            <Icon size={17} />
          </span>
        ) : null}
      </div>
      <p className={`mt-2 font-black tracking-[-0.03em] text-[#1b1c1b] ${valueClassName}`}>{value}</p>
    </div>
  );
}

const statusClass: Record<SubmissionStatus, string> = {
  approved: "bg-[#d8f5df] text-[#006d37]",
  pending_review: "bg-[#fff7e6] text-[#bd7700]",
  rejected: "bg-[#ffdad6]/55 text-[#ba1a1a]",
};

const statusLabel: Record<SubmissionStatus, string> = {
  approved: "Đã cộng điểm",
  pending_review: "Chờ duyệt",
  rejected: "Từ chối",
};

export function AdminStatusBadge({ status }: { status: SubmissionStatus }) {
  return <span className={`inline-flex min-h-8 items-center rounded-full px-3 text-xs font-black ${statusClass[status]}`}>{statusLabel[status]}</span>;
}

export function AdminVisualPanel({
  Icon,
  label,
  className = "",
}: {
  Icon: LucideIcon;
  label: string;
  className?: string;
}) {
  return (
    <div className={`relative isolate overflow-hidden rounded-2xl bg-[#e8f5ff] ${className}`}>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(46,204,113,0.30),transparent_30%),radial-gradient(circle_at_82%_12%,rgba(45,156,219,0.26),transparent_32%),linear-gradient(135deg,rgba(251,249,248,0.88),rgba(216,245,223,0.68))]" />
      <div className="absolute inset-0 opacity-35 [background-image:linear-gradient(rgba(0,109,55,0.16)_1px,transparent_1px),linear-gradient(90deg,rgba(0,109,55,0.14)_1px,transparent_1px)] [background-size:24px_24px]" />
      <div className="relative z-10 grid h-full min-h-[160px] place-items-center p-6 text-center">
        <div>
          <span className="mx-auto grid size-16 place-items-center rounded-2xl bg-white/85 text-[#006d37] shadow-[0_14px_32px_rgba(0,109,55,0.12)]">
            <Icon size={30} />
          </span>
          <p className="mt-4 text-xs font-black uppercase tracking-[0.12em] text-[#006d37]">{label}</p>
        </div>
      </div>
    </div>
  );
}
