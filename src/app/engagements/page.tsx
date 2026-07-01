import React from 'react'
import { Sidebar } from '@/components/layout/Sidebar'
import { Briefcase, MapPin, AlertTriangle, Clock } from 'lucide-react'

export default function EngagementsPage() {
    const deployments = [
        { client: 'Apex Logistics', location: 'Lagos, NG', operator: 'Sarah J.', phase: 'Build: Wk 4/12', risk: 'Low' },
        { client: 'Zephyr Finance', location: 'Nairobi, KE', operator: 'Marcus T.', phase: 'Build: Wk 2/8', risk: 'High' },
        { client: 'Kanda Health', location: 'Accra, GH', operator: 'David O.', phase: 'Handover: Wk 1/2', risk: 'Medium' }
    ]

    return (
        <div className="flex h-screen bg-[#050505] text-white overflow-hidden">
            <Sidebar />
            <main className="flex-1 overflow-y-auto ml-64 p-6 lg:p-8">
                <div className="max-w-6xl mx-auto">
                    <header className="mb-10">
                <h1 className="text-3xl font-light tracking-tight text-white mb-2">Implementation Arm</h1>
                <p className="text-white/50 text-sm">Embedded Operator Tracking and Build-Phase Milestones.</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                {/* Embedded Deployments */}
                <div className="glass-card p-6 rounded-2xl col-span-2">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3 text-white/50">
                            <MapPin className="w-5 h-5 text-[#FF6B35]" />
                            <span className="text-xs font-mono uppercase tracking-widest">Active On-Site Deployments</span>
                        </div>
                        <button className="text-xs text-[#7B61FF] font-medium hover:text-[#6A50E5]">View Map</button>
                    </div>

                    <div className="space-y-4">
                        {deployments.map((dep, idx) => (
                            <div key={idx} className="flex items-center justify-between p-4 bg-white/5 border border-white/5 rounded-xl">
                                <div className="flex items-center gap-4">
                                    <div className={`w-2 h-2 rounded-full ${dep.risk === 'Low' ? 'bg-[#00B67A]' : dep.risk === 'Medium' ? 'bg-[#FFB020]' : 'bg-[#FF6B35]'}`} />
                                    <div>
                                        <p className="text-sm font-medium text-white">{dep.client}</p>
                                        <p className="text-xs text-white/50">{dep.location}</p>
                                    </div>
                                </div>
                                <div className="hidden md:block">
                                    <p className="text-xs text-white/50 mb-0.5">Embedded Lead</p>
                                    <p className="text-sm text-white">{dep.operator}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-white/50 mb-0.5">Current Phase</p>
                                    <p className="text-sm font-mono text-[#38BDF8]">{dep.phase}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Execution Risk Matrix */}
                <div className="glass-card p-6 rounded-2xl">
                    <div className="flex items-center gap-3 text-white/50 mb-6">
                        <AlertTriangle className="w-5 h-5 text-[#FFB020]" />
                        <span className="text-xs font-mono uppercase tracking-widest">Execution Risk</span>
                    </div>

                    <div className="space-y-4">
                        <div className="p-4 bg-[#FF6B35]/10 border border-[#FF6B35]/20 rounded-xl">
                            <div className="flex items-start gap-3">
                                <AlertTriangle className="w-4 h-4 text-[#FF6B35] mt-0.5" />
                                <div>
                                    <p className="text-sm font-medium text-white mb-1">Zephyr Finance: Integration Delay</p>
                                    <p className="text-xs text-white/60 leading-relaxed">Core banking API access delayed by 2 weeks. Embedded operator recommends shifting to parallel testing.</p>
                                </div>
                            </div>
                        </div>

                        <div className="p-4 bg-white/5 border border-white/5 rounded-xl">
                            <div className="flex items-start gap-3">
                                <Clock className="w-4 h-4 text-white/40 mt-0.5" />
                                <div>
                                    <p className="text-sm font-medium text-white mb-1">Apex Logistics: Ahead of Schedule</p>
                                    <p className="text-xs text-white/60 leading-relaxed">Route optimization module deployed successfully. Operator moving to training phase.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
                </div>
            </main>
        </div>
    )
}
