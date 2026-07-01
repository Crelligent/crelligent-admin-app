'use client';

import { useState } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { useDiagnosticStore } from '@/lib/store';
import { type DependencyEdge, type CapabilityName, CAPABILITY_NAMES } from '@/lib/types';
import { detectSinglePointsOfFailure } from '@/lib/engine';
import { AlertTriangle, Info } from 'lucide-react';

const SHORT_NAMES: Record<CapabilityName, string> = {
    'Business Design': 'BD',
    'Product Strategy': 'PS',
    'Customer & Service Design': 'CS',
    'Data & Intelligence': 'DI',
    'Operating Model & Processes': 'OM',
    'Technology & Platform': 'TP',
    'Governance, Risk & Control': 'GR',
    'Economics & Value Engineering': 'EV',
    'Change, Adoption & Behaviour': 'CA',
};

export default function DependenciesPage() {
    const store = useDiagnosticStore();
    const engagement = store.getActiveEngagement();
    const [hoveredCell, setHoveredCell] = useState<{ from: number; to: number } | null>(null);

    if (!engagement) {
        return (
            <div className="flex h-screen bg-[#050505] text-white overflow-hidden">
                <Sidebar />
                <main className="flex-1 flex items-center justify-center">
                    <p className="text-gray-500">No active engagement. Create a client from the Dashboard first.</p>
                </main>
            </div>
        );
    }

    const { dependencies } = engagement;
    const spofs = detectSinglePointsOfFailure(dependencies);

    const getEdge = (from: CapabilityName, to: CapabilityName): DependencyEdge | undefined => {
        return dependencies.find(d => d.from === from && d.to === to);
    };

    const cycleWeight = (from: CapabilityName, to: CapabilityName) => {
        const existing = getEdge(from, to);
        let newDeps: DependencyEdge[];

        if (!existing) {
            newDeps = [...dependencies, { from, to, weight: 1, description: '' }];
        } else if (existing.weight < 3) {
            newDeps = dependencies.map(d =>
                d.from === from && d.to === to ? { ...d, weight: d.weight + 1 } : d
            );
        } else {
            newDeps = dependencies.filter(d => !(d.from === from && d.to === to));
        }

        store.updateEngagement({ ...engagement, dependencies: newDeps });
    };

    const weightColor = (w: number) => {
        if (w === 1) return 'bg-blue-500/30 text-blue-400 border-blue-500/30';
        if (w === 2) return 'bg-amber-500/30 text-amber-400 border-amber-500/30';
        return 'bg-red-500/30 text-red-400 border-red-500/30';
    };

    const weightLabel = (w: number) => {
        if (w === 1) return 'Low';
        if (w === 2) return 'Med';
        return 'Crit';
    };

    const inboundCount = (name: CapabilityName) =>
        dependencies.filter(d => d.to === name).reduce((s, d) => s + d.weight, 0);
    const outboundCount = (name: CapabilityName) =>
        dependencies.filter(d => d.from === name).reduce((s, d) => s + d.weight, 0);

    const isHighlighted = (fromIdx: number, toIdx: number): boolean => {
        if (!hoveredCell) return false;
        const hovFrom = CAPABILITY_NAMES[hoveredCell.from];
        const hovTo = CAPABILITY_NAMES[hoveredCell.to];
        const from = CAPABILITY_NAMES[fromIdx];
        const to = CAPABILITY_NAMES[toIdx];
        if (from === hovFrom && to === hovTo) return true;
        if (hovTo === from && getEdge(from, to)) return true;
        return false;
    };

    return (
        <div className="flex h-screen bg-[#050505] text-white overflow-hidden">
            <Sidebar />

            <main className="flex-1 overflow-y-auto ml-64">
                <header className="h-16 border-b border-white/10 flex items-center justify-between px-8 bg-[#0a0a0a]/50 backdrop-blur-md sticky top-0 z-10">
                    <div>
                        <h1 className="text-lg font-medium">Interdependency Mapping</h1>
                        <p className="text-xs text-gray-500">{engagement.clientName} — All 9 Capabilities</p>
                    </div>
                    <div className="text-xs text-gray-500">
                        {dependencies.length} dependencies mapped
                    </div>
                </header>

                <div className="p-6">
                    {/* Legend */}
                    <div className="flex items-center gap-6 mb-6 text-xs text-gray-500">
                        <span className="flex items-center gap-2">
                            <Info className="w-3.5 h-3.5" />
                            Click a cell to cycle: None → Low → Medium → Critical → None
                        </span>
                        <span className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded bg-blue-500/30 border border-blue-500/30"></span> Low
                        </span>
                        <span className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded bg-amber-500/30 border border-amber-500/30"></span> Medium
                        </span>
                        <span className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded bg-red-500/30 border border-red-500/30"></span> Critical
                        </span>
                    </div>

                    {/* Dependency Matrix */}
                    <div className="glass-card rounded-xl border border-white/10 overflow-x-auto">
                        <table className="w-full text-xs">
                            <thead>
                                <tr>
                                    <th className="p-3 text-left text-gray-500 border-b border-r border-white/10 bg-white/5 sticky left-0 z-10 min-w-[140px]">
                                        <div className="text-[10px]">ROW depends on COL →</div>
                                    </th>
                                    {CAPABILITY_NAMES.map((name) => (
                                        <th key={name} className={`p-3 text-center border-b border-white/10 min-w-[60px] ${spofs.includes(name) ? 'bg-red-500/10' : 'bg-white/5'}`}>
                                            <div className="font-medium">{SHORT_NAMES[name]}</div>
                                        </th>
                                    ))}
                                    <th className="p-3 text-center border-b border-l border-white/10 bg-white/5 min-w-[50px]">
                                        <div className="text-gray-500">Out</div>
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {CAPABILITY_NAMES.map((fromName, fromIdx) => (
                                    <tr key={fromName}>
                                        <td className={`p-3 border-r border-b border-white/10 sticky left-0 z-10 ${spofs.includes(fromName) ? 'bg-red-500/10' : 'bg-[#050505]'}`}>
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium text-gray-300">{SHORT_NAMES[fromName]}</span>
                                                <span className="text-gray-600 hidden lg:inline">{fromName}</span>
                                                {spofs.includes(fromName) && (
                                                    <AlertTriangle className="w-3 h-3 text-red-400" />
                                                )}
                                            </div>
                                        </td>
                                        {CAPABILITY_NAMES.map((toName, toIdx) => {
                                            const isSelf = fromIdx === toIdx;
                                            const edge = getEdge(fromName, toName);
                                            const highlighted = isHighlighted(fromIdx, toIdx);

                                            return (
                                                <td
                                                    key={toName}
                                                    className={`p-1 border-b border-white/10 text-center ${isSelf ? 'bg-white/3' : highlighted ? 'bg-white/10' : ''
                                                        }`}
                                                    onMouseEnter={() => !isSelf && setHoveredCell({ from: fromIdx, to: toIdx })}
                                                    onMouseLeave={() => setHoveredCell(null)}
                                                >
                                                    {isSelf ? (
                                                        <span className="text-gray-700">—</span>
                                                    ) : (
                                                        <button
                                                            onClick={() => cycleWeight(fromName, toName)}
                                                            aria-label={`Set dependency: ${fromName} → ${toName}`}
                                                            className={`w-full h-8 rounded transition-colors ${edge
                                                                    ? weightColor(edge.weight)
                                                                    : 'text-gray-700 hover:bg-white/5'
                                                                }`}
                                                        >
                                                            {edge ? weightLabel(edge.weight) : '·'}
                                                        </button>
                                                    )}
                                                </td>
                                            );
                                        })}
                                        <td className="p-3 border-b border-l border-white/10 text-center text-gray-400">
                                            {outboundCount(fromName) || '—'}
                                        </td>
                                    </tr>
                                ))}
                                <tr>
                                    <td className="p-3 border-r border-white/10 sticky left-0 z-10 bg-[#050505] text-gray-500 font-medium">In ↓</td>
                                    {CAPABILITY_NAMES.map(name => (
                                        <td key={name} className="p-3 text-center text-gray-400">
                                            {inboundCount(name) || '—'}
                                        </td>
                                    ))}
                                    <td></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    {/* Single Points of Failure */}
                    {spofs.length > 0 && (
                        <div className="mt-6 glass-card rounded-xl border border-red-500/20 p-5">
                            <h3 className="text-sm font-semibold text-red-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                                <AlertTriangle className="w-4 h-4" />
                                Single Points of Failure Detected
                            </h3>
                            <div className="space-y-2">
                                {spofs.map(name => (
                                    <div key={name} className="flex items-center justify-between bg-red-500/10 rounded-lg px-4 py-2.5">
                                        <span className="text-sm text-red-300">{name}</span>
                                        <span className="text-xs text-red-400">
                                            Inbound weight: {inboundCount(name)}
                                        </span>
                                    </div>
                                ))}
                            </div>
                            <p className="text-xs text-gray-500 mt-3">
                                These capabilities have high inbound dependency weight. Failure in any of these areas would cascade across the system.
                            </p>
                        </div>
                    )}

                    {/* Dependency Summary */}
                    <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="glass-card p-5 rounded-xl">
                            <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">Total Dependencies</div>
                            <div className="text-2xl font-light">{dependencies.length}</div>
                        </div>
                        <div className="glass-card p-5 rounded-xl">
                            <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">Critical Dependencies</div>
                            <div className="text-2xl font-light text-red-400">
                                {dependencies.filter(d => d.weight === 3).length}
                            </div>
                        </div>
                        <div className="glass-card p-5 rounded-xl">
                            <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">Failure Points</div>
                            <div className="text-2xl font-light text-amber-400">{spofs.length}</div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
