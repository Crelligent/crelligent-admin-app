'use client';

import { useState } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { useDiagnosticStore } from '@/lib/store';
import { type AppSettings, type EngagementTier, type EngagementPhase } from '@/lib/types';
import { Settings, Save, Check } from 'lucide-react';

export default function SettingsPage() {
    const store = useDiagnosticStore();
    const [form, setForm] = useState<AppSettings>(store.settings);
    const [saved, setSaved] = useState(false);

    const handleSave = () => {
        store.updateSettings(form);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    return (
        <div className="flex h-screen bg-[#050505] text-white overflow-hidden">
            <Sidebar />
            <main className="flex-1 overflow-y-auto ml-64">
                <header className="h-16 border-b border-white/10 flex items-center justify-between px-8 bg-[#0a0a0a]/50 backdrop-blur-md sticky top-0 z-10">
                    <h1 className="text-lg font-medium">Settings</h1>
                    <button onClick={handleSave} className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${saved ? 'bg-emerald-600 text-white' : 'bg-blue-600 hover:bg-blue-500 text-white'}`}>
                        {saved ? <><Check className="w-4 h-4" /> Saved</> : <><Save className="w-4 h-4" /> Save Changes</>}
                    </button>
                </header>

                <div className="p-6 max-w-2xl space-y-8">
                    {/* Company Info */}
                    <section>
                        <h2 className="text-xs text-gray-500 uppercase tracking-wider mb-4">Company Information</h2>
                        <div className="glass-card rounded-xl border border-white/10 p-6 space-y-4">
                            <div>
                                <label className="block text-xs text-gray-500 mb-1.5">Company Name</label>
                                <input value={form.companyName} onChange={e => setForm(f => ({ ...f, companyName: e.target.value }))} className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none" />
                            </div>
                            <div>
                                <label className="block text-xs text-gray-500 mb-1.5">Tagline</label>
                                <input value={form.companyTagline} onChange={e => setForm(f => ({ ...f, companyTagline: e.target.value }))} className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs text-gray-500 mb-1.5">Contact Email</label>
                                    <input value={form.contactEmail} onChange={e => setForm(f => ({ ...f, contactEmail: e.target.value }))} placeholder="hello@crelligent.com" className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none" />
                                </div>
                                <div>
                                    <label className="block text-xs text-gray-500 mb-1.5">Contact Phone</label>
                                    <input value={form.contactPhone} onChange={e => setForm(f => ({ ...f, contactPhone: e.target.value }))} className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs text-gray-500 mb-1.5">Address</label>
                                <textarea value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} rows={2} className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none resize-none" />
                            </div>
                        </div>
                    </section>

                    {/* Defaults */}
                    <section>
                        <h2 className="text-xs text-gray-500 uppercase tracking-wider mb-4">Defaults</h2>
                        <div className="glass-card rounded-xl border border-white/10 p-6 space-y-4">
                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-xs text-gray-500 mb-1.5">Currency</label>
                                    <select value={form.currency} onChange={e => setForm(f => ({ ...f, currency: e.target.value }))} title="Currency" className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm">
                                        {['NGN', 'USD', 'GBP', 'EUR', 'ZAR'].map(c => <option key={c} value={c} className="bg-[#0a0a0a]">{c}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs text-gray-500 mb-1.5">Default Tier</label>
                                    <select value={form.defaultTier} onChange={e => setForm(f => ({ ...f, defaultTier: e.target.value as EngagementTier }))} title="Default Tier" className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm">
                                        {(['Foundry', 'Edge', 'Enterprise'] as EngagementTier[]).map(t => <option key={t} value={t} className="bg-[#0a0a0a]">{t}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs text-gray-500 mb-1.5">Default Phase</label>
                                    <select value={form.defaultPhase} onChange={e => setForm(f => ({ ...f, defaultPhase: e.target.value as EngagementPhase }))} title="Default Phase" className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm">
                                        {(['Define', 'Build', 'Launch', 'Sustain'] as EngagementPhase[]).map(p => <option key={p} value={p} className="bg-[#0a0a0a]">{p}</option>)}
                                    </select>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Branding */}
                    <section>
                        <h2 className="text-xs text-gray-500 uppercase tracking-wider mb-4">Branding</h2>
                        <div className="glass-card rounded-xl border border-white/10 p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs text-gray-500 mb-1.5">Brand Color</label>
                                    <div className="flex items-center gap-3">
                                        <input type="color" value={form.brandColor} onChange={e => setForm(f => ({ ...f, brandColor: e.target.value }))} className="w-10 h-10 rounded-lg border border-white/10 cursor-pointer" />
                                        <input value={form.brandColor} onChange={e => setForm(f => ({ ...f, brandColor: e.target.value }))} className="flex-1 px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs text-gray-500 mb-1.5">Logo URL</label>
                                    <input value={form.logo} onChange={e => setForm(f => ({ ...f, logo: e.target.value }))} placeholder="https://..." className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none" />
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Data Management */}
                    <section>
                        <h2 className="text-xs text-gray-500 uppercase tracking-wider mb-4">Data Management</h2>
                        <div className="glass-card rounded-xl border border-white/10 p-6">
                            <div className="grid grid-cols-3 gap-4 text-xs">
                                <div className="bg-white/5 rounded-lg p-3">
                                    <div className="text-gray-500">Clients</div>
                                    <div className="text-lg font-light mt-1">{store.clients.length}</div>
                                </div>
                                <div className="bg-white/5 rounded-lg p-3">
                                    <div className="text-gray-500">Engagements</div>
                                    <div className="text-lg font-light mt-1">{store.engagements.length}</div>
                                </div>
                                <div className="bg-white/5 rounded-lg p-3">
                                    <div className="text-gray-500">Activity Entries</div>
                                    <div className="text-lg font-light mt-1">{store.activityLog.length}</div>
                                </div>
                            </div>
                            <p className="text-[10px] text-gray-600 mt-3">All data is stored in browser localStorage. Supabase migration coming soon.</p>
                        </div>
                    </section>
                </div>
            </main>
        </div>
    );
}
