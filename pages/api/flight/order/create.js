const { makeHandler } = require("@/lib/handler");
const { callLongxia, genOutTradeNo } = require("@/lib/longxia");

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "";

// 创建机票订单 → POST /open/v1/flight/order/create
// 使用 user_pay 模式，返回 checkout_url（托管收银台），前端直接跳转即可
export default makeHandler(async (body) => {
  const outTradeNo = body.out_trade_no || genOutTradeNo("OTA_F");

  const payload = {
    out_trade_no: outTradeNo,
    offer_id: body.offer_id,
    return_offer_id: body.return_offer_id,
    passengers: body.passengers,
    contact: body.contact,
    pay_mode: "user_pay", // 固定收银台支付
    return_url: body.return_url || `${BASE_URL}/pay/return`,
  };
  if (body.external_user_id) payload.external_user_id = body.external_user_id;
  if (body.callback_url) payload.callback_url = body.callback_url;

  return await callLongxia("/open/v1/flight/order/create", {
    method: "POST",
    body: payload,
  });
});
