const { makeHandler } = require("@/lib/handler");
const { callLongxia } = require("@/lib/longxia");

// 酒店查询列表 → POST /open/v1/hotel/search
export default makeHandler(async (body) => {
  const payload = {
    destination: body.destination,
    check_in: body.check_in,
    check_out: body.check_out,
    adult_count: body.adult_count || 2,
    room_count: body.room_count || 1,
    page: body.page || 1,
    page_size: body.page_size || 20,
    sort_by: body.sort_by || "best",
  };
  // 老年人友好：默认 senior 场景标签（龙虾会返回适配标签）
  if (body.scene) payload.scene = body.scene;
  else payload.scene = "senior";

  if (body.latitude) payload.latitude = body.latitude;
  if (body.longitude) payload.longitude = body.longitude;
  if (body.adcode) payload.adcode = body.adcode;

  return await callLongxia("/open/v1/hotel/search", { method: "POST", body: payload });
});
