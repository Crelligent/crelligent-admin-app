'use client';

import { Sidebar } from '@/components/layout/Sidebar';
import { useDiagnosticStore } from '@/lib/store';
import { compositeScore } from '@/lib/engine';
import { CAPABILITY_NAMES, type EngagementPhase } from '@/lib/types';
import { BookOpen, ArrowRight, CheckCircle2, AlertTriangle, Lightbulb } from 'lucide-react';

interface PlaybookRecommendation {
    title: string;
    description: string;
    priority: 'Critical' | 'High' | 'Medium';
    phase: EngagementPhase;
    capabilities: string[];
}

export default function PlaybooksPage() {
    const store = useDiagnosticStore();
    const activeEngagement = store.getActiveEngagement();

    // Generate playbook recommendations based on diagnostic profile
    const recommendations: PlaybookRecommendation[] = [];

    if (activeEngagement) {
        const scores = activeEngagement.assessments.map(a => ({ name: a.name, score: compositeScore(a), risk: a.riskLevel }));
        const weak = scores.filter(s => s.score <= 2);
        const medium = scores.filter(s => s.score > 2 && s.score <= 3);
        const highRisk = scores.filter(s => s.risk === 'High');

        // Critical: Low-scoring capabilities
        weak.forEach(s => {
            recommendations.push({
                title: `Rebuild ${s.name}`,
                description: `Score ${s.score.toFixed(1)}/5 — this capability needs fundamental redesign. Run a focused design sprint to establish baseline architecture.`,
                priority: 'Critical',
                phase: 'Define',
                capabilities: [s.name],
            });
        });

        // High: Medium-scoring with high risk
        highRisk.filter(s => s.score > 2).forEach(s => {
            recommendations.push({
                title: `De-risk ${s.name}`,
                description: `Scored ${s.score.toFixed(1)}/5 but flagged High Risk. Run risk workshop to identify and mitigate structural vulnerabilities.`,
                priority: 'High',
                phase: 'Build',
                capabilities: [s.name],
            });
        });

        // Medium: Improvement opportunities
        medium.filter(s => s.risk !== 'High').forEach(s => {
            recommendations.push({
                title: `Strengthen ${s.name}`,
                description: `Score ${s.score.toFixed(1)}/5 — above baseline but has room for structured improvement.`,
                priority: 'Medium',
                phase: 'Build',
                capabilities: [s.name],
            });
        });

        // Cross-cutting recommendations
        const bdScore = scores.find(s => s.name === 'Business Design')?.score ?? 0;
        const psScore = scores.find(s => s.name === 'Product Strategy')?.score ?? 0;
        if (bdScore <= 2 && psScore <= 2) {
            recommendations.unshift({
                title: 'Strategic Foundation Sprint',
                description: 'Both Business Design and Product Strategy are below threshold. Run a joint 2-week sprint to align business model and product roadmap before engineering begins.',
                priority: 'Critical',
                phase: 'Define',
                capabilities: ['Business Design', 'Product Strategy'],
            });
        }

        const techScore = scores.find(s => s.name === 'Technology & Platform')?.score ?? 0;
        const govScore = scores.find(s => s.name === 'Governance, Risk & Control')?.score ?? 0;
        if (techScore <= 3 && govScore <= 3) {
            recommendations.push({
                title: 'Architecture & Governance Review',
                description: 'Both technology and governance capabilities need attention. Consider a joint architecture review before building further.',
                priority: 'High',
                phase: 'Define',
                capabilities: ['Technology & Platform', 'Governance, Risk & Control'],
            });
        }

        if (activeEngagement.scenarios.length > 0) {
            const avgFragility = activeEngagement.scenarios.reduce((s, sc) => s + sc.fragilityScore, 0) / activeEngagement.scenarios.length;
            if (avgFragility >= 6) {
                recommendations.push({
                    title: 'Resilience Engineering Programme',
                    description: `Average fragility score of ${avgFragility.toFixed(1)}/10 indicates systemic brittleness. Initiate dedicated resilience engineering workstream.`,
                    priority: 'Critical',
                    phase: 'Build',
                    capabilities: ['Operating Model & Processes', 'Technology & Platform'],
                });
            }
        }
    }

    const PRIORITY_COLORS = { Critical: 'border-red-500/30 bg-red-500/5', High: 'border-amber-500/30 bg-amber-500/5', Medium: 'border-blue-500/30 bg-blue-500/5' };
    const PRIORITY_BADGE = { Critical: 'bg-red-500/20 text-red-400', High: 'bg-amber-500/20 text-amber-400', Medium: 'bg-blue-500/20 text-blue-400' };
    const PHASE_BADGE: Record<EngagementPhase, string> = { Define: 'bg-blue-500/20 text-blue-400', Build: 'bg-amber-500/20 text-amber-400', Launch: 'bg-emerald-500/20 text-emerald-400', Sustain: 'bg-violet-500/20 text-violet-400' };

    return (
        <div className="flex h-screen bg-[#050505] text-white overflow-hidden">
            <Sidebar />
            <main className="flex-1 overflow-y-auto ml-64">
                <header className="h-16 border-b border-white/10 flex items-center justify-between px-8 bg-[#0a0a0a]/50 backdrop-blur-md sticky top-0 z-10">
                    <h1 className="text-lg font-medium">Engagement Playbooks</h1>
                    <div className="text-xs text-gray-500">
                        {activeEngagement ? `Active: ${activeEngagement.clientName}` : 'No active engagement'}
                    </div>
                </header>

                <div className="p-6 max-w-4xl">
                    {!activeEngagement ? (
                        <div className="flex flex-col items-center justify-center py-24">
                            <BookOpen className="w-16 h-16 text-gray-600 mb-6" />
                            <h2 className="text-2xl font-light text-gray-300 mb-2">No Active Engagement</h2>
                            <p className="text-gray-500">Select an engagement from the Dashboard to generate playbook recommendations.</p>
                        </div>
                    ) : recommendations.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-24">
                            <CheckCircle2 className="w-16 h-16 text-emerald-500 mb-6" />
                            <h2 className="text-2xl font-light text-gray-300 mb-2">All Systems Go</h2>
                            <p className="text-gray-500">All capabilities are above threshold. No specific playbook recommendations at this time.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <p className="text-sm text-gray-500 mb-6">
                                Based on the diagnostic profile of <strong className="text-white">{activeEngagement.clientName}</strong>,
                                {' '}{recommendations.length} recommendations have been auto-generated.
                            </p>
                            {recommendations.map((rec, i) => (
                                <div key={i} className={`rounded-xl border p-5 ${PRIORITY_COLORS[rec.priority]}`}>
                                    <div className="flex items-start justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            {rec.priority === 'Critical' ? <AlertTriangle className="w-4 h-4 text-red-400" /> : <Lightbulb className="w-4 h-4 text-amber-400" />}
                                            <h3 className="text-sm font-semibold">{rec.title}</h3>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${PRIORITY_BADGE[rec.priority]}`}>{rec.priority}</span>
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${PHASE_BADGE[rec.phase]}`}>{rec.phase}</span>
                                        </div>
                                    </div>
                                    <p className="text-sm text-gray-400 mb-3">{rec.description}</p>
                                    <div className="flex flex-wrap gap-1.5">
                                        {rec.capabilities.map(cap => (
                                            <span key={cap} className="px-2 py-0.5 rounded text-[10px] bg-white/5 text-gray-500">{cap}</span>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
