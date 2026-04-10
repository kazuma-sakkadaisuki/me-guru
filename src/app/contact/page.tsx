import type { Metadata } from 'next'
import Link from 'next/link'
import { ContactForm } from './contact-form'

export const metadata: Metadata = {
  title: 'お問い合わせ | MEGURU',
  description: 'MEGURU（めぐる）へのお問い合わせ',
}

const FF = "'Noto Sans JP', sans-serif"
const GREEN = '#2D5A27'
const CREAM = '#F8F4EE'

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
            maxWidth: 560,
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
          maxWidth: 560,
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
            margin: '0 0 12px',
            fontFamily: FF,
          }}
        >
          お問い合わせ
        </h1>
        <p style={{ fontSize: '.9rem', margin: '0 0 24px', color: '#444', fontFamily: FF }}>
          ご不明な点やトラブルがございましたら、下記フォームよりお送りください。
        </p>
        <ContactForm />
      </main>
    </div>
  )
}
