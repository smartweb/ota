import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import NavBar from "@/components/NavBar";
import Loading from "@/components/Loading";
import { toast } from "@/components/Toast";
import {
  api,
  yuan,
  shortTime,
  prettyDate,
  flightStatus,
  hotelStatus,
  cabinClassText,
} from "@/lib/ui";

export default function OrderDetail() {
  const router = useRouter();
  const { type, no } = router.query;
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    if (!router.isReady || !type || !no) return;
    let poll;
    (async () => {
      const fetchDetail = async () => {
        const path =
          type === "flight" ? "/api/flight/order/detail" : "/api/hotel/order/detail";
        const key = type === "flight" ? "system_no" : "order_no";
        return api(path, { [key]: no });
      };
      const load = async () => {
        const r = await fetchDetail();
        setLoading(false);
        if (r.ok) {
          setOrder(r.data);
          setErr("");
        } else {
          setErr(r.message);
        }
      };
      await load();

      // 待支付 / 待确认状态自动轮询，方便支付后看到最新状态
      poll = setInterval(async () => {
        const r = await fetchDetail();
        if (r.ok) {
          setOrder(r.data);
          const s = r.data.status;
          if (s !== "pending_pay" && s !== "pending_payment" && s !== "paid") {
            clearInterval(poll);
          }
        }
      }, 5000);
    })();
    return () => clearInterval(poll);
  }, [router.isReady, type, no]);

  if (loading) {
    return (
      <div className="page">
        <NavBar title="订单详情" />
        <Loading text="正在加载订单…" />
      </div>
    );
  }
  if (err && !order) {
    return (
      <div className="page">
        <NavBar title="订单详情" />
        <div className="card mt-6 text-center text-orange-600 text-lg">{err}</div>
      </div>
    );
  }
  if (!order) return null;

  const isFlight = type === "flight";
  const st = isFlight
    ? flightStatus(order.status, order.status_text)
    : hotelStatus(order.status, order.status_text);

  // 待支付状态（兼容字符串状态码 "1" 和语义码 pending_pay/pending_payment）
  const pendingSet = isFlight
    ? ["pending_pay", "1"]
    : ["pending_payment", "1"];
  const isPending = pendingSet.includes(String(order.status));
  // 兜底：status_text 含"待支付"也视为待支付
  const canPay = isPending || /待支付|待付款/.test(order.status_text || "");

  // 调 order/pay 拿支付链接并跳转
  const [paying, setPaying] = useState(false);
  const payOrder = async (payType) => {
    setPaying(true);
    const path = isFlight ? "/api/flight/order/pay" : "/api/hotel/order/pay";
    const body = isFlight
      ? { system_no: order.system_no, pay_type: payType }
      : { order_no: order.order_no, pay_type: payType };
    const r = await api(path, body);
    setPaying(false);
    if (!r.ok) {
      toast(r.message || "获取支付链接失败");
      return;
    }
    const pp = r.data && r.data.pay_params;
    const url =
      pp &&
      (pp.mweb_url || pp.pay_url || pp.code_url || (typeof pp === "string" ? pp : ""));
    if (url) {
      window.location.href = url;
    } else {
      toast("未获取到支付链接，请联系客服");
    }
  };

  return (
    <div className="page">
      <NavBar title="订单详情" />

      {/* 状态卡 */}
      <div className="card mt-4 text-center">
        <div className={`badge ${st.cls} text-xl px-5 py-2`}>{st.text}</div>
        {order.total_amount !== undefined && (
          <div className="mt-3">
            <span className="text-base text-gray-400">金额 </span>
            <span className="text-brand text-4xl font-extrabold">{yuan(order.total_amount)}</span>
          </div>
        )}
        {canPay && order.pay_expire_time && (
          <div className="text-base text-orange-600 mt-2">
            请在 {order.pay_expire_time} 前完成支付
          </div>
        )}
      </div>

      {/* 机票详情 */}
      {isFlight && (
        <>
          {order.flight_info && (
            <div className="card mt-4">
              <div className="text-xl font-extrabold mb-3">航班信息</div>
              <div className="text-lg font-bold text-gray-600">
                {order.flight_info.airline_name || order.airline} {order.flight_info.flight_no}
              </div>
              <div className="flex items-center justify-between mt-3">
                <div>
                  <div className="text-3xl font-extrabold">
                    {shortTime(order.flight_info.dep_time || order.flight_info.depart_time)}
                  </div>
                  <div className="text-base text-gray-500">
                    {order.flight_info.dep_city_name || order.flight_info.dep_city || order.flight_info.dep_airport_name}
                  </div>
                </div>
                <div className="text-brand text-2xl">✈️</div>
                <div className="text-right">
                  <div className="text-3xl font-extrabold">
                    {shortTime(order.flight_info.arr_time)}
                  </div>
                  <div className="text-base text-gray-500">
                    {order.flight_info.arr_city_name || order.flight_info.arr_city || order.flight_info.arr_airport_name}
                  </div>
                </div>
              </div>
              <div className="text-base text-gray-400 mt-2">
                {order.flight_info.cabin_class ? (["economy","business","first"].includes(order.flight_info.cabin_class) ? cabinClassText(order.flight_info.cabin_class) : order.flight_info.cabin_class) : ""}
                {order.flight_info.dep_time ? ` · ${prettyDate(order.flight_info.dep_time.slice(0, 10))}` : ""}
              </div>
            </div>
          )}

          {order.passengers && order.passengers.length > 0 && (
            <div className="card mt-4">
              <div className="text-xl font-extrabold mb-3">乘机人</div>
              {order.passengers.map((p, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b last:border-0 border-gray-50">
                  <span className="text-lg font-bold">{p.name}</span>
                  <span className="text-base text-gray-500">
                    {p.id_type === "ID_CARD" ? "身份证" : "证件"} {p.id_number?.slice(-4)}
                  </span>
                </div>
              ))}
            </div>
          )}

          {order.pnr && (
            <div className="card mt-4 flex items-center justify-between">
              <span className="text-lg text-gray-600">订座编码</span>
              <span className="text-xl font-extrabold tracking-widest">{order.pnr}</span>
            </div>
          )}
        </>
      )}

      {/* 酒店详情 */}
      {!isFlight && (
        <>
          <div className="card mt-4">
            <div className="text-xl font-extrabold">{order.hotel_name}</div>
            {order.room_name && <div className="text-lg text-gray-600 mt-1">{order.room_name}</div>}
            <div className="mt-3 pt-3 border-t border-dashed border-gray-200 flex items-center justify-between text-lg">
              <span className="text-gray-500">入住</span>
              <span className="font-bold">{prettyDate(order.check_in)}</span>
            </div>
            <div className="flex items-center justify-between text-lg mt-2">
              <span className="text-gray-500">离店</span>
              <span className="font-bold">{prettyDate(order.check_out)}</span>
            </div>
            <div className="flex items-center justify-between text-base text-gray-400 mt-2">
              <span>共 {order.nights} 晚 · {order.room_count} 间</span>
            </div>
          </div>

          {order.guests && order.guests.length > 0 && (
            <div className="card mt-4">
              <div className="text-xl font-extrabold mb-3">入住人</div>
              {order.guests.map((g, i) => (
                <div key={i} className="text-lg py-1">{g.name}</div>
              ))}
            </div>
          )}
        </>
      )}

      {/* 联系人 */}
      {order.contact && (
        <div className="card mt-4 flex items-center justify-between">
          <span className="text-lg text-gray-600">联系人</span>
          <span className="text-lg font-bold">
            {order.contact.name} {order.contact.phone}
          </span>
        </div>
      )}

      {/* 退改规则（仅展示，不提供操作） */}
      {isFlight && order.refund_rule && (
        <div className="card mt-4">
          <div className="text-lg font-bold mb-2">退改规则</div>
          <div className="text-base text-gray-500 leading-relaxed whitespace-pre-line">
            {typeof order.refund_rule === "string"
              ? order.refund_rule
              : order.refund_rule.current?.summary || JSON.stringify(order.refund_rule)}
          </div>
        </div>
      )}

      {/* 操作：选择支付方式 */}
      {canPay && (
        <div className="footer-bar">
          <div className="text-center text-base text-gray-400 mb-2">
            应付 <span className="text-brand font-bold">{yuan(order.total_amount)}</span> · 选择支付方式
          </div>
          <div className="flex gap-3">
            <button
              className="btn-primary !w-auto flex-1 !bg-[#09bb07]"
              disabled={paying}
              onClick={() => payOrder("wechat_h5")}
            >
              {paying ? "跳转中…" : "微信支付"}
            </button>
            <button
              className="btn-primary !w-auto flex-1 !bg-[#1677ff]"
              disabled={paying}
              onClick={() => payOrder("alipay_h5")}
            >
              {paying ? "跳转中…" : "支付宝"}
            </button>
          </div>
        </div>
      )}

      <div className="text-center text-gray-400 text-base mt-8">
        {isFlight ? `订单号 ${order.system_no}` : `订单号 ${order.order_no}`}
      </div>
    </div>
  );
}
