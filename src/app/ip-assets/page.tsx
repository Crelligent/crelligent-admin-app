import React from 'react'
import { Sidebar } from '@/components/layout/Sidebar'
import { Shield, Download, CheckCircle2, Globe, FileText } from 'lucide-react'

export default function IpAssetsPage() {
    const licenses = [
        { partner: 'Nairobi Consulting Group', region: 'East Africa', activeEngagements: 4, qaScore: 94, status: 'Active' },
        { partner: 'Dakar Strategy Partners', region: 'Francophone WA', activeEngagements: 2, qaScore: 88, status: 'Active' },
        { partner: 'Atlas Advisory', region: 'North Africa', activeEngagements: 0, qaScore: 0, status: 'Onboarding' }
    ]

    return (
        <div className="flex h-screen bg-[#050505] text-white overflow-hidden">
            <Sidebar />
            <main className="flex-1 overflow-y-auto ml-64 p-6 lg:p-8">
                <div className="max-w-6xl mx-auto">
            <header className="mb-10">
                <h1 className="text-3xl font-light tracking-tight text-white mb-2">ESRE™ Licensing Portal</h1>
                <p className="text-white/50 text-sm">IP Management and Third-Party QA Tracking.</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                {/* Active Licensees */}
                <div className="glass-card p-6 rounded-2xl flex flex-col justify-between col-span-2">
                    <div className="flex items-center gap-3 text-white/50 mb-6">
                        <Globe className="w-5 h-5 text-[#7B61FF]" />
                        <span className="text-xs font-mono uppercase tracking-widest">Active Licensees</span>
                    </div>
                    
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-[10px] uppercase font-mono text-white/40 border-b border-white/5">
                                <tr>
                                    <th className="pb-3 font-medium">Partner Firm</th>
                                    <th className="pb-3 font-medium">Region</th>
                                    <th className="pb-3 font-medium">Active ESREs</th>
                                    <th className="pb-3 font-medium">QA Score</th>
                                    <th className="pb-3 font-medium text-right">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {licenses.map((license, idx) => (
                                    <tr key={idx} className="border-b border-white/5 last:border-0">
                                        <td className="py-4 font-medium text-white">{license.partner}</td>
                                        <td className="py-4 text-white/60">{license.region}</td>
                                        <td className="py-4 text-white/80">{license.activeEngagements}</td>
                                        <td className="py-4">
                                            <span className={`px-2 py-1 rounded text-xs ${license.qaScore > 90 ? 'bg-[#00B67A]/10 text-[#00B67A]' : license.qaScore > 0 ? 'bg-[#FF6B35]/10 text-[#FF6B35]' : 'bg-white/5 text-white/40'}`}>
                                                {license.qaScore > 0 ? `${license.qaScore}/100` : 'N/A'}
                                            </span>
                                        </td>
                                        <td className="py-4 text-right">
                                            <span className="text-xs font-medium px-2 py-1 rounded-full bg-white/5 border border-white/10 text-white/70">
                                                {license.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Secure Asset Portal */}
                <div className="glass-card p-6 rounded-2xl flex flex-col">
                    <div className="flex items-center gap-3 text-white/50 mb-6">
                        <FileText className="w-5 h-5 text-[#38BDF8]" />
                        <span className="text-xs font-mono uppercase tracking-widest">IP Downloads</span>
                    </div>
                    
                    <div className="space-y-3 flex-1">
                        {[
                            { name: 'ESRE Diagnostic Rubric v4.2.pdf', date: 'Oct 12, 2026' },
                            { name: 'Delivery Playbook (Francophone).pdf', date: 'Sep 28, 2026' },
                            { name: 'Interview Question Banks.xlsx', date: 'Sep 15, 2026' }
                        ].map((file, idx) => (
                            <div key={idx} className="p-3 bg-white/5 border border-white/5 rounded-xl flex items-center justify-between group hover:bg-white/10 transition-colors cursor-pointer">
                                <div>
                                    <p className="text-xs font-medium text-white/90 mb-0.5">{file.name}</p>
                                    <p className="text-[10px] text-white/40">{file.date}</p>
                                </div>
                                <Download className="w-4 h-4 text-white/30 group-hover:text-white transition-colors" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
                </div>
            </main>
        </div>
    )
}
