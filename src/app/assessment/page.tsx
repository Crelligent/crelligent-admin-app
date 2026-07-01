'use client';

import { useState } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { useDiagnosticStore } from '@/lib/store';
import {
    type CapabilityAssessment,
    type RiskLevel,
    type CapabilityName,
    type Assumption,
    CAPABILITY_NAMES,
    CAPABILITY_QUESTIONS,
} from '@/lib/types';
import { compositeScore, maturityLevel } from '@/lib/engine';
import { Plus, Trash2, ChevronDown, ChevronUp, AlertTriangle, HelpCircle } from 'lucide-react';

export default function AssessmentPage() {
    const store = useDiagnosticStore();
    const engagement = store.getActiveEngagement();
    const [expandedIndex, setExpandedIndex] = useState<number | null>(0);

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

    const updateAssessment = (index: number, updated: Partial<CapabilityAssessment>) => {
        const newAssessments = [...engagement.assessments];
        newAssessments[index] = { ...newAssessments[index], ...updated };
        store.updateEngagement({ ...engagement, assessments: newAssessments });
    };

    const addAssumption = (index: number) => {
        const a = engagement.assessments[index];
        const newAssumption: Assumption = {
            id: crypto.randomUUID(),
            text: '',
            validated: false,
            revenueLinked: false,
            highDependency: false,
        };
        updateAssessment(index, { assumptions: [...a.assumptions, newAssumption] });
    };

    const updateAssumption = (capIndex: number, assId: string, updates: Partial<Assumption>) => {
        const a = engagement.assessments[capIndex];
        const newAssumptions = a.assumptions.map(as =>
            as.id === assId ? { ...as, ...updates } : as
        );
        updateAssessment(capIndex, { assumptions: newAssumptions });
    };

    const removeAssumption = (capIndex: number, assId: string) => {
        const a = engagement.assessments[capIndex];
        updateAssessment(capIndex, { assumptions: a.assumptions.filter(as => as.id !== assId) });
    };

    const toggleDependency = (capIndex: number, dep: CapabilityName) => {
        const a = engagement.assessments[capIndex];
        const hasDep = a.dependencies.includes(dep);
        updateAssessment(capIndex, {
            dependencies: hasDep
                ? a.dependencies.filter(d => d !== dep)
                : [...a.dependencies, dep],
        });
    };

    return (
        <div className="flex h-screen bg-[#050505] text-white overflow-hidden">
            <Sidebar />

            <main className="flex-1 overflow-y-auto ml-64">
                <header className="h-16 border-b border-white/10 flex items-center justify-between px-8 bg-[#0a0a0a]/50 backdrop-blur-md sticky top-0 z-10">
                    <div>
                        <h1 className="text-lg font-medium">Capability Assessment</h1>
                        <p className="text-xs text-gray-500">{engagement.clientName} — All 9 Capabilities</p>
                    </div>
                    <div className="text-xs text-gray-500">
                        {engagement.assessments.filter(a => compositeScore(a) > 1).length} / 9 assessed
                    </div>
                </header>

                <div className="p-6 space-y-3 max-w-4xl">
                    {engagement.assessments.map((assessment, index) => {
                        const isExpanded = expandedIndex === index;
                        const score = compositeScore(assessment);
                        const level = maturityLevel(score);
                        const levelColor = score <= 2 ? 'text-red-400' : score <= 3 ? 'text-amber-400' : score <= 4 ? 'text-blue-400' : 'text-emerald-400';
                        const questions = CAPABILITY_QUESTIONS[assessment.name] ?? [];

                        return (
                            <div key={assessment.name} className="glass-card rounded-xl border border-white/10 overflow-hidden">
                                {/* Capability Header */}
                                <button
                                    onClick={() => setExpandedIndex(isExpanded ? null : index)}
                                    className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors"
                                    aria-label={`${isExpanded ? 'Collapse' : 'Expand'} ${assessment.name}`}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-sm font-medium text-gray-400">
                                            {index + 1}
                                        </div>
                                        <div className="text-left">
                                            <div className="text-sm font-medium">{assessment.name}</div>
                                            <div className={`text-xs ${levelColor}`}>
                                                {level} • {score.toFixed(1)} / 5.0
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        {assessment.riskLevel === 'High' && (
                                            <AlertTriangle className="w-4 h-4 text-red-400" />
                                        )}
                                        {isExpanded ? (
                                            <ChevronUp className="w-4 h-4 text-gray-500" />
                                        ) : (
                                            <ChevronDown className="w-4 h-4 text-gray-500" />
                                        )}
                                    </div>
                                </button>

                                {/* Expanded Form */}
                                {isExpanded && (
                                    <div className="border-t border-white/10 p-6 space-y-6">
                                        {/* Diagnostic Questions */}
                                        {questions.length > 0 && (
                                            <div className="bg-blue-500/5 border border-blue-500/15 rounded-lg p-4">
                                                <div className="flex items-center gap-2 mb-3">
                                                    <HelpCircle className="w-4 h-4 text-blue-400" />
                                                    <span className="text-xs text-blue-400 font-semibold uppercase tracking-wider">Diagnostic Questions</span>
                                                </div>
                                                <ul className="space-y-1.5">
                                                    {questions.map((q, qi) => (
                                                        <li key={qi} className="text-sm text-gray-400 flex items-start gap-2">
                                                            <span className="text-blue-500/50 mt-0.5">•</span>
                                                            {q}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}

                                        {/* Score Sliders */}
                                        <div>
                                            <label className="block text-xs text-gray-500 uppercase tracking-wider mb-3">Scoring</label>
                                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                                <ScoreSlider
                                                    label="Strategic Clarity"
                                                    description="How clearly is intent defined?"
                                                    value={assessment.clarityScore}
                                                    onChange={(v) => updateAssessment(index, { clarityScore: v })}
                                                />
                                                <ScoreSlider
                                                    label="Evidence"
                                                    description="How much evidence supports this?"
                                                    value={assessment.evidenceScore}
                                                    onChange={(v) => updateAssessment(index, { evidenceScore: v })}
                                                />
                                                <ScoreSlider
                                                    label="Structural Soundness"
                                                    description="How well-structured is it?"
                                                    value={assessment.structureScore}
                                                    onChange={(v) => updateAssessment(index, { structureScore: v })}
                                                />
                                                <div>
                                                    <div className="flex items-center justify-between mb-1">
                                                        <label className="text-xs text-gray-400 font-medium">Risk Level</label>
                                                    </div>
                                                    <p className="text-xs text-gray-600 mb-2">Overall risk exposure</p>
                                                    <div className="flex gap-1.5">
                                                        {(['Low', 'Medium', 'High'] as RiskLevel[]).map(rl => (
                                                            <button
                                                                key={rl}
                                                                onClick={() => updateAssessment(index, { riskLevel: rl })}
                                                                aria-label={`Set risk level to ${rl}`}
                                                                className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-colors border ${assessment.riskLevel === rl
                                                                        ? rl === 'High'
                                                                            ? 'bg-red-500/20 border-red-500/50 text-red-400'
                                                                            : rl === 'Medium'
                                                                                ? 'bg-amber-500/20 border-amber-500/50 text-amber-400'
                                                                                : 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400'
                                                                        : 'bg-white/5 border-white/10 text-gray-500 hover:bg-white/10'
                                                                    }`}
                                                            >
                                                                {rl}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Dependencies */}
                                        <div>
                                            <label className="block text-xs text-gray-500 uppercase tracking-wider mb-2">Dependencies (this capability depends on…)</label>
                                            <div className="flex flex-wrap gap-2">
                                                {CAPABILITY_NAMES.filter(n => n !== assessment.name).map(dep => (
                                                    <button
                                                        key={dep}
                                                        onClick={() => toggleDependency(index, dep)}
                                                        aria-label={`Toggle dependency on ${dep}`}
                                                        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors border ${assessment.dependencies.includes(dep)
                                                                ? 'bg-blue-500/20 border-blue-500/40 text-blue-400'
                                                                : 'bg-white/5 border-white/10 text-gray-500 hover:text-gray-300'
                                                            }`}
                                                    >
                                                        {dep}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Assumptions */}
                                        <div>
                                            <div className="flex items-center justify-between mb-2">
                                                <label className="text-xs text-gray-500 uppercase tracking-wider">Assumptions</label>
                                                <button
                                                    onClick={() => addAssumption(index)}
                                                    className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300"
                                                    aria-label="Add assumption"
                                                >
                                                    <Plus className="w-3 h-3" /> Add
                                                </button>
                                            </div>
                                            {assessment.assumptions.length === 0 && (
                                                <p className="text-sm text-gray-600 italic">No assumptions recorded yet.</p>
                                            )}
                                            <div className="space-y-2">
                                                {assessment.assumptions.map(ass => (
                                                    <div key={ass.id} className="flex items-start gap-2 bg-white/5 rounded-lg p-3">
                                                        <input
                                                            type="text"
                                                            value={ass.text}
                                                            onChange={(e) => updateAssumption(index, ass.id, { text: e.target.value })}
                                                            placeholder="Describe the assumption..."
                                                            className="flex-1 bg-transparent text-sm text-white focus:outline-none"
                                                            aria-label="Assumption text"
                                                        />
                                                        <div className="flex items-center gap-2 shrink-0">
                                                            <label className="flex items-center gap-1 text-xs cursor-pointer">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={ass.validated}
                                                                    onChange={(e) => updateAssumption(index, ass.id, { validated: e.target.checked })}
                                                                    className="rounded"
                                                                />
                                                                <span className={ass.validated ? 'text-emerald-400' : 'text-gray-500'}>Validated</span>
                                                            </label>
                                                            <label className="flex items-center gap-1 text-xs cursor-pointer">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={ass.revenueLinked}
                                                                    onChange={(e) => updateAssumption(index, ass.id, { revenueLinked: e.target.checked })}
                                                                    className="rounded"
                                                                />
                                                                <span className={ass.revenueLinked ? 'text-amber-400' : 'text-gray-500'}>Revenue</span>
                                                            </label>
                                                            <button
                                                                onClick={() => removeAssumption(index, ass.id)}
                                                                className="text-gray-600 hover:text-red-400"
                                                                aria-label="Remove assumption"
                                                            >
                                                                <Trash2 className="w-3.5 h-3.5" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Notes */}
                                        <div>
                                            <label className="block text-xs text-gray-500 uppercase tracking-wider mb-2">Qualitative Notes</label>
                                            <textarea
                                                value={assessment.notes}
                                                onChange={(e) => updateAssessment(index, { notes: e.target.value })}
                                                placeholder="Record observations, context, and qualitative findings..."
                                                rows={3}
                                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500 resize-none transition-colors"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </main>
        </div>
    );
}

// ─── Score Slider Component ─────────────────────────────────────

function ScoreSlider({
    label,
    description,
    value,
    onChange,
}: {
    label: string;
    description: string;
    value: number;
    onChange: (value: number) => void;
}) {
    const colors = ['', 'bg-red-500', 'bg-amber-500', 'bg-yellow-500', 'bg-blue-500', 'bg-emerald-500'];

    return (
        <div>
            <div className="flex items-center justify-between mb-1">
                <label className="text-xs text-gray-400 font-medium">{label}</label>
                <span className={`text-lg font-light ${value <= 2 ? 'text-red-400' : value <= 3 ? 'text-amber-400' : value <= 4 ? 'text-blue-400' : 'text-emerald-400'}`}>
                    {value}
                </span>
            </div>
            <p className="text-xs text-gray-600 mb-2">{description}</p>
            <div className="flex gap-1.5">
                {[1, 2, 3, 4, 5].map(n => (
                    <button
                        key={n}
                        onClick={() => onChange(n)}
                        aria-label={`Set ${label} to ${n}`}
                        className={`flex-1 h-2 rounded-full transition-colors ${n <= value ? colors[value] : 'bg-white/10'
                            }`}
                    />
                ))}
            </div>
            <div className="flex justify-between mt-1">
                <span className="text-[10px] text-gray-600">Weak</span>
                <span className="text-[10px] text-gray-600">Strong</span>
            </div>
        </div>
    );
}
