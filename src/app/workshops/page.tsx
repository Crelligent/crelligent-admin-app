'use client';

import { useState } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { useDiagnosticStore } from '@/lib/store';
import { type WorkshopBooking, type WorkshopStatus, type WorkshopType } from '@/lib/types';
import { Plus, X, Calendar, Clock, Users, CheckCircle2, Circle, XCircle } from 'lucide-react';

const TYPES: WorkshopType[] = ['Diagnostic', 'Design Sprint', 'Architecture Review', 'Risk Workshop', 'Custom'];
const STATUSES: WorkshopStatus[] = ['Requested', 'Scheduled', 'Completed', 'Cancelled'];
const STATUS_COLORS: Record<WorkshopStatus, string> = {
    Requested: 'bg-amber-500/20 text-amber-400',
    Scheduled: 'bg-blue-500/20 text-blue-400',
    Completed: 'bg-emerald-500/20 text-emerald-400',
    Cancelled: 'bg-red-500/20 text-red-400',
};

export default function WorkshopsPage() {
    const store = useDiagnosticStore();
    const [showNew, setShowNew] = useState(false);
    const [form, setForm] = useState({
        clientId: '', clientName: '', engagementId: '', type: 'Diagnostic' as WorkshopType,
        title: '', date: '', duration: 120, facilitator: '', attendeesInput: '', agenda: '', notes: '',
    });

    const handleCreate = () => {
        if (!form.title.trim()) return;
        store.addWorkshop({
            clientId: form.clientId, clientName: form.clientName, engagementId: form.engagementId,
            type: form.type, title: form.title, date: form.date, duration: form.duration,
            facilitator: form.facilitator,
            attendees: form.attendeesInput.split(',').map(s => s.trim()).filter(Boolean),
            agenda: form.agenda, status: 'Requested', notes: form.notes,
        });
        setShowNew(false);
    };

    const setStatus = (ws: WorkshopBooking, status: WorkshopStatus) => {
        store.updateWorkshop({ ...ws, status });
    };

    const upcoming = store.workshops.filter(w => w.status === 'Scheduled' || w.status === 'Requested').sort((a, b) => a.date.localeCompare(b.date));
    const past = store.workshops.filter(w => w.status === 'Completed' || w.status === 'Cancelled');

    return (
        <div className="flex h-screen bg-[#050505] text-white overflow-hidden">
            <Sidebar />
            <main className="flex-1 overflow-y-auto ml-64">
                <header className="h-16 border-b border-white/10 flex items-center justify-between px-8 bg-[#0a0a0a]/50 backdrop-blur-md sticky top-0 z-10">
                    <h1 className="text-lg font-medium">Workshop Scheduling</h1>
                    <button onClick={() => setShowNew(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg">
                        <Plus className="w-4 h-4" /> Book Workshop
                    </button>
                </header>

                <div className="p-6">
                    {/* Summary */}
                    <div className="grid grid-cols-4 gap-3 mb-8">
                        {STATUSES.map(s => (
                            <div key={s} className="glass-card p-4 rounded-xl">
                                <div className="text-xs text-gray-500 uppercase mb-1">{s}</div>
                                <div className="text-2xl font-light">{store.workshops.filter(w => w.status === s).length}</div>
                            </div>
                        ))}
                    </div>

                    {/* Upcoming */}
                    <section className="mb-10">
                        <h2 className="text-xs text-gray-500 uppercase tracking-wider mb-4">Upcoming & Pending</h2>
                        {upcoming.length === 0 ? (
                            <div className="glass-card rounded-xl border border-white/10 p-8 text-center">
                                <Calendar className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                                <p className="text-gray-400">No upcoming workshops. Book one to get started.</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {upcoming.map(ws => (
                                    <div key={ws.id} className="glass-card rounded-xl border border-white/10 p-5">
                                        <div className="flex items-start justify-between mb-3">
                                            <div>
                                                <h3 className="text-sm font-semibold">{ws.title}</h3>
                                                <p className="text-xs text-gray-500">{ws.clientName} • {ws.type}</p>
                                            </div>
                                            <span className={`px-2 py-1 rounded-md text-xs font-medium ${STATUS_COLORS[ws.status]}`}>{ws.status}</span>
                                        </div>
                                        <div className="flex flex-wrap gap-4 text-xs text-gray-400 mb-3">
                                            {ws.date && <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{new Date(ws.date).toLocaleDateString()}</span>}
                                            <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{ws.duration} min</span>
                                            {ws.facilitator && <span>Facilitator: {ws.facilitator}</span>}
                                            {ws.attendees.length > 0 && <span className="flex items-center gap-1"><Users className="w-3 h-3" />{ws.attendees.length} attendees</span>}
                                        </div>
                                        {ws.agenda && <p className="text-xs text-gray-500 mb-3 italic">{ws.agenda}</p>}
                                        <div className="flex gap-2">
                                            {ws.status === 'Requested' && <button onClick={() => setStatus(ws, 'Scheduled')} className="text-xs text-blue-400 hover:text-blue-300">Schedule</button>}
                                            {ws.status === 'Scheduled' && <button onClick={() => setStatus(ws, 'Completed')} className="text-xs text-emerald-400 hover:text-emerald-300">Mark Complete</button>}
                                            <button onClick={() => setStatus(ws, 'Cancelled')} className="text-xs text-red-400 hover:text-red-300">Cancel</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>

                    {/* Past */}
                    {past.length > 0 && (
                        <section>
                            <h2 className="text-xs text-gray-500 uppercase tracking-wider mb-4">Past Workshops</h2>
                            <div className="glass-card rounded-xl border border-white/10 overflow-hidden">
                                <table className="w-full text-sm">
                                    <thead><tr className="bg-white/5 text-xs uppercase text-gray-500">
                                        <th className="p-3 text-left">Title</th><th className="p-3 text-left">Client</th><th className="p-3 text-center">Type</th><th className="p-3 text-center">Status</th><th className="p-3 text-left">Date</th>
                                    </tr></thead>
                                    <tbody>
                                        {past.map(ws => (
                                            <tr key={ws.id} className="border-t border-white/5">
                                                <td className="p-3 text-gray-300">{ws.title}</td>
                                                <td className="p-3 text-gray-400">{ws.clientName}</td>
                                                <td className="p-3 text-center text-gray-400">{ws.type}</td>
                                                <td className="p-3 text-center"><span className={`px-2 py-0.5 rounded text-xs ${STATUS_COLORS[ws.status]}`}>{ws.status}</span></td>
                                                <td className="p-3 text-xs text-gray-500">{ws.date ? new Date(ws.date).toLocaleDateString() : '—'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </section>
                    )}
                </div>

                {/* New Workshop Modal */}
                {showNew && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                        <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-8 w-full max-w-lg max-h-[90vh] overflow-y-auto">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-semibold">Book Workshop</h2>
                                <button onClick={() => setShowNew(false)} aria-label="Close"><X className="w-4 h-4 text-gray-500" /></button>
                            </div>
                            <div className="space-y-4">
                                <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Workshop Title" className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none" />
                                <div className="grid grid-cols-2 gap-3">
                                    <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value as WorkshopType }))} title="Workshop type" className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm">
                                        {TYPES.map(t => <option key={t} value={t} className="bg-[#0a0a0a]">{t}</option>)}
                                    </select>
                                    <select value={form.engagementId} onChange={e => {
                                        const eng = store.engagements.find(x => x.id === e.target.value);
                                        setForm(f => ({ ...f, engagementId: e.target.value, clientId: eng?.clientId ?? '', clientName: eng?.clientName ?? '' }));
                                    }} title="Engagement" className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm">
                                        <option value="" className="bg-[#0a0a0a]">Select Client...</option>
                                        {store.engagements.map(e => <option key={e.id} value={e.id} className="bg-[#0a0a0a]">{e.clientName}</option>)}
                                    </select>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none" />
                                    <input type="number" value={form.duration} onChange={e => setForm(f => ({ ...f, duration: Number(e.target.value) }))} placeholder="Duration (min)" className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none" />
                                </div>
                                <input value={form.facilitator} onChange={e => setForm(f => ({ ...f, facilitator: e.target.value }))} placeholder="Facilitator" className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none" />
                                <input value={form.attendeesInput} onChange={e => setForm(f => ({ ...f, attendeesInput: e.target.value }))} placeholder="Attendees (comma-separated)" className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none" />
                                <textarea value={form.agenda} onChange={e => setForm(f => ({ ...f, agenda: e.target.value }))} placeholder="Agenda / Notes" rows={3} className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none resize-none" />
                            </div>
                            <div className="flex gap-3 mt-6">
                                <button onClick={() => setShowNew(false)} className="flex-1 px-4 py-2.5 text-sm text-gray-400 border border-white/10 rounded-lg hover:bg-white/5">Cancel</button>
                                <button onClick={handleCreate} className="flex-1 px-4 py-2.5 text-sm text-white bg-blue-600 hover:bg-blue-500 rounded-lg font-medium">Book</button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
