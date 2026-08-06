import React from 'react';
import { AtomData, getCategoryColor, getCategoryName } from '../data/atoms';

interface AtomPaletteProps {
  atoms: AtomData[];
  onDragStart: (atom: AtomData, e: React.DragEvent | React.TouchEvent) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedCategory: string;
  onCategoryChange: (cat: string) => void;
}

const categories = [
  { key: 'all', label: 'همه' },
  { key: 'metal', label: 'فلزات' },
  { key: 'nonmetal', label: 'نافلزات' },
  { key: 'metalloid', label: 'شبه‌فلزات' },
  { key: 'halogen', label: 'هالوژن‌ها' },
  { key: 'noble-gas', label: 'گازهای نجیب' },
];

export default function AtomPalette({
  atoms,
  onDragStart,
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
}: AtomPaletteProps) {
  const filteredAtoms = atoms.filter((a) => {
    const matchSearch =
      a.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.nameFa.includes(searchQuery) ||
      a.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCategory = selectedCategory === 'all' || a.category === selectedCategory;
    return matchSearch && matchCategory;
  });

  return (
    <div className="flex flex-col h-full bg-gray-900/95 backdrop-blur-xl border-l border-gray-700/50">
      <div className="p-3 border-b border-gray-700/50">
        <h2 className="text-white font-bold text-lg mb-3 flex items-center gap-2">
          <span className="text-2xl">⚛️</span>
          جدول عناصر
        </h2>
        <input
          type="text"
          placeholder="🔍 جستجوی عنصر..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div className="flex flex-wrap gap-1 p-3 border-b border-gray-700/50">
        {categories.map((cat) => (
          <button
            key={cat.key}
            onClick={() => onCategoryChange(cat.key)}
            className={`px-2 py-1 rounded-md text-xs font-medium transition-all ${
              selectedCategory === cat.key
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        <div className="grid grid-cols-3 gap-2">
          {filteredAtoms.map((atom) => (
            <div
              key={atom.symbol}
              draggable
              onDragStart={(e) => onDragStart(atom, e)}
              onTouchStart={(e) => onDragStart(atom, e)}
              className={`relative flex flex-col items-center p-2 rounded-xl bg-gradient-to-br ${getCategoryColor(
                atom.category
              )} cursor-grab active:cursor-grabbing hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl group`}
              title={`${atom.nameFa} (${atom.name})`}
            >
              <span className="text-[10px] text-white/70 absolute top-1 right-1.5 font-mono">
                {atom.atomicNumber}
              </span>
              <span className="text-xl font-bold text-white mt-1">{atom.symbol}</span>
              <span className="text-[10px] text-white/80 mt-0.5">{atom.nameFa}</span>
              <span className="text-[8px] text-white/50 mt-0.5">
                {getCategoryName(atom.category)}
              </span>
            </div>
          ))}
        </div>
        {filteredAtoms.length === 0 && (
          <div className="text-center text-gray-400 py-8">
            <p className="text-3xl mb-2">🔬</p>
            <p className="text-sm">عنصری یافت نشد</p>
          </div>
        )}
      </div>
    </div>
  );
}
