import Link from "next/link";
import { CheckCircle2, Leaf, QrCode, ShieldCheck, Sparkles, Wallet } from "lucide-react";

type AuthShellProps = {
  eyebrow: string;
  title: string;
  body: string;
  children: React.ReactNode;
  sideTitle?: string;
  sideBody?: string;
};

const highlights = [
  { title: "Quét QR", body: "Xác nhận đúng thùng", Icon: QrCode },
  { title: "Phân loại", body: "AI hỗ trợ nhận diện", Icon: ShieldCheck },
  { title: "Tích điểm", body: "Theo dõi trong ví xanh", Icon: Wallet },
];

export function AuthShell({ eyebrow, title, body, children, sideTitle = "Hành động xanh, điểm thưởng thật.", sideBody = "Eco-Reward giúp ghi nhận từng lượt phân loại rác bằng QR, ảnh chụp và điểm xanh trong một trải nghiệm gọn gàng." }: AuthShellProps) {
  return (
    <main className="min-h-screen bg-[#f3fcf3] bg-[radial-gradient(#bdcabe_1px,transparent_1px)] px-4 py-5 text-[#151d18] [background-size:24px_24px] sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-40px)] w-full max-w-6xl items-center">
        <section className="grid w-full overflow-hidden rounded-[32px] border border-[#d9e5da] bg-white/86 shadow-[0_28px_90px_rgba(21,29,24,0.10)] backdrop-blur-xl lg:grid-cols-[1fr_0.92fr]">
          <div className="relative hidden min-h-[720px] overflow-hidden border-r border-[#d9e5da] bg-[#edf6ed] p-10 lg:block">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_12%,rgba(143,248,182,0.40),transparent_30%),radial-gradient(circle_at_86%_18%,rgba(216,237,255,0.65),transparent_28%)]" />
            <div className="relative z-10 flex h-full flex-col justify-between">
              <div className="flex items-center justify-between">
                <Link className="flex w-fit items-center gap-3 text-xl font-black tracking-[-0.03em] text-[#007a3d]" href="/">
                  <span className="grid size-12 place-items-center rounded-2xl bg-[#d8f5df] text-[#007a3d] ring-1 ring-[#bdcabe]/50">
                    <Leaf size={26} />
                  </span>
                  EcoReward
                </Link>
                <span className="rounded-full bg-white/80 px-4 py-2 text-xs font-black uppercase tracking-[0.14em] text-[#3e4941]">Tích điểm xanh</span>
              </div>

              <div>
                <span className="inline-flex items-center gap-2 rounded-full bg-white/82 px-4 py-2 text-sm font-black text-[#007a3d] shadow-sm">
                  <Sparkles size={16} />
                  Ghi nhận đúng lượt gửi
                </span>
                <h1 className="mt-7 max-w-xl text-[56px] font-black leading-[60px] tracking-[-0.05em] text-[#093719]">{sideTitle}</h1>
                <p className="mt-5 max-w-lg text-lg font-semibold leading-8 text-[#3e4941]">{sideBody}</p>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                {highlights.map(({ title: itemTitle, body: itemBody, Icon }) => (
                  <div className="rounded-[22px] border border-[#d9e5da] bg-white/88 p-4" key={itemTitle}>
                    <Icon className="text-[#007a3d]" size={22} />
                    <p className="mt-3 font-black text-[#151d18]">{itemTitle}</p>
                    <p className="mt-1 text-sm font-semibold leading-5 text-[#5d6a60]">{itemBody}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex min-h-[620px] items-center px-6 py-8 sm:px-10 lg:px-14">
            <div className="w-full">
              <div className="mb-8">
                <div className="mb-5 flex items-center gap-3 lg:hidden">
                  <span className="grid size-12 place-items-center rounded-2xl bg-[#d8f5df] text-[#007a3d] ring-1 ring-[#bdcabe]/50">
                    <Leaf size={26} />
                  </span>
                  <span className="text-xl font-black tracking-[-0.03em] text-[#007a3d]">EcoReward</span>
                </div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-[#007a3d]">{eyebrow}</p>
                <h2 className="mt-3 text-[40px] font-black leading-[46px] tracking-[-0.05em] text-[#151d18] sm:text-5xl sm:leading-[54px]">{title}</h2>
                <p className="mt-3 max-w-xl text-sm font-semibold leading-7 text-[#5d6a60] sm:text-base">{body}</p>
              </div>
              {children}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

export function AuthNotice({ children, tone = "error" }: { children: React.ReactNode; tone?: "error" | "success" }) {
  return (
    <p className={`mb-5 rounded-[22px] p-4 text-sm font-bold ${tone === "error" ? "bg-[#ffdad6] text-[#8c1d18] ring-1 ring-[#ffb4ab]" : "bg-[#d8f5df] text-[#006a3d] ring-1 ring-[#9fd7b0]"}`}>
      {children}
    </p>
  );
}

export function FieldHelper({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <p className="mt-2 text-xs font-semibold leading-5 text-[#5d6a60]" id={id}>
      {children}
    </p>
  );
}

export function AuthDivider() {
  return (
    <div className="flex items-center gap-3 text-xs font-black uppercase tracking-[0.12em] text-[#6e7a70]">
      <span className="h-px flex-1 bg-[#d9e5da]" />
      hoặc
      <span className="h-px flex-1 bg-[#d9e5da]" />
    </div>
  );
}

export function AuthValuePill({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full bg-[#d8f5df] px-3 py-1 text-xs font-black text-[#007a3d]">
      <CheckCircle2 size={14} />
      {children}
    </span>
  );
}
