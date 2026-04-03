'use client'

import { type ChangeEvent, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { AREA_DATA, LS_AREA_KEY, LS_DISTRICTS_KEY } from '@/lib/area-data'
import { NAGANO_PREF } from '@/lib/nagano-municipalities'
import { uploadUserAvatar } from '@/lib/upload-avatar'

const MUNICIPALITIES = AREA_DATA['長野県'] || []
const CREAM = '#F8F4EE'
const GREEN = '#2D5A27'
const KAKI = '#C4581A'
const FF = "'Noto Sans JP', sans-serif"

const MAX_NAME = 20
const MAX_BIO = 100
const AVATAR_SIZE = 80

function SetupCameraIcon() {
  return (
    <svg
      width={36}
      height={36}
      viewBox="0 0 24 24"
      fill="none"
      stroke="#fff"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
      <circle cx="12" cy="13" r="4" />
    </svg>
  )
}

export default function SetupPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [municipality, setMunicipality] = useState('')
  const [bio, setBio] = useState('')
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const check = async () => {
      const supabase = createClient()
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (!session) {
        router.replace('/login')
        return
      }
    }
    void check()
  }, [router])

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl)
    }
  }, [previewUrl])

  const onAvatarChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.currentTarget.files?.[0]
    e.currentTarget.value = ''
    if (!file || !file.type.startsWith('image/')) return
    setError('')
    setAvatarFile(file)
    setPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev)
      return URL.createObjectURL(file)
    })
  }

  const handleSubmit = async () => {
    setError('')
    const n = name.trim()
    if (!n) {
      setError('名前を入力してください')
      return
    }
    if (n.length > MAX_NAME) {
      setError(`名前は${MAX_NAME}文字以内で入力してください`)
      return
    }
    if (!municipality) {
      setError('お住まいのエリアを選択してください')
      return
    }
    const b = bio.trim()
    if (bio.length > MAX_BIO) {
      setError(`自己紹介は${MAX_BIO}文字以内で入力してください`)
      return
    }

    setSaving(true)
    const supabase = createClient()
    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (!session) {
      router.replace('/login')
      setSaving(false)
      return
    }

    const area = `${NAGANO_PREF} ${municipality}`
    localStorage.setItem(LS_AREA_KEY, area)
    localStorage.setItem(LS_DISTRICTS_KEY, JSON.stringify([]))

    // 1. 画像が選択されていれば Storage にアップロード
    let avatarUrl: string | null = null
    if (avatarFile) {
      const up = await uploadUserAvatar(supabase, session.user.id, avatarFile)
      if ('error' in up) {
        setError('画像のアップロードに失敗しました')
        setSaving(false)
        return
      }
      avatarUrl = up.publicUrl
    }

    // 2. name・area・bio・avatar_url をまとめて upsert
    const row: {
      id: string
      name: string
      area: string
      bio: string | null
      avatar_url?: string | null
    } = {
      id: session.user.id,
      name: n,
      area,
      bio: b || null,
    }
    if (avatarUrl) row.avatar_url = avatarUrl

    const { error: err } = await supabase.from('profiles').upsert(row, { onConflict: 'id' })
    if (err) {
      setError('保存に失敗しました')
      setSaving(false)
      return
    }

    // 3. ホームへ
    window.location.href = '/'
  }

  const bioRemaining = MAX_BIO - bio.length

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
          maxWidth: 420,
          background: CREAM,
          borderRadius: 16,
          padding: '32px 28px',
          boxShadow: '0 12px 40px rgba(0,0,0,.2)',
          fontFamily: FF,
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18, alignItems: 'center' }}>
          {/* 1. プロフィール画像（任意）— フォーム最上部 */}
          <div style={{ position: 'relative', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <button
              type="button"
              onClick={() => document.getElementById('setup-avatar-input')?.click()}
              style={{
                width: AVATAR_SIZE,
                height: AVATAR_SIZE,
                borderRadius: '50%',
                border: 'none',
                padding: 0,
                cursor: 'pointer',
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: previewUrl ? 'transparent' : GREEN,
                flexShrink: 0,
              }}
              aria-label="プロフィール画像を選ぶ"
            >
              {previewUrl ? (
                <img
                  src={previewUrl}
                  alt=""
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <SetupCameraIcon />
              )}
            </button>
            <input
              id="setup-avatar-input"
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={onAvatarChange}
            />
            <p style={{ fontSize: '.72rem', color: '#666', textAlign: 'center', marginTop: 8, fontFamily: FF }}>
              写真をタップして選択（任意）
            </p>
          </div>

          <h1
            style={{
              fontSize: '1.35rem',
              fontWeight: 700,
              color: GREEN,
              textAlign: 'center',
              margin: 0,
              fontFamily: FF,
            }}
          >
            MEGURU
          </h1>
          <p style={{ fontSize: '.85rem', color: '#666', textAlign: 'center', margin: '0 0 4px', fontFamily: FF }}>
            プロフィールを設定しましょう
          </p>

          <div style={{ width: '100%' }}>
            <label
              style={{
                display: 'block',
                fontSize: '.8rem',
                fontWeight: 600,
                color: '#444',
                marginBottom: 6,
                fontFamily: FF,
              }}
            >
              名前（必須）
            </label>
            <input
              type="text"
              value={name}
              maxLength={MAX_NAME}
              onChange={(e) => {
                setName(e.target.value)
                setError('')
              }}
              placeholder="例：田中 太郎"
              style={{
                width: '100%',
                boxSizing: 'border-box',
                padding: '12px 14px',
                fontSize: '1rem',
                border: '1px solid #ccc',
                borderRadius: 10,
                outline: 'none',
                fontFamily: FF,
              }}
            />
            <p style={{ fontSize: '.72rem', color: '#888', marginTop: 4, textAlign: 'right', fontFamily: FF }}>
              {name.length}/{MAX_NAME}
            </p>
          </div>

          <div style={{ width: '100%' }}>
            <label
              style={{
                display: 'block',
                fontSize: '.8rem',
                fontWeight: 600,
                color: '#444',
                marginBottom: 6,
                fontFamily: FF,
              }}
            >
              お住まいのエリア（必須）
            </label>
            <div
              style={{
                display: 'inline-block',
                padding: '8px 12px',
                marginBottom: 10,
                fontSize: '.9rem',
                fontWeight: 700,
                color: GREEN,
                background: 'rgba(45,90,39,.1)',
                borderRadius: 8,
                border: '1px solid rgba(45,90,39,.25)',
                fontFamily: FF,
              }}
            >
              {NAGANO_PREF}
            </div>
            <select
              value={municipality}
              onChange={(e) => {
                setMunicipality(e.target.value)
                setError('')
              }}
              style={{
                width: '100%',
                padding: '12px 14px',
                fontSize: '1rem',
                border: '1px solid #ccc',
                borderRadius: 10,
                outline: 'none',
                background: '#fff',
                fontFamily: FF,
              }}
            >
              <option value="">市区町村を選択</option>
              {MUNICIPALITIES.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          {/* 2. 自己紹介（任意）— 名前・エリアの下 */}
          <div style={{ width: '100%' }}>
            <label
              style={{
                display: 'block',
                fontSize: '.8rem',
                fontWeight: 600,
                color: '#444',
                marginBottom: 6,
                fontFamily: FF,
              }}
            >
              自己紹介（任意）
            </label>
            <textarea
              value={bio}
              maxLength={MAX_BIO}
              onChange={(e) => {
                setBio(e.target.value)
                setError('')
              }}
              placeholder="例：駒ヶ根で野菜を育てています。柿や栗が毎年たくさん採れます！"
              style={{
                width: '100%',
                boxSizing: 'border-box',
                minHeight: 80,
                padding: '12px 14px',
                fontSize: '1rem',
                border: '1px solid #ccc',
                borderRadius: 10,
                outline: 'none',
                resize: 'vertical',
                fontFamily: FF,
              }}
            />
            <p style={{ fontSize: '.72rem', color: '#888', marginTop: 4, textAlign: 'right', fontFamily: FF }}>
              残り {bioRemaining} 文字
            </p>
          </div>

          {error && (
            <div
              style={{
                width: '100%',
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
            onClick={() => void handleSubmit()}
            disabled={saving}
            style={{
              width: '100%',
              marginTop: 4,
              padding: '14px',
              fontSize: '1rem',
              fontWeight: 700,
              color: '#fff',
              background: KAKI,
              border: 'none',
              borderRadius: 12,
              cursor: 'pointer',
              fontFamily: FF,
              opacity: saving ? 0.7 : 1,
            }}
          >
            {saving ? '保存中...' : 'はじめる →'}
          </button>
        </div>
      </div>
    </div>
  )
}
