'use client'

import React, { useEffect, useState } from 'react'
import { Sidebar } from '@/components/layout/Sidebar'
import { Target, Search, Filter, Phone, Mail, Building, Clock, Activity, FileText } from 'lucide-react'

export default function LeadsPage() {
    const [leads, setLeads] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLeads = async () => {
            try {
                const res = await fetch('/api/leads');
                const data = await res.json();
                if (Array.isArray(data)) {
                    setLeads(data);
                }
            } catch (err) {
                console.error("Failed to fetch leads", err);
            } finally {
                setLoading(false);
            }
        };
        fetchLeads();
        
        // Optional: Poll every 10 seconds for new leads since it's a prototype
        const interval = setInterval(fetchLeads, 10000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="flex h-screen bg-[#050505] text-white overflow-hidden">
            <Sidebar />
            <main className="flex-1 overflow-y-auto ml-64 p-6 lg:p-8">
                <div className="max-w-7xl mx-auto">
                    <header className="mb-8 flex justify-between items-end">
                        <div>
                            <h1 className="text-3xl font-light tracking-tight text-white mb-2 flex items-center gap-3">
                                <Target className="w-8 h-8 text-[#7B61FF]" />
                                Inbound Leads Inbox
                            </h1>
                            <p className="text-white/50 text-sm">Real-time AI qualified leads from your landing page engine.</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="relative">
                                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                                <input 
                                    type="text" 
                                    placeholder="Search leads..." 
                                    className="pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm w-64 focus:outline-none focus:border-[#7B61FF]/50 transition-colors"
                                />
                            </div>
                            <button className="p-2 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors">
                                <Filter className="w-4 h-4 text-white/70" />
                            </button>
                        </div>
                    </header>

                    {loading ? (
                        <div className="flex justify-center items-center h-64 text-white/40 text-sm">
                            <Activity className="w-5 h-5 animate-spin mr-2" /> Loading incoming leads...
                        </div>
                    ) : leads.length === 0 ? (
                        <div className="glass-card p-12 rounded-2xl flex flex-col items-center justify-center text-center border-dashed">
                            <div className="w-16 h-16 rounded-full bg-[#7B61FF]/10 flex items-center justify-center mb-4">
                                <Target className="w-8 h-8 text-[#7B61FF]" />
                            </div>
                            <h3 className="text-lg font-medium text-white mb-2">No leads received yet</h3>
                            <p className="text-sm text-white/50 max-w-md">
                                When your AI agent qualifies a prospect, the webhook will automatically drop them here instantly. Run a test from your lead engine to see it in action.
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-4">
                            {leads.map((lead, idx) => (
                                <div key={idx} className="glass-card p-0 rounded-2xl overflow-hidden flex flex-col lg:flex-row group transition-all hover:border-[#7B61FF]/30">
                                    {/* Left Status Bar */}
                                    <div className={`w-1.5 shrink-0 ${lead.status === 'hot' ? 'bg-[#FF6B35]' : lead.status === 'warm' ? 'bg-[#FFB020]' : 'bg-[#38BDF8]'}`} />
                                    
                                    <div className="flex-1 p-6 flex flex-col lg:flex-row gap-8">
                                        {/* Identity */}
                                        <div className="lg:w-1/4 space-y-4">
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h3 className="text-lg font-medium text-white">{lead.name || 'Anonymous Prospect'}</h3>
                                                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider ${
                                                        lead.status === 'hot' ? 'bg-[#FF6B35]/10 text-[#FF6B35] border border-[#FF6B35]/20' : 
                                                        lead.status === 'warm' ? 'bg-[#FFB020]/10 text-[#FFB020] border border-[#FFB020]/20' : 
                                                        'bg-[#38BDF8]/10 text-[#38BDF8] border border-[#38BDF8]/20'
                                                    }`}>
                                                        {lead.status || 'NEW'}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-[#7B61FF] font-medium flex items-center gap-2">
                                                    <Building className="w-3.5 h-3.5" />
                                                    {lead.company || 'Unknown Company'}
                                                </p>
                                                <p className="text-xs text-white/50">{lead.role}</p>
                                            </div>

                                            <div className="space-y-2 text-xs text-white/60">
                                                {lead.email && (
                                                    <div className="flex items-center gap-2">
                                                        <Mail className="w-3.5 h-3.5" /> {lead.email}
                                                    </div>
                                                )}
                                                {lead.phone && (
                                                    <div className="flex items-center gap-2">
                                                        <Phone className="w-3.5 h-3.5" /> {lead.phone}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Qualification Score */}
                                        <div className="lg:w-1/4">
                                            <div className="mb-4">
                                                <div className="flex justify-between text-xs mb-1">
                                                    <span className="text-white/50 uppercase font-mono tracking-widest">AI ESRE Score</span>
                                                    <span className="text-white font-medium">{lead.score || 0}/100</span>
                                                </div>
                                                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                                    <div 
                                                        className={`h-full rounded-full ${lead.score >= 75 ? 'bg-[#FF6B35]' : lead.score >= 50 ? 'bg-[#FFB020]' : 'bg-[#38BDF8]'}`}
                                                        style={{ width: `${lead.score || 0}%` }}
                                                    />
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-xs">
                                                <div>
                                                    <p className="text-white/40 mb-0.5">Budget</p>
                                                    <p className="text-white font-medium">{lead.budget || 'Unknown'}</p>
                                                </div>
                                                <div>
                                                    <p className="text-white/40 mb-0.5">Urgency</p>
                                                    <p className="text-white font-medium">{lead.urgency || 'Unknown'}</p>
                                                </div>
                                                <div>
                                                    <p className="text-white/40 mb-0.5">Segment</p>
                                                    <p className="text-white font-medium">{lead.segment || 'Unknown'}</p>
                                                </div>
                                                <div>
                                                    <p className="text-white/40 mb-0.5">Source</p>
                                                    <p className="text-white font-medium capitalize">{lead.source || 'Unknown'}</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Summary & Recommendation */}
                                        <div className="flex-1 space-y-4">
                                            <div className="p-3 bg-[#0a0a0a] border border-white/5 rounded-lg relative overflow-hidden">
                                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#7B61FF]/50" />
                                                <p className="text-xs text-white/40 mb-1 font-mono uppercase">Problem Summary</p>
                                                <p className="text-sm text-white/90 leading-relaxed">{lead.problem_summary || 'No summary generated.'}</p>
                                            </div>
                                            
                                            <div className="p-3 bg-[#00B67A]/5 border border-[#00B67A]/10 rounded-lg relative overflow-hidden">
                                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#00B67A]/50" />
                                                <p className="text-xs text-[#00B67A]/60 mb-1 font-mono uppercase">Crelligent Recommendation</p>
                                                <p className="text-sm text-white/90 leading-relaxed">{lead.recommendation || 'No recommendation.'}</p>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {/* Action Column */}
                                    <div className="lg:w-48 bg-white/[0.02] border-l border-white/5 p-6 flex flex-col justify-between items-center text-center">
                                        <div className="w-full">
                                            <div className="text-[10px] text-white/40 mb-1 flex items-center justify-center gap-1">
                                                <Clock className="w-3 h-3" /> Captured At
                                            </div>
                                            <div className="text-xs text-white/80 mb-6">
                                                {lead.captured_at ? new Date(lead.captured_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Unknown'}
                                            </div>
                                        </div>

                                        <div className="w-full space-y-2">
                                            <button className="w-full py-2 bg-[#7B61FF] hover:bg-[#6A50E5] text-white text-xs font-medium rounded transition-colors shadow-[0_0_10px_rgba(123,97,255,0.2)]">
                                                Accept Lead
                                            </button>
                                            <button className="w-full py-2 bg-transparent border border-white/10 hover:bg-white/5 text-white/60 text-xs font-medium rounded transition-colors flex items-center justify-center gap-2">
                                                <FileText className="w-3.5 h-3.5" /> Transcript
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    )
}
