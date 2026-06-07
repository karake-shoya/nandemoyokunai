export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-night px-4">
      <div className="w-full max-w-md animate-fade-up">
        <div className="text-center mb-8">
          <h1 className="font-mincho text-2xl font-bold text-parchment tracking-wide">
            なんでもよくない
          </h1>
          <p className="mt-2 text-sm text-mist">今日の晩ごはん、一緒に決めよう</p>
        </div>
        <div className="bg-surface rounded-2xl border border-edge p-8">
          {children}
        </div>
      </div>
    </div>
  );
}
