import { createClient } from '@supabase/supabase-js'
import { Activity, Zap, Server, Shield, Database, LayoutTemplate, Settings2 } from 'lucide-react'
import { Sidebar } from '@/components/layout/Sidebar'

export const metadata = {
  title: 'ESRE OS | Intelligence Engine Dashboard',
}

export default async function EsreOsDashboard() {
  
  // Use standard supabase-js with the Service Role Key to bypass RLS
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!,
    {
      auth: { persistSession: false }
    }
  )

  // Fetch CRD Accounts
  const { data: accounts } = await supabase
    .from('crd_accounts')
    .select('*, organizations(name)')
    
  // Fetch Executions
  const { data: executions } = await supabase
    .from('agent_executions')
    .select(`
      id, status, started_at, completed_at, outputs,
      l2_workflows (name),
      l2_workflow_steps (step_name, execution_type, cost_crd)
    `)
    .order('started_at', { ascending: false })
    .limit(10)

  return (
    <div className="flex h-screen overflow-hidden bg-black text-gray-100 font-sans">
      <Sidebar />
      <main className="flex-1 overflow-y-auto ml-64">
        <div className="p-8 max-w-7xl mx-auto pb-24">
          
          <div className="space-y-8">
            <header className="border-b border-gray-800 pb-6 flex justify-between items-end">
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-[#3b82f6] to-[#a855f7] bg-clip-text text-transparent flex items-center gap-3">
                  <Settings2 className="w-8 h-8 text-blue-500" />
                  ESRE OS AI Network Dashboard
                </h1>
                <p className="text-gray-400 mt-2">Live monitoring of the L2 Scheduler and CRD Ledger.</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                </span>
                <span className="text-green-500 font-medium text-sm tracking-widest uppercase">System Online</span>
              </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* CRD Ledger Card */}
              <div className="col-span-1 md:col-span-3 bg-[#111] border border-gray-800 rounded-xl p-6">
                <h2 className="text-lg font-semibold text-gray-300 mb-4 flex items-center gap-2">
                  <Database className="w-5 h-5 text-purple-400" /> 
                  CRD Ledger Network
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                  {accounts?.map((acc: any) => (
                    <div key={acc.id} className="bg-black/50 border border-gray-800/50 rounded-lg p-4">
                      <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">{acc.organizations?.name}</p>
                      <p className="text-3xl font-light text-white">{Number(acc.balance).toFixed(2)} <span className="text-sm text-gray-500 font-normal">CRD</span></p>
                      <div className="mt-4 flex justify-between text-xs text-gray-400">
                        <span>Reserved: {Number(acc.reserved_balance).toFixed(2)}</span>
                        <span className={acc.status === 'active' ? 'text-green-400' : 'text-red-400'}>{acc.status}</span>
                      </div>
                    </div>
                  ))}
                  {(!accounts || accounts.length === 0) && <p className="text-gray-500">No CRD accounts found.</p>}
                </div>
              </div>
            </div>

            <div className="bg-[#111] border border-gray-800 rounded-xl p-6">
              <h2 className="text-lg font-semibold text-gray-300 mb-6 flex items-center gap-2">
                <Activity className="w-5 h-5 text-blue-400" /> 
                Live Agentic Executions
              </h2>
              
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-400">
                  <thead className="text-xs text-gray-500 uppercase bg-black/50 border-y border-gray-800">
                    <tr>
                      <th className="px-4 py-3 font-medium">Status</th>
                      <th className="px-4 py-3 font-medium">Workflow</th>
                      <th className="px-4 py-3 font-medium">Active Step</th>
                      <th className="px-4 py-3 font-medium">Type</th>
                      <th className="px-4 py-3 font-medium">Cost</th>
                      <th className="px-4 py-3 font-medium text-right">Time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800/50">
                    {executions?.map((exec: any) => (
                      <tr key={exec.id} className="hover:bg-black/30 transition-colors">
                        <td className="px-4 py-4">
                          <span className={`px-2 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                            exec.status === 'completed' ? 'bg-green-500/10 text-green-400' :
                            exec.status === 'pending' ? 'bg-blue-500/10 text-blue-400' :
                            exec.status === 'awaiting_approval' ? 'bg-amber-500/10 text-amber-400' :
                            'bg-red-500/10 text-red-400'
                          }`}>
                            {exec.status}
                          </span>
                        </td>
                        <td className="px-4 py-4 font-medium text-gray-300">{exec.l2_workflows?.name}</td>
                        <td className="px-4 py-4 text-gray-400">{exec.l2_workflow_steps?.step_name}</td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-1">
                            {exec.l2_workflow_steps?.execution_type === 'agent' ? <Zap className="w-3 h-3 text-yellow-500" /> : <Shield className="w-3 h-3 text-blue-500" />}
                            <span className="capitalize">{exec.l2_workflow_steps?.execution_type}</span>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-pink-500">{exec.l2_workflow_steps?.cost_crd} CRD</td>
                        <td className="px-4 py-4 text-right tabular-nums text-gray-500">
                          {new Date(exec.started_at).toLocaleTimeString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {(!executions || executions.length === 0) && (
                   <div className="p-4 text-center text-gray-500">No active executions.</div>
                )}
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  )
}


