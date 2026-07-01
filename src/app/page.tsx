'use client';

import { useState } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { useDiagnosticStore } from '@/lib/store';
import { calculateMetaIndices, compositeScore, maturityLevel } from '@/lib/engine';
import { CAPABILITY_NAMES, type EngagementPhase, type ClientStatus } from '@/lib/types';
import { Plus, Building2, TrendingUp, Users, Briefcase, DollarSign, AlertTriangle, Activity, ArrowRight, Search } from 'lucide-react';

export default function DashboardPage() {
  const store = useDiagnosticStore();
  const [showNewClient, setShowNewClient] = useState(false);
  const [newName, setNewName] = useState('');
  const [newIndustry, setNewIndustry] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const activeEngagement = store.getActiveEngagement();
  const indices = activeEngagement ? calculateMetaIndices(activeEngagement) : null;

  const handleAddClient = () => {
    if (!newName.trim()) return;
    store.addClient({
      name: newName.trim(), industry: newIndustry.trim(),
      status: 'Active', tier: 'Foundry', contacts: [], website: '', location: '', notes: '',
    });
    setNewName(''); setNewIndustry(''); setShowNewClient(false);
  };

  // KPIs
  const activeClients = store.clients.filter(c => c.status === 'Active').length;
  const totalRevenue = store.invoices.filter(i => i.status === 'Paid').reduce((s, i) => s + i.amount, 0);
  const outstanding = store.invoices.filter(i => i.status === 'Sent' || i.status === 'Overdue').reduce((s, i) => s + i.amount, 0);
  const teamUtilisation = store.team.length > 0 ? Math.round(store.team.reduce((s, m) => s + m.allocation, 0) / store.team.length) : 0;
  const totalEngagements = store.engagements.length;
  const phaseBreakdown: Record<EngagementPhase, number> = { Define: 0, Build: 0, Launch: 0, Sustain: 0 };
  store.engagements.forEach(e => { if (e.currentPhase in phaseBreakdown) phaseBreakdown[e.currentPhase]++; });

  // Engagement health scores
  const engagementHealth = store.engagements.map(eng => {
    const avgScore = eng.assessments.reduce((s, a) => s + compositeScore(a), 0) / eng.assessments.length;
    const completedMilestones = eng.milestones.filter(m => m.completed).length;
    const totalMilestones = eng.milestones.length;
    const milestoneProgress = totalMilestones > 0 ? (completedMilestones / totalMilestones) * 100 : 0;
    const healthScore = Math.round((avgScore / 5) * 50 + (milestoneProgress / 100) * 50);
    return { id: eng.id, name: eng.clientName, phase: eng.currentPhase, tier: eng.tier, healthScore, avgScore: avgScore.toFixed(1), milestoneProgress: Math.round(milestoneProgress) };
  });

  // Risk alerts
  const overdueInvoices = store.invoices.filter(i => i.status === 'Overdue');
  const highRiskCapabilities = activeEngagement?.assessments.filter(a => a.riskLevel === 'High') ?? [];
  const recentActivity = store.activityLog.slice(0, 8);

  const fmtCurrency = (amount: number) => {
    if (amount === 0) return '₦0';
    return new Intl.NumberFormat('en-NG', { style: 'currency', currency: store.settings.currency || 'NGN', notation: 'compact', maximumFractionDigits: 1 }).format(amount);
  };

  // Search
  const searchResults = searchQuery.trim() ? [
    ...store.clients.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase())).map(c => ({ type: 'Client', name: c.name, href: '/clients' })),
    ...store.engagements.filter(e => e.clientName.toLowerCase().includes(searchQuery.toLowerCase())).map(e => ({ type: 'Engagement', name: e.clientName, href: '/engagements' })),
    ...store.team.filter(m => m.name.toLowerCase().includes(searchQuery.toLowerCase())).map(m => ({ type: 'Team', name: m.name, href: '/team' })),
    ...store.documents.filter(d => d.title.toLowerCase().includes(searchQuery.toLowerCase())).map(d => ({ type: 'Document', name: d.title, href: '/documents' })),
  ].slice(0, 10) : [];

  return (
    <div className="flex h-screen bg-[#050505] text-white overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto ml-64">
        <header className="h-16 border-b border-white/10 flex items-center justify-between px-8 bg-[#0a0a0a]/50 backdrop-blur-md sticky top-0 z-10">
          <div>
            <h1 className="text-lg font-medium">{store.settings.companyName}</h1>
            <p className="text-[10px] text-gray-600">{store.settings.companyTagline}</p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => setSearchOpen(!searchOpen)} className="p-2 hover:bg-white/5 rounded-lg transition-colors" aria-label="Search">
              <Search className="w-4 h-4 text-gray-400" />
            </button>
            <button onClick={() => setShowNewClient(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition-colors">
              <Plus className="w-4 h-4" /> New Client
            </button>
          </div>
        </header>

        {/* Global Search */}
        {searchOpen && (
          <div className="border-b border-white/10 bg-[#0a0a0a] px-8 py-3">
            <input
              value={searchQuery} onChange={e => setSearchQuery(e.target.value)} autoFocus
              placeholder="Search clients, engagements, team, documents..."
              className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500"
            />
            {searchResults.length > 0 && (
              <div className="mt-2 bg-[#111] border border-white/10 rounded-lg overflow-hidden">
                {searchResults.map((r, i) => (
                  <a key={i} href={r.href} className="flex items-center gap-3 px-4 py-2.5 hover:bg-white/5 text-sm">
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-gray-500 uppercase">{r.type}</span>
                    <span className="text-gray-300">{r.name}</span>
                  </a>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="p-6">
          {/* Executive KPIs */}
          <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-3 mb-8">
            <div className="glass-card p-4 rounded-xl">
              <div className="flex items-center gap-2 text-xs text-gray-500 mb-1"><Users className="w-3.5 h-3.5" /> Active Clients</div>
              <div className="text-2xl font-light">{activeClients}</div>
              <div className="text-[10px] text-gray-600">{store.clients.length} total</div>
            </div>
            <div className="glass-card p-4 rounded-xl">
              <div className="flex items-center gap-2 text-xs text-gray-500 mb-1"><Briefcase className="w-3.5 h-3.5" /> Engagements</div>
              <div className="text-2xl font-light">{totalEngagements}</div>
              <div className="text-[10px] text-gray-600">
                {phaseBreakdown.Define}D {phaseBreakdown.Build}B {phaseBreakdown.Launch}L {phaseBreakdown.Sustain}S
              </div>
            </div>
            <div className="glass-card p-4 rounded-xl">
              <div className="flex items-center gap-2 text-xs text-gray-500 mb-1"><TrendingUp className="w-3.5 h-3.5 text-emerald-400" /> Revenue</div>
              <div className="text-2xl font-light text-emerald-400" suppressHydrationWarning>{fmtCurrency(totalRevenue)}</div>
              <div className="text-[10px] text-gray-600" suppressHydrationWarning>{fmtCurrency(outstanding)} outstanding</div>
            </div>
            <div className="glass-card p-4 rounded-xl">
              <div className="flex items-center gap-2 text-xs text-gray-500 mb-1"><Users className="w-3.5 h-3.5" /> Team Utilisation</div>
              <div className={`text-2xl font-light ${teamUtilisation > 80 ? 'text-red-400' : teamUtilisation > 50 ? 'text-amber-400' : 'text-emerald-400'}`}>{teamUtilisation}%</div>
              <div className="text-[10px] text-gray-600">{store.team.length} members</div>
            </div>
            <div className="glass-card p-4 rounded-xl">
              <div className="flex items-center gap-2 text-xs text-gray-500 mb-1"><AlertTriangle className="w-3.5 h-3.5 text-red-400" /> Risk Alerts</div>
              <div className="text-2xl font-light text-red-400">{overdueInvoices.length + highRiskCapabilities.length}</div>
              <div className="text-[10px] text-gray-600">{overdueInvoices.length} overdue, {highRiskCapabilities.length} high risk</div>
            </div>
            <div className="glass-card p-4 rounded-xl">
              <div className="flex items-center gap-2 text-xs text-gray-500 mb-1"><DollarSign className="w-3.5 h-3.5" /> Documents</div>
              <div className="text-2xl font-light">{store.documents.length}</div>
              <div className="text-[10px] text-gray-600">{store.workshops.length} workshops</div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Engagement Health */}
            <div className="lg:col-span-2">
              <h2 className="text-xs text-gray-500 uppercase tracking-wider mb-3">Engagement Health</h2>
              {engagementHealth.length === 0 ? (
                <div className="glass-card rounded-xl border border-white/10 p-8 text-center">
                  <Building2 className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400 mb-4">No engagements yet</p>
                  <button onClick={() => setShowNewClient(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm rounded-lg mx-auto">
                    <Plus className="w-4 h-4" /> Create Client
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  {engagementHealth.map(eh => (
                    <div key={eh.id} className="glass-card rounded-xl border border-white/10 p-4 flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full flex items-center justify-center text-sm font-medium border-2"
                        style={{ borderColor: eh.healthScore >= 70 ? '#10b981' : eh.healthScore >= 40 ? '#f59e0b' : '#ef4444' }}>
                        {eh.healthScore}
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium">{eh.name}</div>
                        <div className="text-xs text-gray-500">{eh.tier} • Maturity {eh.avgScore} • {eh.milestoneProgress}% milestones</div>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${eh.phase === 'Define' ? 'bg-blue-500/20 text-blue-400' :
                          eh.phase === 'Build' ? 'bg-amber-500/20 text-amber-400' :
                            eh.phase === 'Launch' ? 'bg-emerald-500/20 text-emerald-400' :
                              'bg-violet-500/20 text-violet-400'
                        }`}>{eh.phase}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Active Diagnostic (if engaged) */}
              {indices && activeEngagement && (
                <div className="mt-6">
                  <h2 className="text-xs text-gray-500 uppercase tracking-wider mb-3">Active Diagnostic — {activeEngagement.clientName}</h2>
                  <div className="grid grid-cols-4 gap-3">
                    {Object.entries(indices).map(([key, val]) => {
                      const label = key === 'strategicClarity' ? 'Strategic Clarity' : key === 'structuralSoundness' ? 'Structural Soundness' : key === 'executionReadiness' ? 'Execution Readiness' : 'Risk Exposure';
                      const color = key === 'riskExposure' ? (val >= 4 ? 'text-red-400' : 'text-amber-400') : (val >= 4 ? 'text-emerald-400' : val >= 3 ? 'text-blue-400' : 'text-amber-400');
                      return (
                        <div key={key} className="glass-card rounded-xl p-4">
                          <div className="text-xs text-gray-500 mb-1">{label}</div>
                          <div className={`text-2xl font-light ${color}`}>{val.toFixed(1)}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Capacity Planning */}
              {store.team.length > 0 && (
                <div className="mt-6">
                  <h2 className="text-xs text-gray-500 uppercase tracking-wider mb-3">Team Capacity</h2>
                  <div className="glass-card rounded-xl border border-white/10 p-4">
                    <div className="space-y-2">
                      {store.team.map(m => (
                        <div key={m.id} className="flex items-center gap-3">
                          <span className="text-xs text-gray-400 w-28 truncate">{m.name}</span>
                          <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full ${m.allocation > 80 ? 'bg-red-500' : m.allocation > 60 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                              style={{ width: `${m.allocation}%` }} />
                          </div>
                          <span className="text-xs text-gray-500 w-10 text-right">{m.allocation}%</span>
                          <span className="text-[10px] text-gray-600 w-16">{m.role}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column: Activity + Revenue + Alerts */}
            <div className="space-y-6">
              {/* Revenue Forecast */}
              <div>
                <h2 className="text-xs text-gray-500 uppercase tracking-wider mb-3">Revenue Snapshot</h2>
                <div className="glass-card rounded-xl border border-white/10 p-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500">Collected</span>
                    <span className="text-sm text-emerald-400 font-medium" suppressHydrationWarning>{fmtCurrency(totalRevenue)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500">Outstanding</span>
                    <span className="text-sm text-blue-400 font-medium" suppressHydrationWarning>{fmtCurrency(outstanding)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500">Overdue</span>
                    <span className="text-sm text-red-400 font-medium" suppressHydrationWarning>{fmtCurrency(overdueInvoices.reduce((s, i) => s + i.amount, 0))}</span>
                  </div>
                  <div className="border-t border-white/10 pt-3 flex justify-between items-center">
                    <span className="text-xs text-gray-400 font-medium">Pipeline Total</span>
                    <span className="text-sm text-white font-semibold" suppressHydrationWarning>{fmtCurrency(totalRevenue + outstanding)}</span>
                  </div>
                </div>
              </div>

              {/* Risk Alerts */}
              {(overdueInvoices.length > 0 || highRiskCapabilities.length > 0) && (
                <div>
                  <h2 className="text-xs text-gray-500 uppercase tracking-wider mb-3">Risk Alerts</h2>
                  <div className="glass-card rounded-xl border border-red-500/20 p-4 space-y-2">
                    {overdueInvoices.map(inv => (
                      <div key={inv.id} className="flex items-center gap-2 text-xs">
                        <AlertTriangle className="w-3 h-3 text-red-400" />
                        <span className="text-red-400">{inv.clientName}</span>
                        <span className="text-gray-600" suppressHydrationWarning>— overdue invoice {fmtCurrency(inv.amount)}</span>
                      </div>
                    ))}
                    {highRiskCapabilities.map(cap => (
                      <div key={cap.name} className="flex items-center gap-2 text-xs">
                        <AlertTriangle className="w-3 h-3 text-amber-400" />
                        <span className="text-amber-400">{cap.name}</span>
                        <span className="text-gray-600">— High risk capability</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Engagement Selector */}
              {store.engagements.length > 0 && (
                <div>
                  <h2 className="text-xs text-gray-500 uppercase tracking-wider mb-3">Active Engagement</h2>
                  <select
                    value={store.activeEngagementId ?? ''}
                    onChange={e => store.selectEngagement(e.target.value)}
                    title="Active engagement"
                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500"
                  >
                    {store.engagements.map(e => (
                      <option key={e.id} value={e.id} className="bg-[#0a0a0a]">{e.clientName} — v{e.version} ({e.currentPhase})</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Recent Activity */}
              <div>
                <h2 className="text-xs text-gray-500 uppercase tracking-wider mb-3">Recent Activity</h2>
                <div className="glass-card rounded-xl border border-white/10 p-4">
                  {recentActivity.length === 0 ? (
                    <p className="text-xs text-gray-600">No activity yet.</p>
                  ) : (
                    <div className="space-y-2">
                      {recentActivity.map(entry => (
                        <div key={entry.id} className="flex items-start gap-2 text-xs">
                          <Activity className="w-3 h-3 text-gray-600 mt-0.5 shrink-0" />
                          <div>
                            <span className="text-gray-400">{entry.details}</span>
                            <span className="text-gray-700 ml-2">{new Date(entry.timestamp).toLocaleString()}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* New Client Modal */}
        {showNewClient && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-8 w-full max-w-md">
              <h2 className="text-xl font-semibold mb-6">New Client</h2>
              <div className="space-y-4">
                <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="Client Name" className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none" />
                <input value={newIndustry} onChange={e => setNewIndustry(e.target.value)} placeholder="Industry (e.g. Mobility Tech)" className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none" />
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={() => setShowNewClient(false)} className="flex-1 px-4 py-2.5 text-sm text-gray-400 border border-white/10 rounded-lg hover:bg-white/5">Cancel</button>
                <button onClick={handleAddClient} className="flex-1 px-4 py-2.5 text-sm text-white bg-blue-600 hover:bg-blue-500 rounded-lg font-medium">Create Engagement</button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
