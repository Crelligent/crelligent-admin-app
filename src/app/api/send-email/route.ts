import { NextRequest, NextResponse } from 'next/server'
import { FROM, buildEmail, env, transporter } from '@/lib/outreach-email'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { to, firstName, company, segment, contactId } = body

    if (!to) {
      return NextResponse.json({ error: 'Missing recipient email' }, { status: 400 })
    }

    const { subject, html, text } = buildEmail(firstName || '', company || '', segment || 'International Founders')

    await transporter.sendMail({ from: FROM(), to, replyTo: env('SMTP_FROM'), subject, html, text })

    return NextResponse.json({ success: true, to, contactId, subject })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('[send-email] SMTP error:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

// Batch send — PUT /api/send-email with { contacts: [...] }
export async function PUT(request: NextRequest) {
  try {
    const { contacts } = await request.json() as {
      contacts: { id: string; email: string; first_name: string; company: string; segment: string }[]
    }

    const results = []
    for (const contact of contacts) {
      if (!contact.email) {
        results.push({ id: contact.id, success: false, error: 'No email' })
        continue
      }
      try {
        const { subject, html, text } = buildEmail(
          contact.first_name || '',
          contact.company || '',
          contact.segment || 'International Founders'
        )
        await transporter.sendMail({ from: FROM(), to: contact.email, replyTo: env('SMTP_FROM'), subject, html, text })
        results.push({ id: contact.id, success: true })
        // Small delay between sends to avoid SMTP rate limits
        await new Promise(r => setTimeout(r, 500))
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : 'Unknown'
        results.push({ id: contact.id, success: false, error: msg })
      }
    }

    const sent = results.filter(r => r.success).length
    return NextResponse.json({ sent, total: contacts.length, results })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
