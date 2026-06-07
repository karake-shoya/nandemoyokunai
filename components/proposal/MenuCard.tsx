type Props = {
  menu: { name: string; category: string; reason: string };
  isSelected: boolean;
  onSelect: () => void;
};

export default function MenuCard({ menu, isSelected, onSelect }: Props) {
  return (
    <button
      onClick={onSelect}
      className={`w-full text-left rounded-xl border p-4 transition-all ${
        isSelected
          ? "bg-coal border-ember ring-1 ring-ember/40"
          : "bg-surface border-edge hover:border-rim hover:bg-raised"
      }`}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <span className="text-sm font-semibold text-parchment leading-snug">
          {menu.name}
        </span>
        <span className="shrink-0 rounded-full bg-gold/15 px-2 py-0.5 text-xs text-gold">
          {menu.category}
        </span>
      </div>
      <p className="text-xs text-mist leading-relaxed">{menu.reason}</p>
    </button>
  );
}
