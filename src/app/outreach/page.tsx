'use client'

import React, { useState, useEffect, useCallback } from 'react'
import {
  Send, Search, ChevronDown, ExternalLink,
  Mail, Phone, Building2, MapPin, RefreshCw, Users,
  MessageSquare, Calendar,
  X, Linkedin, Zap, Loader2, CheckCircle2
} from 'lucide-react'

interface Contact {
  id: string
  first_name: string
  last_name: string
  email: string | null
  phone: string | null
  title: string | null
  company: string | null
  city: string | null
  state: string | null
  country: string | null
  linkedin_url: string | null
  segment: string
  status: string
  notes: string | null
  last_activity_at: string | null
  created_at: string
}

const SEGMENTS = ['all', 'International Founders', 'Nigerian Founders', 'VC Investors']

const STATUSES = [
  { value: 'not_contacted', label: 'Not Contacted', color: 'bg-white/10 text-white/50' },
  { value: 'emailed', label: 'Emailed', color: 'bg-blue-500/20 text-blue-400' },
  { value: 'replied', label: 'Replied', color: 'bg-yellow-500/20 text-yellow-400' },
  { value: 'meeting_booked', label: 'Meeting Booked', color: 'bg-purple-500/20 text-purple-400' },
  { value: 'closed', label: 'Closed', color: 'bg-green-500/20 text-green-400' },
]

