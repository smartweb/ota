import { useEffect, useRef, useState } from "react";
import { api } from "@/lib/ui";

/**
 * 机场/城市联想选择器
 * 用法：<AirportPicker value={...} onChange={...} placeholder="出发城市" />
 * value 形如 { code: "SZX", label: "深圳宝安国际机场", city: "深圳" }
 */
export default function AirportPicker({ value, onChange, placeholder }) {
  const [open, setOpen] = useState(false);
  const [kw, setKw] = useState("");
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const tRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    if (!kw.trim()) {
      setList([]);
      return;
    }
    setLoading(true);
    clearTimeout(tRef.current);
    tRef.current = setTimeout(async () => {
      const r = await api("/api/airport/search", { keyword: kw.trim() });
      setLoading(false);
      if (r.ok && r.data) {
        // 兼容 airports / list 两种返回字段名
        setList(r.data.airports || r.data.list || r.data.items || []);
      } else {
        setList([]);
      }
    }, 300);
    return () => clearTimeout(tRef.current);
  }, [kw, open]);

  const pick = (item) => {
    const val = {
      // 龙虾机场搜索实际返回 airport_code / city_code / airport_name / city_name
      code: item.airport_code || item.iata_code || item.code || item.city_code,
      label: item.airport_name || item.name || item.city_name,
      city: item.city_name || item.city || item.city_code,
    };
    onChange && onChange(val);
    setOpen(false);
    setKw("");
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="w-full min-h-touch bg-paperdeep border-2 border-brand/15 rounded-xl px-4 flex items-center justify-between active:bg-paperdeep"
      >
        <span className={value ? "text-xl font-bold text-ink" : "text-lg text-inkmute"}>
          {value ? value.city || value.label : placeholder}
        </span>
        <span className="text-brand text-base font-semibold">选择 ›</span>
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-40 bg-black/40 flex items-end" onClick={() => setOpen(false)}>
      <div
        className="bg-white w-full rounded-t-3xl max-h-[75vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b border-brand/10">
          <div className="flex items-center gap-3 mb-3">
            <button onClick={() => setOpen(false)} className="text-inkmute text-lg">
              ✕
            </button>
            <span className="text-xl font-bold flex-1">{placeholder}</span>
          </div>
          <input
            autoFocus
            value={kw}
            onChange={(e) => setKw(e.target.value)}
            placeholder="输入城市名或机场，如 深圳 / 北京"
            className="input-lg"
          />
        </div>
        <div className="overflow-y-auto flex-1">
          {loading && <div className="text-center py-8 text-inkmute text-lg">查询中…</div>}
          {!loading && kw.trim() && list.length === 0 && (
            <div className="text-center py-8 text-inkmute text-lg">没有找到，换个关键词</div>
          )}
          {!loading &&
            list.map((item, i) => (
              <button
                key={i}
                onClick={() => pick(item)}
                className="w-full text-left px-5 py-4 border-b border-brand/10 active:bg-brand-light flex items-center justify-between"
              >
                <div>
                  <div className="text-xl font-bold text-ink">
                    {item.city_name || item.city}
                    <span className="text-inkmute text-base font-normal ml-2">
                      {item.name || item.airport_name}
                    </span>
                  </div>
                </div>
                <div className="text-brand font-bold text-lg">
                  {item.airport_code || item.iata_code || item.code || item.city_code}
                </div>
              </button>
            ))}
        </div>
      </div>
    </div>
  );
}
