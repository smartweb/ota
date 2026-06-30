import Link from "next/link";
import ToastHost from "@/components/Toast";

export default function Home() {
  return (
    <div className="page">
      <ToastHost />

      {/* 顶部欢迎区：暖色渐变头部 */}
      <div
        className="-mx-4 -mt-0 px-6 pt-14 pb-10 text-white text-center rounded-b-[2rem]"
        style={{ background: "linear-gradient(160deg, #F4A66B 0%, #E07A38 100%)" }}
      >
        <div className="text-6xl mb-3 drop-shadow">🧳</div>
        <h1 className="text-3xl font-extrabold tracking-wide">乐享出行</h1>
        <p className="text-lg text-white/90 mt-2">订机票 · 订酒店 · 省心出行</p>
      </div>

      {/* 三大入口大卡片 */}
      <div className="space-y-4 -mt-6 relative">
        <Link href="/flight" className="block">
          <div className="card flex items-center gap-4 active:scale-[0.99] transition-transform">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center text-4xl shrink-0"
              style={{ background: "linear-gradient(135deg, #FFE3CC 0%, #FFCFA8 100%)" }}
            >
              ✈️
            </div>
            <div className="flex-1">
              <div className="text-2xl font-extrabold text-ink">订机票</div>
              <div className="text-lg text-inksoft mt-0.5">国内航班，比价下单</div>
            </div>
            <div className="text-brand text-2xl font-bold">›</div>
          </div>
        </Link>

        <Link href="/hotel" className="block">
          <div className="card flex items-center gap-4 active:scale-[0.99] transition-transform">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center text-4xl shrink-0"
              style={{ background: "linear-gradient(135deg, #DBEAFE 0%, #BFDBFE 100%)" }}
            >
              🏨
            </div>
            <div className="flex-1">
              <div className="text-2xl font-extrabold text-ink">订酒店</div>
              <div className="text-lg text-inksoft mt-0.5">住得好，出行更舒心</div>
            </div>
            <div className="text-sky-500 text-2xl font-bold">›</div>
          </div>
        </Link>

        <Link href="/orders" className="block">
          <div className="card flex items-center gap-4 active:scale-[0.99] transition-transform">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center text-4xl shrink-0"
              style={{ background: "linear-gradient(135deg, #D1FAE5 0%, #A7F3D0 100%)" }}
            >
              📋
            </div>
            <div className="flex-1">
              <div className="text-2xl font-extrabold text-ink">我的订单</div>
              <div className="text-lg text-inksoft mt-0.5">查看机票和酒店订单</div>
            </div>
            <div className="text-emerald-600 text-2xl font-bold">›</div>
          </div>
        </Link>
      </div>

      {/* 温馨提示 */}
      <div
        className="mt-6 rounded-2xl p-5"
        style={{ background: "linear-gradient(135deg, #FFF0E2 0%, #FFE3CC 100%)" }}
      >
        <div className="text-lg text-brand-deep leading-relaxed">
          <div className="font-bold mb-1">💡 温馨提示</div>
          <div>下单后会跳转到支付页面，微信或支付宝都能付款。遇到问题请让子女帮忙，或联系客服。</div>
        </div>
      </div>

      <div className="text-center text-inkmute text-base mt-10">本服务由 龙虾出行 提供</div>
    </div>
  );
}
