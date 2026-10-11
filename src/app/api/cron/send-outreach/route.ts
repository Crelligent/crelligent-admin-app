import { NextRequest, NextResponse } from 'next/server'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { buildEmail, sendOutreachEmail } from '@/lib/outreach-email'
import { TRACK_SEGMENTS, buildTrackEmail, sendTrackEmail, templateForSegment, type TrackTemplate } from '@/lib/outreach-tracks'

/**
 * Daily outreach sender (Vercel cron, see vercel.json). Runs three passes, oldest first:
 *
 * 1. Young founders (Velodesk email): founder segments, status 'not_contacted'/'new',
 *    created on/after OUTREACH_START_DATE (default 2026-10-10). Cap OUTREACH_DAILY_LIMIT (50).
 * 2. Tracks (approved 11 Oct): established startups and partners (investors, media,
 *    consultancies), status 'not_contacted'. Cap OUTREACH_TRACK_DAILY_LIMIT (15).
 * 3. Follow-up: established startups emailed 5+ days ago and still 'emailed' (anyone marked
 *    'replied' or anything else is skipped). One follow-up only. Cap OUTREACH_FOLLOWUP_DAILY_LIMIT (15).
 *
 * Results: sent -> 'emailed' (follow-up -> 'followed_up'), last_activity_at = now.
 * Mailbox rejected that address -> 'email_failed' + reason in notes. A login/connection
 * error stops the whole run and leaves everyone pending.
 *
 * Auth: Authorization: Bearer <CRON_SECRET> (Vercel sends it automatically).
 *   ?dryRun=1                                -> who each pass would email, sends nothing
 *   ?test=you@crelligent.com[&template=...]  -> ONE sample to a crelligent.com address;
 *      template = founder (default) | established | established_followup | investors | media | consultancies
 */
export const maxDuration = 300
export const dynamic = 'force-dynamic'

const FOUNDER_SEGMENTS = ['Nigerian Founders', 'International Founders']
const TRACKS = Object.values(TRACK_SEGMENTS) as string[]
const TIME_BUDGET_MS = 240_000 // stop before Vercel's 300s limit
const GAP_MS = 1500 // pause between emails, gentler on the mail server
const FOLLOWUP_AFTER_DAYS = 5
const TEMPLATES: TrackTemplate[] = ['established', 'established_followup', 'investors', 'media', 'consultancies']
const SYSTEMIC = /auth|login|ECONNREFUSED|ETIMEDOUT|ENOTFOUND|ESOCKET|535|421/i

