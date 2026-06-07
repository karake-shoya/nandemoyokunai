export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-night flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <h1 className="font-mincho text-2xl font-bold text-parchment tracking-wide">
            なんでもよくない
          </h1>
          <p className="mt-2 text-sm text-mist">はじめに少し教えてください</p>
        </div>
        <div className="bg-surface rounded-2xl border border-edge p-8">
          {children}
        </div>
      </div>
    </div>
  );
}
