'use client'

import React, { useState } from 'react'
import { Activity, Database, CheckCircle, Loader2, AlertTriangle, ChevronRight } from 'lucide-react'

export default function LensIntakePage() {
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null)
  const [isSyncing, setIsSyncing] = useState(false)
  const [results, setResults] = useState<any>(null)

  const handleSync = async () => {
    if (!selectedPlatform) return
    setIsSyncing(true)
    
    try {
      const response = await fetch('/api/esre-ai/lens/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platform: selectedPlatform,
          credentials: { apiKey: 'mock-key' }
        })
      })
      const data = await response.json()
      setResults(data)
    } catch (error) {
      console.error(error)
      alert("Failed to sync with ERP")
    } finally {
      setIsSyncing(false)
    }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-light tracking-tight text-white mb-2">ESRE Lens (Intake Engine) v0.1</h1>
        <p className="text-white/60 max-w-3xl">
          Automated pre-diagnostic system reading directly from client core systems via API connectors to generate a preliminary bottleneck map.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-4">
          <h3 className="text-sm font-medium text-white/60 uppercase tracking-wider mb-4">Supported Systems</h3>
          
          {['Odoo', 'Sage', 'SAP-B1'].map(platform => (
            <button
              key={platform}
              onClick={() => setSelectedPlatform(platform)}
              className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all ${
                selectedPlatform === platform 
                  ? 'bg-blue-500/10 border-blue-500/50 text-blue-400' 
                  : 'bg-white/5 border-white/10 text-white hover:bg-white/10'
              }`}
            >
              <div className="flex items-center gap-3">
                <Database className="w-5 h-5" />
                <span className="font-medium">{platform === 'SAP-B1' ? 'SAP Business One' : platform}</span>
              </div>
              <ChevronRight className="w-4 h-4 opacity-50" />
            </button>
          ))}

          {selectedPlatform && (
            <div className="mt-8 p-4 rounded-xl bg-[#0A0A0A] border border-white/10 space-y-4">
              <h4 className="text-sm font-medium text-white mb-2">Connection Settings</h4>
              <div>
                <label className="text-xs text-white/40 mb-1 block">API Key / Token</label>
                <input type="password" placeholder="••••••••••••" className="w-full bg-white/5 border border-white/10 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500/50" />
              </div>
              <button 
                onClick={handleSync}
                disabled={isSyncing}
                className="w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md text-sm font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSyncing ? <><Loader2 className="w-4 h-4 animate-spin"/> Syncing Telemetry...</> : 'Run Diagnostic Extraction'}
              </button>
            </div>
          )}
        </div>

        <div className="lg:col-span-2 bg-[#0A0A0A] border border-white/10 rounded-xl p-6 min-h-[400px]">
          <h3 className="text-sm font-medium text-white/60 mb-6 uppercase tracking-wider">Extraction Telemetry</h3>
          
          {!isSyncing && !results && (
            <div className="flex flex-col items-center justify-center h-64 text-white/40 space-y-4">
              <Activity className="w-12 h-12 text-white/20" />
              <p className="text-sm">Select an ERP system and run extraction to view ESRE diagnostics.</p>
            </div>
          )}

          {isSyncing && (
            <div className="flex flex-col items-center justify-center h-64 text-white/40 space-y-4">
              <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
              <p className="text-sm">Ingesting ledgers and mapping to ESRE Schema...</p>
            </div>
          )}

          {results && (
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-6 h-6 text-emerald-500" />
                  <div>
                    <h3 className="font-medium text-white">Extraction Complete</h3>
                    <p className="text-xs text-white/40">Source: {results.extractedData.source} • {new Date(results.timestamp).toLocaleTimeString()}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-light text-blue-400">{results.vitalsScore}</div>
                  <div className="text-xs text-white/40 uppercase tracking-widest">Vitals Score</div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(results.extractedData.metrics).map(([key, data]: [string, any]) => (
                  <div key={key} className="p-4 rounded-lg bg-white/5 border border-white/10 flex flex-col">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="text-sm font-medium text-white capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</h4>
                      <span className={`px-2 py-1 rounded text-xs font-mono ${data.score < 5 ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                        {data.score}/10
                      </span>
                    </div>
                    <p className="text-xs text-white/60 mb-3 flex-1">{data.finding}</p>
                    {data.score < 5 && (
                      <div className="flex items-center gap-1 text-[10px] text-red-400 mt-2">
                        <AlertTriangle className="w-3 h-3" /> Structural Vulnerability Detected
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
