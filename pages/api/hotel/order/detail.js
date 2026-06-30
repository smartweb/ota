const { makeHandler } = require("@/lib/handler");
const { callLongxia } = require("@/lib/longxia");

// 酒店订单详情 → GET /open/v1/hotel/order/detail/{order_no}
// 注意：与机票不同，酒店详情是 GET 请求，订单号在 URL 路径参数里
export default makeHandler(async (body) => {
  const orderNo = body.order_no;
  if (!orderNo) {
    const err = new Error("缺少订单号");
    err.code = "PARAMS";
    throw err;
  }
  return await callLongxia(`/open/v1/hotel/order/detail/${encodeURIComponent(orderNo)}`, {
    method: "GET",
  });
});
