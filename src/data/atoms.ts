export interface AtomData {
  symbol: string;
  name: string;
  nameFa: string;
  atomicNumber: number;
  electronConfig: number[]; // electrons per shell
  valenceElectrons: number;
  electronegativity: number;
  color: string;
  radius: number; // visual radius
  category: 'nonmetal' | 'metal' | 'metalloid' | 'noble-gas' | 'halogen';
  maxBonds: number;
}

export const atomsDatabase: AtomData[] = [
  {
    symbol: 'H',
    name: 'Hydrogen',
    nameFa: 'هیدروژن',
    atomicNumber: 1,
    electronConfig: [1],
    valenceElectrons: 1,
    electronegativity: 2.2,
    color: '#FFFFFF',
    radius: 30,
    category: 'nonmetal',
    maxBonds: 1,
  },
  {
    symbol: 'He',
    name: 'Helium',
    nameFa: 'هلیوم',
    atomicNumber: 2,
    electronConfig: [2],
    valenceElectrons: 2,
    electronegativity: 0,
    color: '#D9FFFF',
    radius: 28,
    category: 'noble-gas',
    maxBonds: 0,
  },
  {
    symbol: 'Li',
    name: 'Lithium',
    nameFa: 'لیتیم',
    atomicNumber: 3,
    electronConfig: [2, 1],
    valenceElectrons: 1,
    electronegativity: 0.98,
    color: '#CC80FF',
    radius: 38,
    category: 'metal',
    maxBonds: 1,
  },
  {
    symbol: 'Be',
    name: 'Beryllium',
    nameFa: 'بریلیم',
    atomicNumber: 4,
    electronConfig: [2, 2],
    valenceElectrons: 2,
    electronegativity: 1.57,
    color: '#C2FF00',
    radius: 34,
    category: 'metal',
    maxBonds: 2,
  },
  {
    symbol: 'B',
    name: 'Boron',
    nameFa: 'بور',
    atomicNumber: 5,
    electronConfig: [2, 3],
    valenceElectrons: 3,
    electronegativity: 2.04,
    color: '#FFB5B5',
    radius: 32,
    category: 'metalloid',
    maxBonds: 3,
  },
  {
    symbol: 'C',
    name: 'Carbon',
    nameFa: 'کربن',
    atomicNumber: 6,
    electronConfig: [2, 4],
    valenceElectrons: 4,
    electronegativity: 2.55,
    color: '#909090',
    radius: 34,
    category: 'nonmetal',
    maxBonds: 4,
  },
  {
    symbol: 'N',
    name: 'Nitrogen',
    nameFa: 'نیتروژن',
    atomicNumber: 7,
    electronConfig: [2, 5],
    valenceElectrons: 5,
    electronegativity: 3.04,
    color: '#3050F8',
    radius: 32,
    category: 'nonmetal',
    maxBonds: 3,
  },
  {
    symbol: 'O',
    name: 'Oxygen',
    nameFa: 'اکسیژن',
    atomicNumber: 8,
    electronConfig: [2, 6],
    valenceElectrons: 6,
    electronegativity: 3.44,
    color: '#FF0D0D',
    radius: 30,
    category: 'nonmetal',
    maxBonds: 2,
  },
  {
    symbol: 'F',
    name: 'Fluorine',
    nameFa: 'فلوئور',
    atomicNumber: 9,
    electronConfig: [2, 7],
    valenceElectrons: 7,
    electronegativity: 3.98,
    color: '#90E050',
    radius: 28,
    category: 'halogen',
    maxBonds: 1,
  },
  {
    symbol: 'Ne',
    name: 'Neon',
    nameFa: 'نئون',
    atomicNumber: 10,
    electronConfig: [2, 8],
    valenceElectrons: 8,
    electronegativity: 0,
    color: '#B3E3F5',
    radius: 30,
    category: 'noble-gas',
    maxBonds: 0,
  },
  {
    symbol: 'Na',
    name: 'Sodium',
    nameFa: 'سدیم',
    atomicNumber: 11,
    electronConfig: [2, 8, 1],
    valenceElectrons: 1,
    electronegativity: 0.93,
    color: '#AB5CF2',
    radius: 40,
    category: 'metal',
    maxBonds: 1,
  },
  {
    symbol: 'Mg',
    name: 'Magnesium',
    nameFa: 'منیزیم',
    atomicNumber: 12,
    electronConfig: [2, 8, 2],
    valenceElectrons: 2,
    electronegativity: 1.31,
    color: '#8AFF00',
    radius: 38,
    category: 'metal',
    maxBonds: 2,
  },
  {
    symbol: 'Al',
    name: 'Aluminum',
    nameFa: 'آلومینیم',
    atomicNumber: 13,
    electronConfig: [2, 8, 3],
    valenceElectrons: 3,
    electronegativity: 1.61,
    color: '#BFA6A6',
    radius: 36,
    category: 'metal',
    maxBonds: 3,
  },
  {
    symbol: 'Si',
    name: 'Silicon',
    nameFa: 'سیلیکون',
    atomicNumber: 14,
    electronConfig: [2, 8, 4],
    valenceElectrons: 4,
    electronegativity: 1.9,
    color: '#F0C8A0',
    radius: 34,
    category: 'metalloid',
    maxBonds: 4,
  },
  {
    symbol: 'P',
    name: 'Phosphorus',
    nameFa: 'فسفر',
    atomicNumber: 15,
    electronConfig: [2, 8, 5],
    valenceElectrons: 5,
    electronegativity: 2.19,
    color: '#FF8000',
    radius: 32,
    category: 'nonmetal',
    maxBonds: 3,
  },
  {
    symbol: 'S',
    name: 'Sulfur',
    nameFa: 'گوگرد',
    atomicNumber: 16,
    electronConfig: [2, 8, 6],
    valenceElectrons: 6,
    electronegativity: 2.58,
    color: '#FFFF30',
    radius: 32,
    category: 'nonmetal',
    maxBonds: 2,
  },
  {
    symbol: 'Cl',
    name: 'Chlorine',
    nameFa: 'کلر',
    atomicNumber: 17,
    electronConfig: [2, 8, 7],
    valenceElectrons: 7,
    electronegativity: 3.16,
    color: '#1FF01F',
    radius: 30,
    category: 'halogen',
    maxBonds: 1,
  },
  {
    symbol: 'Ar',
    name: 'Argon',
    nameFa: 'آرگون',
    atomicNumber: 18,
    electronConfig: [2, 8, 8],
    valenceElectrons: 8,
    electronegativity: 0,
    color: '#80D1E3',
    radius: 34,
    category: 'noble-gas',
    maxBonds: 0,
  },
  {
    symbol: 'K',
    name: 'Potassium',
    nameFa: 'پتاسیم',
    atomicNumber: 19,
    electronConfig: [2, 8, 8, 1],
    valenceElectrons: 1,
    electronegativity: 0.82,
    color: '#8F40D4',
    radius: 44,
    category: 'metal',
    maxBonds: 1,
  },
  {
    symbol: 'Ca',
    name: 'Calcium',
    nameFa: 'کلسیم',
    atomicNumber: 20,
    electronConfig: [2, 8, 8, 2],
    valenceElectrons: 2,
    electronegativity: 1.0,
    color: '#3DFF00',
    radius: 42,
    category: 'metal',
    maxBonds: 2,
  },
];

export function getBondType(atom1: AtomData, atom2: AtomData): 'ionic' | 'covalent' | 'none' {
  if (atom1.category === 'noble-gas' || atom2.category === 'noble-gas') return 'none';
  
  const enDiff = Math.abs(atom1.electronegativity - atom2.electronegativity);
  
  if (enDiff >= 1.7) return 'ionic';
  return 'covalent';
}

export function getCategoryColor(category: string): string {
  switch (category) {
    case 'metal': return 'from-purple-500 to-blue-500';
    case 'nonmetal': return 'from-green-500 to-teal-500';
    case 'metalloid': return 'from-yellow-500 to-orange-500';
    case 'noble-gas': return 'from-cyan-400 to-blue-400';
    case 'halogen': return 'from-lime-500 to-green-500';
    default: return 'from-gray-400 to-gray-500';
  }
}

export function getCategoryName(category: string): string {
  switch (category) {
    case 'metal': return 'فلز';
    case 'nonmetal': return 'نافلز';
    case 'metalloid': return 'شبه‌فلز';
    case 'noble-gas': return 'گاز نجیب';
    case 'halogen': return 'هالوژن';
    default: return '';
  }
}
