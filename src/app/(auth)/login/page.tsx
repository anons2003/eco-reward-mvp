import { Leaf, ShieldCheck, Smartphone } from "lucide-react";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string; next?: string }> }) {
  const params = await searchParams;
  const next = params.next ?? "";
  const hasError = params.error === "invalid_credentials" || params.error === "missing_credentials";

  return (
    <main className="grid min-h-screen place-items-center px-4 py-10">
      <section className="surface grid w-full max-w-5xl overflow-hidden rounded-2xl md:grid-cols-[1.1fr_0.9fr]">
        <div className="bg-[#e3f2fd] p-8 md:p-12">
          <div className="mb-10 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 font-bold text-[#006492]">
            <Leaf size={20} />
            Eco-Reward MVP
          </div>
          <h1 className="max-w-xl text-4xl font-black leading-tight text-[#003049]">
            Tích điểm cho mỗi lần phân loại rác đúng cách.
          </h1>
          <p className="mt-5 max-w-lg text-lg leading-8 text-[#3f4850]">
            Bản demo cho luồng quét QR, chụp ảnh, AI nhận diện, cộng điểm và admin kiểm duyệt.
          </p>
          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl bg-white p-4">
              <Smartphone className="text-[#219653]" />
              <p className="mt-3 font-bold">Mobile-first</p>
              <p className="text-sm text-[#3f4850]">Luồng user tối ưu tại thùng rác.</p>
            </div>
            <div className="rounded-xl bg-white p-4">
              <ShieldCheck className="text-[#006492]" />
              <p className="mt-3 font-bold">Có kiểm duyệt</p>
              <p className="text-sm text-[#3f4850]">Admin xử lý lượt gửi nghi ngờ.</p>
            </div>
          </div>
        </div>
        <div className="p-8 md:p-12">
          <h2 className="text-2xl font-black">Đăng nhập</h2>
          <p className="mt-2 text-[#3f4850]">Dùng Supabase Auth với tài khoản demo đã seed.</p>
          {hasError ? <p className="mt-4 rounded-xl bg-[#fff0f0] p-3 text-sm font-bold text-[#b42318]">Email hoặc mật khẩu chưa đúng.</p> : null}
          <div className="mt-8 grid gap-4">
            <form action="/api/auth/login" className="grid gap-3" method="post">
              <input type="hidden" name="next" value={next || "/dashboard"} />
              <label className="grid gap-1 text-sm font-bold text-[#3f4850]" htmlFor="email">
                Email
                <input className="rounded-xl border border-[#d7dcdf] bg-white px-4 py-3 text-base font-semibold text-[#1f2933]" id="email" name="email" type="email" defaultValue="anons2003+eco-user@gmail.com" required />
              </label>
              <label className="grid gap-1 text-sm font-bold text-[#3f4850]" htmlFor="password">
                Mật khẩu
                <input className="rounded-xl border border-[#d7dcdf] bg-white px-4 py-3 text-base font-semibold text-[#1f2933]" id="password" name="password" type="password" defaultValue="EcoReward123!" required />
              </label>
              <button className="btn-primary w-full" type="submit">
                Đăng nhập
              </button>
            </form>
            <form action="/api/auth/login" method="post">
              <input type="hidden" name="email" value="anons2003+eco-admin@gmail.com" />
              <input type="hidden" name="password" value="EcoReward123!" />
              <input type="hidden" name="next" value="/admin/dashboard" />
              <button className="btn-secondary w-full" type="submit">
                Vào admin dashboard
              </button>
            </form>
          </div>
          <div className="mt-8 rounded-xl bg-[#f5f3f3] p-4 text-sm text-[#3f4850]">
            User: anons2003+eco-user@gmail.com / EcoReward123!. Admin: anons2003+eco-admin@gmail.com / EcoReward123!.
          </div>
        </div>
      </section>
    </main>
  );
}
