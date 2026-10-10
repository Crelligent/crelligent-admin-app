import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!
)

// Called by scheduled task or manually from the UI
// Expects Apollo search results to be passed in, OR can be triggered
// by the Claude scheduled task which uses Apollo MCP directly.
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { contacts: incomingContacts, sendEmails = true } = body as {
      contacts: {
        first_name?: string
        last_name?: string
        email?: string
        phone?: string
        title?: string
        company?: string
        city?: string
        state?: string
        country?: string
        linkedin_url?: string
        segment?: string
      }[]
      sendEmails?: boolean
    }

    if (!incomingContacts || incomingContacts.length === 0) {
      return NextResponse.json({ error: 'No contacts provided' }, { status: 400 })
    }

    // 1. Get existing emails to deduplicate
    const emails = incomingContacts.map(c => c.email).filter(Boolean)
    const { data: existing } = await supabase
      .from('outreach_contacts')
      .select('email')
      .in('email', emails)

    const existingEmails = new Set((existing || []).map(c => c.email))

    // 2. Filter to only new contacts
    const newContacts = incomingContacts
      .filter(c => c.email && !existingEmails.has(c.email))
      .map(c => ({
        first_name: c.first_name || '',
        last_name: c.last_name || '',
        email: c.email || '',
        phone: c.phone || null,
        title: c.title || null,
        company: c.company || null,
        city: c.city || null,
        state: c.state || null,
        country: c.country || null,
        linkedin_url: c.linkedin_url || null,
        segment: c.segment || deriveSegment(c.country),
        status: 'not_contacted',
      }))

    if (newContacts.length === 0) {
      return NextResponse.json({ inserted: 0, sent: 0, message: 'All contacts already exist' })
    }

    // 3. Insert into Supabase
    const { data: inserted, error: insertError } = await supabase
      .from('outreach_contacts')
      .insert(newContacts)
      .select()

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 })
    }

    const insertedContacts = inserted || []

    // 4. Send outreach emails if enabled
    let sent = 0
    let emailErrors: string[] = []

    if (sendEmails && insertedContacts.length > 0) {
      const contactsWithEmail = insertedContacts.filter(c => c.email)

      // Call our own send-email batch endpoint
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3003'
      const emailRes = await fetch(`${baseUrl}/api/send-email`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contacts: contactsWithEmail }),
      })

      if (emailRes.ok) {
        const emailResult = await emailRes.json()
        sent = emailResult.sent || 0
        emailErrors = (emailResult.results || [])
          .filter((r: { success: boolean; error?: string }) => !r.success)
          .map((r: { error?: string }) => r.error || 'Unknown')

        // Update status to 'emailed' for successfully sent contacts
        const sentIds = (emailResult.results || [])
          .filter((r: { id: string; success: boolean }) => r.success)
          .map((r: { id: string }) => r.id)

        if (sentIds.length > 0) {
          await supabase
            .from('outreach_contacts')
            .update({ status: 'emailed', last_activity_at: new Date().toISOString() })
            .in('id', sentIds)
        }
      }
    }

    return NextResponse.json({
      inserted: insertedContacts.length,
      skipped: incomingContacts.length - newContacts.length,
      sent,
      emailErrors: emailErrors.length > 0 ? emailErrors : undefined,
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

function deriveSegment(country?: string): string {
  if (!country) return 'International Founders'
  const normalized = country.toLowerCase()
  if (normalized.includes('nigeria') || normalized === 'ng') {
    return 'Nigerian Founders'
  }
  return 'International Founders'
}
