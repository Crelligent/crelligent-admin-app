import React from 'react'
import { Sidebar } from '@/components/layout/Sidebar'
import { Server, Activity, ArrowUpRight, Database } from 'lucide-react'

export default function CommercialPage() {
    return (
        <div className="flex h-screen bg-[#050505] text-white overflow-hidden">
            <Sidebar />
            <main className="flex-1 overflow-y-auto ml-64 p-6 lg:p-8">
                <div className="max-w-6xl mx-auto">
                    <header className="mb-10">
                <h1 className="text-3xl font-light tracking-tight text-white mb-2">Managed Services</h1>
                <p className="text-white/50 text-sm">Recurring Revenue Operations & Crelligent Infrastructure.</p>
            </header>

            {/* ARR Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="glass-card p-6 rounded-2xl flex flex-col justify-between">
                    <div className="text-xs font-mono uppercase tracking-widest text-white/50 mb-4">Managed Services ARR</div>
                    <div>
                        <div className="text-4xl font-light text-white mb-1">$1.4M</div>
                        <div className="text-xs text-[#00B67A] flex items-center gap-1">
                            <ArrowUpRight className="w-3 h-3" /> +15% YoY
                        </div>
                    </div>
                </div>
                
                <div className="glass-card p-6 rounded-2xl flex flex-col justify-between">
                    <div className="text-xs font-mono uppercase tracking-widest text-white/50 mb-4">Active SLA Breaches</div>
                    <div>
                        <div className="text-4xl font-light text-white mb-1">0</div>
                        <div className="text-xs text-white/40">All systems operating normally.</div>
                    </div>
                </div>

                <div className="glass-card p-6 rounded-2xl flex flex-col justify-between">
                    <div className="text-xs font-mono uppercase tracking-widest text-white/50 mb-4">Data Feed Subscribers</div>
                    <div>
                        <div className="text-4xl font-light text-white mb-1">24</div>
                        <div className="text-xs text-white/40">Intelligence-as-a-Service clients.</div>
                    </div>
                </div>
            </div>

            {/* Live Client Infrastructure */}
            <div className="glass-card rounded-2xl p-6">
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-3 text-white/50">
                        <Server className="w-5 h-5 text-[#38BDF8]" />
                        <span className="text-xs font-mono uppercase tracking-widest">Crelligent Outsourced Operations</span>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-[10px] uppercase font-mono text-white/40 border-b border-white/5">
                            <tr>
                                <th className="pb-3 font-medium">Client</th>
                                <th className="pb-3 font-medium">Service Tier</th>
                                <th className="pb-3 font-medium">Compute Load</th>
                                <th className="pb-3 font-medium">Uptime (30d)</th>
                                <th className="pb-3 font-medium text-right">Data Feeds</th>
                            </tr>
                        </thead>
                        <tbody>
                            {[
                                { client: 'Apex Logistics', tier: 'Fleet Ops (Enterprise)', load: '45%', uptime: '99.99%', feeds: 'Enabled' },
                                { client: 'Nexus AI', tier: 'Intelligence Data Feed', load: '12%', uptime: '100%', feeds: 'Enabled' },
                                { client: 'Global Bank NG', tier: 'Risk Management Ops', load: '88%', uptime: '99.95%', feeds: 'Disabled' },
                            ].map((row, idx) => (
                                <tr key={idx} className="border-b border-white/5 last:border-0 group">
                                    <td className="py-4 font-medium text-white">{row.client}</td>
                                    <td className="py-4 text-[#7B61FF] font-medium">{row.tier}</td>
                                    <td className="py-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-16 h-1.5 bg-white/10 rounded-full overflow-hidden">
                                                <div className="h-full bg-[#38BDF8]" style={{ width: row.load }} />
                                            </div>
                                            <span className="text-xs text-white/60">{row.load}</span>
                                        </div>
                                    </td>
                                    <td className="py-4 text-[#00B67A]">{row.uptime}</td>
                                    <td className="py-4 text-right">
                                        <span className={`px-2 py-1 rounded text-xs ${row.feeds === 'Enabled' ? 'bg-[#7B61FF]/10 text-[#7B61FF]' : 'bg-white/5 text-white/40'}`}>
                                            {row.feeds}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
                </div>
            </main>
        </div>
    )
}
