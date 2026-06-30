import { useState } from "react";
import { useRouter } from "next/router";
import NavBar from "@/components/NavBar";
import AirportPicker from "@/components/AirportPicker";
import { today, dateOffset } from "@/lib/ui";

export default function FlightSearch() {
  const router = useRouter();
  const [from, setFrom] = useState(null);
  const [to, setTo] = useState(null);
  const [departDate, setDepartDate] = useState(dateOffset(1));
  const [adult, setAdult] = useState(1);

  const canSearch = from && to && departDate && from.code !== to.code;

  const swap = () => {
    setFrom(to);
    setTo(from);
  };

  const submit = () => {
    if (!canSearch) return;
    const q = new URLSearchParams({
      from_code: from.code,
      from_city: from.city || "",
      to_code: to.code,
      to_city: to.city || "",
      depart_date: departDate,
      adult: String(adult),
    });
    router.push(`/flight/list?${q.toString()}`);
  };

  return (
    <div className="page">
      <NavBar title="订机票" />
      <div className="pt-6 space-y-5">
        {/* 出发 / 到达 */}
        <div className="card relative">
          <div className="text-base text-inksoft mb-2">出发城市</div>
          <AirportPicker value={from} onChange={setFrom} placeholder="选择出发城市" />
          <div className="my-4 border-t border-dashed border-brand/15" />
          <div className="text-base text-inksoft mb-2">到达城市</div>
          <AirportPicker value={to} onChange={setTo} placeholder="选择到达城市" />
          {/* 交换按钮 */}
          <button
            onClick={swap}
            aria-label="交换出发和到达"
            className="absolute right-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-brand text-white text-xl flex items-center justify-center shadow-md active:bg-brand-dark"
          >
            ⇅
          </button>
        </div>

        {/* 出发日期 */}
        <div className="card">
          <div className="text-base text-inksoft mb-2">出发日期</div>
          <input
            type="date"
            value={departDate}
            min={today()}
            onChange={(e) => setDepartDate(e.target.value)}
            className="input-lg"
          />
        </div>

        {/* 人数 */}
        <div className="card">
          <div className="text-base text-inksoft mb-3">乘客人数</div>
          <div className="flex items-center justify-between">
            <span className="text-xl font-bold">成人</span>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setAdult((n) => Math.max(1, n - 1))}
                className="w-12 h-12 rounded-full bg-paperdeep text-3xl font-bold text-ink active:bg-paperdeep"
              >
                −
              </button>
              <span className="text-2xl font-extrabold w-8 text-center">{adult}</span>
              <button
                onClick={() => setAdult((n) => Math.min(9, n + 1))}
                className="w-12 h-12 rounded-full bg-brand text-white text-3xl font-bold active:bg-brand-dark"
              >
                ＋
              </button>
            </div>
          </div>
        </div>

        {!canSearch && from && to && from.code === to.code && (
          <div className="text-center text-brand-deep text-lg">出发和到达不能是同一个城市</div>
        )}

        <div className="footer-bar">
          <button className="btn-primary" disabled={!canSearch} onClick={submit}>
            搜索航班
          </button>
        </div>
      </div>
    </div>
  );
}
