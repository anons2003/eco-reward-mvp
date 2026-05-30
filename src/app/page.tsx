import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Camera,
  Coffee,
  Earth,
  Film,
  Gift,
  Globe2,
  Leaf,
  Mail,
  Menu,
  MessageCircle,
  QrCode,
  Recycle,
  Star,
  TreePine,
  Trophy,
  User,
  Verified,
} from "lucide-react";

const heroImage = "/eco-reward/hero-cleanup.png";

const oceanImage =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuBHeHilav8319TrtOahZnY1fkC81RdpUlcpwhT0IkK-rTiVcBY6pzFZ7XyrRjRFQtD0iI2ipPOkq8HnPyJMJmLrokp_HbzxZLmw5ZJZ-n10qvU7ysj27q3IxlqHXHa6YxD7EWO53h0RzvC_PAcoNkboHdNCez0GXci3OmAAaZHHqWdd5KZhbbD3d4MlnvhR3k6xOnk-dnZr8PVL0oMFTzirqidc6939f56e8eadNfGzFDJRl0pvzKzsFK1bSZcXBUw8VUid3rzG_ubz";

const communityImage =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuCsoArdpUVH9AHq808z9WkTp2ybc-YLf3vmGNMJjJp0v5MLgv1w562YrhZLEBe4Gqsk_5h2TsbWAI2Kp-7l9BQXVvABB4j3Jwskllcf9KZY6iEAOufqIViJN5fLo3ilkUwZiqw0lkGSPp9CT9vyEUCN7rqgrIDLZyzhrM4WzChljIsriWeXJEh30uQ4yMrlSLqDM3kMAKHtwcvo587M8BahANUqsd2PoBlwzrebQ2fmut_h4Wuv5eXlLjK16GiEF7AqJDHMaIkPo4bB";

const desktopRewards = [
  {
    title: "Cà Phê Thủ Công",
    body: "Đổi tại bất kỳ quán cà phê đối tác địa phương nào. Tận hưởng một buổi sáng bền vững.",
    points: "500 điểm",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCd2MVVAOeLJvoqCUbmKymgdtBDwNDbYuz3VyhlBch-ghigl9RvsqZxCnAfUi97fVgw_VYTCeXNTwUSl6CFyqSaJQr8WSiK8RpUwRvLkjTYfv7cEr2JJTM1gHrF4UXVXYumeN97DficiSLBF55oteesxGuygMC_w4N6p9rGCoosNTogRlZL7rm5OwSfn7amcE7j9RuBnR0MHXXt0SEEAKWNkZq6cyeiRkzoMbV8ZGO53IxfG0CEzyScefokG5_rGfyW81rSawLlbf7l",
  },
  {
    title: "Vé Xem Phim",
    body: "Thưởng thức những bộ phim bom tấn mới nhất tại các đối tác rạp phim trên toàn thành phố.",
    points: "1200 điểm",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBvGtswG3pCvHiSOGZlRcRt2dIa8NdHB548VMoH3rkRL7HXN1DjuzC_yhfMJfb86lef5-9ybuFKFBNALIHomVnIXLFnq5uR1PIE_CMTA24E-Maw2UZbKE3KPN7pKO8K0oE7125FOxbuURbqR_z9xnr2KKB8g3DaiDf7jWsK1u_kHUDz3NVpADR_6IGZIvSaXJ5BxTPqdB26RLEORxPvgtBgFcn3UvF2lstE07xNVyKQ4y6gxDA1UtxCPxTSvew7hQ_NxfUWhkWK6qUj",
  },
  {
    title: "Trồng Cánh Rừng",
    body: "Quyên góp điểm để trồng 5 cây xanh tại các khu vực sinh thái đang gặp nguy hiểm.",
    points: "2000 điểm",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAdj7RZdMAzX2vBYQXGWi3J7vlkgCM02d0bhwjlZZFu2b33P7WbB-lDRXkJ-la1VErSScn21DyjEEQS772fLA7sI07TYtIv3KuWFBPnbGWUjd4FK1Oguxl_1gzPB1DhayN71lEAy_itPdps0MbKoHuerbj1wQ0i-19CsX9HfHlgxv--adBq0MKgxCKjzw_NFGVyyeqYhXJL1DZtK61xpmvsz2i9WBCKJ0YQHE7tTAmgWiSP-aGDG1N_9_i1ksNCeEKdMen0YB5L9mse",
  },
];

