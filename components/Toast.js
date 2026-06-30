import { useEffect, useState, useCallback } from "react";

// 极简 Toast：单例，全局通过 useToast 使用
let setterRef = null;

export function toast(message, duration = 2500) {
  if (setterRef) setterRef({ message, id: Date.now() });
}

export default function ToastHost() {
  const [state, setState] = useState(null);

  useEffect(() => {
    setterRef = (s) => {
      setState(s);
      if (s) {
        setTimeout(() => setState(null), 2500);
      }
    };
    return () => {
      setterRef = null;
    };
  }, []);

  if (!state) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
      <div className="bg-black/85 text-white text-lg px-6 py-4 rounded-2xl max-w-[80%] text-center">
        {state.message}
      </div>
    </div>
  );
}
