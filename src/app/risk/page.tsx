'use client';

import { Sidebar } from '@/components/layout/Sidebar';
import { useDiagnosticStore } from '@/lib/store';
import { CAPABILITY_NAMES } from '@/lib/types';
import {
    calculateMetaIndices,
    calculateTopRisks,
    compositeScore,
    maturityLevel,
    detectSinglePointsOfFailure,
} from '@/lib/engine';
import { AlertTriangle, Shield, TrendingUp, Activity } from 'lucide-react';

export default function RiskPage() {
    const store = useDiagnosticStore();
    const engagement = store.getActiveEngagement();

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

    const indices = calculateMetaIndices(engagement);
    const topRisks = calculateTopRisks(engagement);
    const spofs = detectSinglePointsOfFailure(engagement.dependencies);

    // Critical assumptions across all 9 capabilities
    const criticalAssumptions = engagement.assessments.flatMap(a =>
        a.assumptions
            .filter(as => !as.validated && (as.revenueLinked || as.highDependency))
            .map(as => ({ capability: a.name, ...as }))
    );

    // All 9 capability maturity ratings
    const maturitySnapshot = engagement.assessments.map(a => ({
        name: a.name,
        score: compositeScore(a),
        level: maturityLevel(compositeScore(a)),
        riskLevel: a.riskLevel,
    }));

    const indexColor = (value: number, inverted = false) => {
        const isGood = inverted ? value < 2.5 : value >= 3.5;
        const isBad = inverted ? value >= 3.5 : value < 2.5;
        return isGood ? 'text-emerald-400' : isBad ? 'text-red-400' : 'text-amber-400';
    };

    const maturityColor = (level: string) => {
        switch (level) {
            case 'Fragile': return 'text-red-400 bg-red-500/10 border-red-500/20';
            case 'Developing': return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
            case 'Structured': return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
            case 'Institutionalized': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
            default: return 'text-gray-400';
        }
    };

    return (
        <div className="flex h-screen bg-[#050505] text-white overflow-hidden">
            <Sidebar />

            <main className="flex-1 overflow-y-auto ml-64">
                <header className="h-16 border-b border-white/10 flex items-center justify-between px-8 bg-[#0a0a0a]/50 backdrop-blur-md sticky top-0 z-10">
                    <div>
                        <h1 className="text-lg font-medium">Risk Synthesis</h1>
                        <p className="text-xs text-gray-500">{engagement.clientName} — System-Wide Analysis</p>
                    </div>
                </header>

                <div className="p-6 max-w-5xl space-y-8">

                    {/* Meta-Index Cards */}
                    <div>
                        <h2 className="text-xs text-gray-500 uppercase tracking-wider mb-4">System Meta-Indices</h2>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <MetaCard
                                icon={<TrendingUp className="w-5 h-5" />}
                                label="Strategic Clarity"
                                value={indices.strategicClarity}
                                detail="Business Design + Product Strategy + Economics clarity"
                                color={indexColor(indices.strategicClarity)}
                            />
                            <MetaCard
                                icon={<Shield className="w-5 h-5" />}
                                label="Structural Soundness"
                                value={indices.structuralSoundness}
                                detail="Operating Model + Governance + Technology structure"
                                color={indexColor(indices.structuralSoundness)}
                            />
                            <MetaCard
                                icon={<Activity className="w-5 h-5" />}
                                label="Execution Readiness"
                                value={indices.executionReadiness}
                                detail="Evidence scores + Process maturity + Adoption clarity"
                                color={indexColor(indices.executionReadiness)}
                            />
                            <MetaCard
                                icon={<AlertTriangle className="w-5 h-5" />}
                                label="Risk Exposure"
                                value={indices.riskExposure}
                                detail="High-risk flags + Stress failures + Critical assumptions"
                                color={indexColor(indices.riskExposure, true)}
                                inverted
                            />
                        </div>
                    </div>

                    {/* Capability Maturity Snapshot — All 9 */}
                    <div>
                        <h2 className="text-xs text-gray-500 uppercase tracking-wider mb-4">Capability Maturity Snapshot — All 9</h2>
                        <div className="glass-card rounded-xl border border-white/10 overflow-hidden">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="bg-white/5 text-xs uppercase text-gray-500">
                                        <th className="p-3 text-left">#</th>
                                        <th className="p-3 text-left">Capability</th>
                                        <th className="p-3 text-center">Score</th>
                                        <th className="p-3 text-center">Maturity</th>
                                        <th className="p-3 text-center">Risk</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {maturitySnapshot.map((m, i) => (
                                        <tr key={m.name} className="border-t border-white/5">
                                            <td className="p-3 text-gray-500">{i + 1}</td>
                                            <td className="p-3 text-gray-300 font-medium">{m.name}</td>
                                            <td className="p-3 text-center">
                                                <span className={m.score <= 2 ? 'text-red-400' : m.score <= 3 ? 'text-amber-400' : m.score <= 4 ? 'text-blue-400' : 'text-emerald-400'}>
                                                    {m.score.toFixed(1)}
                                                </span>
                                            </td>
                                            <td className="p-3 text-center">
                                                <span className={`px-2.5 py-1 rounded-md text-xs font-medium border ${maturityColor(m.level)}`}>
                                                    {m.level}
                                                </span>
                                            </td>
                                            <td className="p-3 text-center">
                                                <span className={`text-xs font-medium ${m.riskLevel === 'High' ? 'text-red-400' : m.riskLevel === 'Medium' ? 'text-amber-400' : 'text-emerald-400'}`}>
                                                    {m.riskLevel}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Top 5 Structural Risks */}
                    <div>
                        <h2 className="text-xs text-gray-500 uppercase tracking-wider mb-4">Top 5 Structural Risks</h2>
                        {topRisks.length === 0 ? (
                            <p className="text-sm text-gray-600">Complete assessments to generate risk rankings.</p>
                        ) : (
                            <div className="space-y-3">
                                {topRisks.map(risk => (
                                    <div key={risk.rank} className="glass-card rounded-xl border border-white/10 p-4 flex items-center gap-4">
                                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg font-bold shrink-0 ${risk.rank <= 2 ? 'bg-red-500/20 text-red-400' : risk.rank <= 4 ? 'bg-amber-500/20 text-amber-400' : 'bg-white/10 text-gray-400'
                                            }`}>
                                            {risk.rank}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="text-sm font-medium text-white">{risk.title}</div>
                                            <div className="text-xs text-gray-500 mt-0.5">{risk.description}</div>
                                        </div>
                                        <div className="text-right shrink-0">
                                            <div className="text-lg font-light text-red-400">{risk.score}</div>
                                            <div className="text-[10px] text-gray-600 uppercase">Risk Score</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Critical Assumptions */}
                    <div>
                        <h2 className="text-xs text-gray-500 uppercase tracking-wider mb-4">
                            Critical Assumptions ({criticalAssumptions.length})
                        </h2>
                        {criticalAssumptions.length === 0 ? (
                            <p className="text-sm text-gray-600">No unvalidated critical assumptions found. Add assumptions in the Assessment module.</p>
                        ) : (
                            <div className="glass-card rounded-xl border border-white/10 overflow-hidden">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="bg-white/5 text-xs uppercase text-gray-500">
                                            <th className="p-3 text-left">Capability</th>
                                            <th className="p-3 text-left">Assumption</th>
                                            <th className="p-3 text-center">Revenue-Linked</th>
                                            <th className="p-3 text-center">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {criticalAssumptions.map(a => (
                                            <tr key={a.id} className="border-t border-white/5">
                                                <td className="p-3 text-amber-400 text-xs font-medium">{a.capability}</td>
                                                <td className="p-3 text-gray-300">{a.text || 'Untitled assumption'}</td>
                                                <td className="p-3 text-center">
                                                    {a.revenueLinked && <span className="text-amber-400 text-xs">Yes</span>}
                                                </td>
                                                <td className="p-3 text-center">
                                                    <span className="text-red-400 text-xs font-medium">Unvalidated</span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    {/* Single Points of Failure */}
                    {spofs.length > 0 && (
                        <div>
                            <h2 className="text-xs text-gray-500 uppercase tracking-wider mb-4">Single Points of Systemic Fragility</h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                {spofs.map(name => (
                                    <div key={name} className="glass-card rounded-xl border border-red-500/20 p-4 flex items-center gap-3">
                                        <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                                        <span className="text-sm text-red-300">{name}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}

// ─── Meta Card ──────────────────────────────────────────────────

function MetaCard({
    icon,
    label,
    value,
    detail,
    color,
    inverted = false,
}: {
    icon: React.ReactNode;
    label: string;
    value: number;
    detail: string;
    color: string;
    inverted?: boolean;
}) {
    return (
        <div className="glass-card p-5 rounded-xl border border-white/10">
            <div className="flex items-center gap-2 mb-3">
                <span className={color}>{icon}</span>
                <span className="text-xs text-gray-500 uppercase tracking-wider">{label}</span>
            </div>
            <div className={`text-3xl font-light ${color}`}>
                {value.toFixed(1)}
                <span className="text-sm text-gray-500 ml-1">/ 5</span>
            </div>
            <p className="text-xs text-gray-600 mt-2">{detail}</p>
        </div>
    );
}
