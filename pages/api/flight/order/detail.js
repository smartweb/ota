const { makeHandler } = require("@/lib/handler");
const { callLongxia } = require("@/lib/longxia");

// 机票订单详情 → POST /open/v1/flight/order/detail
export default makeHandler(async (body) => {
  return await callLongxia("/open/v1/flight/order/detail", {
    method: "POST",
    body: {
      system_no: body.system_no,
      out_trade_no: body.out_trade_no,
    },
  });
});
