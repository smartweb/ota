import { useState } from "react";
import { useRouter } from "next/router";
import NavBar from "@/components/NavBar";
import { toast } from "@/components/Toast";
import { api, yuan, prettyDate, bedTypeText } from "@/lib/ui";

export default function HotelBook() {
  const router = useRouter();
  const sel = (() => {
    if (typeof window === "undefined") return null;
    try {
      return JSON.parse(sessionStorage.getItem("hotel_selected") || "null");
    } catch {
      return null;
    }
  })();

  const [guests, setGuests] = useState([{ name: "" }]);
  const [contact, setContact] = useState({ name: "", phone: "" });
  const [arrival, setArrival] = useState("14:00");
  const [request, setRequest] = useState("");
  const [agree, setAgree] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  if (!sel) {
    return (
      <div className="page">
        <NavBar title="填写订单" />
        <div className="card mt-6 text-center">
          <div className="text-lg text-inksoft mb-4">页面已失效，请重新搜索酒店</div>
          <button className="btn-primary" onClick={() => router.replace("/hotel")}>
            重新搜索
          </button>
        </div>
      </div>
    );
  }

  const updateGuest = (i, v) =>
    setGuests((arr) => arr.map((g, idx) => (idx === i ? { name: v } : g)));
  const addGuest = () => setGuests((arr) => [...arr, { name: "" }]);
  const removeGuest = (i) => setGuests((arr) => arr.filter((_, idx) => idx !== i));

  const total = sel.product.price * sel.nights * sel.room_count;

  const validate = () => {
    if (!guests[0]?.name) return "请填写入住人姓名";
    if (!contact.name) return "请填写联系人姓名";
    if (!/^1\d{10}$/.test(contact.phone)) return "请填写正确的联系人手机号";
    if (!agree) return "请勾选同意预订须知";
    return null;
  };

  const submit = async () => {
    const verr = validate();
    if (verr) {
      toast(verr);
      return;
    }
    setSubmitting(true);
    const cr = await api("/api/hotel/order/create", {
      offer_id: sel.product.offer_id,
      guests: guests.map((g) => ({ name: g.name })),
      contact: { name: contact.name, phone: contact.phone },
      arrival_time: arrival,
      special_request: request,
      external_user_id: contact.phone,
    });
    setSubmitting(false);

    if (!cr.ok) {
      toast(cr.message || "下单失败，请重试");
      return;
    }
    const order = cr.data;
    sessionStorage.setItem(
      "last_order",
      JSON.stringify({ type: "hotel", order_no: order.order_no, total_amount: order.total_amount })
    );

    if (order.checkout_url) {
      window.location.href = order.checkout_url;
    } else {
      toast("订单已创建，正在跳转…");
      setTimeout(() => router.replace(`/orders/hotel/${order.order_no}`), 1500);
    }
  };

  return (
    <div className="page">
      <NavBar title="填写订单" />

      {/* 酒店信息 */}
      <div className="card mt-4">
        <div className="text-2xl font-extrabold">{sel.hotel_name}</div>
        {sel.hotel_addr && <div className="text-base text-inksoft mt-1">📍 {sel.hotel_addr}</div>}
        <div className="mt-3 pt-3 border-t border-dashed border-brand/15">
          <div className="text-lg font-bold">{sel.room_name}</div>
          <div className="text-base text-inksoft">
            {bedTypeText(sel.bed_type)}
            {sel.area ? ` · ${sel.area}㎡` : ""}
          </div>
        </div>
        <div className="mt-3 pt-3 border-t border-dashed border-brand/15 flex items-center justify-between">
          <div className="text-base text-inksoft">
            {prettyDate(sel.check_in)} - {prettyDate(sel.check_out)}
          </div>
          <div className="text-lg font-bold">
            {sel.nights}晚 · {sel.room_count}间
          </div>
        </div>
        {sel.product.cancel_policy && (
          <div className="text-base text-inksoft mt-2">取消政策：{sel.product.cancel_policy}</div>
        )}
      </div>

      {/* 入住人 */}
      <div className="mt-6 mb-2 px-1 flex items-center justify-between">
        <span className="text-xl font-extrabold">入住人</span>
        <button onClick={addGuest} className="btn-ghost">
          ＋ 添加
        </button>
      </div>
      {guests.map((g, i) => (
        <div key={i} className="card mt-3">
          <div className="flex items-center justify-between mb-3">
            <span className="text-lg font-bold text-inksoft">入住人 {i + 1}</span>
            {guests.length > 1 && (
              <button onClick={() => removeGuest(i)} className="text-base text-brand-deep">
                删除
              </button>
            )}
          </div>
          <input
            className="input-lg"
            placeholder="姓名（与证件一致）"
            value={g.name}
            onChange={(e) => updateGuest(i, e.target.value)}
          />
        </div>
      ))}

      {/* 联系人 */}
      <div className="mt-6 mb-2 px-1">
        <span className="text-xl font-extrabold">联系人</span>
      </div>
      <div className="card space-y-3">
        <input
          className="input-lg"
          placeholder="联系人姓名"
          value={contact.name}
          onChange={(e) => setContact({ ...contact, name: e.target.value })}
        />
        <input
          className="input-lg"
          type="tel"
          placeholder="手机号（用于接收订单短信）"
          value={contact.phone}
          onChange={(e) => setContact({ ...contact, phone: e.target.value })}
        />
        <div>
          <div className="text-base text-inksoft mb-2">预计到店时间</div>
          <select className="input-lg" value={arrival} onChange={(e) => setArrival(e.target.value)}>
            {["12:00", "14:00", "16:00", "18:00", "20:00", "22:00"].map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
        <input
          className="input-lg"
          placeholder="特殊要求（选填），如 高楼层、安静房间"
          value={request}
          onChange={(e) => setRequest(e.target.value)}
        />
      </div>

      <label className="flex items-start gap-3 mt-5 px-1">
        <input
          type="checkbox"
          checked={agree}
          onChange={(e) => setAgree(e.target.checked)}
          className="mt-1 w-6 h-6 accent-brand"
        />
        <span className="text-base text-inksoft leading-relaxed">
          我已阅读并同意《预订须知》，确认入住信息真实有效。
        </span>
      </label>

      <div className="footer-bar">
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="text-base text-inkmute">合计</div>
            <div className="text-brand">
              <span className="text-xl font-bold">¥</span>
              <span className="text-4xl font-extrabold">{yuan(total, false)}</span>
            </div>
          </div>
          <button
            className="btn-primary !w-auto px-10"
            disabled={submitting}
            onClick={submit}
          >
            {submitting ? "提交中…" : "去支付"}
          </button>
        </div>
      </div>
    </div>
  );
}