const mobileRewards = [
  {
    title: "Cà phê Thủ Công",
    points: "500 EcoPoints",
    icon: Coffee,
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBpXWBe8U5pF4v-l8o2qOBTYwDoNficD2tFuluvjSjkZ8__ZgyzxkvdgTWccIkhlkhYhNpUx6JCwa2sOtAaLCzpzVTGm7IlhrauEfBZD3KxN6eLDo6eiPt78A7HOpkFcUS3ib4WmsDgW7yBT-bFjnsRDERxr6PVQ8YBwdq-S2LCVqUDE4_n5gwxpAgjEJxiY-Rkrex4v0JBbPQzVJ0M_OnRvn2kWCgBUxONk4RtX4gF8N9kQzkZpsFCUTvFhwHAcia88fHTNKD4574G",
  },
  {
    title: "Vé Xem Phim",
    points: "1,200 EcoPoints",
    icon: Film,
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDM5unryQpER6Ie177S9Hx6sJ6txOLomPM-6dXM6TEvuZB9TB3hYT8BAQdqv3c3KaI1CYAC17Bu-oVlXSzDiqyfmijHurnzffp8T9uW9mEx2UgS1omMNyeOqRDIh2A0yTjlJImYZkjKrX2yXVXvBZeATrqZUNE9qyuXKcuxcsDt2-2dxa3GwO4iCOQgQCxE6yk6PimtnZE5CuNPh-LQB2PIDRHc2hnkUkeTX5ChY7sRqXAzr3yarE2EjTbec8uOs3yh_NxoSFl06n3w",
  },
  {
    title: "Trồng Rừng",
    points: "2,000 EcoPoints",
    icon: TreePine,
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuD1CV20IRCvEF_B5T5_50mLYpEOiljH-7NKvLhPn3G3oTbmhZ3NKFbcfrwrKceeDbVbplkAajCrlIlwRamLmjAG9OeQW3UCnoacsmVZWDh6xRgrRtNcBLpsChsOpq2UjykbqtELWglXT9wwLtQKGEJFm0A_068gsTEh70ZVZyQ16j8toij-PAqyCwtd9GSi65ID86GZtIOwM9yquLdhVXDti66ckeGekyulmqkel9KMShcsclWYgWJI3fLvfssVpWiTHZysZh3tTBMP",
  },
];

const desktopSteps = [
  [QrCode, "Quét mã QR", "Tìm thùng rác thông minh và xác thực tài khoản của bạn qua ứng dụng di động ngay lập tức."],
  [Camera, "Chụp ảnh rác", "Sử dụng AI của chúng tôi để nhận diện vật phẩm. Chỉ cần chụp ảnh, chúng tôi sẽ phân loại giúp bạn."],
  [Gift, "Nhận thưởng", "Điểm thưởng sẽ được cộng ngay vào tài khoản để đổi lấy những phần quà hoặc ưu đãi hấp dẫn."],
] as const;

const mobileSteps = [
  [QrCode, "Quét mã QR", "Tìm các thùng rác thông minh EcoStitch gần bạn và quét mã để bắt đầu."],
  [Camera, "Chụp ảnh rác", "Ghi lại khoảnh khắc bạn phân loại rác đúng cách để hệ thống AI xác nhận."],
  [Gift, "Nhận thưởng", "Nhận ngay EcoPoints và đổi lấy những phần quà giá trị từ đối tác của chúng tôi."],
] as const;

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white text-[#3c4043]">
      <a className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:font-bold focus:text-[#202124] focus:shadow-lg" href="#content">
        Bỏ qua điều hướng
      </a>

      <MobileHome />
      <DesktopHome />
    </main>
  );
}

