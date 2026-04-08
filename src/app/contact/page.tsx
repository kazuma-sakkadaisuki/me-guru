import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'お問い合わせ | MEGURU',
  description: 'MEGURU（めぐる）へのお問い合わせ',
}

const FF = "'Noto Sans JP', sans-serif"
const GREEN = '#2D5A27'
const KAKI = '#C4581A'
const CREAM = '#F8F4EE'

const CONTACT_EMAIL = 'meguru.contact@gmail.com'

export default function ContactPage() {
  return (
    <div
      style={{
        minHeight: '100dvh',
        background: CREAM,
        fontFamily: FF,
        color: '#333',
        lineHeight: 1.75,
      }}
    >
      <header
        style={{
          background: GREEN,
          color: '#fff',
          padding: '16px 20px',
          fontFamily: FF,
        }}
      >
        <div
          style={{
            maxWidth: 720,
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 12,
          }}
        >
          <span style={{ fontWeight: 700, fontSize: '1rem', letterSpacing: '0.06em' }}>MEGURU</span>
          <Link
            href="/"
            style={{
              color: '#fff',
              fontSize: '.85rem',
              textDecoration: 'underline',
              textUnderlineOffset: 3,
              fontFamily: FF,
            }}
          >
            ホームに戻る
          </Link>
        </div>
      </header>

      <main
        style={{
          maxWidth: 720,
          margin: '0 auto',
          padding: '28px 20px 48px',
          fontFamily: FF,
        }}
      >
        <h1
          style={{
            fontSize: '1.35rem',
            fontWeight: 700,
            color: GREEN,
            margin: '0 0 20px',
            fontFamily: FF,
          }}
        >
          お問い合わせ
        </h1>
        <p style={{ fontSize: '.95rem', margin: '0 0 20px', color: '#444', fontFamily: FF }}>
          ご不明な点やトラブルがございましたら、以下のメールアドレスまでご連絡ください。
        </p>
        <p style={{ margin: '0 0 24px', fontFamily: FF }}>
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            style={{
              fontSize: '1rem',
              fontWeight: 600,
              color: KAKI,
              textDecoration: 'underline',
              wordBreak: 'break-all',
            }}
          >
            {CONTACT_EMAIL}
          </a>
        </p>
        <p style={{ fontSize: '.9rem', color: '#555', margin: 0, fontFamily: FF }}>
          返信について：2〜3営業日以内にご返信いたします。
        </p>
      </main>
    </div>
  )
}
