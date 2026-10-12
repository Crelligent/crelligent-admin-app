/**
 * Outreach tracks beyond the young-founder Velodesk email (approved 11 Oct 2026):
 *   - Established startups: Velodesk reporting + Crelligent Foundry, from Uche, with one follow-up
 *   - Partners: investors / media & events / consultancies, from partnerships@
 * Personal, plain emails (light HTML + plain text). Copy lives here; edit it here.
 */
import nodemailer from 'nodemailer'
import { env, transporter as mainTransporter } from './outreach-email'

export const TRACK_SEGMENTS = {
  established: 'Track: Established startups',
  investors: 'Track: Partners - Investors',
  media: 'Track: Partners - Media',
  consultancies: 'Track: Partners - Consultancies',
} as const

export type TrackTemplate = 'established' | 'established_followup' | 'investors' | 'media' | 'consultancies'

export function templateForSegment(segment: string | null | undefined): TrackTemplate | null {
  switch (segment) {
    case TRACK_SEGMENTS.established: return 'established'
    case TRACK_SEGMENTS.investors: return 'investors'
    case TRACK_SEGMENTS.media: return 'media'
    case TRACK_SEGMENTS.consultancies: return 'consultancies'
    default: return null
  }
}

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
const possessive = (name: string) => (/s$/i.test(name) ? `${name}'` : `${name}'s`)

const SIGN_UCHE = ['Uche Igboanugo', 'Founder, Crelligent & Company · Lagos']

interface Draft { subject: string; paragraphs: string[]; signature: string[] }

function draft(template: TrackTemplate, firstNameRaw: string, companyRaw: string): Draft {
  const first = firstNameRaw.trim() || 'there'
  const company = companyRaw.trim() || 'your company'
  const co = companyRaw.trim() ? company : 'your company'

  switch (template) {
    case 'established':
      return {
        subject: `${possessive(company)} next raise, in one number`,
        paragraphs: [
          `Hi ${first},`,
          `${companyRaw.trim() ? company : 'Your company'} is past the "does anyone want this?" stage. The questions now are harder: can you prove the traction to your next investor, and what do you build next?`,
          'Two ways we can help.',
          'Velodesk turns your payment, product and support data into one Product-Market Fit Score, refreshed every day. Founders share a read-only link with investors and use it in board packs instead of rebuilding spreadsheets each month. You can also score a new product line or a new country separately. velodesk.crelligent.com',
          'Crelligent Foundry co-builds new ventures with founders: a second product, a spin-out or a new market, from validation to launch, with our team doing the build.',
          'Would a 20-minute call next week be useful? Reply with a time that works, or "not now" and I won’t follow up.',
        ],
        signature: SIGN_UCHE,
      }
    case 'established_followup':
      return {
        subject: `Re: ${possessive(company)} next raise, in one number`,
        paragraphs: [
          `Hi ${first}, just bringing this back up. If proving traction for ${possessive(co)} next round is on your list this quarter, a free 14-day Velodesk trial takes about 10 minutes to set up.`,
          'velodesk.crelligent.com',
        ],
        signature: SIGN_UCHE,
      }
    case 'investors':
      return {
        subject: `One PMF standard across ${possessive(company)} portfolio`,
        paragraphs: [
          `Hi ${first},`,
          'Every startup in a portfolio reports traction differently, which makes it hard to compare them or spot who needs help. Velodesk scores each one the same way: a Product-Market Fit Score built from their real payment, product and support data, with the seven signals behind it.',
          `We’d like to offer ${possessive(co)} portfolio companies Velodesk on partner terms, and give you a single view of where each one stands. Open to a 20-minute call?`,
        ],
        signature: SIGN_UCHE,
      }
    case 'media':
      return {
        subject: `Something useful for ${possessive(company)} founders`,
        paragraphs: [
          `Hi ${first},`,
          `${company} reaches exactly the founders we built Velodesk for. Velodesk turns a startup’s real data into one Product-Market Fit Score they can show investors.`,
          `We’d love to work together: an extended free trial for your audience, a joint session on measuring product-market fit, or content for your readers. Would any of those be useful to ${co}?`,
        ],
        signature: SIGN_UCHE,
      }
    case 'consultancies':
      return {
        subject: `A referral partnership with ${company}?`,
        paragraphs: [
          `Hi ${first},`,
          `${company} advises the kind of startups that need to prove product-market fit before they raise. Velodesk gives them a score built from their real data, which also makes your work with them easier to evidence.`,
          'We’d like to set up a simple referral partnership: your clients get a better rate, and you get a share of what they pay. Worth a short call?',
        ],
        signature: SIGN_UCHE,
      }
  }
}

