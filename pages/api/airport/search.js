const { makeHandler } = require("@/lib/handler");
const { callLongxia } = require("@/lib/longxia");

// 机场/城市联想搜索 → GET /open/v1/flight/airport/search
export default makeHandler(async (body) => {
  const keyword = (body.keyword || "").trim();
  if (!keyword) return { airports: [] };
  const data = await callLongxia("/open/v1/flight/airport/search", {
    method: "GET",
    query: { keyword },
  });
  return data;
});
