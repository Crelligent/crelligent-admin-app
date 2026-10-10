import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

// Trim env values: a stray space or quote pasted into Vercel makes the mail
// server reject the login with "535 Incorrect authentication data".
const env = (name: string) => (process.env[name] || '').trim().replace(/^["']|["']$/g, '')

const transporter = nodemailer.createTransport({
  host: env('SMTP_HOST'),
  port: parseInt(env('SMTP_PORT') || '587'),
  secure: false,
  auth: {
    user: env('SMTP_USER'),
    pass: env('SMTP_PASS'),
  },
  tls: { rejectUnauthorized: false },
})

const FROM = () => `"Uche from Velodesk" <${env('SMTP_FROM')}>`
const VELODESK_URL = 'https://velodesk.crelligent.com/?utm_source=outreach&utm_medium=email&utm_campaign=founder_cold'

const escapeHtml = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

// Velodesk cold email for early-stage founders.
// Kept deliberately plain: it should read like a personal note, not a newsletter,
// so it lands in Primary and gets replies. One link, no images.
function buildEmail(firstNameRaw: string, companyRaw: string, segment: string) {
  const firstName = (firstNameRaw || '').trim()
  const company = (companyRaw || '').trim()
  const hasCompany = company.length > 0 && company.toLowerCase() !== 'your company'
  const co = hasCompany ? company : 'your startup'
  const isNigerian = segment === 'Nigerian Founders'
  const payments = isNigerian ? 'Paystack or Stripe' : 'Stripe or Paystack'

  const subject = hasCompany ? `What's ${company}'s PMF score?` : `What's your startup's PMF score?`

  const paragraphs = [
    `Hi ${firstName || 'there'},`,
    `Quick question: if an investor asked you tomorrow to prove ${co} has product-market fit, with data rather than the pitch, what would you show them?`,
    `Most early-stage founders I speak with have real traction but no single, credible way to show it. That's why we built Velodesk.`,
    `Velodesk connects to ${payments} and turns your real revenue and retention data into a PMF Score from 0 to 100: the evidence investors look for, in one link you can share before you raise.`,
    `See how it works (14-day free trial): LINK`,
    `If it's useful, I'm happy to walk you through ${co}'s score myself. Just reply to this email.`,
  ]
  const ps = `P.S. If ${co} isn't raising in the next 12 months, reply "not now" and I won't follow up.`

  const text = [
    ...paragraphs.map(p => p.replace('LINK', 'velodesk.crelligent.com')),
    'Uche Igboanugo\nFounder, Velodesk · Crelligent & Company\nLagos, Nigeria',
    ps,
  ].join('\n\n')

  const link = `<a href="${VELODESK_URL}" style="color:#15803d;font-weight:600;">velodesk.crelligent.com</a>`
  const htmlParas = paragraphs
    .map(p => escapeHtml(p).replace('LINK', link))
    .map(p => `<p style="margin:0 0 16px;">${p}</p>`)
    .join('\n    ')

  const html = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head>
<body style="margin:0;padding:24px 16px;background:#ffffff;">
  <div style="max-width:560px;margin:0 auto;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;font-size:15px;line-height:1.6;color:#1a1a1a;">
    ${htmlParas}
    <p style="margin:24px 0 0;color:#1a1a1a;">
      <strong>Uche Igboanugo</strong><br>
      <span style="color:#555;">Founder, Velodesk · Crelligent &amp; Company<br>Lagos, Nigeria</span>
    </p>
    <p style="margin:24px 0 0;color:#555;font-size:13px;">${escapeHtml(ps)}</p>
  </div>
</body>
</html>`

  return { subject, html, text }
}

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
