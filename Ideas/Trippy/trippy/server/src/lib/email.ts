// Email sending: Resend API when RESEND_API_KEY is set, console fallback in dev.
// Zero npm dependencies — uses Node 18+ built-in fetch.

const APP_URL = process.env.APP_URL || 'http://localhost:5173'
const FROM = process.env.EMAIL_FROM || 'Trippy <no-reply@trippy.travel>'

async function sendViaResend(to: string, subject: string, html: string) {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${process.env.RESEND_API_KEY}` },
    body: JSON.stringify({ from: FROM, to, subject, html }),
  })
  if (!res.ok) {
    const body = await res.text()
    throw new Error(`Resend error ${res.status}: ${body}`)
  }
}

export async function sendPasswordReset(toEmail: string, token: string) {
  const link = `${APP_URL}/reset-password?token=${token}`
  const html = `
    <div style="font-family:sans-serif;max-width:480px;margin:0 auto">
      <h2 style="color:#0d9488">Reset your Trippy password</h2>
      <p>Click the button below to set a new password. This link expires in <strong>1 hour</strong>.</p>
      <a href="${link}" style="display:inline-block;padding:12px 24px;background:#0d9488;color:#fff;text-decoration:none;border-radius:8px;font-weight:600;margin:16px 0">Reset password</a>
      <p style="color:#888;font-size:13px">If you didn't request this, you can safely ignore this email.</p>
      <hr style="border:none;border-top:1px solid #eee;margin:24px 0">
      <p style="color:#aaa;font-size:12px">Trippy — Find your people. Travel solo, never alone.</p>
    </div>`

  if (!process.env.RESEND_API_KEY) {
    // Dev: print the link to the server console so you can click it directly.
    console.log(`\n[email] Password reset link for ${toEmail}:\n  ${link}\n`)
    return
  }
  await sendViaResend(toEmail, 'Reset your Trippy password', html)
}
