'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'

const FF = "'Noto Sans JP', sans-serif"
const GREEN = '#2D5A27'
const KAKI = '#C4581A'
const MIN_LEN = 8

export function UpdatePasswordForm() {
  const [password, setPassword] = useState('')
  const [password2, setPassword2] = useState('')
  const [error, setError] = useState('')
  const [sessionReady, setSessionReady] = useState(false)
  const [checking, setChecking] = useState(true)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const supabase = createClient()

    const applySession = (hasSession: boolean) => {
      setSessionReady(hasSession)
      setChecking(false)
    }

    void supabase.auth.getSession().then(({ data: { session } }) => {
      applySession(!!session)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY' || event === 'SIGNED_IN' || event === 'INITIAL_SESSION') {
        if (session) {
          setSessionReady(true)
          setChecking(false)
        }
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (password.length < MIN_LEN) {
      setError(`パスワードは${MIN_LEN}文字以上で設定してください。`)
      return
    }
    if (password !== password2) {
      setError('パスワードが一致しません。')
      return
    }

    setLoading(true)
    try {
      const supabase = createClient()
      const { error: err } = await supabase.auth.updateUser({ password })
      if (err) {
        setError(err.message || '更新に失敗しました。しばらくしてからお試しください。')
        return
      }
      await supabase.auth.signOut()
      window.location.href = '/login'
    } catch {
      setError('通信エラーが発生しました。接続を確認してください。')
    } finally {
      setLoading(false)
    }
  }

  if (checking) {
    return (
      <p style={{ fontSize: '.9rem', color: '#666', fontFamily: FF }}>読み込み中…</p>
    )
  }

  if (!sessionReady) {
    return (
      <div
        role="alert"
        style={{
          padding: '12px 14px',
          fontSize: '.88rem',
          color: '#92400e',
          background: '#fffbeb',
          borderRadius: 10,
          border: '1px solid #fde68a',
          fontFamily: FF,
          lineHeight: 1.6,
        }}
      >
        リンクが無効か期限切れです。パスワードリセットを再度お試しください。
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18, fontFamily: FF }}>
      <div>
        <label
          htmlFor="new-password"
          style={{ display: 'block', fontSize: '.78rem', fontWeight: 600, color: '#444', marginBottom: 6, fontFamily: FF }}
        >
          新しいパスワード
        </label>
        <input
          id="new-password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="new-password"
          placeholder={`${MIN_LEN}文字以上`}
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
        <label
          htmlFor="new-password-2"
          style={{ display: 'block', fontSize: '.78rem', fontWeight: 600, color: '#444', marginBottom: 6, fontFamily: FF }}
        >
          新しいパスワード（確認）
        </label>
        <input
          id="new-password-2"
          type="password"
          value={password2}
          onChange={(e) => setPassword2(e.target.value)}
          autoComplete="new-password"
          placeholder="もう一度入力"
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
        {loading ? '更新中…' : 'パスワードを更新する'}
      </button>
    </form>
  )
}
