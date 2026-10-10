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
const ASSETS = 'https://admin.crelligent.com/email'
const VELODESK_URL = 'https://velodesk.crelligent.com/?utm_source=outreach&utm_medium=email&utm_campaign=founder_cold'

const escapeHtml = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

// Velodesk cold email for early-stage founders.
// Designed HTML built with tables + inline styles only (no images, no web fonts)
// so it renders the same in Gmail, Outlook, Apple Mail and on phones.
// A plain-text version is always sent alongside it.
const C = {
  ink: '#0B0B0C',        // near-black (Velodesk brand)
  green: '#22C55E',      // Velodesk accent
  greenDark: '#15803D',  // accent as text on white (readable)
  mint: '#F0FDF4',       // explainer background
  page: '#F3F4F6',
  text: '#1F2937',
  muted: '#6B7280',
  line: '#E5E7EB',
}
const THIN = "'Helvetica Neue','Segoe UI Light','Segoe UI',Roboto,Helvetica,Arial,sans-serif"
const FONT = "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif"

function buildEmail(firstNameRaw: string, companyRaw: string, segment: string) {
  const firstName = (firstNameRaw || '').trim()
  const company = (companyRaw || '').trim()
  const hasCompany = company.length > 0 && company.toLowerCase() !== 'your company'
  const co = hasCompany ? company : 'your startup'
  const isNigerian = segment === 'Nigerian Founders'
  const payments = isNigerian ? 'Paystack or Stripe' : 'Stripe or Paystack'

  const subject = hasCompany ? `What's ${company}'s PMF score?` : `What's your startup's PMF score?`
  const preheader = `Investors test product-market fit first. Here's how to prove ${co} has it.`

  const name = escapeHtml(firstName || 'there')
  const coH = escapeHtml(co)
  const P = (t: string) => `<p style="margin:0 0 16px;font-family:${FONT};font-size:15px;line-height:1.65;color:${C.text};">${t}</p>`

  const step = (n: number, title: string, body: string) => `
            <tr>
              <td valign="top" width="40" style="padding:0 0 14px;">
                <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
                  <td width="28" height="28" align="center" valign="middle" style="width:28px;height:28px;border-radius:14px;background:${C.green};font-family:${FONT};font-size:13px;font-weight:700;color:${C.ink};">${n}</td>
                </tr></table>
              </td>
              <td valign="top" style="padding:3px 0 14px;font-family:${FONT};font-size:14px;line-height:1.5;color:${C.text};">
                <strong style="color:${C.ink};">${title}</strong><br><span style="color:${C.muted};">${body}</span>
              </td>
            </tr>`

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="light">
<meta name="supported-color-schemes" content="light">
<title>${escapeHtml(subject)}</title>
<style>
  @media only screen and (max-width:480px) {
    .vd-wm { background-position:center 470px !important; }
    .vd-tag { display:none !important; }
    .vd-pad { padding-left:22px !important; padding-right:22px !important; }
  }
</style>
</head>
<body style="margin:0;padding:0;background:${C.page};">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;">${escapeHtml(preheader)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${C.page};">
  <tr><td align="center" style="padding:24px 12px;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;background:#ffffff;border-radius:14px;overflow:hidden;border:1px solid ${C.line};">

      <!-- Header -->
      <tr><td style="background:${C.ink};padding:22px 32px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
          <td valign="middle">
            <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
              <td valign="middle" style="padding-right:12px;"><img src="${ASSETS}/velodesk-owl-white.png" width="26" height="34" alt="Velodesk" style="display:block;border:0;outline:none;width:26px;height:34px;"></td>
              <td valign="middle" style="font-family:${THIN};font-size:20px;font-weight:200;letter-spacing:7px;color:#ffffff;mso-line-height-rule:exactly;line-height:24px;">VELODESK</td>
            </tr></table>
          </td>
          <td class="vd-tag" align="right" style="font-family:${FONT};font-size:12px;color:#9CA3AF;">Prove your PMF</td>
        </tr></table>
      </td></tr>
      <tr><td style="height:4px;line-height:4px;font-size:0;background:${C.green};">&nbsp;</td></tr>

      <!-- Body -->
      <tr><td class="vd-wm vd-pad" background="${ASSETS}/velodesk-watermark.png" bgcolor="#ffffff" style="padding:32px 32px 8px;background-color:#ffffff;background-image:url('${ASSETS}/velodesk-watermark.png');background-repeat:no-repeat;background-position:center 190px;">
        ${P(`Hi ${name},`)}
        ${P(`Quick question: if an investor asked you tomorrow to prove <strong>${coH}</strong> has product-market fit, with data rather than the pitch, what would you show them?`)}

        <!-- PMF explainer -->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:8px 0 24px;">
          <tr><td style="background:${C.mint};border:1px solid #DCFCE7;border-radius:10px;padding:20px 22px;">
            <p style="margin:0 0 8px;font-family:${FONT};font-size:12px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:${C.greenDark};">What is product-market fit (PMF)?</p>
            <p style="margin:0 0 12px;font-family:${FONT};font-size:15px;line-height:1.6;color:${C.text};">It's the point where your product meets strong, real demand: customers <strong>keep using it</strong>, <strong>pay for it</strong> and <strong>tell others about it</strong>, without you having to push.</p>
            <p style="margin:0;font-family:${FONT};font-size:15px;line-height:1.6;color:${C.text};"><strong>Why it matters:</strong> it's the first thing serious investors test. Before your vision or your team, they want proof that customers stay, pay more over time and arrive on their own. Without it, founders hear <em>"come back when you have more traction."</em></p>
          </td></tr>
        </table>

        ${P(`Most early-stage founders I speak with have real traction but no single, credible way to show it. That's why we built <strong>Velodesk</strong>: it turns your real revenue and retention data into a <strong>PMF Score from 0 to 100</strong>, the evidence investors look for, in one link you can share before you raise.`)}

        <!-- How it works -->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:4px 0 12px;">
${step(1, 'Connect the tools you already use', `Starting with ${escapeHtml(payments)}. Read-only access, a few minutes to set up.`)}
${step(2, 'Get your PMF Score', 'Built from how customers actually stay, pay and grow.')}
${step(3, 'Share it with investors', 'One link with the evidence behind your traction.')}
        </table>

        <!-- CTA -->
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:8px 0 10px;">
          <tr><td align="center" style="border-radius:10px;background:${C.green};">
            <a href="${VELODESK_URL}" style="display:inline-block;padding:14px 28px;font-family:${FONT};font-size:15px;font-weight:700;color:${C.ink};text-decoration:none;border-radius:10px;">See how Velodesk works &rarr;</a>
          </td></tr>
        </table>
        <p style="margin:0 0 24px;font-family:${FONT};font-size:13px;color:${C.muted};">14-day free trial &middot; <a href="${VELODESK_URL}" style="color:${C.greenDark};text-decoration:underline;">velodesk.crelligent.com</a></p>

        ${P(`If it's useful, I'm happy to walk you through ${coH}'s score myself. Just reply to this email.`)}
      </td></tr>

      <!-- Signature -->
      <tr><td class="vd-pad" style="padding:8px 32px 28px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-top:1px solid ${C.line};">
          <tr><td style="padding-top:20px;">
            <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
              <td valign="middle" width="56" style="padding-right:14px;">
                <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
                  <td width="52" height="52" valign="middle"><img src="${ASSETS}/velodesk-avatar.png" width="52" height="52" alt="Velodesk" style="display:block;border:0;outline:none;width:52px;height:52px;border-radius:26px;"></td>
                </tr></table>
              </td>
              <td valign="middle" style="border-left:3px solid ${C.green};padding-left:14px;">
                <p style="margin:0;font-family:${FONT};font-size:16px;font-weight:700;color:${C.ink};">Uche Igboanugo</p>
                <p style="margin:2px 0 8px;font-family:${FONT};font-size:13px;line-height:1.5;color:${C.muted};">Founder, Velodesk<br>Crelligent &amp; Company &middot; Lagos, Nigeria</p>
                <p style="margin:0;font-family:${FONT};font-size:13px;line-height:1.7;">
                  <a href="${VELODESK_URL}" style="color:${C.greenDark};text-decoration:none;font-weight:600;">velodesk.crelligent.com</a><br>
                  <a href="mailto:uche@crelligent.com" style="color:${C.text};text-decoration:none;">uche@crelligent.com</a>
                </p>
              </td>
            </tr></table>
          </td></tr>
        </table>
      </td></tr>

      <!-- P.S. -->
      <tr><td style="background:#FAFAFA;border-top:1px solid ${C.line};padding:16px 32px;">
        <p style="margin:0;font-family:${FONT};font-size:13px;line-height:1.6;color:${C.muted};">P.S. If ${coH} isn't raising in the next 12 months, reply <strong>"not now"</strong> and I won't follow up.</p>
      </td></tr>
    </table>

    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:20px auto 0;">
      <tr><td align="center" style="font-family:${FONT};font-size:12px;line-height:1.6;color:${C.muted};">
        Velodesk is a product of <a href="https://crelligent.com" style="color:${C.ink};font-weight:600;text-decoration:none;">Crelligent</a> &middot; <a href="https://crelligent.com" style="color:${C.muted};text-decoration:underline;">crelligent.com</a>
      </td></tr>
      <tr><td align="center" style="padding:12px 0 4px;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
          <td style="padding:0 5px;"><a href="https://linkedin.com/company/crelligent" style="text-decoration:none;"><img src="${ASSETS}/icon-linkedin.png" width="28" height="28" alt="LinkedIn" style="display:block;border:0;outline:none;width:28px;height:28px;"></a></td>
          <td style="padding:0 5px;"><a href="https://x.com/crelligent" style="text-decoration:none;"><img src="${ASSETS}/icon-x.png" width="28" height="28" alt="X" style="display:block;border:0;outline:none;width:28px;height:28px;"></a></td>
          <td style="padding:0 5px;"><a href="https://instagram.com/crelligent" style="text-decoration:none;"><img src="${ASSETS}/icon-instagram.png" width="28" height="28" alt="Instagram" style="display:block;border:0;outline:none;width:28px;height:28px;"></a></td>
        </tr></table>
      </td></tr>
      <tr><td align="center" style="padding-top:8px;font-family:${FONT};font-size:11px;color:#9CA3AF;">Crelligent &amp; Company Limited &middot; Lagos, Nigeria</td></tr>
    </table>
  </td></tr>
</table>
</body>
</html>`

  const text = [
    `Hi ${firstName || 'there'},`,
    `Quick question: if an investor asked you tomorrow to prove ${co} has product-market fit, with data rather than the pitch, what would you show them?`,
    `WHAT IS PRODUCT-MARKET FIT (PMF)?\nIt's the point where your product meets strong, real demand: customers keep using it, pay for it and tell others about it, without you having to push.\n\nWhy it matters: it's the first thing serious investors test. Before your vision or your team, they want proof that customers stay, pay more over time and arrive on their own. Without it, founders hear "come back when you have more traction."`,
    `Most early-stage founders I speak with have real traction but no single, credible way to show it. That's why we built Velodesk: it turns your real revenue and retention data into a PMF Score from 0 to 100, the evidence investors look for, in one link you can share before you raise.`,
    `How it works:\n1. Connect the tools you already use, starting with ${payments} (read-only, a few minutes)\n2. Get your PMF Score\n3. Share it with investors`,
    `See how it works (14-day free trial): velodesk.crelligent.com`,
    `If it's useful, I'm happy to walk you through ${co}'s score myself. Just reply to this email.`,
    `Uche Igboanugo\nFounder, Velodesk · Crelligent & Company\nvelodesk.crelligent.com | uche@crelligent.com | Lagos, Nigeria`,
    `P.S. If ${co} isn't raising in the next 12 months, reply "not now" and I won't follow up.`,
    `Velodesk is a product of Crelligent · crelligent.com\nLinkedIn: linkedin.com/company/crelligent · X: x.com/crelligent · Instagram: instagram.com/crelligent`,
  ].join('\n\n')

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
