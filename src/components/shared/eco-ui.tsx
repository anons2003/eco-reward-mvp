import Link from "next/link";
import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

export function PageHeader({
  eyebrow,
  title,
  body,
  action,
}: {
  eyebrow?: string;
  title: string;
  body?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow ? <p className="text-xs font-black uppercase tracking-[0.18em] text-[#5f6472]">{eyebrow}</p> : null}
        <h1 className="mt-2 text-4xl font-black leading-tight tracking-[-0.03em] text-[#151515] sm:text-5xl">{title}</h1>
        {body ? <p className="mt-2 max-w-2xl leading-7 text-[#5f6472]">{body}</p> : null}
      </div>
      {action}
    </div>
  );
}

export function MetricCard({ label, value, icon: Icon, tone = "green" }: { label: string; value: string | number; icon: LucideIcon; tone?: "green" | "blue" | "amber" | "red" }) {
  const toneClass = {
    green: "bg-[#f4f5fb] text-[#151515]",
    blue: "bg-[#e8fbff] text-[#00687a]",
    amber: "bg-[#fff7e6] text-[#92400E]",
    red: "bg-[#fff0f0] text-[#B91C1C]",
  }[tone];

  return (
    <div className="eco-card rounded-[24px] p-5">
      <span className={`grid size-11 place-items-center rounded-xl ${toneClass}`}>
        <Icon size={21} />
      </span>
      <p className="mt-4 text-3xl font-black text-[#151515]">{value}</p>
      <p className="mt-1 text-sm font-bold text-[#5f6472]">{label}</p>
    </div>
  );
}

export function PrimaryLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link className="btn-primary focus-ring" href={href}>
      {children}
    </Link>
  );
}

export function SecondaryLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link className="btn-secondary focus-ring" href={href}>
      {children}
    </Link>
  );
}

export function PhoneFrame({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-[430px] rounded-[32px] border border-[#e6e7ef] bg-[#fbfbff] p-2 shadow-[0_26px_70px_rgba(20,54,38,0.18)]">
      <div className="overflow-hidden rounded-[24px] bg-[#fbfbff]">{children}</div>
    </div>
  );
}
