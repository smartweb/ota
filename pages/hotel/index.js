import { useState } from "react";
import { useRouter } from "next/router";
import NavBar from "@/components/NavBar";
import { today, dateOffset, prettyDate } from "@/lib/ui";

export default function HotelSearch() {
  const router = useRouter();
  const [destination, setDestination] = useState("");
  const [checkIn, setCheckIn] = useState(dateOffset(1));
  const [checkOut, setCheckOut] = useState(dateOffset(2));
  const [roomCount, setRoomCount] = useState(1);

  const nights =
    (new Date(checkOut.replace(/-/g, "/")) - new Date(checkIn.replace(/-/g, "/"))) /
    (1000 * 60 * 60 * 24);

  const canSearch = destination.trim() && nights >= 1;

  const submit = () => {
    if (!canSearch) return;
    const q = new URLSearchParams({
      destination: destination.trim(),
      check_in: checkIn,
      check_out: checkOut,
      room_count: String(roomCount),
    });
    router.push(`/hotel/list?${q.toString()}`);
  };

  return (
    <div className="page">
      <NavBar title="订酒店" />
      <div className="pt-6 space-y-5">
        <div className="card">
          <div className="text-base text-inksoft mb-2">目的地 / 酒店名</div>
          <input
            className="input-lg"
            placeholder="如 杭州西湖、北京天安门"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
          />
        </div>

        <div className="card space-y-4">
          <div>
            <div className="text-base text-inksoft mb-2">入住日期</div>
            <input
              type="date"
              value={checkIn}
              min={today()}
              onChange={(e) => {
                setCheckIn(e.target.value);
                if (new Date(e.target.value.replace(/-/g, "/")) >= new Date(checkOut.replace(/-/g, "/"))) {
                  const next = new Date(e.target.value.replace(/-/g, "/"));
                  next.setDate(next.getDate() + 1);
                  const p = (n) => String(n).padStart(2, "0");
                  setCheckOut(
                    `${next.getFullYear()}-${p(next.getMonth() + 1)}-${p(next.getDate())}`
                  );
                }
              }}
              className="input-lg"
            />
          </div>
          <div>
            <div className="text-base text-inksoft mb-2">离店日期</div>
            <input
              type="date"
              value={checkOut}
              min={checkIn}
              onChange={(e) => setCheckOut(e.target.value)}
              className="input-lg"
            />
          </div>
          {canSearch && (
            <div className="text-base text-brand font-semibold">
              共 {nights} 晚 · {prettyDate(checkIn)} 入住
            </div>
          )}
        </div>

        <div className="card">
          <div className="text-base text-inksoft mb-3">房间数</div>
          <div className="flex items-center justify-between">
            <span className="text-xl font-bold">房间</span>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setRoomCount((n) => Math.max(1, n - 1))}
                className="w-12 h-12 rounded-full bg-paperdeep text-3xl font-bold active:bg-paperdeep"
              >
                −
              </button>
              <span className="text-2xl font-extrabold w-8 text-center">{roomCount}</span>
              <button
                onClick={() => setRoomCount((n) => Math.min(5, n + 1))}
                className="w-12 h-12 rounded-full bg-brand text-white text-3xl font-bold active:bg-brand-dark"
              >
                ＋
              </button>
            </div>
          </div>
        </div>

        <div className="footer-bar">
          <button className="btn-primary" disabled={!canSearch} onClick={submit}>
            搜索酒店
          </button>
        </div>
      </div>
    </div>
  );
}
