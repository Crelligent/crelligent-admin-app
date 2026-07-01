'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { NavGroup } from '@/lib/content'

export function KnowledgeBaseSidebar({ navGroups }: { navGroups: NavGroup[] }) {
    const pathname = usePathname()

    return (
        <aside className="w-64 border-r border-white/10 bg-[#0a0a0a] h-screen fixed left-64 top-0 overflow-y-auto z-40">
            <div className="h-16 flex items-center px-6 border-b border-white/10 shrink-0 sticky top-0 bg-[#0a0a0a]">
                <span className="text-sm font-medium">Knowledge Base</span>
            </div>
            <div className="p-4 space-y-6">
                {navGroups.map(group => (
                    <div key={group.title}>
                        <h4 className="text-[10px] font-mono uppercase tracking-widest text-white/40 mb-2 px-2">{group.title}</h4>
                        <div className="space-y-1">
                            {group.items.map(item => {
                                const isActive = pathname === item.href
                                return (
                                    <Link 
                                        key={item.href} 
                                        href={item.href} 
                                        className={`block px-2 py-1.5 rounded-lg text-sm transition-colors ${
                                            isActive ? 'bg-white/10 text-white font-medium' : 'text-white/60 hover:text-white hover:bg-white/5'
                                        }`}
                                    >
                                        {item.name}
                                    </Link>
                                )
                            })}
                        </div>
                    </div>
                ))}
            </div>
        </aside>
    )
}
