// 统一的 API Route handler 工厂
const { friendlyError } = require("./longxia");

/**
 * 创建一个 API Route handler，自动处理 JSON 解析、错误、响应格式
 * @param {(body, req) => Promise<any>} fn 业务函数，入参为请求 body，返回业务数据
 */
function makeHandler(fn) {
  return async function handler(req, res) {
    if (req.method !== "POST" && req.method !== "GET") {
      return res.status(405).json({ code: -1, message: "Method Not Allowed" });
    }
    try {
      const body = req.method === "POST" ? req.body || {} : req.query;
      const data = await fn(body, req);
      return res.status(200).json({ code: 0, message: "ok", data });
    } catch (err) {
      const fe = friendlyError(err);
      return res.status(200).json({
        code: err.code || -1,
        message: fe.message,
        raw: process.env.NODE_ENV === "development" ? err.message : undefined,
        request_id: err.requestId,
      });
    }
  };
}

module.exports = { makeHandler };
