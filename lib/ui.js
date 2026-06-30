// 前端通用工具：金额、日期、状态映射、请求封装

/** 格式化金额：分/元 → "¥1,280" */
export function yuan(n, withSymbol = true) {
  if (n === null || n === undefined || isNaN(n)) return withSymbol ? "¥--" : "--";
  const num = Number(n);
  const str = num.toLocaleString("zh-CN", {
    minimumFractionDigits: num % 1 === 0 ? 0 : 1,
    maximumFractionDigits: 2,
  });
  return withSymbol ? `¥${str}` : str;
}

/** YYYY-MM-DD → "6月15日 周一" */
const WEEK = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];
export function prettyDate(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr.replace(/-/g, "/"));
  if (isNaN(d.getTime())) return dateStr;
  return `${d.getMonth() + 1}月${d.getDate()}日 ${WEEK[d.getDay()]}`;
}

/** "2026-06-15 08:00" → "08:00" ; 只取 HH:MM */
export function shortTime(t) {
  if (!t) return "--:--";
  const m = String(t).match(/(\d{2}:\d{2})/);
  return m ? m[1] : t;
}

/** 分钟数 → "2小时30分钟" */
export function prettyDuration(minutes) {
  if (!minutes && minutes !== 0) return "";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h && m) return `${h}小时${m}分钟`;
  if (h) return `${h}小时`;
  return `${m}分钟`;
}

/** 今天 + n 天，返回 YYYY-MM-DD */
export function dateOffset(days = 0, base = new Date()) {
  const d = new Date(base);
  d.setDate(d.getDate() + days);
  const p = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

/** 今天 YYYY-MM-DD */
export function today() {
  return dateOffset(0);
}

/** 机票订单状态 → { text, cls } */
export function flightStatus(status) {
  const map = {
    pending_pay: { text: "待付款", cls: "status-warn" },
    paid: { text: "已付款，正在出机票", cls: "status-paid" },
    ticketed: { text: "已出机票", cls: "status-success" },
    canceled: { text: "已取消", cls: "status-cancel" },
    refunded: { text: "已退款", cls: "status-cancel" },
    failed: { text: "出票失败，请联系客服", cls: "status-warn" },
  };
  return map[status] || { text: status || "未知", cls: "status-cancel" };
}

/** 酒店订单状态 → { text, cls } */
export function hotelStatus(status) {
  const map = {
    pending_payment: { text: "待付款", cls: "status-warn" },
    paid: { text: "已付款，正在确认", cls: "status-paid" },
    confirmed: { text: "预订成功", cls: "status-success" },
    checked_in: { text: "已入住", cls: "status-success" },
    checked_out: { text: "已离店", cls: "status-cancel" },
    canceled: { text: "已取消", cls: "status-cancel" },
    refunded: { text: "已退款", cls: "status-cancel" },
    abnormal: { text: "订单异常，请联系客服", cls: "status-warn" },
  };
  return map[status] || { text: status || "未知", cls: "status-cancel" };
}

/** 床型映射 */
export function bedTypeText(t) {
  const m = { big_bed: "大床", twin: "双床", multi: "多床" };
  return m[t] || t || "";
}

/** 舱位映射 */
export function cabinClassText(c) {
  const m = {
    economy: "经济舱",
    premium_economy: "超级经济舱",
    business: "商务舱",
    first: "头等舱",
  };
  return m[c] || c || "";
}

/**
 * 统一前端 fetch 调用 BFF
 * @returns {Promise<{ok:boolean, data?:any, message?:string}>}
 */
export async function api(path, body) {
  try {
    const res = await fetch(path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: body ? JSON.stringify(body) : undefined,
    });
    const json = await res.json();
    if (json && json.code === 0) {
      return { ok: true, data: json.data };
    }
    return { ok: false, message: (json && json.message) || "请求失败" };
  } catch (e) {
    return { ok: false, message: "网络不给力，请稍后再试" };
  }
}
