import React from 'react'
import { Activity, Database, AlertCircle } from 'lucide-react'

export default function LensIntakePage() {
  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-light tracking-tight text-white mb-2">ESRE Lens (Intake Engine)</h1>
        <p className="text-white/60 max-w-3xl">
          Automated pre-diagnostic system reading directly from client core systems via API connectors to generate a preliminary bottleneck map.
        </p>
      </div>

      <div className="bg-[#0A0A0A] border border-white/10 rounded-xl p-8">
        <div className="flex flex-col items-center justify-center text-center space-y-4 py-12">
          <Activity className="w-12 h-12 text-blue-500/50" />
          <h2 className="text-xl font-medium text-white">System Connectors Offline</h2>
          <p className="text-white/50 max-w-md">
            This module requires the API connector library to be built. Once connected to an ERP or CRM, the ingestion layer will populate diagnostic hypotheses here.
          </p>
          <button className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md text-sm font-medium transition-colors mt-4">
            Configure System Integrations
          </button>
        </div>
      </div>
    </div>
  )
}