function StatusBadge({ status }: { status: string }) {
  const s = STATUSES.find(s => s.value === status) || STATUSES[0]
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${s.color}`}>
      {s.label}
    </span>
  )
}

function StatusSelect({ contactId, current, onUpdate }: {
  contactId: string, current: string, onUpdate: (id: string, status: string) => void
}) {
  const [open, setOpen] = useState(false)
  const current_s = STATUSES.find(s => s.value === current) || STATUSES[0]

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${current_s.color} hover:opacity-80 transition-opacity`}
      >
        {current_s.label}
        <ChevronDown className="w-3 h-3" />
      </button>
      {open && (
        <div className="absolute z-50 mt-1 left-0 bg-[#0f0f0f] border border-white/10 rounded-lg shadow-xl min-w-[160px]">
          {STATUSES.map(s => (
            <button
              key={s.value}
              onClick={() => { onUpdate(contactId, s.value); setOpen(false) }}
              className="w-full flex items-center gap-2 px-3 py-2 text-xs hover:bg-white/5 transition-colors text-left"
            >
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${s.color}`}>
                {s.label}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function StatCard({ label, value, icon: Icon, color }: { label: string, value: number, icon: React.ElementType, color: string }) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center gap-4">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <div className="text-2xl font-bold">{value}</div>
        <div className="text-xs text-white/50">{label}</div>
      </div>
    </div>
  )
}

export default function OutreachPage() {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [segment, setSegment] = useState('all')
  const [status, setStatus] = useState('all')
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [page, setPage] = useState(1)
  const [stats, setStats] = useState<Record<string, number>>({})
  const [selected, setSelected] = useState<Contact | null>(null)
  const [notes, setNotes] = useState('')
  const [savingNotes, setSavingNotes] = useState(false)

  // Bulk email state
  const [sendingBulk, setSendingBulk] = useState(false)
  const [bulkResult, setBulkResult] = useState<{ sent: number; total: number } | null>(null)

  const fetchContacts = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams({ page: page.toString(), limit: '50' })
    if (segment !== 'all') params.set('segment', segment)
    if (status !== 'all') params.set('status', status)
    if (search) params.set('search', search)

    const res = await fetch(`/api/outreach?${params}`)
    const data = await res.json()
    setContacts(data.contacts || [])
    setTotal(data.total || 0)
    setLoading(false)
  }, [page, segment, status, search])

  const fetchStats = useCallback(async () => {
    const res = await fetch('/api/outreach?limit=300')
    const data = await res.json()
    const all: Contact[] = data.contacts || []
    const counts: Record<string, number> = {}
    STATUSES.forEach(s => { counts[s.value] = 0 })
    all.forEach(c => { counts[c.status] = (counts[c.status] || 0) + 1 })
    setStats(counts)
  }, [])

  useEffect(() => { fetchContacts() }, [fetchContacts])
  useEffect(() => { fetchStats() }, [fetchStats])

  const updateStatus = async (id: string, newStatus: string) => {
    await fetch(`/api/outreach/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus })
    })
    setContacts(prev => prev.map(c => c.id === id ? { ...c, status: newStatus } : c))
    if (selected?.id === id) setSelected(prev => prev ? { ...prev, status: newStatus } : null)
    fetchStats()
  }

  const saveNotes = async () => {
    if (!selected) return
    setSavingNotes(true)
    await fetch(`/api/outreach/${selected.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ notes })
    })
    setContacts(prev => prev.map(c => c.id === selected.id ? { ...c, notes } : c))
    setSelected(prev => prev ? { ...prev, notes } : null)
    setSavingNotes(false)
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setSearch(searchInput)
    setPage(1)
  }

  const openContact = (c: Contact) => {
    setSelected(c)
    setNotes(c.notes || '')
  }

  // Send outreach emails to all not_contacted contacts with an email address
  const sendBulkEmails = async () => {
    setSendingBulk(true)
    setBulkResult(null)
    try {
      // Fetch all not_contacted contacts
      const res = await fetch('/api/outreach?status=not_contacted&limit=300')
      const data = await res.json()
      const unsent: Contact[] = (data.contacts || []).filter((c: Contact) => c.email)

      if (unsent.length === 0) {
        setBulkResult({ sent: 0, total: 0 })
        setSendingBulk(false)
        return
      }

      // Call batch email endpoint
      const emailRes = await fetch('/api/send-email', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contacts: unsent.map(c => ({
            id: c.id,
            email: c.email,
            first_name: c.first_name,
            company: c.company,
            segment: c.segment,
          }))
        })
      })
      const result = await emailRes.json()

      // Update statuses for successfully sent
      const sentIds: string[] = (result.results || [])
        .filter((r: { success: boolean }) => r.success)
        .map((r: { id: string }) => r.id)

      for (const id of sentIds) {
        await fetch(`/api/outreach/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'emailed' })
        })
      }

      setBulkResult({ sent: result.sent || 0, total: unsent.length })
      await fetchContacts()
      await fetchStats()
    } catch {
      setBulkResult({ sent: 0, total: 0 })
    } finally {
      setSendingBulk(false)
    }
  }

  const totalPages = Math.ceil(total / 50)

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <div className="px-8 py-6 border-b border-white/10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Outreach CRM</h1>
            <p className="text-sm text-white/40 mt-1">Track and manage your Apollo contact pipeline</p>
          </div>
          <div className="flex items-center gap-3">
            {bulkResult && (
              <div className="flex items-center gap-2 px-3 py-2 bg-green-500/10 border border-green-500/20 rounded-lg text-xs text-green-400">
                <CheckCircle2 className="w-3 h-3" />
                {bulkResult.sent} of {bulkResult.total} emails sent
              </div>
            )}
            <button
              onClick={sendBulkEmails}
              disabled={sendingBulk}
              className="flex items-center gap-2 px-4 py-2 bg-[#7B61FF]/20 hover:bg-[#7B61FF]/30 border border-[#7B61FF]/40 rounded-lg text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {sendingBulk ? (
                <><Loader2 className="w-4 h-4 animate-spin" />Sending...</>
              ) : (
                <><Zap className="w-4 h-4" />Send Outreach Emails</>
              )}
            </button>
            <button
              onClick={() => { fetchContacts(); fetchStats() }}
              className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>
        </div>
      </div>

      <div className="px-8 py-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <StatCard label="Total Contacts" value={total} icon={Users} color="bg-white/10" />
          <StatCard label="Not Contacted" value={stats.not_contacted || 0} icon={Mail} color="bg-white/10" />
          <StatCard label="Emailed" value={stats.emailed || 0} icon={Send} color="bg-blue-500/20" />
          <StatCard label="Replied" value={stats.replied || 0} icon={MessageSquare} color="bg-yellow-500/20" />
          <StatCard label="Meetings Booked" value={stats.meeting_booked || 0} icon={Calendar} color="bg-purple-500/20" />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-6">
          <div className="flex bg-white/5 border border-white/10 rounded-lg p-1 gap-1">
            {SEGMENTS.map(seg => (
              <button
                key={seg}
                onClick={() => { setSegment(seg); setPage(1) }}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  segment === seg ? 'bg-[#7B61FF] text-white' : 'text-white/50 hover:text-white'
                }`}
              >
                {seg === 'all' ? 'All' : seg}
              </button>
            ))}
          </div>

          <div className="flex bg-white/5 border border-white/10 rounded-lg p-1 gap-1">
            <button
              onClick={() => { setStatus('all'); setPage(1) }}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                status === 'all' ? 'bg-white/20 text-white' : 'text-white/50 hover:text-white'
              }`}
            >
              All Status
            </button>
            {STATUSES.map(s => (
              <button
                key={s.value}
                onClick={() => { setStatus(s.value); setPage(1) }}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  status === s.value ? 'bg-white/20 text-white' : 'text-white/50 hover:text-white'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>

          <form onSubmit={handleSearch} className="flex-1 min-w-[200px] flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <input
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
                placeholder="Search name, email, company..."
                className="w-full pl-9 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm placeholder:text-white/30 focus:outline-none focus:border-[#7B61FF]/50"
              />
            </div>
            <button type="submit" className="px-4 py-2 bg-[#7B61FF]/20 hover:bg-[#7B61FF]/30 border border-[#7B61FF]/30 rounded-lg text-sm transition-colors">
              Search
            </button>
            {search && (
              <button type="button" onClick={() => { setSearch(''); setSearchInput(''); setPage(1) }}
                className="px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm transition-colors">
                <X className="w-4 h-4" />
              </button>
            )}
          </form>
        </div>

        {/* Table + Detail panel */}
        <div className="flex gap-4">
          <div className={`flex-1 bg-white/3 border border-white/10 rounded-xl overflow-hidden ${selected ? 'min-w-0' : ''}`}>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10 bg-white/5">
                    <th className="text-left px-4 py-3 text-xs font-mono uppercase tracking-wider text-white/40 whitespace-nowrap">Name</th>
                    <th className="text-left px-4 py-3 text-xs font-mono uppercase tracking-wider text-white/40 whitespace-nowrap">Company / Title</th>
                    <th className="text-left px-4 py-3 text-xs font-mono uppercase tracking-wider text-white/40 whitespace-nowrap">Email</th>
                    <th className="text-left px-4 py-3 text-xs font-mono uppercase tracking-wider text-white/40 whitespace-nowrap">Segment</th>
                    <th className="text-left px-4 py-3 text-xs font-mono uppercase tracking-wider text-white/40 whitespace-nowrap">Status</th>
                    <th className="text-left px-4 py-3 text-xs font-mono uppercase tracking-wider text-white/40 whitespace-nowrap">Links</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={6} className="px-4 py-12 text-center text-white/30">Loading...</td></tr>
                  ) : contacts.length === 0 ? (
                    <tr><td colSpan={6} className="px-4 py-12 text-center text-white/30">No contacts found</td></tr>
                  ) : contacts.map(c => (
                    <tr
                      key={c.id}
                      onClick={() => openContact(c)}
                      className={`border-b border-white/5 hover:bg-white/5 cursor-pointer transition-colors ${
                        selected?.id === c.id ? 'bg-[#7B61FF]/10' : ''
                      }`}
                    >
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="font-medium">{c.first_name} {c.last_name}</div>
                        <div className="text-xs text-white/40">{c.city ? `${c.city}, ${c.country}` : c.country}</div>
                      </td>
                      <td className="px-4 py-3 max-w-[200px]">
                        <div className="font-medium truncate">{c.company}</div>
                        <div className="text-xs text-white/40 truncate">{c.title}</div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {c.email ? (
                          <a href={`mailto:${c.email}`} onClick={e => e.stopPropagation()}
                            className="text-[#7B61FF] hover:underline flex items-center gap-1 text-xs">
                            <Mail className="w-3 h-3" />
                            {c.email}
                          </a>
                        ) : <span className="text-white/20 text-xs">—</span>}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="text-xs text-white/50">{c.segment}</span>
                      </td>
                      <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                        <StatusSelect contactId={c.id} current={c.status} onUpdate={updateStatus} />
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {c.linkedin_url && (
                            <a href={c.linkedin_url} target="_blank" rel="noopener noreferrer"
                              onClick={e => e.stopPropagation()}
                              className="text-white/30 hover:text-blue-400 transition-colors">
                              <Linkedin className="w-4 h-4" />
                            </a>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="px-4 py-3 border-t border-white/10 flex items-center justify-between">
              <span className="text-xs text-white/40">
                Showing {Math.min((page - 1) * 50 + 1, total)}–{Math.min(page * 50, total)} of {total}
              </span>
              <div className="flex gap-2">
                <button
                  disabled={page === 1}
                  onClick={() => setPage(p => p - 1)}
                  className="px-3 py-1 bg-white/5 hover:bg-white/10 border border-white/10 rounded text-xs disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  Prev
                </button>
                <span className="px-3 py-1 text-xs text-white/50">{page} / {totalPages || 1}</span>
                <button
                  disabled={page >= totalPages}
                  onClick={() => setPage(p => p + 1)}
                  className="px-3 py-1 bg-white/5 hover:bg-white/10 border border-white/10 rounded text-xs disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          </div>

          {/* Detail panel */}
          {selected && (
            <div className="w-80 shrink-0 bg-white/3 border border-white/10 rounded-xl flex flex-col">
              <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
                <span className="text-sm font-semibold">Contact Detail</span>
                <button onClick={() => setSelected(null)} className="text-white/40 hover:text-white transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                <div>
                  <h2 className="text-lg font-semibold">{selected.first_name} {selected.last_name}</h2>
                  <p className="text-sm text-white/50">{selected.title}</p>
                  <p className="text-sm text-[#7B61FF] mt-0.5">{selected.company}</p>
                </div>

                <div className="flex items-center gap-2">
                  <StatusBadge status={selected.status} />
                  <span className="text-xs text-white/30">{selected.segment}</span>
                </div>

                <div>
                  <label className="text-xs text-white/40 uppercase tracking-wider">Update Status</label>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {STATUSES.map(s => (
                      <button
                        key={s.value}
                        onClick={() => updateStatus(selected.id, s.value)}
                        className={`px-2 py-1 rounded-full text-xs font-medium transition-all ${s.color} ${
                          selected.status === s.value ? 'ring-1 ring-white/30' : 'opacity-60 hover:opacity-100'
                        }`}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  {selected.email && (
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="w-4 h-4 text-white/30 shrink-0" />
                      <a href={`mailto:${selected.email}`} className="text-[#7B61FF] hover:underline truncate text-xs">
                        {selected.email}
                      </a>
                    </div>
                  )}
                  {selected.phone && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="w-4 h-4 text-white/30 shrink-0" />
                      <span className="text-xs">{selected.phone}</span>
                    </div>
                  )}
                  {selected.company && (
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-white/30 shrink-0" />
                      <span className="text-xs text-white/70">{selected.company}</span>
                    </div>
                  )}
                  {(selected.city || selected.country) && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-white/30 shrink-0" />
                      <span className="text-xs text-white/70">
                        {[selected.city, selected.state, selected.country].filter(Boolean).join(', ')}
                      </span>
                    </div>
                  )}
                  {selected.linkedin_url && (
                    <a href={selected.linkedin_url} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-2 text-xs text-blue-400 hover:underline">
                      <Linkedin className="w-4 h-4 shrink-0" />
                      LinkedIn Profile
                    </a>
                  )}
                </div>

                {selected.email && (
                  <div>
                    <label className="text-xs text-white/40 uppercase tracking-wider">Quick Actions</label>
                    <div className="mt-2 flex flex-col gap-2">
                      <a
                        href={`mailto:${selected.email}?subject=Crelligent%20Introduction&body=Hi%20${selected.first_name}%2C%0A%0A`}
                        onClick={() => updateStatus(selected.id, 'emailed')}
                        className="flex items-center gap-2 px-3 py-2 bg-[#7B61FF]/20 hover:bg-[#7B61FF]/30 border border-[#7B61FF]/30 rounded-lg text-xs transition-colors"
                      >
                        <Send className="w-3 h-3" />
                        Open in Mail (mark as Emailed)
                      </a>
                    </div>
                  </div>
                )}

                <div>
                  <label className="text-xs text-white/40 uppercase tracking-wider">Notes</label>
                  <textarea
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    placeholder="Add notes about this contact..."
                    rows={4}
                    className="w-full mt-2 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-xs placeholder:text-white/20 focus:outline-none focus:border-[#7B61FF]/50 resize-none"
                  />
                  <button
                    onClick={saveNotes}
                    disabled={savingNotes}
                    className="mt-2 w-full px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs transition-colors disabled:opacity-50"
                  >
                    {savingNotes ? 'Saving...' : 'Save Notes'}
                  </button>
                </div>

                {selected.last_activity_at && (
                  <div className="text-xs text-white/30">
                    Last activity: {new Date(selected.last_activity_at).toLocaleDateString()}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
