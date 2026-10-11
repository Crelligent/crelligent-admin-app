import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { buildEmail, sendOutreachEmail } from '@/lib/outreach-email'

/**
 * Daily founder outreach sender (Vercel cron, see vercel.json).
 *
 * The 7am prospecting task saves new founders to outreach_contacts with status
 * 'not_contacted'. This job emails them, oldest first, and records the result:
 *   sent   -> status 'emailed', last_activity_at = now
 *   failed -> status 'email_failed', notes = SMTP error (never retried automatically);
 *             mail-server login/connection errors stop the run and leave contacts pending
 *
 * Who is emailed: founder segments only (never investors), status 'not_contacted' or
 * 'new', created on/after OUTREACH_START_DATE (default 2026-10-10, which leaves out the
 * 9 Oct bulk import), at most OUTREACH_DAILY_LIMIT per run (default 50).
 *
 * Auth: Authorization: Bearer <CRON_SECRET> (Vercel sends this automatically).
 * Extra modes (same auth):
 *   ?dryRun=1             -> list who would be emailed, send nothing
 *   ?test=you@crelligent.com -> send ONE sample email to that crelligent.com address only
 */
export const maxDuration = 300
export const dynamic = 'force-dynamic'

const FOUNDER_SEGMENTS = ['Nigerian Founders', 'International Founders']
const PENDING_STATUSES = ['not_contacted', 'new']
const TIME_BUDGET_MS = 240_000 // stop before Vercel's 300s limit
const GAP_MS = 1500 // pause between emails, gentler on the mail server

const clean = (v: string | undefined) => (v || '').trim().replace(/^["']|["']$/g, '')

function dailyLimit() {
  const n = Number(clean(process.env.OUTREACH_DAILY_LIMIT))
  return Number.isFinite(n) && n > 0 ? Math.min(200, Math.floor(n)) : 50
}

function startDate() {
  const d = clean(process.env.OUTREACH_START_DATE)
  return /^\d{4}-\d{2}-\d{2}$/.test(d) ? d : '2026-10-10'
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
    try {
      const { subject } = await sendOutreachEmail({ email: testTo, first_name: 'Uche', company: 'Crelligent', segment: 'Nigerian Founders' })
      return NextResponse.json({ test: true, sent: true, to: testTo, subject })
    } catch (e) {
      return NextResponse.json({ test: true, sent: false, to: testTo, error: e instanceof Error ? e.message : String(e) }, { status: 500 })
    }
  }

  const supabase = createClient(clean(process.env.NEXT_PUBLIC_SUPABASE_URL), clean(process.env.SUPABASE_SECRET_KEY))
  const limit = dailyLimit()
  // Midnight Lagos time (UTC+1) on the start date
  const since = `${startDate()}T00:00:00+01:00`

  const { data: pending, error } = await supabase
    .from('outreach_contacts')
    .select('id, email, first_name, company, segment, created_at')
    .in('segment', FOUNDER_SEGMENTS)
    .in('status', PENDING_STATUSES)
    .gte('created_at', since)
    .not('email', 'is', null)
    .neq('email', '')
    .order('created_at', { ascending: true })
    .limit(limit)

  if (error) {
    console.error('[send-outreach] query failed', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const contacts = pending ?? []

  if (url.searchParams.get('dryRun')) {
    return NextResponse.json({
      dryRun: true,
      limit,
      since,
      wouldEmail: contacts.length,
      contacts: contacts.map((c) => ({
        name: c.first_name,
        company: c.company,
        segment: c.segment,
        subject: buildEmail(c.first_name || '', c.company || '', c.segment || '').subject,
      })),
    })
  }

  const started = Date.now()
  let sent = 0
  const failures: { id: string; error: string }[] = []
  let stoppedEarly = false

  for (const c of contacts) {
    if (Date.now() - started > TIME_BUDGET_MS) {
      stoppedEarly = true // the rest stay 'not_contacted' and go out tomorrow
      break
    }
    try {
      await sendOutreachEmail(c)
      sent++
      const { error: upErr } = await supabase
        .from('outreach_contacts')
        .update({ status: 'emailed', last_activity_at: new Date().toISOString() })
        .eq('id', c.id)
      if (upErr) console.error('[send-outreach] status update failed', c.id, upErr.message)
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      failures.push({ id: c.id, error: msg })
      // A login/connection problem is not this contact's fault and would fail every email:
      // leave them pending for the next run and stop now.
      if (/auth|login|ECONNREFUSED|ETIMEDOUT|ENOTFOUND|ESOCKET|535|421/i.test(msg)) {
        stoppedEarly = true
        break
      }
      // Anything else (e.g. mailbox rejected) is specific to this address: record it, don't retry
      await supabase
        .from('outreach_contacts')
        .update({ status: 'email_failed', notes: `Send failed ${new Date().toISOString()}: ${msg}`.slice(0, 500), last_activity_at: new Date().toISOString() })
        .eq('id', c.id)
    }
    await new Promise((r) => setTimeout(r, GAP_MS))
  }

  const summary = { candidates: contacts.length, sent, failed: failures.length, stoppedEarly, failures: failures.slice(0, 10) }
  console.log('[send-outreach]', JSON.stringify(summary))
  return NextResponse.json(summary)
}
