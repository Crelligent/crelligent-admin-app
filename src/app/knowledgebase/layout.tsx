import React from 'react'
import { Sidebar } from '@/components/layout/Sidebar'
import { KnowledgeBaseSidebar } from '@/components/layout/KnowledgeBaseSidebar'
import { getKnowledgeBaseNav } from '@/lib/content'

export default function KnowledgeBaseLayout({ children }: { children: React.ReactNode }) {
    const navGroups = getKnowledgeBaseNav()

    return (
        <div className="flex h-screen bg-[#050505] text-white overflow-hidden">
            {/* The sidebars take exactly 512px */}
            <div className="w-[512px] shrink-0">
                <Sidebar />
                <KnowledgeBaseSidebar navGroups={navGroups} />
            </div>
            {/* The main content takes the remaining space and cannot overflow horizontally */}
            <main className="flex-1 min-w-0 h-full overflow-y-auto relative">
                {children}
            </main>
        </div>
    )
}
