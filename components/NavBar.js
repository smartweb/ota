import { useRouter } from "next/router";

/**
 * 顶部导航栏（大字号、高对比度、带返回）
 * @param {string} title 标题
 * @param {function} [onBack] 自定义返回；默认 router.back()
 * @param {React.ReactNode} [right] 右侧自定义内容
 */
export default function NavBar({ title, onBack, right }) {
  const router = useRouter();
  const handleBack = () => {
    if (onBack) onBack();
    else router.back();
  };
  return (
    <div className="nav-bar">
      <button
        onClick={handleBack}
        aria-label="返回"
        className="w-9 h-9 flex items-center justify-center text-2xl font-bold active:opacity-60"
      >
        ‹
      </button>
      <div className="nav-title">{title}</div>
      <div className="w-9 text-right text-base">{right}</div>
    </div>
  );
}