function DesktopHome() {
  return (
    <div className="hidden md:block" id="content">
      <nav aria-label="Điều hướng chính" className="fixed top-0 z-50 w-full border-b border-[#dadce0] bg-white/90 backdrop-blur-lg">
        <div className="mx-auto flex max-w-[1200px] items-center justify-between px-12 py-3">
          <Link className="flex items-center gap-2 text-2xl font-bold tracking-[-0.015em] text-[#137333]" href="/">
            <Leaf className="text-[#1e8e3e]" size={28} />
            Eco-Reward
          </Link>
          <div className="hidden items-center space-x-8 lg:flex">
            <a className="text-sm font-semibold text-[#3c4043] transition hover:text-[#137333]" href="#desktop-steps">
              Cách hoạt động
            </a>
            <a className="text-sm font-semibold text-[#5f6368] transition hover:text-[#137333]" href="#desktop-impact">
              Tác động
            </a>
            <a className="text-sm font-semibold text-[#5f6368] transition hover:text-[#137333]" href="#desktop-rewards">
              Phần thưởng
            </a>
          </div>
          <div className="flex items-center space-x-4">
            <Link className="px-4 py-2 text-sm font-semibold text-[#5f6368] transition hover:text-[#137333]" href="/login">
              Đăng nhập
            </Link>
            <Link className="rounded-lg bg-[#137333] px-6 py-2 text-sm font-semibold text-white shadow-[0_1px_2px_rgba(60,64,67,0.3),0_1px_3px_1px_rgba(60,64,67,0.15)] transition hover:bg-[#0d652d] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#137333]" href="/login" style={{ color: "#ffffff" }}>
              Tham gia ngay
            </Link>
          </div>
        </div>
      </nav>

      <header className="relative overflow-hidden bg-[#f8f9fa] pb-24 pt-40">
        <div className="mx-auto grid max-w-[1200px] grid-cols-1 items-center gap-16 px-12 lg:grid-cols-2">
          <div className="z-10 text-center lg:text-left">
            <h1 className="mb-6 text-[56px] font-bold leading-[1.1] tracking-[-0.015em] text-[#3c4043]">
              Biến Rác Thải Thành <span className="text-[#137333]">Giá Trị.</span>
              <br className="hidden lg:block" />
              <span className="text-[#5f6368]">Cho Bạn & Hành Tinh.</span>
            </h1>
            <p className="mx-auto mb-10 max-w-xl text-lg leading-8 text-[#5f6368] lg:mx-0">
              Gia nhập cộng đồng hơn 10.000+ Đại sứ Xanh đang phân loại rác, tích điểm và nhận quà địa phương. Mỗi hành động nhỏ đều góp phần cho tương lai bền vững.
            </p>
            <div className="flex flex-col justify-center gap-4 sm:flex-row lg:justify-start">
              <Link className="rounded-lg bg-[#137333] px-10 py-3.5 text-sm font-semibold text-white shadow-[0_1px_2px_rgba(60,64,67,0.3),0_1px_3px_1px_rgba(60,64,67,0.15)] transition hover:bg-[#0d652d]" href="/login" style={{ color: "#ffffff" }}>
                Tham gia ngay
              </Link>
              <a className="rounded-lg border border-[#dadce0] bg-white px-10 py-3.5 text-sm font-semibold text-[#3c4043] transition hover:bg-[#f1f3f4]" href="#desktop-steps">
                Tìm hiểu thêm
              </a>
            </div>
          </div>
          <div className="relative mt-12 flex justify-center lg:mt-0 lg:justify-end">
            <div className="relative w-full max-w-xl overflow-hidden rounded-2xl shadow-[0_1px_2px_rgba(60,64,67,0.3),0_1px_3px_1px_rgba(60,64,67,0.15)]">
              <Image alt="Minh họa thu gom rác" className="aspect-[4/3] w-full object-cover" height={620} priority src={heroImage} width={760} />
            </div>
            <div className="absolute -right-6 -top-6 rounded-xl border border-[#e0e0e0] bg-white p-4 shadow-lg">
              <Leaf className="text-[#137333]" size={32} />
            </div>
            <div className="absolute bottom-8 -left-8 flex items-center gap-4 rounded-xl border border-[#dadce0]/50 bg-white/85 p-5 shadow-[0_1px_2px_rgba(60,64,67,0.3),0_1px_3px_1px_rgba(60,64,67,0.15)] backdrop-blur">
              <div className="rounded-lg bg-[#e6f4ea] p-2.5 text-[#137333]">
                <Recycle size={24} />
              </div>
              <div>
                <p className="text-sm font-semibold text-[#3c4043]">+500 Điểm</p>
                <p className="text-xs font-medium text-[#5f6368]">Đã nhận thưởng!</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <section className="bg-white py-24" id="desktop-impact">
        <div className="mx-auto grid max-w-[1200px] grid-cols-1 items-center gap-16 px-12 md:grid-cols-2">
          <div className="order-2 flex justify-center md:order-1">
            <div className="relative">
              <div className="absolute inset-0 scale-110 rounded-full bg-[#e6f4ea] opacity-30 blur-3xl" />
              <Image alt="Minh họa hệ sinh thái biển" className="relative w-full max-w-sm rounded-2xl" height={520} src={oceanImage} width={520} />
            </div>
          </div>
          <div className="order-1 md:order-2">
            <h2 className="mb-6 text-4xl font-semibold tracking-[-0.015em] text-[#3c4043]">Đại Dương Đang Kêu Cứu</h2>
            <p className="mb-8 text-lg leading-8 text-[#5f6368]">
              Hơn 8 triệu tấn nhựa thải ra đại dương mỗi năm. Hệ sinh thái của chúng ta đang suy kiệt, nhưng giải pháp bắt đầu từ chính việc nhận diện và phân loại rác hàng ngày.
            </p>
            <div className="flex items-start gap-5 rounded-xl border border-[#dadce0] bg-[#f8f9fa] p-6">
              <Verified className="text-[#137333]" size={26} />
              <div>
                <h4 className="mb-1 text-sm font-semibold text-[#3c4043]">Độ chính xác từ AI</h4>
                <p className="leading-7 text-[#5f6368]">Công nghệ của chúng tôi đảm bảo độ chính xác cao trong việc nhận diện và phân loại rác thải.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#f8f9fa] py-24" id="desktop-steps">
        <div className="mx-auto mb-16 max-w-[1200px] px-12 text-center">
          <h2 className="mb-4 text-4xl font-semibold tracking-[-0.015em] text-[#3c4043]">Ba Bước Đơn Giản Để Thay Đổi</h2>
          <p className="mx-auto max-w-2xl text-lg leading-8 text-[#5f6368]">Sống bền vững trở nên đơn giản, nhanh chóng và đầy cảm hứng với quy trình hiện đại.</p>
        </div>
        <div className="mx-auto grid max-w-[1200px] grid-cols-1 gap-8 px-12 md:grid-cols-3">
          {desktopSteps.map(([Icon, title, body]) => (
            <article className="group rounded-2xl border border-[#dadce0] bg-white p-10 transition hover:border-[#137333] hover:shadow-[0_4px_4px_rgba(60,64,67,0.3),0_8px_12px_6px_rgba(60,64,67,0.15)]" key={title}>
              <div className="mb-8 flex size-16 items-center justify-center rounded-xl bg-[#e6f4ea] text-[#137333] transition group-hover:scale-105">
                <Icon size={32} />
              </div>
              <h3 className="mb-4 text-2xl font-semibold text-[#3c4043]">{title}</h3>
              <p className="leading-7 text-[#5f6368]">{body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="relative overflow-hidden bg-[#202124] py-24 text-white">
        <div className="pointer-events-none absolute inset-0 opacity-5 [background-image:radial-gradient(circle,#fff_1px,transparent_1px)] [background-size:32px_32px]" />
        <div className="relative z-10 mx-auto grid max-w-[1200px] grid-cols-1 gap-12 px-12 text-center md:grid-cols-3">
          <div className="space-y-2">
            <div className="text-5xl font-bold tracking-tight text-[#6bfe9c]">1.2M+</div>
            <div className="text-lg font-medium text-[#dadce0]">Sản phẩm tái chế</div>
          </div>
          <div className="space-y-2 md:border-x md:border-white/10">
            <div className="text-5xl font-bold tracking-tight text-[#8ccdff]">45k kg</div>
            <div className="text-lg font-medium text-[#dadce0]">CO2 đã giảm</div>
          </div>
          <div className="space-y-2">
            <div className="text-5xl font-bold tracking-tight text-[#ffe084]">15,000</div>
            <div className="text-lg font-medium text-[#dadce0]">Cây xanh đã trồng</div>
          </div>
        </div>
      </section>

      <section className="bg-white py-24" id="desktop-rewards">
        <div className="mx-auto max-w-[1200px] px-12">
          <div className="mb-12 flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
            <div className="max-w-xl">
              <h2 className="mb-2 text-4xl font-semibold tracking-[-0.015em] text-[#3c4043]">Kho Quà Tặng</h2>
              <p className="text-lg leading-8 text-[#5f6368]">Đổi những điểm số nỗ lực của bạn lấy những thứ bạn yêu thích từ đối tác của chúng tôi.</p>
            </div>
            <Link className="group flex items-center gap-2 text-sm font-semibold text-[#137333] transition hover:translate-x-1" href="/rewards">
              Xem tất cả quà tặng <ArrowRight size={16} />
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {desktopRewards.map((reward) => (
              <article className="group overflow-hidden rounded-2xl border border-[#dadce0] bg-white transition hover:shadow-[0_4px_4px_rgba(60,64,67,0.3),0_8px_12px_6px_rgba(60,64,67,0.15)]" key={reward.title}>
                <div className="relative h-56 overflow-hidden">
                  <Image alt={reward.title} className="size-full object-cover transition group-hover:scale-105" height={320} src={reward.image} width={520} />
                  <div className="absolute left-4 top-4 rounded-lg border border-[#e0e0e0] bg-white/85 px-3 py-1.5 text-xs font-semibold text-[#137333] backdrop-blur">{reward.points}</div>
                </div>
                <div className="p-8">
                  <h4 className="mb-2 text-2xl font-semibold text-[#3c4043]">{reward.title}</h4>
                  <p className="mb-6 leading-7 text-[#5f6368]">{reward.body}</p>
                  <Link className="flex min-h-12 w-full items-center justify-center rounded-lg bg-[#f1f3f4] font-semibold text-[#3c4043] transition hover:bg-[#137333] hover:text-white" href="/rewards">
                    Đổi Ngay
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#f8f9fa] py-24">
        <div className="mx-auto grid max-w-[1200px] grid-cols-1 items-center gap-20 px-12 lg:grid-cols-2">
          <div className="flex justify-center">
            <div className="relative">
              <div className="absolute -inset-4 rounded-full bg-[#137333] opacity-10 blur-2xl" />
              <Image alt="Người hùng tái chế tiêu biểu" className="relative w-full max-w-md rounded-2xl border-4 border-white shadow-[0_1px_2px_rgba(60,64,67,0.3),0_1px_3px_1px_rgba(60,64,67,0.15)]" height={620} src={communityImage} width={620} />
            </div>
          </div>
          <div>
            <div className="mb-6 flex gap-1 text-[#f9ab00]">
              {Array.from({ length: 5 }).map((_, index) => (
                <Star fill="currentColor" key={index} size={24} />
              ))}
            </div>
            <h2 className="mb-8 text-4xl font-semibold italic leading-snug tracking-[-0.015em] text-[#3c4043]">
              &ldquo;Nó đã thay đổi hoàn toàn cách tôi nhìn nhận rác thải sinh hoạt của mình. AI thật sự rất thông minh, và được nhận ly cà phê miễn phí mỗi sáng là cảm giác tuyệt vời nhất!&rdquo;
            </h2>
            <div className="flex items-center gap-4">
              <div className="flex size-12 items-center justify-center rounded-full bg-[#e6f4ea] text-[#137333]">
                <User size={24} />
              </div>
              <div>
                <p className="text-sm font-semibold text-[#3c4043]">Linh Nguyễn</p>
                <p className="text-xs font-medium text-[#5f6368]">Đại sứ Xanh tiêu biểu · Cấp độ 15</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />

      <Link aria-label="Quét mã QR" className="fixed bottom-8 right-8 z-50 flex size-14 items-center justify-center rounded-2xl bg-[#137333] text-white shadow-[0_1px_2px_rgba(60,64,67,0.3),0_1px_3px_1px_rgba(60,64,67,0.15)] transition hover:-translate-y-1 hover:bg-[#0d652d]" href="/scan" style={{ color: "#ffffff" }}>
        <QrCode size={26} />
      </Link>
    </div>
  );
}

function MobileHome() {
  return (
    <div className="block bg-[#ffffff] bg-[radial-gradient(#e6e7ef_1px,transparent_1px)] [background-size:24px_24px] text-[#1a1c1f] md:hidden">
      <header className="fixed top-0 z-50 flex h-16 w-full items-center justify-between border-b border-[#e6e7ef] bg-white/70 px-5 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <Menu className="text-black" size={24} />
          <span className="text-2xl font-bold tracking-[-0.02em] text-black">EcoStitch</span>
        </div>
        <div className="flex size-10 items-center justify-center overflow-hidden rounded-full border border-[#e6e7ef] bg-white">
          <Leaf className="text-black" size={22} />
        </div>
      </header>

      <section className="relative overflow-hidden px-5 pb-20 pt-28">
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(135deg,rgba(32,199,232,0.10)_0%,rgba(124,58,237,0.10)_100%)] opacity-50" />
        <div className="flex flex-col items-center gap-6 text-center">
          <h1 className="text-[48px] font-extrabold leading-[52px] tracking-[-0.02em] text-black">
            Biến Rác Thải Thành Giá Trị. Cho Bạn & Hành Tinh.
          </h1>
          <div className="w-full max-w-sm overflow-hidden rounded-xl border border-[#e6e7ef] bg-white p-2 shadow-sm">
            <Image alt="Eco Hero" className="h-64 w-full rounded-lg object-cover" height={320} priority src={heroImage} width={380} />
          </div>
          <div className="mt-4 flex w-full flex-col gap-3">
            <Link className="rounded-full bg-black px-8 py-4 text-lg font-bold text-white transition active:scale-95" href="/login" style={{ color: "#ffffff" }}>
              Tham gia ngay
            </Link>
            <a className="rounded-full border border-[#e6e7ef] bg-white/70 px-8 py-4 text-lg font-bold text-black backdrop-blur transition active:scale-95" href="#mobile-steps">
              Tìm hiểu thêm
            </a>
          </div>
        </div>
      </section>

      <section className="px-5 py-12">
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-xl border border-[#e6e7ef] bg-white/70 p-6 backdrop-blur">
            <span className="block text-3xl font-bold text-black">1.2M+</span>
            <span className="text-xs font-semibold uppercase tracking-[0.05em] text-[#5f6472]">Sản phẩm tái chế</span>
          </div>
          <div className="rounded-xl border border-[#e6e7ef] bg-white/70 p-6 backdrop-blur">
            <span className="block text-3xl font-bold text-black">45k kg</span>
            <span className="text-xs font-semibold uppercase tracking-[0.05em] text-[#5f6472]">CO2 đã giảm</span>
          </div>
          <div className="col-span-2 rounded-xl border border-[#e6e7ef] bg-white/70 p-6 backdrop-blur">
            <div className="flex items-center justify-between">
              <div>
                <span className="block text-3xl font-bold text-black">15,000</span>
                <span className="text-xs font-semibold uppercase tracking-[0.05em] text-[#5f6472]">Cây xanh đã trồng</span>
              </div>
              <TreePine className="text-[#00687a]" size={40} />
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-[#e6e7ef] bg-[#f4f5fb]/50 px-5 py-16" id="mobile-steps">
        <h2 className="mb-10 text-center text-[40px] font-bold leading-[48px] tracking-[-0.02em] text-black">Ba Bước Đơn Giản</h2>
        <div className="flex flex-col gap-12">
          {mobileSteps.map(([Icon, title, body]) => (
            <article className="flex items-start gap-4" key={title}>
              <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-black text-white">
                <Icon size={24} />
              </div>
              <div>
                <h3 className="mb-1 text-[28px] font-bold leading-9 tracking-[-0.01em] text-black">{title}</h3>
                <p className="text-[#5f6472]">{body}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="py-16" id="mobile-rewards">
        <div className="mb-8 flex items-end justify-between px-5">
          <h2 className="text-[40px] font-bold leading-[48px] tracking-[-0.02em] text-black">Kho Quà Tặng</h2>
          <Link className="text-sm font-bold text-[#00687a]" href="/rewards">
            Xem tất cả
          </Link>
        </div>
        <div className="flex gap-4 overflow-x-auto px-5 pb-4">
          {mobileRewards.map((reward) => (
            <article className="flex min-w-[280px] flex-col gap-4 rounded-2xl border border-[#e6e7ef] bg-white/70 p-4 backdrop-blur" key={reward.title}>
              <div className="h-40 overflow-hidden rounded-xl">
                <Image alt={reward.title} className="size-full object-cover" height={240} src={reward.image} width={360} />
              </div>
              <div>
                <h4 className="text-lg font-bold text-black">{reward.title}</h4>
                <p className="text-sm font-medium text-[#5f6472]">{reward.points}</p>
              </div>
              <Link className="flex min-h-12 w-full items-center justify-center rounded-full bg-black font-bold text-white transition active:scale-95" href="/rewards" style={{ color: "#ffffff" }}>
                Đổi Ngay
              </Link>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

function Footer() {
  return (
    <footer className="border-t border-[#dadce0] bg-white px-12 py-20">
      <div className="mx-auto grid max-w-[1200px] grid-cols-1 items-start gap-12 md:grid-cols-4">
        <div className="space-y-6">
          <div className="flex items-center gap-2 text-2xl font-bold text-[#137333]">
            <Leaf size={26} /> Eco-Reward
          </div>
          <p className="leading-7 text-[#5f6368]">Hệ thống phần thưởng sinh thái hàng đầu Việt Nam. Biến mỗi hành động nhỏ thành giá trị xanh bền vững.</p>
        </div>
        <div className="flex flex-col space-y-4">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-[#3c4043]">Công ty</h4>
          <a className="font-medium text-[#5f6368] transition hover:text-[#137333]" href="#">Chính sách bảo mật</a>
          <a className="font-medium text-[#5f6368] transition hover:text-[#137333]" href="#">Điều khoản dịch vụ</a>
          <a className="font-medium text-[#5f6368] transition hover:text-[#137333]" href="#">Liên hệ</a>
        </div>
        <div className="flex flex-col space-y-4">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-[#3c4043]">Cộng đồng</h4>
          <a className="font-medium text-[#5f6368] transition hover:text-[#137333]" href="#">Về chúng tôi</a>
          <a className="font-medium text-[#5f6368] transition hover:text-[#137333]" href="#">Tác động xanh</a>
          <a className="font-medium text-[#5f6368] transition hover:text-[#137333]" href="#">Blog</a>
        </div>
        <div className="flex flex-col space-y-6">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-[#3c4043]">Nhận Cập Nhật</h4>
          <form className="flex items-center rounded-lg border border-[#dadce0] bg-[#f1f3f4] p-1">
            <label className="sr-only" htmlFor="newsletter-email">
              Email của bạn
            </label>
            <input className="w-full border-none bg-transparent px-4 py-2 text-sm text-[#3c4043] outline-none focus:ring-0" id="newsletter-email" placeholder="Email của bạn" type="email" />
            <button className="rounded-md bg-[#137333] px-5 py-2 text-sm font-semibold text-white shadow-[0_1px_2px_rgba(60,64,67,0.3),0_1px_3px_1px_rgba(60,64,67,0.15)] transition hover:bg-[#0d652d]" type="button" style={{ color: "#ffffff" }}>
              Đăng ký
            </button>
          </form>
          <div className="flex space-x-4">
            <a aria-label="Website" className="flex size-10 items-center justify-center rounded-lg bg-[#f1f3f4] text-[#5f6368] transition hover:bg-[#e6f4ea] hover:text-[#137333]" href="#">
              <Globe2 size={20} />
            </a>
            <a aria-label="Cộng đồng" className="flex size-10 items-center justify-center rounded-lg bg-[#f1f3f4] text-[#5f6368] transition hover:bg-[#e6f4ea] hover:text-[#137333]" href="#">
              <MessageCircle size={20} />
            </a>
          </div>
        </div>
      </div>
      <div className="mx-auto mt-16 flex max-w-[1200px] flex-col items-center justify-between gap-4 border-t border-[#dadce0] pt-8 text-sm text-[#5f6368] md:flex-row">
        <p>© 2024 Eco-Reward System. Tất cả quyền được bảo lưu.</p>
        <div className="flex gap-3">
          <span>Tiếng Việt</span>
          <Earth size={18} />
        </div>
      </div>
    </footer>
  );
}
