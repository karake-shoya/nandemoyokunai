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
          ? "bg-orange-50 border-orange-300 ring-2 ring-orange-300"
          : "bg-white border-gray-100 hover:border-orange-200"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <span className="text-sm font-semibold text-gray-800">{menu.name}</span>
        <span className="shrink-0 rounded-full bg-orange-100 px-2 py-0.5 text-xs text-orange-700">
          {menu.category}
        </span>
      </div>
      <p className="mt-1.5 text-xs text-gray-500 leading-relaxed">
        {menu.reason}
      </p>
    </button>
  );
}
