const { makeHandler } = require("@/lib/handler");
const { callLongxia } = require("@/lib/longxia");

// 机票验价 → POST /open/v1/flight/pricing
// 注意：passengers 是完整的乘客信息数组（与下单一致），不是 {adult,child,infant}
export default makeHandler(async (body) => {
  const payload = {
    search_offer_id: body.search_offer_id,
    passengers: body.passengers,
  };
  if (body.return_search_offer_id) payload.return_search_offer_id = body.return_search_offer_id;
  return await callLongxia("/open/v1/flight/pricing", { method: "POST", body: payload });
});
