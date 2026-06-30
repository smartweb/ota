const { makeHandler } = require("@/lib/handler");
const { callLongxia } = require("@/lib/longxia");

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "";

// 酒店订单支付 → POST /open/v1/hotel/order/pay
// 返回 pay_params（按 pay_type 不同：mweb_url / pay_url / code_url 等）
export default makeHandler(async (body) => {
  return await callLongxia("/open/v1/hotel/order/pay", {
    method: "POST",
    body: {
      order_no: body.order_no,
      pay_type: body.pay_type || "wechat_h5",
      return_url: body.return_url || `${BASE_URL}/pay/return`,
      openid: body.openid,
    },
  });
});
