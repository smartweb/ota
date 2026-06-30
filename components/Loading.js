export default function Loading({ text = "正在查询，请稍候…" }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-gray-500">
      <div className="w-12 h-12 border-4 border-brand/20 border-t-brand rounded-full animate-spin mb-4" />
      <div className="text-lg">{text}</div>
    </div>
  );
}
