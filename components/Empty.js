export default function Empty({ text = "暂无内容", icon = "🏠" }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-inkmute">
      <div className="text-6xl mb-4">{icon}</div>
      <div className="text-xl">{text}</div>
    </div>
  );
}
