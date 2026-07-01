'use client';

import { useState } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { useDiagnosticStore } from '@/lib/store';
import { type DocumentType, type VaultDocument } from '@/lib/types';
import { Plus, Trash2, X, Archive, FileText, Search, Filter, Tag } from 'lucide-react';

const DOC_TYPES: DocumentType[] = ['Proposal', 'SOW', 'Case Study', 'Report', 'Deliverable', 'Contract', 'Other'];

const TYPE_COLORS: Record<DocumentType, string> = {
    Proposal: 'bg-blue-500/20 text-blue-400',
    SOW: 'bg-violet-500/20 text-violet-400',
    'Case Study': 'bg-emerald-500/20 text-emerald-400',
    Report: 'bg-amber-500/20 text-amber-400',
    Deliverable: 'bg-pink-500/20 text-pink-400',
    Contract: 'bg-red-500/20 text-red-400',
    Other: 'bg-gray-500/20 text-gray-400',
};

export default function DocumentsPage() {
    const store = useDiagnosticStore();
    const [showNew, setShowNew] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterType, setFilterType] = useState<DocumentType | 'All'>('All');
    const [form, setForm] = useState({
        clientId: '', clientName: '', engagementId: '', title: '',
        type: 'Report' as DocumentType, description: '', filePath: '', tagInput: '', tags: [] as string[],
    });

    const addTag = () => {
        if (!form.tagInput.trim() || form.tags.includes(form.tagInput.trim())) return;
        setForm(f => ({ ...f, tags: [...f.tags, f.tagInput.trim()], tagInput: '' }));
    };

    const removeTag = (tag: string) => {
        setForm(f => ({ ...f, tags: f.tags.filter(t => t !== tag) }));
    };

    const handleCreate = () => {
        if (!form.title.trim()) return;
        store.addDocument({
            clientId: form.clientId,
            clientName: form.clientName,
            engagementId: form.engagementId,
            title: form.title,
            type: form.type,
            description: form.description,
            filePath: form.filePath,
            tags: form.tags,
        });
        setForm({ clientId: '', clientName: '', engagementId: '', title: '', type: 'Report', description: '', filePath: '', tagInput: '', tags: [] });
        setShowNew(false);
    };

    const filtered = store.documents.filter(d => {
        const matchesType = filterType === 'All' || d.type === filterType;
        const matchesSearch = !searchQuery || d.title.toLowerCase().includes(searchQuery.toLowerCase())
            || d.clientName.toLowerCase().includes(searchQuery.toLowerCase())
            || d.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
        return matchesType && matchesSearch;
    });

    // Tag cloud
    const allTags = Array.from(new Set(store.documents.flatMap(d => d.tags)));

    return (
        <div className="flex h-screen bg-[#050505] text-white overflow-hidden">
            <Sidebar />
            <main className="flex-1 overflow-y-auto ml-64">
                <header className="h-16 border-b border-white/10 flex items-center justify-between px-8 bg-[#0a0a0a]/50 backdrop-blur-md sticky top-0 z-10">
                    <h1 className="text-lg font-medium">Document Vault</h1>
                    <button onClick={() => setShowNew(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition-colors">
                        <Plus className="w-4 h-4" /> Add Document
                    </button>
                </header>

                <div className="p-6">
                    {/* Stats */}
                    <div className="grid grid-cols-4 gap-3 mb-6">
                        <div className="glass-card p-4 rounded-xl">
                            <div className="text-xs text-gray-500 uppercase mb-1">Total</div>
                            <div className="text-2xl font-light">{store.documents.length}</div>
                        </div>
                        {DOC_TYPES.slice(0, 3).map(t => (
                            <div key={t} className="glass-card p-4 rounded-xl">
                                <div className="text-xs text-gray-500 uppercase mb-1">{t}s</div>
                                <div className="text-2xl font-light">{store.documents.filter(d => d.type === t).length}</div>
                            </div>
                        ))}
                    </div>

                    {/* Search & Filter */}
                    <div className="flex gap-3 mb-6">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                            <input
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                placeholder="Search by title, client, or tag..."
                                className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500"
                            />
                        </div>
                        <select
                            value={filterType}
                            onChange={e => setFilterType(e.target.value as DocumentType | 'All')}
                            title="Filter by type"
                            className="px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:outline-none min-w-[140px]"
                        >
                            <option value="All" className="bg-[#0a0a0a]">All Types</option>
                            {DOC_TYPES.map(t => <option key={t} value={t} className="bg-[#0a0a0a]">{t}</option>)}
                        </select>
                    </div>

                    {/* Tag cloud */}
                    {allTags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-6">
                            {allTags.map(tag => (
                                <button
                                    key={tag}
                                    onClick={() => setSearchQuery(tag)}
                                    className="flex items-center gap-1 px-2 py-1 rounded text-[10px] bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                                >
                                    <Tag className="w-2.5 h-2.5" /> {tag}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Documents List */}
                    {filtered.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-24">
                            <Archive className="w-16 h-16 text-gray-600 mb-6" />
                            <h2 className="text-2xl font-light text-gray-300 mb-2">
                                {store.documents.length === 0 ? 'No Documents' : 'No Results'}
                            </h2>
                            <p className="text-gray-500 mb-8">
                                {store.documents.length === 0
                                    ? 'Add your first document to start building the vault.'
                                    : 'Try adjusting your search or filter.'}
                            </p>
                        </div>
                    ) : (
                        <div className="glass-card rounded-xl border border-white/10 overflow-hidden">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="bg-white/5 text-xs uppercase text-gray-500">
                                        <th className="p-3 text-left">Title</th>
                                        <th className="p-3 text-left">Client</th>
                                        <th className="p-3 text-center">Type</th>
                                        <th className="p-3 text-left">Tags</th>
                                        <th className="p-3 text-left">Date</th>
                                        <th className="p-3 text-center w-16"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filtered.map(doc => (
                                        <tr key={doc.id} className="border-t border-white/5 hover:bg-white/5">
                                            <td className="p-3">
                                                <div className="flex items-center gap-2">
                                                    <FileText className="w-4 h-4 text-gray-500 shrink-0" />
                                                    <div>
                                                        <div className="text-gray-300 font-medium">{doc.title}</div>
                                                        {doc.description && <div className="text-xs text-gray-600 mt-0.5 truncate max-w-xs">{doc.description}</div>}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-3 text-gray-400">{doc.clientName || '—'}</td>
                                            <td className="p-3 text-center">
                                                <span className={`px-2 py-1 rounded-md text-xs font-medium ${TYPE_COLORS[doc.type]}`}>{doc.type}</span>
                                            </td>
                                            <td className="p-3">
                                                <div className="flex flex-wrap gap-1">
                                                    {doc.tags.map(tag => (
                                                        <span key={tag} className="px-1.5 py-0.5 rounded text-[10px] bg-white/5 text-gray-500">{tag}</span>
                                                    ))}
                                                </div>
                                            </td>
                                            <td className="p-3 text-xs text-gray-600">{new Date(doc.createdAt).toLocaleDateString()}</td>
                                            <td className="p-3 text-center">
                                                <button onClick={() => store.removeDocument(doc.id)} className="text-gray-600 hover:text-red-400" aria-label="Remove document">
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* New Document Modal */}
                {showNew && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                        <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-8 w-full max-w-md max-h-[90vh] overflow-y-auto">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-semibold">Add Document</h2>
                                <button onClick={() => setShowNew(false)} aria-label="Close"><X className="w-4 h-4 text-gray-500" /></button>
                            </div>
                            <div className="space-y-4">
                                <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Document Title" className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none" />
                                <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value as DocumentType }))} title="Document type" className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm">
                                    {DOC_TYPES.map(t => <option key={t} value={t} className="bg-[#0a0a0a]">{t}</option>)}
                                </select>
                                <select value={form.engagementId} onChange={e => {
                                    const eng = store.engagements.find(x => x.id === e.target.value);
                                    const client = eng ? store.clients.find(c => c.id === eng.clientId) : null;
                                    setForm(f => ({
                                        ...f, engagementId: e.target.value,
                                        clientId: client?.id ?? '', clientName: eng?.clientName ?? client?.name ?? '',
                                    }));
                                }} title="Linked engagement" className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm">
                                    <option value="" className="bg-[#0a0a0a]">Link to Engagement (optional)</option>
                                    {store.engagements.map(e => <option key={e.id} value={e.id} className="bg-[#0a0a0a]">{e.clientName}</option>)}
                                </select>
                                <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Description" rows={2} className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none resize-none" />
                                <input value={form.filePath} onChange={e => setForm(f => ({ ...f, filePath: e.target.value }))} placeholder="File path or URL" className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none" />

                                {/* Tags */}
                                <div>
                                    <label className="block text-xs text-gray-500 uppercase tracking-wider mb-1.5">Tags</label>
                                    <div className="flex gap-2">
                                        <input value={form.tagInput} onChange={e => setForm(f => ({ ...f, tagInput: e.target.value }))} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTag())} placeholder="Add tag..." className="flex-1 px-3 py-1.5 bg-white/5 border border-white/10 rounded text-xs text-white focus:outline-none" />
                                        <button onClick={addTag} className="px-3 py-1.5 bg-white/10 rounded text-xs text-gray-400 hover:text-white">Add</button>
                                    </div>
                                    {form.tags.length > 0 && (
                                        <div className="flex flex-wrap gap-1.5 mt-2">
                                            {form.tags.map(tag => (
                                                <span key={tag} className="flex items-center gap-1 px-2 py-0.5 rounded text-xs bg-blue-500/20 text-blue-400">
                                                    {tag}
                                                    <button onClick={() => removeTag(tag)} className="hover:text-red-400" aria-label={`Remove tag ${tag}`}><X className="w-2.5 h-2.5" /></button>
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="flex gap-3 mt-6">
                                <button onClick={() => setShowNew(false)} className="flex-1 px-4 py-2.5 text-sm text-gray-400 border border-white/10 rounded-lg hover:bg-white/5">Cancel</button>
                                <button onClick={handleCreate} className="flex-1 px-4 py-2.5 text-sm text-white bg-blue-600 hover:bg-blue-500 rounded-lg font-medium">Add Document</button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
