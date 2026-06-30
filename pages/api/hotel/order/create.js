const { makeHandler } = require("@/lib/handler");
const { callLongxia, genOutTradeNo } = require("@/lib/longxia");

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "";

// 创建酒店订单 → POST /open/v1/hotel/order/create
// user_pay 模式，返回 checkout_url（托管收银台）
export default makeHandler(async (body) => {
  const outTradeNo = body.out_trade_no || genOutTradeNo("OTA_H");

  const payload = {
    out_trade_no: outTradeNo,
    offer_id: body.offer_id,
    guests: body.guests,
    contact: body.contact,
    pay_mode: "user_pay",
    return_url: body.return_url || `${BASE_URL}/pay/return`,
  };
  if (body.arrival_time) payload.arrival_time = body.arrival_time;
  if (body.special_request) payload.special_request = body.special_request;
  if (body.external_user_id) payload.external_user_id = body.external_user_id;
  if (body.callback_url) payload.callback_url = body.callback_url;

  return await callLongxia("/open/v1/hotel/order/create", {
    method: "POST",
    body: payload,
  });
});
