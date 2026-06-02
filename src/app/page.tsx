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
  Star,
  TreePine,
  Trophy,
  User,
  Verified,
} from "lucide-react";
import { LandingGsapAnimations } from "@/components/landing/landing-gsap-animations";

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
    points: "500 điểm SeaTech",
    icon: Coffee,
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBpXWBe8U5pF4v-l8o2qOBTYwDoNficD2tFuluvjSjkZ8__ZgyzxkvdgTWccIkhlkhYhNpUx6JCwa2sOtAaLCzpzVTGm7IlhrauEfBZD3KxN6eLDo6eiPt78A7HOpkFcUS3ib4WmsDgW7yBT-bFjnsRDERxr6PVQ8YBwdq-S2LCVqUDE4_n5gwxpAgjEJxiY-Rkrex4v0JBbPQzVJ0M_OnRvn2kWCgBUxONk4RtX4gF8N9kQzkZpsFCUTvFhwHAcia88fHTNKD4574G",
  },
  {
    title: "Vé Xem Phim",
    points: "1,200 điểm SeaTech",
    icon: Film,
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDM5unryQpER6Ie177S9Hx6sJ6txOLomPM-6dXM6TEvuZB9TB3hYT8BAQdqv3c3KaI1CYAC17Bu-oVlXSzDiqyfmijHurnzffp8T9uW9mEx2UgS1omMNyeOqRDIh2A0yTjlJImYZkjKrX2yXVXvBZeATrqZUNE9qyuXKcuxcsDt2-2dxa3GwO4iCOQgQCxE6yk6PimtnZE5CuNPh-LQB2PIDRHc2hnkUkeTX5ChY7sRqXAzr3yarE2EjTbec8uOs3yh_NxoSFl06n3w",
  },
  {
    title: "Trồng Rừng",
    points: "2,000 điểm SeaTech",
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
  [QrCode, "Quét mã QR", "Tìm các thùng rác thông minh SeaTech gần bạn và quét mã để bắt đầu."],
  [Camera, "Chụp ảnh rác", "Ghi lại khoảnh khắc bạn phân loại rác đúng cách để hệ thống AI xác nhận."],
  [Gift, "Nhận thưởng", "Nhận ngay điểm SeaTech và đổi lấy những phần quà giá trị từ đối tác của chúng tôi."],
] as const;

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white text-[#3c4043]">
      <a className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:font-bold focus:text-[#202124] focus:shadow-lg" href="#content">
        Bỏ qua điều hướng
      </a>

      <LandingGsapAnimations>
        <MobileHome />
        <DesktopHome />
      </LandingGsapAnimations>
    </main>
  );
}

