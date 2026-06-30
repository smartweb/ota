import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import NavBar from "@/components/NavBar";
import Loading from "@/components/Loading";
import Empty from "@/components/Empty";
import { api, yuan, bedTypeText, prettyDate } from "@/lib/ui";

export default function HotelRooms() {
  const router = useRouter();
  const { search_offer_id, destination, check_in, check_out, room_count, hotel_name, hotel_addr } =
    router.query;

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    if (!router.isReady || !search_offer_id) return;
    (async () => {
      setLoading(true);
      const r = await api("/api/hotel/rooms", { search_offer_id });
      setLoading(false);
      if (r.ok) setData(r.data);
      else setErr(r.message);
    })();
  }, [router.isReady, search_offer_id]);

  const nights =
    check_in && check_out
      ? (new Date(check_out.replace(/-/g, "/")) - new Date(check_in.replace(/-/g, "/"))) /
        (1000 * 60 * 60 * 24)
      : 1;

  const choose = (roomType, product) => {
    const payload = {
      destination,
      check_in,
      check_out,
      room_count: Number(room_count) || 1,
      nights,
      hotel_name: hotel_name || (data && data.hotel_name),
      hotel_addr,
      room_name: roomType.room_name,
      bed_type: roomType.bed_type,
      area: roomType.area,
      product: {
        offer_id: product.offer_id,
        price: product.price,
        product_name: product.product_name,
        has_breakfast: product.has_breakfast,
        cancel_policy: product.cancel_policy,
        refundable: product.refundable,
      },
    };
    sessionStorage.setItem("hotel_selected", JSON.stringify(payload));
    router.push("/hotel/book");
  };

  return (
    <div className="page">
      <NavBar title={hotel_name || "选择房型"} />
      <div className="px-1 pt-4 text-lg text-inksoft">
        {prettyDate(check_in)} - {prettyDate(check_out)} · {nights}晚 · {room_count}间
      </div>
      {hotel_addr && <div className="px-1 pt-1 text-base text-inkmute">📍 {hotel_addr}</div>}

      {loading && <Loading text="正在查询实时房态…" />}
      {!loading && err && <div className="card mt-4 text-center text-brand-deep text-lg">{err}</div>}
      {!loading && !err && (!data || !data.room_types || data.room_types.length === 0) && (
        <Empty text="没有可预订的房型" icon="🛏️" />
      )}

      {!loading && !err && data && data.room_types && (
        <div className="space-y-5 mt-4">
          {data.room_types.map((rt, ri) => (
            <div key={ri} className="card">
              <div className="flex items-center justify-between">
                <div className="text-2xl font-extrabold text-ink">{rt.room_name}</div>
              </div>
              <div className="text-base text-inksoft mt-1">
                {bedTypeText(rt.bed_type)}
                {rt.area ? ` · ${rt.area}㎡` : ""}
              </div>
              {rt.facilities && rt.facilities.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {rt.facilities.slice(0, 6).map((f, fi) => (
                    <span key={fi} className="badge bg-paperdeep text-inksoft">
                      {f}
                    </span>
                  ))}
                </div>
              )}

              {/* 产品列表 */}
              <div className="mt-4 space-y-3">
                {(rt.products || []).map((p, pi) => (
                  <button
                    key={pi}
                    onClick={() => choose(rt, p)}
                    className="w-full text-left border-2 border-brand/10 rounded-xl p-4 active:border-brand active:bg-brand-light transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-lg font-bold text-ink">
                        {p.product_name || (p.has_breakfast ? "含早餐" : "无早餐")}
                      </div>
                      <div className="text-brand">
                        <span className="text-base font-bold">¥</span>
                        <span className="text-3xl font-extrabold">{yuan(p.price, false)}</span>
                        <span className="text-base text-inkmute ml-1">/晚</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-base flex-wrap">
                      <span
                        className={`badge ${
                          p.has_breakfast ? "status-success" : "status-cancel"
                        }`}
                      >
                        {p.has_breakfast ? "🍚 含早餐" : "无早餐"}
                      </span>
                    </div>
                    {/* 取消政策：醒目展示，老人选房型时就能看到 */}
                    <div
                      className={`mt-3 rounded-lg px-3 py-2 text-base flex items-center gap-2 ${
                        p.refundable ? "bg-emerald-50" : "bg-amber-50"
                      }`}
                    >
                      <span className="shrink-0">{p.refundable ? "✅" : "⚠️"}</span>
                      <span className={p.refundable ? "text-emerald-700" : "text-amber-800"}>
                        {p.cancel_policy || (p.refundable ? "可免费取消" : "不可取消")}
                      </span>
                    </div>
                    <div className="mt-2 text-right text-base text-inkmute">
                      {nights}晚 × {room_count}间 ={" "}
                      <span className="text-brand font-bold">
                        ¥{yuan(p.price * nights * Number(room_count || 1), false)}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
