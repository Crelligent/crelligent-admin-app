'use client'

import React, { useState } from 'react'
import { Upload, FileText, CheckCircle, Loader2 } from 'lucide-react'

export default function DocumentIntelligencePage() {
  const [file, setFile] = useState<File | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [result, setResult] = useState<any>(null)

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault()
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0])
    }
  }

  const handleProcess = async () => {
    if (!file) return
    setIsProcessing(true)
    
    // In Year 1 priority, this calls the real AI backend
    try {
      const formData = new FormData()
      formData.append('document', file)

      const response = await fetch('/api/esre-ai/document-parse', {
        method: 'POST',
        body: formData
      })
      const data = await response.json()
      setResult(data)
    } catch (error) {
      console.error(error)
      alert("Failed to process document")
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-light tracking-tight text-white mb-2">Document Intelligence</h1>
        <p className="text-white/60 max-w-3xl">
          Upload policy manuals, board minutes, contracts, or org charts. The LLM will extract governance 
          structures and auto-populate the ESRE Diagnostic Schema.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div 
            className="border-2 border-dashed border-white/20 rounded-xl p-12 flex flex-col items-center justify-center text-center hover:border-white/40 transition-colors bg-white/5"
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleFileDrop}
          >
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center mb-4">
              <Upload className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-medium text-white mb-1">Upload Document</h3>
            <p className="text-sm text-white/50 mb-6">Drag and drop PDF, DOCX, or TXT</p>
            
            <input 
              type="file" 
              id="doc-upload" 
              className="hidden" 
              onChange={(e) => e.target.files && setFile(e.target.files[0])}
            />
            <label 
              htmlFor="doc-upload"
              className="px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded-md cursor-pointer transition-colors text-sm font-medium"
            >
              Browse Files
            </label>
          </div>

          {file && (
            <div className="p-4 rounded-lg bg-white/5 border border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-emerald-500" />
                <span className="text-sm font-medium text-white">{file.name}</span>
              </div>
              <button 
                onClick={handleProcess}
                disabled={isProcessing}
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-md text-sm font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {isProcessing ? <><Loader2 className="w-4 h-4 animate-spin"/> Processing...</> : 'Analyze Document'}
              </button>
            </div>
          )}
        </div>

        <div className="bg-[#0A0A0A] border border-white/10 rounded-xl p-6 min-h-[400px]">
          <h3 className="text-sm font-medium text-white/60 mb-6 uppercase tracking-wider">AI Extraction Results</h3>
          
          {isProcessing && (
            <div className="flex flex-col items-center justify-center h-64 text-white/40 space-y-4">
              <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
              <p className="text-sm">Reading document and mapping to ESRE Schema...</p>
            </div>
          )}

          {!isProcessing && !result && (
            <div className="flex flex-col items-center justify-center h-64 text-white/40">
              <p className="text-sm">Upload a document to see AI extraction results.</p>
            </div>
          )}

          {result && (
            <div className="space-y-6">
              <div className="flex items-center gap-2 text-emerald-500 mb-4">
                <CheckCircle className="w-5 h-5" />
                <span className="font-medium">Schema Population Complete</span>
              </div>
              
              <div className="space-y-4">
                {result.capabilities?.map((cap: any, i: number) => (
                  <div key={i} className="p-4 rounded-lg bg-white/5 border border-white/10">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium text-white">{cap.name}</h4>
                      <span className="px-2 py-1 bg-white/10 rounded text-xs font-mono">{cap.score}/10</span>
                    </div>
                    <p className="text-sm text-white/60 mb-3">{cap.finding}</p>
                    <div className="p-3 bg-black/50 rounded border border-white/5 text-xs text-white/50 font-mono italic">
                      "{cap.evidenceQuote}"
                    </div>
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
