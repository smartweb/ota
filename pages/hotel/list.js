import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import NavBar from "@/components/NavBar";
import Loading from "@/components/Loading";
import Empty from "@/components/Empty";
import { api, yuan, prettyDate } from "@/lib/ui";

export default function HotelList() {
  const router = useRouter();
  const { destination, check_in, check_out, room_count } = router.query;

  const [loading, setLoading] = useState(true);
  const [hotels, setHotels] = useState([]);
  const [err, setErr] = useState("");
  const [sortBy, setSortBy] = useState("best");

  useEffect(() => {
    if (!router.isReady) return;
    (async () => {
      setLoading(true);
      setErr("");
      const r = await api("/api/hotel/search", {
        destination,
        check_in,
        check_out,
        room_count: Number(room_count) || 1,
        sort_by: sortBy,
      });
      setLoading(false);
      if (r.ok) {
        setHotels(r.data?.hotels || []);
      } else {
        setErr(r.message);
      }
    })();
  }, [router.isReady, destination, check_in, check_out, room_count, sortBy]);

  const starTag = (t) => {
    const m = { 经济型: "经济型", 舒适型: "舒适型", 高档型: "高档", 豪华型: "豪华" };
    return m[t] || t || "";
  };

  const choose = (h) => {
    const q = new URLSearchParams({
      destination,
      check_in,
      check_out,
      room_count,
      search_offer_id: h.search_offer_id,
      hotel_name: h.hotel_name || h.name || "",
      hotel_addr: h.address || "",
      star_tag: h.star_tag || "",
    });
    router.push(`/hotel/rooms?${q.toString()}`);
  };

  return (
    <div className="page">
      <NavBar title={`酒店 · ${destination || ""}`} />
      <div className="px-1 pt-4 pb-2 flex items-center justify-between">
        <div className="text-lg text-inksoft">
          {prettyDate(check_in)} - {prettyDate(check_out)}
        </div>
        <div className="flex gap-2">
          {[
            { k: "best", t: "推荐" },
            { k: "price", t: "价格" },
            { k: "rating", t: "评分" },
          ].map((s) => (
            <button
              key={s.k}
              onClick={() => setSortBy(s.k)}
              className={`px-4 py-2 rounded-full text-base font-bold ${
                sortBy === s.k ? "bg-brand text-white" : "bg-paperdeep text-inksoft"
              }`}
            >
              {s.t}
            </button>
          ))}
        </div>
      </div>

      {loading && <Loading text="正在查找酒店…" />}
      {!loading && err && <div className="card mt-4 text-center text-brand-deep text-lg">{err}</div>}
      {!loading && !err && hotels.length === 0 && <Empty text="没有找到合适的酒店" icon="🏨" />}

      {!loading && !err && hotels.length > 0 && (
        <div className="space-y-3 pt-2">
          {hotels.map((h, i) => (
            <button
              key={h.search_offer_id || i}
              onClick={() => choose(h)}
              className="card w-full text-left active:scale-[0.99] transition-transform"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="text-2xl font-extrabold text-ink">
                    {h.hotel_name || h.name}
                  </div>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    {h.star_tag && (
                      <span className="badge bg-blue-50 text-blue-700">{starTag(h.star_tag)}</span>
                    )}
                    {typeof h.star_rating === "number" && h.star_rating > 0 && (
                      <span className="text-base text-brand-deep">★ {h.star_rating}</span>
                    )}
                    {h.scene_tags && h.scene_tags.length > 0 && (
                      <span className="badge bg-green-50 text-green-700">
                        {h.scene_tags[0]}
                      </span>
                    )}
                  </div>
                  {h.address && (
                    <div className="text-base text-inksoft mt-2">📍 {h.address}</div>
                  )}
                  {typeof h.distance_km === "number" && (
                    <div className="text-base text-inkmute mt-1">
                      距您 {h.distance_km.toFixed(1)} 公里
                    </div>
                  )}
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-dashed border-brand/15 flex items-end justify-end">
                <div className="text-right">
                  <span className="text-base text-inkmute">¥</span>
                  <span className="text-4xl font-extrabold text-brand">
                    {yuan(h.min_price, false)}
                  </span>
                  <span className="text-base text-inkmute ml-1">/晚 起</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
