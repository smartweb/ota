const { makeHandler } = require("@/lib/handler");
const { callLongxia } = require("@/lib/longxia");

// 机票验价 → POST /open/v1/flight/pricing
export default makeHandler(async (body) => {
  return await callLongxia("/open/v1/flight/pricing", {
    method: "POST",
    body: {
      search_offer_id: body.search_offer_id,
      passengers: body.passengers || { adult: 1, child: 0, infant: 0 },
    },
  });
});
