const { makeHandler } = require("@/lib/handler");
const { callLongxia } = require("@/lib/longxia");

// 机票订单支付 → POST /open/v1/flight/order/pay
// 返回 pay_params（按 pay_type 不同：mweb_url / pay_url / code_url 等）
export default makeHandler(async (body) => {
  return await callLongxia("/open/v1/flight/order/pay", {
    method: "POST",
    body: {
      system_no: body.system_no,
      pay_type: body.pay_type || "wechat_h5",
      return_url: body.return_url,
      client_ip: body.client_ip,
      openid: body.openid,
    },
  });
});
