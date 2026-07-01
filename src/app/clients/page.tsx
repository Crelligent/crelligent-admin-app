'use client';

import { useState } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { useDiagnosticStore } from '@/lib/store';
import { type Client, type ClientStatus, type EngagementTier, type ClientContact } from '@/lib/types';
import { Plus, Trash2, Pencil, X, Users, Mail, Phone, Globe, MapPin } from 'lucide-react';

const STATUS_COLORS: Record<ClientStatus, string> = {
    Lead: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    Active: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    Paused: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    Completed: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    Churned: 'bg-red-500/20 text-red-400 border-red-500/30',
};

const TIER_COLORS: Record<EngagementTier, string> = {
    Foundry: 'bg-emerald-500/20 text-emerald-400',
    Edge: 'bg-blue-500/20 text-blue-400',
    Enterprise: 'bg-violet-500/20 text-violet-400',
};

export default function ClientsPage() {
    const store = useDiagnosticStore();
    const [editingClient, setEditingClient] = useState<Client | null>(null);
    const [showNew, setShowNew] = useState(false);
    const [form, setForm] = useState({
        name: '', industry: '', status: 'Lead' as ClientStatus, tier: 'Foundry' as EngagementTier,
        website: '', location: '', notes: '',
    });
    const [newContact, setNewContact] = useState<ClientContact>({ name: '', role: '', email: '', phone: '' });

    const resetForm = () => {
        setForm({ name: '', industry: '', status: 'Lead', tier: 'Foundry', website: '', location: '', notes: '' });
        setNewContact({ name: '', role: '', email: '', phone: '' });
    };

    const handleCreate = () => {
        if (!form.name.trim()) return;
        store.addClient({ ...form, contacts: [] });
        resetForm();
        setShowNew(false);
    };

    const handleUpdate = () => {
        if (!editingClient) return;
        store.updateClient(editingClient);
        setEditingClient(null);
    };

    const addContactToEditing = () => {
        if (!editingClient || !newContact.name.trim()) return;
        setEditingClient({
            ...editingClient,
            contacts: [...editingClient.contacts, { ...newContact }],
        });
        setNewContact({ name: '', role: '', email: '', phone: '' });
    };

    const removeContactFromEditing = (idx: number) => {
        if (!editingClient) return;
        setEditingClient({
            ...editingClient,
            contacts: editingClient.contacts.filter((_, i) => i !== idx),
        });
    };

    const engagementCount = (clientId: string) =>
        store.engagements.filter(e => e.clientId === clientId).length;

    return (
        <div className="flex h-screen bg-[#050505] text-white overflow-hidden">
            <Sidebar />
            <main className="flex-1 overflow-y-auto ml-64">
                <header className="h-16 border-b border-white/10 flex items-center justify-between px-8 bg-[#0a0a0a]/50 backdrop-blur-md sticky top-0 z-10">
                    <h1 className="text-lg font-medium">Client Management</h1>
                    <button
                        onClick={() => { resetForm(); setShowNew(true); }}
                        className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium rounded-lg transition-colors"
                    >
                        <Plus className="w-4 h-4" /> New Client
                    </button>
                </header>

                <div className="p-6">
                    {/* Summary Row */}
                    <div className="grid grid-cols-5 gap-3 mb-8">
                        {(['Lead', 'Active', 'Paused', 'Completed', 'Churned'] as ClientStatus[]).map(s => (
                            <div key={s} className="glass-card p-4 rounded-xl">
                                <div className="text-xs text-gray-500 uppercase mb-1">{s}</div>
                                <div className="text-2xl font-light">{store.clients.filter(c => c.status === s).length}</div>
                            </div>
                        ))}
                    </div>

                    {/* Client Cards */}
                    {store.clients.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-24">
                            <Users className="w-16 h-16 text-gray-600 mb-6" />
                            <h2 className="text-2xl font-light text-gray-300 mb-2">No Clients Yet</h2>
                            <p className="text-gray-500 mb-8">Add your first client to begin tracking engagements.</p>
                            <button onClick={() => setShowNew(true)} className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium rounded-lg">
                                <Plus className="w-4 h-4" /> Add Client
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            {store.clients.map(client => (
                                <div key={client.id} className="glass-card rounded-xl border border-white/10 p-5">
                                    <div className="flex items-start justify-between mb-4">
                                        <div>
                                            <h3 className="text-base font-semibold mb-1">{client.name}</h3>
                                            <p className="text-xs text-gray-500">{client.industry} • {engagementCount(client.id)} engagement{engagementCount(client.id) !== 1 ? 's' : ''}</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className={`px-2.5 py-1 rounded-md text-xs font-medium border ${STATUS_COLORS[client.status]}`}>{client.status}</span>
                                            <span className={`px-2.5 py-1 rounded-md text-xs font-medium ${TIER_COLORS[client.tier]}`}>{client.tier}</span>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap gap-3 text-xs text-gray-500 mb-4">
                                        {client.location && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{client.location}</span>}
                                        {client.website && <span className="flex items-center gap-1"><Globe className="w-3 h-3" />{client.website}</span>}
                                        <span>Added {new Date(client.createdAt).toLocaleDateString()}</span>
                                    </div>

                                    {client.contacts.length > 0 && (
                                        <div className="border-t border-white/5 pt-3 mb-3 space-y-1.5">
                                            {client.contacts.map((c, i) => (
                                                <div key={i} className="flex items-center gap-3 text-xs">
                                                    <span className="text-gray-300 font-medium">{c.name}</span>
                                                    <span className="text-gray-600">{c.role}</span>
                                                    {c.email && <span className="flex items-center gap-1 text-gray-500"><Mail className="w-3 h-3" />{c.email}</span>}
                                                    {c.phone && <span className="flex items-center gap-1 text-gray-500"><Phone className="w-3 h-3" />{c.phone}</span>}
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    <div className="flex gap-2 mt-2">
                                        <button onClick={() => setEditingClient({ ...client })} className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300">
                                            <Pencil className="w-3 h-3" /> Edit
                                        </button>
                                        <button onClick={() => store.removeClient(client.id)} className="flex items-center gap-1 text-xs text-red-400 hover:text-red-300">
                                            <Trash2 className="w-3 h-3" /> Remove
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* New Client Modal */}
                {showNew && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                        <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-8 w-full max-w-md">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-semibold">New Client</h2>
                                <button onClick={() => setShowNew(false)} aria-label="Close"><X className="w-4 h-4 text-gray-500" /></button>
                            </div>
                            <div className="space-y-4">
                                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Client Name" className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none" />
                                <input value={form.industry} onChange={e => setForm(f => ({ ...f, industry: e.target.value }))} placeholder="Industry (e.g. Mobility Tech)" className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none" />
                                <div className="grid grid-cols-2 gap-3">
                                    <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as ClientStatus }))} title="Status" className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm">
                                        {(['Lead', 'Active', 'Paused', 'Completed', 'Churned'] as ClientStatus[]).map(s => <option key={s} value={s} className="bg-[#0a0a0a]">{s}</option>)}
                                    </select>
                                    <select value={form.tier} onChange={e => setForm(f => ({ ...f, tier: e.target.value as EngagementTier }))} title="Tier" className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm">
                                        {(['Foundry', 'Edge', 'Enterprise'] as EngagementTier[]).map(t => <option key={t} value={t} className="bg-[#0a0a0a]">{t}</option>)}
                                    </select>
                                </div>
                                <input value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} placeholder="Location" className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none" />
                                <input value={form.website} onChange={e => setForm(f => ({ ...f, website: e.target.value }))} placeholder="Website" className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none" />
                            </div>
                            <div className="flex gap-3 mt-6">
                                <button onClick={() => setShowNew(false)} className="flex-1 px-4 py-2.5 text-sm text-gray-400 border border-white/10 rounded-lg hover:bg-white/5">Cancel</button>
                                <button onClick={handleCreate} className="flex-1 px-4 py-2.5 text-sm text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg font-medium">Create</button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Edit Client Modal */}
                {editingClient && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                        <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-8 w-full max-w-lg max-h-[90vh] overflow-y-auto">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-semibold">Edit Client</h2>
                                <button onClick={() => setEditingClient(null)} aria-label="Close"><X className="w-4 h-4 text-gray-500" /></button>
                            </div>
                            <div className="space-y-4">
                                <input value={editingClient.name} onChange={e => setEditingClient({ ...editingClient, name: e.target.value })} placeholder="Client Name" className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none" />
                                <input value={editingClient.industry} onChange={e => setEditingClient({ ...editingClient, industry: e.target.value })} placeholder="Industry" className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none" />
                                <div className="grid grid-cols-2 gap-3">
                                    <select value={editingClient.status} onChange={e => setEditingClient({ ...editingClient, status: e.target.value as ClientStatus })} title="Status" className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm">
                                        {(['Lead', 'Active', 'Paused', 'Completed', 'Churned'] as ClientStatus[]).map(s => <option key={s} value={s} className="bg-[#0a0a0a]">{s}</option>)}
                                    </select>
                                    <select value={editingClient.tier} onChange={e => setEditingClient({ ...editingClient, tier: e.target.value as EngagementTier })} title="Tier" className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm">
                                        {(['Foundry', 'Edge', 'Enterprise'] as EngagementTier[]).map(t => <option key={t} value={t} className="bg-[#0a0a0a]">{t}</option>)}
                                    </select>
                                </div>
                                <input value={editingClient.location} onChange={e => setEditingClient({ ...editingClient, location: e.target.value })} placeholder="Location" className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none" />
                                <input value={editingClient.website} onChange={e => setEditingClient({ ...editingClient, website: e.target.value })} placeholder="Website" className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none" />
                                <textarea value={editingClient.notes} onChange={e => setEditingClient({ ...editingClient, notes: e.target.value })} placeholder="Notes" rows={2} className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none resize-none" />

                                {/* Contacts */}
                                <div className="border-t border-white/10 pt-4">
                                    <label className="block text-xs text-gray-500 uppercase tracking-wider mb-2">Contacts</label>
                                    {editingClient.contacts.map((c, i) => (
                                        <div key={i} className="flex items-center gap-2 bg-white/5 rounded-lg p-2 mb-2 text-xs">
                                            <span className="text-gray-300 font-medium">{c.name}</span>
                                            <span className="text-gray-600">{c.role}</span>
                                            <span className="text-gray-500 flex-1">{c.email}</span>
                                            <button onClick={() => removeContactFromEditing(i)} aria-label="Remove contact"><Trash2 className="w-3 h-3 text-red-400" /></button>
                                        </div>
                                    ))}
                                    <div className="grid grid-cols-4 gap-2 mt-2">
                                        <input value={newContact.name} onChange={e => setNewContact(c => ({ ...c, name: e.target.value }))} placeholder="Name" className="px-2 py-1.5 bg-white/5 border border-white/10 rounded text-xs text-white focus:outline-none" />
                                        <input value={newContact.role} onChange={e => setNewContact(c => ({ ...c, role: e.target.value }))} placeholder="Role" className="px-2 py-1.5 bg-white/5 border border-white/10 rounded text-xs text-white focus:outline-none" />
                                        <input value={newContact.email} onChange={e => setNewContact(c => ({ ...c, email: e.target.value }))} placeholder="Email" className="px-2 py-1.5 bg-white/5 border border-white/10 rounded text-xs text-white focus:outline-none" />
                                        <button onClick={addContactToEditing} className="px-2 py-1.5 bg-emerald-600 text-white text-xs rounded">Add</button>
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-3 mt-6">
                                <button onClick={() => setEditingClient(null)} className="flex-1 px-4 py-2.5 text-sm text-gray-400 border border-white/10 rounded-lg hover:bg-white/5">Cancel</button>
                                <button onClick={handleUpdate} className="flex-1 px-4 py-2.5 text-sm text-white bg-blue-600 hover:bg-blue-500 rounded-lg font-medium">Save Changes</button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
