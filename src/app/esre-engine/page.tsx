import React from 'react'
import Link from 'next/link'
import { Activity, FileText, BookOpen, ShieldAlert, ArrowRight } from 'lucide-react'

export default function EsreEngineDashboard() {
  const modules = [
    {
      title: 'ESRE Lens (Intake Engine)',
      description: 'Connect enterprise systems (ERP, HR) to generate a preliminary Health Score hypothesis and bottleneck map within 48 hours.',
      href: '/esre-engine/lens',
      icon: Activity,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10'
    },
    {
      title: 'Document Intelligence',
      description: 'Upload institutional knowledge (policy manuals, board minutes). Extracts governance structures and populates the schema using LLMs.',
      href: '/esre-engine/document-intelligence',
      icon: FileText,
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-500/10'
    },
    {
      title: 'Prescription Library',
      description: 'AI-assisted intervention recommendations and architecture blueprints (Target Operating Model, Governance Matrix).',
      href: '/esre-engine/prescription-library',
      icon: BookOpen,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10'
    },
    {
      title: 'ESRE Monitor',
      description: 'Continuous predictive alert dashboard for the Evolution retainer. Detects operational anomalies before they become crises.',
      href: '/esre-engine/monitor',
      icon: ShieldAlert,
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10'
    }
  ]

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-light tracking-tight text-white mb-2">ESRE AI Engine</h1>
        <p className="text-white/60 max-w-3xl">
          The proprietary AI tool stack. These tools are structural accelerants for the ESRE methodology, 
          compressing diagnostics and embedding intelligent pattern-matching into the enterprise workflow.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {modules.map((mod) => (
          <Link 
            key={mod.href} 
            href={mod.href}
            className="p-6 border border-white/10 bg-white/5 rounded-xl hover:bg-white/10 transition-colors group flex flex-col"
          >
            <div className={`w-12 h-12 rounded-lg ${mod.bgColor} ${mod.color} flex items-center justify-center mb-6`}>
              <mod.icon className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-medium text-white mb-2">{mod.title}</h2>
            <p className="text-white/60 text-sm mb-6 flex-1">{mod.description}</p>
            <div className="flex items-center text-sm font-medium text-white/40 group-hover:text-white transition-colors">
              Access Module <ArrowRight className="w-4 h-4 ml-2" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
