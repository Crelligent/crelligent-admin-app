import React from 'react'
import { ShieldAlert, BellRing } from 'lucide-react'

export default function EsreMonitorPage() {
  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-light tracking-tight text-white mb-2">ESRE Monitor</h1>
        <p className="text-white/60 max-w-3xl">
          Continuous predictive alert dashboard for Evolution retainer clients. Watches connected systems for operational anomalies and drift.
        </p>
      </div>

      <div className="bg-[#0A0A0A] border border-white/10 rounded-xl p-8">
        <div className="flex flex-col items-center justify-center text-center space-y-4 py-12">
          <ShieldAlert className="w-12 h-12 text-orange-500/50" />
          <h2 className="text-xl font-medium text-white">Monitoring Standby</h2>
          <p className="text-white/50 max-w-md">
            No active Evolution retainer clients are currently connected to the continuous telemetry stream.
          </p>
          <button className="px-6 py-2 bg-orange-500/10 hover:bg-orange-500/20 text-orange-500 border border-orange-500/20 rounded-md text-sm font-medium transition-colors mt-4 flex items-center gap-2">
            <BellRing className="w-4 h-4" />
            Configure Webhook Receivers
          </button>
        </div>
      </div>
    </div>
  )
}
