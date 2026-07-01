'use client';

import { useState } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { useDiagnosticStore } from '@/lib/store';
import {
    type StressScenario,
    type ScenarioTemplate,
    type CapabilityName,
    CAPABILITY_NAMES,
} from '@/lib/types';
import { computeScenarioScores } from '@/lib/engine';
import { Plus, Trash2, Zap, AlertTriangle } from 'lucide-react';

const SCENARIO_TEMPLATES: { template: ScenarioTemplate; description: string }[] = [
    { template: 'Operator Bypass Surge', description: 'Operators route bookings outside the platform to avoid fees' },
    { template: 'Regulatory Restriction', description: 'New regulation restricts operations or requires compliance changes' },
    { template: 'Payment Outage', description: 'Payment gateway goes down, blocking all transactions' },
    { template: 'Fraud Spike', description: 'Coordinated fraud attack exploiting a system vulnerability' },
    { template: 'Demand Shock', description: 'Sudden demand increase or collapse that strains the system' },
    { template: 'Custom', description: 'Define your own stress scenario with custom impact mapping' },
];

const IMPACT_LEVELS = ['None', 'Low', 'Medium', 'High', 'Critical'] as const;
type ImpactLevel = typeof IMPACT_LEVELS[number];

// Pre-defined impact descriptions per scenario template × capability
const SCENARIO_IMPACT_HINTS: Partial<Record<ScenarioTemplate, Record<CapabilityName, string>>> = {
    'Payment Outage': {
        'Business Design': 'Trust erosion in platform model',
        'Product Strategy': 'Feature failure — core loop breaks',
        'Customer & Service Design': 'Refund chaos, support overload',
        'Data & Intelligence': 'Transaction data gaps',
        'Operating Model & Processes': 'Support overload, manual workarounds',
        'Technology & Platform': 'Downtime, failover stress',
        'Governance, Risk & Control': 'Dispute surge, liability exposure',
        'Economics & Value Engineering': 'Direct revenue impact',
        'Change, Adoption & Behaviour': 'Reversion to cash/legacy',
    },
    'Operator Bypass Surge': {
        'Business Design': 'Platform disintermediation',
        'Product Strategy': 'Value proposition undermined',
        'Customer & Service Design': 'Trust fragmentation',
        'Data & Intelligence': 'Blind spots in booking data',
        'Operating Model & Processes': 'Enforcement gaps',
        'Technology & Platform': 'Tracking evasion',
        'Governance, Risk & Control': 'Compliance gaps widen',
        'Economics & Value Engineering': 'Revenue leakage',
        'Change, Adoption & Behaviour': 'Operator resistance normalised',
    },
    'Regulatory Restriction': {
        'Business Design': 'Model viability questioned',
        'Product Strategy': 'Roadmap disruption',
        'Customer & Service Design': 'Service limitation',
        'Data & Intelligence': 'Data handling constraints',
        'Operating Model & Processes': 'Process redesign required',
        'Technology & Platform': 'Compliance retrofitting',
        'Governance, Risk & Control': 'Full audit exposure',
        'Economics & Value Engineering': 'Cost of compliance',
        'Change, Adoption & Behaviour': 'Stakeholder uncertainty',
    },
    'Fraud Spike': {
        'Business Design': 'Trust architecture failure',
        'Product Strategy': 'Security priorities shift',
        'Customer & Service Design': 'User confidence collapse',
        'Data & Intelligence': 'Signal noise increase',
        'Operating Model & Processes': 'Investigation overload',
        'Technology & Platform': 'Vulnerability patching',
        'Governance, Risk & Control': 'Liability crystallisation',
        'Economics & Value Engineering': 'Chargeback losses',
        'Change, Adoption & Behaviour': 'User churn acceleration',
    },
    'Demand Shock': {
        'Business Design': 'Scaling assumptions tested',
        'Product Strategy': 'Capacity bottleneck',
        'Customer & Service Design': 'Quality of service degradation',
        'Data & Intelligence': 'Data pipeline strain',
        'Operating Model & Processes': 'Operational overwhelm',
        'Technology & Platform': 'Infrastructure scaling failure',
        'Governance, Risk & Control': 'SLA breach risk',
        'Economics & Value Engineering': 'Unit economics distortion',
        'Change, Adoption & Behaviour': 'Adoption spike unprepared',
    },
};

