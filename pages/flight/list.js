import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import NavBar from "@/components/NavBar";
import Loading from "@/components/Loading";
import Empty from "@/components/Empty";
import { api, yuan, shortTime, prettyDuration, prettyDate } from "@/lib/ui";

export default function FlightList() {
  const router = useRouter();
  const { from_code, from_city, to_code, to_city, depart_date, adult } = router.query;

  const [loading, setLoading] = useState(true);
  const [flights, setFlights] = useState([]);
  const [err, setErr] = useState("");
  const [sortBy, setSortBy] = useState("price"); // price | time

  useEffect(() => {
    if (!router.isReady) return;
    (async () => {
      setLoading(true);
      setErr("");
      const r = await api("/api/flight/search", {
        from_code,
        to_code,
        depart_date,
        passengers: { adult: Number(adult) || 1, child: 0, infant: 0 },
        sort_by: sortBy,
      });
      setLoading(false);
      if (r.ok) {
        setFlights(r.data?.flights || []);
      } else {
        setErr(r.message);
      }
    })();
  }, [router.isReady, from_code, to_code, depart_date, adult, sortBy]);

  // 合并 flight + cabin，每个 cabin 一行可选
  const rows = [];
  for (const f of flights) {
    const cabins = f.cabins || [];
    for (const c of cabins) {
      rows.push({ flight: f, cabin: c });
    }
  }

  const sorted = [...rows].sort((a, b) => {
    if (sortBy === "price") return (a.cabin.lowest_price || 0) - (b.cabin.lowest_price || 0);
    // time: 按起飞时间
    return (a.flight.dep_time || "").localeCompare(b.flight.dep_time || "");
  });

  const choose = (row) => {
    const { flight, cabin } = row;
    // 缓存所选航段到 sessionStorage，book 页用
    const payload = {
      from_city,
      to_city,
      depart_date,
      adult: Number(adult) || 1,
      flight: {
        flight_no: flight.flight_no,
        airline_name: flight.airline_name,
        dep_city_name: flight.dep_city_name,
        arr_city_name: flight.arr_city_name,
        dep_airport_name: flight.dep_airport_name,
        arr_airport_name: flight.arr_airport_name,
        dep_time: flight.dep_time,
        arr_time: flight.arr_time,
        duration_minutes: flight.duration_minutes,
        stop_count: flight.stop_count,
        aircraft_type: flight.aircraft_type,
      },
      cabin: {
        cabin_name: cabin.cabin_name,
        cabin_code: cabin.cabin_code,
        lowest_price: cabin.lowest_price,
        airport_tax: cabin.airport_tax,
        fuel_tax: cabin.fuel_tax,
        seat_status: cabin.seat_status,
        refund_rule: cabin.refund_rule,
        baggage_rule: cabin.baggage_rule,
      },
      offer_id: cabin.offer_id || "",
      search_offer_id: cabin.search_offer_id || "",
      pricing_required: cabin.pricing_required,
    };
    sessionStorage.setItem("flight_selected", JSON.stringify(payload));
    router.push("/flight/book");
  };

  return (
    <div className="page">
      <NavBar title={`${from_city || ""} → ${to_city || ""}`} />
      <div className="px-1 pt-4 pb-2 flex items-center justify-between">
        <div className="text-lg text-inksoft">{prettyDate(depart_date)}</div>
        <div className="flex gap-2">
          <button
            onClick={() => setSortBy("price")}
            className={`px-4 py-2 rounded-full text-base font-bold ${
              sortBy === "price" ? "bg-brand text-white" : "bg-paperdeep text-inksoft"
            }`}
          >
            价格最低
          </button>
          <button
            onClick={() => setSortBy("time")}
            className={`px-4 py-2 rounded-full text-base font-bold ${
              sortBy === "time" ? "bg-brand text-white" : "bg-paperdeep text-inksoft"
            }`}
          >
            时间最早
          </button>
        </div>
      </div>

      {loading && <Loading text="正在查找航班…" />}
      {!loading && err && (
        <div className="card mt-4 text-center text-brand-deep text-lg">{err}</div>
      )}
      {!loading && !err && sorted.length === 0 && (
        <Empty text="这一天没有合适的航班" icon="✈️" />
      )}

      {!loading && !err && sorted.length > 0 && (
        <div className="space-y-3 pt-2">
          {sorted.map((row, i) => {
            const { flight: f, cabin: c } = row;
            const seatText =
              c.seat_status === "sold_out"
                ? "已售完"
                : c.seat_status === "few"
                ? "余票紧张"
                : "有票";
            return (
              <button
                key={i}
                onClick={() => choose(row)}
                disabled={c.seat_status === "sold_out"}
                className="card w-full text-left active:scale-[0.99] transition-transform disabled:opacity-60"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-lg font-bold text-inksoft">
                    {f.airline_name} {f.flight_no}
                  </span>
                  <span
                    className={`badge ${
                      c.seat_status === "few"
                        ? "status-warn"
                        : c.seat_status === "sold_out"
                        ? "status-cancel"
                        : "status-success"
                    }`}
                  >
                    {seatText}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-center">
                    <div className="text-3xl font-extrabold text-ink">{shortTime(f.dep_time)}</div>
                    <div className="text-base text-inksoft mt-1">
                      {f.dep_city_name} {f.dep_airport_name}
                    </div>
                  </div>

                  <div className="flex-1 mx-3 text-center">
                    <div className="text-base text-inkmute">{prettyDuration(f.duration_minutes)}</div>
                    <div className="flex items-center justify-center text-brand text-xl">✈️ →</div>
                    {f.stop_count > 0 && (
                      <div className="text-base text-brand-deep">经停{f.stop_count}次</div>
                    )}
                  </div>

                  <div className="text-center">
                    <div className="text-3xl font-extrabold text-ink">{shortTime(f.arr_time)}</div>
                    <div className="text-base text-inksoft mt-1">
                      {f.arr_city_name} {f.arr_airport_name}
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-dashed border-brand/15 flex items-end justify-between">
                  <div>
                    <span className="text-lg font-bold text-inksoft">{c.cabin_name}</span>
                    <span className="text-base text-inkmute ml-2">
                      机建{yuan(c.airport_tax, false)} · 燃油{yuan(c.fuel_tax, false)}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-xl text-brand">¥</span>
                    <span className="text-4xl font-extrabold text-brand">
                      {yuan(c.lowest_price, false)}
                    </span>
                    <span className="text-base text-inkmute ml-1">起</span>
                  </div>
                </div>

                {/* 行李规则 + 退票提示 */}
                <div
                  className="mt-3 rounded-xl px-3 py-2 text-base flex items-start gap-2"
                  style={{ background: "#FFF7ED" }}
                >
                  <span className="shrink-0">📌</span>
                  <div className="text-inksoft leading-snug">
                    {c.baggage_rule && <div>行李：{c.baggage_rule}</div>}
                    <div className="mt-0.5">
                      <span className="font-bold">退改：</span>
                      {c.discount_rate >= 3.5
                        ? "票价较高，退改手续费相对较低"
                        : c.discount_rate >= 2.5
                        ? "折扣票，退票有手续费，起飞越早扣得越多"
                        : "特价票，退票费较高，部分可能不可退"}
                      <span className="text-inkmute">（点开可查具体退票金额）</span>
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
