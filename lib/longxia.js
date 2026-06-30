// 龙虾出行开放平台 - 服务端请求封装
// Token 只在本文件（服务端）使用，绝不暴露给前端

const HOST = process.env.LONGXIA_HOST || "https://api.longxiachuxing.com";
const TOKEN = process.env.LONGXIA_TOKEN || "";

/**
 * 统一请求龙虾开放平台接口
 * @param {string} path  路径，如 /open/v1/flight/search
 * @param {object} [opts]
 * @param {string} [opts.method]  POST | GET
 * @param {object} [opts.body]    JSON body（POST 时用）
 * @param {object} [opts.query]   query 参数（GET 时用）
 * @returns {Promise<object>} 龙虾响应里的 data 字段（业务数据）
 */
async function callLongxia(path, { method = "POST", body, query } = {}) {
  if (!TOKEN) {
    const err = new Error("服务端未配置 LONGXIA_TOKEN");
    err.code = "MISSING_TOKEN";
    throw err;
  }

  let url = HOST + path;
  if (query && Object.keys(query).length) {
    const qs = new URLSearchParams();
    for (const [k, v] of Object.entries(query)) {
      if (v !== undefined && v !== null && v !== "") qs.append(k, String(v));
    }
    url += "?" + qs.toString();
  }

  const init = {
    method,
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      "Content-Type": "application/json",
    },
    // Vercel/Node fetch 超时兜底
    signal: AbortSignal.timeout(30000),
  };
  if (method !== "GET" && body !== undefined) {
    init.body = JSON.stringify(body);
  }

  let resp;
  try {
    resp = await fetch(url, init);
  } catch (e) {
    const err = new Error("网络异常，请稍后再试");
    err.code = "NETWORK";
    err.raw = String(e);
    throw err;
  }

  let json;
  try {
    json = await resp.json();
  } catch (_) {
    const err = new Error(`服务器返回异常（HTTP ${resp.status}）`);
    err.code = "BAD_RESPONSE";
    err.httpStatus = resp.status;
    throw err;
  }

  // 龙虾约定：code === 0 表示成功，业务数据在 data 字段
  if (json && typeof json.code === "number" && json.code !== 0) {
    const err = new Error(json.message || "接口调用失败");
    err.code = String(json.code);
    err.requestId = json.request_id;
    err.bizMessage = json.message;
    throw err;
  }

  return json && json.data;
}

/**
 * 生成商户订单号（幂等键）
 * 格式：OTA_{YYYYMMDDHHmmss}_{6位随机}
 */
function genOutTradeNo(prefix = "OTA") {
  const d = new Date();
  const p = (n) => String(n).padStart(2, "0");
  const ts =
    d.getFullYear() +
    p(d.getMonth() + 1) +
    p(d.getDate()) +
    p(d.getHours()) +
    p(d.getMinutes()) +
    p(d.getSeconds());
  const rand = Math.random().toString(36).slice(2, 8);
  return `${prefix}_${ts}_${rand}`;
}

/**
 * 把龙虾错误码/信息翻译成老人能看懂的中文
 */
function friendlyError(err) {
  if (!err) return { message: "出错了，请稍后再试", code: "UNKNOWN" };
  const code = err.code;
  const msg = err.bizMessage || err.message || "";

  // 鉴权 / IP 白名单类
  if (code === "40113") return { message: "服务凭证已失效，请联系客服", code };
  if (["40301", "40302", "40303"].includes(code))
    return { message: "操作太快了，请休息一下再试", code };
  if (code === "40304" || /ip/i.test(msg) || /白名单/.test(msg))
    return { message: "网络受限，请联系客服开通", code };

  // 参数 / 业务
  if (code === "40001" || code === "40002")
    return { message: "信息填得不太对，请检查一下", code };
  if (/过期|expire/i.test(msg))
    return { message: "时间太久页面失效了，请重新搜索", code };
  if (/价格|price/i.test(msg))
    return { message: "价格变了，请重新确认", code };
  if (/库存|售完|sold/i.test(msg))
    return { message: "卖完了，换一个试试", code };

  // 网络
  if (code === "NETWORK") return { message: "网络不给力，请稍后再试", code };
  if (code === "MISSING_TOKEN")
    return { message: "服务正在配置中，请稍后再试", code };

  return { message: msg || "出错了，请稍后再试", code: code || "UNKNOWN" };
}

module.exports = {
  callLongxia,
  genOutTradeNo,
  friendlyError,
  HOST,
};
