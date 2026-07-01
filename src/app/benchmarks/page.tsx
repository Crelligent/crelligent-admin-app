'use client'

import React from 'react'
import { Sidebar } from '@/components/layout/Sidebar'
import { BarChart2, TrendingUp, AlertTriangle } from 'lucide-react'
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
    ScatterChart, Scatter, ZAxis, ReferenceLine
} from 'recharts'

const benchmarkData = [
    { sector: 'Fintech', esre: 78, ttv: 12 },
    { sector: 'Logistics', esre: 62, ttv: 45 },
    { sector: 'Healthtech', esre: 70, ttv: 30 },
    { sector: 'Edtech', esre: 58, ttv: 60 },
    { sector: 'SaaS', esre: 84, ttv: 8 },
]

export default function BenchmarksPage() {
    return (
        <div className="flex h-screen bg-[#050505] text-white overflow-hidden">
            <Sidebar />
            <main className="flex-1 overflow-y-auto ml-64 p-6 lg:p-8">
                <div className="max-w-6xl mx-auto">
            <header className="mb-10 flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-light tracking-tight text-white mb-2">Market Intelligence</h1>
                    <p className="text-white/50 text-sm">Aggregated ESRE diagnostic data across 142 engagements.</p>
                </div>
                <div className="flex gap-4">
                    <button className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm border border-white/10 transition-colors">
                        Export Report
                    </button>
                    <button className="px-4 py-2 bg-[#7B61FF] hover:bg-[#6A50E5] text-white rounded-lg text-sm shadow-[0_0_15px_rgba(123,97,255,0.3)] transition-all">
                        Query Dataset
                    </button>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                {/* Metric Cards */}
                <div className="glass-card p-6 rounded-2xl flex flex-col justify-between">
                    <div className="flex items-center gap-3 text-white/50 mb-4">
                        <BarChart2 className="w-5 h-5 text-[#38BDF8]" />
                        <span className="text-xs font-mono uppercase tracking-widest">Global Avg ESRE</span>
                    </div>
                    <div>
                        <div className="text-4xl font-light text-white mb-1">68.4</div>
                        <div className="text-xs text-[#00B67A] flex items-center gap-1">
                            <TrendingUp className="w-3 h-3" /> +2.1 pts this quarter
                        </div>
                    </div>
                </div>

                <div className="glass-card p-6 rounded-2xl flex flex-col justify-between lg:col-span-2">
                    <div className="flex justify-between items-center mb-6">
                        <div className="flex items-center gap-3 text-white/50">
                            <AlertTriangle className="w-5 h-5 text-[#FF6B35]" />
                            <span className="text-xs font-mono uppercase tracking-widest">Primary Failure Modes (Logistics)</span>
                        </div>
                        <span className="text-xs text-white/30 font-mono">N=42 Engagements</span>
                    </div>
                    <div className="space-y-4">
                        {[
                            { name: 'Last-Mile Unit Economics', value: 84 },
                            { name: 'Driver Retention', value: 72 },
                            { name: 'Route Optimization Algorithm', value: 45 }
                        ].map((item) => (
                            <div key={item.name}>
                                <div className="flex justify-between text-xs mb-1.5">
                                    <span className="text-white/80">{item.name}</span>
                                    <span className="text-white/40">{item.value}% incident rate</span>
                                </div>
                                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                    <div className="h-full bg-gradient-to-r from-[#FF6B35] to-[#FF8C61] rounded-full" style={{ width: `${item.value}%` }} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="glass-card rounded-2xl p-6 h-[400px]">
                <h3 className="text-sm font-medium text-white mb-6">Sector Benchmarks: Time-to-Value vs ESRE Score</h3>
                <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: -20 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                        <XAxis type="number" dataKey="ttv" name="Days to Value" stroke="rgba(255,255,255,0.2)" fontSize={11} tickLine={false} axisLine={false} />
                        <YAxis type="number" dataKey="esre" name="Avg ESRE" stroke="rgba(255,255,255,0.2)" fontSize={11} tickLine={false} axisLine={false} />
                        <RechartsTooltip 
                            cursor={{ strokeDasharray: '3 3', stroke: 'rgba(255,255,255,0.2)' }}
                            content={({ active, payload }) => {
                                if (active && payload && payload.length) {
                                    const data = payload[0].payload
                                    return (
                                        <div className="bg-[#141518] border border-white/10 p-3 rounded-lg shadow-2xl text-xs z-50">
                                            <p className="text-white font-medium mb-1">{data.sector}</p>
                                            <p className="text-white/60">ESRE Score: <span className="text-white">{data.esre}</span></p>
                                            <p className="text-white/60">Avg TTV: <span className="text-white">{data.ttv} days</span></p>
                                        </div>
                                    )
                                }
                                return null
                            }}
                        />
                        <Scatter name="Sectors" data={benchmarkData} fill="#7B61FF" />
                    </ScatterChart>
                </ResponsiveContainer>
            </div>
                </div>
            </main>
        </div>
    )
}
