interface ToolbarProps {
  showElectrons: boolean;
  onToggleElectrons: () => void;
  freezeElectrons: boolean;
  onToggleFreezeElectrons: () => void;
  onClearAll: () => void;
  onUndo: () => void;
  canUndo: boolean;
  atomCount: number;
  bondCount: number;
}

export default function Toolbar({
  showElectrons,
  onToggleElectrons,
  freezeElectrons,
  onToggleFreezeElectrons,
  onClearAll,
  onUndo,
  canUndo,
  atomCount,
  bondCount,
}: ToolbarProps) {
  return (
    <div className="flex items-center gap-2 px-4 py-2 bg-gray-900/95 backdrop-blur-xl border-b border-gray-700/50">
      <div className="flex items-center gap-2 mr-auto">
        <span className="text-2xl">⚛️</span>
        <h1 className="text-white font-bold text-lg hidden sm:block">شبیه‌ساز اتم و پیوند شیمیایی</h1>
        <h1 className="text-white font-bold text-sm sm:hidden">شبیه‌ساز شیمی</h1>
      </div>

      <div className="flex items-center gap-4 text-gray-400 text-xs ml-4">
        <span>🔵 اتم‌ها: {atomCount}</span>
        <span>🔗 پیوندها: {bondCount}</span>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onToggleElectrons}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
            showElectrons
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
              : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
          }`}
          title="نمایش/مخفی کردن الکترون‌ها"
        >
          {showElectrons ? '👁 الکترون‌ها' : '👁‍🗨 الکترون‌ها'}
        </button>

        <button
          onClick={onToggleFreezeElectrons}
          disabled={!showElectrons}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
            freezeElectrons
              ? 'bg-amber-600 text-white shadow-lg shadow-amber-500/30'
              : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
          } disabled:opacity-30 disabled:cursor-not-allowed`}
          title="متوقف/ادامه حرکت الکترون‌ها"
        >
          {freezeElectrons ? '⏸ توقف' : '▶️ حرکت'}
        </button>

        <button
          onClick={onUndo}
          disabled={!canUndo}
          className="px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-800 text-gray-300 hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          title="بازگشت"
        >
          ↩️ بازگشت
        </button>

        <button
          onClick={onClearAll}
          className="px-3 py-1.5 rounded-lg text-xs font-medium bg-red-900/80 text-red-300 hover:bg-red-800 transition-all"
          title="پاک کردن همه"
        >
          🗑 پاک کردن
        </button>
      </div>
    </div>
  );
}
