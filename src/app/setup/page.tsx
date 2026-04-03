'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { AREA_DATA } from '@/lib/area-data'

const MUNICIPALITIES = AREA_DATA['長野県'] || []

export default function SetupPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [municipality, setMunicipality] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const check = async () => {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.replace('/login'); return }
      const { data } = await supabase.from('profiles').select('name').eq('id', session.user.id).single()
      if (data?.name && data.name.trim() !== '') { router.replace('/'); return }
    }
    check()
  }, [router])

  const handleSubmit = async () => {
    if (!name.trim()) { setError('名前を入力してください'); return }
    if (!municipality) { setError('お住まいのエリアを選択してください'); return }
    setSaving(true)
    const supabase = createClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { router.replace('/login'); return }
    const { error: err } = await supabase.from('profiles').upsert({
      id: session.user.id,
      name: name.trim(),
      area: '長野県 ' + municipality,
    }, { onConflict: 'id' })
    if (err) { setError('保存に失敗しました'); setSaving(false); return }
    window.location.href = '/'
  }

  return (
    <div style={{ minHeight: '100dvh', background: '#2D5A27', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, fontFamily: "'Noto Sans JP', sans-serif" }}>
      <div style={{ width: '100%', maxWidth: 400, background: '#F8F4EE', borderRadius: 16, padding: '32px 28px', boxShadow: '0 12px 40px rgba(0,0,0,.2)' }}>
        <h1 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#2D5A27', textAlign: 'center', marginBottom: 8 }}>MEGURU</h1>
        <p style={{ fontSize: '.85rem', color: '#666', textAlign: 'center', marginBottom: 24 }}>プロフィールを設定しましょう</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ display: 'block', fontSize: '.8rem', fontWeight: 600, color: '#444', marginBottom: 6 }}>名前（必須）</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="例：田中 太郎" style={{ width: '100%', boxSizing: 'border-box', padding: '12px 14px', fontSize: '1rem', border: '1px solid #ccc', borderRadius: 10, outline: 'none', fontFamily: "'Noto Sans JP', sans-serif" }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '.8rem', fontWeight: 600, color: '#444', marginBottom: 6 }}>お住まいのエリア（必須）</label>
            <select value={municipality} onChange={e => setMunicipality(e.target.value)} style={{ width: '100%', padding: '12px 14px', fontSize: '1rem', border: '1px solid #ccc', borderRadius: 10, outline: 'none', background: '#fff', fontFamily: "'Noto Sans JP', sans-serif" }}>
              <option value="">市区町村を選択</option>
              {MUNICIPALITIES.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
          {error && <div style={{ padding: '10px 12px', fontSize: '.8rem', color: '#b91c1c', background: '#fef2f2', borderRadius: 8, border: '1px solid #fecaca' }}>{error}</div>}
          <button type="button" onClick={handleSubmit} disabled={saving} style={{ marginTop: 8, padding: '14px', fontSize: '1rem', fontWeight: 700, color: '#fff', background: '#C4581A', border: 'none', borderRadius: 12, cursor: 'pointer', fontFamily: "'Noto Sans JP', sans-serif" }}>
            {saving ? '保存中...' : 'はじめる →'}
          </button>
        </div>
      </div>
    </div>
  )
}
