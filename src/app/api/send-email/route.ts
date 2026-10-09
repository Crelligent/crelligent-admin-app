import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  tls: { rejectUnauthorized: false },
})

function buildEmailHtml(firstName: string, company: string, segment: string): string {
  const isNigerian = segment === 'Nigerian Founders'

  const opener = isNigerian
    ? `I came across ${company || 'your company'} and wanted to reach out directly — founder to founder.`
    : `I came across ${company || 'your company'} and wanted to introduce Crelligent.`

  const context = isNigerian
    ? `We work specifically with Nigerian and West African founders to build the systems infrastructure that lets them compete globally — the kind of operational and data intelligence backbone that separates companies that scale from those that stall.`
    : `We work with ambitious founders across Africa and internationally to build the systems intelligence backbone that separates companies that scale from those that stall — the intersection of McKinsey-level strategy and Palantir-level data engineering.`

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: #1a1a1a; line-height: 1.6; max-width: 560px; margin: 0 auto; padding: 32px 16px; }
    p { margin: 0 0 16px; }
    .sig { margin-top: 32px; border-top: 1px solid #e5e5e5; padding-top: 20px; color: #555; font-size: 14px; }
    .sig strong { color: #1a1a1a; }
    a { color: #7B61FF; }
  </style>
</head>
<body>
  <p>Hi ${firstName || 'there'},</p>

  <p>${opener}</p>

  <p>${context}</p>

  <p>Most early-stage companies I speak with are sitting on fragmented data, manual processes, and hidden system debt that quietly limits growth. We run a structured diagnostic — the <strong>ESRE Framework</strong> — to identify exactly where the system is leaking and what to do about it.</p>

  <p>Would a 20-minute call make sense? No pitch — just a genuine conversation about where you're taking the company and whether there's a real fit.</p>

  <p>You can reply directly to this email or pick a time that works for you.</p>

  <div class="sig">
    <strong>Uche Eze</strong><br>
    Founder & CEO, Crelligent & Company<br>
    <a href="https://crelligent.com">crelligent.com</a> · Lagos, Nigeria
  </div>
</body>
</html>
`
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { to, firstName, company, segment, contactId } = body

    if (!to) {
      return NextResponse.json({ error: 'Missing recipient email' }, { status: 400 })
    }

    const companyName = company || 'your company'
    const subject = `${companyName} × Crelligent — Systems Intelligence for Founders`
    const html = buildEmailHtml(firstName || '', companyName, segment || 'International Founders')

    await transporter.sendMail({
      from: `"Uche | Crelligent" <${process.env.SMTP_FROM}>`,
      to,
      subject,
      html,
    })

    return NextResponse.json({ success: true, to, contactId })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('[send-email] SMTP error:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

// Batch send — POST /api/send-email/batch with { contactIds: string[] }
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
        const companyName = contact.company || 'your company'
        const subject = `${companyName} × Crelligent — Systems Intelligence for Founders`
        const html = buildEmailHtml(contact.first_name || '', companyName, contact.segment || 'International Founders')

        await transporter.sendMail({
          from: `"Uche | Crelligent" <${process.env.SMTP_FROM}>`,
          to: contact.email,
          subject,
          html,
        })
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
