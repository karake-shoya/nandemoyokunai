import Link from "next/link";

export default function CtaCard() {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-surface border border-rim p-6 animate-fade-up">
      <div className="pointer-events-none absolute -top-16 -right-16 w-64 h-64 rounded-full bg-ember animate-glow-pulse" />
      <div className="pointer-events-none absolute -bottom-20 -left-10 w-40 h-40 rounded-full bg-gold animate-glow-pulse" style={{ animationDelay: "2s" }} />

      <div className="relative">
        <p className="text-xs font-medium text-mist tracking-widest uppercase mb-2">
          今夜の晩ごはん
        </p>
        <h2 className="font-mincho text-3xl font-bold text-parchment leading-tight mb-1">
          どうする？
        </h2>
        <div className="flex items-center gap-2 my-4">
          <div className="h-px flex-1 bg-edge" />
          <div className="w-1 h-1 rounded-full bg-ember/60" />
          <div className="h-px w-6 bg-edge" />
        </div>
        <p className="text-sm text-mist leading-relaxed mb-6">
          パートナーへの気の利いた返答と、
          <br />
          メニュー候補を提案します
        </p>
        <div className="space-y-2.5">
          <Link
            href="/proposal"
            className="block w-full rounded-xl bg-ember px-4 py-3 text-center text-sm font-semibold text-white hover:bg-flame transition-colors"
          >
            AIに提案してもらう
          </Link>
          <Link
            href="/record"
            className="block w-full rounded-xl border border-rim px-4 py-3 text-center text-sm font-medium text-mist hover:text-parchment hover:border-ember/50 transition-colors"
          >
            食事を記録する
          </Link>
        </div>
      </div>
    </div>
  );
}
