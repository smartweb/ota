const { makeHandler } = require("@/lib/handler");
const { callLongxia } = require("@/lib/longxia");

// 酒店订单详情 → POST /open/v1/hotel/order/detail
export default makeHandler(async (body) => {
  return await callLongxia("/open/v1/hotel/order/detail", {
    method: "POST",
    body: {
      order_no: body.order_no,
      out_trade_no: body.out_trade_no,
    },
  });
});
