import Link from "next/link";
import { primaryButtonClass } from "@/lib/styles";

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
      <Link href="/proposal" className={primaryButtonClass + " block text-center"}>
        提案してもらう
      </Link>
      <Link
        href="/record"
        className="mt-2 block w-full rounded-lg border border-gray-200 px-4 py-2.5 text-center text-sm font-medium text-gray-500 hover:border-orange-300 hover:text-orange-600 transition-colors"
      >
        食事を記録する
      </Link>
    </div>
  );
}
