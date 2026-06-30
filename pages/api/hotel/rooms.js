const { makeHandler } = require("@/lib/handler");
const { callLongxia } = require("@/lib/longxia");

// 酒店房型详情 → POST /open/v1/hotel/rooms
export default makeHandler(async (body) => {
  return await callLongxia("/open/v1/hotel/rooms", {
    method: "POST",
    body: { search_offer_id: body.search_offer_id },
  });
});
