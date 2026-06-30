import Link from "next/link";
import ToastHost from "@/components/Toast";

export default function Home() {
  return (
    <div className="page">
      <ToastHost />
      {/* 顶部欢迎区 */}
      <div className="pt-12 pb-8 text-center">
        <div className="text-5xl mb-3">🧳</div>
        <h1 className="text-3xl font-extrabold text-ink">乐享出行</h1>
        <p className="text-lg text-gray-500 mt-2">订机票 · 订酒店 · 省心出行</p>
      </div>

      {/* 三大入口大卡片 */}
      <div className="space-y-4">
        <Link href="/flight" className="block">
          <div className="card flex items-center gap-4 active:scale-[0.99] transition-transform border-l-8 border-brand">
            <div className="text-5xl">✈️</div>
            <div className="flex-1">
              <div className="text-2xl font-extrabold text-ink">订机票</div>
              <div className="text-lg text-gray-500">国内航班，比价下单</div>
            </div>
            <div className="text-brand text-2xl font-bold">›</div>
          </div>
        </Link>

        <Link href="/hotel" className="block">
          <div className="card flex items-center gap-4 active:scale-[0.99] transition-transform border-l-8 border-blue-500">
            <div className="text-5xl">🏨</div>
            <div className="flex-1">
              <div className="text-2xl font-extrabold text-ink">订酒店</div>
              <div className="text-lg text-gray-500">住得好，出行更舒心</div>
            </div>
            <div className="text-blue-500 text-2xl font-bold">›</div>
          </div>
        </Link>

        <Link href="/orders" className="block">
          <div className="card flex items-center gap-4 active:scale-[0.99] transition-transform border-l-8 border-green-600">
            <div className="text-5xl">📋</div>
            <div className="flex-1">
              <div className="text-2xl font-extrabold text-ink">我的订单</div>
              <div className="text-lg text-gray-500">查看机票和酒店订单</div>
            </div>
            <div className="text-green-600 text-2xl font-bold">›</div>
          </div>
        </Link>
      </div>

      {/* 温馨提示 */}
      <div className="mt-8 card bg-brand-light border-brand-light">
        <div className="text-lg text-brand-dark leading-relaxed">
          <div className="font-bold mb-1">💡 温馨提示</div>
          <div>下单后会跳转到支付页面，微信或支付宝都能付款。遇到问题请让子女帮忙，或联系客服。</div>
        </div>
      </div>

      <div className="text-center text-gray-400 text-base mt-10">本服务由 龙虾出行 提供</div>
    </div>
  );
}
