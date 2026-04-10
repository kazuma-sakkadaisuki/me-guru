import type { Metadata } from 'next'
import Link from 'next/link'
import { UpdatePasswordForm } from './update-password-form'

export const metadata: Metadata = {
  title: 'パスワードを更新 | MEGURU',
  description: 'MEGURU（めぐる）のパスワードを設定',
}

const FF = "'Noto Sans JP', sans-serif"
const GREEN = '#2D5A27'
const CREAM = '#F8F4EE'

export default function UpdatePasswordPage() {
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
            maxWidth: 400,
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
            href="/login"
            style={{
              color: '#fff',
              fontSize: '.85rem',
              textDecoration: 'underline',
              textUnderlineOffset: 3,
              fontFamily: FF,
            }}
          >
            ログインに戻る
          </Link>
        </div>
      </header>

      <main
        style={{
          maxWidth: 400,
          margin: '0 auto',
          padding: '28px 20px 48px',
          fontFamily: FF,
        }}
      >
        <h1
          style={{
            fontSize: '1.2rem',
            fontWeight: 700,
            color: GREEN,
            margin: '0 0 12px',
            fontFamily: FF,
          }}
        >
          新しいパスワードを設定
        </h1>
        <p style={{ fontSize: '.88rem', margin: '0 0 22px', color: '#444', fontFamily: FF }}>
          メールのリンクからアクセスした場合のみ、この画面でパスワードを変更できます。
        </p>
        <UpdatePasswordForm />
      </main>
    </div>
  )
}