export function buildTrackEmail(template: TrackTemplate, firstName: string, company: string) {
  const d = draft(template, firstName || '', company || '')
  const text = [...d.paragraphs, d.signature.join('\n')].join('\n\n')
  const html =
    `<div style="font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.6;color:#1f2937;max-width:600px">` +
    d.paragraphs.map((p) => `<p style="margin:0 0 14px">${esc(p).replace('velodesk.crelligent.com', '<a href="https://velodesk.crelligent.com/?utm_source=outreach&amp;utm_medium=email&amp;utm_campaign=' + template + '" style="color:#4f46e5">velodesk.crelligent.com</a>')}</p>`).join('') +
    `<p style="margin:18px 0 0">${d.signature.map(esc).join('<br>')}</p></div>`
  return { subject: d.subject, text, html }
}

// ---------------------------------------------------------------------------
// Senders. Established -> Uche; partners -> partnerships@.
// If that mailbox's own SMTP login is set in Vercel (SMTP_USER_UCHE / SMTP_PASS_UCHE,
// SMTP_USER_PARTNERSHIPS / SMTP_PASS_PARTNERSHIPS) the email is sent from it directly.
// Otherwise it goes through the main outreach mailbox (SMTP_FROM) with the person's
// address as Reply-To, so replies still reach the right inbox.
// ---------------------------------------------------------------------------

type SenderKey = 'UCHE' | 'PARTNERSHIPS'
const SENDER_ADDRESS: Record<SenderKey, string> = {
  UCHE: 'uche@crelligent.com',
  PARTNERSHIPS: 'partnerships@crelligent.com',
}
const transports = new Map<SenderKey, typeof mainTransporter>()

function senderFor(template: TrackTemplate) {
  const key: SenderKey = template === 'established' || template === 'established_followup' ? 'UCHE' : 'PARTNERSHIPS'
  const address = env(`OUTREACH_FROM_${key}`) || SENDER_ADDRESS[key]
  const user = env(`SMTP_USER_${key}`)
  const pass = env(`SMTP_PASS_${key}`)
  if (user && pass) {
    if (!transports.has(key)) {
      transports.set(key, nodemailer.createTransport({
        pool: true,
        maxConnections: 1,
        maxMessages: 200,
        host: env('SMTP_HOST'),
        port: parseInt(env('SMTP_PORT') || '587'),
        secure: false,
        auth: { user, pass },
        tls: { rejectUnauthorized: false },
      }))
    }
    return { transport: transports.get(key)!, from: `"Uche Igboanugo" <${address}>`, replyTo: address }
  }
  return { transport: mainTransporter, from: `"Uche Igboanugo" <${env('SMTP_FROM')}>`, replyTo: address }
}

export async function sendTrackEmail(template: TrackTemplate, r: { email: string; first_name?: string | null; company?: string | null }) {
  const { subject, html, text } = buildTrackEmail(template, r.first_name || '', r.company || '')
  const s = senderFor(template)
  await s.transport.sendMail({ from: s.from, replyTo: s.replyTo, to: r.email, subject, html, text })
  return { subject, from: s.from, replyTo: s.replyTo }
}
