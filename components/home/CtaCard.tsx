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
    </div>
  );
}
