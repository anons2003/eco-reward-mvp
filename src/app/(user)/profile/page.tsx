import Link from "next/link";
import { Award, BarChart3, Camera, Droplets, Edit3, Leaf, Mail, MapPin, Phone, Recycle, Share2, Trees, Trophy, WalletCards } from "lucide-react";
import { UserAvatar } from "@/components/shared/user-avatar";
import { getUserShell } from "@/infrastructure/auth/session";

function StatCard({ Icon, label, value, unit }: { Icon: typeof WalletCards; label: string; value: string; unit: string }) {
  return (
    <div className="flex items-center gap-4 rounded-3xl border border-[#bdcabe]/60 bg-white p-5 shadow-[0_2px_8px_rgba(21,29,24,0.05)]">
      <span className="grid size-12 place-items-center rounded-2xl bg-[#edf6ed] text-[#007a3d]">
        <Icon size={22} />
      </span>
      <div>
        <p className="text-xs font-bold text-[#6e7a70]">{label}</p>
        <p className="mt-1 text-2xl font-black tracking-[-0.04em] text-[#151d18]">
          {value} <span className="text-sm font-semibold tracking-normal text-[#6e7a70]">{unit}</span>
        </p>
      </div>
    </div>
  );
}

export default async function ProfilePage() {
  const { avatarUrl, displayName, points, profile, user } = await getUserShell();
  const email = user.email ?? "nguyen.an@seatech.app";
  const phone = profile?.phone ?? "Chưa cập nhật";
  const location = profile?.location ?? "Chưa cập nhật";
  const bio = profile?.bio ?? "Hành động nhỏ, tác động lớn. Cùng nhau xây dựng thế giới xanh hơn!";
  const nextRank = 15000;
  const progress = Math.min(Math.round((points / nextRank) * 100), 100);

  return (
    <>
      <section className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-[#007a3d]">Hồ sơ</p>
          <h1 className="mt-2 text-3xl font-black tracking-[-0.04em] text-[#151d18] md:text-5xl">Hồ sơ cá nhân</h1>
        </div>
        <Link className="inline-flex min-h-11 items-center gap-2 rounded-full bg-white px-5 text-sm font-black text-[#151d18] ring-1 ring-[#bdcabe] transition hover:bg-[#edf6ed]" href="/settings">
          <Edit3 size={17} />
          Chỉnh sửa hồ sơ
        </Link>
      </section>

      <section className="rounded-[2rem] border border-[#bdcabe]/60 bg-white p-6 shadow-[0_2px_8px_rgba(21,29,24,0.05)] md:p-8">
        <div className="grid gap-6 lg:grid-cols-[1fr_320px] lg:items-center">
          <div className="flex flex-col gap-5 md:flex-row md:items-center">
            <div className="relative">
              <UserAvatar className="ring-[#007a3d]/20" name={displayName} size="xl" src={avatarUrl} />
              <span className="absolute bottom-1 right-1 grid size-9 place-items-center rounded-full bg-[#007a3d] text-white ring-4 ring-white">
                <Camera size={16} />
              </span>
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-3xl font-black tracking-[-0.04em] text-[#151d18]">{displayName}</h2>
                <span className="rounded-full bg-[#fff3c4] px-2.5 py-1 text-[10px] font-black uppercase text-[#755b00]">Vàng</span>
              </div>
              <p className="mt-3 max-w-xl text-sm font-semibold leading-6 text-[#3e4941]">“{bio}”</p>
              <div className="mt-5 flex flex-wrap gap-3">
                <Link className="inline-flex min-h-10 items-center gap-2 rounded-full bg-[#007a3d] px-4 text-sm font-black text-white" href="/settings">
                  <Edit3 size={16} />
                  Chỉnh sửa hồ sơ
                </Link>
                <button className="inline-flex min-h-10 items-center gap-2 rounded-full bg-white px-4 text-sm font-black text-[#151d18] ring-1 ring-[#bdcabe]" type="button">
                  <Share2 size={16} />
                  Chia sẻ thành tích
                </button>
              </div>
            </div>
          </div>

          <div className="rounded-3xl bg-[#edf6ed] p-5">
            <div className="mb-3 flex items-center justify-between text-xs font-black uppercase tracking-[0.12em] text-[#3e4941]">
              <span>Tiến trình lên hạng Kim cương</span>
              <Trophy className="text-[#755b00]" size={18} />
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-white">
              <div className="h-full rounded-full bg-[#007a3d]" style={{ width: `${progress}%` }} />
            </div>
            <p className="mt-2 text-right text-xs font-bold text-[#3e4941]">
              {points.toLocaleString("vi-VN")} / {nextRank.toLocaleString("vi-VN")} pts
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <StatCard Icon={WalletCards} label="Tổng điểm tích lũy" unit="pts" value={points.toLocaleString("vi-VN")} />
        <StatCard Icon={Trees} label="Số cây đã đóng góp" unit="cây" value="14" />
        <StatCard Icon={BarChart3} label="CO2 giảm thiểu" unit="kg" value="240" />
      </section>

      <section className="grid gap-5 lg:grid-cols-[1fr_360px]">
        <div className="rounded-[2rem] border border-[#bdcabe]/60 bg-white p-6 shadow-[0_2px_8px_rgba(21,29,24,0.05)]">
          <div className="mb-8 flex items-center justify-between">
            <h2 className="text-lg font-black text-[#151d18]">Biểu đồ tác động cá nhân</h2>
            <span className="rounded-full bg-[#edf6ed] px-3 py-1 text-xs font-black text-[#3e4941]">6 tháng gần nhất</span>
          </div>
          <div className="flex h-56 items-end gap-4">
            {[30, 52, 44, 70, 58, 88].map((height, index) => (
              <div className="flex h-full flex-1 flex-col justify-end gap-2" key={height}>
                <div className="rounded-t-2xl bg-[#d8f5df]" style={{ height: `${height}%` }}>
                  <div className="h-1/2 rounded-t-2xl bg-[#007a3d]" />
                </div>
                <span className="text-center text-xs font-bold text-[#6e7a70]">T{index + 1}</span>
              </div>
            ))}
          </div>
          <div className="mt-5 flex justify-center gap-6 text-xs font-bold text-[#3e4941]">
            <span className="inline-flex items-center gap-2">
              <span className="size-2 rounded-full bg-[#007a3d]" /> Tái chế nhựa
            </span>
            <span className="inline-flex items-center gap-2">
              <span className="size-2 rounded-full bg-[#d8f5df]" /> Tiết kiệm năng lượng
            </span>
          </div>
        </div>

        <aside className="rounded-[2rem] border border-[#bdcabe]/60 bg-white p-6 shadow-[0_2px_8px_rgba(21,29,24,0.05)]">
          <h2 className="text-lg font-black text-[#151d18]">Huy hiệu gần đây</h2>
          <div className="mt-5 space-y-3">
            {[
              { title: "Siêu Phân Loại", body: "Phân loại 50kg rác thải", Icon: Recycle, tone: "bg-[#fff3c4] text-[#755b00]" },
              { title: "Tiết Kiệm Nước", body: "Tiết kiệm 500L nước sạch", Icon: Droplets, tone: "bg-[#e3f2ff] text-[#006496]" },
              { title: "Chuyên Gia Tái Chế", body: "Sáng tạo 10 vật phẩm mới", Icon: Leaf, tone: "bg-[#d8f5df] text-[#007a3d]" },
            ].map((badge) => (
              <div className="flex gap-3 rounded-2xl bg-[#edf6ed] p-4" key={badge.title}>
                <span className={`grid size-11 shrink-0 place-items-center rounded-full ${badge.tone}`}>
                  <badge.Icon size={20} />
                </span>
                <div>
                  <p className="font-black text-[#151d18]">{badge.title}</p>
                  <p className="mt-1 text-xs font-semibold text-[#6e7a70]">{badge.body}</p>
                </div>
              </div>
            ))}
          </div>
          <button className="mt-5 text-sm font-black text-[#007a3d]" type="button">
            Xem tất cả huy hiệu (24)
          </button>
        </aside>
      </section>

      <section className="rounded-[2rem] border border-[#bdcabe]/60 bg-white p-6 shadow-[0_2px_8px_rgba(21,29,24,0.05)]">
        <h2 className="text-lg font-black text-[#151d18]">Thông tin tài khoản</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {[
            { Icon: Mail, label: "Địa chỉ Email", value: email },
            { Icon: Phone, label: "Số điện thoại", value: phone },
            { Icon: Award, label: "Họ và tên", value: displayName },
            { Icon: MapPin, label: "Khu vực / Nhóm", value: location },
          ].map((item) => (
            <div className="flex gap-3 rounded-2xl bg-[#edf6ed] p-4" key={item.label}>
              <span className="grid size-10 shrink-0 place-items-center rounded-full bg-white text-[#007a3d]">
                <item.Icon size={18} />
              </span>
              <div>
                <p className="text-xs font-black uppercase tracking-[0.12em] text-[#6e7a70]">{item.label}</p>
                <p className="mt-1 font-bold text-[#151d18]">{item.value}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
