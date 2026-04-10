'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'

function toJaMessage(message: string, isLogin: boolean): string {
  const m = message.toLowerCase()
  if (isLogin) {
    if (
      m.includes('invalid login credentials') ||
      m.includes('invalid_grant') ||
      m.includes('invalid email or password')
    ) {
      return 'メールアドレスまたはパスワードが正しくありません'
    }
    if (m.includes('email not confirmed')) {
      return 'メールアドレスの確認がまだ完了していません。届いたメールのリンクを開いてからログインしてください。'
    }
    if (m.includes('too many requests')) {
      return '試行回数が多すぎます。しばらくしてからお試しください。'
    }
    return 'ログインに失敗しました。しばらくしてからお試しください。'
  }
  if (m.includes('user already registered') || m.includes('already been registered')) {
    return 'このメールアドレスは既に登録されています。'
  }
  if (m.includes('password')) {
    return 'パスワードの条件を満たしていません。8文字以上で設定してください。'
  }
  if (m.includes('invalid email')) {
    return 'メールアドレスの形式が正しくありません。'
  }
  return '登録に失敗しました。入力内容を確認してください。'
}

const FF = "'Noto Sans JP', sans-serif"
const GREEN = '#2D5A27'
const CREAM = '#F8F4EE'
const KAKI = '#C4581A'

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [postSignupEmailSent, setPostSignupEmailSent] = useState(false)
  const [agreeTerms, setAgreeTerms] = useState(false)

  async function handleAuthAction() {
    setError('')
    if (!email.trim() || !password) {
      setError('メールアドレスとパスワードを入力してください。')
      return
    }
    if (!isLogin && password.length < 8) {
      setError('パスワードは8文字以上で設定してください。')
      return
    }
    if (!isLogin && !agreeTerms) {
      setError('利用規約・プライバシーポリシーへの同意が必要です。')
      return
    }

    const supabase = createClient()

    try {
      if (isLogin) {
        const { data, error: err } = await supabase.auth.signInWithPassword({ email, password })
        if (err) {
          setError(toJaMessage(err.message, true))
          return
        }
        if (!data.session) {
          setError('ログインに失敗しました。メール確認が必要な場合は、メールのリンクを開いてからお試しください。')
          return
        }
        window.location.href = '/'
        return
      }

      const { data, error: err } = await supabase.auth.signUp({ email, password })
      if (err) {
        setError(toJaMessage(err.message, false))
        return
      }
      if (data.session) {
        window.location.href = '/setup'
        return
      }
      setPostSignupEmailSent(true)
    } catch {
      setError('通信エラーが発生しました。接続を確認してください。')
    }
  }

  return (
    <div
      style={{
        minHeight: '100dvh',
        background: GREEN,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        fontFamily: FF,
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 400,
          background: CREAM,
          borderRadius: 16,
          padding: '32px 28px',
          boxShadow: '0 12px 40px rgba(0,0,0,.2)',
          fontFamily: FF,
        }}
      >
        {postSignupEmailSent ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20, fontFamily: FF }}>
            <h1
              style={{
                fontSize: '1.2rem',
                fontWeight: 700,
                color: GREEN,
                textAlign: 'center',
                margin: 0,
                fontFamily: FF,
              }}
            >
              メールを確認してください
            </h1>
            <p
              style={{
                fontSize: '.9rem',
                color: '#444',
                lineHeight: 1.65,
                margin: 0,
                textAlign: 'left',
                fontFamily: FF,
              }}
            >
              ご登録のメールアドレスに確認メールを送りました。メール内のリンクをクリックしてから、ログインしてください。
            </p>
            <button
              type="button"
              onClick={() => {
                setPostSignupEmailSent(false)
                setIsLogin(true)
                setError('')
              }}
              style={{
                marginTop: 8,
                padding: '14px',
                fontSize: '.95rem',
                fontWeight: 700,
                fontFamily: FF,
                color: '#fff',
                background: KAKI,
                border: 'none',
                borderRadius: 12,
                cursor: 'pointer',
              }}
            >
              ログイン画面に戻る
            </button>
          </div>
        ) : (
          <>
            <h1
              style={{
                fontSize: '1.35rem',
                fontWeight: 700,
                color: GREEN,
                textAlign: 'center',
                marginBottom: 8,
                letterSpacing: '0.06em',
                fontFamily: FF,
              }}
            >
              MEGURU
            </h1>
            <p style={{ fontSize: '.8rem', color: '#666', textAlign: 'center', marginBottom: 24, fontFamily: FF }}>
              {isLogin ? 'ログイン' : '新規登録'}
            </p>

            <div
              style={{
                display: 'flex',
                marginBottom: 24,
                borderRadius: 10,
                overflow: 'hidden',
                border: '1px solid #e0e0e0',
              }}
            >
              <button
                type="button"
                onClick={() => {
                  setIsLogin(true)
                  setError('')
                  setPostSignupEmailSent(false)
                  setAgreeTerms(false)
                }}
                style={{
                  flex: 1,
                  padding: '10px 12px',
                  fontSize: '.85rem',
                  fontWeight: 600,
                  fontFamily: FF,
                  border: 'none',
                  cursor: 'pointer',
                  background: isLogin ? GREEN : '#f5f5f5',
                  color: isLogin ? '#fff' : '#555',
                }}
              >
                ログイン
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsLogin(false)
                  setError('')
                  setPostSignupEmailSent(false)
                  setAgreeTerms(false)
                }}
                style={{
                  flex: 1,
                  padding: '10px 12px',
                  fontSize: '.85rem',
                  fontWeight: 600,
                  fontFamily: FF,
                  border: 'none',
                  cursor: 'pointer',
                  background: !isLogin ? GREEN : '#f5f5f5',
                  color: !isLogin ? '#fff' : '#555',
                }}
              >
                新規登録
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label
                  htmlFor="email"
                  style={{
                    display: 'block',
                    fontSize: '.78rem',
                    fontWeight: 600,
                    color: '#444',
                    marginBottom: 6,
                    fontFamily: FF,
                  }}
                >
                  メールアドレス
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  placeholder="example@mail.com"
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    padding: '12px 14px',
                    fontSize: '.9rem',
                    fontFamily: FF,
                    border: '1px solid #ccc',
                    borderRadius: 10,
                    outline: 'none',
                  }}
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  style={{
                    display: 'block',
                    fontSize: '.78rem',
                    fontWeight: 600,
                    color: '#444',
                    marginBottom: 6,
                    fontFamily: FF,
                  }}
                >
                  パスワード
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete={isLogin ? 'current-password' : 'new-password'}
                  placeholder={isLogin ? 'パスワード' : '8文字以上'}
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    padding: '12px 14px',
                    fontSize: '.9rem',
                    fontFamily: FF,
                    border: '1px solid #ccc',
                    borderRadius: 10,
                    outline: 'none',
                  }}
                />
                {isLogin && (
                  <p style={{ margin: '8px 0 0', textAlign: 'right', fontFamily: FF }}>
                    <Link
                      href="/reset-password"
                      style={{
                        fontSize: '0.78rem',
                        color: '#2D5A27',
                        textDecoration: 'underline',
                      }}
                    >
                      パスワードをお忘れの方はこちら
                    </Link>
                  </p>
                )}
              </div>

              {!isLogin && (
                <label
                  htmlFor="agree-terms"
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 10,
                    cursor: 'pointer',
                    fontSize: '.82rem',
                    color: '#444',
                    lineHeight: 1.5,
                    fontFamily: FF,
                  }}
                >
                  <input
                    id="agree-terms"
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={(e) => {
                      setAgreeTerms(e.target.checked)
                      setError('')
                    }}
                    style={{ marginTop: 3, width: 16, height: 16, flexShrink: 0, accentColor: GREEN }}
                  />
                  <span>
                    <Link
                      href="/terms"
                      onClick={(e) => e.stopPropagation()}
                      style={{ color: KAKI, textDecoration: 'underline', fontWeight: 600 }}
                    >
                      利用規約・プライバシーポリシー
                    </Link>
                    に同意する
                  </span>
                </label>
              )}

              {error && (
                <div
                  role="alert"
                  style={{
                    padding: '10px 12px',
                    fontSize: '.8rem',
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
                type="button"
                onClick={handleAuthAction}
                style={{
                  marginTop: 8,
                  padding: '14px',
                  fontSize: '.95rem',
                  fontWeight: 700,
                  fontFamily: FF,
                  color: '#fff',
                  background: GREEN,
                  border: 'none',
                  borderRadius: 12,
                  cursor: 'pointer',
                }}
              >
                {isLogin ? 'ログイン' : '登録する'}
              </button>
            </div>
          </>
        )}
        <p
          style={{
            textAlign: 'center',
            marginTop: 22,
            marginBottom: 0,
            fontSize: '.82rem',
            fontFamily: FF,
          }}
        >
          <Link href="/contact" style={{ color: KAKI, textDecoration: 'underline', fontWeight: 500 }}>
            お問い合わせ
          </Link>
        </p>
      </div>
    </div>
  )
}