const clean = (v: string | undefined) => (v || '').trim().replace(/^["']|["']$/g, '')
function limit(name: string, fallback: number) {
  const n = Number(clean(process.env[name]))
  return Number.isFinite(n) && n > 0 ? Math.min(200, Math.floor(n)) : fallback
}
function startDate() {
  const d = clean(process.env.OUTREACH_START_DATE)
  return /^\d{4}-\d{2}-\d{2}$/.test(d) ? d : '2026-10-10'
}

type Contact = { id: string; email: string; first_name: string | null; company: string | null; segment: string | null; created_at: string }
const COLS = 'id, email, first_name, company, segment, created_at'

async function loadPasses(supabase: SupabaseClient) {
  const followupBefore = new Date(Date.now() - FOLLOWUP_AFTER_DAYS * 86_400_000).toISOString()
  const [founders, tracks, followups] = await Promise.all([
    supabase.from('outreach_contacts').select(COLS)
      .in('segment', FOUNDER_SEGMENTS).in('status', ['not_contacted', 'new'])
      .gte('created_at', `${startDate()}T00:00:00+01:00`)
      .not('email', 'is', null).neq('email', '')
      .order('created_at', { ascending: true }).limit(limit('OUTREACH_DAILY_LIMIT', 50)),
    supabase.from('outreach_contacts').select(COLS)
      .in('segment', TRACKS).eq('status', 'not_contacted')
      .not('email', 'is', null).neq('email', '')
      .order('created_at', { ascending: true }).limit(limit('OUTREACH_TRACK_DAILY_LIMIT', 15)),
    supabase.from('outreach_contacts').select(COLS)
      .eq('segment', TRACK_SEGMENTS.established).eq('status', 'emailed')
      .lte('last_activity_at', followupBefore)
      .order('last_activity_at', { ascending: true }).limit(limit('OUTREACH_FOLLOWUP_DAILY_LIMIT', 15)),
  ])
  const err = founders.error || tracks.error || followups.error
  if (err) throw err
  return {
    founders: (founders.data ?? []) as Contact[],
    tracks: (tracks.data ?? []) as Contact[],
    followups: (followups.data ?? []) as Contact[],
  }
}

export async function GET(request: NextRequest) {
  const secret = clean(process.env.CRON_SECRET)
  // Fail closed: without CRON_SECRET this endpoint must not be callable
  if (!secret || request.headers.get('authorization') !== `Bearer ${secret}`) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  const url = new URL(request.url)

  // ---- Test mode: one sample email to a crelligent.com address ----
  const testTo = (url.searchParams.get('test') || '').trim().toLowerCase()
  if (testTo) {
    if (!/^[^\s@]+@crelligent\.com$/.test(testTo)) {
      return NextResponse.json({ error: 'Test emails can only go to a crelligent.com address.' }, { status: 400 })
    }
    const template = (url.searchParams.get('template') || 'founder') as TrackTemplate | 'founder'
    try {
      if (template === 'founder') {
        const { subject } = await sendOutreachEmail({ email: testTo, first_name: 'Uche', company: 'Crelligent', segment: 'Nigerian Founders' })
        return NextResponse.json({ test: true, template, sent: true, to: testTo, subject })
      }
      if (!TEMPLATES.includes(template)) {
        return NextResponse.json({ error: `Unknown template. Use founder, ${TEMPLATES.join(', ')}.` }, { status: 400 })
      }
      const r = await sendTrackEmail(template, { email: testTo, first_name: 'Uche', company: 'Crelligent' })
      return NextResponse.json({ test: true, template, sent: true, to: testTo, ...r })
    } catch (e) {
      return NextResponse.json({ test: true, template, sent: false, to: testTo, error: e instanceof Error ? e.message : String(e) }, { status: 500 })
    }
  }

  const supabase = createClient(clean(process.env.NEXT_PUBLIC_SUPABASE_URL), clean(process.env.SUPABASE_SECRET_KEY))

  let passes: Awaited<ReturnType<typeof loadPasses>>
  try {
    passes = await loadPasses(supabase)
  } catch (error) {
    console.error('[send-outreach] query failed', error)
    return NextResponse.json({ error: error instanceof Error ? error.message : String(error) }, { status: 500 })
  }

  if (url.searchParams.get('dryRun')) {
    const show = (list: Contact[], subject: (c: Contact) => string) =>
      list.map((c) => ({ name: c.first_name, company: c.company, segment: c.segment, subject: subject(c) }))
    return NextResponse.json({
      dryRun: true,
      founders: show(passes.founders, (c) => buildEmail(c.first_name || '', c.company || '', c.segment || '').subject),
      tracks: show(passes.tracks, (c) => buildTrackEmail(templateForSegment(c.segment)!, c.first_name || '', c.company || '').subject),
      followups: show(passes.followups, (c) => buildTrackEmail('established_followup', c.first_name || '', c.company || '').subject),
    })
  }

  const started = Date.now()
  const summary = { founders: 0, tracks: 0, followups: 0, failed: 0, stoppedEarly: false, failures: [] as { id: string; error: string }[] }

  // Returns false when the run must stop (time budget or a mail-server problem)
  async function sendOne(c: Contact, send: () => Promise<unknown>, okStatus: string, counter: 'founders' | 'tracks' | 'followups') {
    if (Date.now() - started > TIME_BUDGET_MS) { summary.stoppedEarly = true; return false }
    try {
      await send()
      summary[counter]++
      const { error } = await supabase.from('outreach_contacts')
        .update({ status: okStatus, last_activity_at: new Date().toISOString() }).eq('id', c.id)
      if (error) console.error('[send-outreach] status update failed', c.id, error.message)
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      summary.failed++
      summary.failures.push({ id: c.id, error: msg })
      if (SYSTEMIC.test(msg)) { summary.stoppedEarly = true; return false } // not this contact's fault
      await supabase.from('outreach_contacts')
        .update({ status: 'email_failed', notes: `Send failed ${new Date().toISOString()}: ${msg}`.slice(0, 500), last_activity_at: new Date().toISOString() })
        .eq('id', c.id)
    }
    await new Promise((r) => setTimeout(r, GAP_MS))
    return true
  }

  run: {
    for (const c of passes.founders) {
      if (!(await sendOne(c, () => sendOutreachEmail(c), 'emailed', 'founders'))) break run
    }
    for (const c of passes.tracks) {
      const template = templateForSegment(c.segment)
      if (!template) continue
      if (!(await sendOne(c, () => sendTrackEmail(template, c), 'emailed', 'tracks'))) break run
    }
    for (const c of passes.followups) {
      if (!(await sendOne(c, () => sendTrackEmail('established_followup', c), 'followed_up', 'followups'))) break run
    }
  }

  const result = { ...summary, failures: summary.failures.slice(0, 10) }
  console.log('[send-outreach]', JSON.stringify(result))
  return NextResponse.json(result)
}