function DesktopHome() {
  return (
    <div className="hidden md:block" id="content">
      <nav aria-label="Điều hướng chính" className="landing-nav fixed top-0 z-50 w-full border-b border-[#d9e5da] bg-white/88 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1200px] items-center justify-between px-12 py-3">
          <Link className="flex items-center gap-2 text-2xl font-black tracking-[-0.03em] text-[#007a3d]" href="/">
            <span className="grid size-10 place-items-center rounded-2xl bg-[#d8f5df] text-[#007a3d] ring-1 ring-[#bdcabe]/60">
              <Leaf size={22} />
            </span>
            SeaTech
          </Link>
          <div className="hidden items-center space-x-8 lg:flex">
            <a className="text-sm font-black text-[#151d18] transition hover:text-[#007a3d]" href="#desktop-steps">
              Cách hoạt động
            </a>
            <a className="text-sm font-bold text-[#5d6a60] transition hover:text-[#007a3d]" href="#desktop-impact">
              Tác động
            </a>
            <a className="text-sm font-bold text-[#5d6a60] transition hover:text-[#007a3d]" href="#desktop-rewards">
              Phần thưởng
            </a>
          </div>
          <div className="flex items-center space-x-4">
            <Link className="px-4 py-2 text-sm font-black text-[#3e4941] transition hover:text-[#007a3d]" href="/login">
              Đăng nhập
            </Link>
            <Link className="rounded-full bg-[#007a3d] px-6 py-2.5 text-sm font-black text-white shadow-[0_12px_28px_rgba(0,106,61,0.20)] transition hover:bg-[#006a35] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#007a3d]" href="/login" style={{ color: "#ffffff" }}>
              Tham gia ngay
            </Link>
          </div>
        </div>
      </nav>

      <header className="relative overflow-hidden bg-[#f3fcf3] pb-24 pt-36">
        <div className="pointer-events-none absolute inset-0 [background-image:radial-gradient(#bdcabe_1px,transparent_1px)] [background-size:24px_24px]" />
        <div className="pointer-events-none absolute left-1/2 top-20 h-80 w-[720px] -translate-x-1/2 rounded-full bg-[#8ff8b6]/25 blur-3xl" />
        <div className="relative mx-auto grid max-w-[1200px] grid-cols-1 items-center gap-12 px-12 lg:grid-cols-[minmax(0,0.92fr)_minmax(560px,1fr)]">
          <div className="landing-hero-copy z-10 text-center lg:text-left">
            <h1 className="mb-6 max-w-4xl text-[clamp(50px,5vw,70px)] font-black leading-[0.98] tracking-[-0.055em] text-[#071b12]">
              Phân loại đúng.
              <span className="block text-[#007a3d]">Nhận điểm xanh.</span>
            </h1>
            <p className="mx-auto mb-10 max-w-2xl text-lg font-semibold leading-8 text-[#3e4941] lg:mx-0">
              SeaTech biến QR, ảnh chụp và kiểm duyệt AI thành một dòng điểm minh bạch cho người dùng, đối tác và đội vận hành.
            </p>
            <div className="flex flex-col justify-center gap-4 sm:flex-row lg:justify-start">
              <Link className="rounded-full bg-[#007a3d] px-10 py-4 text-sm font-black text-white shadow-[0_16px_34px_rgba(0,106,61,0.24)] transition hover:-translate-y-0.5 hover:bg-[#006a35]" href="/login" style={{ color: "#ffffff" }}>
                Tham gia ngay
              </Link>
              <a className="rounded-full border border-[#bdcabe] bg-white/86 px-10 py-4 text-sm font-black text-[#151d18] backdrop-blur transition hover:-translate-y-0.5 hover:bg-white" href="#desktop-steps">
                Xem quy trình
              </a>
            </div>
            <div className="mt-10 grid max-w-xl grid-cols-3 gap-3 text-left">
              {[
                ["QR", "Xác thực thùng"],
                ["AI", "Nhận diện ảnh"],
                ["Ops", "Duyệt điểm"],
              ].map(([label, body]) => (
                <div className="rounded-3xl border border-[#d9e5da] bg-white/78 p-4 shadow-[0_10px_28px_rgba(21,29,24,0.06)] backdrop-blur" key={label}>
                  <p className="text-xl font-black tracking-[-0.04em] text-[#007a3d]">{label}</p>
                  <p className="mt-1 text-xs font-bold leading-5 text-[#5d6a60]">{body}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="landing-hero-media relative mx-auto w-full max-w-[680px] lg:mx-0">
            <div className="relative rounded-[38px] border border-[#0d3b25]/15 bg-white/58 p-3 shadow-[0_30px_90px_rgba(7,27,18,0.22)] backdrop-blur">
              <div className="absolute left-8 top-8 z-10 hidden items-center gap-2 rounded-full border border-white/60 bg-white/88 px-4 py-2 text-xs font-black uppercase tracking-[0.12em] text-[#007a3d] shadow-[0_14px_32px_rgba(7,27,18,0.12)] backdrop-blur xl:flex">
                <span className="size-2 rounded-full bg-[#007a3d]" />
                SeaTech live
              </div>
              <div className="overflow-hidden rounded-[30px] border border-[#103d28]/30 bg-[#071b12]">
                <Image
                  alt="Giao diện vận hành SeaTech hiển thị lượt phân loại rác, điểm thưởng và thống kê tác động"
                  className="h-auto w-full"
                  fetchPriority="high"
                  height={1792}
                  loading="eager"
                  sizes="(min-width: 1024px) 680px, 92vw"
                  src="/seatech/hero-board.jpg"
                  unoptimized
                  width={2560}
                />
              </div>
            </div>
          </div>
        </div>
      </header>

      <section className="landing-section bg-white py-28" id="desktop-impact">
        <div className="mx-auto grid max-w-[1200px] grid-cols-1 items-center gap-16 px-12 md:grid-cols-2">
          <div className="landing-section-media order-2 flex justify-center md:order-1">
            <div className="relative">
              <div className="absolute inset-0 scale-110 rounded-full bg-[#e6f4ea] opacity-30 blur-3xl" />
              <Image alt="Minh họa hệ sinh thái biển" className="relative w-full max-w-sm rounded-2xl" height={520} src={oceanImage} width={520} />
            </div>
          </div>
          <div className="landing-section-copy order-1 md:order-2">
            <h2 className="mb-6 text-5xl font-black tracking-[-0.05em] text-[#071b12]">Đại dương cần dữ liệu tốt hơn</h2>
            <p className="landing-scrub-text mb-8 text-xl font-semibold leading-9 text-[#3e4941]">
              Hơn 8 triệu tấn nhựa thải ra đại dương mỗi năm. Hệ sinh thái của chúng ta đang suy kiệt, nhưng giải pháp bắt đầu từ chính việc nhận diện và phân loại rác hàng ngày.
            </p>
            <div className="flex items-start gap-5 rounded-[28px] border border-[#d9e5da] bg-[#f7fbf7] p-6">
              <Verified className="text-[#007a3d]" size={26} />
              <div>
                <h4 className="mb-1 text-sm font-black text-[#071b12]">Độ chính xác từ AI</h4>
                <p className="font-semibold leading-7 text-[#5d6a60]">Công nghệ của chúng tôi đảm bảo độ chính xác cao trong việc nhận diện và phân loại rác thải.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#f3fcf3] py-28" id="desktop-steps">
        <div className="mx-auto mb-16 max-w-[1200px] px-12 text-center">
          <h2 className="mb-4 text-5xl font-black tracking-[-0.05em] text-[#071b12]">Ba bước, một dòng điểm rõ ràng</h2>
          <p className="mx-auto max-w-2xl text-lg font-semibold leading-8 text-[#5d6a60]">Sống bền vững trở nên đơn giản, nhanh chóng và đầy cảm hứng với quy trình hiện đại.</p>
        </div>
        <div className="mx-auto grid max-w-[1200px] grid-flow-dense grid-cols-1 gap-5 px-12 md:grid-cols-6">
          {desktopSteps.map(([Icon, title, body]) => (
            <article className="landing-card group rounded-[30px] border border-[#d9e5da] bg-white p-8 shadow-[0_12px_40px_rgba(21,29,24,0.05)] transition hover:-translate-y-1 hover:border-[#007a3d] md:col-span-2" key={title}>
              <div className="mb-8 flex size-16 items-center justify-center rounded-2xl bg-[#d8f5df] text-[#007a3d] transition group-hover:scale-105">
                <Icon size={32} />
              </div>
              <h3 className="mb-4 text-2xl font-black tracking-[-0.03em] text-[#071b12]">{title}</h3>
              <p className="font-semibold leading-7 text-[#5d6a60]">{body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="relative overflow-hidden bg-[#071b12] py-28 text-white">
        <div className="pointer-events-none absolute inset-0 opacity-5 [background-image:radial-gradient(circle,#fff_1px,transparent_1px)] [background-size:32px_32px]" />
        <div className="relative z-10 mx-auto grid max-w-[1200px] grid-cols-1 gap-12 px-12 text-center md:grid-cols-3">
          <div className="space-y-2">
            <div className="landing-stat text-6xl font-black tracking-[-0.05em] text-[#8ff8b6]" data-count="1.2" data-decimals="1" data-suffix="M+">
              1.2M+
            </div>
            <div className="text-lg font-medium text-[#dadce0]">Sản phẩm tái chế</div>
          </div>
          <div className="space-y-2 md:border-x md:border-white/10">
            <div className="landing-stat text-6xl font-black tracking-[-0.05em] text-[#cbe6ff]" data-count="45" data-suffix="k kg">
              45k kg
            </div>
            <div className="text-lg font-medium text-[#dadce0]">CO2 đã giảm</div>
          </div>
          <div className="space-y-2">
            <div className="landing-stat text-6xl font-black tracking-[-0.05em] text-[#fff3c4]" data-count="15000">
              15,000
            </div>
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
            <Link className="group flex items-center gap-2 text-sm font-black text-[#007a3d] transition hover:translate-x-1" href="/rewards">
              Xem tất cả quà tặng <ArrowRight size={16} />
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {desktopRewards.map((reward) => (
              <article className="landing-reward-card group overflow-hidden rounded-2xl border border-[#dadce0] bg-white transition hover:shadow-[0_4px_4px_rgba(60,64,67,0.3),0_8px_12px_6px_rgba(60,64,67,0.15)]" key={reward.title}>
                <div className="relative h-56 overflow-hidden">
                  <Image alt={reward.title} className="size-full object-cover transition group-hover:scale-105" height={320} src={reward.image} width={520} />
                  <div className="absolute left-4 top-4 rounded-full border border-[#d9e5da] bg-white/90 px-3 py-1.5 text-xs font-black text-[#007a3d] backdrop-blur">{reward.points}</div>
                </div>
                <div className="p-8">
                  <h4 className="mb-2 text-2xl font-semibold text-[#3c4043]">{reward.title}</h4>
                  <p className="mb-6 leading-7 text-[#5f6368]">{reward.body}</p>
                  <Link className="flex min-h-12 w-full items-center justify-center rounded-full bg-[#edf6ed] font-black text-[#071b12] transition hover:bg-[#007a3d] hover:text-white" href="/rewards">
                    Đổi Ngay
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="landing-section bg-[#f8f9fa] py-24">
        <div className="mx-auto grid max-w-[1200px] grid-cols-1 items-center gap-20 px-12 lg:grid-cols-2">
          <div className="landing-section-media flex justify-center">
            <div className="relative">
              <div className="absolute -inset-4 rounded-full bg-[#007a3d] opacity-10 blur-2xl" />
              <Image alt="Người hùng tái chế tiêu biểu" className="relative w-full max-w-md rounded-2xl border-4 border-white shadow-[0_1px_2px_rgba(60,64,67,0.3),0_1px_3px_1px_rgba(60,64,67,0.15)]" height={620} src={communityImage} width={620} />
            </div>
          </div>
          <div className="landing-testimonial landing-section-copy">
            <div className="mb-6 flex gap-1 text-[#f9ab00]">
              {Array.from({ length: 5 }).map((_, index) => (
                <Star fill="currentColor" key={index} size={24} />
              ))}
            </div>
            <h2 className="mb-8 text-4xl font-semibold italic leading-snug tracking-[-0.015em] text-[#3c4043]">
              &ldquo;Nó đã thay đổi hoàn toàn cách tôi nhìn nhận rác thải sinh hoạt của mình. AI thật sự rất thông minh, và được nhận ly cà phê miễn phí mỗi sáng là cảm giác tuyệt vời nhất!&rdquo;
            </h2>
            <div className="flex items-center gap-4">
              <div className="flex size-12 items-center justify-center rounded-full bg-[#d8f5df] text-[#007a3d]">
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

      <Link aria-label="Quét mã QR" className="fixed bottom-8 right-8 z-50 flex size-14 items-center justify-center rounded-2xl bg-[#007a3d] text-white shadow-[0_16px_34px_rgba(0,106,61,0.28)] transition hover:-translate-y-1 hover:bg-[#006a35]" href="/scan" style={{ color: "#ffffff" }}>
        <QrCode size={26} />
      </Link>
    </div>
  );
}

function MobileHome() {
  return (
    <div className="block overflow-x-hidden bg-[#f3fcf3] bg-[radial-gradient(#bdcabe_1px,transparent_1px)] [background-size:24px_24px] text-[#071b12] md:hidden">
      <header className="landing-nav fixed top-0 z-50 flex h-16 w-full items-center justify-between border-b border-[#d9e5da] bg-white/82 px-5 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <details className="group relative">
            <summary className="grid size-10 cursor-pointer list-none place-items-center rounded-2xl text-[#071b12] transition hover:bg-[#edf6ed] [&::-webkit-details-marker]:hidden">
              <Menu size={24} />
              <span className="sr-only">Mở menu</span>
            </summary>
            <nav className="absolute left-0 top-12 w-56 rounded-[24px] border border-[#d9e5da] bg-white p-2 text-left shadow-[0_18px_50px_rgba(21,29,24,0.14)]">
              <a className="block rounded-2xl px-4 py-3 text-sm font-black text-[#071b12] hover:bg-[#edf6ed]" href="#mobile-steps">
                Cách hoạt động
              </a>
              <a className="block rounded-2xl px-4 py-3 text-sm font-black text-[#071b12] hover:bg-[#edf6ed]" href="#mobile-rewards">
                Phần thưởng
              </a>
              <Link className="block rounded-2xl px-4 py-3 text-sm font-black text-[#007a3d] hover:bg-[#edf6ed]" href="/login">
                Đăng nhập
              </Link>
            </nav>
          </details>
          <Link className="text-2xl font-black tracking-[-0.03em] text-[#007a3d]" href="/">
            SeaTech
          </Link>
        </div>
        <div className="flex size-10 items-center justify-center overflow-hidden rounded-2xl border border-[#bdcabe] bg-[#d8f5df]">
          <Leaf className="text-[#007a3d]" size={22} />
        </div>
      </header>

      <section className="relative overflow-hidden px-4 pb-16 pt-24">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_20%_0%,rgba(143,248,182,0.42),transparent_40%)] opacity-90" />
        <div className="landing-mobile-hero flex flex-col items-center gap-5 text-center">
          <h1 className="max-w-[360px] text-[44px] font-black leading-[44px] tracking-[-0.045em] text-[#071b12] min-[390px]:text-[50px] min-[390px]:leading-[50px]">
            Phân loại đúng.
            <span className="block text-[#007a3d]">Nhận điểm xanh.</span>
          </h1>
          <p className="max-w-[330px] text-base font-semibold leading-7 text-[#3e4941]">
            QR, ảnh chụp và AI giúp mỗi lượt gửi trở thành điểm thưởng có thể kiểm chứng.
          </p>
          <div className="w-full max-w-[390px] rounded-[32px] border border-[#0d3b25]/18 bg-white/58 p-2 shadow-[0_24px_70px_rgba(7,27,18,0.18)] backdrop-blur">
            <div className="overflow-hidden rounded-[26px] border border-[#103d28]/30 bg-[#071b12]">
              <Image
                alt="Giao diện vận hành SeaTech hiển thị ảnh phân loại rác và trạng thái điểm thưởng"
                className="h-auto w-full"
                fetchPriority="high"
                height={1792}
                loading="eager"
                sizes="100vw"
                src="/seatech/hero-board.jpg"
                unoptimized
                width={2560}
              />
            </div>
          </div>
          <div className="mt-4 flex w-full flex-col gap-3">
            <Link className="rounded-full bg-[#007a3d] px-8 py-4 text-lg font-black text-white shadow-[0_14px_34px_rgba(0,106,61,0.22)] transition active:scale-95" href="/login" style={{ color: "#ffffff" }}>
              Tham gia ngay
            </Link>
            <a className="rounded-full border border-[#bdcabe] bg-white/78 px-8 py-4 text-lg font-black text-[#071b12] backdrop-blur transition active:scale-95" href="#mobile-steps">
              Tìm hiểu thêm
            </a>
          </div>
        </div>
      </section>

      <section className="px-5 py-12">
        <div className="grid grid-cols-2 gap-4">
          <div className="landing-mobile-card rounded-xl border border-[#e6e7ef] bg-white/70 p-6 backdrop-blur">
            <span className="landing-stat block text-3xl font-bold text-black" data-count="1.2" data-decimals="1" data-suffix="M+">
              1.2M+
            </span>
            <span className="text-xs font-semibold uppercase tracking-[0.05em] text-[#5f6472]">Sản phẩm tái chế</span>
          </div>
          <div className="landing-mobile-card rounded-xl border border-[#e6e7ef] bg-white/70 p-6 backdrop-blur">
            <span className="landing-stat block text-3xl font-bold text-black" data-count="45" data-suffix="k kg">
              45k kg
            </span>
            <span className="text-xs font-semibold uppercase tracking-[0.05em] text-[#5f6472]">CO2 đã giảm</span>
          </div>
          <div className="landing-mobile-card col-span-2 rounded-xl border border-[#e6e7ef] bg-white/70 p-6 backdrop-blur">
            <div className="flex items-center justify-between">
              <div>
                <span className="landing-stat block text-3xl font-bold text-black" data-count="15000">
                  15,000
                </span>
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
            <article className="landing-mobile-card flex items-start gap-4" key={title}>
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
            <article className="landing-mobile-card flex min-w-[280px] flex-col gap-4 rounded-2xl border border-[#e6e7ef] bg-white/70 p-4 backdrop-blur" key={reward.title}>
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
    <footer className="border-t border-[#d9e5da] bg-white px-12 py-20">
      <div className="mx-auto grid max-w-[1200px] grid-cols-1 items-start gap-12 md:grid-cols-4">
        <div className="space-y-6">
          <div className="flex items-center gap-2 text-2xl font-black text-[#007a3d]">
            <Leaf size={26} /> SeaTech
          </div>
          <p className="font-semibold leading-7 text-[#5d6a60]">Hệ thống phần thưởng sinh thái hàng đầu Việt Nam. Biến mỗi hành động nhỏ thành giá trị xanh bền vững.</p>
        </div>
        <div className="flex flex-col space-y-4">
          <h4 className="text-xs font-black uppercase tracking-wider text-[#071b12]">Công ty</h4>
          <a className="font-semibold text-[#5d6a60] transition hover:text-[#007a3d]" href="#">Chính sách bảo mật</a>
          <a className="font-semibold text-[#5d6a60] transition hover:text-[#007a3d]" href="#">Điều khoản dịch vụ</a>
          <a className="font-semibold text-[#5d6a60] transition hover:text-[#007a3d]" href="#">Liên hệ</a>
        </div>
        <div className="flex flex-col space-y-4">
          <h4 className="text-xs font-black uppercase tracking-wider text-[#071b12]">Cộng đồng</h4>
          <a className="font-semibold text-[#5d6a60] transition hover:text-[#007a3d]" href="#">Về chúng tôi</a>
          <a className="font-semibold text-[#5d6a60] transition hover:text-[#007a3d]" href="#">Tác động xanh</a>
          <a className="font-semibold text-[#5d6a60] transition hover:text-[#007a3d]" href="#">Blog</a>
        </div>
        <div className="flex flex-col space-y-6">
          <h4 className="text-xs font-black uppercase tracking-wider text-[#071b12]">Nhận Cập Nhật</h4>
          <form className="flex items-center rounded-2xl border border-[#d9e5da] bg-[#f7fbf7] p-1">
            <label className="sr-only" htmlFor="newsletter-email">
              Email của bạn
            </label>
            <input className="w-full border-none bg-transparent px-4 py-2 text-sm font-bold text-[#071b12] outline-none focus:ring-0" id="newsletter-email" placeholder="Email của bạn" type="email" />
            <button className="rounded-xl bg-[#007a3d] px-5 py-2 text-sm font-black text-white shadow-[0_12px_28px_rgba(0,106,61,0.18)] transition hover:bg-[#006a35]" type="button" style={{ color: "#ffffff" }}>
              Đăng ký
            </button>
          </form>
          <div className="flex space-x-4">
            <a aria-label="Website" className="flex size-10 items-center justify-center rounded-xl bg-[#edf6ed] text-[#5d6a60] transition hover:bg-[#d8f5df] hover:text-[#007a3d]" href="#">
              <Globe2 size={20} />
            </a>
            <a aria-label="Cộng đồng" className="flex size-10 items-center justify-center rounded-xl bg-[#edf6ed] text-[#5d6a60] transition hover:bg-[#d8f5df] hover:text-[#007a3d]" href="#">
              <MessageCircle size={20} />
            </a>
          </div>
        </div>
      </div>
      <div className="mx-auto mt-16 flex max-w-[1200px] flex-col items-center justify-between gap-4 border-t border-[#d9e5da] pt-8 text-sm font-semibold text-[#5d6a60] md:flex-row">
        <p>© 2024 SeaTech. Tất cả quyền được bảo lưu.</p>
        <div className="flex gap-3">
          <span>Tiếng Việt</span>
          <Earth size={18} />
        </div>
      </div>
    </footer>
  );
}
