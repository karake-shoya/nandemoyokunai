export default function CtaCard() {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-orange-100 p-6">
      <div className="text-4xl mb-3">🍽️</div>
      <h2 className="text-xl font-bold text-gray-800 mb-1">
        今日の晩ごはん、どうする？
      </h2>
      <p className="text-sm text-gray-500 mb-5">
        パートナーへの気の利いた返答と、メニュー候補を提案します
      </p>
      <div className="w-full rounded-lg bg-gray-200 px-4 py-2.5 text-sm font-medium text-gray-400 text-center cursor-not-allowed">
        提案してもらう（近日公開）
      </div>
    </div>
  );
}
