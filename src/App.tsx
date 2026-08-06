import { useState, useCallback, useRef, useEffect } from 'react';
import AtomPalette from './components/AtomPalette';
import CanvasAtom from './components/CanvasAtom';
import BondInfo from './components/BondInfo';
import Toolbar from './components/Toolbar';
import { atomsDatabase, AtomData, getBondType } from './data/atoms';

export interface PlacedAtom {
  id: string;
  atom: AtomData;
  x: number;
  y: number;
  charge: number;
  currentBonds: number;
  // The actual electron config after bonding (electrons may be removed/added)
  displayElectronConfig: number[];
}

export interface Bond {
  id: string;
  atom1Id: string;
  atom2Id: string;
  type: 'ionic' | 'covalent';
  // For covalent bonds: how many shared electron pairs
  sharedElectrons: number;
}

interface BondNotification {
  bondType: 'ionic' | 'covalent' | 'none';
  atom1: AtomData;
  atom2: AtomData;
  enDiff: number;
  message?: string;
}

let idCounter = 0;
function genId() {
  return `atom-${++idCounter}`;
}

export default function App() {
  const [placedAtoms, setPlacedAtoms] = useState<PlacedAtom[]>([]);
  const [bonds, setBonds] = useState<Bond[]>([]);
  const [selectedAtomId, setSelectedAtomId] = useState<string | null>(null);
  const [showElectrons, setShowElectrons] = useState(true);
  const [freezeElectrons, setFreezeElectrons] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [bondNotification, setBondNotification] = useState<BondNotification | null>(null);
  const [draggingAtom, setDraggingAtom] = useState<AtomData | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [history, setHistory] = useState<{ atoms: PlacedAtom[]; bonds: Bond[] }[]>([]);
  const [draggedCanvasAtomId, setDraggedCanvasAtomId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [touchDragAtom, setTouchDragAtom] = useState<AtomData | null>(null);
  const [touchDragPos, setTouchDragPos] = useState<{ x: number; y: number } | null>(null);

  const svgRef = useRef<SVGSVGElement>(null);
  const notifTimeout = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Save to history
  const saveHistory = useCallback(() => {
    setHistory((prev) => [...prev.slice(-20), { atoms: placedAtoms.map(a => ({...a, displayElectronConfig: [...a.displayElectronConfig]})), bonds: [...bonds] }]);
  }, [placedAtoms, bonds]);

  const undo = useCallback(() => {
    if (history.length === 0) return;
    const last = history[history.length - 1];
    setPlacedAtoms(last.atoms);
    setBonds(last.bonds);
    setHistory((prev) => prev.slice(0, -1));
    setSelectedAtomId(null);
  }, [history]);

  // Get SVG point from mouse/touch event
  const getSVGPoint = useCallback(
    (clientX: number, clientY: number) => {
      if (!svgRef.current) return { x: clientX, y: clientY };
      const svg = svgRef.current;
      const rect = svg.getBoundingClientRect();
      return {
        x: clientX - rect.left,
        y: clientY - rect.top,
      };
    },
    []
  );

  // Handle drag from palette
  const handlePaletteDragStart = useCallback(
    (atom: AtomData, e: React.DragEvent | React.TouchEvent) => {
      setDraggingAtom(atom);
      if ('dataTransfer' in e) {
        e.dataTransfer.setData('text/plain', atom.symbol);
        e.dataTransfer.effectAllowed = 'copy';
      } else {
        const touch = e.touches[0];
        setTouchDragAtom(atom);
        setTouchDragPos({ x: touch.clientX, y: touch.clientY });
      }
    },
    []
  );

  // Handle drop on canvas
  const handleCanvasDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      if (!draggingAtom) return;
      const point = getSVGPoint(e.clientX, e.clientY);
      saveHistory();
      const newAtom: PlacedAtom = {
        id: genId(),
        atom: draggingAtom,
        x: point.x,
        y: point.y,
        charge: 0,
        currentBonds: 0,
        displayElectronConfig: [...draggingAtom.electronConfig],
      };
      setPlacedAtoms((prev) => [...prev, newAtom]);
      setDraggingAtom(null);
    },
    [draggingAtom, getSVGPoint, saveHistory]
  );

  const handleCanvasDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  }, []);

  // Touch move for palette drag
  useEffect(() => {
    if (!touchDragAtom) return;

    const handleTouchMove = (e: TouchEvent) => {
      const touch = e.touches[0];
      setTouchDragPos({ x: touch.clientX, y: touch.clientY });
    };

    const handleTouchEnd = (_e: TouchEvent) => {
      if (touchDragPos && svgRef.current) {
        const point = getSVGPoint(touchDragPos.x, touchDragPos.y);
        const rect = svgRef.current.getBoundingClientRect();
        if (
          touchDragPos.x >= rect.left &&
          touchDragPos.x <= rect.right &&
          touchDragPos.y >= rect.top &&
          touchDragPos.y <= rect.bottom
        ) {
          saveHistory();
          const newAtom: PlacedAtom = {
            id: genId(),
            atom: touchDragAtom,
            x: point.x,
            y: point.y,
            charge: 0,
            currentBonds: 0,
            displayElectronConfig: [...touchDragAtom.electronConfig],
          };
          setPlacedAtoms((prev) => [...prev, newAtom]);
        }
      }
      setTouchDragAtom(null);
      setTouchDragPos(null);
    };

    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleTouchEnd);
    return () => {
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [touchDragAtom, touchDragPos, getSVGPoint, saveHistory]);

  // Canvas atom dragging
  const handleAtomMouseDown = useCallback(
    (atomId: string, e: React.MouseEvent | React.TouchEvent) => {
      const placed = placedAtoms.find((a) => a.id === atomId);
      if (!placed) return;

      let clientX: number, clientY: number;
      if ('touches' in e) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      } else {
        clientX = e.clientX;
        clientY = e.clientY;
      }

      const point = getSVGPoint(clientX, clientY);
      setDragOffset({ x: point.x - placed.x, y: point.y - placed.y });
      setDraggedCanvasAtomId(atomId);
      saveHistory();
    },
    [placedAtoms, getSVGPoint, saveHistory]
  );

  // Mouse/touch move for canvas atom drag
  useEffect(() => {
    if (!draggedCanvasAtomId) return;

    const handleMove = (e: MouseEvent | TouchEvent) => {
      let clientX: number, clientY: number;
      if ('touches' in e) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
        e.preventDefault();
      } else {
        clientX = e.clientX;
        clientY = e.clientY;
      }

      const point = getSVGPoint(clientX, clientY);
      setPlacedAtoms((prev) =>
        prev.map((a) =>
          a.id === draggedCanvasAtomId
            ? { ...a, x: point.x - dragOffset.x, y: point.y - dragOffset.y }
            : a
        )
      );
    };

    const handleUp = () => {
      const draggedAtom = placedAtoms.find((a) => a.id === draggedCanvasAtomId);
      if (draggedAtom) {
        for (const other of placedAtoms) {
          if (other.id === draggedCanvasAtomId) continue;
          const dx = draggedAtom.x - other.x;
          const dy = draggedAtom.y - other.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const bondDist = draggedAtom.atom.radius + other.atom.radius + 20;

          if (dist < bondDist) {
            const bondExists = bonds.some(
              (b) =>
                (b.atom1Id === draggedAtom.id && b.atom2Id === other.id) ||
                (b.atom1Id === other.id && b.atom2Id === draggedAtom.id)
            );
            if (!bondExists) {
              tryCreateBond(draggedAtom, other);
            }
          }
        }
      }
      setDraggedCanvasAtomId(null);
    };

    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleUp);
    window.addEventListener('touchmove', handleMove, { passive: false });
    window.addEventListener('touchend', handleUp);
    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleUp);
      window.removeEventListener('touchmove', handleMove);
      window.removeEventListener('touchend', handleUp);
    };
  }, [draggedCanvasAtomId, dragOffset, placedAtoms, bonds, getSVGPoint]);

  // Helper: remove one electron from outermost shell
  function removeOuterElectron(config: number[]): number[] {
    const newConfig = [...config];
    for (let i = newConfig.length - 1; i >= 0; i--) {
      if (newConfig[i] > 0) {
        newConfig[i]--;
        // If shell becomes empty, remove it (unless it's the only shell)
        if (newConfig[i] === 0 && i > 0) {
          newConfig.splice(i, 1);
        }
        break;
      }
    }
    return newConfig;
  }

  // Helper: add one electron to outermost shell
  function addOuterElectron(config: number[]): number[] {
    const newConfig = [...config];
    const lastShell = newConfig.length - 1;
    const maxForShell = lastShell === 0 ? 2 : 8; // simplified
    if (newConfig[lastShell] < maxForShell) {
      newConfig[lastShell]++;
    } else {
      // New shell
      newConfig.push(1);
    }
    return newConfig;
  }

  // Try to create bond between two atoms
  const tryCreateBond = useCallback(
    (a1: PlacedAtom, a2: PlacedAtom) => {
      const bondType = getBondType(a1.atom, a2.atom);
      const enDiff = Math.abs(a1.atom.electronegativity - a2.atom.electronegativity);

      // Show notification
      if (notifTimeout.current) clearTimeout(notifTimeout.current);

      if (bondType === 'none') {
        setBondNotification({
          bondType: 'none',
          atom1: a1.atom,
          atom2: a2.atom,
          enDiff,
          message: 'گازهای نجیب پیوند تشکیل نمی‌دهند',
        });
        notifTimeout.current = setTimeout(() => setBondNotification(null), 4000);
        return;
      }

      // Check max bonds
      if (a1.currentBonds >= a1.atom.maxBonds || a2.currentBonds >= a2.atom.maxBonds) {
        setBondNotification({
          bondType: 'none',
          atom1: a1.atom,
          atom2: a2.atom,
          enDiff,
          message: `ظرفیت پیوند پر شده (${a1.atom.symbol}: ${a1.currentBonds}/${a1.atom.maxBonds}, ${a2.atom.symbol}: ${a2.currentBonds}/${a2.atom.maxBonds})`,
        });
        notifTimeout.current = setTimeout(() => setBondNotification(null), 4000);
        return;
      }

      // Check if outermost shells have electrons to share/transfer
      const a1OuterElectrons = a1.displayElectronConfig[a1.displayElectronConfig.length - 1];
      const a2OuterElectrons = a2.displayElectronConfig[a2.displayElectronConfig.length - 1];

      const bondId = `bond-${a1.id}-${a2.id}`;

      if (bondType === 'covalent') {
        // COVALENT BOND: each atom contributes 1 electron → shared pair on the bond line
        // Remove 1 valence electron from each atom's display config
        if (a1OuterElectrons < 1 || a2OuterElectrons < 1) {
          setBondNotification({
            bondType: 'none',
            atom1: a1.atom,
            atom2: a2.atom,
            enDiff,
            message: 'الکترون ظرفیتی کافی برای اشتراک وجود ندارد',
          });
          notifTimeout.current = setTimeout(() => setBondNotification(null), 4000);
          return;
        }

        setBonds((prev) => [...prev, { id: bondId, atom1Id: a1.id, atom2Id: a2.id, type: 'covalent', sharedElectrons: 2 }]);

        setPlacedAtoms((prev) =>
          prev.map((atom) => {
            if (atom.id === a1.id) {
              return {
                ...atom,
                currentBonds: atom.currentBonds + 1,
                displayElectronConfig: removeOuterElectron(atom.displayElectronConfig),
              };
            }
            if (atom.id === a2.id) {
              return {
                ...atom,
                currentBonds: atom.currentBonds + 1,
                displayElectronConfig: removeOuterElectron(atom.displayElectronConfig),
              };
            }
            return atom;
          })
        );

        setBondNotification({
          bondType: 'covalent',
          atom1: a1.atom,
          atom2: a2.atom,
          enDiff,
          message: `هر اتم ۱ الکترون به اشتراک می‌گذارد → ۲ الکترون مشترک روی پیوند`,
        });
      } else {
        // IONIC BOND: electron transfers from less electronegative to more electronegative
        const metalAtom = a1.atom.electronegativity < a2.atom.electronegativity ? a1 : a2;
        const nonmetalAtom = a1.atom.electronegativity < a2.atom.electronegativity ? a2 : a1;
        const metalOuterE = metalAtom.displayElectronConfig[metalAtom.displayElectronConfig.length - 1];

        if (metalOuterE < 1) {
          setBondNotification({
            bondType: 'none',
            atom1: a1.atom,
            atom2: a2.atom,
            enDiff,
            message: `${metalAtom.atom.nameFa} الکترون ظرفیتی برای انتقال ندارد`,
          });
          notifTimeout.current = setTimeout(() => setBondNotification(null), 4000);
          return;
        }

        setBonds((prev) => [...prev, { id: bondId, atom1Id: a1.id, atom2Id: a2.id, type: 'ionic', sharedElectrons: 0 }]);

        setPlacedAtoms((prev) =>
          prev.map((atom) => {
            if (atom.id === metalAtom.id) {
              // Metal loses electron → positive charge
              return {
                ...atom,
                currentBonds: atom.currentBonds + 1,
                charge: atom.charge + 1,
                displayElectronConfig: removeOuterElectron(atom.displayElectronConfig),
              };
            }
            if (atom.id === nonmetalAtom.id) {
              // Nonmetal gains electron → negative charge
              return {
                ...atom,
                currentBonds: atom.currentBonds + 1,
                charge: atom.charge - 1,
                displayElectronConfig: addOuterElectron(atom.displayElectronConfig),
              };
            }
            return atom;
          })
        );

        setBondNotification({
          bondType: 'ionic',
          atom1: a1.atom,
          atom2: a2.atom,
          enDiff,
          message: `الکترون از ${metalAtom.atom.nameFa} به ${nonmetalAtom.atom.nameFa} منتقل شد`,
        });
      }

      notifTimeout.current = setTimeout(() => setBondNotification(null), 5000);

      // Snap atoms together at proper distance
      const dx = a2.x - a1.x;
      const dy = a2.y - a1.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const targetDist =
        bondType === 'ionic'
          ? a1.atom.radius + a2.atom.radius + 30
          : a1.atom.radius + a2.atom.radius + 10;

      if (dist > 0 && dist !== targetDist) {
        const scale = targetDist / dist;
        const midX = (a1.x + a2.x) / 2;
        const midY = (a1.y + a2.y) / 2;
        setPlacedAtoms((prev) =>
          prev.map((atom) => {
            if (atom.id === a1.id)
              return { ...atom, x: midX - (dx * scale) / 2, y: midY - (dy * scale) / 2 };
            if (atom.id === a2.id)
              return { ...atom, x: midX + (dx * scale) / 2, y: midY + (dy * scale) / 2 };
            return atom;
          })
        );
      }
    },
    []
  );

  // Handle atom click for selection-based bonding
  const handleAtomClick = useCallback(
    (atomId: string) => {
      if (draggedCanvasAtomId) return;

      if (selectedAtomId === null) {
        setSelectedAtomId(atomId);
      } else if (selectedAtomId === atomId) {
        setSelectedAtomId(null);
      } else {
        const a1 = placedAtoms.find((a) => a.id === selectedAtomId);
        const a2 = placedAtoms.find((a) => a.id === atomId);
        if (a1 && a2) {
          const bondExists = bonds.some(
            (b) =>
              (b.atom1Id === a1.id && b.atom2Id === a2.id) ||
              (b.atom1Id === a2.id && b.atom2Id === a1.id)
          );
          if (!bondExists) {
            saveHistory();
            tryCreateBond(a1, a2);
          }
        }
        setSelectedAtomId(null);
      }
    },
    [selectedAtomId, placedAtoms, bonds, draggedCanvasAtomId, saveHistory, tryCreateBond]
  );

  const handleCanvasClick = useCallback(() => {
    setSelectedAtomId(null);
  }, []);

  // Delete selected atom
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedAtomId) {
        saveHistory();
        // When deleting, restore electrons for connected bonds
        const connectedBonds = bonds.filter(
          (b) => b.atom1Id === selectedAtomId || b.atom2Id === selectedAtomId
        );
        // Remove bonds and restore partner atoms' electrons
        setPlacedAtoms((prev) => {
          let updated = prev.filter((a) => a.id !== selectedAtomId);
          for (const bond of connectedBonds) {
            const partnerId = bond.atom1Id === selectedAtomId ? bond.atom2Id : bond.atom1Id;
            updated = updated.map((a) => {
              if (a.id === partnerId) {
                let newConfig = [...a.displayElectronConfig];
                let newCharge = a.charge;
                if (bond.type === 'covalent') {
                  // Restore the shared electron back
                  newConfig = addOuterElectron(newConfig);
                } else {
                  // Ionic: reverse the transfer
                  const partnerAtom = prev.find((pa) => pa.id === partnerId);
                  const deletedAtom = prev.find((pa) => pa.id === selectedAtomId);
                  if (partnerAtom && deletedAtom) {
                    if (partnerAtom.atom.electronegativity > deletedAtom.atom.electronegativity) {
                      // Partner was the nonmetal (gained electron) → remove it
                      newConfig = removeOuterElectron(newConfig);
                      newCharge = newCharge + 1;
                    } else {
                      // Partner was the metal (lost electron) → add it back
                      newConfig = addOuterElectron(newConfig);
                      newCharge = newCharge - 1;
                    }
                  }
                }
                return {
                  ...a,
                  currentBonds: Math.max(0, a.currentBonds - 1),
                  displayElectronConfig: newConfig,
                  charge: newCharge,
                };
              }
              return a;
            });
          }
          return updated;
        });
        setBonds((prev) =>
          prev.filter((b) => b.atom1Id !== selectedAtomId && b.atom2Id !== selectedAtomId)
        );
        setSelectedAtomId(null);
      }
      if (e.key === 'z' && (e.ctrlKey || e.metaKey)) {
        undo();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedAtomId, bonds, saveHistory, undo]);

  const clearAll = useCallback(() => {
    saveHistory();
    setPlacedAtoms([]);
    setBonds([]);
    setSelectedAtomId(null);
  }, [saveHistory]);

  // Render bonds
  const renderBonds = () => {
    return bonds.map((bond) => {
      const a1 = placedAtoms.find((a) => a.id === bond.atom1Id);
      const a2 = placedAtoms.find((a) => a.id === bond.atom2Id);
      if (!a1 || !a2) return null;

      const dx = a2.x - a1.x;
      const dy = a2.y - a1.y;
      const len = Math.sqrt(dx * dx + dy * dy);
      const nx = len > 0 ? -dy / len : 0;
      const ny = len > 0 ? dx / len : 0;

      if (bond.type === 'covalent') {
        return (
          <g key={bond.id} className="bond-line">
            {/* Main bond line */}
            <line
              x1={a1.x}
              y1={a1.y}
              x2={a2.x}
              y2={a2.y}
              stroke="url(#covalentGradient)"
              strokeWidth={4}
              strokeLinecap="round"
            />
            {/* Shared electron pair on the bond line - these are the electrons that were removed from atoms */}
            <circle
              cx={(a1.x + a2.x) / 2 + nx * 7}
              cy={(a1.y + a2.y) / 2 + ny * 7}
              r={4}
              fill="#60A5FA"
              stroke="#93C5FD"
              strokeWidth={1.5}
              className={freezeElectrons ? '' : 'atom-glow'}
              style={{ color: '#60A5FA' }}
            />
            <circle
              cx={(a1.x + a2.x) / 2 - nx * 7}
              cy={(a1.y + a2.y) / 2 - ny * 7}
              r={4}
              fill="#60A5FA"
              stroke="#93C5FD"
              strokeWidth={1.5}
              className={freezeElectrons ? '' : 'atom-glow'}
              style={{ color: '#60A5FA' }}
            />
            {/* Label */}
            <rect
              x={(a1.x + a2.x) / 2 - 32}
              y={(a1.y + a2.y) / 2 - 26}
              width={64}
              height={16}
              rx={4}
              fill="rgba(0,0,0,0.6)"
            />
            <text
              x={(a1.x + a2.x) / 2}
              y={(a1.y + a2.y) / 2 - 15}
              textAnchor="middle"
              fill="rgba(52, 211, 153, 0.9)"
              fontSize={10}
              fontWeight="bold"
              fontFamily="Vazirmatn, sans-serif"
            >
              کووالانسی
            </text>
            {/* Small label for shared electrons */}
            <text
              x={(a1.x + a2.x) / 2}
              y={(a1.y + a2.y) / 2 + 20}
              textAnchor="middle"
              fill="rgba(96, 165, 250, 0.7)"
              fontSize={8}
              fontFamily="Vazirmatn, sans-serif"
            >
              ۲e⁻ مشترک
            </text>
          </g>
        );
      } else {
        // Ionic bond
        const metalToNonmetal = a1.atom.electronegativity < a2.atom.electronegativity;
        const arrowDx = metalToNonmetal ? dx / (len || 1) : -dx / (len || 1);
        const arrowDy = metalToNonmetal ? dy / (len || 1) : -dy / (len || 1);
        const midX = (a1.x + a2.x) / 2;
        const midY = (a1.y + a2.y) / 2;

        return (
          <g key={bond.id} className="bond-line ionic-bond-line">
            <line
              x1={a1.x}
              y1={a1.y}
              x2={a2.x}
              y2={a2.y}
              stroke="url(#ionicGradient)"
              strokeWidth={3}
              strokeDasharray="8 5"
              strokeLinecap="round"
            />
            {/* Arrow showing electron transfer direction */}
            <polygon
              points={`${midX + arrowDx * 10},${midY + arrowDy * 10} ${midX - arrowDx * 5 + arrowDy * 6},${midY - arrowDy * 5 - arrowDx * 6} ${midX - arrowDx * 5 - arrowDy * 6},${midY - arrowDy * 5 + arrowDx * 6}`}
              fill="#FBBF24"
              opacity={0.9}
            />
            {/* Labels */}
            <rect
              x={midX - 20}
              y={midY - 28}
              width={40}
              height={16}
              rx={4}
              fill="rgba(0,0,0,0.6)"
            />
            <text
              x={midX}
              y={midY - 17}
              textAnchor="middle"
              fill="rgba(251, 191, 36, 0.9)"
              fontSize={10}
              fontWeight="bold"
              fontFamily="Vazirmatn, sans-serif"
            >
              یونی
            </text>
            <text
              x={midX}
              y={midY + 22}
              textAnchor="middle"
              fill="rgba(251, 191, 36, 0.6)"
              fontSize={9}
              fontFamily="monospace"
            >
              e⁻ →
            </text>
          </g>
        );
      }
    });
  };

  // Count total electrons for info panel
  const getTotalDisplayElectrons = (config: number[]) => config.reduce((s, c) => s + c, 0);

  return (
    <div style={{ width: '100vw', height: '100vh' }} className="flex flex-col bg-gray-950 overflow-hidden">
      <Toolbar
        showElectrons={showElectrons}
        onToggleElectrons={() => setShowElectrons(!showElectrons)}
        freezeElectrons={freezeElectrons}
        onToggleFreezeElectrons={() => setFreezeElectrons(!freezeElectrons)}
        onClearAll={clearAll}
        onUndo={undo}
        canUndo={history.length > 0}
        atomCount={placedAtoms.length}
        bondCount={bonds.length}
      />

      <div className="flex-1 flex overflow-hidden relative">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="absolute top-3 right-3 z-40 bg-gray-800 text-white p-2 rounded-lg shadow-lg hover:bg-gray-700 transition-all"
          style={{ display: sidebarOpen ? 'none' : 'block' }}
        >
          ⚛️ عناصر
        </button>

        {/* Main Canvas */}
        <div
          className="flex-1 relative canvas-area"
          onDragOver={handleCanvasDragOver}
          onDrop={handleCanvasDrop}
        >
          {/* Instructions overlay */}
          {placedAtoms.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
              <div className="text-center p-8 rounded-3xl bg-gray-800/50 backdrop-blur-sm border border-gray-700/30 max-w-lg">
                <p className="text-5xl mb-4">🧪</p>
                <h2 className="text-white text-xl font-bold mb-3">شبیه‌ساز اتم و پیوند شیمیایی</h2>
                <p className="text-gray-400 text-sm mb-2">
                  عناصر را از پنل سمت راست بکشید و روی صفحه رها کنید
                </p>
                <p className="text-gray-400 text-sm mb-2">
                  دو اتم را نزدیک هم بیاورید تا پیوند تشکیل شود
                </p>
                <p className="text-gray-400 text-sm mb-2">
                  یا روی دو اتم کلیک کنید تا با هم پیوند بزنند
                </p>
                <div className="mt-4 p-3 bg-gray-700/30 rounded-xl">
                  <p className="text-emerald-400 text-xs mb-1.5">🔗 <strong>پیوند کووالانسی:</strong> اختلاف الکترونگاتیوی &lt; 1.7 → الکترون‌ها به اشتراک گذاشته می‌شوند</p>
                  <p className="text-amber-400 text-xs mb-1.5">⚡ <strong>پیوند یونی:</strong> اختلاف الکترونگاتیوی ≥ 1.7 → الکترون از فلز به نافلز منتقل می‌شود</p>
                  <p className="text-blue-400 text-xs">💡 <strong>نکته:</strong> بعد از پیوند، الکترون‌ها از اتم‌ها کم/اضافه می‌شوند</p>
                </div>
                <div className="mt-3 text-xs text-gray-600">
                  <span>Delete: حذف اتم انتخابی | Ctrl+Z: بازگشت</span>
                </div>
              </div>
            </div>
          )}

          {/* Bond notification */}
          {bondNotification && (
            <BondInfo
              bondType={bondNotification.bondType}
              atom1Symbol={bondNotification.atom1.symbol}
              atom2Symbol={bondNotification.atom2.symbol}
              atom1NameFa={bondNotification.atom1.nameFa}
              atom2NameFa={bondNotification.atom2.nameFa}
              electronegativityDiff={bondNotification.enDiff}
              message={bondNotification.message}
              onClose={() => setBondNotification(null)}
            />
          )}

          {/* SVG Canvas */}
          <svg
            ref={svgRef}
            className="w-full h-full"
            onClick={handleCanvasClick}
          >
            <defs>
              <linearGradient id="covalentGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#34D399" />
                <stop offset="50%" stopColor="#60A5FA" />
                <stop offset="100%" stopColor="#34D399" />
              </linearGradient>
              <linearGradient id="ionicGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#EF4444" />
                <stop offset="50%" stopColor="#FBBF24" />
                <stop offset="100%" stopColor="#3B82F6" />
              </linearGradient>
            </defs>

            {renderBonds()}

            {placedAtoms.map((pa) => (
              <CanvasAtom
                key={pa.id}
                id={pa.id}
                atom={pa.atom}
                x={pa.x}
                y={pa.y}
                charge={pa.charge !== 0 ? pa.charge : undefined}
                isSelected={selectedAtomId === pa.id}
                onMouseDown={handleAtomMouseDown}
                onClick={handleAtomClick}
                showElectrons={showElectrons}
                freezeElectrons={freezeElectrons}
                displayElectronConfig={pa.displayElectronConfig}
              />
            ))}
          </svg>

          {/* Selection info panel */}
          {selectedAtomId && (() => {
            const selected = placedAtoms.find(a => a.id === selectedAtomId);
            if (!selected) return null;
            const totalOriginal = selected.atom.electronConfig.reduce((s, c) => s + c, 0);
            const totalCurrent = getTotalDisplayElectrons(selected.displayElectronConfig);
            const electronChange = totalCurrent - totalOriginal;
            return (
              <div className="absolute bottom-4 left-4 z-30 bg-gray-900/95 backdrop-blur-xl rounded-2xl p-4 border border-gray-700/50 shadow-2xl float-in min-w-[240px]">
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg"
                    style={{ backgroundColor: selected.atom.color + 'AA' }}
                  >
                    {selected.atom.symbol}
                  </div>
                  <div>
                    <h3 className="text-white font-bold">{selected.atom.nameFa}</h3>
                    <p className="text-gray-400 text-xs">{selected.atom.name}</p>
                  </div>
                </div>
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between text-gray-300">
                    <span>عدد اتمی:</span>
                    <span className="font-mono text-white">{selected.atom.atomicNumber}</span>
                  </div>
                  <div className="flex justify-between text-gray-300">
                    <span>الکترونگاتیوی:</span>
                    <span className="font-mono text-white">{selected.atom.electronegativity}</span>
                  </div>
                  <div className="flex justify-between text-gray-300">
                    <span>آرایش اصلی:</span>
                    <span className="font-mono text-white text-[10px]">
                      [{selected.atom.electronConfig.join(', ')}]
                    </span>
                  </div>
                  <div className="flex justify-between text-gray-300">
                    <span>آرایش فعلی:</span>
                    <span className={`font-mono text-[10px] font-bold ${electronChange !== 0 ? 'text-yellow-400' : 'text-white'}`}>
                      [{selected.displayElectronConfig.join(', ')}]
                    </span>
                  </div>
                  <div className="flex justify-between text-gray-300">
                    <span>الکترون‌ها:</span>
                    <span className="font-mono text-white">
                      {totalCurrent}
                      {electronChange !== 0 && (
                        <span className={electronChange > 0 ? 'text-blue-400' : 'text-red-400'}>
                          {' '}({electronChange > 0 ? `+${electronChange}` : electronChange})
                        </span>
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between text-gray-300">
                    <span>پیوندها:</span>
                    <span className="font-mono text-white">
                      {selected.currentBonds} / {selected.atom.maxBonds}
                    </span>
                  </div>
                  {selected.charge !== 0 && (
                    <div className="flex justify-between text-gray-300">
                      <span>بار الکتریکی:</span>
                      <span className={`font-mono font-bold ${selected.charge > 0 ? 'text-red-400' : 'text-blue-400'}`}>
                        {selected.charge > 0 ? `+${selected.charge}` : selected.charge}
                      </span>
                    </div>
                  )}
                </div>
                {electronChange !== 0 && (
                  <div className="mt-2 p-2 bg-gray-800/80 rounded-lg">
                    <p className="text-yellow-300/80 text-[10px]">
                      {electronChange < 0
                        ? `⚠️ ${Math.abs(electronChange)} الکترون از این اتم ${selected.currentBonds > 0 && selected.charge > 0 ? 'منتقل شده' : 'به اشتراک گذاشته شده'}`
                        : `✅ ${electronChange} الکترون به این اتم اضافه شده`
                      }
                    </p>
                  </div>
                )}
                <div className="mt-3 flex gap-2">
                  <button
                    onClick={() => {
                      saveHistory();
                      const connectedBonds = bonds.filter(
                        (b) => b.atom1Id === selectedAtomId || b.atom2Id === selectedAtomId
                      );
                      setPlacedAtoms((prev) => {
                        let updated = prev.filter((a) => a.id !== selectedAtomId);
                        for (const bond of connectedBonds) {
                          const partnerId = bond.atom1Id === selectedAtomId ? bond.atom2Id : bond.atom1Id;
                          updated = updated.map((a) => {
                            if (a.id === partnerId) {
                              let newConfig = [...a.displayElectronConfig];
                              let newCharge = a.charge;
                              if (bond.type === 'covalent') {
                                newConfig = addOuterElectron(newConfig);
                              } else {
                                const partnerAtom = prev.find((pa) => pa.id === partnerId);
                                const deletedAtom = prev.find((pa) => pa.id === selectedAtomId);
                                if (partnerAtom && deletedAtom) {
                                  if (partnerAtom.atom.electronegativity > deletedAtom.atom.electronegativity) {
                                    newConfig = removeOuterElectron(newConfig);
                                    newCharge = newCharge + 1;
                                  } else {
                                    newConfig = addOuterElectron(newConfig);
                                    newCharge = newCharge - 1;
                                  }
                                }
                              }
                              return { ...a, currentBonds: Math.max(0, a.currentBonds - 1), displayElectronConfig: newConfig, charge: newCharge };
                            }
                            return a;
                          });
                        }
                        return updated;
                      });
                      setBonds((prev) =>
                        prev.filter((b) => b.atom1Id !== selectedAtomId && b.atom2Id !== selectedAtomId)
                      );
                      setSelectedAtomId(null);
                    }}
                    className="flex-1 px-3 py-1.5 rounded-lg text-xs bg-red-900/80 text-red-300 hover:bg-red-800 transition-all"
                  >
                    🗑 حذف
                  </button>
                  <button
                    onClick={() => setSelectedAtomId(null)}
                    className="flex-1 px-3 py-1.5 rounded-lg text-xs bg-gray-800 text-gray-300 hover:bg-gray-700 transition-all"
                  >
                    لغو انتخاب
                  </button>
                </div>
                <p className="text-gray-500 text-[10px] mt-2 text-center">
                  💡 روی اتم دیگری کلیک کنید تا پیوند بزنید
                </p>
              </div>
            );
          })()}

          {/* Legend */}
          <div className="absolute bottom-4 right-4 z-20 bg-gray-900/80 backdrop-blur-sm rounded-xl p-3 border border-gray-700/30">
            <div className="flex flex-col gap-1.5 text-xs">
              <div className="flex items-center gap-2 text-gray-300">
                <div className="w-6 h-1 bg-gradient-to-r from-emerald-400 via-blue-400 to-emerald-400 rounded-full"></div>
                <span>پیوند کووالانسی (اشتراک e⁻)</span>
              </div>
              <div className="flex items-center gap-2 text-gray-300">
                <div className="w-6 h-1 bg-gradient-to-r from-red-500 via-amber-400 to-blue-500 rounded-full"></div>
                <span>پیوند یونی (انتقال e⁻)</span>
              </div>
              <div className="flex items-center gap-2 text-blue-400 mt-1">
                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                <span>الکترون</span>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div
          className={`transition-all duration-300 ${
            sidebarOpen ? 'w-64 min-w-[256px]' : 'w-0 min-w-0 overflow-hidden'
          }`}
        >
          {sidebarOpen && (
            <div className="h-full flex flex-col relative">
              <button
                onClick={() => setSidebarOpen(false)}
                className="absolute top-3 left-3 z-50 text-gray-400 hover:text-white transition-colors text-sm bg-gray-800 rounded-full w-6 h-6 flex items-center justify-center"
              >
                ✕
              </button>
              <AtomPalette
                atoms={atomsDatabase}
                onDragStart={handlePaletteDragStart}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                selectedCategory={selectedCategory}
                onCategoryChange={setSelectedCategory}
              />
            </div>
          )}
        </div>
      </div>

      {/* Touch drag ghost */}
      {touchDragAtom && touchDragPos && (
        <div
          className="fixed z-[9999] pointer-events-none"
          style={{
            left: touchDragPos.x - 25,
            top: touchDragPos.y - 25,
          }}
        >
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-2xl opacity-80"
            style={{ backgroundColor: touchDragAtom.color }}
          >
            {touchDragAtom.symbol}
          </div>
        </div>
      )}
    </div>
  );
}
