'use client'

import { useState } from 'react'

const FF = "'Noto Sans JP', sans-serif"
const GREEN = '#2D5A27'
const KAKI = '#C4581A'
const MAX_MESSAGE = 500

export function ContactForm() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSuccess(false)
    const msg = message.trim()
    if (!email.trim()) {
      setError('メールアドレスを入力してください。')
      return
    }
    if (!msg) {
      setError('お問い合わせ内容を入力してください。')
      return
    }
    if (msg.length > MAX_MESSAGE) {
      setError(`お問い合わせ内容は${MAX_MESSAGE}文字以内で入力してください。`)
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim() || undefined,
          email: email.trim(),
          message: msg,
        }),
      })
      const data = (await res.json()) as { ok?: boolean; error?: string }
      if (!res.ok || !data.ok) {
        setError(data.error ?? '送信に失敗しました。')
        return
      }
      setSuccess(true)
      setName('')
      setEmail('')
      setMessage('')
    } catch {
      setError('通信エラーが発生しました。接続を確認してください。')
    } finally {
      setLoading(false)
    }
  }

  const remaining = MAX_MESSAGE - message.length

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18, fontFamily: FF }}>
      {success && (
        <div
          role="status"
          style={{
            padding: '12px 14px',
            fontSize: '.9rem',
            color: GREEN,
            background: 'rgba(45, 90, 39, 0.08)',
            borderRadius: 10,
            border: '1px solid rgba(45, 90, 39, 0.25)',
            fontFamily: FF,
          }}
        >
          お問い合わせを受け付けました。2〜3営業日以内にご返信します。
        </div>
      )}

      <div>
        <label htmlFor="contact-name" style={{ display: 'block', fontSize: '.78rem', fontWeight: 600, color: '#444', marginBottom: 6, fontFamily: FF }}>
          お名前（任意）
        </label>
        <input
          id="contact-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoComplete="name"
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

      <div>
        <label htmlFor="contact-email" style={{ display: 'block', fontSize: '.78rem', fontWeight: 600, color: '#444', marginBottom: 6, fontFamily: FF }}>
          メールアドレス（必須）
        </label>
        <input
          id="contact-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
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

      <div>
        <label htmlFor="contact-message" style={{ display: 'block', fontSize: '.78rem', fontWeight: 600, color: '#444', marginBottom: 6, fontFamily: FF }}>
          お問い合わせ内容（必須）
        </label>
        <textarea
          id="contact-message"
          value={message}
          maxLength={MAX_MESSAGE}
          onChange={(e) => setMessage(e.target.value)}
          rows={6}
          style={{
            width: '100%',
            boxSizing: 'border-box',
            minHeight: 120,
            padding: '12px 14px',
            fontSize: '.95rem',
            fontFamily: FF,
            border: '1px solid #ccc',
            borderRadius: 10,
            outline: 'none',
            resize: 'vertical',
          }}
        />
        <p style={{ fontSize: '.72rem', color: '#888', marginTop: 4, textAlign: 'right', fontFamily: FF }}>
          残り {remaining} 文字
        </p>
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
          marginTop: 4,
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
        {loading ? '送信中…' : '送信する'}
      </button>
    </form>
  )
}