export default function SimulationPage() {
    const store = useDiagnosticStore();
    const engagement = store.getActiveEngagement();
    const [selectedTemplate, setSelectedTemplate] = useState<ScenarioTemplate | null>(null);

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

    const startScenario = (template: ScenarioTemplate) => {
        const scenario: StressScenario = {
            id: crypto.randomUUID(),
            template,
            customName: template === 'Custom' ? 'My Custom Scenario' : '',
            whatBreaks: '',
            revenueImpact: 'Medium',
            trustImpact: 'Medium',
            operationalResponse: '',
            timeToRecovery: '',
            affectedCapabilities: [...CAPABILITY_NAMES],
            fragilityScore: 5,
            resilienceRating: 5,
            cascadeRisk: 5,
        };

        const scores = computeScenarioScores(scenario, engagement.dependencies);
        const scored = { ...scenario, ...scores };

        store.updateEngagement({
            ...engagement,
            scenarios: [...engagement.scenarios, scored],
        });
        setSelectedTemplate(null);
    };

    const updateScenario = (id: string, updates: Partial<StressScenario>) => {
        const newScenarios = engagement.scenarios.map(s => {
            if (s.id !== id) return s;
            const updated = { ...s, ...updates };
            const scores = computeScenarioScores(updated, engagement.dependencies);
            return { ...updated, ...scores };
        });
        store.updateEngagement({ ...engagement, scenarios: newScenarios });
    };

    const removeScenario = (id: string) => {
        store.updateEngagement({
            ...engagement,
            scenarios: engagement.scenarios.filter(s => s.id !== id),
        });
    };

    const toggleAffectedCapability = (scenarioId: string, cap: CapabilityName) => {
        const scenario = engagement.scenarios.find(s => s.id === scenarioId);
        if (!scenario) return;
        const has = scenario.affectedCapabilities.includes(cap);
        updateScenario(scenarioId, {
            affectedCapabilities: has
                ? scenario.affectedCapabilities.filter(c => c !== cap)
                : [...scenario.affectedCapabilities, cap],
        });
    };

    return (
        <div className="flex h-screen bg-[#050505] text-white overflow-hidden">
            <Sidebar />

            <main className="flex-1 overflow-y-auto ml-64">
                <header className="h-16 border-b border-white/10 flex items-center justify-between px-8 bg-[#0a0a0a]/50 backdrop-blur-md sticky top-0 z-10">
                    <div>
                        <h1 className="text-lg font-medium">Stress Simulation</h1>
                        <p className="text-xs text-gray-500">{engagement.clientName} — Impact Across All 9 Capabilities</p>
                    </div>
                    <button
                        onClick={() => setSelectedTemplate(SCENARIO_TEMPLATES[0].template)}
                        className="flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white text-sm font-medium rounded-lg transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                        New Scenario
                    </button>
                </header>

                <div className="p-6">
                    {/* Template Selector Modal */}
                    {selectedTemplate !== null && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                            <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-8 w-full max-w-lg">
                                <h2 className="text-xl font-semibold mb-4">Select Stress Scenario</h2>
                                <div className="space-y-2">
                                    {SCENARIO_TEMPLATES.map(t => (
                                        <button
                                            key={t.template}
                                            onClick={() => startScenario(t.template)}
                                            className="w-full text-left p-4 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 hover:border-amber-500/30 transition-colors"
                                        >
                                            <div className="flex items-center gap-3">
                                                <Zap className="w-4 h-4 text-amber-400" />
                                                <span className="text-sm font-medium text-white">{t.template}</span>
                                            </div>
                                            <p className="text-xs text-gray-500 mt-1 ml-7">{t.description}</p>
                                        </button>
                                    ))}
                                </div>
                                <button
                                    onClick={() => setSelectedTemplate(null)}
                                    className="w-full mt-4 px-4 py-2.5 text-sm text-gray-400 border border-white/10 rounded-lg hover:bg-white/5 transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Empty State */}
                    {engagement.scenarios.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-24 text-center">
                            <Zap className="w-16 h-16 text-gray-600 mb-6" />
                            <h2 className="text-2xl font-light text-gray-300 mb-2">No Scenarios Simulated</h2>
                            <p className="text-gray-500 mb-8 max-w-md">
                                Run stress simulations to evaluate system resilience. Each scenario maps impact across all 9 capabilities.
                            </p>
                            <button
                                onClick={() => setSelectedTemplate(SCENARIO_TEMPLATES[0].template)}
                                className="flex items-center gap-2 px-6 py-3 bg-amber-600 hover:bg-amber-500 text-white text-sm font-medium rounded-lg transition-colors"
                            >
                                <Plus className="w-4 h-4" />
                                Run First Simulation
                            </button>
                        </div>
                    )}

                    {/* Scenario Cards */}
                    <div className="space-y-6">
                        {engagement.scenarios.map(scenario => {
                            const hints = scenario.template !== 'Custom' ? SCENARIO_IMPACT_HINTS[scenario.template] : undefined;

                            return (
                                <div key={scenario.id} className="glass-card rounded-xl border border-white/10 overflow-hidden">
                                    {/* Scenario Header */}
                                    <div className="p-5 border-b border-white/10 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <Zap className="w-5 h-5 text-amber-400" />
                                            <div>
                                                <h3 className="text-sm font-semibold">{scenario.template === 'Custom' ? (scenario.customName || 'Custom Scenario') : scenario.template}</h3>
                                                <p className="text-xs text-gray-500">Impact mapped across all 9 capabilities</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            {/* Score badges */}
                                            <div className="flex gap-2 text-xs">
                                                <span className={`px-2 py-1 rounded-md border ${scenario.fragilityScore >= 7 ? 'bg-red-500/20 border-red-500/30 text-red-400' : 'bg-white/5 border-white/10 text-gray-400'}`}>
                                                    Fragility: {scenario.fragilityScore}
                                                </span>
                                                <span className={`px-2 py-1 rounded-md border ${scenario.resilienceRating <= 3 ? 'bg-red-500/20 border-red-500/30 text-red-400' : 'bg-white/5 border-white/10 text-gray-400'}`}>
                                                    Resilience: {scenario.resilienceRating}
                                                </span>
                                                <span className={`px-2 py-1 rounded-md border ${scenario.cascadeRisk >= 7 ? 'bg-red-500/20 border-red-500/30 text-red-400' : 'bg-white/5 border-white/10 text-gray-400'}`}>
                                                    Cascade: {scenario.cascadeRisk}
                                                </span>
                                            </div>
                                            <button
                                                onClick={() => removeScenario(scenario.id)}
                                                className="text-gray-600 hover:text-red-400"
                                                aria-label="Delete scenario"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="p-5 space-y-5">
                                        {/* Custom Name Input */}
                                        {scenario.template === 'Custom' && (
                                            <div>
                                                <label className="block text-xs text-gray-500 uppercase tracking-wider mb-1.5">Scenario Name</label>
                                                <input
                                                    value={scenario.customName}
                                                    onChange={(e) => updateScenario(scenario.id, { customName: e.target.value })}
                                                    placeholder="Name your custom scenario"
                                                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-amber-500"
                                                />
                                            </div>
                                        )}

                                        {/* Structured Inputs */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-xs text-gray-500 uppercase tracking-wider mb-1.5">What Breaks?</label>
                                                <textarea
                                                    value={scenario.whatBreaks}
                                                    onChange={(e) => updateScenario(scenario.id, { whatBreaks: e.target.value })}
                                                    placeholder="Describe the primary failure mode..."
                                                    rows={2}
                                                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-amber-500 resize-none"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs text-gray-500 uppercase tracking-wider mb-1.5">Operational Response</label>
                                                <textarea
                                                    value={scenario.operationalResponse}
                                                    onChange={(e) => updateScenario(scenario.id, { operationalResponse: e.target.value })}
                                                    placeholder="How would the team respond?"
                                                    rows={2}
                                                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-amber-500 resize-none"
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div>
                                                <label className="block text-xs text-gray-500 uppercase tracking-wider mb-1.5">Revenue Impact</label>
                                                <select
                                                    value={scenario.revenueImpact}
                                                    onChange={(e) => updateScenario(scenario.id, { revenueImpact: e.target.value as ImpactLevel })}
                                                    title="Revenue Impact"
                                                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:outline-none"
                                                >
                                                    {IMPACT_LEVELS.map(l => <option key={l} value={l} className="bg-[#0a0a0a]">{l}</option>)}
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-xs text-gray-500 uppercase tracking-wider mb-1.5">Trust Impact</label>
                                                <select
                                                    value={scenario.trustImpact}
                                                    onChange={(e) => updateScenario(scenario.id, { trustImpact: e.target.value as ImpactLevel })}
                                                    title="Trust Impact"
                                                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:outline-none"
                                                >
                                                    {IMPACT_LEVELS.map(l => <option key={l} value={l} className="bg-[#0a0a0a]">{l}</option>)}
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-xs text-gray-500 uppercase tracking-wider mb-1.5">Time to Recovery</label>
                                                <input
                                                    value={scenario.timeToRecovery}
                                                    onChange={(e) => updateScenario(scenario.id, { timeToRecovery: e.target.value })}
                                                    placeholder="e.g. 4 hours, 2 days"
                                                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:outline-none"
                                                />
                                            </div>
                                        </div>

                                        {/* All 9 Capabilities Impact Table */}
                                        <div>
                                            <label className="block text-xs text-gray-500 uppercase tracking-wider mb-2">Impact Across All 9 Capabilities</label>
                                            <div className="border border-white/10 rounded-lg overflow-hidden">
                                                <table className="w-full text-xs">
                                                    <thead>
                                                        <tr className="bg-white/5">
                                                            <th className="p-2.5 text-left text-gray-500 font-medium">Capability</th>
                                                            <th className="p-2.5 text-left text-gray-500 font-medium">Expected Impact</th>
                                                            <th className="p-2.5 text-center text-gray-500 font-medium w-20">Affected</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {CAPABILITY_NAMES.map((cap) => {
                                                            const isAffected = scenario.affectedCapabilities.includes(cap);
                                                            const hint = hints?.[cap] ?? '';
                                                            return (
                                                                <tr key={cap} className={`border-t border-white/5 ${isAffected ? 'bg-amber-500/5' : ''}`}>
                                                                    <td className="p-2.5">
                                                                        <span className={`font-medium ${isAffected ? 'text-amber-300' : 'text-gray-400'}`}>{cap}</span>
                                                                    </td>
                                                                    <td className="p-2.5 text-gray-500">{hint}</td>
                                                                    <td className="p-2.5 text-center">
                                                                        <input
                                                                            type="checkbox"
                                                                            checked={isAffected}
                                                                            onChange={() => toggleAffectedCapability(scenario.id, cap)}
                                                                            className="rounded"
                                                                        />
                                                                    </td>
                                                                </tr>
                                                            );
                                                        })}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </main>
        </div>
    );
}
