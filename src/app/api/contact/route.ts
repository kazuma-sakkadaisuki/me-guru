import { NextResponse } from 'next/server'
import { Resend } from 'resend'

const TO_EMAIL = 'meguru.contact@gmail.com'
const FROM_EMAIL = 'onboarding@resend.dev'
const MAX_MESSAGE = 500
const MAX_NAME = 200

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function isValidEmail(s: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s)
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Record<string, unknown>
    const name = typeof body.name === 'string' ? body.name.trim().slice(0, MAX_NAME) : ''
    const email = typeof body.email === 'string' ? body.email.trim() : ''
    const message = typeof body.message === 'string' ? body.message.trim() : ''

    if (!email) {
      return NextResponse.json({ ok: false, error: 'メールアドレスを入力してください。' }, { status: 400 })
    }
    if (!isValidEmail(email)) {
      return NextResponse.json({ ok: false, error: 'メールアドレスの形式が正しくありません。' }, { status: 400 })
    }
    if (!message) {
      return NextResponse.json({ ok: false, error: 'お問い合わせ内容を入力してください。' }, { status: 400 })
    }
    if (message.length > MAX_MESSAGE) {
      return NextResponse.json(
        { ok: false, error: `お問い合わせ内容は${MAX_MESSAGE}文字以内で入力してください。` },
        { status: 400 }
      )
    }

    const apiKey = process.env.RESEND_API_KEY
    if (!apiKey) {
      console.error('[contact] RESEND_API_KEY is not set')
      return NextResponse.json(
        { ok: false, error: '送信の設定が完了していません。しばらくしてからお試しください。' },
        { status: 500 }
      )
    }

    const resend = new Resend(apiKey)

    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: TO_EMAIL,
      replyTo: email,
      subject: `【MEGURUお問い合わせ】${name || '（お名前なし）'}様より`,
      html: `
        <p><strong>お名前</strong><br />${escapeHtml(name || '（未入力）')}</p>
        <p><strong>メールアドレス</strong><br />${escapeHtml(email)}</p>
        <p><strong>お問い合わせ内容</strong><br />${escapeHtml(message).replace(/\n/g, '<br />')}</p>
      `,
    })

    if (error) {
      console.error('[contact] Resend error:', error)
      return NextResponse.json(
        { ok: false, error: '送信に失敗しました。時間をおいて再度お試しください。' },
        { status: 502 }
      )
    }

    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('[contact]', e)
    return NextResponse.json({ ok: false, error: '送信に失敗しました。' }, { status: 500 })
  }
}
