'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { 
    LayoutDashboard, 
    BarChart2, 
    BookOpen, 
    Briefcase, 
    Server,
    Shield,
    Users,
    Settings,
    FileText,
    ClipboardCheck,
    GitBranch,
    Zap,
    ShieldAlert,
    UserCog,
    DollarSign,
    Archive,
    Calendar,
    Activity,
    Target,
    LogOut
} from 'lucide-react'

export function Sidebar() {
    const pathname = usePathname()

    const navGroups = [
        {
            title: 'Diagnostic Engine',
            items: [
                { name: 'Dashboard', href: '/', icon: LayoutDashboard },
                { name: 'Assessment', href: '/assessment', icon: ClipboardCheck },
                { name: 'Dependencies', href: '/dependencies', icon: GitBranch },
                { name: 'Simulation', href: '/simulation', icon: Zap },
                { name: 'Risk Synthesis', href: '/risk', icon: ShieldAlert },
                { name: 'Reports', href: '/reports', icon: FileText },
            ]
        },
        {
            title: 'Operations & Execution',
            items: [
                { name: 'Leads Inbox', href: '/leads', icon: Target },
                { name: 'Clients', href: '/clients', icon: Users },
                { name: 'Implementation Arm', href: '/engagements', icon: Briefcase },
                { name: 'Managed Services', href: '/commercial', icon: Server },
                { name: 'Team', href: '/team', icon: UserCog },
                { name: 'Documents', href: '/documents', icon: Archive },
                { name: 'Workshops', href: '/workshops', icon: Calendar },
            ]
        },
        {
            title: 'ESRE AI Engine',
            items: [
                { name: 'Dashboard', href: '/esre-engine', icon: Zap },
                { name: 'Lens (Intake)', href: '/esre-engine/lens', icon: Activity },
                { name: 'Document Intelligence', href: '/esre-engine/document-intelligence', icon: FileText },
                { name: 'Prescription Library', href: '/esre-engine/prescription-library', icon: BookOpen },
                { name: 'ESRE Monitor', href: '/esre-engine/monitor', icon: ShieldAlert },
            ]
        },
        {
            title: 'Intelligence & IP',
            items: [
                { name: 'Knowledge Base', href: '/knowledgebase', icon: BookOpen },
                { name: 'Market Intelligence', href: '/benchmarks', icon: BarChart2 },
                { name: 'Playbooks', href: '/playbooks', icon: FileText },
                { name: 'ESRE Licensing', href: '/ip-assets', icon: Shield },
            ]
        },
        {
            title: 'System',
            items: [
                { name: 'Activity Log', href: '/activity', icon: Activity },
                { name: 'Settings', href: '/settings', icon: Settings },
            ]
        }
    ]

    return (
        <aside className="w-64 border-r border-white/10 bg-[#050505] h-screen flex flex-col fixed left-0 top-0 overflow-y-auto print:hidden z-50">
            <div className="h-16 flex items-center px-6 border-b border-white/10 shrink-0 sticky top-0 bg-[#050505]">
                <span className="text-lg font-semibold tracking-tight">Crelligent</span>
                <span className="text-xs font-light text-gray-500 ml-2">Admin</span>
            </div>

            <div className="flex-1 py-6 px-4 space-y-8">
                {navGroups.map((group) => (
                    <div key={group.title}>
                        <h3 className="px-2 text-[10px] font-mono uppercase tracking-widest text-white/40 mb-3">
                            {group.title}
                        </h3>
                        <div className="space-y-1">
                            {group.items.map((item) => {
                                const isActive = pathname === item.href
                                const Icon = item.icon
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className={`flex items-center gap-3 px-2 py-2 rounded-lg text-sm transition-colors ${
                                            isActive 
                                                ? 'bg-white/10 text-white font-medium' 
                                                : 'text-white/60 hover:text-white hover:bg-white/5'
                                        }`}
                                    >
                                        <Icon className="w-4 h-4" />
                                        {item.name}
                                    </Link>
                                )
                            })}
                        </div>
                    </div>
                ))}
            </div>
            
            <div className="p-4 border-t border-white/10 shrink-0 sticky bottom-0 bg-[#050505]">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-white/10" />
                        <div>
                            <div className="text-sm font-medium">System Admin</div>
                            <div className="text-xs text-white/40">admin@crelligent.com</div>
                        </div>
                    </div>
                    <button 
                        onClick={() => {
                            document.cookie = "admin_auth=; path=/; max-age=0";
                            window.location.href = '/login';
                        }}
                        className="p-2 text-white/40 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                        title="Sign Out"
                    >
                        <LogOut className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </aside>
    )
}
