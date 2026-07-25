const { makeHandler } = require("@/lib/handler");
const { callLongxia } = require("@/lib/longxia");

// 机票查询列表 → POST /open/v1/flight/search
export default makeHandler(async (body) => {
  // 上游 FlightSearchRequest 要求 from_code / to_code 必填。
  // 部分入口可能只传 from_airport_code / to_airport_code，这里兜底回填，避免 40001 参数错误。
  const fromCode = body.from_code || body.from_airport_code;
  const toCode = body.to_code || body.to_airport_code;

  const payload = {
    trip_mode: body.trip_mode || "domestic",
    trip_type: body.trip_type || "oneway",
    from_code: fromCode,
    to_code: toCode,
    from_airport_code: body.from_airport_code || fromCode,
    to_airport_code: body.to_airport_code || toCode,
    depart_date: body.depart_date,
    return_date: body.return_date,
    cabin_class: body.cabin_class || "economy",
    passengers: body.passengers || { adult: 1, child: 0, infant: 0 },
    page_size: body.page_size || 30,
    sort_by: body.sort_by || "price",
  };
  return await callLongxia("/open/v1/flight/search", { method: "POST", body: payload });
});
