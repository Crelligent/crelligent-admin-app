'use client';

import { Sidebar } from '@/components/layout/Sidebar';
import { useDiagnosticStore } from '@/lib/store';
import { CAPABILITY_NAMES } from '@/lib/types';
import {
    calculateMetaIndices,
    calculateTopRisks,
    generateWorkshopAgenda,
    generateWeaknessSummary,
    generatePhase1Priorities,
    compositeScore,
    maturityLevel,
    detectSinglePointsOfFailure,
} from '@/lib/engine';
import { FileText, Clock, AlertTriangle, Target, BookOpen, Shield, Layers, Printer } from 'lucide-react';

export default function ReportsPage() {
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
    const agenda = generateWorkshopAgenda(engagement);
    const weaknessSummary = generateWeaknessSummary(engagement);
    const phase1Priorities = generatePhase1Priorities(engagement);
    const spofs = detectSinglePointsOfFailure(engagement.dependencies);

    // All 9 capability maturity levels
    const maturitySnapshot = engagement.assessments.map(a => ({
        name: a.name,
        score: compositeScore(a),
        level: maturityLevel(compositeScore(a)),
    }));

    // Critical assumptions tagged by capability
    const critAssumptions = engagement.assessments.flatMap(a =>
        a.assumptions
            .filter(as => !as.validated && (as.revenueLinked || as.highDependency))
            .map(as => ({ capability: a.name, text: as.text, revenueLinked: as.revenueLinked }))
    );

    // Stress analysis across all 9
    const stressResults = engagement.scenarios.map(s => ({
        template: s.template,
        fragility: s.fragilityScore,
        resilience: s.resilienceRating,
        cascade: s.cascadeRisk,
        affectedCount: s.affectedCapabilities.length,
    }));

    const totalMinutes = agenda.reduce((s, a) => s + a.duration, 0);

    return (
        <div className="flex h-screen bg-[#050505] text-white overflow-hidden">
            <Sidebar />

            <main className="flex-1 overflow-y-auto ml-64">
                <header className="h-16 border-b border-white/10 flex items-center justify-between px-8 bg-[#0a0a0a]/50 backdrop-blur-md sticky top-0 z-10 print:hidden">
                    <div>
                        <h1 className="text-lg font-medium">Report Generation</h1>
                        <p className="text-xs text-gray-500">{engagement.clientName} — Automated Diagnostic Outputs</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="text-xs text-gray-400">
                            v{engagement.version} • {new Date(engagement.updatedAt).toLocaleDateString()}
                        </div>
                        <button onClick={() => window.print()} className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg">
                            <Printer className="w-3.5 h-3.5" /> Export / Print
                        </button>
                    </div>
                </header>

                <div className="p-6 max-w-5xl space-y-10">

                    {/* ─── A. Workshop Agenda Flow ─────────────────────────── */}
                    <section>
                        <div className="flex items-center gap-3 mb-4">
                            <BookOpen className="w-5 h-5 text-blue-400" />
                            <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-400">A. Workshop Agenda Flow</h2>
                            <span className="text-xs text-gray-600">Auto-generated • {totalMinutes} min</span>
                        </div>
                        <div className="glass-card rounded-xl border border-white/10 overflow-hidden">
                            {agenda.length === 0 ? (
                                <div className="p-6 text-sm text-gray-600">Complete assessments to generate agenda items.</div>
                            ) : (
                                <div className="divide-y divide-white/5">
                                    {agenda.map((item, i) => (
                                        <div key={i} className="flex items-center gap-4 p-4">
                                            <div className="flex items-center gap-2 shrink-0 w-20">
                                                <Clock className="w-3.5 h-3.5 text-gray-500" />
                                                <span className="text-sm text-gray-400">{item.duration} min</span>
                                            </div>
                                            <div className="flex-1">
                                                <div className="text-sm font-medium text-white">{item.capability}</div>
                                                <div className="text-xs text-gray-500 mt-0.5">{item.focus}</div>
                                            </div>
                                            <div className={`text-xs px-2 py-0.5 rounded ${item.priority <= 3 ? 'bg-red-500/10 text-red-400' : 'bg-white/5 text-gray-500'
                                                }`}>
                                                P{item.priority}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </section>

                    {/* ─── B. Systems Risk Map ─────────────────────────────── */}
                    <section>
                        <div className="flex items-center gap-3 mb-4">
                            <Shield className="w-5 h-5 text-red-400" />
                            <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-400">B. Systems Risk Map — All 9 Capabilities</h2>
                        </div>
                        <div className="glass-card rounded-xl border border-white/10 overflow-hidden">
                            <div className="grid grid-cols-3 gap-0">
                                {engagement.assessments.map((a, i) => {
                                    const score = compositeScore(a);
                                    const isSPOF = spofs.includes(a.name);
                                    const depCount = engagement.dependencies.filter(d => d.to === a.name).length;
                                    const outCount = engagement.dependencies.filter(d => d.from === a.name).length;

                                    let bgIntensity = 'bg-emerald-500/10';
                                    if (a.riskLevel === 'High') bgIntensity = 'bg-red-500/15';
                                    else if (a.riskLevel === 'Medium') bgIntensity = 'bg-amber-500/10';

                                    return (
                                        <div key={a.name} className={`p-4 border border-white/5 ${bgIntensity} relative`}>
                                            {isSPOF && (
                                                <div className="absolute top-2 right-2">
                                                    <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                                                </div>
                                            )}
                                            <div className="text-xs font-medium text-gray-300 mb-1">{i + 1}. {a.name}</div>
                                            <div className={`text-lg font-light ${score <= 2 ? 'text-red-400' : score <= 3 ? 'text-amber-400' : score <= 4 ? 'text-blue-400' : 'text-emerald-400'
                                                }`}>
                                                {score.toFixed(1)}
                                            </div>
                                            <div className="flex items-center gap-2 mt-1 text-[10px] text-gray-600">
                                                <span>↓{depCount} in</span>
                                                <span>↑{outCount} out</span>
                                                <span className={a.riskLevel === 'High' ? 'text-red-400' : a.riskLevel === 'Medium' ? 'text-amber-400' : 'text-emerald-400'}>
                                                    {a.riskLevel}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </section>

                    {/* ─── C. Structural Weakness Summary ──────────────────── */}
                    <section>
                        <div className="flex items-center gap-3 mb-4">
                            <AlertTriangle className="w-5 h-5 text-amber-400" />
                            <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-400">C. Structural Weakness Summary</h2>
                        </div>
                        <div className="glass-card rounded-xl border border-amber-500/20 p-6">
                            <p className="text-sm text-gray-300 leading-relaxed italic">&ldquo;{weaknessSummary}&rdquo;</p>
                            <p className="text-xs text-gray-600 mt-3">Auto-generated from lowest-scoring capabilities, dependency relationships, and unvalidated assumptions.</p>
                        </div>
                    </section>

                    {/* ─── D. Capability Maturity Snapshot ──────────────────── */}
                    <section>
                        <div className="flex items-center gap-3 mb-4">
                            <Layers className="w-5 h-5 text-blue-400" />
                            <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-400">D. Capability Maturity Snapshot</h2>
                        </div>
                        <div className="glass-card rounded-xl border border-white/10 overflow-hidden">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="bg-white/5 text-xs uppercase text-gray-500">
                                        <th className="p-3 text-left">Capability</th>
                                        <th className="p-3 text-center">Score</th>
                                        <th className="p-3 text-center">Maturity Level</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {maturitySnapshot.map(m => {
                                        const mColor = m.level === 'Fragile' ? 'text-red-400 bg-red-500/10'
                                            : m.level === 'Developing' ? 'text-amber-400 bg-amber-500/10'
                                                : m.level === 'Structured' ? 'text-blue-400 bg-blue-500/10'
                                                    : 'text-emerald-400 bg-emerald-500/10';
                                        return (
                                            <tr key={m.name} className="border-t border-white/5">
                                                <td className="p-3 text-gray-300">{m.name}</td>
                                                <td className="p-3 text-center text-gray-400">{m.score.toFixed(1)}</td>
                                                <td className="p-3 text-center">
                                                    <span className={`px-2.5 py-1 rounded-md text-xs font-medium ${mColor}`}>{m.level}</span>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                        <div className="mt-3 flex gap-3 text-[10px] text-gray-600">
                            <span>1–2 → Fragile</span>
                            <span>2–3 → Developing</span>
                            <span>3–4 → Structured</span>
                            <span>4–5 → Institutionalized</span>
                        </div>
                    </section>

                    {/* ─── E. Top 5 Structural Risks ────────────────────────── */}
                    <section>
                        <div className="flex items-center gap-3 mb-4">
                            <AlertTriangle className="w-5 h-5 text-red-400" />
                            <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-400">E. Top 5 Structural Risks</h2>
                        </div>
                        {topRisks.length === 0 ? (
                            <p className="text-sm text-gray-600">Complete assessments to generate risk rankings.</p>
                        ) : (
                            <div className="space-y-2">
                                {topRisks.map(r => (
                                    <div key={r.rank} className="glass-card rounded-lg border border-white/10 p-4 flex items-center gap-4">
                                        <span className={`text-lg font-bold w-8 text-center ${r.rank <= 2 ? 'text-red-400' : 'text-amber-400'}`}>
                                            {r.rank}
                                        </span>
                                        <div className="flex-1">
                                            <span className="text-sm text-white">{r.title}</span>
                                            <span className="text-xs text-gray-500 ml-2">Score: {r.score}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>

                    {/* ─── F. Critical Assumption List ──────────────────────── */}
                    <section>
                        <div className="flex items-center gap-3 mb-4">
                            <Target className="w-5 h-5 text-amber-400" />
                            <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-400">F. Critical Assumption List</h2>
                        </div>
                        {critAssumptions.length === 0 ? (
                            <p className="text-sm text-gray-600">No unvalidated critical assumptions. Add assumptions in Assessment.</p>
                        ) : (
                            <div className="glass-card rounded-xl border border-white/10 overflow-hidden">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="bg-white/5 text-xs uppercase text-gray-500">
                                            <th className="p-3 text-left">Capability Origin</th>
                                            <th className="p-3 text-left">Assumption</th>
                                            <th className="p-3 text-center">Revenue-Linked</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {critAssumptions.map((a, i) => (
                                            <tr key={i} className="border-t border-white/5">
                                                <td className="p-3 text-amber-400 text-xs font-medium">{a.capability}</td>
                                                <td className="p-3 text-gray-300">{a.text || 'Undefined'}</td>
                                                <td className="p-3 text-center">{a.revenueLinked ? '⚠️ Yes' : '—'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </section>

                    {/* ─── G. Architecture Priorities for Phase 1 ──────────── */}
                    <section>
                        <div className="flex items-center gap-3 mb-4">
                            <FileText className="w-5 h-5 text-emerald-400" />
                            <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-400">G. Architecture Priorities — Phase 1 Focus</h2>
                        </div>
                        <div className="glass-card rounded-xl border border-emerald-500/20 p-6">
                            <p className="text-xs text-gray-500 mb-4">
                                Derived from: Lowest maturity capability × Highest interdependency weight × Highest stress fragility
                            </p>
                            {phase1Priorities.length === 0 ? (
                                <p className="text-sm text-gray-600">Complete full assessment to derive priorities.</p>
                            ) : (
                                <ol className="space-y-3">
                                    {phase1Priorities.map((p, i) => (
                                        <li key={i} className="flex items-center gap-3">
                                            <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 text-xs flex items-center justify-center font-medium shrink-0">
                                                {i + 1}
                                            </span>
                                            <span className="text-sm text-gray-300">{p}</span>
                                        </li>
                                    ))}
                                </ol>
                            )}
                        </div>
                    </section>

                    {/* ─── Stress Simulation Summary ────────────────────────── */}
                    {stressResults.length > 0 && (
                        <section>
                            <div className="flex items-center gap-3 mb-4">
                                <Target className="w-5 h-5 text-purple-400" />
                                <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-400">Stress Simulation Summary</h2>
                            </div>
                            <div className="glass-card rounded-xl border border-white/10 overflow-hidden">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="bg-white/5 text-xs uppercase text-gray-500">
                                            <th className="p-3 text-left">Scenario</th>
                                            <th className="p-3 text-center">Fragility</th>
                                            <th className="p-3 text-center">Resilience</th>
                                            <th className="p-3 text-center">Cascade</th>
                                            <th className="p-3 text-center">Capabilities Hit</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {stressResults.map((s, i) => (
                                            <tr key={i} className="border-t border-white/5">
                                                <td className="p-3 text-gray-300 font-medium">{s.template}</td>
                                                <td className={`p-3 text-center ${s.fragility >= 7 ? 'text-red-400' : 'text-gray-400'}`}>{s.fragility}/10</td>
                                                <td className={`p-3 text-center ${s.resilience <= 3 ? 'text-red-400' : 'text-gray-400'}`}>{s.resilience}/10</td>
                                                <td className={`p-3 text-center ${s.cascade >= 7 ? 'text-red-400' : 'text-gray-400'}`}>{s.cascade}/10</td>
                                                <td className="p-3 text-center text-gray-400">{s.affectedCount}/9</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </section>
                    )}

                </div>
            </main>
        </div>
    );
}
