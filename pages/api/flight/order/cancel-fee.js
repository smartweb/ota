const { makeHandler } = require("@/lib/handler");
const { callLongxia } = require("@/lib/longxia");

// 查询机票取消/退票手续费 → POST /open/v1/flight/order/cancel-fee
// 用于订单详情页让老人了解退票扣多少手续费
export default makeHandler(async (body) => {
  return await callLongxia("/open/v1/flight/order/cancel-fee", {
    method: "POST",
    body: { order_id: body.order_id || body.system_no },
  });
});
