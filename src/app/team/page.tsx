'use client';

import { useState } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { useDiagnosticStore } from '@/lib/store';
import { type TeamMember, type TeamRole } from '@/lib/types';
import { Plus, Trash2, Pencil, X, UserCog, Briefcase } from 'lucide-react';

const ROLE_COLORS: Record<TeamRole, string> = {
    Lead: 'bg-violet-500/20 text-violet-400',
    Strategist: 'bg-blue-500/20 text-blue-400',
    Engineer: 'bg-emerald-500/20 text-emerald-400',
    Designer: 'bg-pink-500/20 text-pink-400',
    Analyst: 'bg-amber-500/20 text-amber-400',
    Advisor: 'bg-gray-500/20 text-gray-400',
};

const ALL_ROLES: TeamRole[] = ['Lead', 'Strategist', 'Engineer', 'Designer', 'Analyst', 'Advisor'];

const emptyForm = { name: '', role: 'Strategist' as TeamRole, email: '', allocation: 100, rate: 0, notes: '' };

export default function TeamPage() {
    const store = useDiagnosticStore();
    const [showNew, setShowNew] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [form, setForm] = useState(emptyForm);

    const handleCreate = () => {
        if (!form.name.trim()) return;
        store.addTeamMember({ ...form, assignedEngagements: [] });
        setForm(emptyForm);
        setShowNew(false);
    };

    const startEdit = (m: TeamMember) => {
        setForm({ name: m.name, role: m.role, email: m.email, allocation: m.allocation, rate: m.rate, notes: m.notes });
        setEditingId(m.id);
    };

    const handleUpdate = () => {
        if (!editingId) return;
        const existing = store.team.find(m => m.id === editingId);
        if (!existing) return;
        store.updateTeamMember({ ...existing, ...form });
        setEditingId(null);
        setForm(emptyForm);
    };

    const toggleEngagement = (memberId: string, engId: string) => {
        const member = store.team.find(m => m.id === memberId);
        if (!member) return;
        const has = member.assignedEngagements.includes(engId);
        store.updateTeamMember({
            ...member,
            assignedEngagements: has
                ? member.assignedEngagements.filter(e => e !== engId)
                : [...member.assignedEngagements, engId],
        });
    };

    const totalAllocation = store.team.reduce((s, m) => s + m.allocation, 0);
    const avgAllocation = store.team.length > 0 ? Math.round(totalAllocation / store.team.length) : 0;

    return (
        <div className="flex h-screen bg-[#050505] text-white overflow-hidden">
            <Sidebar />
            <main className="flex-1 overflow-y-auto ml-64">
                <header className="h-16 border-b border-white/10 flex items-center justify-between px-8 bg-[#0a0a0a]/50 backdrop-blur-md sticky top-0 z-10">
                    <h1 className="text-lg font-medium">Team & Resourcing</h1>
                    <button onClick={() => { setForm(emptyForm); setShowNew(true); }} className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium rounded-lg transition-colors">
                        <Plus className="w-4 h-4" /> Add Member
                    </button>
                </header>

                <div className="p-6">
                    {/* Summary */}
                    <div className="grid grid-cols-4 gap-3 mb-8">
                        <div className="glass-card p-4 rounded-xl">
                            <div className="text-xs text-gray-500 uppercase mb-1">Team Size</div>
                            <div className="text-2xl font-light">{store.team.length}</div>
                        </div>
                        <div className="glass-card p-4 rounded-xl">
                            <div className="text-xs text-gray-500 uppercase mb-1">Avg Allocation</div>
                            <div className="text-2xl font-light">{avgAllocation}%</div>
                        </div>
                        {ALL_ROLES.slice(0, 2).map(role => (
                            <div key={role} className="glass-card p-4 rounded-xl">
                                <div className="text-xs text-gray-500 uppercase mb-1">{role}s</div>
                                <div className="text-2xl font-light">{store.team.filter(m => m.role === role).length}</div>
                            </div>
                        ))}
                    </div>

                    {store.team.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-24">
                            <UserCog className="w-16 h-16 text-gray-600 mb-6" />
                            <h2 className="text-2xl font-light text-gray-300 mb-2">No Team Members</h2>
                            <p className="text-gray-500 mb-8">Add team members to manage resourcing and allocations.</p>
                            <button onClick={() => setShowNew(true)} className="flex items-center gap-2 px-6 py-3 bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium rounded-lg">
                                <Plus className="w-4 h-4" /> Add First Member
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                            {store.team.map(member => (
                                <div key={member.id} className="glass-card rounded-xl border border-white/10 p-5">
                                    <div className="flex items-start justify-between mb-3">
                                        <div>
                                            <h3 className="text-sm font-semibold">{member.name}</h3>
                                            <p className="text-xs text-gray-500">{member.email}</p>
                                        </div>
                                        <span className={`px-2 py-1 rounded-md text-xs font-medium ${ROLE_COLORS[member.role]}`}>{member.role}</span>
                                    </div>

                                    {/* Allocation Bar */}
                                    <div className="mb-3">
                                        <div className="flex justify-between text-[10px] text-gray-500 mb-1">
                                            <span>Allocation</span>
                                            <span>{member.allocation}%</span>
                                        </div>
                                        <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                                            <div className={`h-full rounded-full transition-all ${member.allocation > 80 ? 'bg-red-500' : member.allocation > 50 ? 'bg-amber-500' : 'bg-emerald-500'}`} style={{ width: `${member.allocation}%` }} />
                                        </div>
                                    </div>

                                    {/* Assigned Engagements */}
                                    <div className="mb-3">
                                        <div className="text-[10px] text-gray-600 uppercase mb-1">Assigned</div>
                                        <div className="flex flex-wrap gap-1">
                                            {store.engagements.map(eng => {
                                                const assigned = member.assignedEngagements.includes(eng.id);
                                                return (
                                                    <button
                                                        key={eng.id}
                                                        onClick={() => toggleEngagement(member.id, eng.id)}
                                                        className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] transition-colors ${assigned ? 'bg-violet-500/20 text-violet-400' : 'bg-white/5 text-gray-600 hover:text-gray-400'
                                                            }`}
                                                    >
                                                        <Briefcase className="w-2.5 h-2.5" />
                                                        {eng.clientName}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    <div className="flex gap-2">
                                        <button onClick={() => startEdit(member)} className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300">
                                            <Pencil className="w-3 h-3" /> Edit
                                        </button>
                                        <button onClick={() => store.removeTeamMember(member.id)} className="flex items-center gap-1 text-xs text-red-400 hover:text-red-300">
                                            <Trash2 className="w-3 h-3" /> Remove
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* New / Edit Modal */}
                {(showNew || editingId) && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                        <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-8 w-full max-w-md">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-semibold">{editingId ? 'Edit Member' : 'New Team Member'}</h2>
                                <button onClick={() => { setShowNew(false); setEditingId(null); }} aria-label="Close"><X className="w-4 h-4 text-gray-500" /></button>
                            </div>
                            <div className="space-y-4">
                                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Full Name" className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none" />
                                <input value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="Email" className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none" />
                                <div className="grid grid-cols-2 gap-3">
                                    <select value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value as TeamRole }))} title="Role" className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm">
                                        {ALL_ROLES.map(r => <option key={r} value={r} className="bg-[#0a0a0a]">{r}</option>)}
                                    </select>
                                    <div>
                                        <input type="number" min={0} max={100} value={form.allocation} onChange={e => setForm(f => ({ ...f, allocation: Number(e.target.value) }))} placeholder="Allocation %" className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none" />
                                    </div>
                                </div>
                                <input type="number" value={form.rate || ''} onChange={e => setForm(f => ({ ...f, rate: Number(e.target.value) }))} placeholder="Rate (daily/hourly)" className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none" />
                                <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Notes" rows={2} className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none resize-none" />
                            </div>
                            <div className="flex gap-3 mt-6">
                                <button onClick={() => { setShowNew(false); setEditingId(null); }} className="flex-1 px-4 py-2.5 text-sm text-gray-400 border border-white/10 rounded-lg hover:bg-white/5">Cancel</button>
                                <button onClick={editingId ? handleUpdate : handleCreate} className="flex-1 px-4 py-2.5 text-sm text-white bg-violet-600 hover:bg-violet-500 rounded-lg font-medium">
                                    {editingId ? 'Save Changes' : 'Add Member'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
