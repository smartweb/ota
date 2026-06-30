const { makeHandler } = require("@/lib/handler");
const { callLongxia } = require("@/lib/longxia");

// 机票订单列表 → POST /open/v1/flight/order/list
export default makeHandler(async (body) => {
  return await callLongxia("/open/v1/flight/order/list", {
    method: "POST",
    body: {
      contact_phone: body.contact_phone,
      external_user_id: body.external_user_id,
      out_trade_no: body.out_trade_no,
      status: body.status,
      start_date: body.start_date,
      end_date: body.end_date,
      page: body.page || 1,
      page_size: body.page_size || 20,
    },
  });
});
