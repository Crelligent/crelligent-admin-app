import React from 'react'
import { BookOpen } from 'lucide-react'

export default function KnowledgeBasePage() {
    return (
        <div className="p-8 lg:p-12 max-w-4xl mx-auto h-full flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-6">
                <BookOpen className="w-8 h-8 text-[#7B61FF]" />
            </div>
            <h1 className="text-3xl font-light text-white mb-4">Crelligent Knowledge Base</h1>
            <p className="text-gray-400 max-w-lg mb-8 leading-relaxed">
                Welcome to the internal documentation repository. Here you will find all non-code planning, strategy, and operational documents. Select a document from the sidebar to begin reading.
            </p>
        </div>
    )
}
