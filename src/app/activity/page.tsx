'use client';

import { Sidebar } from '@/components/layout/Sidebar';
import { useDiagnosticStore } from '@/lib/store';
import { Activity, Filter } from 'lucide-react';
import { useState } from 'react';
import { type ActivityAction } from '@/lib/types';

const ACTION_LABELS: Record<string, { label: string; color: string }> = {
    client_created: { label: 'Client Created', color: 'text-emerald-400' },
    client_updated: { label: 'Client Updated', color: 'text-blue-400' },
    client_removed: { label: 'Client Removed', color: 'text-red-400' },
    engagement_created: { label: 'Engagement Created', color: 'text-emerald-400' },
    engagement_updated: { label: 'Engagement Updated', color: 'text-blue-400' },
    engagement_phase_changed: { label: 'Phase Changed', color: 'text-amber-400' },
    assessment_updated: { label: 'Assessment Updated', color: 'text-blue-400' },
    dependency_updated: { label: 'Dependency Updated', color: 'text-violet-400' },
    scenario_created: { label: 'Scenario Created', color: 'text-amber-400' },
    team_added: { label: 'Team Added', color: 'text-emerald-400' },
    team_removed: { label: 'Team Removed', color: 'text-red-400' },
    invoice_created: { label: 'Invoice Created', color: 'text-emerald-400' },
    invoice_status_changed: { label: 'Invoice Status', color: 'text-amber-400' },
    document_added: { label: 'Document Added', color: 'text-emerald-400' },
    document_removed: { label: 'Document Removed', color: 'text-red-400' },
    commercial_created: { label: 'Commercial Created', color: 'text-emerald-400' },
    milestone_added: { label: 'Milestone Added', color: 'text-blue-400' },
    milestone_completed: { label: 'Milestone Done', color: 'text-emerald-400' },
    settings_updated: { label: 'Settings Updated', color: 'text-gray-400' },
};

export default function ActivityPage() {
    const store = useDiagnosticStore();
    const [filterAction, setFilterAction] = useState<string>('all');

    const filtered = filterAction === 'all'
        ? store.activityLog
        : store.activityLog.filter(e => e.action === filterAction);

    const groupedByDate = filtered.reduce<Record<string, typeof filtered>>((acc, entry) => {
        const date = new Date(entry.timestamp).toLocaleDateString();
        if (!acc[date]) acc[date] = [];
        acc[date].push(entry);
        return acc;
    }, {});

    return (
        <div className="flex h-screen bg-[#050505] text-white overflow-hidden">
            <Sidebar />
            <main className="flex-1 overflow-y-auto ml-64">
                <header className="h-16 border-b border-white/10 flex items-center justify-between px-8 bg-[#0a0a0a]/50 backdrop-blur-md sticky top-0 z-10">
                    <h1 className="text-lg font-medium">Activity Log</h1>
                    <div className="flex items-center gap-2">
                        <Filter className="w-4 h-4 text-gray-500" />
                        <select value={filterAction} onChange={e => setFilterAction(e.target.value)} title="Filter activity" className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs text-white">
                            <option value="all" className="bg-[#0a0a0a]">All Actions</option>
                            {Object.entries(ACTION_LABELS).map(([key, { label }]) => (
                                <option key={key} value={key} className="bg-[#0a0a0a]">{label}</option>
                            ))}
                        </select>
                    </div>
                </header>

                <div className="p-6 max-w-3xl">
                    {filtered.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-24">
                            <Activity className="w-16 h-16 text-gray-600 mb-6" />
                            <h2 className="text-2xl font-light text-gray-300 mb-2">No Activity</h2>
                            <p className="text-gray-500">Actions you take across the platform will appear here.</p>
                        </div>
                    ) : (
                        <div className="space-y-8">
                            {Object.entries(groupedByDate).map(([date, entries]) => (
                                <div key={date}>
                                    <div className="text-xs text-gray-600 uppercase tracking-wider mb-3 sticky top-16 bg-[#050505] py-1">{date}</div>
                                    <div className="space-y-1">
                                        {entries.map(entry => {
                                            const meta = ACTION_LABELS[entry.action] ?? { label: entry.action, color: 'text-gray-400' };
                                            return (
                                                <div key={entry.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors">
                                                    <div className="w-2 h-2 rounded-full bg-current shrink-0" style={{ color: meta.color.replace('text-', '').includes('emerald') ? '#10b981' : meta.color.includes('red') ? '#ef4444' : meta.color.includes('amber') ? '#f59e0b' : meta.color.includes('blue') ? '#3b82f6' : meta.color.includes('violet') ? '#8b5cf6' : '#6b7280' }} />
                                                    <div className="flex-1">
                                                        <span className={`text-xs font-medium ${meta.color}`}>{meta.label}</span>
                                                        <span className="text-sm text-gray-300 ml-2">{entry.details}</span>
                                                    </div>
                                                    <span className="text-[10px] text-gray-700 shrink-0">{new Date(entry.timestamp).toLocaleTimeString()}</span>
                                                </div>
                                            );
                                        })}
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
