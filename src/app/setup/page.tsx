'use client'

import { type ChangeEvent, useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { AREA_DATA, LS_AREA_KEY, LS_DISTRICTS_KEY } from '@/lib/area-data'

const NAGANO_PREF = '長野県' as const
const NAGANO_MUNICIPALITIES = AREA_DATA[NAGANO_PREF]

const MAX_AVATAR_BYTES = 1_800_000

export default function SetupPage() {
  const router = useRouter()
  const [gateDone, setGateDone] = useState(false)
  const [displayName, setDisplayName] = useState('')
  const [municipality, setMunicipality] = useState('')
  const [avatarDataUrl, setAvatarDataUrl] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    let cancelled = false
    async function gate() {
      const supabase = createClient()
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (!session) {
        router.replace('/login')
        return
      }
      const { data: prof } = await supabase.from('profiles').select('name').eq('id', session.user.id).maybeSingle()
      if (cancelled) return
      const n = prof?.name
      if (n != null && String(n).trim() !== '') {
        router.replace('/')
        return
      }
      setGateDone(true)
    }
    void gate()
    return () => {
      cancelled = true
    }
  }, [router])

  const onAvatarChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !file.type.startsWith('image/')) return
    const reader = new FileReader()
    reader.onload = () => {
      const r = String(reader.result || '')
      if (r.length > MAX_AVATAR_BYTES) {
        setError('画像は小さめのファイルにしてください（約1.5MB以下を推奨）')
        setAvatarDataUrl(null)
        return
      }
      setError('')
      setAvatarDataUrl(r)
    }
    reader.readAsDataURL(file)
    e.target.value = ''
  }, [])

  async function onSubmit() {
    setError('')
    const name = displayName.trim()
    if (!name) {
      setError('お名前を入力してください。')
      return
    }
    if (!municipality) {
      setError('市区町村を選んでください。')
      return
    }

    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      router.replace('/login')
      return
    }

    const area = `${NAGANO_PREF} ${municipality}`
    localStorage.setItem(LS_AREA_KEY, area)
    localStorage.setItem(LS_DISTRICTS_KEY, JSON.stringify([]))

    setSaving(true)
    try {
      const row: { id: string; name: string; area: string; avatar_url?: string | null } = {
        id: user.id,
        name,
        area,
      }
      if (avatarDataUrl) row.avatar_url = avatarDataUrl
      else row.avatar_url = null

      const { error: upErr } = await supabase.from('profiles').upsert(row, { onConflict: 'id' })
      if (upErr) {
        setError(upErr.message || '保存に失敗しました。しばらくしてからお試しください。')
        return
      }
      window.location.href = '/'
    } finally {
      setSaving(false)
    }
  }

  if (!gateDone) {
    return (
      <div className="setup-root setup-root--loading">
        <p className="setup-loading-txt">読み込み中…</p>
      </div>
    )
  }

  return (
    <div className="setup-root">
      <div className="setup-card">
        <h1 className="setup-ttl">はじめにプロフィールを設定</h1>
        <p className="setup-lead">表示名とお住まいの市区町村を登録して、MEGURU を始めましょう。</p>

        <div className="setup-field">
          <label className="setup-lbl" htmlFor="setup-name">
            お名前 <span className="setup-req">必須</span>
          </label>
          <input
            id="setup-name"
            className="setup-inp"
            type="text"
            autoComplete="name"
            placeholder="例：山田 太郎"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
          />
        </div>

        <div className="setup-field">
          <p className="setup-lbl">
            お住まいのエリア <span className="setup-req">必須</span>
          </p>
          <p className="setup-pref-fixed">{NAGANO_PREF}</p>
          <label className="setup-lbl setup-lbl--sub" htmlFor="setup-muni">
            市区町村
          </label>
          <select
            id="setup-muni"
            className="setup-select"
            value={municipality}
            onChange={(e) => {
              setMunicipality(e.target.value)
              setError('')
            }}
          >
            <option value="">選択してください</option>
            {NAGANO_MUNICIPALITIES.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>

        <div className="setup-field">
          <p className="setup-lbl">
            アバター写真 <span className="setup-opt">任意</span>
          </p>
          <div className="setup-avt-row">
            <div className="setup-avt-preview">{avatarDataUrl ? <img src={avatarDataUrl} alt="" /> : <span>🧑</span>}</div>
            <label className="setup-avt-btn">
              写真を選ぶ
              <input type="file" accept="image/*" className="setup-avt-input" onChange={onAvatarChange} />
            </label>
          </div>
        </div>

        {error ? (
          <div className="setup-alert" role="alert">
            {error}
          </div>
        ) : null}

        <button type="button" className="setup-submit" disabled={saving} onClick={() => void onSubmit()}>
          {saving ? '保存中…' : 'はじめる'}
        </button>
      </div>
    </div>
  )
}
