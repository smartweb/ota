import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import NavBar from "@/components/NavBar";
import Loading from "@/components/Loading";
import Empty from "@/components/Empty";
import { api, yuan, shortTime, prettyDate, flightStatus, hotelStatus } from "@/lib/ui";

const PHONE_KEY = "ota_user_phone";

export default function Orders() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [queried, setQueried] = useState(false);
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState([]);
  const [err, setErr] = useState("");

  useEffect(() => {
    const saved = typeof window !== "undefined" ? localStorage.getItem(PHONE_KEY) : "";
    if (saved) {
      setPhone(saved);
      doQuery(saved);
    }
  }, []);

  const doQuery = async (p) => {
    const phoneVal = (p || phone).trim();
    if (!/^1\d{10}$/.test(phoneVal)) {
      setErr("请输入正确的手机号");
      return;
    }
    localStorage.setItem(PHONE_KEY, phoneVal);
    setLoading(true);
    setErr("");
    setQueried(true);

    const [fr, hr] = await Promise.all([
      api("/api/flight/order/list", { contact_phone: phoneVal, page_size: 50 }),
      api("/api/hotel/order/list", { contact_phone: phoneVal, page_size: 50 }),
    ]);
    setLoading(false);

    const list = [];
    if (fr.ok && fr.data?.orders) {
      for (const o of fr.data.orders) {
        list.push({
          type: "flight",
          id: o.system_no,
          status: o.status,
          status_text: o.status_text,
          title: `${o.dep_city || ""} → ${o.arr_city || ""}`,
          sub: `${o.airline || ""} ${o.flight_no || ""} · ${shortTime(o.dep_time)}`,
          dep_time: o.dep_time,
          amount: o.total_amount,
          created_at: o.created_at,
        });
      }
    }
    if (hr.ok && hr.data?.orders) {
      for (const o of hr.data.orders) {
        list.push({
          type: "hotel",
          id: o.order_no,
          status: o.status,
          status_text: o.status_text,
          title: o.hotel_name || "酒店订单",
          sub: `${o.room_name || ""} · ${prettyDate(o.check_in)}-${prettyDate(o.check_out)}`,
          amount: o.total_amount,
          created_at: o.created_at,
        });
      }
    }

    if (!fr.ok && !hr.ok) {
      setErr(fr.message || hr.message || "查询失败");
      setOrders([]);
      return;
    }

    list.sort((a, b) => (b.created_at || "").localeCompare(a.created_at || ""));
    setOrders(list);
  };

  const open = (o) => router.push(`/orders/${o.type}/${o.id}`);

  return (
    <div className="page">
      <NavBar title="我的订单" />

      <div className="card mt-4">
        <div className="text-base text-gray-500 mb-2">输入下单时填写的手机号查看订单</div>
        <div className="flex gap-3">
          <input
            className="input-lg flex-1"
            type="tel"
            maxLength={11}
            placeholder="手机号"
            value={phone}
            onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
          />
          <button className="btn-primary !w-auto px-8" onClick={() => doQuery()}>
            查询
          </button>
        </div>
        {err && <div className="text-orange-600 text-base mt-2">{err}</div>}
      </div>

      {loading && <Loading text="正在查找订单…" />}

      {!loading && queried && orders.length === 0 && !err && (
        <Empty text="没有找到订单" icon="📋" />
      )}

      {!loading && orders.length > 0 && (
        <div className="space-y-3 mt-4">
          {orders.map((o, i) => {
            const st =
              o.type === "flight"
                ? flightStatus(o.status, o.status_text)
                : hotelStatus(o.status, o.status_text);
            return (
              <button
                key={i}
                onClick={() => open(o)}
                className="card w-full text-left active:scale-[0.99] transition-transform"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="badge bg-gray-100 text-gray-600">
                    {o.type === "flight" ? "✈️ 机票" : "🏨 酒店"}
                  </span>
                  <span className={`badge ${st.cls}`}>{st.text}</span>
                </div>
                <div className="text-2xl font-extrabold text-ink">{o.title}</div>
                <div className="text-base text-gray-500 mt-1">{o.sub}</div>
                <div className="mt-3 pt-3 border-t border-dashed border-gray-200 flex items-center justify-between">
                  <span className="text-base text-gray-400">
                    {o.created_at ? `下单 ${o.created_at.slice(0, 10)}` : ""}
                  </span>
                  <span className="text-brand text-2xl font-extrabold">{yuan(o.amount)}</span>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {!queried && (
        <div className="card mt-6 text-center text-gray-400 text-lg">
          输入手机号，查看您的机票和酒店订单
        </div>
      )}
    </div>
  );
}
