'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { getPasswordUpdateRedirectUrl } from '@/lib/site-origin'

const FF = "'Noto Sans JP', sans-serif"
const GREEN = '#2D5A27'
const KAKI = '#C4581A'

export function ResetPasswordForm() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    const trimmed = email.trim()
    if (!trimmed) {
      setError('メールアドレスを入力してください。')
      return
    }

    setLoading(true)
    try {
      const supabase = createClient()
      const redirectTo = getPasswordUpdateRedirectUrl()
      const { error: err } = await supabase.auth.resetPasswordForEmail(trimmed, { redirectTo })
      if (err) {
        setError(err.message || '送信に失敗しました。しばらくしてからお試しください。')
        return
      }
      setSent(true)
    } catch {
      setError('通信エラーが発生しました。接続を確認してください。')
    } finally {
      setLoading(false)
    }
  }

  if (sent) {
    return (
      <div
        role="status"
        style={{
          padding: '14px 16px',
          fontSize: '.9rem',
          color: GREEN,
          background: 'rgba(45, 90, 39, 0.08)',
          borderRadius: 10,
          border: '1px solid rgba(45, 90, 39, 0.25)',
          lineHeight: 1.65,
          fontFamily: FF,
        }}
      >
        パスワードリセット用のメールを送りました。メール内のリンクからパスワードを変更してください。
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18, fontFamily: FF }}>
      <div>
        <label
          htmlFor="reset-email"
          style={{ display: 'block', fontSize: '.78rem', fontWeight: 600, color: '#444', marginBottom: 6, fontFamily: FF }}
        >
          メールアドレス
        </label>
        <input
          id="reset-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          placeholder="example@mail.com"
          style={{
            width: '100%',
            boxSizing: 'border-box',
            padding: '12px 14px',
            fontSize: '.95rem',
            fontFamily: FF,
            border: '1px solid #ccc',
            borderRadius: 10,
            outline: 'none',
          }}
        />
      </div>
      {error && (
        <div
          role="alert"
          style={{
            padding: '10px 12px',
            fontSize: '.85rem',
            color: '#b91c1c',
            background: '#fef2f2',
            borderRadius: 8,
            border: '1px solid #fecaca',
            fontFamily: FF,
          }}
        >
          {error}
        </div>
      )}
      <button
        type="submit"
        disabled={loading}
        style={{
          padding: '14px',
          fontSize: '1rem',
          fontWeight: 700,
          fontFamily: FF,
          color: '#fff',
          background: KAKI,
          border: 'none',
          borderRadius: 12,
          cursor: loading ? 'wait' : 'pointer',
          opacity: loading ? 0.75 : 1,
        }}
      >
        {loading ? '送信中…' : 'リセットメールを送る'}
      </button>
    </form>
  )
}
