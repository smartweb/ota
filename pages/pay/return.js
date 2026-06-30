import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import NavBar from "@/components/NavBar";

export default function PayReturn() {
  const router = useRouter();
  const [last, setLast] = useState(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      setLast(JSON.parse(sessionStorage.getItem("last_order") || "null"));
    } catch {}
  }, []);

  const viewOrder = () => {
    if (last) {
      router.replace(`/orders/${last.type}/${last.type === "flight" ? last.system_no : last.order_no}`);
    } else {
      router.replace("/orders");
    }
  };

  return (
    <div className="page">
      <NavBar title="支付完成" />
      <div className="text-center pt-16">
        <div className="text-7xl mb-4">✅</div>
        <div className="text-3xl font-extrabold">付款已提交</div>
        <div className="text-lg text-inksoft mt-3 px-8">
          支付结果可能稍有延迟，可在「我的订单」查看最新状态。机票出票、酒店确认一般需要几分钟。
        </div>

        {last && (
          <div className="card mt-8 text-left">
            <div className="text-lg text-inksoft">
              {last.type === "flight" ? "✈️ 机票订单" : "🏨 酒店订单"}
            </div>
            <div className="text-2xl font-extrabold mt-1">¥{last.total_amount}</div>
          </div>
        )}

        <div className="mt-8 space-y-3 px-4">
          <button className="btn-primary" onClick={viewOrder}>
            查看订单
          </button>
          <button className="btn-secondary" onClick={() => router.replace("/")}>
            返回首页
          </button>
        </div>
      </div>
    </div>
  );
}
