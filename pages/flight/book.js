import { useState } from "react";
import { useRouter } from "next/router";
import NavBar from "@/components/NavBar";
import { toast } from "@/components/Toast";
import { api, yuan, shortTime, prettyDate } from "@/lib/ui";

const ID_TYPES = [
  { code: "ID_CARD", label: "身份证" },
  { code: "PASSPORT", label: "护照" },
  { code: "HK_MACAO_PERMIT", label: "港澳通行证" },
  { code: "TAIWAN_PERMIT", label: "台湾通行证" },
];

export default function FlightBook() {
  const router = useRouter();
  const sel = (() => {
    if (typeof window === "undefined") return null;
    try {
      return JSON.parse(sessionStorage.getItem("flight_selected") || "null");
    } catch {
      return null;
    }
  })();

  const [pax, setPax] = useState([
    { name: "", id_type: "ID_CARD", id_number: "", phone: "", type: "adult" },
  ]);
  const [contact, setContact] = useState({ name: "", phone: "" });
  const [agree, setAgree] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  // 实时价格确认弹窗：价格变动时让用户看到最终价再继续下单
  const [confirmPrice, setConfirmPrice] = useState(null); // { offerId, totalFare }

  if (!sel) {
    return (
      <div className="page">
        <NavBar title="填写订单" />
        <div className="card mt-6 text-center">
          <div className="text-lg text-inksoft mb-4">页面已失效，请重新搜索航班</div>
          <button className="btn-primary" onClick={() => router.replace("/flight")}>
            重新搜索
          </button>
        </div>
      </div>
    );
  }

  const updatePax = (i, key, val) => {
    setPax((arr) => arr.map((p, idx) => (idx === i ? { ...p, [key]: val } : p)));
  };
  const addPax = () =>
    setPax((arr) => [...arr, { name: "", id_type: "ID_CARD", id_number: "", phone: "", type: "adult" }]);
  const removePax = (i) => setPax((arr) => arr.filter((_, idx) => idx !== i));

  // 把第一个乘客的姓名/手机带到联系人，方便老人
  const fillContactFromFirst = () => {
    const first = pax[0];
    setContact({ name: first.name, phone: first.phone || contact.phone });
    toast("已带入联系人");
  };

  const validate = () => {
    for (let i = 0; i < pax.length; i++) {
      const p = pax[i];
      if (!p.name) return `请填写第 ${i + 1} 位乘客的姓名`;
      if (!p.id_number) return `请填写第 ${i + 1} 位乘客的证件号`;
    }
    if (!contact.name) return "请填写联系人姓名";
    if (!/^1\d{10}$/.test(contact.phone)) return "请填写正确的联系人手机号";
    if (!agree) return "请勾选同意购票须知";
    return null;
  };

  const submit = async () => {
    const verr = validate();
    if (verr) {
      toast(verr);
      return;
    }
    setSubmitting(true);

    // 先构造完整的乘客信息数组（验价和下单都需要）
    const passengers = pax.map((p) => ({
      type: "adult",
      name: p.name,
      id_type: p.id_type,
      id_number: p.id_number,
      phone: p.phone || contact.phone,
    }));

    try {
      // 1. 如果需要验价，用完整乘客信息去换 offer_id
      let offerId = sel.offer_id;
      if (!offerId || sel.pricing_required !== false) {
        toast("正在确认最新价格…", 1500);
        const pr = await api("/api/flight/pricing", {
          search_offer_id: sel.search_offer_id,
          passengers,
        });
        if (!pr.ok) {
          toast(pr.message || "价格确认失败，请重试");
          setSubmitting(false);
          return;
        }
        offerId = pr.data.offer_id;
        if (!offerId) {
          toast("无法获取报价，请重新选择航班");
          setSubmitting(false);
          return;
        }
        // 价格有变动 → 弹出确认框，让用户看到最终价后再下单
        if (pr.data.price_changed) {
          setSubmitting(false);
          setConfirmPrice({ offerId, totalFare: pr.data.total_fare });
          return;
        }
      }

      // 价格未变动（或可直下），直接下单
      await createOrderAndPay(offerId, passengers);
    } catch (e) {
      setSubmitting(false);
      toast("下单异常，请重试");
    }
  };

  // 用已验价的 offer_id 创建订单并跳转收银台
  const createOrderAndPay = async (offerId, passengers) => {
    setSubmitting(true);
    try {
      const cr = await api("/api/flight/order/create", {
        offer_id: offerId,
        passengers,
        contact: { name: contact.name, phone: contact.phone },
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
        JSON.stringify({ type: "flight", system_no: order.system_no, total_amount: order.total_amount })
      );

      if (order.checkout_url) {
        window.location.href = order.checkout_url;
      } else {
        toast("订单已创建，正在跳转支付…");
        setTimeout(() => router.replace(`/orders/flight/${order.system_no}`), 1500);
      }
    } catch (e) {
      setSubmitting(false);
      toast("下单异常，请重试");
    }
  };

  // 价格确认弹窗 → 用户确认后继续下单
  const confirmAndPay = async () => {
    setConfirmPrice(null);
    const passengers = pax.map((p) => ({
      type: "adult",
      name: p.name,
      id_type: p.id_type,
      id_number: p.id_number,
      phone: p.phone || contact.phone,
    }));
    await createOrderAndPay(confirmPrice.offerId, passengers);
  };

  const total = sel.cabin.lowest_price * sel.adult;

  return (
    <div className="page">
      <NavBar title="填写订单" />

      {/* 航班信息卡 */}
      <div className="card mt-4">
        <div className="flex items-center justify-between">
          <div className="text-lg font-bold text-inksoft">
            {sel.flight.airline_name} {sel.flight.flight_no}
          </div>
          <div className="text-base text-inkmute">{sel.cabin.cabin_name}</div>
        </div>
        <div className="flex items-center justify-between mt-3">
          <div>
            <div className="text-3xl font-extrabold">{shortTime(sel.flight.dep_time)}</div>
            <div className="text-base text-inksoft">{sel.flight.dep_city_name}</div>
          </div>
          <div className="text-brand text-2xl">✈️</div>
          <div className="text-right">
            <div className="text-3xl font-extrabold">{shortTime(sel.flight.arr_time)}</div>
            <div className="text-base text-inksoft">{sel.flight.arr_city_name}</div>
          </div>
        </div>
        <div className="text-base text-inkmute mt-2">{prettyDate(sel.depart_date)}</div>

        {(sel.cabin.refund_rule || sel.cabin.baggage_rule) && (
          <div
            className="mt-4 rounded-xl px-4 py-3 text-base flex items-start gap-2"
            style={{ background: "#FFF7ED" }}
          >
            <span className="shrink-0 text-lg">📌</span>
            <div className="text-inksoft leading-relaxed">
              <div className="font-bold text-ink mb-1">下单前请了解退改规则</div>
              {sel.cabin.refund_rule && <div>退改：{sel.cabin.refund_rule}</div>}
              {sel.cabin.baggage_rule && <div>行李：{sel.cabin.baggage_rule}</div>}
            </div>
          </div>
        )}
      </div>

      {/* 乘机人 */}
      <div className="mt-6 mb-2 px-1 flex items-center justify-between">
        <span className="text-xl font-extrabold">乘机人</span>
        <button onClick={addPax} className="btn-ghost">
          ＋ 添加乘客
        </button>
      </div>

      {pax.map((p, i) => (
        <div key={i} className="card mt-3">
          <div className="flex items-center justify-between mb-3">
            <span className="text-lg font-bold text-inksoft">乘客 {i + 1}</span>
            {pax.length > 1 && (
              <button
                onClick={() => removePax(i)}
                className="text-base text-brand-deep"
              >
                删除
              </button>
            )}
          </div>
          <div className="space-y-3">
            <input
              className="input-lg"
              placeholder="姓名（与证件一致）"
              value={p.name}
              onChange={(e) => updatePax(i, "name", e.target.value)}
            />
            <select
              className="input-lg"
              value={p.id_type}
              onChange={(e) => updatePax(i, "id_type", e.target.value)}
            >
              {ID_TYPES.map((t) => (
                <option key={t.code} value={t.code}>
                  {t.label}
                </option>
              ))}
            </select>
            <input
              className="input-lg"
              placeholder="证件号码"
              value={p.id_number}
              onChange={(e) => updatePax(i, "id_number", e.target.value)}
            />
          </div>
        </div>
      ))}

      {/* 联系人 */}
      <div className="mt-6 mb-2 px-1 flex items-center justify-between">
        <span className="text-xl font-extrabold">联系人</span>
        <button onClick={fillContactFromFirst} className="text-base text-brand font-semibold">
          同第一位乘客
        </button>
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
      </div>

      {/* 须知 */}
      <label className="flex items-start gap-3 mt-5 px-1">
        <input
          type="checkbox"
          checked={agree}
          onChange={(e) => setAgree(e.target.checked)}
          className="mt-1 w-6 h-6 accent-brand"
        />
        <span className="text-base text-inksoft leading-relaxed">
          我已阅读并同意《购票须知》，确认乘客信息真实有效，自愿购买该航班机票。
        </span>
      </label>

      {/* 底部金额 + 提交 */}
      <div className="footer-bar">
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="text-base text-inkmute">合计（{sel.adult}人）</div>
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

      {/* 实时价格确认弹窗 */}
      {confirmPrice && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center px-6">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm text-center">
            <div className="text-2xl font-extrabold mb-2">价格有变动</div>
            <div className="text-lg text-inksoft mb-4">
              实时核价后的最终价格为
            </div>
            <div className="text-brand mb-2">
              <span className="text-2xl font-bold">¥</span>
              <span className="text-5xl font-extrabold">
                {yuan(confirmPrice.totalFare, false)}
              </span>
            </div>
            <div className="text-base text-inkmute mb-6">
              （搜索时参考价 {yuan(total, false)}，以实时价为准）
            </div>
            <button className="btn-primary mb-3" onClick={confirmAndPay}>
              确认并支付 {yuan(confirmPrice.totalFare)}
            </button>
            <button
              className="w-full text-lg text-inksoft py-3"
              onClick={() => setConfirmPrice(null)}
            >
              再想想
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
