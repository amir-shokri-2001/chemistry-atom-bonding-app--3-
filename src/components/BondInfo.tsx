interface BondInfoProps {
  bondType: 'ionic' | 'covalent' | 'none';
  atom1Symbol: string;
  atom2Symbol: string;
  atom1NameFa: string;
  atom2NameFa: string;
  electronegativityDiff: number;
  message?: string;
  onClose: () => void;
}

export default function BondInfo({
  bondType,
  atom1Symbol,
  atom2Symbol,
  atom1NameFa,
  atom2NameFa,
  electronegativityDiff,
  message,
  onClose,
}: BondInfoProps) {
  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 float-in">
      <div
        className={`px-6 py-4 rounded-2xl shadow-2xl border backdrop-blur-xl ${
          bondType === 'covalent'
            ? 'bg-emerald-900/90 border-emerald-500/50'
            : bondType === 'ionic'
            ? 'bg-amber-900/90 border-amber-500/50'
            : 'bg-red-900/90 border-red-500/50'
        }`}
      >
        <div className="flex items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <span className="text-3xl">
              {bondType === 'covalent' ? '🔗' : bondType === 'ionic' ? '⚡' : '🚫'}
            </span>
            <div>
              <h3 className="text-white font-bold text-lg">
                {bondType === 'covalent'
                  ? 'پیوند کووالانسی'
                  : bondType === 'ionic'
                  ? 'پیوند یونی'
                  : 'پیوند ممکن نیست'}
              </h3>
              <p className="text-white/70 text-sm">
                {atom1NameFa} ({atom1Symbol}) و {atom2NameFa} ({atom2Symbol})
              </p>
              <p className="text-white/50 text-xs mt-1">
                اختلاف الکترونگاتیوی: {electronegativityDiff.toFixed(2)}
                {bondType === 'covalent' && ' (کمتر از ۱.۷ → کووالانسی)'}
                {bondType === 'ionic' && ' (بیشتر از ۱.۷ → یونی)'}
              </p>
              {message && (
                <p className={`text-xs mt-1.5 font-medium ${
                  bondType === 'covalent'
                    ? 'text-emerald-300'
                    : bondType === 'ionic'
                    ? 'text-amber-300'
                    : 'text-red-300'
                }`}>
                  {bondType === 'covalent' ? '✨' : bondType === 'ionic' ? '⚡' : '⚠️'} {message}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/60 hover:text-white text-xl transition-colors"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
}
