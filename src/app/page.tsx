'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { uploadUserAvatar } from '@/lib/upload-avatar'
import { AREA_DATA, getDistrictsForCity, LS_AREA_KEY, LS_DISTRICTS_KEY } from '@/lib/area-data'
import { NAGANO_MUNICIPALITIES, NAGANO_PREF } from '@/lib/nagano-municipalities'

/* ── DATA ── */
const ITEMS = [
  {id:1,name:'渋柿 約15kg',cat:'fruit',price:'¥500',unit:'/ 箱',emoji:'🍊',bg:'bk',loc:'駒ヶ根市赤穂',badge:'new',seller:'鈴木さん（農家・65歳）',sloc:'駒ヶ根市赤穂 · 取引3回',savt:'👴',desc:'毎年収穫しきれず落ちてしまう渋柿です。今年は豊作で特にたくさんあります。干し柿にすると最高においしいですよ。',mine:false,chatKey:'suzuki'},
  {id:2,name:'規格外きゅうり どっさり',cat:'veg',price:'¥200',unit:'/ 袋',emoji:'🥒',bg:'bg',loc:'駒ヶ根市中沢',badge:'',seller:'山田さん（農家・52歳）',sloc:'駒ヶ根市中沢 · 取引7回',savt:'👩',desc:'形が不揃いですが味は抜群です！朝採れたてをすぐ出品しています。',mine:false,chatKey:'yamada'},
  {id:3,name:'薪 乾燥済み 軽トラ1台分',cat:'wood',price:'¥3,000',unit:'/ 台',emoji:'🪵',bg:'bb',loc:'駒ヶ根市福岡',badge:'',seller:'伊藤さん（林業・58歳）',sloc:'駒ヶ根市福岡 · 取引5回',savt:'👨',desc:'山の整備で出た薪です。1年以上乾燥させてあるので燃えがいいです。',mine:false,chatKey:'ito'},
  {id:4,name:'山栗 採れたて 約2kg',cat:'herb',price:'無料',unit:'引取のみ',emoji:'🌰',bg:'by',loc:'駒ヶ根市東伊那',badge:'free',seller:'小林さん（主婦・45歳）',sloc:'駒ヶ根市東伊那 · 取引2回',savt:'👩',desc:'庭の栗から採れた栗です。豊作でとりきれません。無料でどうぞ！',mine:false,chatKey:'kobayashi'},
  {id:5,name:'ピーマン 規格外まとめて',cat:'veg',price:'¥100',unit:'/ 袋',emoji:'🫑',bg:'bg',loc:'駒ヶ根市北割',badge:'',seller:'中村さん（農家・60歳）',sloc:'駒ヶ根市北割 · 取引4回',savt:'👴',desc:'形が悪いだけで味は全く変わりません。たくさんあるので複数袋でもOK。',mine:false,chatKey:'nakamura'},
  {id:6,name:'竹 伐採済み 好きなだけ',cat:'wood',price:'無料',unit:'',emoji:'🎋',bg:'bb',loc:'駒ヶ根市小町屋',badge:'free',seller:'松田さん（自営業・48歳）',sloc:'駒ヶ根市小町屋 · 取引1回',savt:'👨',desc:'庭の竹を伐採しました。工作や柵など使い道のある方ぜひ。',mine:false,chatKey:'matsuda'},
  {id:7,name:'さつまいも 大量',cat:'veg',price:'¥400',unit:'/ 袋',emoji:'🍠',bg:'bk',loc:'駒ヶ根市飯坂',badge:'new',seller:'高橋さん（農家・70歳）',sloc:'駒ヶ根市飯坂 · 取引9回',savt:'👴',desc:'今年のさつまいもが豊作でした。甘くておいしいですよ。袋いっぱい詰めます。',mine:false,chatKey:'takahashi'},
  {id:8,name:'青じそ 庭に余ってます',cat:'herb',price:'¥100',unit:'/ 束',emoji:'🌿',bg:'bg',loc:'駒ヶ根市赤穂',badge:'',seller:'田中 拓也（あなた）',sloc:'駒ヶ根市赤穂',savt:'🧑',desc:'庭に青じそがたくさん生えています。料理に使ってください。',mine:true,chatKey:''},
]

type ChatMsg = { from: string; text?: string; time?: string; id?: string; createdAt?: string }
type Chat = {
  name: string
  sub: string
  avt: string
  ie: string
  in_: string
  ip: string
  unread: number
  itemId: number
  msgs: ChatMsg[]
  lastAt: number
  supabaseId?: string
  buyerId?: string
  sellerId?: string
  /** Supabase items.id（ITEMS の数値 id とずれるとき一覧からの解決に使う） */
  itemSupabaseId?: string
  /** 欲しいものリクエスト経由チャット */
  requestSupabaseId?: string
}

type MeguruRequest = {
  id: string
  user_id: string
  category: string
  description: string
  area: string
  created_at: string
  hope_price: string | null
  hope_timing: string | null
  posterName?: string
}
type Item = typeof ITEMS[0] & { imgSrc?: string; images?: string[]; sold?: boolean; expiry?: string; supabaseId?: string; userId?: string }

const CHATS: Record<string, Chat> = {
  suzuki:{name:'鈴木さん',sub:'駒ヶ根市赤穂',avt:'👴',ie:'🍊',in_:'渋柿 約15kg',ip:'¥500 / 箱',unread:0,itemId:1,lastAt:Date.now()-3600000,msgs:[{from:'them',text:'はじめまして！渋柿に興味もっていただいてありがとうございます。',time:'10:23'},{from:'me',text:'干し柿を作るので気になりました。どのくらいの量ありますか？',time:'10:31'},{from:'them',text:'今年は豊作で20箱くらいあります！好きなだけどうぞ😊',time:'10:35'},{from:'me',text:'2箱お願いしたいです。今週末に取りに行けますがいかがでしょうか？',time:'10:40'},{from:'ds'},{from:'them',text:'土曜の午前でOKです！駒ヶ根市赤穂〇〇番地です。',time:'10:52'},{from:'me',text:'土曜10時ごろにお伺いします🙏',time:'10:55'}]},
  tanaka:{name:'田中さん',sub:'駒ヶ根市中沢',avt:'👩',ie:'🥒',in_:'規格外きゅうり',ip:'¥200 / 袋',unread:2,itemId:2,lastAt:Date.now()-180000,msgs:[{from:'them',text:'こんにちは！きゅうりをぜひ分けていただけますか？',time:'昨日'},{from:'me',text:'もちろんです！何袋ほど必要ですか？',time:'昨日'},{from:'them',text:'3袋いただけると助かります！',time:'昨日'},{from:'them',text:'土曜日の午前中にお伺いします！',time:'3分前'}]},
  sato:{name:'佐藤さん',sub:'駒ヶ根市飯坂',avt:'👱',ie:'🍊',in_:'渋柿 約15kg',ip:'¥500 / 箱',unread:1,itemId:1,lastAt:Date.now()-1080000,msgs:[{from:'them',text:'はじめまして！渋柿をぜひ分けていただけますか？',time:'18分前'}]},
  yamamoto:{name:'山本さん',sub:'駒ヶ根市福岡',avt:'👨',ie:'🪵',in_:'薪 乾燥済み',ip:'¥3,000 / 台',unread:0,itemId:3,lastAt:Date.now()-86400000,msgs:[{from:'me',text:'薪の取引ありがとうございました！またよろしくお願いします。',time:'昨日'},{from:'them',text:'こちらこそありがとうございました！また余ったら出品しますね。',time:'昨日'}]},
}
const TXHISTORY = [
  {emoji:'🍊',name:'渋柿 15kg（2箱）',meta:'鈴木さん · 駒ヶ根市赤穂',price:'¥1,000',status:'完了',date:'2025/10/12'},
  {emoji:'🪵',name:'薪 軽トラ1台分',meta:'伊藤さん · 駒ヶ根市福岡',price:'¥3,000',status:'完了',date:'2025/10/5'},
  {emoji:'🥒',name:'きゅうり 3袋',meta:'山田さん · 駒ヶ根市中沢',price:'¥600',status:'進行中',date:'本日'},
  {emoji:'🌰',name:'山栗 約2kg',meta:'小林さん · 駒ヶ根市東伊那',price:'無料',status:'完了',date:'2025/9/28'},
]
const CATMAP: Record<string,string> = {
  fruit: '🍎 果物',
  veg: '🥕 野菜',
  rice: '🌾 米・穀物',
  wood: '🪵 薪・木材',
  herb: '🌿 山菜',
  other: '🏺 加工品',
  misc: '📦 なんでも',
  land: '🏡 土地・農地',
}
const EMOJIMAP: Record<string,string> = {
  fruit: '🍎',
  veg: '🥕',
  rice: '🌾',
  wood: '🪵',
  herb: '🌿',
  other: '🏺',
  misc: '📦',
  land: '🏡',
}
const BGMAP: Record<string,string> = {
  fruit: 'bk',
  veg: 'bg',
  rice: 'by',
  wood: 'bb',
  herb: 'bg',
  other: 'by',
  misc: 'by',
  land: 'bb',
}

const POST_CATEGORY_PICKS: { key: string; emoji: string; label: string }[] = [
  { key: 'veg', emoji: '🥕', label: '野菜' },
  { key: 'fruit', emoji: '🍎', label: '果物' },
  { key: 'rice', emoji: '🌾', label: '米・穀物' },
  { key: 'other', emoji: '🏺', label: '加工品' },
  { key: 'wood', emoji: '🪵', label: '薪・木材' },
  { key: 'herb', emoji: '🌿', label: '山菜' },
  { key: 'land', emoji: '🏡', label: '土地・農地' },
  { key: 'misc', emoji: '📦', label: 'なんでも' },
]

/** 欲しいものリクエスト（フォーム・表示ラベル） */
const REQUEST_FORM_CATEGORIES: { value: string; label: string }[] = [
  { value: 'veg', label: '野菜' },
  { value: 'fruit', label: '果物' },
  { value: 'rice', label: '米' },
  { value: 'other', label: '加工品' },
  { value: 'firewood', label: '薪' },
  { value: 'timber', label: '木材' },
  { value: 'herb', label: '山菜' },
  { value: 'land_plot', label: '土地' },
  { value: 'farmland', label: '農地' },
  { value: 'misc', label: 'なんでも' },
]
const REQUEST_CAT_LABELS: Record<string, string> = {
  ...(Object.fromEntries(REQUEST_FORM_CATEGORIES.map((c) => [c.value, c.label])) as Record<string, string>),
  /** 旧データ用 */
  wood: '薪・木材',
  land: '土地・農地',
}
const REQ_AREA_FILTER_ALL = 'all'
const REQ_AREA_FILTER_NAGANO = 'nagano-wide'

const LAND_INFO_MARKER = '\n\n---土地情報---\n'

type LandMeta = {
  landType?: string
  area?: string
  areaUnit?: string
  lendCondition?: string
  purpose?: string
  period?: string
  landStatus?: string
}

function splitDescriptionForLand(raw: string): { main: string; land: LandMeta | null } {
  const idx = raw.indexOf(LAND_INFO_MARKER)
  if (idx < 0) return { main: raw, land: null }
  const main = raw.slice(0, idx).trimEnd()
  const jsonPart = raw.slice(idx + LAND_INFO_MARKER.length).trim()
  try {
    const parsed = JSON.parse(jsonPart) as LandMeta
    if (parsed && typeof parsed === 'object') return { main, land: parsed }
  } catch {
    /* ignore */
  }
  return { main: raw, land: null }
}

function escapeHtmlAttr(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

function applyItemDescriptionToDetail(rawDesc: string, mode: 'pc' | 'mob') {
  const { main, land } = splitDescriptionForLand(rawDesc)
  const descId = mode === 'pc' ? 'pc-det-desc' : 'm-d-desc'
  const descEl = document.getElementById(descId)
  if (descEl) descEl.textContent = main.trim() ? main : '—'
  const wrapId = mode === 'pc' ? 'pc-det-land-wrap' : 'm-det-land-wrap'
  const boxId = mode === 'pc' ? 'pc-det-land-box' : 'm-det-land-box'
  const wrap = document.getElementById(wrapId)
  const box = document.getElementById(boxId)
  if (!wrap || !box) return
  if (!land || !Object.keys(land).some((k) => String((land as Record<string, unknown>)[k] || '').trim())) {
    wrap.style.display = 'none'
    box.innerHTML = ''
    return
  }
  wrap.style.display = ''
  const rows: [string, string][] = []
  if (land.landType) rows.push(['土地の種類', land.landType])
  if (land.area) rows.push(['面積', `${land.area}${land.areaUnit || ''}`])
  if (land.lendCondition) rows.push(['貸出条件', land.lendCondition])
  if (land.purpose) rows.push(['希望する使用目的', land.purpose])
  if (land.period) rows.push(['契約期間', land.period])
  if (land.landStatus) rows.push(['現在の状態', land.landStatus])
  const inner = rows
    .map(
      ([k, v]) =>
        `<div class="land-meta-row"><span class="land-meta-k">${escapeHtmlAttr(k)}</span><span class="land-meta-v">${escapeHtmlAttr(v)}</span></div>`
    )
    .join('')
  box.innerHTML = `<div class="land-info-card"><p class="land-info-title">土地・農地の情報</p>${inner}</div>`
}

const LS_CHAT_READ_PREFIX = 'meguru_chat_read_'
const LS_FAVORITES_KEY = 'favorites'
const LS_CHAT_NOTIF_KEY = 'meguru_chat_notif_on'

function markSupabaseChatRead(supabaseChatId: string) {
  localStorage.setItem(LS_CHAT_READ_PREFIX + supabaseChatId, new Date().toISOString())
}
function getSupabaseChatLastReadMs(supabaseChatId: string): number {
  const raw = localStorage.getItem(LS_CHAT_READ_PREFIX + supabaseChatId)
  return raw ? new Date(raw).getTime() : 0
}

/** 自分が受け取った評価（表示用・Supabase reviews） */
let MY_REVIEW_AVG = 0
let MY_REVIEW_COUNT = 0

function totalUnreadSupabaseChats(): number {
  return getChatListEntries().reduce((sum, [, c]) => sum + (c.unread > 0 ? c.unread : 0), 0)
}

function isChatNotifEnabled(): boolean {
  try {
    const v = localStorage.getItem(LS_CHAT_NOTIF_KEY)
    if (v === null || v === '') return true
    return v === '1' || v === 'true'
  } catch {
    return true
  }
}

function syncSettingsChatNotifCheckboxes() {
  const on = isChatNotifEnabled()
  ;(['pc-settings-chat-notif', 'm-settings-chat-notif'] as const).forEach((id) => {
    const el = document.getElementById(id) as HTMLInputElement | null
    if (el) el.checked = on
  })
  ;(['pc-settings-chat-notif-lbl', 'm-settings-chat-notif-lbl'] as const).forEach((id) => {
    const el = document.getElementById(id)
    if (el) el.textContent = on ? 'オン' : 'オフ'
  })
}

function onSettingsChatNotifUserToggle(checked: boolean) {
  try {
    localStorage.setItem(LS_CHAT_NOTIF_KEY, checked ? '1' : '0')
  } catch {
    /* ignore */
  }
  syncSettingsChatNotifCheckboxes()
  updateSbChatUnreadBadge()
}

function hydrateSettingsScreen() {
  updateAreaDisplay()
  const email = CACHED_USER_EMAIL ?? ''
  ;(['pc-settings-email', 'm-settings-email'] as const).forEach((id) => {
    const el = document.getElementById(id)
    if (el) el.textContent = email || '—'
  })
  syncSettingsChatNotifCheckboxes()
}

function updateSbChatUnreadBadge() {
  const n = totalUnreadSupabaseChats()
  const show = n > 0 && !!CURRENT_USER_ID && isChatNotifEnabled()
  const pc = document.getElementById('pc-sb-chat-unread')
  if (pc) pc.style.display = show ? 'block' : 'none'
  document.querySelectorAll<HTMLElement>('.m-nav-chat-unread-dot').forEach((el) => {
    el.style.display = show ? 'block' : 'none'
  })
  document.querySelectorAll<HTMLElement>('.m-bell-ndot').forEach((el) => {
    el.style.display = show ? 'block' : 'none'
  })
}

/** CHATS 更新後、お知らせ画面を開いていればリストを再描画 */
function refreshNotifListsIfOpen() {
  const pcNotif = document.getElementById('pc-pg-notif')
  if (pcNotif && pcNotif.style.display !== 'none') renderPcNotifs()
  if (document.getElementById('ms-notif')?.classList.contains('active')) renderMobNotifs()
}

/** 該当スレのチャット画面が前面に表示されているか（未読に含めない） */
function isSupabaseChatThreadVisible(chatKey: string): boolean {
  if (curChatId !== chatKey) return false
  const panel = document.getElementById('pc-panel')
  const pcChat = document.getElementById('pc-panel-chat')
  const pcOpen =
    panel &&
    !panel.classList.contains('hidden') &&
    pcChat &&
    pcChat.style.display !== 'none' &&
    pcChat.style.display !== ''
  const mobChat = document.getElementById('ms-chat')
  const mobOpen = mobChat?.classList.contains('active')
  return !!(pcOpen || mobOpen)
}

/** ログイン時は Supabase チャットのみ一覧に出す（デモ用チャットは非表示） */
function getChatListEntries(): [string, Chat][] {
  const all = Object.entries(CHATS)
  if (CURRENT_USER_ID) return all.filter(([k]) => k.startsWith('sb_'))
  return all.filter(([k]) => !k.startsWith('sb_'))
}

function escChatHtml(s: string) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

function escAttrUrl(u: string) {
  return u.replace(/&/g, '&amp;').replace(/"/g, '&quot;')
}

/** profiles.name がメール形式のとき Item.seller をマスク（詳細・チャット等） */
function isEmailLike(s: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.trim())
}

/** チャット相手表示名（profiles.name を優先。空・メール形式はプレースホルダ） */
function chatPartnerNameFromProfile(name: string | null | undefined): string {
  const t = (name || '').trim()
  if (!t || isEmailLike(t)) return '出品者'
  return t
}

/** マイページヘッダー表示用（空・メール形式は出さない） */
function mypageHeaderName(): string {
  const t = (USER.name || '').trim()
  if (!t || isEmailLike(t)) return '名前未設定'
  return t
}

/* ── Category card SVG icons (concrete silhouettes) ── */
const CAT_CARD_ICONS: Record<string, string> = {
  // 柿: 丸い果実＋4弁のヘタ＋軸
  fruit: `<svg class="cat-icon" viewBox="0 0 48 48"><rect x="21" y="2" width="6" height="9" rx="3" fill="#5a3a1a"/><ellipse cx="24" cy="15" rx="5.5" ry="10" fill="#2D5A27"/><ellipse cx="24" cy="15" rx="10" ry="5.5" fill="#2D5A27"/><ellipse cx="24" cy="32" rx="16" ry="15" fill="#C4581A"/><ellipse cx="19" cy="26" rx="4.5" ry="3.5" fill="#e07838" opacity="0.4"/></svg>`,
  // ニンジン: オレンジの根＋緑の葉
  veg: `<svg class="cat-icon" viewBox="0 0 48 48"><path d="M17 18 Q24 14 31 18 Q30 34 24 46 Q18 34 17 18z" fill="#C4581A"/><path d="M19 26 Q24 24 29 26" stroke="#e07838" stroke-width="1.8" fill="none" stroke-linecap="round"/><path d="M20 32 Q24 30 28 32" stroke="#e07838" stroke-width="1.8" fill="none" stroke-linecap="round"/><path d="M21 38 Q24 36 27 38" stroke="#e07838" stroke-width="1.8" fill="none" stroke-linecap="round"/><path d="M24 18 Q21 9 18 5 Q22 10 24 18" fill="#2D5A27"/><path d="M24 18 Q27 9 30 5 Q26 10 24 18" fill="#2D5A27"/><path d="M24 18 Q17 11 13 8 Q17 12 24 18" fill="#2D5A27"/><path d="M24 18 Q31 11 35 8 Q31 12 24 18" fill="#2D5A27"/></svg>`,
  // 積み薪: 木口断面3本を三角に積んだシルエット
  wood: `<svg class="cat-icon" viewBox="0 0 48 48"><circle cx="13" cy="35" r="12" fill="#9a6840"/><circle cx="13" cy="35" r="12" fill="none" stroke="#5a3a1a" stroke-width="2.5"/><circle cx="13" cy="35" r="7" fill="none" stroke="#7A5230" stroke-width="1.5"/><circle cx="13" cy="35" r="2" fill="#7A5230"/><circle cx="35" cy="35" r="12" fill="#9a6840"/><circle cx="35" cy="35" r="12" fill="none" stroke="#5a3a1a" stroke-width="2.5"/><circle cx="35" cy="35" r="7" fill="none" stroke="#7A5230" stroke-width="1.5"/><circle cx="35" cy="35" r="2" fill="#7A5230"/><circle cx="24" cy="18" r="12" fill="#a07040"/><circle cx="24" cy="18" r="12" fill="none" stroke="#5a3a1a" stroke-width="2.5"/><circle cx="24" cy="18" r="7" fill="none" stroke="#7A5230" stroke-width="1.5"/><circle cx="24" cy="18" r="2" fill="#7A5230"/></svg>`,
  // 山野草: 葉っぱ3枚のシルエット（左・右・中央）＋茎
  herb: `<svg class="cat-icon" viewBox="0 0 48 48"><path d="M24 46 L24 32" stroke="#2D5A27" stroke-width="4" stroke-linecap="round" fill="none"/><path d="M24 34 Q14 31 8 20 Q10 10 18 16 Q22 24 24 34z" fill="#2D5A27"/><path d="M24 34 Q34 31 40 20 Q38 10 30 16 Q26 24 24 34z" fill="#2D5A27"/><path d="M24 26 Q19 13 24 4 Q29 13 24 26z" fill="#3d7a34"/></svg>`,
  // 保存瓶: 緑の蓋＋首＋ガラス胴体
  other: `<svg class="cat-icon" viewBox="0 0 48 48"><rect x="14" y="3" width="20" height="7" rx="3.5" fill="#2D5A27"/><rect x="16" y="9" width="16" height="6" rx="2" fill="#6a8a6a"/><rect x="10" y="14" width="28" height="30" rx="5" fill="#8aaa8a"/><rect x="12" y="41" width="24" height="4" rx="2" fill="#6a8a6a"/><rect x="14" y="18" width="5" height="20" rx="2.5" fill="white" opacity="0.22"/></svg>`,
  rice: `<svg class="cat-icon" viewBox="0 0 48 48"><ellipse cx="24" cy="28" rx="14" ry="10" fill="#C4581A" opacity="0.35"/><path d="M24 8 Q18 18 14 28 Q20 32 24 38 Q28 32 34 28 Q30 18 24 8z" fill="#2D5A27"/><path d="M24 14 L24 34 M18 20 Q24 22 30 20 M17 26 Q24 28 31 26" stroke="#F8F4EE" stroke-width="1.2" fill="none" opacity="0.5"/></svg>`,
  misc: `<svg class="cat-icon" viewBox="0 0 48 48"><path d="M6 18 L24 8 L42 18 L42 40 Q42 44 38 44 L10 44 Q6 44 6 40z" fill="#8a8478"/><path d="M6 18 L24 28 L42 18" stroke="#6a6468" stroke-width="2" fill="none"/><line x1="24" y1="28" x2="24" y2="44" stroke="#6a6468" stroke-width="2"/></svg>`,
  land: `<svg class="cat-icon" viewBox="0 0 48 48"><path d="M4 38 L16 22 L24 28 L32 18 L44 32 L44 40 L4 40 Z" fill="#3d7a34"/><path d="M4 38 L44 38" stroke="#2D5A27" stroke-width="2" fill="none"/><rect x="18" y="14" width="12" height="10" rx="1" fill="#C4581A" opacity="0.85"/><path d="M21 14 L21 10 L24 7 L27 10 L27 14" fill="#2D5A27"/></svg>`,
}
/** メッセージ以外の固定お知らせ（チャットとは別・タップでチャットは開かない） */
const STATIC_NOTIF_DEFS: { id: string; icon: string; cls: string; title: string; sub: string; timeLabel: string }[] = [
  { id: 'static:views', icon: '🍊', cls: 'ni-k', title: 'あなたの出品が注目されています', sub: '出品の閲覧やお問い合わせはチャット一覧からご確認ください。', timeLabel: '—' },
  { id: 'static:welcome', icon: '📣', cls: 'ni-s', title: 'MEGURUへようこそ！', sub: '農村の余りものを地域でつなぐプラットフォームです。', timeLabel: '—' },
]

type AppNotifRow = {
  nid: string
  icon: string
  cls: string
  title: string
  sub: string
  time: string
  unread: boolean
  chatKey: string | null
}

function formatRelativeJa(ms: number): string {
  const sec = Math.max(0, Math.floor((Date.now() - ms) / 1000))
  if (sec < 10) return 'たった今'
  if (sec < 60) return '1分以内'
  const min = Math.floor(sec / 60)
  if (min < 60) return `${min}分前`
  const h = Math.floor(min / 60)
  if (h < 24) return `${h}時間前`
  const d = Math.floor(h / 24)
  if (d < 7) return `${d}日前`
  try {
    return new Date(ms).toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' })
  } catch {
    return ''
  }
}

function notifPeerDisplayName(chat: Chat): string {
  let n = chat.name.replace(/（[^）]*）/g, '').trim()
  if (!n || isEmailLike(n)) n = '相手'
  if (n.endsWith('さん')) return n
  return `${n}さん`
}

function lastChatSnippet(chat: Chat): { preview: string; lastFromThem: boolean } {
  const withText = chat.msgs.filter((m) => m.text && m.text.trim() && m.from !== 'ds' && m.from !== 'system')
  const last = withText[withText.length - 1]
  if (!last?.text) return { preview: 'メッセージがあります', lastFromThem: false }
  const t = last.text.trim()
  const preview = t.length > 56 ? `${t.slice(0, 54)}…` : t
  return { preview, lastFromThem: last.from === 'them' }
}

/** Supabase チャット（messages と同一ソース）からメッセージ系お知らせを生成 */
function buildMessageNotifRows(): AppNotifRow[] {
  const entries = getChatListEntries()
    .filter(([, c]) => c.msgs.some((m) => m.text?.trim() && m.from !== 'ds' && m.from !== 'system'))
    .sort(([, a], [, b]) => b.lastAt - a.lastAt)
  return entries.map(([key, c]) => {
    const peer = notifPeerDisplayName(c)
    const { preview, lastFromThem } = lastChatSnippet(c)
    const title = lastFromThem ? `${peer}からメッセージが届きました` : `${peer}とのチャット`
    return {
      nid: key,
      icon: '💬',
      cls: 'ni-c',
      title,
      sub: `「${preview}」`,
      time: formatRelativeJa(c.lastAt),
      unread: c.unread > 0,
      chatKey: key,
    }
  })
}

function buildStaticNotifRows(): AppNotifRow[] {
  return STATIC_NOTIF_DEFS.map((d) => ({
    nid: d.id,
    icon: d.icon,
    cls: d.cls,
    title: d.title,
    sub: d.sub,
    time: d.timeLabel,
    unread: false,
    chatKey: null,
  }))
}

function getMergedNotifs(): AppNotifRow[] {
  return [...buildMessageNotifRows(), ...buildStaticNotifRows()]
}

/* ── GLOBAL USER STATE ── */
const USER = {
  name: '田中 拓也',
  area: '',
  bio: 'よろしくお願いします。',
  avt: '',
  categories: [] as string[],
  availableTimes: [] as string[],
  tagline: '',
}

const PROF_NAME_MAX = 20
/** 自己紹介の最大文字数 */
const PROF_BIO_MAX = 500
/** 一言メッセージの最大文字数 */
const PROF_TAGLINE_MAX = 30

/*
 * Supabase public.profiles 拡張（未適用の場合は SQL エディタで実行）
 * -- alter table public.profiles add column categories text[] default '{}';
 * -- alter table public.profiles add column available_times text[] default '{}';
 * -- alter table public.profiles add column tagline text default '';
 */
const PROFILE_CATEGORY_OPTIONS = ['野菜', '果物', '米', '加工品', '薪', '木材', '山菜', 'その他'] as const
const PROFILE_HANDOFF_TIME_OPTIONS = ['平日午前', '平日午後', '平日夜', '土日午前', '土日午後', '土日夜', '応相談'] as const

let pendingAvatarFile: File | null = null
let pendingAvatarObjectUrl: string | null = null

function revokePendingAvatarPreview() {
  if (pendingAvatarObjectUrl) {
    URL.revokeObjectURL(pendingAvatarObjectUrl)
    pendingAvatarObjectUrl = null
  }
  pendingAvatarFile = null
}

function profileInitialChar(name: string): string {
  const t = name.trim()
  if (!t) return '?'
  const cp = t.codePointAt(0)
  return cp === undefined ? '?' : String.fromCodePoint(cp)
}

/** USER.area から市区町村部分のみ（長野県想定） */
function municipalityFromArea(area: string): string {
  const a = (area || '').trim()
  if (!a.startsWith(NAGANO_PREF)) return ''
  return a.slice(NAGANO_PREF.length).trim()
}

function applyAvatarFileToPreviews(file: File) {
  if (!file.type.startsWith('image/')) return
  revokePendingAvatarPreview()
  pendingAvatarFile = file
  pendingAvatarObjectUrl = URL.createObjectURL(file)
  const safe = escAttrUrl(pendingAvatarObjectUrl)
  const avHtml = `<img src="${safe}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;" />`
  ;(['pc-avt-display', 'm-avt-display'] as const).forEach((id) => {
    const el = document.getElementById(id) as HTMLElement | null
    if (el) {
      el.style.fontSize = '0'
      el.innerHTML = avHtml
    }
  })
}

/* ── MODULE-LEVEL STATE ── */
let curItem: Item = ITEMS[0]
let curDetailImgIdx = 0
let curChatId = 'suzuki'
const favIdSet = new Set<string>()
let pcFreeTog = false, mobFreeTog = false, pcPostCat = 'veg', mobPostCat = 'veg'
let pcSortMode = 'new', pcCatFilter = 'all'
let mobSortMode = 'new', mobCatFilter = 'all'
let pcImages: string[] = [], mobImages: string[] = []
let pcCondition = '', mobCondition = '', pcPesticide = '', mobPesticide = ''
let pcWoodDry = '', mobWoodDry = '', pcWoodTree = '', mobWoodTree = ''
let CURRENT_USER_ID: string | null = null
let CACHED_USER_EMAIL: string | null = null
let pcDragIdx = -1, mobDragIdx = -1
let mStk: string[] = ['ms-home']
let mSearchCatKey = 'all'
let meguruRequestsCache: MeguruRequest[] = []
let reqListCatFilter = 'all'
let reqListAreaFilter = 'all'
let areaFilterMode: 'local' | 'all' = 'local'
/** ホーム一覧：出品中 / 渡し済み（全ユーザーの出品を ITEMS から絞る。mine では絞らない） */
let homeSoldFilter: 'listing' | 'delivered' = 'listing'
let selectedPref = ''
let selectedCity = ''
let activeDistricts: string[] = []
let filterMessage = ''
let PROFILE_VIEW_USER_ID: string | null = null

/* ── TOAST ── */
let _tt: ReturnType<typeof setTimeout>
function showToast(msg: string) {
  const e = document.getElementById('toast')
  if (!e) return
  e.textContent = msg; e.classList.add('on')
  clearTimeout(_tt); _tt = setTimeout(() => e.classList.remove('on'), 2200)
}

/* ── PC NAV ── */
const PC_PAGES = ['listing','requests','post','complete','notif','mypage','chatlist','mylistings','txhistory','profedit','settings','about','detail','userprofile']
const PC_PAGES_NEED_AUTH = ['post','complete','notif','mypage','chatlist','mylistings','txhistory','profedit','settings','about','userprofile']
function pcGo(page: string) {
  if (PC_PAGES_NEED_AUTH.includes(page) && !CURRENT_USER_ID) {
    window.location.href = '/login'
    return
  }
  PC_PAGES.forEach(p => { const el = document.getElementById('pc-pg-'+p); if (el) el.style.display='none' })
  const el = document.getElementById('pc-pg-'+page); if (el) el.style.display=''
  if (!['listing','chatlist','mylistings','requests'].includes(page)) document.getElementById('pc-panel')?.classList.add('hidden')
  document.querySelectorAll('.pc-nav-tab').forEach(t => t.classList.remove('on'))
  if (page !== 'userprofile') {
    const tabId = page === 'complete' ? 'pct-post' : 'pct-' + page
    const tab = document.getElementById(tabId)
    if (tab) tab.classList.add('on')
  }
  document.querySelectorAll('.sb-item').forEach(t => t.classList.remove('on'))
  if (page === 'listing') {
    const PC_CAT_SB: Record<string, string> = {
      all: 'sb-all',
      fruit: 'sb-fruit',
      veg: 'sb-veg',
      rice: 'sb-rice',
      wood: 'sb-wood',
      herb: 'sb-herb',
      other: 'sb-other',
      land: 'sb-land',
      misc: 'sb-misc',
    }
    const sid = PC_CAT_SB[pcCatFilter]
    ;(sid ? document.getElementById(sid) : document.getElementById('sb-all'))?.classList.add('on')
  }
  if (page==='notif') renderPcNotifs()
  if (page==='mypage') { updateMypage('pc'); (document.getElementById('pc-pg-mypage') as HTMLElement).style.display='' }
  if (page==='chatlist') renderChatList('pc')
  if (page === 'requests') {
    initRequestLocSelects()
    syncRequestFilterSelects()
    void loadRequestsFromSupabase()
  }
  if (page==='txhistory') renderTxHistory('pc')
  if (page === 'settings') hydrateSettingsScreen()
  if (page === 'post') showPostCategoryStep('pc')
  const main = document.getElementById('pc-main'); if (main) main.scrollTop=0
}
function pcSubPage(p: string) {
  pcGo(p)
  if (p === 'mylistings') renderMyListings('pc', '出品中のもの', ITEMS.filter((i) => i.mine))
  if (p === 'profedit') updateAllUserRefs()
}

/* ── SORT & FILTER ── */
/* ── AREA ── */
function getUserCity(): string {
  const matches = USER.area.match(/[^\s]+[市町村区]/g)
  return matches ? matches[matches.length - 1] : USER.area
}

function initAreaFromStorage() {
  const saved = localStorage.getItem(LS_AREA_KEY)
  if (saved) {
    USER.area = saved
    try {
      const savedDist = localStorage.getItem(LS_DISTRICTS_KEY)
      if (savedDist) activeDistricts = JSON.parse(savedDist)
    } catch {}
    return true
  }
  return false
}

/** プロフィール／LS に長野県内の市区町村が入っているか（未設定時はバナーに「長野県」・一覧は全件） */
function userHasProfileArea(): boolean {
  const a = (USER.area || '').trim()
  if (!a) return false
  return NAGANO_MUNICIPALITIES.some((m) => a.includes(m))
}

function updateAreaDisplay() {
  let label: string
  if (!userHasProfileArea()) {
    label = NAGANO_PREF
  } else {
    const city = getUserCity() || USER.area
    const distLabel = activeDistricts.length > 0 ? `（${activeDistricts.join('・')}）` : ''
    label = city + distLabel
  }
  ;(['pc-area-display', 'm-area-display', 'pc-settings-area-val', 'm-settings-area-val'] as const).forEach((id) => {
    const el = document.getElementById(id)
    if (el) el.textContent = label
  })
}

/** エリアモーダル：南信を先頭にしつつ長野県全市区町村（77）を列挙 */
function naganoCitiesForAreaModal(): string[] {
  const priority = [
    '伊那市', '駒ヶ根市', '飯田市', '松本市', '長野市', '上田市',
    '飯島町', '中川村', '宮田村', '箕輪町', '辰野町', '南箕輪村',
    '松川町', '高森町', '阿南町', '岡谷市', '諏訪市', '茅野市', '塩尻市', '小諸市',
    '阿智村', '平谷村', '根羽村', '下條村', '売木村', '天龍村', '泰阜村', '喬木村', '豊丘村', '大鹿村',
  ]
  const set = new Set(NAGANO_MUNICIPALITIES)
  const head = priority.filter((x) => set.has(x))
  const rest = NAGANO_MUNICIPALITIES.filter((x) => !head.includes(x)).sort((a, b) => a.localeCompare(b, 'ja'))
  return [...head, ...rest]
}

function _areaDistHtml(city: string) {
  const districts = getDistrictsForCity(city)
  const wrap = document.getElementById('area-dist-wrap')
  const list = document.getElementById('area-dist-list')
  if (!wrap) return
  if (districts.length === 0) {
    wrap.style.display = 'none'
    if (list) list.innerHTML = ''
    return
  }
  wrap.style.display = 'block'
  if (!list) return
  list.innerHTML = districts.map(d => {
    const esc = d.replace(/'/g, "\\'")
    const on = activeDistricts.includes(d) ? ' on' : ''
    return `<button type="button" class="area-chip${on}" onclick="window.toggleAreaDistrict('${esc}')">${d}</button>`
  }).join('')
}

function _areaCityHtml(pref: string, current?: string) {
  const grid = document.getElementById('area-city-cards')
  if (!grid) return
  const cityList =
    pref === NAGANO_PREF ? naganoCitiesForAreaModal() : pref && AREA_DATA[pref] ? AREA_DATA[pref] : null
  if (!pref || !cityList?.length) {
    grid.innerHTML = '<p class="area-cards-hint">市区町村を選べません</p>'
    grid.classList.add('area-cards-muted')
    const dw = document.getElementById('area-dist-wrap'); if (dw) dw.style.display = 'none'
    return
  }
  grid.classList.remove('area-cards-muted')
  grid.innerHTML = cityList.map(c => {
    const esc = c.replace(/'/g, "\\'")
    return `<button type="button" class="area-card-btn area-card-btn-city${c === (current ?? '') ? ' on' : ''}" onclick="window.onSelectAreaCity('${esc}')">${c}</button>`
  }).join('')
}

function showAreaModal() {
  selectedPref = NAGANO_PREF
  const currentCity = userHasProfileArea() ? getUserCity() : ''
  selectedCity = currentCity
  _areaCityHtml(NAGANO_PREF, currentCity)
  _areaDistHtml(currentCity)
  document.getElementById('area-modal-overlay')?.classList.remove('hidden')
}

function closeAreaModal() {
  document.getElementById('area-modal-overlay')?.classList.add('hidden')
}

function onSelectAreaPref(_pref: string) {
  selectedPref = NAGANO_PREF
  selectedCity = ''
  activeDistricts = []
  _areaCityHtml(NAGANO_PREF, '')
  _areaDistHtml('')
}

function onSelectAreaCity(city: string) {
  selectedPref = NAGANO_PREF
  selectedCity = city
  activeDistricts = []
  _areaCityHtml(NAGANO_PREF, city)
  _areaDistHtml(city)
}

function toggleAreaDistrict(d: string) {
  if (activeDistricts.includes(d)) activeDistricts = activeDistricts.filter(x => x !== d)
  else activeDistricts.push(d)
  _areaDistHtml(selectedCity)
}

async function selectAreaApply() {
  const pref = NAGANO_PREF
  const city = selectedCity
  if (!city) { showToast('市区町村を選択してください'); return }
  const area = `${pref} ${city}`
  USER.area = area; selectedPref = pref; selectedCity = city
  localStorage.setItem(LS_AREA_KEY, area)
  localStorage.setItem(LS_DISTRICTS_KEY, JSON.stringify(activeDistricts))
  if (CURRENT_USER_ID) {
    createClient().from('profiles').update({ area }).eq('id', CURRENT_USER_ID)
      .then(({ error }) => { if (error) console.warn('[meguru] profiles area update:', error.message) })
  }
  updateAreaDisplay(); applyPcFilter(); applyMobFilter(); closeAreaModal()
  const distLabel = activeDistricts.length > 0 ? `（${activeDistricts.join('・')}）` : ''
  showToast(`「${city}${distLabel}」で絞り込みました`)
}

// 後方互換性のため残す
function selectAreaPref(pref: string) { onSelectAreaPref(pref) }
async function selectAreaCity(city: string) {
  const area = `${NAGANO_PREF} ${city}`
  selectedPref = NAGANO_PREF
  USER.area = area; activeDistricts = []; selectedCity = city
  localStorage.setItem(LS_AREA_KEY, area)
  localStorage.setItem(LS_DISTRICTS_KEY, '[]')
  if (CURRENT_USER_ID) {
    createClient().from('profiles').update({ area }).eq('id', CURRENT_USER_ID)
      .then(({ error }) => { if (error) console.warn('[meguru] profiles area update:', error.message) })
  }
  updateAreaDisplay(); applyPcFilter(); applyMobFilter(); closeAreaModal()
  showToast(`エリアを「${city}」に設定しました`)
}

function toggleAreaFilter(mode: 'local' | 'all') {
  areaFilterMode = mode
  ;(['pc','m'] as const).forEach(pre => {
    document.getElementById(`${pre}-area-tog-local`)?.classList.toggle('on', mode === 'local')
    document.getElementById(`${pre}-area-tog-all`)?.classList.toggle('on', mode === 'all')
  })
  applyPcFilter()
  applyMobFilter()
}

function toggleHomeSoldFilter(mode: 'listing' | 'delivered') {
  homeSoldFilter = mode
  ;(['pc', 'm'] as const).forEach((pre) => {
    document.getElementById(`${pre}-sold-tog-listing`)?.classList.toggle('on', mode === 'listing')
    document.getElementById(`${pre}-sold-tog-delivered`)?.classList.toggle('on', mode === 'delivered')
  })
  applyPcFilter()
  applyMobFilter()
}

/** 販売状況のみで絞る（出品者 mine ・ user_id では絞らない。エリアは applyAreaFilter 側） */
function applySoldStatusFilter(items: Item[]): Item[] {
  if (homeSoldFilter === 'listing') return items.filter((i) => !i.sold)
  return items.filter((i) => Boolean(i.sold))
}

function pipelineHomePc(): Item[] {
  const catFiltered = pcCatFilter === 'all' ? ITEMS : ITEMS.filter((i) => i.cat === pcCatFilter)
  return applyAreaFilter(applySoldStatusFilter(catFiltered))
}

function pipelineHomeMob(): Item[] {
  const catFiltered = mobCatFilter === 'all' ? ITEMS : ITEMS.filter((i) => i.cat === mobCatFilter)
  return applyAreaFilter(applySoldStatusFilter(catFiltered))
}

function parseItemPrice(it: Item): number {
  if (it.price === '無料') return 0
  return Number(it.price.replace(/[¥,]/g, '')) || 0
}
function applySortFilter(items: Item[], sortMode: string): Item[] {
  let list = [...items]
  if (sortMode === 'free')      list = list.filter(i => i.price === '無料')
  else if (sortMode === 'cheap')     list.sort((a,b) => parseItemPrice(a) - parseItemPrice(b))
  else if (sortMode === 'expensive') list.sort((a,b) => parseItemPrice(b) - parseItemPrice(a))
  else if (sortMode === 'soon')      list.sort((a,b) => a.id - b.id)
  // 'new': keep ITEMS order (newest first via unshift)
  return list
}
function itemIsInNagano(it: Item): boolean {
  if (it.loc.includes(NAGANO_PREF)) return true
  return NAGANO_MUNICIPALITIES.some((m) => it.loc.includes(m))
}

function applyAreaFilter(items: Item[]): Item[] {
  filterMessage = ''
  const naganoOnly = items.filter(itemIsInNagano)

  if (areaFilterMode === 'all') {
    if (naganoOnly.length === 0) {
      filterMessage = '長野県内の出品が見つかりません。すべて表示しています。'
      return items
    }
    return naganoOnly
  }

  if (!userHasProfileArea()) {
    return items
  }

  const city = getUserCity()
  if (!city) return items
  let cityFiltered = items.filter((i) => i.loc.includes(city))

  if (activeDistricts.length > 0) {
    const distFiltered = cityFiltered.filter((i) => activeDistricts.some((d) => i.loc.includes(d)))
    if (distFiltered.length > 0) return distFiltered
    filterMessage = `${activeDistricts.join('・')}には出品がありません。${city}全体を表示しています。`
    return cityFiltered
  }

  if (cityFiltered.length === 0) {
    if (naganoOnly.length > 0) {
      filterMessage = `${city}には出品がありません。長野県内の出品を表示しています。`
      return naganoOnly
    }
    filterMessage = `${city}には出品がありません。すべて表示しています。`
    return items
  }
  return cityFiltered
}

function _showFilterMsg(gridId: string) {
  const msgId =
    gridId === 'pc-grid' ? 'pc-filter-msg' : gridId === 'm-search-grid' ? 'm-search-filter-msg' : 'm-filter-msg'
  const el = document.getElementById(msgId)
  if (!el) return
  if (filterMessage) {
    el.textContent = filterMessage
    el.style.display = 'block'
  } else {
    el.style.display = 'none'
  }
}

function applyPcFilter() {
  const base = pipelineHomePc()
  renderGrid(applySortFilter(base, pcSortMode), 'pc-grid', 'pc')
  _showFilterMsg('pc-grid')
}
function applyMobFilter() {
  const base = pipelineHomeMob()
  renderGrid(applySortFilter(base, mobSortMode), 'm-home-grid', 'mob')
  _showFilterMsg('m-home-grid')
  mDoSearch()
}
function pcSort(val: string) { pcSortMode = val; applyPcFilter() }
function mobSort(val: string) { mobSortMode = val; applyMobFilter() }

function pcSbCat(btn: HTMLElement, cat: string) {
  document.querySelectorAll('.sb-item').forEach(b => b.classList.remove('on')); btn.classList.add('on')
  pcCatFilter = cat
  applyPcFilter()
  pcGo('listing')
}
function pcSearch() {
  const inp = document.getElementById('pc-search-inp') as HTMLInputElement
  const kw = inp.value.toLowerCase().trim()
  let base = pipelineHomePc()
  if (kw) base = base.filter((i) => i.name.toLowerCase().includes(kw) || i.loc.toLowerCase().includes(kw))
  renderGrid(applySortFilter(base, pcSortMode), 'pc-grid', 'pc')
  _showFilterMsg('pc-grid')
}

/* ── CHIP SVG ICONS (same paths as sidebar) ── */
const CHIP_SVG_PATHS: Record<string,string> = {
  all:   '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
  fruit: '<circle cx="12" cy="14" r="7"/><path d="M12 7V4"/><path d="M9.5 4.5C10.5 3 13.5 3 14.5 4.5"/>',
  veg:   '<path d="M8 9 Q12 7 16 9 Q15 17 12 23 Q9 17 8 9z"/><path d="M9 13 Q12 12 15 13"/><path d="M10 17 Q12 16 14 17"/><path d="M12 9 Q11 4 9 2 Q11 5 12 9"/><path d="M12 9 Q13 4 15 2 Q13 5 12 9"/><path d="M12 9 Q8 5 7 3 Q9 6 12 9"/><path d="M12 9 Q16 5 17 3 Q15 6 12 9"/>',
  wood:  '<circle cx="7" cy="16" r="5.5"/><circle cx="7" cy="16" r="3"/><circle cx="17" cy="16" r="5.5"/><circle cx="17" cy="16" r="3"/><circle cx="12" cy="8" r="5.5"/><circle cx="12" cy="8" r="3"/>',
  herb:  '<line x1="12" y1="22" x2="12" y2="14"/><path d="M12 16 Q6 14 4 9 Q6 5 10 8 Q11 12 12 16z"/><path d="M12 16 Q18 14 20 9 Q18 5 14 8 Q13 12 12 16z"/><path d="M12 12 Q10 6 12 2 Q14 6 12 12z"/>',
  other: '<rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/><line x1="12" y1="12" x2="12" y2="17"/><line x1="9.5" y1="14.5" x2="14.5" y2="14.5"/>',
  rice: '<path d="M12 22 Q12 8 18 4 Q20 12 18 22 Q15 18 12 22z" fill="#2D5A27"/><path d="M12 22 Q12 8 6 4 Q4 12 6 22 Q9 18 12 22z" fill="#3d7a34"/><ellipse cx="12" cy="20" rx="3" ry="2" fill="#C4581A" opacity="0.4"/>',
  misc:  '<path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/>',
  land: '<path d="M3 21 L9 12 L14 16 L21 8 L21 21 Z" fill="#2D5A27"/><rect x="10" y="10" width="6" height="5" rx="0.5" fill="#C4581A"/><path d="M3 21 L21 21" stroke="#7A5230" stroke-width="1.2" fill="none"/>',
}
function chipSvg(cat: string): string {
  const p = CHIP_SVG_PATHS[cat] ?? CHIP_SVG_PATHS.misc
  return `<svg class="chip-icon" viewBox="0 0 24 24">${p}</svg>`
}

/* ── PC CATS ── */
function initPcCats() {
  const fcats = [{v:'veg',l:'野菜'},{v:'fruit',l:'果物'},{v:'rice',l:'米'},{v:'other',l:'加工品'},{v:'misc',l:'その他'}]
  const pcFormCats = document.getElementById('pc-form-cats')
  if (pcFormCats) pcFormCats.innerHTML = fcats.map(c=>`<button class="fchip${c.v==='veg'?' on':''}" data-v="${c.v}" onclick="selCat(this,'pc')">${chipSvg(c.v)}${c.l}</button>`).join('')
}

/* ── MOBILE NAV ── */
const MOB_SCENES_NEED_AUTH = new Set(['ms-post','ms-complete','ms-mypage','ms-chatlist','ms-mylistings','ms-txhistory','ms-profedit','ms-settings','ms-about','ms-notif'])
function mNav(id: string) {
  if (MOB_SCENES_NEED_AUTH.has(id) && !CURRENT_USER_ID) {
    window.location.href = '/login'
    return
  }
  const cur = document.querySelector('#mob-root .scn.active')
  if (cur) cur.classList.remove('active')
  mStk.push(id)
  const next = document.getElementById(id)
  if (!next) return
  next.classList.remove('back'); next.classList.add('active')
  if (id==='ms-chatlist') renderChatList('mob')
  if (id === 'ms-requests') {
    document.querySelectorAll('#mob-root .m-nt').forEach((b) => b.classList.remove('on'))
    document.querySelectorAll('[data-t="ms-requests"]').forEach((b) => b.classList.add('on'))
    initRequestLocSelects()
    syncRequestFilterSelects()
    void loadRequestsFromSupabase()
  }
  if (id === 'ms-search') {
    document.querySelectorAll('#mob-root .m-nt').forEach((b) => b.classList.remove('on'))
    document.querySelectorAll('[data-t="ms-search"]').forEach((b) => b.classList.add('on'))
    initMobCats()
    const sortSel = document.getElementById('m-search-sort-sel') as HTMLSelectElement | null
    if (sortSel) sortSel.value = mobSortMode
    setTimeout(() => (document.getElementById('m-search-inp') as HTMLInputElement)?.focus(), 280)
    mDoSearch()
  }
  if (id==='ms-notif') renderMobNotifs()
  if (id === 'ms-post') showPostCategoryStep('mob')
  if (id==='ms-mypage') updateMypage('mob')
  if (id==='ms-txhistory') renderTxHistory('mob')
  if (id === 'ms-profedit') updateAllUserRefs()
  if (id === 'ms-settings') hydrateSettingsScreen()
}
function mBack() {
  if (mStk.length<=1) return
  const cur = document.querySelector('#mob-root .scn.active')
  if (cur) cur.classList.remove('active')
  mStk.pop()
  const prev = document.getElementById(mStk[mStk.length-1])
  if (!prev) return
  prev.classList.add('back'); prev.classList.add('active')
  setTimeout(()=>prev.classList.remove('back'),220)
}
function mTab(btn: HTMLElement) {
  const id = btn.dataset.t
  if (!id) return
  document.querySelectorAll('#mob-root .m-nt').forEach(b=>b.classList.remove('on'))
  document.querySelectorAll(`[data-t="${id}"]`).forEach(b=>b.classList.add('on'))
  document.querySelector('#mob-root .scn.active')?.classList.remove('active')
  mStk=[id]; mNav(id)
}

/* ── MOB CATS ── */
function initMobCats() {
  const cats = [
    { k: 'all', l: 'すべて' },
    { k: 'fruit', l: '果物' },
    { k: 'veg', l: '野菜' },
    { k: 'rice', l: '米・穀物' },
    { k: 'wood', l: '薪・木材' },
    { k: 'herb', l: '山菜' },
    { k: 'other', l: '加工品' },
    { k: 'land', l: '土地・農地' },
    { k: 'misc', l: 'なんでも' },
  ]
  if (!cats.some((c) => c.k === mobCatFilter)) mobCatFilter = 'all'
  const homeCats = document.getElementById('m-home-cats')
  if (homeCats) {
    homeCats.innerHTML = cats.map(c=>`<div class="m-chip${c.k===mobCatFilter?' on':''}" onclick="mHomeCat(this,'${c.k}','${c.l}')">${chipSvg(c.k)}${c.l}</div>`).join('')
  }
  const searchCats = document.getElementById('m-search-cats')
  if (searchCats) searchCats.innerHTML = cats.map(c=>`<div class="m-chip${c.k===mSearchCatKey?' on':''}" onclick="mSearchCat(this,'${c.k}')">${chipSvg(c.k)}${c.l}</div>`).join('')
  const fcats = [{v:'veg',l:'野菜'},{v:'fruit',l:'果物'},{v:'rice',l:'米'},{v:'other',l:'加工品'},{v:'misc',l:'その他'}]
  const mFormCats = document.getElementById('m-form-cats')
  if (mFormCats) mFormCats.innerHTML = fcats.map(c=>`<button class="fchip${c.v==='veg'?' on':''}" data-v="${c.v}" onclick="selCat(this,'mob')">${chipSvg(c.v)}${c.l}</button>`).join('')
}
function mHomeCat(el: HTMLElement, cat: string, label: string) {
  document.getElementById('m-home-cats')?.querySelectorAll('.m-chip').forEach(c=>c.classList.remove('on')); el.classList.add('on')
  mobCatFilter = cat
  const t = document.getElementById('m-home-title'); if(t) t.textContent = cat==='all'?'あたらしい余りもの':label
  applyMobFilter()
}
function mSearchCat(el: HTMLElement, cat: string) {
  document.getElementById('m-search-cats')?.querySelectorAll('.m-chip').forEach(c=>c.classList.remove('on')); el.classList.add('on')
  mSearchCatKey=cat; mDoSearch()
}
const M_SEARCH_CAT_LABELS: Record<string, string> = {
  all: 'すべて',
  fruit: '果物',
  veg: '野菜',
  rice: '米',
  wood: '薪・木材',
  herb: '山菜',
  other: '加工品',
  land: '土地・農地',
  misc: 'なんでも',
}

function mDoSearch() {
  const inp = document.getElementById('m-search-inp') as HTMLInputElement
  const kw = inp?.value.toLowerCase().trim() ?? ''
  const catFiltered = mSearchCatKey === 'all' ? ITEMS : ITEMS.filter((i) => i.cat === mSearchCatKey)
  const base = applyAreaFilter(applySoldStatusFilter(catFiltered))
  const list = applySortFilter(
    kw ? base.filter((i) => i.name.toLowerCase().includes(kw) || i.loc.toLowerCase().includes(kw)) : base,
    mobSortMode
  )
  const t = document.getElementById('m-search-title')
  if (t) {
    if (kw) t.textContent = `「${kw}」の検索結果 ${list.length}件`
    else if (mSearchCatKey === 'all') t.textContent = `すべての余りもの (${list.length}件)`
    else t.textContent = `${M_SEARCH_CAT_LABELS[mSearchCatKey] ?? mSearchCatKey} (${list.length}件)`
  }
  renderGrid(list, 'm-search-grid', 'mob')
  _showFilterMsg('m-search-grid')
}

/* ── RENDER GRID ── */
function cardHTML(it: Item, mode: string) {
  const cls = mode==='pc'?'pc-card':'m-card'
  const imgCls = mode==='pc'?'pc-card-img':'m-card-img'
  const bodyCls = mode==='pc'?'pc-card-body':'m-card-body'
  const nameCls = mode==='pc'?'pc-card-name':'m-card-name'
  const locCls = mode==='pc'?'pc-card-loc':'m-card-loc'
  const priceCls = mode==='pc'?'pc-card-price':'m-card-price'
  const icon = CAT_CARD_ICONS[it.cat] ?? CAT_CARD_ICONS.misc
  const imgContent = it.imgSrc
    ? `<img src="${it.imgSrc}" style="width:100%;height:100%;object-fit:cover;position:absolute;inset:0;border-radius:inherit;" />`
    : icon
  if (it.sold) {
    return `<div class="${cls} sold-card">
      <div class="${imgCls} ${it.bg}" style="position:relative;">${imgContent}<div class="sold-overlay"><span class="sold-overlay-text">SOLD</span></div></div>
      <div class="${bodyCls}"><p class="${nameCls}">${it.name}</p><p class="${locCls}">📍 ${it.loc}</p><p class="${priceCls}">${it.price} <span>${it.unit}</span></p></div>
    </div>`
  }
  const badge = it.badge==='new'?`<span class="bBadge bNew">NEW</span>`:it.badge==='free'?`<span class="bBadge bFree">無料</span>`:''
  return `<div class="${cls}" onclick="openDetail(${it.id},'${mode}')">
    <div class="${imgCls} ${it.bg}" style="position:relative;">${badge}${imgContent}</div>
    <div class="${bodyCls}"><p class="${nameCls}">${it.name}</p><p class="${locCls}">📍 ${it.loc}</p><p class="${priceCls}">${it.price} <span>${it.unit}</span></p></div>
  </div>`
}
function renderGrid(list: Item[], gridId: string, mode: string) {
  const g = document.getElementById(gridId)
  if (!g) return
  g.innerHTML = list.length ? list.map(i=>cardHTML(i,mode)).join('') : `<div class="empty-state" style="grid-column:1/-1"><p>見つかりませんでした。<br>別のキーワードで試してみてください。</p></div>`
}

async function openPublicProfile(userId: string | null | undefined, mode: 'pc' | 'mob') {
  if (!userId) {
    showToast('この出品のプロフィールは表示できません')
    return
  }
  if (!CURRENT_USER_ID) {
    window.location.href = '/login'
    return
  }
  PROFILE_VIEW_USER_ID = userId
  if (mode === 'pc') {
    pcGo('userprofile')
    await hydrateUserProfilePage('pc')
  } else {
    mNav('ms-userprofile')
    await hydrateUserProfilePage('mob')
  }
}

function renderPublicProfileExtraFields(mode: 'pc' | 'mob', tagline: string, categories: string[], times: string[]) {
  const tl = tagline.trim()
  if (mode === 'pc') {
    const tlEl = document.getElementById('pc-up-tagline')
    if (tlEl) {
      tlEl.textContent = tl
      ;(tlEl as HTMLElement).style.display = tl ? 'block' : 'none'
    }
    const wrap = document.getElementById('pc-up-cat-wrap')
    const badges = document.getElementById('pc-up-cat-badges')
    if (wrap && badges) {
      if (categories.length) {
        wrap.style.display = 'block'
        badges.innerHTML = categories.map((c) => `<span class="prof-cat-pill">${escChatHtml(c)}</span>`).join('')
      } else {
        wrap.style.display = 'none'
        badges.innerHTML = ''
      }
    }
    const hw = document.getElementById('pc-up-handoff-wrap')
    const ht = document.getElementById('pc-up-handoff-text')
    if (hw && ht) {
      if (times.length) {
        hw.style.display = 'block'
        ht.textContent = times.join('、')
      } else {
        hw.style.display = 'none'
        ht.textContent = ''
      }
    }
  } else {
    const tlEl = document.getElementById('m-up-tagline')
    if (tlEl) {
      tlEl.textContent = tl
      ;(tlEl as HTMLElement).style.display = tl ? 'block' : 'none'
    }
    const wrap = document.getElementById('m-up-cat-wrap')
    const badges = document.getElementById('m-up-cat-badges')
    if (wrap && badges) {
      if (categories.length) {
        wrap.style.display = 'block'
        badges.innerHTML = categories.map((c) => `<span class="prof-cat-pill">${escChatHtml(c)}</span>`).join('')
      } else {
        wrap.style.display = 'none'
        badges.innerHTML = ''
      }
    }
    const hw = document.getElementById('m-up-handoff-wrap')
    const ht = document.getElementById('m-up-handoff-text')
    if (hw && ht) {
      if (times.length) {
        hw.style.display = 'block'
        ht.textContent = times.join('、')
      } else {
        hw.style.display = 'none'
        ht.textContent = ''
      }
    }
  }
}

async function hydrateUserProfilePage(mode: 'pc' | 'mob') {
  const uid = PROFILE_VIEW_USER_ID
  if (!uid) return
  const supabase = createClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: prof } = await supabase
    .from('profiles')
    .select('id,name,area,bio,avatar_url,categories,available_times,tagline')
    .eq('id', uid)
    .maybeSingle()
  const { avg, count } = await fetchAggregateReviewsForUser(uid)
  const { data: rows } = await supabase
    .from('items')
    .select('*, profiles(name, area)')
    .eq('user_id', uid)
    .eq('is_sold', false)
    .order('created_at', { ascending: false })
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const listings = (rows || []).map((row: any) => mapSupabaseItem(row, CURRENT_USER_ID)) as Item[]
  for (const it of listings) {
    if (it.supabaseId && !ITEMS.some((x) => (x as Item).supabaseId === it.supabaseId)) ITEMS.push(it)
  }

  const fallback = ITEMS.find((i) => (i as Item).userId === uid) as Item | undefined
  const sellerShort = fallback?.seller.replace(/（[^）]*）/g, '').trim()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const p = prof as any
  const name = (p?.name as string) || sellerShort || 'ユーザー'
  const area = (p?.area as string) || fallback?.sloc || '—'
  const bio = (typeof p?.bio === 'string' && p.bio.trim()) ? p.bio : '自己紹介はまだありません。'
  const av = (p?.avatar_url as string) || ''
  const profTagline = typeof p?.tagline === 'string' ? p.tagline : ''
  const profCats = parseProfileTextArray(p?.categories)
  const profHandoff = parseProfileTextArray(p?.available_times)

  const ratingHtml =
    count > 0
      ? `<span>★${avg.toFixed(1)}</span><span style="font-size:.78rem;font-weight:500;color:var(--mu)">（${count}件の評価）</span>`
      : `<span style="color:var(--mu);font-weight:500">まだ評価はありません</span>`

  if (mode === 'pc') {
    const avEl = document.getElementById('pc-up-avt')
    if (avEl) {
      if (av) {
        avEl.style.fontSize = '0'
        avEl.innerHTML = `<img src="${escAttrUrl(av)}" alt="" style="width:100%;height:100%;object-fit:cover;" />`
      } else {
        avEl.style.fontSize = '2.4rem'
        avEl.textContent = '🧑'
      }
    }
    const nm = document.getElementById('pc-up-name'); if (nm) nm.textContent = name
    const ar = document.getElementById('pc-up-area'); if (ar) ar.textContent = area
    const rt = document.getElementById('pc-up-rating'); if (rt) rt.innerHTML = ratingHtml
    const bi = document.getElementById('pc-up-bio'); if (bi) bi.textContent = bio
    renderPublicProfileExtraFields('pc', profTagline, profCats, profHandoff)
    renderGrid(listings, 'pc-up-grid', 'pc')
  } else {
    const avEl = document.getElementById('m-up-avt')
    if (avEl) {
      if (av) {
        avEl.style.fontSize = '0'
        avEl.innerHTML = `<img src="${escAttrUrl(av)}" alt="" style="width:100%;height:100%;object-fit:cover;" />`
      } else {
        avEl.style.fontSize = '2rem'
        avEl.textContent = '🧑'
      }
    }
    const nm = document.getElementById('m-up-name'); if (nm) nm.textContent = name
    const ar = document.getElementById('m-up-area'); if (ar) ar.textContent = area
    const rt = document.getElementById('m-up-rating'); if (rt) rt.innerHTML = ratingHtml
    const bi = document.getElementById('m-up-bio'); if (bi) bi.textContent = bio
    renderPublicProfileExtraFields('mob', profTagline, profCats, profHandoff)
    renderGrid(listings, 'm-up-grid', 'mob')
  }
}

function wireSellerProfileClicks(mode: 'pc' | 'mob') {
  const uid = curItem.mine ? CURRENT_USER_ID : curItem.userId
  const can = !!(uid && CURRENT_USER_ID)
  const ids = mode === 'pc' ? (['pc-det-sname', 'pc-d-sname'] as const) : (['m-d-sname'] as const)
  ids.forEach((id) => {
    const el = document.getElementById(id)
    if (!el) return
    el.classList.toggle('seller-name-link', can)
    el.onclick = can
      ? (e: MouseEvent) => {
          e.preventDefault()
          e.stopPropagation()
          void openPublicProfile(uid, mode)
        }
      : null
  })
}

/* ── 商品詳細URL・LINEシェア ── */
const MEGURU_PUBLIC_ORIGIN = 'https://me-guru.vercel.app'

function buildItemDetailPageUrl(it: Item): string {
  const sid = typeof it.supabaseId === 'string' ? it.supabaseId.trim() : ''
  if (sid) return `${MEGURU_PUBLIC_ORIGIN}/?item=${encodeURIComponent(sid)}`
  return `${MEGURU_PUBLIC_ORIGIN}/`
}

function buildLineShareMessageText(it: Item, itemPageUrl: string): string {
  const priceLine =
    it.price === '無料'
      ? '無料'
      : [it.price, (it.unit || '').trim()].filter(Boolean).join(' ').replace(/\s+/g, ' ').trim()
  return `「【MEGURU】${it.name}\n${priceLine}｜${it.loc}\n農村の余りものプラットフォームMEGURUで見つけました🌿\n詳細はこちら→ ${itemPageUrl}」`
}

function openLineShareForCurrentItem() {
  const itemUrl = buildItemDetailPageUrl(curItem)
  const text = buildLineShareMessageText(curItem, itemUrl)
  const lineUrl = `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(itemUrl)}&text=${encodeURIComponent(text)}`
  window.open(lineUrl, '_blank', 'noopener,noreferrer')
}

/* ── DETAIL ── */
function openDetail(id: number, mode: string) {
  curItem = ITEMS.find(x=>x.id===id)||ITEMS[0]
  const sellerName = curItem.mine ? USER.name : curItem.seller
  const sellerLoc  = curItem.mine ? USER.area  : curItem.sloc
  const sellerAvtSrc = curItem.mine ? USER.avt : ''
  const setAvt = (el: HTMLElement|null) => {
    if (!el) return
    if (sellerAvtSrc) { el.style.fontSize='0'; el.innerHTML=`<img src="${sellerAvtSrc}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;" />` }
    else { el.style.fontSize=''; el.textContent = curItem.mine ? '🧑' : curItem.savt }
  }

  if (mode==='pc') {
    pcGo('detail')
    renderDetailGallery(curItem, 'pc')
    const title=document.getElementById('pc-det-title'); if(title) title.textContent=curItem.name
    const price=document.getElementById('pc-det-price'); if(price) price.innerHTML=`${curItem.price} <small>${curItem.unit}</small>`
    const cat=document.getElementById('pc-det-cat-tag'); if(cat) cat.textContent=CATMAP[curItem.cat]||curItem.cat
    applyItemDescriptionToDetail(curItem.desc, 'pc')
    const loc=document.getElementById('pc-det-loc'); if(loc) loc.textContent=curItem.loc
    const date=document.getElementById('pc-det-date'); if(date) date.textContent='本日'
    const pcExp = document.getElementById('pc-det-expiry')
    if (pcExp) { const r=formatExpiry(curItem.expiry); pcExp.textContent=r.text; pcExp.style.color=r.color; pcExp.style.fontWeight=r.color?'600':'' }
    setAvt(document.getElementById('pc-det-avt') as HTMLElement|null)
    const sname=document.getElementById('pc-det-sname'); if(sname) sname.textContent=sellerName
    const sloc=document.getElementById('pc-det-sloc'); if(sloc) sloc.textContent=sellerLoc
    applyFavButtonState('pc', curItem)
    const main=document.getElementById('pc-main'); if(main) main.scrollTop=0
    // SOLD状態の反映
    const pcSoldBanner=document.getElementById('pc-det-sold-banner'); if(pcSoldBanner) pcSoldBanner.style.display=curItem.sold?'flex':'none'
    const showWantPc = !curItem.mine && !curItem.sold
    const pcChatBtn=document.getElementById('pc-det-chat-btn'); if(pcChatBtn) pcChatBtn.style.display=showWantPc?'flex':'none'
    const pcPanelWant = document.querySelector('#pc-panel .p-chat') as HTMLElement | null
    if (pcPanelWant) pcPanelWant.style.display = showWantPc ? 'flex' : 'none'
    const rateUid = curItem.mine ? CURRENT_USER_ID : curItem.userId
    if (rateUid) {
      void fetchAggregateReviewsForUser(rateUid).then(({ avg, count }) => applySellerRatingToDetail(avg, count, 'pc'))
    } else {
      applySellerRatingToDetail(0, 0, 'pc')
    }
    wireSellerProfileClicks('pc')
  } else {
    renderDetailGallery(curItem, 'mob')
    setAvt(document.getElementById('m-d-avt') as HTMLElement|null)
    const sname=document.getElementById('m-d-sname'); if(sname) sname.textContent=sellerName
    const sloc=document.getElementById('m-d-sloc'); if(sloc) sloc.textContent=sellerLoc
    const title=document.getElementById('m-d-title'); if(title) title.textContent=curItem.name
    const price=document.getElementById('m-d-price'); if(price) price.innerHTML=`${curItem.price} <small>${curItem.unit}</small>`
    applyItemDescriptionToDetail(curItem.desc, 'mob')
    const qty=document.getElementById('m-d-qty'); if(qty) qty.textContent=curItem.unit||'記載なし'
    const cat=document.getElementById('m-d-cat'); if(cat) cat.textContent=CATMAP[curItem.cat]||curItem.cat
    const date=document.getElementById('m-d-date'); if(date) date.textContent='本日'
    const mExp = document.getElementById('m-det-expiry')
    if (mExp) { const r=formatExpiry(curItem.expiry); mExp.textContent=r.text; mExp.style.color=r.color; mExp.style.fontWeight=r.color?'600':'' }
    applyFavButtonState('mob', curItem)
    // SOLD状態の反映
    const mSoldBanner=document.getElementById('m-det-sold-banner'); if(mSoldBanner) mSoldBanner.style.display=curItem.sold?'flex':'none'
    const showWantMob = !curItem.mine && !curItem.sold
    const mChatBtn=document.getElementById('m-det-chat-btn'); if(mChatBtn) mChatBtn.style.display=showWantMob?'flex':'none'
    const rateUid = curItem.mine ? CURRENT_USER_ID : curItem.userId
    if (rateUid) {
      void fetchAggregateReviewsForUser(rateUid).then(({ avg, count }) => applySellerRatingToDetail(avg, count, 'mob'))
    } else {
      applySellerRatingToDetail(0, 0, 'mob')
    }
    wireSellerProfileClicks('mob')
    mNav('ms-detail')
  }
}

/* ── FAV（localStorage `favorites` + Supabase 行取得） ── */
function isProbablyItemUuid(s: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(s)
}

function itemFavoriteStorageKey(it: Item): string {
  const sid = typeof it.supabaseId === 'string' ? it.supabaseId.trim() : ''
  if (sid) return sid
  return `local:${it.id}`
}

function loadFavoritesFromStorage() {
  favIdSet.clear()
  try {
    const raw = localStorage.getItem(LS_FAVORITES_KEY)
    if (!raw) return
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return
    for (const x of parsed) {
      if (typeof x === 'string' && x) favIdSet.add(x)
      else if (typeof x === 'number' && Number.isFinite(x)) favIdSet.add(String(x))
    }
  } catch (e) {
    console.warn('[meguru] loadFavoritesFromStorage:', e)
  }
}

function persistFavorites() {
  try {
    localStorage.setItem(LS_FAVORITES_KEY, JSON.stringify([...favIdSet]))
  } catch (e) {
    console.warn('[meguru] persistFavorites:', e)
  }
}

function isItemFavorited(it: Item): boolean {
  const canonical = itemFavoriteStorageKey(it)
  if (favIdSet.has(canonical)) return true
  const sid = typeof it.supabaseId === 'string' ? it.supabaseId.trim() : ''
  if (sid && favIdSet.has(sid)) return true
  if (favIdSet.has(`local:${it.id}`)) return true
  if (favIdSet.has(String(it.id))) return true
  return false
}

function removeAllFavoriteStorageKeysForItem(it: Item) {
  const sid = typeof it.supabaseId === 'string' ? it.supabaseId.trim() : ''
  const keys = [itemFavoriteStorageKey(it), sid || undefined, it.supabaseId, `local:${it.id}`, String(it.id)].filter(
    (k): k is string => typeof k === 'string' && k.length > 0
  )
  for (const k of keys) favIdSet.delete(k)
}

function applyFavButtonState(mode: string, it: Item) {
  const on = isItemFavorited(it)
  const heart = on ? '❤️' : '🤍'
  if (mode === 'pc') {
    const d = document.getElementById('pc-det-fav-btn')
    if (d) {
      d.textContent = heart
      d.classList.toggle('on', on)
    }
    const p = document.getElementById('pc-fav-btn')
    if (p) {
      p.textContent = heart
      p.classList.toggle('on', on)
    }
  } else {
    const m = document.getElementById('m-fav-btn')
    if (m) {
      m.textContent = heart
      m.classList.toggle('on', on)
    }
  }
}

async function fetchFavoriteItemsForDisplay(): Promise<Item[]> {
  const keys = [...favIdSet]
  const uuids = keys.filter(isProbablyItemUuid)
  const otherKeys = keys.filter((k) => !isProbablyItemUuid(k))

  let fromSb: Item[] = []
  if (uuids.length > 0) {
    const supabase = createClient()
    const { data, error } = await supabase.from('items').select('*, profiles(name, area)').in('id', uuids)
    if (error) console.warn('[meguru] fetchFavoriteItemsForDisplay:', error.message, error.code)
    else if (data?.length) {
      fromSb = data.map((row) => mapSupabaseItem(row, CURRENT_USER_ID))
      const order = new Map(uuids.map((id, i) => [id, i]))
      fromSb.sort((a, b) => (order.get(a.supabaseId!) ?? 99) - (order.get(b.supabaseId!) ?? 99))
    }
  }

  const seen = new Set<string>()
  const pushDedup = (it: Item, list: Item[]) => {
    const k = it.supabaseId ? it.supabaseId : `local:${it.id}`
    if (seen.has(k)) return
    seen.add(k)
    list.push(it)
  }

  const out: Item[] = []
  for (const it of fromSb) pushDedup(it, out)

  for (const k of otherKeys) {
    let found: Item | undefined
    if (k.startsWith('local:')) {
      const num = Number(k.slice(6))
      if (!Number.isNaN(num)) found = ITEMS.find((i) => i.id === num)
    } else if (/^\d+$/.test(k)) {
      const num = Number(k)
      if (!Number.isNaN(num)) found = ITEMS.find((i) => i.id === num)
    }
    if (!found) found = ITEMS.find((i) => itemFavoriteStorageKey(i) === k)
    if (found) pushDedup(found, out)
  }

  return out
}

function toggleFav(mode: string) {
  if (isItemFavorited(curItem)) {
    removeAllFavoriteStorageKeysForItem(curItem)
    showToast('お気に入りから外しました')
  } else {
    const sid = typeof curItem.supabaseId === 'string' ? curItem.supabaseId.trim() : ''
    if (sid) {
      favIdSet.add(sid)
      favIdSet.delete(`local:${curItem.id}`)
      favIdSet.delete(String(curItem.id))
    } else {
      favIdSet.add(`local:${curItem.id}`)
    }
    showToast('お気に入りに追加しました')
  }
  persistFavorites()
  applyFavButtonState(mode, curItem)
  const pfs = document.getElementById('pc-fav-sub')
  if (pfs) pfs.textContent = `${favIdSet.size}件`
  const mfs = document.getElementById('m-fav-sub')
  if (mfs) mfs.textContent = `${favIdSet.size}件`
}

async function showFavs(mode: string) {
  if (!CURRENT_USER_ID) {
    window.location.href = '/login'
    return
  }
  const list = await fetchFavoriteItemsForDisplay()
  if (mode === 'pc') {
    pcGo('mylistings')
    renderMyListings('pc', 'お気に入り', list)
  } else {
    mNav('ms-mylistings')
    renderMyListings('mob', 'お気に入り', list)
  }
}

/* ── CHAT ── */
const BG_STYLES: Record<string,string> = {
  bk:'linear-gradient(135deg,#fff3e0,#ffe0b2)',
  bg:'linear-gradient(135deg,#f1f8e9,#dcedc8)',
  bb:'linear-gradient(135deg,#f0ebe3,#e0d5c0)',
  by:'linear-gradient(135deg,#fdf8e8,#fdf0cc)',
}
function getChatLinkedItem(chat: Chat | null | undefined): Item | null {
  if (!chat) return null
  if (chat.itemSupabaseId) {
    const bySb = ITEMS.find((i) => i.supabaseId === chat.itemSupabaseId)
    if (bySb) return bySb
  }
  if (chat.itemId) return ITEMS.find((x) => x.id === chat.itemId) ?? null
  return null
}

function setCisIcon(elId: string, chatId: string) {
  const el = document.getElementById(elId)
  if (!el) return
  const chat = CHATS[chatId]
  if (!chat) return
  const item = getChatLinkedItem(chat)
  if (item?.imgSrc) {
    el.innerHTML = `<img src="${item.imgSrc}" />`
    el.style.background = 'none'
  } else if (item) {
    const svgIcon = (CAT_CARD_ICONS[item.cat] ?? CAT_CARD_ICONS.misc)
      .replace('viewBox="0 0 48 48"', 'viewBox="0 0 48 48" class="cat-icon"')
      .replace(/class="cat-icon" class="cat-icon"/, 'class="cat-icon"')
    el.innerHTML = svgIcon
    el.style.background = BG_STYLES[item.bg] ?? BG_STYLES.by
  } else {
    el.style.fontSize = '1.4rem'
    el.textContent = chat.ie
    el.style.background = 'none'
  }
}

function openChatCore(chatId: string) {
  curChatId = chatId
  const c = CHATS[chatId]
  if (c) {
    c.unread = 0
    if (c.supabaseId) markSupabaseChatRead(c.supabaseId)
  }
  renderChatList('pc')
  renderChatList('mob')
  updateSbChatUnreadBadge()
  refreshNotifListsIfOpen()
}

// 既存のチャットを使うか、出品者ごとに新規スレッドを自動生成
function getOrCreateChatKey(it: Item): string {
  if (it.mine) { showToast('自分の出品にはチャットできません'); return '' }
  // 既存のchatKeyがそのまま使える場合
  if (it.chatKey && CHATS[it.chatKey]) return it.chatKey
  // item IDベースのキーで既に作成済みなら再利用
  const autoKey = `item_${it.id}`
  if (!CHATS[autoKey]) {
    const displayName = it.seller.replace(/（[^）]*）/g, '').trim()
    CHATS[autoKey] = {
      name: displayName,
      sub: it.sloc,
      avt: it.savt,
      ie: it.emoji,
      in_: it.name,
      ip: `${it.price} ${it.unit}`.trim(),
      unread: 0,
      itemId: it.id,
      lastAt: Date.now(),
      msgs: []
    }
  }
  // itemのchatKeyを更新して次回から再利用できるように
  it.chatKey = autoKey
  return autoKey
}

function pcOpenChatFromDetail() {
  const key = getOrCreateChatKey(curItem)
  if (!key) return
  openChatCore(key); const c=CHATS[key]
  const cp=document.getElementById('pc-panel-chat')
  if (cp) { cp.style.display='flex'; cp.style.flexDirection='column'; cp.style.height='100%'; cp.style.overflow='hidden' }
  document.getElementById('pc-panel')?.classList.remove('hidden')
  const avt=document.getElementById('pc-chat-avt'); if(avt) avt.textContent=c.avt
  const pname=document.getElementById('pc-chat-pname'); if(pname) pname.textContent=c.name
  const psub=document.getElementById('pc-chat-psub'); if(psub) psub.textContent=c.sub
  setCisIcon('pc-cis-e', key)
  const cisn=document.getElementById('pc-cis-n'); if(cisn) cisn.textContent=c.in_
  const cisp=document.getElementById('pc-cis-p'); if(cisp) cisp.textContent=c.ip
  renderMsgs('pc')
  renderChatList('pc')
  updateCompleteBtn('pc')
}
function mOpenChatFromDetail() {
  const key = getOrCreateChatKey(curItem)
  if (!key) return
  openChat(key,'mob')
  renderChatList('mob')
}
function openChat(chatId: string, mode: string) {
  openChatCore(chatId); const c=CHATS[chatId]
  if (mode==='pc') {
    document.querySelectorAll('#pc-chatlist-items .cl-item').forEach(el=>el.classList.remove('active'))
    const target=document.querySelector(`#pc-chatlist-items [data-chat="${chatId}"]`); if(target) target.classList.add('active')
    document.getElementById('pc-panel')?.classList.remove('hidden')
    const pd=document.getElementById('pc-panel-detail'); if(pd) pd.style.display='none'
    const cp=document.getElementById('pc-panel-chat')
    if (cp) { cp.style.display='flex'; cp.style.flexDirection='column'; cp.style.height='100%'; cp.style.overflow='hidden' }
    const avt=document.getElementById('pc-chat-avt'); if(avt) avt.textContent=c.avt
    const pname=document.getElementById('pc-chat-pname'); if(pname) pname.textContent=c.name
    const psub=document.getElementById('pc-chat-psub'); if(psub) psub.textContent=c.sub
    setCisIcon('pc-cis-e', chatId)
    const cisn=document.getElementById('pc-cis-n'); if(cisn) cisn.textContent=c.in_
    const cisp=document.getElementById('pc-cis-p'); if(cisp) cisp.textContent=c.ip
    renderMsgs('pc')
    updateCompleteBtn('pc')
  } else {
    const avt=document.getElementById('m-chat-avt'); if(avt) avt.textContent=c.avt
    const pname=document.getElementById('m-chat-pname'); if(pname) pname.textContent=c.name
    const psub=document.getElementById('m-chat-psub'); if(psub) psub.textContent=c.sub
    setCisIcon('m-cis-e', chatId)
    const cisn=document.getElementById('m-cis-n'); if(cisn) cisn.textContent=c.in_
    const cisp=document.getElementById('m-cis-p'); if(cisp) cisp.textContent=c.ip
    renderMsgs('mob'); updateCompleteBtn('mob'); mNav('ms-chat')
  }
}
function pcBackToDetail() {
  const pc=document.getElementById('pc-panel-chat'); if(pc) pc.style.display='none'
  document.getElementById('pc-panel')?.classList.add('hidden')
}
function renderMsgs(mode: string) {
  const c=CHATS[curChatId]
  const box=document.getElementById(mode==='pc'?'pc-chat-msgs':'m-chat-msgs')
  if (!box||!c) return
  box.innerHTML='<p class="chatDateDiv">今日</p>'
  c.msgs.forEach(m=>{
    if (m.from==='ds') { box.innerHTML+=`<div class="dsWrap"><p class="dsLabel">📅 受け渡し日程を選ぶ</p><div class="dsOpts"><button class="dsOpt" onclick="pickDate(this)">土曜 午前</button><button class="dsOpt on" onclick="pickDate(this)">土曜 午後</button><button class="dsOpt" onclick="pickDate(this)">日曜 午前</button><button class="dsOpt" onclick="pickDate(this)">日曜 午後</button></div></div>`; return }
    if (m.from==='system') { box.innerHTML+=`<div class="sys-msg"><span>🎉 ${escChatHtml(m.text || '')}</span></div>`; return }
    const me=m.from==='me'
    const tx = escChatHtml(m.text || '')
    box.innerHTML+=`<div class="mr${me?' me':''}"><div class="mAvt">${me?'🧑':CHATS[curChatId].avt}</div><div class="bbl">${tx}</div><span class="mTime">${m.time}</span></div>`
  })
  setTimeout(()=>box.scrollTop=box.scrollHeight,50)
}
/* ── TRADE COMPLETE & REVIEWS ── */
let tradeModalMode = 'pc'

type ReviewModalCtx = {
  mode: string
  revieweeName: string
  revieweeId: string
  chatUuid: string
  itemUuid: string | null
}

let reviewModalCtx: ReviewModalCtx | null = null

function openTradeModal(mode: string) {
  const chat = CHATS[curChatId]
  if (!chat) return
  if (!chat.sellerId || CURRENT_USER_ID !== chat.sellerId) {
    showToast('出品者のみ取引を完了できます')
    return
  }
  const item = getChatLinkedItem(chat)
  if (!item || item.sold) return
  tradeModalMode = mode
  document.getElementById('trade-modal')?.classList.remove('hidden')
}

function requestCompleteTradePc() {
  const chat = CHATS[curChatId]
  if (!chat) return
  if (!chat.sellerId || CURRENT_USER_ID !== chat.sellerId) {
    showToast('出品者のみ取引を完了できます')
    return
  }
  const item = getChatLinkedItem(chat)
  if (!item || item.sold) return
  if (!confirm('取引を完了しますか？相手と手渡しが完了した後に押してください。')) return
  tradeModalMode = 'pc'
  confirmCompleteTrade()
}
function closeTradeModal() {
  document.getElementById('trade-modal')?.classList.add('hidden')
}
function closeReviewModal() {
  document.getElementById('review-modal')?.classList.add('hidden')
  reviewModalCtx = null
}

async function fetchAggregateReviewsForUser(userId: string): Promise<{ avg: number; count: number }> {
  const { data, error } = await createClient().from('reviews').select('rating').eq('reviewee_id', userId)
  if (error || !data?.length) return { avg: 0, count: 0 }
  const sum = data.reduce((a, r) => a + Number((r as { rating: number }).rating), 0)
  return { avg: sum / data.length, count: data.length }
}

async function refreshMyReviewStatsUI(userId: string) {
  const { avg, count } = await fetchAggregateReviewsForUser(userId)
  MY_REVIEW_AVG = avg
  MY_REVIEW_COUNT = count
  const revNum = count > 0 ? `★${avg.toFixed(1)}` : '—'
  const revLbl = count > 0 ? `評価（${count}件）` : '評価'
  const pcN = document.getElementById('pc-mp-rev-num')
  const mN = document.getElementById('m-mp-rev-num')
  if (pcN) pcN.textContent = revNum
  if (mN) mN.textContent = revNum
  const pcL = document.getElementById('pc-mp-rev-lbl')
  const mL = document.getElementById('m-mp-rev-lbl')
  if (pcL) pcL.textContent = revLbl
  if (mL) mL.textContent = revLbl
  const profSum = count > 0 ? `平均 ★${avg.toFixed(1)}（${count}件）` : 'まだ評価はありません'
  const p1 = document.getElementById('pc-prof-rev-summary')
  const p2 = document.getElementById('m-prof-preview-rating')
  if (p1) {
    p1.textContent = profSum
    p1.style.display = 'block'
  }
  if (p2) {
    p2.textContent = count > 0 ? `★${avg.toFixed(1)}（${count}件）` : '評価はまだありません'
    p2.style.display = 'block'
  }
}

function parseProfileTextArray(raw: unknown): string[] {
  if (!Array.isArray(raw)) return []
  return raw.filter((x): x is string => typeof x === 'string' && x.trim().length > 0)
}

function collectProfileCheckboxList(
  prefix: 'pc' | 'm',
  kind: 'cat' | 'time',
  options: readonly string[]
): string[] {
  const mid = kind === 'cat' ? 'prof-cat' : 'prof-time'
  return options.filter((_, i) => {
    const el = document.getElementById(`${prefix}-${mid}-${i}`) as HTMLInputElement | null
    return !!el?.checked
  })
}

async function syncUserProfileFromSupabase(userId: string) {
  try {
    const { data, error } = await createClient()
      .from('profiles')
      .select('name, area, bio, avatar_url, categories, available_times, tagline')
      .eq('id', userId)
      .maybeSingle()
    if (error || !data) return
    if (typeof (data as { name?: string }).name === 'string' && (data as { name: string }).name)
      USER.name = (data as { name: string }).name
    const areaRaw = (data as { area?: string | null }).area
    if (typeof areaRaw === 'string' && areaRaw.trim()) {
      USER.area = areaRaw.trim()
      try {
        localStorage.setItem(LS_AREA_KEY, USER.area)
      } catch {
        /* ignore */
      }
    } else {
      USER.area = ''
      activeDistricts = []
      try {
        localStorage.removeItem(LS_AREA_KEY)
        localStorage.removeItem(LS_DISTRICTS_KEY)
      } catch {
        /* ignore */
      }
    }
    if (typeof (data as { bio?: string }).bio === 'string') USER.bio = (data as { bio: string }).bio
    else USER.bio = ''
    const av = (data as { avatar_url?: string }).avatar_url
    if (typeof av === 'string' && av) USER.avt = av
    else USER.avt = ''
    USER.categories = parseProfileTextArray((data as { categories?: unknown }).categories)
    USER.availableTimes = parseProfileTextArray((data as { available_times?: unknown }).available_times)
    const tg = (data as { tagline?: string | null }).tagline
    USER.tagline = typeof tg === 'string' ? tg : ''
    updateAllUserRefs()
  } catch (e) {
    console.warn('[meguru] syncUserProfileFromSupabase', e)
  }
}

function applySellerRatingToDetail(avg: number, count: number, mode: string) {
  const label = count > 0 ? `${avg.toFixed(1)}` : '—'
  const sub = count > 0 ? `（${count}件）` : ''
  if (mode === 'pc') {
    const el = document.getElementById('pc-det-rating')
    if (el) el.innerHTML = `<svg viewBox="0 0 24 24" width="12" height="12" fill="var(--k)"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg> ${label}<span style="font-size:.65rem;color:var(--mu);font-weight:400">${sub}</span>`
    const pr = document.getElementById('pc-d-rating')
    if (pr) pr.innerHTML = `★ ${label}<small style="color:var(--mu);font-weight:400">${sub}</small>`
  } else {
    const el = document.getElementById('m-det-rating')
    if (el) el.innerHTML = `★ ${label}<small style="color:var(--mu);font-weight:400;margin-left:2px">${sub}</small>`
  }
}

async function maybeOpenReviewModalAfterTrade(chat: Chat, item: Item, mode: string) {
  if (!chat.supabaseId || !CURRENT_USER_ID || !chat.buyerId || !chat.sellerId) {
    showToast('取引が完了しました！')
    return
  }
  const { data: existing } = await createClient()
    .from('reviews')
    .select('id')
    .eq('chat_id', chat.supabaseId)
    .eq('reviewer_id', CURRENT_USER_ID)
    .maybeSingle()
  if (existing) {
    showToast('取引が完了しました！')
    return
  }
  const revieweeId = CURRENT_USER_ID === chat.buyerId ? chat.sellerId : chat.buyerId
  reviewModalCtx = {
    mode,
    revieweeName: chat.name,
    revieweeId,
    chatUuid: chat.supabaseId,
    itemUuid: item.supabaseId ?? null,
  }
  const desc = document.getElementById('review-modal-desc')
  if (desc) desc.textContent = `${chat.name}さんとの取引はいかがでしたか？1〜5で評価してください。`
  document.getElementById('review-modal')?.classList.remove('hidden')
  showToast('取引が完了しました！')
}

async function submitReviewRating(rating: number) {
  if (!reviewModalCtx || !CURRENT_USER_ID) return
  const supabase = createClient()
  const row: Record<string, unknown> = {
    chat_id: reviewModalCtx.chatUuid,
    reviewer_id: CURRENT_USER_ID,
    reviewee_id: reviewModalCtx.revieweeId,
    rating,
  }
  if (reviewModalCtx.itemUuid) row.item_id = reviewModalCtx.itemUuid
  const { error } = await supabase.from('reviews').insert(row)
  if (error) {
    console.error('[meguru] review insert:', error.message, error.code)
    showToast('評価の保存に失敗しました')
    return
  }
  closeReviewModal()
  await refreshMyReviewStatsUI(CURRENT_USER_ID)
  showToast('評価を保存しました')
}

function confirmCompleteTrade() {
  const chat = CHATS[curChatId]
  if (!chat) { closeTradeModal(); return }
  if (!chat.sellerId || CURRENT_USER_ID !== chat.sellerId) {
    showToast('出品者のみ取引を完了できます')
    closeTradeModal()
    return
  }
  const item = getChatLinkedItem(chat)
  if (!item) { closeTradeModal(); return }
  item.sold = true
  const t = new Date()
  const time = t.getHours()+':'+String(t.getMinutes()).padStart(2,'0')
  chat.msgs.push({from:'system', text:'取引が完了しました', time})
  chat.lastAt = Date.now()
  TXHISTORY.unshift({emoji:item.emoji, name:item.name, meta:`${chat.name} · ${chat.sub}`, price:item.price, status:'完了', date:'本日'})
  saveItems()
  renderMsgs(tradeModalMode)
  applyPcFilter(); applyMobFilter()
  renderTxHistory('pc')
  renderTxHistory('mob')
  renderChatList('pc')
  renderChatList('mob')
  updateCompleteBtn('pc')
  updateCompleteBtn('mob')
  updateMypage('pc')
  updateMypage('mob')
  closeTradeModal()

  const mode = tradeModalMode
  if (item.supabaseId && CURRENT_USER_ID) {
    void createClient()
      .from('items')
      .update({ is_sold: true })
      .eq('id', item.supabaseId)
      .then(({ error }) => { if (error) console.warn('[meguru] is_sold update:', error.message) })
  }

  void maybeOpenReviewModalAfterTrade(chat, item, mode)
}
function updateCompleteBtn(mode: string) {
  const chat = CHATS[curChatId]
  if (chat?.requestSupabaseId) {
    if (mode === 'pc') {
      const wrap = document.getElementById('pc-chat-trade-wrap')
      if (wrap) wrap.style.display = 'none'
      const cisSold = document.getElementById('pc-chat-cis-sold')
      if (cisSold) cisSold.style.display = 'none'
    } else {
      const btn = document.getElementById('m-complete-btn') as HTMLButtonElement | null
      if (btn) btn.style.display = 'none'
    }
    return
  }
  const item = chat ? getChatLinkedItem(chat) : null
  const isSold = item?.sold ?? false
  const isSeller = !!(chat?.sellerId && CURRENT_USER_ID === chat.sellerId)

  if (mode === 'pc') {
    const cisSold = document.getElementById('pc-chat-cis-sold')
    if (cisSold) cisSold.style.display = item?.sold ? 'inline-flex' : 'none'

    const wrap = document.getElementById('pc-chat-trade-wrap')
    const badge = document.getElementById('pc-chat-sold-badge')
    const bar = document.getElementById('pc-trade-bar-btn-wrap')
    const btn = document.getElementById('pc-complete-btn') as HTMLButtonElement | null
    if (!wrap || !badge || !bar || !btn) return
    if (!isSeller) {
      wrap.style.display = 'none'
      return
    }
    wrap.style.display = 'block'
    if (isSold) {
      badge.style.display = 'block'
      bar.style.display = 'none'
    } else {
      badge.style.display = 'none'
      bar.style.display = 'block'
      btn.textContent = '取引完了にする'
      btn.className = 'trade-bar-btn active'
      btn.disabled = false
    }
    return
  }

  const btn = document.getElementById('m-complete-btn') as HTMLButtonElement | null
  if (!btn) return
  if (!isSeller) {
    btn.style.display = 'none'
    return
  }
  btn.style.display = ''
  if (isSold) {
    btn.textContent = '取引済み'
    btn.className = 'trade-bar-btn done'
    btn.disabled = true
  } else {
    btn.textContent = '取引完了にする'
    btn.className = 'trade-bar-btn active'
    btn.disabled = false
  }
}

/* ── LOCALSTORAGE ── */
const LS_KEY = 'meguru_items'

/** Supabase を正とするため、商品キャッシュキーを削除 */
function clearMeguruItemsLocalStorage() {
  try {
    localStorage.removeItem(LS_KEY)
  } catch {
    /* ignore */
  }
}

function saveItems() {
  try {
    const data = JSON.stringify(ITEMS)
    localStorage.setItem(LS_KEY, data)
    console.log('[meguru] saved:', ITEMS.length, 'items,', (data.length / 1024).toFixed(1), 'KB')
  } catch(e) {
    if (e instanceof DOMException && (e.name === 'QuotaExceededError' || e.name === 'NS_ERROR_DOM_QUOTA_REACHED')) {
      console.error('[meguru] QuotaExceededError: localStorage is full. 画像サイズを確認してください。', e)
    } else {
      console.error('[meguru] localStorage save failed:', e)
    }
  }
}
function initItemsFromStorage() {
  try {
    const saved = localStorage.getItem(LS_KEY)
    if (saved) {
      const parsed = JSON.parse(saved) as Item[]
      if (parsed.length) {
        ITEMS.splice(0, ITEMS.length, ...parsed)
        console.log('[meguru] restored:', ITEMS.length, 'items from localStorage')
      }
    } else {
      console.log('[meguru] no saved data – using default items')
    }
  } catch(e) {
    console.error('[meguru] restore failed:', e)
  }
}

function renderSkeletonGrid(gridId: string) {
  const g = document.getElementById(gridId)
  if (!g) return
  const card = `<div class="skel-card"><div class="skel-img"></div><div class="skel-body"><div class="skel-line w70"></div><div class="skel-line w40"></div><div class="skel-line w60"></div></div></div>`
  g.innerHTML = Array(6).fill(card).join('')
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapSupabaseItem(row: any, userId: string | null): Item {
  return {
    id: new Date(row.created_at).getTime(),
    name: row.name || '',
    cat: row.category || 'misc',
    price: row.price || '無料',
    unit: row.unit ? `/ ${row.unit}` : '',
    emoji: EMOJIMAP[row.category] || '📦',
    bg: BGMAP[row.category] || 'by',
    loc: row.location || '駒ヶ根市',
    badge: row.is_free ? 'free' : 'new',
    seller: (() => {
      const n = row.profiles?.name
      const t = typeof n === 'string' ? n.trim() : ''
      if (!t) return '出品者'
      return isEmailLike(t) ? '出品者' : t
    })(),
    sloc: row.profiles?.area ? `${row.profiles.area}` : '駒ヶ根市',
    savt: '🧑',
    desc: row.description || '詳細は出品者にお問い合わせください。',
    mine: row.user_id === userId,
    chatKey: '',
    imgSrc: row.images?.[0] || '',
    images: row.images || [],
    sold: row.is_sold || false,
    expiry: row.deadline || undefined,
    supabaseId: row.id,
    userId: row.user_id,
  }
}

/* ── REALTIME MESSAGES（全チャット・サイドバー未読含む） ── */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let globalMessagesChannel: any = null
let loadChatsDebounceTimer: ReturnType<typeof setTimeout> | null = null

function unsubscribeMessageRealtime() {
  if (globalMessagesChannel) {
    createClient().removeChannel(globalMessagesChannel)
    globalMessagesChannel = null
  }
}

function subscribeGlobalMessages() {
  if (!CURRENT_USER_ID) return
  unsubscribeMessageRealtime()
  const supabase = createClient()
  globalMessagesChannel = supabase
    .channel(`meguru-messages-all-${CURRENT_USER_ID}`)
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'messages' },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (payload) => {
        const m = payload.new as any
        const chatId = m.chat_id as string | undefined
        const mid = m.id as string | undefined
        const senderId = m.sender_id as string | undefined
        if (!chatId || !mid || !senderId) return
        const chatKey = `sb_${chatId}`

        const scheduleReloadChats = () => {
          if (loadChatsDebounceTimer) clearTimeout(loadChatsDebounceTimer)
          loadChatsDebounceTimer = setTimeout(() => {
            loadChatsDebounceTimer = null
            void loadChatsFromSupabase()
          }, 400)
        }

        if (!CHATS[chatKey]) {
          scheduleReloadChats()
          return
        }

        if (CHATS[chatKey].msgs.some((x) => x.id === mid)) return
        const t = new Date(m.created_at)
        const time = t.getHours() + ':' + String(t.getMinutes()).padStart(2, '0')
        const from = senderId === CURRENT_USER_ID ? 'me' : 'them'
        CHATS[chatKey].msgs.push({ from, text: m.text, time, id: mid, createdAt: m.created_at })
        CHATS[chatKey].lastAt = new Date(m.created_at).getTime()

        if (from === 'them') {
          if (isSupabaseChatThreadVisible(chatKey)) {
            markSupabaseChatRead(chatId)
            CHATS[chatKey].unread = 0
            const pcChat = document.getElementById('pc-panel-chat')
            const usePc =
              pcChat &&
              pcChat.style.display !== 'none' &&
              pcChat.style.display !== '' &&
              !document.getElementById('pc-panel')?.classList.contains('hidden')
            renderMsgs(usePc ? 'pc' : 'mob')
          } else {
            CHATS[chatKey].unread = (CHATS[chatKey].unread || 0) + 1
          }
        }

        renderChatList('pc')
        renderChatList('mob')
        updateSbChatUnreadBadge()
        refreshNotifListsIfOpen()
      }
    )
    .subscribe((status) => {
      if (status === 'SUBSCRIBED') console.log('[meguru] messages realtime: subscribed')
    })
}

async function loadMessagesForChat(supabaseChatId: string, chatKey: string) {
  try {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('messages')
      .select('id, sender_id, text, created_at')
      .eq('chat_id', supabaseChatId)
      .order('created_at', { ascending: true })
    if (error) { console.error('[meguru] loadMessages error:', error.message); return }
    if (!data || !CHATS[chatKey]) return
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    CHATS[chatKey].msgs = data.map((msg: any) => {
      const t = new Date(msg.created_at)
      return {
        from: msg.sender_id === CURRENT_USER_ID ? 'me' : 'them',
        text: msg.text as string,
        time: t.getHours() + ':' + String(t.getMinutes()).padStart(2, '0'),
        id: msg.id as string,
        createdAt: msg.created_at as string,
      }
    })
    if (data.length) CHATS[chatKey].lastAt = new Date((data[data.length - 1] as any).created_at).getTime()
    console.log('[meguru] loadMessages:', data.length, 'msgs for', chatKey)
  } catch (e) { console.error('[meguru] loadMessagesForChat error:', e) }
}

function wipeSupabaseChatsFromMemoryAndRefresh() {
  Object.keys(CHATS).forEach((k) => { if (k.startsWith('sb_')) delete CHATS[k] })
  renderChatList('pc')
  renderChatList('mob')
  updateSbChatUnreadBadge()
  refreshNotifListsIfOpen()
}

/* ── 欲しいものリクエスト ── */
function syncRequestFilterSelects() {
  ;(['pc', 'm'] as const).forEach((pre) => {
    const c = document.getElementById(`${pre}-req-filter-cat`) as HTMLSelectElement | null
    if (c) c.value = reqListCatFilter
    const a = document.getElementById(`${pre}-req-filter-area`) as HTMLSelectElement | null
    if (a) a.value = reqListAreaFilter
  })
}

function initRequestLocSelects() {
  const currentCity = getUserCity()
  const cities = AREA_DATA[NAGANO_PREF] || []
  const cityOpts =
    '<option value="">市区町村を選択</option>' +
    cities.map((c) => `<option value="${c}"${c === currentCity ? ' selected' : ''}>${c}</option>`).join('')
  ;(['pc', 'm'] as const).forEach((pre) => {
    const citySel = document.getElementById(`${pre}-req-loc-city`) as HTMLSelectElement | null
    if (citySel) {
      citySel.innerHTML = cityOpts
      citySel.disabled = false
    }
  })
}

function renderRequestLists() {
  const filtered = meguruRequestsCache.filter((r) => {
    if (reqListCatFilter !== 'all' && r.category !== reqListCatFilter) return false
    if (reqListAreaFilter === REQ_AREA_FILTER_ALL) return true
    if (reqListAreaFilter === REQ_AREA_FILTER_NAGANO) return (r.area || '').includes(NAGANO_PREF)
    return (r.area || '').includes(reqListAreaFilter)
  })
  const cardHtml = (r: MeguruRequest, mode: 'pc' | 'mob') => {
    const isMine = !!(CURRENT_USER_ID && r.user_id === CURRENT_USER_ID)
    const catLabel = REQUEST_CAT_LABELS[r.category] || r.category
    const desc = r.description || ''
    const posted =
      r.created_at
        ? new Date(r.created_at).toLocaleString('ja-JP', { dateStyle: 'medium', timeStyle: 'short' })
        : '—'
    const priceDisp = r.hope_price ? escChatHtml(r.hope_price) : '—'
    const timingDisp = r.hope_timing ? escChatHtml(r.hope_timing) : '—'
    let actions = ''
    if (!isMine && CURRENT_USER_ID) {
      actions = `<button type="button" class="req-offer-btn" onclick="offerForRequest('${r.id}','${mode}')">提供できます</button>`
    } else if (isMine) {
      actions = `<button type="button" class="req-del-btn" onclick="deleteRequest('${r.id}','${mode}')">削除</button>`
    }
    const poster = r.posterName ? escChatHtml(chatPartnerNameFromProfile(r.posterName)) : 'ユーザー'
    return `<article class="req-card" data-id="${r.id}">
      <div class="req-card-head"><span class="req-card-cat">${escChatHtml(catLabel)}</span></div>
      <p class="req-card-labeled"><span class="req-card-k">投稿日</span><span class="req-card-v">${escChatHtml(posted)}</span></p>
      <p class="req-card-labeled"><span class="req-card-k">説明</span></p>
      <p class="req-card-desc">${escChatHtml(desc)}</p>
      <p class="req-card-labeled"><span class="req-card-k">エリア</span><span class="req-card-v">${escChatHtml(r.area || '—')}</span></p>
      <p class="req-card-labeled"><span class="req-card-k">希望価格</span><span class="req-card-v">${priceDisp}</span></p>
      <p class="req-card-labeled"><span class="req-card-k">希望時期</span><span class="req-card-v">${timingDisp}</span></p>
      <p class="req-card-labeled"><span class="req-card-k">投稿者</span><span class="req-card-v">${poster}</span></p>
      <div class="req-card-actions">${actions}</div>
    </article>`
  }
  const inner = filtered.length ? filtered.map((r) => cardHtml(r, 'pc')).join('') : '<p class="req-empty">まだリクエストがありません</p>'
  const pcList = document.getElementById('pc-req-list')
  const mobList = document.getElementById('m-req-list')
  if (pcList) pcList.innerHTML = inner
  if (mobList) mobList.innerHTML = filtered.length ? filtered.map((r) => cardHtml(r, 'mob')).join('') : '<p class="req-empty">まだリクエストがありません</p>'
}

async function loadRequestsFromSupabase() {
  try {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('requests')
      .select(
        `id, user_id, category, description, area, created_at, "希望価格", "希望時期", profiles (name)`
      )
      .order('created_at', { ascending: false })
    if (error) {
      console.error('[meguru] loadRequests:', error.message, error.code)
      meguruRequestsCache = []
      renderRequestLists()
      return
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    meguruRequestsCache = (data || []).map((row: any) => {
      const rawProf = row.profiles as { name: string | null } | { name: string | null }[] | null | undefined
      const prof = Array.isArray(rawProf) ? rawProf[0] : rawProf
      return {
        id: row.id as string,
        user_id: row.user_id as string,
        category: row.category as string,
        description: row.description as string,
        area: row.area as string,
        created_at: row.created_at as string,
        hope_price: (row['希望価格'] as string | null) ?? null,
        hope_timing: (row['希望時期'] as string | null) ?? null,
        posterName: prof?.name ?? undefined,
      }
    })
    renderRequestLists()
  } catch (e) {
    console.error('[meguru] loadRequestsFromSupabase:', e)
    meguruRequestsCache = []
    renderRequestLists()
  }
}

async function submitRequestForm(mode: 'pc' | 'mob') {
  if (!CURRENT_USER_ID) {
    window.location.href = '/login'
    return
  }
  const pre = mode
  const cat = (document.getElementById(`${pre}-req-cat`) as HTMLSelectElement | null)?.value ?? ''
  const desc = (document.getElementById(`${pre}-req-desc`) as HTMLTextAreaElement | null)?.value.trim() ?? ''
  const city = (document.getElementById(`${pre}-req-loc-city`) as HTMLSelectElement | null)?.value ?? ''
  const hopePrice = (document.getElementById(`${pre}-req-price`) as HTMLInputElement | null)?.value.trim() ?? ''
  const hopeWhen = (document.getElementById(`${pre}-req-when`) as HTMLInputElement | null)?.value.trim() ?? ''
  if (!cat) {
    showToast('カテゴリを選んでください')
    return
  }
  if (!desc) {
    showToast('欲しいもの・詳細を入力してください')
    return
  }
  if (!city) {
    showToast('市区町村を選んでください')
    return
  }
  const area = `${NAGANO_PREF} ${city}`.trim()
  const btn = document.getElementById(`${pre}-req-submit`) as HTMLButtonElement | null
  if (btn) {
    btn.disabled = true
    btn.setAttribute('aria-busy', 'true')
  }
  try {
    const supabase = createClient()
    const rowPayload: Record<string, unknown> = {
      user_id: CURRENT_USER_ID,
      category: cat,
      description: desc,
      area,
      希望価格: hopePrice || null,
      希望時期: hopeWhen || null,
    }
    const { error } = await supabase.from('requests').insert(rowPayload)
    if (error) {
      console.error('[meguru] submitRequest:', error.message, error.code)
      showToast('投稿に失敗しました')
      return
    }
    showToast('投稿しました')
    ;(document.getElementById(`${pre}-req-desc`) as HTMLTextAreaElement).value = ''
    ;(document.getElementById(`${pre}-req-price`) as HTMLInputElement).value = ''
    ;(document.getElementById(`${pre}-req-when`) as HTMLInputElement).value = ''
    await loadRequestsFromSupabase()
  } catch (e) {
    console.error('[meguru] submitRequestForm:', e)
    showToast('投稿に失敗しました')
  } finally {
    if (btn) {
      btn.disabled = false
      btn.setAttribute('aria-busy', 'false')
    }
  }
}

async function deleteRequest(id: string, _mode: string) {
  if (!CURRENT_USER_ID) {
    window.location.href = '/login'
    return
  }
  if (!window.confirm('このリクエストを削除しますか？')) return
  try {
    const supabase = createClient()
    const { error } = await supabase.from('requests').delete().eq('id', id)
    if (error) {
      console.error('[meguru] deleteRequest:', error.message)
      showToast('削除に失敗しました')
      return
    }
    showToast('削除しました')
    await loadRequestsFromSupabase()
  } catch (e) {
    console.error('[meguru] deleteRequest:', e)
    showToast('削除に失敗しました')
  }
}

async function offerForRequest(requestId: string, mode: string) {
  if (!CURRENT_USER_ID) {
    window.location.href = '/login'
    return
  }
  const req = meguruRequestsCache.find((r) => r.id === requestId)
  if (!req) {
    showToast('リクエストが見つかりません')
    return
  }
  if (req.user_id === CURRENT_USER_ID) return
  const supabase = createClient()
  try {
    let chatId: string
    const { data: existing } = await supabase
      .from('chats')
      .select('id')
      .eq('request_id', requestId)
      .eq('buyer_id', CURRENT_USER_ID)
      .maybeSingle()
    if (existing?.id) {
      chatId = existing.id
    } else {
      const { error: buyerProfErr } = await supabase
        .from('profiles')
        .upsert({ id: CURRENT_USER_ID }, { onConflict: 'id', ignoreDuplicates: true })
      if (buyerProfErr) {
        console.error('[meguru] offerForRequest profiles:', buyerProfErr.message)
        showToast('チャットを始められませんでした')
        return
      }
      const { data: newChat, error } = await supabase
        .from('chats')
        .insert({
          request_id: requestId,
          item_id: null,
          buyer_id: CURRENT_USER_ID,
          seller_id: req.user_id,
        })
        .select('id')
        .single()
      if (error || !newChat) {
        console.error('[meguru] offerForRequest insert:', error?.message, error?.code)
        showToast('チャットを始められませんでした（DBのマイグレーションを確認してください）')
        return
      }
      chatId = newChat.id as string
    }
    const key = `sb_${chatId}`
    const partnerName = chatPartnerNameFromProfile(req.posterName ?? null)
    const catLine = `求む：${REQUEST_CAT_LABELS[req.category] || req.category}`
    if (!CHATS[key]) {
      CHATS[key] = {
        name: partnerName,
        sub: req.area || NAGANO_PREF,
        avt: '🧑',
        ie: '🙋',
        in_: catLine,
        ip: (req.description || '').length > 48 ? `${(req.description || '').slice(0, 48)}…` : (req.description || ''),
        unread: 0,
        itemId: 0,
        lastAt: Date.now(),
        msgs: [],
        supabaseId: chatId,
        buyerId: CURRENT_USER_ID,
        sellerId: req.user_id,
        requestSupabaseId: requestId,
      }
    } else {
      const row = CHATS[key]
      row.name = partnerName
      row.sub = req.area || NAGANO_PREF
      row.ie = '🙋'
      row.in_ = catLine
      row.ip = (req.description || '').length > 48 ? `${(req.description || '').slice(0, 48)}…` : (req.description || '')
      row.itemId = 0
      row.buyerId = CURRENT_USER_ID
      row.sellerId = req.user_id
      row.requestSupabaseId = requestId
      row.itemSupabaseId = undefined
    }
    await loadMessagesForChat(chatId, key)
    openChat(key, mode)
  } catch (e) {
    console.error('[meguru] offerForRequest:', e)
    showToast('チャットを開けませんでした')
  }
}

/** 失敗時は []（ネットワーク等で fetch が落ちると Supabase クライアントが TypeError を投げることがある） */
async function loadChatsFromSupabase(): Promise<unknown[]> {
  if (!CURRENT_USER_ID) return []
  try {
    const supabase = createClient()
    const { data: chatsData, error } = await supabase
      .from('chats')
      .select(`id, created_at, buyer_id, seller_id, item_id, request_id,
        item:item_id(id, name, price, unit, category, images),
        request:request_id(id, category, description, area)`)
      .or(`buyer_id.eq.${CURRENT_USER_ID},seller_id.eq.${CURRENT_USER_ID}`)
      .order('created_at', { ascending: false })
    if (error) {
      console.error('[meguru] loadChats error:', error.message, error.code)
      wipeSupabaseChatsFromMemoryAndRefresh()
      return []
    }

    Object.keys(CHATS).forEach((k) => { if (k.startsWith('sb_')) delete CHATS[k] })
    if (!chatsData || chatsData.length === 0) {
      console.log('[meguru] loadChats: 0 chats')
      renderChatList('pc')
      renderChatList('mob')
      updateSbChatUnreadBadge()
      refreshNotifListsIfOpen()
      return []
    }

    const otherIds = [
      ...new Set(
        (chatsData as { buyer_id: string; seller_id: string }[]).map((c) =>
          c.buyer_id === CURRENT_USER_ID ? c.seller_id : c.buyer_id
        ).filter(Boolean)
      ),
    ]
    const profById = new Map<string, { name: string | null; area: string | null }>()
    if (otherIds.length > 0) {
      const { data: profRows, error: profErr } = await supabase
        .from('profiles')
        .select('id, name, area')
        .in('id', otherIds)
      if (profErr) {
        console.error('[meguru] loadChats profiles:', profErr.message, profErr.code)
      }
      for (const p of profRows || []) {
        const row = p as { id: string; name: string | null; area: string | null }
        profById.set(row.id, { name: row.name, area: row.area })
      }
    }

    // 全チャットのメッセージを一括取得
    const chatIds = (chatsData as any[]).map((c) => c.id)
    const { data: allMsgs, error: msgsError } = await supabase
      .from('messages')
      .select('id, chat_id, sender_id, text, created_at')
      .in('chat_id', chatIds)
      .order('created_at', { ascending: true })
    if (msgsError) {
      console.error('[meguru] loadChats messages error:', msgsError.message, msgsError.code)
      wipeSupabaseChatsFromMemoryAndRefresh()
      return []
    }

    for (const chat of chatsData as any[]) {
      const key = `sb_${chat.id}`
      const otherId = chat.buyer_id === CURRENT_USER_ID ? chat.seller_id : chat.buyer_id
      const prof = otherId ? profById.get(otherId) : undefined
      const item = chat.item
      const req = chat.request
      const isRequestChat = !!(chat.request_id && !chat.item_id && req?.id)
      const myMsgs = (allMsgs || []).filter((m: any) => m.chat_id === chat.id)
      const lastMsg = myMsgs[myMsgs.length - 1]
      const readMs = getSupabaseChatLastReadMs(chat.id)
      const unread = myMsgs.filter(
        (m: any) => m.sender_id !== CURRENT_USER_ID && new Date(m.created_at).getTime() > readMs
      ).length
      const inMemItem = ITEMS.find(i => (i as Item).supabaseId === item?.id)
      const areaStr = (prof?.area && String(prof.area).trim()) || ''
      if (isRequestChat) {
        const catKey = req.category as string
        const catLine = `求む：${REQUEST_CAT_LABELS[catKey] || catKey}`
        const desc = (req.description as string) || ''
        CHATS[key] = {
          name: chatPartnerNameFromProfile(prof?.name ?? null),
          sub: areaStr || (req.area as string) || NAGANO_PREF,
          avt: '🧑',
          ie: '🙋',
          in_: catLine,
          ip: desc.length > 48 ? `${desc.slice(0, 48)}…` : desc,
          unread,
          itemId: 0,
          lastAt: lastMsg ? new Date(lastMsg.created_at).getTime() : new Date(chat.created_at).getTime(),
          msgs: myMsgs.map((m: any) => {
            const t = new Date(m.created_at)
            return {
              from: m.sender_id === CURRENT_USER_ID ? 'me' : 'them',
              text: m.text,
              time: t.getHours() + ':' + String(t.getMinutes()).padStart(2, '0'),
              id: m.id,
              createdAt: m.created_at,
            }
          }),
          supabaseId: chat.id,
          buyerId: chat.buyer_id,
          sellerId: chat.seller_id,
          requestSupabaseId: req.id as string,
          itemSupabaseId: undefined,
        }
        continue
      }
      CHATS[key] = {
        name: chatPartnerNameFromProfile(prof?.name ?? null),
        sub: areaStr || '駒ヶ根市',
        avt: '🧑',
        ie: EMOJIMAP[item?.category] || '📦',
        in_: item?.name || '商品',
        ip: item?.price ? `${item.price}${item.unit ? ' / ' + item.unit : ''}` : '',
        unread,
        itemId: inMemItem?.id || 0,
        lastAt: lastMsg ? new Date(lastMsg.created_at).getTime() : new Date(chat.created_at).getTime(),
        msgs: myMsgs.map((m: any) => {
          const t = new Date(m.created_at)
          return {
            from: m.sender_id === CURRENT_USER_ID ? 'me' : 'them',
            text: m.text,
            time: t.getHours() + ':' + String(t.getMinutes()).padStart(2, '0'),
            id: m.id,
            createdAt: m.created_at,
          }
        }),
        supabaseId: chat.id,
        buyerId: chat.buyer_id,
        sellerId: chat.seller_id,
        itemSupabaseId: typeof item?.id === 'string' ? item.id : undefined,
      }
    }
    console.log('[meguru] loadChats: loaded', chatsData.length, 'chats from Supabase')
    renderChatList('pc')
    renderChatList('mob')
    updateSbChatUnreadBadge()
    refreshNotifListsIfOpen()
    return chatsData
  } catch (e) {
    console.error('[meguru] loadChatsFromSupabase error:', e)
    wipeSupabaseChatsFromMemoryAndRefresh()
    return []
  }
}

async function openChatWithSupabase(mode: string) {
  if (curItem.mine) { showToast('自分の出品にはチャットできません'); return }
  if (!CURRENT_USER_ID) {
    window.location.href = '/login'
    return
  }
  if (!curItem.supabaseId || !curItem.userId) {
    showToast('この商品からはチャットを始められません')
    return
  }
  const supabase = createClient()
  try {
    let chatId: string
    const { data: existing } = await supabase
      .from('chats').select('id')
      .eq('item_id', curItem.supabaseId)
      .eq('buyer_id', CURRENT_USER_ID)
      .maybeSingle()
    if (existing) {
      chatId = existing.id
    } else {
      // buyer_id は profiles.id を参照するため、自分の行だけ upsert（seller は出品者側で作成済み想定・RLS で buyer が触れない）
      const { error: buyerProfErr } = await supabase
        .from('profiles')
        .upsert({ id: CURRENT_USER_ID }, { onConflict: 'id', ignoreDuplicates: true })
      if (buyerProfErr) {
        console.error('[meguru] profiles upsert (buyer):', buyerProfErr.message, buyerProfErr.code)
        if (mode === 'pc') pcOpenChatFromDetail(); else mOpenChatFromDetail()
        return
      }

      const { data: newChat, error } = await supabase.from('chats')
        .insert({ item_id: curItem.supabaseId, buyer_id: CURRENT_USER_ID, seller_id: curItem.userId })
        .select('id').single()
      if (error || !newChat) {
        console.error('[meguru] create chat error:', error?.message, error?.code)
        if (mode === 'pc') pcOpenChatFromDetail(); else mOpenChatFromDetail()
        return
      }
      chatId = newChat.id
    }
    const key = `sb_${chatId}`
    if (!CHATS[key]) {
      CHATS[key] = {
        name: curItem.seller.replace(/（[^）]*）/g, '').trim(),
        sub: curItem.sloc,
        avt: curItem.savt,
        ie: curItem.emoji,
        in_: curItem.name,
        ip: `${curItem.price}${curItem.unit ? ' ' + curItem.unit : ''}`.trim(),
        unread: 0,
        itemId: curItem.id,
        lastAt: Date.now(),
        msgs: [],
        supabaseId: chatId,
        buyerId: CURRENT_USER_ID,
        sellerId: curItem.userId,
        itemSupabaseId: curItem.supabaseId,
      }
    } else {
      const row = CHATS[key]
      row.name = curItem.seller.replace(/（[^）]*）/g, '').trim()
      row.sub = curItem.sloc
      row.ie = curItem.emoji
      row.in_ = curItem.name
      row.ip = `${curItem.price}${curItem.unit ? ' ' + curItem.unit : ''}`.trim()
      row.itemId = curItem.id
      row.buyerId = row.buyerId ?? CURRENT_USER_ID ?? undefined
      row.sellerId = row.sellerId ?? curItem.userId
      row.itemSupabaseId = curItem.supabaseId
    }
    curItem.chatKey = key
    await loadMessagesForChat(chatId, key)
    openChat(key, mode)
  } catch (e) {
    console.error('[meguru] openChatWithSupabase error:', e)
    if (mode === 'pc') pcOpenChatFromDetail(); else mOpenChatFromDetail()
  }
}

async function loadItemsFromSupabase(userId: string | null): Promise<boolean> {
  try {
    const supabase = createClient()
    /* is_sold は WHERE に含めない（渡し済みフィルター用に全件の is_sold をクライアントで扱う。他ユーザーの sold 行も表示するには RLS で SELECT 可能であること） */
    const { data, error } = await supabase
      .from('items')
      .select('*, profiles(name, area)')
      .order('created_at', { ascending: false })
    if (error) {
      console.error('[meguru] loadItemsFromSupabase Supabase error:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
      })
      return false
    }

    clearMeguruItemsLocalStorage()

    const rows = data ?? []
    if (rows.length === 0) {
      console.warn('[meguru] loadItemsFromSupabase: 0 rows returned from items')
      ITEMS.splice(0, ITEMS.length)
      return true
    }

    const mapped = rows.map((row) => mapSupabaseItem(row, userId))
    ITEMS.splice(0, ITEMS.length, ...mapped)
    console.log('[meguru] loadItemsFromSupabase OK:', ITEMS.length, 'items mapped into ITEMS')
    return true
  } catch (e) {
    console.error('[meguru] loadItemsFromSupabase exception:', e)
    return false
  }
}

/** PC/モバイルの商品グリッドを ITEMS から再計算して描画し直す（renderGrid の明示実行） */
function redrawAllItemGridsForce() {
  const pcBase = pipelineHomePc()
  renderGrid(applySortFilter(pcBase, pcSortMode), 'pc-grid', 'pc')
  _showFilterMsg('pc-grid')
  const mobBase = pipelineHomeMob()
  renderGrid(applySortFilter(mobBase, mobSortMode), 'm-home-grid', 'mob')
  _showFilterMsg('m-home-grid')
  mDoSearch()
}

/** 出品完了後など: 内部フィルターと DOM（並び・チップ）を「すべて / 新着」に揃える */
function resetListingFiltersAfterPost() {
  mobCatFilter = 'all'
  mobSortMode = 'new'
  pcCatFilter = 'all'
  pcSortMode = 'new'
  const mSel = document.querySelector('#ms-home select.sort-sel-mob') as HTMLSelectElement | null
  if (mSel) mSel.value = 'new'
  const pSel = document.querySelector('#pc-pg-listing select.sort-sel') as HTMLSelectElement | null
  if (pSel) pSel.value = 'new'
  const ht = document.getElementById('m-home-title')
  if (ht) ht.textContent = 'あたらしい余りもの'
}

/** 出品完了後など: Supabase から一覧を取り直して PC/モバイルのグリッドを更新してから遷移 */
async function refreshItemGridsFromSupabaseThen(run: () => void) {
  resetListingFiltersAfterPost()
  const loaded = await loadItemsFromSupabase(CURRENT_USER_ID)
  if (!loaded) {
    console.warn('[meguru] refreshItemGridsFromSupabaseThen: load failed, initItemsFromStorage')
    initItemsFromStorage()
  }
  initPcCats()
  initPostLocSelects()
  initMobCats()
  redrawAllItemGridsForce()
  run()
}

/** モバイル出品完了 → 一覧に戻る: 再取得 → グリッド再描画 → ホームへ（mNav でスタックを切り替え） */
async function mobCompleteBackToHomeWithReload() {
  resetListingFiltersAfterPost()

  const loaded = await loadItemsFromSupabase(CURRENT_USER_ID)
  if (!loaded) {
    console.warn('[meguru] mobCompleteBackToHomeWithReload: loadItemsFromSupabase failed')
    initItemsFromStorage()
  }
  initPcCats()
  initPostLocSelects()
  initMobCats()
  redrawAllItemGridsForce()
  mStk = []
  document.querySelectorAll('#mob-root .m-nt').forEach((b) => b.classList.remove('on'))
  document.querySelectorAll('[data-t="ms-home"]').forEach((b) => b.classList.add('on'))
  mNav('ms-home')
}

function pickDate(el: HTMLElement) {
  el.closest('.dsOpts')?.querySelectorAll('.dsOpt').forEach(d=>d.classList.remove('on')); el.classList.add('on'); showToast(el.textContent+'を選択しました')
}
async function sendMsg(mode: string) {
  const inpId=mode==='pc'?'pc-chat-inp':'m-chat-inp'
  const inp=document.getElementById(inpId) as HTMLInputElement
  const txt=inp?.value.trim(); if(!txt) return
  const chat = CHATS[curChatId]
  if (!chat) return
  const t=new Date(); const time=t.getHours()+':'+String(t.getMinutes()).padStart(2,'0')
  chat.msgs.push({ from: 'me', text: txt, time })
  chat.lastAt = Date.now()
  inp.value = ''
  renderMsgs(mode)
  renderChatList('pc')
  renderChatList('mob')
  if (CURRENT_USER_ID && chat.supabaseId) {
    const { data, error } = await createClient().from('messages').insert({
      chat_id: chat.supabaseId, sender_id: CURRENT_USER_ID, text: txt,
    }).select('id, created_at').single()
    if (error) {
      console.error('[meguru] sendMsg error:', error.message, error.code)
      const last = chat.msgs[chat.msgs.length - 1]
      if (last?.from === 'me' && last.text === txt) chat.msgs.pop()
      showToast('送信に失敗しました')
      renderMsgs(mode)
      renderChatList('pc')
      renderChatList('mob')
      return
    }
    const last = chat.msgs[chat.msgs.length - 1]
    if (last?.from === 'me' && last.text === txt) {
      if (data?.id) last.id = data.id
      if (data?.created_at) last.createdAt = data.created_at as string
    }
  } else {
    // デモチャット: モック自動返信
    setTimeout(()=>{
      const r=['ありがとうございます！楽しみにしています😊','わかりました、よろしくお願いします！','はい、大丈夫ですよ〜！','ご連絡ありがとうございます。','それで問題ないです！']
      const t2=new Date(); const rt=t2.getHours()+':'+String(t2.getMinutes()).padStart(2,'0')
      CHATS[curChatId].msgs.push({from:'them',text:r[Math.floor(Math.random()*r.length)],time:rt}); CHATS[curChatId].lastAt=Date.now(); renderMsgs(mode); renderChatList('pc'); renderChatList('mob')
    },1300)
  }
}

/* ── CHAT LIST ── */
function renderChatList(mode: string) {
  const html = getChatListEntries().sort(([, a], [, b]) => b.lastAt - a.lastAt).map(([k, c]) => {
    const lastMsg = c.msgs.filter(m => !!m.text).pop()
    const rawLast = lastMsg
      ? (lastMsg.from === 'me' ? '自分：' + (lastMsg.text ?? '') : (lastMsg.text ?? ''))
      : 'まだメッセージがありません'
    const lastTxt = escChatHtml(rawLast)
    const lastTime = lastMsg?.time || ''
    const badge = c.unread > 0 ? (c.unread > 99 ? '99+' : String(c.unread)) : ''
    const nameEsc = escChatHtml(c.name)
    const inEsc = escChatHtml(c.in_)
    if (mode === 'pc') {
      return `<div class="cl-item${c.unread ? ' unread' : ''}" data-chat="${k}" onclick="openChat('${k}','pc')"><div class="cl-avt">${c.avt}${c.unread ? '<span class="cl-online"></span>' : ''}</div><div class="cl-body"><div class="cl-top"><span class="cl-name">${nameEsc}</span><span class="cl-time">${lastTime}</span></div><p class="cl-msg">${lastTxt}</p><div class="cl-item2"><span class="cl-ie">${c.ie}</span><span class="cl-in">${inEsc}</span></div></div>${badge ? `<span class="cl-badge">${badge}</span>` : ''}</div>`
    }
    return `<div class="m-cl-item${c.unread ? ' unread' : ''}" onclick="openChat('${k}','mob')"><div class="m-cl-avt">${c.avt}${c.unread ? '<span class="m-cl-online"></span>' : ''}</div><div class="m-cl-body"><div class="m-cl-top"><span class="m-cl-name">${nameEsc}</span><span class="m-cl-time">${lastTime}</span></div><p class="m-cl-msg">${lastTxt}</p><div class="cl-item2"><span class="cl-ie">${c.ie}</span><span class="cl-in">${inEsc}</span></div></div>${badge ? `<span class="m-cl-badge">${badge}</span>` : ''}</div>`
  }).join('')
  if (mode==='pc') { const el=document.getElementById('pc-chatlist-items'); if(el) el.innerHTML=html }
  else { const el=document.getElementById('m-chatlist-body'); if(el) el.innerHTML=html }
  updateSbChatUnreadBadge()
}

/* ── NOTIF（メッセージ行は CHATS ＝ Supabase messages と同期） ── */
function notifNidJs(nid: string): string {
  return nid.replace(/\\/g, '\\\\').replace(/'/g, "\\'")
}
function renderPcNotifs() {
  const el = document.getElementById('pc-notif-list')
  if (!el) return
  const rows = getMergedNotifs()
  el.innerHTML = rows
    .map(
      (n) =>
        `<div class="n-item${n.unread ? ' unread' : ''}" onclick="notifTap('${notifNidJs(n.nid)}','pc')"><div class="n-icon ${n.cls}">${n.icon}</div><div style="flex:1"><p class="n-title">${escChatHtml(n.title)}</p><p class="n-sub">${escChatHtml(n.sub)}</p></div><span class="n-time">${escChatHtml(n.time)}</span>${n.unread ? '<div class="n-dot"></div>' : ''}</div>`
    )
    .join('')
}
function renderMobNotifs() {
  const el = document.getElementById('m-notif-body')
  if (!el) return
  const rows = getMergedNotifs()
  el.innerHTML = rows
    .map(
      (n) =>
        `<div class="m-n-item${n.unread ? ' unread' : ''}" onclick="notifTap('${notifNidJs(n.nid)}','mob')"><div class="m-n-icon ${n.cls}">${n.icon}</div><div style="flex:1"><p class="m-n-title">${escChatHtml(n.title)}</p><p class="m-n-sub">${escChatHtml(n.sub)}</p></div><span class="m-n-time">${escChatHtml(n.time)}</span>${n.unread ? '<div class="m-n-dot"></div>' : ''}</div>`
    )
    .join('')
  updateSbChatUnreadBadge()
}
function notifTap(nid: string, mode: string) {
  if (nid.startsWith('sb_')) {
    openChat(nid, mode)
    return
  }
  if (nid === 'static:views') showToast('出品の反応はチャット一覧でご確認ください')
}

/* ── MYPAGE ── */
function updateMypage(mode: string) {
  const mine=ITEMS.filter(i=>i.mine)
  const txDone = TXHISTORY.filter((x) => x.status === '完了').length
  if (mode==='pc') {
    const cnt=document.getElementById('pc-mp-cnt'); if(cnt) cnt.textContent=String(mine.length)
    const sub=document.getElementById('pc-mp-sub'); if(sub) sub.textContent=`${mine.length}件出品中`
    const fs=document.getElementById('pc-fav-sub'); if(fs) fs.textContent=`${favIdSet.size}件`
    const txc = document.getElementById('pc-mp-tx-cnt'); if (txc) txc.textContent = String(txDone)
    const txs = document.getElementById('pc-mp-tx-row-sub'); if (txs) txs.textContent = `完了${txDone}件`
  } else {
    const cnt=document.getElementById('m-mp-cnt'); if(cnt) cnt.textContent=String(mine.length)
    const sub=document.getElementById('m-mp-sub'); if(sub) sub.textContent=`${mine.length}件出品中`
    const fs=document.getElementById('m-fav-sub'); if(fs) fs.textContent=`${favIdSet.size}件`
    const txc = document.getElementById('m-mp-tx-cnt'); if (txc) txc.textContent = String(txDone)
    const txs = document.getElementById('m-mp-tx-row-sub'); if (txs) txs.textContent = `完了${txDone}件`
  }
}

/* ── MY LISTINGS ── */
function renderMyListings(mode: string, title: string, list: Item[]) {
  if (mode==='pc') { const t=document.getElementById('pc-mylistings-title'); if(t) t.textContent=title; renderGrid(list,'pc-mylistings-grid','pc') }
  else { const t=document.getElementById('m-mylistings-title'); if(t) t.textContent=title; renderGrid(list,'m-mylistings-grid','mob') }
}

/* ── TX HISTORY ── */
function renderTxHistory(mode: string) {
  const html=TXHISTORY.map(t=>`<div class="tx-item"><div class="tx-img ${t.emoji==='🍊'?'bk':t.emoji==='🪵'?'bb':'bg'}">${t.emoji}</div><div style="flex:1"><p class="tx-name">${t.name}</p><p class="tx-meta">${t.meta}</p><span class="tx-status ${t.status==='完了'?'ts-c':'ts-p'}">${t.status}</span></div><div style="text-align:right"><p class="tx-price">${t.price}</p><p style="font-size:.62rem;color:var(--mu);margin-top:3px">${t.date}</p></div></div>`).join('')
  if (mode==='pc') { const el=document.getElementById('pc-tx-list'); if(el) el.innerHTML=html }
  else { const el=document.getElementById('m-tx-body'); if(el) el.innerHTML=html }
}

/* ── POST FORM ── */
function renderPhotoGrid(mode: string) {
  const id = mode==='pc' ? 'pc-photo-grid' : 'm-photo-grid'
  const imgs = mode==='pc' ? pcImages : mobImages
  const el = document.getElementById(id)
  if (!el) return
  const fileInputId = mode==='pc' ? 'pc-photo-file' : 'm-photo-file'
  const items = imgs.map((src,i) =>
    `<div class="pf-img-item" draggable="true"
      ondragstart="photoDragStart(event,${i},'${mode}')"
      ondragover="photoDragOver(event,${i},'${mode}')"
      ondragend="photoDragEnd(event,'${mode}')"
      ondrop="photoDrop(event,${i},'${mode}')">
      ${i===0?'<span class="pf-main-badge">メイン</span>':''}
      <img src="${src}" alt="">
      <button class="pf-img-del" onclick="event.stopPropagation();removePhoto('${mode}',${i})">×</button>
    </div>`
  ).join('')
  const add = imgs.length < POST_PHOTO_MAX
    ? `<button class="pf-img-add" onclick="document.getElementById('${fileInputId}').click()"><svg viewBox="0 0 24 24" stroke="currentColor" fill="none" stroke-width="1.8" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg><span>${imgs.length}/${POST_PHOTO_MAX}</span></button>`
    : ''
  el.innerHTML = items + add
}
function compressImage(src: string, maxW = 800, quality = 0.7): Promise<string> {
  return new Promise(resolve => {
    const img = new Image()
    img.onload = () => {
      const scale = img.width > maxW ? maxW / img.width : 1
      const w = Math.round(img.width * scale)
      const h = Math.round(img.height * scale)
      const canvas = document.createElement('canvas')
      canvas.width = w; canvas.height = h
      canvas.getContext('2d')!.drawImage(img, 0, 0, w, h)
      const compressed = canvas.toDataURL('image/jpeg', quality)
      console.log('[meguru] compressed image:', (src.length/1024).toFixed(1), 'KB →', (compressed.length/1024).toFixed(1), 'KB')
      resolve(compressed)
    }
    img.onerror = () => resolve(src)
    img.src = src
  })
}
const POST_PHOTO_MAX = 5
function addPhotos(input: HTMLInputElement, mode: string) {
  const imgs = mode==='pc' ? pcImages : mobImages
  const files = Array.from(input.files||[]).slice(0, POST_PHOTO_MAX - imgs.length)
  input.value = ''
  files.forEach(file => {
    const r = new FileReader()
    r.onload = async e => {
      const raw = (e.target as FileReader).result as string
      const src = await compressImage(raw, 800, 0.7)
      if (mode==='pc') { pcImages.push(src); renderPhotoGrid('pc') }
      else { mobImages.push(src); renderPhotoGrid('mob') }
    }
    r.readAsDataURL(file)
  })
}
function removePhoto(mode: string, idx: number) {
  if (mode==='pc') { pcImages.splice(idx,1); renderPhotoGrid('pc') }
  else { mobImages.splice(idx,1); renderPhotoGrid('mob') }
}
function photoDragStart(e: DragEvent, idx: number, mode: string) {
  if (mode==='pc') pcDragIdx=idx; else mobDragIdx=idx
  if (e.dataTransfer) e.dataTransfer.effectAllowed='move'
  const target = e.currentTarget as HTMLElement
  setTimeout(()=>target?.classList.add('dragging'), 0)
}
function photoDragOver(e: DragEvent, idx: number, mode: string) {
  e.preventDefault()
  if (e.dataTransfer) e.dataTransfer.dropEffect='move'
  const fromIdx = mode==='pc' ? pcDragIdx : mobDragIdx
  if (fromIdx===idx) return
  document.querySelectorAll(`#${mode==='pc'?'pc':'m'}-photo-grid .pf-img-item`).forEach(el=>el.classList.remove('drag-over'))
  ;(e.currentTarget as HTMLElement).classList.add('drag-over')
}
function photoDragEnd(e: DragEvent, mode: string) {
  ;(e.currentTarget as HTMLElement).classList.remove('dragging')
  document.querySelectorAll(`#${mode==='pc'?'pc':'m'}-photo-grid .pf-img-item`).forEach(el=>el.classList.remove('drag-over','dragging'))
}
function photoDrop(e: DragEvent, toIdx: number, mode: string) {
  e.preventDefault()
  const fromIdx = mode==='pc' ? pcDragIdx : mobDragIdx
  if (fromIdx<0 || fromIdx===toIdx) { if(mode==='pc') pcDragIdx=-1; else mobDragIdx=-1; return }
  const imgs = mode==='pc' ? pcImages : mobImages
  const [moved] = imgs.splice(fromIdx,1)
  imgs.splice(toIdx,0,moved)
  if (mode==='pc') pcDragIdx=-1; else mobDragIdx=-1
  renderPhotoGrid(mode)
}
function selectCondition(el: HTMLElement, mode: string) {
  el.closest('.sel-opts')?.querySelectorAll('.sel-opt').forEach(o=>o.classList.remove('on'))
  el.classList.add('on')
  if (mode==='pc') pcCondition=el.dataset.v||''; else mobCondition=el.dataset.v||''
}
function selectPesticide(el: HTMLElement, mode: string) {
  el.closest('.sel-opts')?.querySelectorAll('.sel-opt').forEach(o=>o.classList.remove('on'))
  el.classList.add('on')
  if (mode==='pc') pcPesticide=el.dataset.v||''; else mobPesticide=el.dataset.v||''
}
function selCat(el: HTMLElement, mode: string) {
  el.closest('.fchips')?.querySelectorAll('.fchip').forEach(c=>c.classList.remove('on')); el.classList.add('on')
  if (mode==='pc') pcPostCat=el.dataset.v||'veg'; else mobPostCat=el.dataset.v||'veg'
}

function postingGroup(cat: string): 'produce' | 'wood' | 'land' | 'misc' {
  if (cat === 'wood') return 'wood'
  if (cat === 'land') return 'land'
  if (cat === 'misc') return 'misc'
  return 'produce'
}

function showPostCategoryStep(mode: 'pc' | 'mob') {
  const pre = mode === 'pc' ? 'pc' : 'm'
  const catEl = document.getElementById(`${pre}-post-step-cat`)
  const formEl = document.getElementById(`${pre}-post-step-form`)
  if (catEl) catEl.style.display = ''
  if (formEl) formEl.style.display = 'none'
}

function pickPostCategory(mode: 'pc' | 'mob', cat: string) {
  if (mode === 'pc') pcPostCat = cat
  else mobPostCat = cat
  const pre = mode === 'pc' ? 'pc' : 'm'
  const catEl = document.getElementById(`${pre}-post-step-cat`)
  const formEl = document.getElementById(`${pre}-post-step-form`)
  if (catEl) catEl.style.display = 'none'
  if (formEl) formEl.style.display = ''
  const banner = document.getElementById(`${pre}-post-cat-banner`)
  if (banner) banner.textContent = `選択中：${CATMAP[cat] ?? cat}`
  updatePostFormVisibility(mode)
  initPostLocSelects()
}

function onLandLendChange(mode: 'pc' | 'mob') {
  const pre = mode === 'pc' ? 'pc' : 'm'
  const sel = document.getElementById(`${pre}-post-land-lend`) as HTMLSelectElement | null
  const row = document.getElementById(`${pre}-post-block-land-price`)
  const v = sel?.value || ''
  if (row) row.style.display = v === '有償' ? '' : 'none'
}

function updatePostFormVisibility(mode: 'pc' | 'mob') {
  const pre = mode === 'pc' ? 'pc' : 'm'
  const cat = mode === 'pc' ? pcPostCat : mobPostCat
  const g = postingGroup(cat)
  const vis = (id: string, on: boolean) => {
    const el = document.getElementById(id)
    if (el) el.style.display = on ? '' : 'none'
  }
  const photoLbl = document.getElementById(`${pre}-post-photo-lbl`)
  if (photoLbl) {
    photoLbl.innerHTML =
      g === 'land'
        ? '写真 <small>任意・最大5枚・1枚目がメイン</small>'
        : '商品写真 <em>*</em> <small>最大5枚・1枚目がメイン</small>'
  }
  const nameLbl = document.getElementById(`${pre}-post-name-lbl`)
  if (nameLbl) {
    nameLbl.innerHTML = g === 'land' ? 'タイトル <em>*</em>' : '商品名 <em>*</em>'
  }
  const nameInp = document.getElementById(`${pre}-post-name`) as HTMLInputElement | null
  if (nameInp) {
    nameInp.placeholder =
      g === 'land' ? '例：駒ヶ根市の畑 約100㎡ 無償貸与' : '例：渋柿・規格外きゅうり'
  }
  vis(`${pre}-post-block-produce-qty`, g === 'produce')
  vis(`${pre}-post-block-wood-qty`, g === 'wood')
  vis(`${pre}-post-block-condition`, g === 'produce')
  vis(`${pre}-post-block-pesticide`, g === 'produce' && (cat === 'veg' || cat === 'fruit' || cat === 'rice'))
  const descLbl = document.getElementById(`${pre}-post-desc-lbl`)
  if (descLbl) {
    descLbl.innerHTML =
      g === 'land' ? '詳細説明 <small>自由記述・任意</small>' : '商品の説明 <small>任意</small>'
  }
  vis(`${pre}-post-block-standard-price`, g !== 'land')
  vis(`${pre}-post-block-land-fields`, g === 'land')
  vis(`${pre}-post-block-wood-only`, g === 'wood')
  vis(`${pre}-post-block-handoff`, g !== 'land')
  const locLbl = document.getElementById(`${pre}-post-loc-lbl`)
  if (locLbl) locLbl.textContent = g === 'land' ? '場所（長野県）' : '受け渡し場所（長野県）'
  if (g === 'land') onLandLendChange(mode)
}

function selectWoodDry(el: HTMLElement, mode: string) {
  el.closest('.sel-opts')?.querySelectorAll('.sel-opt').forEach((o) => o.classList.remove('on'))
  el.classList.add('on')
  if (mode === 'pc') pcWoodDry = el.dataset.v || ''
  else mobWoodDry = el.dataset.v || ''
}

function selectWoodTree(el: HTMLElement, mode: string) {
  el.closest('.sel-opts')?.querySelectorAll('.sel-opt').forEach((o) => o.classList.remove('on'))
  el.classList.add('on')
  if (mode === 'pc') pcWoodTree = el.dataset.v || ''
  else mobWoodTree = el.dataset.v || ''
}
function toggleFree(mode: string) {
  if (mode==='pc') {
    pcFreeTog=!pcFreeTog
    document.getElementById('pc-free-row')?.classList.toggle('on',pcFreeTog)
    const p=document.getElementById('pc-post-price') as HTMLInputElement; if(p){ p.disabled=pcFreeTog; if(pcFreeTog) p.value='' }
  } else {
    mobFreeTog=!mobFreeTog
    document.getElementById('m-free-row')?.classList.toggle('on',mobFreeTog)
    const p=document.getElementById('m-post-price') as HTMLInputElement; if(p){ p.disabled=mobFreeTog; if(mobFreeTog) p.value='' }
  }
}
function formatExpiry(expiry?: string): { text: string; color: string } {
  if (!expiry) return { text: '未設定', color: 'var(--mu)' }
  const today = new Date(); today.setHours(0,0,0,0)
  const exp = new Date(expiry); exp.setHours(0,0,0,0)
  const diff = Math.floor((exp.getTime() - today.getTime()) / 86400000)
  if (diff < 0) return { text: '期限切れ', color: '#aaa' }
  if (diff <= 3) return { text: `⚠️ 残り${diff}日`, color: '#e53935' }
  const y = exp.getFullYear(), m = String(exp.getMonth()+1).padStart(2,'0'), d = String(exp.getDate()).padStart(2,'0')
  return { text: `${y}/${m}/${d}`, color: '' }
}

/* ── POST FORM LOCATION ── */
function initPostLocSelects() {
  const currentPref = USER.area.split(' ')[0] || ''
  const currentCity = getUserCity()
  const prefOpts = '<option value="">都道府県（任意）</option>' +
    Object.keys(AREA_DATA).map(p => `<option value="${p}"${p===currentPref?' selected':''}>${p}</option>`).join('')
  ;(['pc','m'] as const).forEach(pre => {
    const prefSel = document.getElementById(`${pre}-post-loc-pref`) as HTMLSelectElement
    if (!prefSel) return
    prefSel.innerHTML = prefOpts
    const citySel = document.getElementById(`${pre}-post-loc-city`) as HTMLSelectElement
    if (citySel && currentPref && AREA_DATA[currentPref]) {
      citySel.innerHTML = '<option value="">市区町村</option>' +
        AREA_DATA[currentPref].map(c => `<option value="${c}"${c===currentCity?' selected':''}>${c}</option>`).join('')
      citySel.disabled = false
    }
    const distSel = document.getElementById(`${pre}-post-loc-dist`) as HTMLSelectElement
    const distListInit = getDistrictsForCity(currentCity)
    if (distSel && distListInit.length > 0) {
      distSel.innerHTML = '<option value="">地区（任意）</option>' +
        distListInit.map(d => `<option value="${d}">${d}</option>`).join('')
      distSel.disabled = false
    }
  })
}

function onPostLocPrefChange(sel: HTMLSelectElement) {
  const pre = sel.id.startsWith('pc') ? 'pc' : 'm'
  const pref = sel.value
  const citySel = document.getElementById(`${pre}-post-loc-city`) as HTMLSelectElement
  const distSel = document.getElementById(`${pre}-post-loc-dist`) as HTMLSelectElement
  if (citySel) {
    if (!pref || !AREA_DATA[pref]) {
      citySel.innerHTML = '<option value="">市区町村</option>'; citySel.disabled = true
    } else {
      citySel.innerHTML = '<option value="">市区町村</option>' +
        AREA_DATA[pref].map(c => `<option value="${c}">${c}</option>`).join('')
      citySel.disabled = false
    }
  }
  if (distSel) { distSel.innerHTML = '<option value="">地区（任意）</option>'; distSel.disabled = true }
}

function onPostLocCityChange(sel: HTMLSelectElement) {
  const pre = sel.id.startsWith('pc') ? 'pc' : 'm'
  const city = sel.value
  const distSel = document.getElementById(`${pre}-post-loc-dist`) as HTMLSelectElement
  if (!distSel) return
  const districts = getDistrictsForCity(city)
  if (districts.length === 0) {
    distSel.innerHTML = '<option value="">地区（任意）</option>'; distSel.disabled = true
  } else {
    distSel.innerHTML = '<option value="">地区（任意）</option>' +
      districts.map(d => `<option value="${d}">${d}</option>`).join('')
    distSel.disabled = false
  }
}

function formatPostedItemPriceLine(it: Item): string {
  const u = (it.unit || '').trim()
  return u ? `${it.price} ${u}`.trim() : it.price
}

/** 出品完了画面に商品名・価格を表示（リングは 🌿 固定・フォーム入力値をそのまま表示） */
function fillPostCompleteSnapshot(title: string, priceLine: string) {
  document.querySelectorAll('.pc-comp-ring, .m-comp-ring').forEach((el) => {
    el.textContent = '🌿'
  })
  const setLine = (id: string, text: string) => {
    const el = document.getElementById(id)
    if (el) el.replaceChildren(document.createTextNode(text))
  }
  setLine('pc-cc-name', title)
  setLine('pc-cc-price', priceLine)
  setLine('m-cc-name', title)
  setLine('m-cc-price', priceLine)
}

function fillPostCompleteUI(it: Item) {
  fillPostCompleteSnapshot(it.name, formatPostedItemPriceLine(it))
}

function setPostSubmitBusy(mode: string, busy: boolean) {
  const id = mode === 'pc' ? 'pc-post-submit-btn' : 'm-post-submit-btn'
  const btn = document.getElementById(id) as HTMLButtonElement | null
  if (!btn) return
  btn.disabled = busy
  btn.setAttribute('aria-busy', busy ? 'true' : 'false')
}

/** insert 後: 画像をバックグラウンドで追記し、一覧を再同期 */
async function syncPostedItemGridsAfterCreate(newItem: Item, pendingImages: string[], rowId: string | undefined) {
  try {
    if (pendingImages.length > 0 && rowId) {
      const supabase = createClient()
      const { error: upErr } = await supabase.from('items').update({ images: pendingImages }).eq('id', rowId)
      if (upErr) console.warn('[meguru] item images update:', upErr.message, upErr.code)
    }
    const loaded = await loadItemsFromSupabase(CURRENT_USER_ID)
    if (!loaded) {
      const fallback: Item = { ...newItem }
      if (rowId) fallback.supabaseId = rowId
      fallback.images = [...pendingImages]
      fallback.imgSrc = pendingImages[0] || ''
      ITEMS.unshift(fallback)
      saveItems()
    } else {
      saveItems()
    }
    initPcCats()
    initMobCats()
    redrawAllItemGridsForce()
  } catch (e) {
    console.error('[meguru] syncPostedItemGridsAfterCreate:', e)
  }
}

/** 出品完了から「続けて出品」：スタック上の完了を外して出品フォームへ */
function mobReturnToPostForm() {
  const cur = document.querySelector('#mob-root .scn.active')
  if (cur) cur.classList.remove('active')
  if (mStk.length && mStk[mStk.length - 1] === 'ms-complete') mStk.pop()
  const post = document.getElementById('ms-post')
  if (post) {
    post.classList.add('active')
    post.querySelector('.m-body')?.scrollTo(0, 0)
  }
  showPostCategoryStep('mob')
}

async function submitPost(mode: string) {
  setPostSubmitBusy(mode, true)
  let releaseBusyInBackground = false
  try {
    if (!CURRENT_USER_ID) {
      window.location.href = '/login'
      return
    }
    const isPC = mode === 'pc'
    const pre = isPC ? 'pc' : 'm'
    const cat = isPC ? pcPostCat : mobPostCat
    const g = postingGroup(cat)

    const name = (document.getElementById(`${pre}-post-name`) as HTMLInputElement)?.value.trim() || ''
    if (!name) {
      showToast(g === 'land' ? 'タイトルを入力してください' : '商品名を入力してください')
      return
    }

    const allImgs = isPC ? [...pcImages] : [...mobImages]
    if (cat !== 'land' && allImgs.length === 0) {
      showToast('商品写真を1枚以上追加してください')
      return
    }

    const locPref = (document.getElementById(`${pre}-post-loc-pref`) as HTMLSelectElement)?.value || NAGANO_PREF
    const locCity = (document.getElementById(`${pre}-post-loc-city`) as HTMLSelectElement)?.value || ''
    const locDist = (document.getElementById(`${pre}-post-loc-dist`) as HTMLSelectElement)?.value || ''
    const loc =
      [locPref, locCity, locDist].filter(Boolean).join(' ') || `${NAGANO_PREF} ${getUserCity()}`.trim()

    const descRaw = (document.getElementById(`${pre}-post-desc`) as HTMLTextAreaElement)?.value?.trim() || ''
    const expiry =
      g === 'land' ? '' : (document.getElementById(`${pre}-post-expiry`) as HTMLInputElement)?.value || ''

    const getCheckedVals = (ids: string[], labels: string[]) =>
      ids.reduce<string[]>((acc, id, i) => {
        if ((document.getElementById(id) as HTMLInputElement | null)?.checked) acc.push(labels[i])
        return acc
      }, [])

    const availDays =
      g === 'land'
        ? []
        : getCheckedVals(
            [`${pre}-day-wd`, `${pre}-day-sat`, `${pre}-day-sun`],
            ['平日', '土曜', '日曜']
          )
    const availTimes =
      g === 'land'
        ? []
        : getCheckedVals(
            [`${pre}-time-am`, `${pre}-time-pm`, `${pre}-time-ev`],
            ['午前', '午後', '夜']
          )

    let unitForDb = ''
    let priceStr = '無料'
    let isFree = true
    let finalDesc = descRaw || '詳細は出品者にお問い合わせください。'
    let conditionVal = ''
    let pesticideVal = ''

    if (g === 'land') {
      const landType = (document.getElementById(`${pre}-post-land-type`) as HTMLSelectElement)?.value || ''
      const landArea = (document.getElementById(`${pre}-post-land-area`) as HTMLInputElement)?.value.trim() || ''
      const landAreaUnit = (document.getElementById(`${pre}-post-land-area-unit`) as HTMLSelectElement)?.value || '㎡'
      const lend = (document.getElementById(`${pre}-post-land-lend`) as HTMLSelectElement)?.value || ''
      const purpose = (document.getElementById(`${pre}-post-land-purpose`) as HTMLSelectElement)?.value || ''
      const period = (document.getElementById(`${pre}-post-land-period`) as HTMLSelectElement)?.value || ''
      const landStatus = (document.getElementById(`${pre}-post-land-status`) as HTMLSelectElement)?.value || ''

      const landMeta: LandMeta = {
        landType,
        area: landArea,
        areaUnit: landAreaUnit,
        lendCondition: lend,
        purpose,
        period,
        landStatus,
      }
      finalDesc = descRaw + LAND_INFO_MARKER + JSON.stringify(landMeta)
      unitForDb = landArea ? `${landArea}${landAreaUnit}` : ''

      if (lend === '有償') {
        const lp = (document.getElementById(`${pre}-post-land-price`) as HTMLInputElement)?.value.trim() || ''
        if (!lp) {
          showToast('有償の場合は価格（円）を入力してください')
          return
        }
        const n = Number(lp)
        if (!Number.isFinite(n) || n < 0) {
          showToast('価格は有効な数値で入力してください')
          return
        }
        priceStr = `¥${n.toLocaleString()}`
        isFree = false
      } else if (lend === '応相談') {
        priceStr = '応相談'
        isFree = false
      } else {
        priceStr = '無料'
        isFree = true
      }
    } else if (g === 'wood') {
      unitForDb = (document.getElementById(`${pre}-post-wood-qty`) as HTMLInputElement)?.value.trim() || ''
      const freeTog = isPC ? pcFreeTog : mobFreeTog
      const price = (document.getElementById(`${pre}-post-price`) as HTMLInputElement)?.value.trim() || ''
      if (!freeTog && !price) {
        showToast('価格を入力するか、「無料で譲る」をオンにしてください')
        return
      }
      if (!freeTog && price) {
        const n = Number(price)
        if (!Number.isFinite(n) || n < 0) {
          showToast('価格は有効な数値で入力してください')
          return
        }
      }
      isFree = freeTog
      priceStr = freeTog ? '無料' : `¥${Number(price).toLocaleString()}`
      const wDry = isPC ? pcWoodDry : mobWoodDry
      const wTree = isPC ? pcWoodTree : mobWoodTree
      const woodNote =
        wDry || wTree
          ? `\n\n【薪・木材】${[wDry ? `乾燥：${wDry}` : '', wTree ? `樹種：${wTree}` : ''].filter(Boolean).join('／')}`
          : ''
      finalDesc = (descRaw || '詳細は出品者にお問い合わせください。') + woodNote
    } else {
      if (g === 'produce') {
        unitForDb = (document.getElementById(`${pre}-post-qty`) as HTMLInputElement)?.value.trim() || ''
      }
      const freeTog = isPC ? pcFreeTog : mobFreeTog
      const price = (document.getElementById(`${pre}-post-price`) as HTMLInputElement)?.value.trim() || ''
      if (!freeTog && !price) {
        showToast('価格を入力するか、「無料で譲る」をオンにしてください')
        return
      }
      if (!freeTog && price) {
        const n = Number(price)
        if (!Number.isFinite(n) || n < 0) {
          showToast('価格は有効な数値で入力してください')
          return
        }
      }
      isFree = freeTog
      priceStr = freeTog ? '無料' : `¥${Number(price).toLocaleString()}`
      finalDesc = descRaw || '詳細は出品者にお問い合わせください。'
      conditionVal = g === 'produce' ? (isPC ? pcCondition : mobCondition) : ''
      pesticideVal =
        g === 'produce' && (cat === 'veg' || cat === 'fruit' || cat === 'rice')
          ? isPC
            ? pcPesticide
            : mobPesticide
          : ''
    }

    if (g === 'produce' && !conditionVal) {
      showToast('商品の状態（良好・普通・傷あり）を選んでください')
      return
    }
    if (g === 'produce' && (cat === 'veg' || cat === 'fruit' || cat === 'rice') && !pesticideVal) {
      showToast('農薬の使用（なし・あり・不明）を選んでください')
      return
    }

    const snapshotTitle = name
    const newItem: Item = {
      id: Date.now(),
      name,
      cat,
      price: priceStr,
      unit: unitForDb ? `/ ${unitForDb}` : '',
      emoji: EMOJIMAP[cat] || '📦',
      bg: BGMAP[cat] || 'by',
      loc: loc || getUserCity() || '駒ヶ根市',
      badge: isFree ? 'free' : 'new',
      seller: USER.name,
      sloc: USER.area,
      savt: '🧑',
      desc: finalDesc,
      mine: true,
      chatKey: '',
      imgSrc: allImgs[0] || '',
      images: allImgs,
      expiry: expiry || undefined,
    }
    const snapshotPriceLine = formatPostedItemPriceLine(newItem)

    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      window.location.href = '/login'
      return
    }

    const { error: profErr } = await supabase
      .from('profiles')
      .upsert({ id: user.id }, { onConflict: 'id', ignoreDuplicates: true })
    if (profErr) console.warn('[meguru] profiles upsert warn:', profErr.message, profErr.code)

    const payload = {
      user_id: user.id,
      name: newItem.name,
      category: newItem.cat,
      price: newItem.price,
      unit: unitForDb,
      is_free: isFree,
      description: newItem.desc,
      location: newItem.loc,
      images: [] as string[],
      condition: conditionVal,
      pesticide: pesticideVal,
      available_days: availDays,
      available_times: availTimes,
      deadline: expiry || null,
      is_sold: false,
    }

    const { data: inserted, error: insErr } = await supabase.from('items').insert(payload).select('id').single()
    if (insErr) {
      console.error('[meguru] Supabase save failed:', insErr.message, insErr.code)
      showToast('出品の保存に失敗しました')
      return
    }
    const rowId = inserted?.id as string | undefined
    newItem.userId = user.id
    if (rowId) newItem.supabaseId = rowId

    const resetPre = isPC ? 'pc' : 'm'
    ;(['name', 'desc', 'price'] as const).forEach((f) => {
      const el = document.getElementById(`${resetPre}-post-${f}`) as HTMLInputElement | HTMLTextAreaElement | null
      if (el) {
        el.value = ''
        ;(el as HTMLInputElement).disabled = false
      }
    })
    const landPriceEl = document.getElementById(`${resetPre}-post-land-price`) as HTMLInputElement | null
    if (landPriceEl) {
      landPriceEl.value = ''
      landPriceEl.disabled = false
    }
    const woodQtyEl = document.getElementById(`${resetPre}-post-wood-qty`) as HTMLInputElement | null
    if (woodQtyEl) woodQtyEl.value = ''
    const produceQtyEl = document.getElementById(`${resetPre}-post-qty`) as HTMLInputElement | null
    if (produceQtyEl) produceQtyEl.value = ''
    const landAreaEl = document.getElementById(`${resetPre}-post-land-area`) as HTMLInputElement | null
    if (landAreaEl) landAreaEl.value = ''

    if (isPC) {
      pcFreeTog = false
      pcImages = []
      pcCondition = ''
      pcPesticide = ''
      pcWoodDry = ''
      pcWoodTree = ''
      document.getElementById('pc-free-row')?.classList.remove('on')
      renderPhotoGrid('pc')
      document.querySelectorAll('#pc-pg-post .sel-opt').forEach((o) => o.classList.remove('on'))
      ;(['pc-post-expiry'] as const).forEach((id) => {
        const el = document.getElementById(id) as HTMLInputElement | null
        if (el) el.value = ''
      })
      ;(['pc-day-wd', 'pc-day-sat', 'pc-day-sun', 'pc-time-am', 'pc-time-pm', 'pc-time-ev'] as const).forEach((id) => {
        const el = document.getElementById(id) as HTMLInputElement | null
        if (el) el.checked = false
      })
    } else {
      mobFreeTog = false
      mobImages = []
      mobCondition = ''
      mobPesticide = ''
      mobWoodDry = ''
      mobWoodTree = ''
      document.getElementById('m-free-row')?.classList.remove('on')
      renderPhotoGrid('mob')
      document.querySelectorAll('#ms-post .sel-opt').forEach((o) => o.classList.remove('on'))
      ;(['m-post-expiry'] as const).forEach((id) => {
        const el = document.getElementById(id) as HTMLInputElement | null
        if (el) el.value = ''
      })
      ;(['m-day-wd', 'm-day-sat', 'm-day-sun', 'm-time-am', 'm-time-pm', 'm-time-ev'] as const).forEach((id) => {
        const el = document.getElementById(id) as HTMLInputElement | null
        if (el) el.checked = false
      })
    }

    const priceInp = document.getElementById(`${resetPre}-post-price`) as HTMLInputElement | null
    if (priceInp) {
      priceInp.disabled = false
      priceInp.value = ''
    }

    ;(
      [
        `${resetPre}-post-land-type`,
        `${resetPre}-post-land-area-unit`,
        `${resetPre}-post-land-lend`,
        `${resetPre}-post-land-purpose`,
        `${resetPre}-post-land-period`,
        `${resetPre}-post-land-status`,
      ] as const
    ).forEach((id) => {
      const sel = document.getElementById(id) as HTMLSelectElement | null
      if (sel) sel.selectedIndex = 0
    })
    onLandLendChange(isPC ? 'pc' : 'mob')

    initPcCats()
    initMobCats()
    showPostCategoryStep(isPC ? 'pc' : 'mob')

    fillPostCompleteSnapshot(snapshotTitle, snapshotPriceLine)
    if (isPC) {
      pcGo('complete')
    } else {
      document.querySelectorAll('#mob-root .m-nt').forEach((b) => b.classList.remove('on'))
      document.querySelectorAll('[data-t="ms-home"]').forEach((b) => b.classList.add('on'))
      mNav('ms-complete')
      document.querySelector('#ms-complete .m-body')?.scrollTo(0, 0)
    }
    requestAnimationFrame(() => fillPostCompleteSnapshot(snapshotTitle, snapshotPriceLine))

    releaseBusyInBackground = true
    void (async () => {
      try {
        await syncPostedItemGridsAfterCreate(newItem, allImgs, rowId)
      } finally {
        setPostSubmitBusy(mode, false)
      }
    })()
  } catch (e) {
    console.error('[meguru] submitPost:', e)
    showToast('出品の保存に失敗しました')
  } finally {
    if (!releaseBusyInBackground) setPostSubmitBusy(mode, false)
  }
}

/* ── DETAIL GALLERY ── */
function getItemImages(it: Item): string[] {
  if (it.images?.length) return it.images
  if (it.imgSrc) return [it.imgSrc]
  return []
}
function renderDetailGallery(it: Item, mode: string) {
  const p = mode==='pc' ? 'pc' : 'm'
  const imgs = getItemImages(it)
  curDetailImgIdx = 0
  const icon = CAT_CARD_ICONS[it.cat] ?? CAT_CARD_ICONS.misc
  const mainEl = document.getElementById(`${p}-det-main`)
  if (mainEl) {
    const imgStyle = mode==='pc'
      ? 'width:100%;height:100%;object-fit:contain;display:block;'
      : 'width:100%;height:auto;max-height:300px;object-fit:contain;display:block;'
    mainEl.innerHTML = imgs.length
      ? `<img src="${imgs[0]}" alt="${it.name}" style="${imgStyle}" />`
      : icon
  }
  if (mode === 'pc') {
    // カウンター
    const counter = document.getElementById('pc-det-counter')
    if (counter) { counter.textContent=`1/${imgs.length||1}`; counter.style.display=imgs.length>1?'':'none' }
    // 前後矢印
    const prev=document.getElementById('pc-det-prev'); const next=document.getElementById('pc-det-next')
    const showArr = imgs.length>1 ? '' : 'none'
    if (prev) prev.style.display=showArr; if (next) next.style.display=showArr
    // サムネイル縦列
    const thumbEl = document.getElementById('pc-det-thumbs')
    if (thumbEl) {
      if (imgs.length > 1) {
        thumbEl.innerHTML = imgs.map((src,i) =>
          `<div class="pc-det-thumb ${i===0?'on':''}" onclick="setDetailImg(${i},'pc')"><img src="${src}" alt="" /></div>`
        ).join('')
      } else if (imgs.length === 1) {
        thumbEl.innerHTML = `<div class="pc-det-thumb on"><img src="${imgs[0]}" alt="" /></div>`
      } else {
        thumbEl.innerHTML = `<div class="pc-det-thumb on">${icon}</div>`
      }
    }
  } else {
    // モバイル
    const arrRow=document.getElementById('m-det-arr-row'); if(arrRow) arrRow.style.display=imgs.length>1?'flex':'none'
    const thumbEl=document.getElementById('m-det-thumbs')
    if (thumbEl) {
      if (imgs.length > 1) {
        thumbEl.style.display='flex'
        thumbEl.innerHTML=imgs.map((src,i)=>`<div class="m-det-thumb ${i===0?'on':''}" onclick="setDetailImg(${i},'mob')"><img src="${src}" alt="" /></div>`).join('')
      } else { thumbEl.style.display='none' }
    }
  }
}
function setDetailImg(idx: number, mode: string) {
  const imgs = getItemImages(curItem)
  if (idx < 0 || idx >= imgs.length) return
  curDetailImgIdx = idx
  const p = mode==='pc' ? 'pc' : 'm'
  const mainEl = document.getElementById(`${p}-det-main`)
  if (mainEl) {
    const imgEl = mainEl.querySelector('img')
    if (imgEl) imgEl.src = imgs[idx]
    else {
      const isPc = mode==='pc'
      const st = isPc ? 'width:100%;height:100%;object-fit:contain;display:block;' : 'width:100%;height:auto;max-height:300px;object-fit:contain;display:block;'
      mainEl.innerHTML = `<img src="${imgs[idx]}" alt="" style="${st}" />`
    }
  }
  document.querySelectorAll(`.${p}-det-thumb`).forEach((t,i) => t.classList.toggle('on', i===idx))
  if (mode === 'pc') {
    const counter = document.getElementById('pc-det-counter')
    if (counter && imgs.length > 1) counter.textContent=`${idx+1}/${imgs.length}`
  }
}
function detImgNav(dir: number, mode: string) {
  const imgs = getItemImages(curItem)
  if (imgs.length <= 1) return
  setDetailImg((curDetailImgIdx + dir + imgs.length) % imgs.length, mode)
}

function profAvatarImgHtml(url: string): string {
  return `<img src="${escAttrUrl(url)}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;" />`
}

function profAvatarInitialHtml(): string {
  return `<span class="prof-avt-initial">${escChatHtml(profileInitialChar(USER.name))}</span>`
}

/* ── GLOBAL USER UPDATE ── */
function updateAllUserRefs() {
  const mpAv =
    USER.avt && !USER.avt.startsWith('blob:')
      ? profAvatarImgHtml(USER.avt)
      : profAvatarInitialHtml()
  // Mypage headers
  ;(['pc-mp-name-el', 'm-mp-name-el'] as const).forEach((id) => {
    const el = document.getElementById(id)
    if (el) el.textContent = mypageHeaderName()
  })
  ;(['pc-mp-area-el', 'm-mp-area-el'] as const).forEach((id) => {
    const el = document.getElementById(id)
    if (el) el.textContent = `${USER.area} · 2025年から利用中`
  })
  ;(['pc-mp-avt-el', 'm-mp-avt-el'] as const).forEach((id) => {
    const el = document.getElementById(id) as HTMLElement | null
    if (el) {
      if (mpAv.startsWith('<img')) {
        el.style.fontSize = '0'
        el.innerHTML = mpAv
      } else {
        el.style.fontSize = ''
        el.innerHTML = mpAv
      }
    }
  })
  // Profile form
  ;(['pc-prof-name', 'm-prof-name'] as const).forEach((id) => {
    const el = document.getElementById(id) as HTMLInputElement | null
    if (el) el.value = USER.name
  })
  const syncNameCnt = (inpId: string, cntId: string) => {
    const inp = document.getElementById(inpId) as HTMLInputElement | null
    const cnt = document.getElementById(cntId)
    if (inp && cnt) cnt.textContent = `${inp.value.length}/${PROF_NAME_MAX}`
  }
  syncNameCnt('pc-prof-name', 'pc-prof-name-cnt')
  syncNameCnt('m-prof-name', 'm-prof-name-cnt')
  const muniVal = municipalityFromArea(USER.area)
  ;(['pc-prof-muni', 'm-prof-muni'] as const).forEach((id) => {
    const el = document.getElementById(id) as HTMLSelectElement | null
    if (el) {
      const list = AREA_DATA['長野県'] || []
      el.value = muniVal && list.includes(muniVal) ? muniVal : ''
    }
  })
  ;(['pc-prof-bio', 'm-prof-bio'] as const).forEach((id) => {
    const el = document.getElementById(id) as HTMLTextAreaElement | null
    if (el) el.value = USER.bio || ''
  })
  const syncBioCnt = (taId: string, cntId: string) => {
    const ta = document.getElementById(taId) as HTMLTextAreaElement | null
    const cnt = document.getElementById(cntId)
    if (ta && cnt) cnt.textContent = `${ta.value.length}/${PROF_BIO_MAX}`
  }
  syncBioCnt('pc-prof-bio', 'pc-prof-bio-cnt')
  syncBioCnt('m-prof-bio', 'm-prof-bio-cnt')

  PROFILE_CATEGORY_OPTIONS.forEach((label, i) => {
    ;([`pc-prof-cat-${i}`, `m-prof-cat-${i}`] as const).forEach((cid) => {
      const el = document.getElementById(cid) as HTMLInputElement | null
      if (el) el.checked = USER.categories.includes(label)
    })
  })
  PROFILE_HANDOFF_TIME_OPTIONS.forEach((label, i) => {
    ;([`pc-prof-time-${i}`, `m-prof-time-${i}`] as const).forEach((tid) => {
      const el = document.getElementById(tid) as HTMLInputElement | null
      if (el) el.checked = USER.availableTimes.includes(label)
    })
  })
  ;(['pc-prof-tagline', 'm-prof-tagline'] as const).forEach((id) => {
    const el = document.getElementById(id) as HTMLInputElement | null
    if (el) el.value = USER.tagline || ''
  })
  const syncTaglineCnt = (inpId: string, cntId: string) => {
    const inp = document.getElementById(inpId) as HTMLInputElement | null
    const cnt = document.getElementById(cntId)
    if (inp && cnt) cnt.textContent = `${inp.value.length}/${PROF_TAGLINE_MAX}`
  }
  syncTaglineCnt('pc-prof-tagline', 'pc-prof-tagline-cnt')
  syncTaglineCnt('m-prof-tagline', 'm-prof-tagline-cnt')

  if (!pendingAvatarFile) {
    const profAv =
      USER.avt && !USER.avt.startsWith('blob:')
        ? profAvatarImgHtml(USER.avt)
        : profAvatarInitialHtml()
    ;(['pc-avt-display', 'm-avt-display'] as const).forEach((id) => {
      const el = document.getElementById(id) as HTMLElement | null
      if (el) {
        if (profAv.startsWith('<img')) {
          el.style.fontSize = '0'
          el.innerHTML = profAv
        } else {
          el.style.fontSize = ''
          el.innerHTML = profAv
        }
      }
    })
  }
  const pcPN = document.querySelector('.pc-prof-name') as HTMLElement | null
  if (pcPN) pcPN.textContent = mypageHeaderName()
  const mPN = document.getElementById('m-prof-preview-name') as HTMLElement | null
  if (mPN) mPN.textContent = mypageHeaderName()
  // Update mine items seller data
  ITEMS.filter((i) => i.mine).forEach((i) => {
    i.seller = mypageHeaderName()
    i.sloc = USER.area
  })
  // Re-render grids so mine cards reflect updated name
  updateAreaDisplay()
  applyPcFilter()
  applyMobFilter()
  // If detail page is showing a mine item, re-populate seller section
  if (curItem.mine) {
    const avtEl = document.getElementById('pc-det-avt') as HTMLElement | null
    if (avtEl) {
      if (mpAv.startsWith('<img')) {
        avtEl.style.fontSize = '0'
        avtEl.innerHTML = mpAv
      } else {
        avtEl.style.fontSize = ''
        avtEl.innerHTML = mpAv
      }
    }
    const snEl = document.getElementById('pc-det-sname')
    if (snEl) snEl.textContent = mypageHeaderName()
    const slEl = document.getElementById('pc-det-sloc')
    if (slEl) slEl.textContent = USER.area
    const mAvt = document.getElementById('m-d-avt') as HTMLElement | null
    if (mAvt) {
      if (mpAv.startsWith('<img')) {
        mAvt.style.fontSize = '0'
        mAvt.innerHTML = mpAv
      } else {
        mAvt.style.fontSize = ''
        mAvt.innerHTML = mpAv
      }
    }
    const mSn = document.getElementById('m-d-sname')
    if (mSn) mSn.textContent = mypageHeaderName()
    const mSl = document.getElementById('m-d-sloc')
    if (mSl) mSl.textContent = USER.area
  }
}

/* ── PROFILE ── */
async function saveProfile() {
  const isPC = window.innerWidth >= 768
  const pf = isPC ? 'pc' : 'm'
  const name = ((document.getElementById(isPC ? 'pc-prof-name' : 'm-prof-name') as HTMLInputElement)?.value || '').trim()
  const muniEl = document.getElementById(isPC ? 'pc-prof-muni' : 'm-prof-muni') as HTMLSelectElement | null
  const municipality = (muniEl?.value || '').trim()
  const bio = ((document.getElementById(isPC ? 'pc-prof-bio' : 'm-prof-bio') as HTMLTextAreaElement)?.value || '').trim()
  const tagline = ((document.getElementById(`${pf}-prof-tagline`) as HTMLInputElement)?.value || '').trim()
  const categories = collectProfileCheckboxList(pf, 'cat', PROFILE_CATEGORY_OPTIONS)
  const handoffTimes = collectProfileCheckboxList(pf, 'time', PROFILE_HANDOFF_TIME_OPTIONS)

  if (!name) {
    showToast('名前を入力してください')
    return
  }
  if (name.length > PROF_NAME_MAX) {
    showToast(`名前は${PROF_NAME_MAX}文字以内で入力してください`)
    return
  }
  if (!municipality) {
    showToast('市区町村を選択してください')
    return
  }
  if (bio.length > PROF_BIO_MAX) {
    showToast(`自己紹介は${PROF_BIO_MAX}文字以内で入力してください`)
    return
  }
  if (tagline.length > PROF_TAGLINE_MAX) {
    showToast(`一言メッセージは${PROF_TAGLINE_MAX}文字以内で入力してください`)
    return
  }

  const area = `${NAGANO_PREF} ${municipality}`
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user?.id) {
    showToast('ログインしてください')
    return
  }

  let nextAvatarUrl = USER.avt && !USER.avt.startsWith('blob:') ? USER.avt : ''
  if (pendingAvatarFile) {
    const up = await uploadUserAvatar(supabase, user.id, pendingAvatarFile)
    if ('error' in up) {
      showToast('画像のアップロードに失敗しました')
      return
    }
    nextAvatarUrl = up.publicUrl
    revokePendingAvatarPreview()
  }

  const { error } = await supabase.from('profiles').upsert(
    {
      id: user.id,
      name,
      area,
      bio: bio || null,
      avatar_url: nextAvatarUrl || null,
      categories: categories.length ? categories : [],
      available_times: handoffTimes.length ? handoffTimes : [],
      tagline: tagline || null,
    },
    { onConflict: 'id' }
  )
  if (error) {
    showToast('保存に失敗しました')
    return
  }

  USER.name = name
  USER.area = area
  USER.bio = bio
  USER.avt = nextAvatarUrl
  USER.categories = [...categories]
  USER.availableTimes = [...handoffTimes]
  USER.tagline = tagline
  try {
    localStorage.setItem(LS_AREA_KEY, USER.area)
  } catch {
    /* ignore */
  }

  updateAllUserRefs()
  showToast('保存しました')
  if (isPC) pcGo('mypage')
  else mBack()
}

/* ══════════════════ COMPONENT ══════════════════ */
export default function Page() {
  const router = useRouter()
  const [userEmail, setUserEmail] = useState<string | null>(null)
  /** init() で一覧の取得・描画が終わるまで true にしない（マウント直後の userEmail 用 effect がダミー ITEMS でグリッドを上書きしないため） */
  const [homeListReady, setHomeListReady] = useState(false)

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  async function handleWithdraw() {
    if (!confirm('本当に退会しますか？この操作は取り消せません')) return
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  useEffect(() => {
    const supabase = createClient()

    // ── window に関数を公開（動的 HTML の onclick から呼ばれる）
    const w = window as Record<string, unknown>
    w.openDetail  = openDetail
    w.selCat      = selCat
    w.mHomeCat    = mHomeCat
    w.mSearchCat  = mSearchCat
    w.openChat              = openChat
    w.openChatWithSupabase  = openChatWithSupabase
    w.notifTap    = notifTap
    w.pickDate    = pickDate
    w.showToast   = showToast
    w.removePhoto     = removePhoto
    w.photoDragStart  = photoDragStart
    w.photoDragOver   = photoDragOver
    w.photoDragEnd    = photoDragEnd
    w.photoDrop       = photoDrop
    w.setDetailImg    = setDetailImg
    w.showAreaModal   = showAreaModal
    w.closeAreaModal  = closeAreaModal
    w.selectAreaPref      = selectAreaPref
    w.selectAreaCity      = selectAreaCity
    w.onSelectAreaPref    = onSelectAreaPref
    w.onSelectAreaCity    = onSelectAreaCity
    w.toggleAreaDistrict  = toggleAreaDistrict
    w.selectAreaApply     = selectAreaApply
    w.onPostLocPrefChange = onPostLocPrefChange
    w.onPostLocCityChange = onPostLocCityChange
    w.submitRequestForm = submitRequestForm
    w.deleteRequest = deleteRequest
    w.offerForRequest = offerForRequest
    w.toggleAreaFilter= toggleAreaFilter
    w.saveProfile = saveProfile
    w.showFavs = showFavs

    // ── 認証状態変化の監視
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      CURRENT_USER_ID = session?.user?.id ?? null
      CACHED_USER_EMAIL = session?.user?.email ?? null
      setUserEmail(CACHED_USER_EMAIL)
      if (!session?.user) {
        unsubscribeMessageRealtime()
        Object.keys(CHATS).forEach((k) => {
          if (k.startsWith('sb_')) delete CHATS[k]
        })
        updateSbChatUnreadBadge()
        refreshNotifListsIfOpen()
        const ok = await loadItemsFromSupabase(null)
        if (!ok) initItemsFromStorage()
        initPcCats()
        initMobCats()
        applyPcFilter()
        applyMobFilter()
        mDoSearch()
      }
      loadChatsFromSupabase().then(() => {
        renderChatList('pc')
        renderChatList('mob')
        refreshNotifListsIfOpen()
        if (session?.user) subscribeGlobalMessages()
      })
    })

    // ── 非同期初期化（未ログインでも一覧は閲覧可）
    async function init() {
      setHomeListReady(false)
      renderSkeletonGrid('pc-grid')
      renderSkeletonGrid('m-home-grid')

      initAreaFromStorage()
      loadFavoritesFromStorage()
      updateAreaDisplay()
      syncSettingsChatNotifCheckboxes()

      const { data: { session } } = await supabase.auth.getSession()

      if (!session?.user) {
        CURRENT_USER_ID = null
        CACHED_USER_EMAIL = null
        setUserEmail(null)
        const loaded = await loadItemsFromSupabase(null)
        if (!loaded) initItemsFromStorage()
        initPcCats()
        applyPcFilter()
        applyMobFilter()
        initPostLocSelects()
        initRequestLocSelects()
        initMobCats()
        void loadRequestsFromSupabase()
        renderChatList('pc')
        renderChatList('mob')
        renderTxHistory('pc')
        renderTxHistory('mob')
        updateSbChatUnreadBadge()
        updateMypage('pc')
        updateMypage('mob')
        mDoSearch()
        setHomeListReady(true)
        return
      }

      const userId = session.user.id
      CURRENT_USER_ID = userId
      CACHED_USER_EMAIL = session.user.email ?? null
      setUserEmail(CACHED_USER_EMAIL)
      ITEMS.splice(0, ITEMS.length)

      const loaded = await loadItemsFromSupabase(userId)
      if (!loaded) initItemsFromStorage()

      initPcCats()
      applyPcFilter()
      applyMobFilter()
      initPostLocSelects()
      initRequestLocSelects()
      initMobCats()
      void loadRequestsFromSupabase()
      setHomeListReady(true)

      loadChatsFromSupabase().then(() => {
        renderChatList('pc')
        renderChatList('mob')
        refreshNotifListsIfOpen()
        subscribeGlobalMessages()
      })
      renderChatList('pc')
      renderChatList('mob')
      renderTxHistory('pc')
      renderTxHistory('mob')
      updateSbChatUnreadBadge()

      await syncUserProfileFromSupabase(userId)
      await refreshMyReviewStatsUI(userId)
      updateMypage('pc')
      updateMypage('mob')
    }

    init()

    return () => {
      subscription.unsubscribe()
      unsubscribeMessageRealtime()
    }
  }, [])

  /* React の再レンダーで innerHTML が消えるため、認証表示のたびにモバイルチップ・グリッドを再生成 */
  useEffect(() => {
    if (!homeListReady) return
    const id = window.setTimeout(() => {
      initPcCats()
      initMobCats()
      initPostLocSelects()
      initRequestLocSelects()
      applyPcFilter()
      applyMobFilter()
      mDoSearch()
    }, 0)
    return () => clearTimeout(id)
  }, [userEmail, homeListReady])

  return (
    <>
      {/* ══ PC ROOT ══ */}
      <div className="pc-root" id="pc-root">

        {/* PC Nav */}
        <nav className="pc-nav">
          <a className="pc-nav-logo" href="#" onClick={(e) => { pcGo('listing'); e.preventDefault() }}>MEGURU</a>
          <div className="pc-nav-tabs">
            <button className="pc-nav-tab on" id="pct-listing" onClick={() => pcGo('listing')}>
              <svg viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
              一覧
            </button>
            <button type="button" className="pc-nav-tab" id="pct-requests" onClick={() => pcGo('requests')}>
              求む
            </button>
            <button className="pc-nav-tab" id="pct-post" onClick={() => pcGo('post')}>
              <svg viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              出品する
            </button>
            <button className="pc-nav-tab" id="pct-notif" onClick={() => pcGo('notif')}>
              <svg viewBox="0 0 24 24"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
              お知らせ
            </button>
            <button className="pc-nav-tab" id="pct-mypage" onClick={() => pcGo('mypage')}>
              <svg viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              マイページ
            </button>
            <a href="/contact" className="pc-nav-tab" id="pct-contact">
              <svg viewBox="0 0 24 24">
                <path d="M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" />
                <polyline points="22 6 12 13 2 6" />
              </svg>
              お問い合わせ
            </a>
          </div>
          <div className="pc-nav-right">
            {userEmail
              ? <button className="pc-btn-o" onClick={handleLogout} style={{display:'flex',alignItems:'center',gap:'6px'}}>
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                  ログアウト
                </button>
              : <button className="pc-btn-o" onClick={() => router.push('/login')}>ログイン</button>
            }
            <button className="pc-btn-f" onClick={() => pcGo('post')}>余りものを出品する →</button>
          </div>
        </nav>

        {/* PC Body */}
        <div className="pc-body">

          {/* Sidebar */}
          <aside className="pc-sidebar">
            <p className="sb-section">カテゴリ</p>
            <button className="sb-item on" id="sb-all"   onClick={(e) => pcSbCat(e.currentTarget, 'all')}>
              <span className="sbi"><svg viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg></span>すべて
            </button>
            <button className="sb-item"    id="sb-fruit" onClick={(e) => pcSbCat(e.currentTarget, 'fruit')}>
              <span className="sbi"><svg viewBox="0 0 24 24"><circle cx="12" cy="14" r="7"/><path d="M12 7V4"/><path d="M9.5 4.5C10.5 3 13.5 3 14.5 4.5"/></svg></span>果物
            </button>
            <button className="sb-item"    id="sb-veg"   onClick={(e) => pcSbCat(e.currentTarget, 'veg')}>
              <span className="sbi"><svg viewBox="0 0 24 24"><path d="M8 9 Q12 7 16 9 Q15 17 12 23 Q9 17 8 9z"/><path d="M9 13 Q12 12 15 13"/><path d="M10 17 Q12 16 14 17"/><path d="M12 9 Q11 4 9 2 Q11 5 12 9"/><path d="M12 9 Q13 4 15 2 Q13 5 12 9"/><path d="M12 9 Q8 5 7 3 Q9 6 12 9"/><path d="M12 9 Q16 5 17 3 Q15 6 12 9"/></svg></span>野菜
            </button>
            <button className="sb-item"    id="sb-rice"  onClick={(e) => pcSbCat(e.currentTarget, 'rice')}>
              <span className="sbi"><svg viewBox="0 0 24 24"><path d="M12 22 Q12 8 18 4 Q20 12 18 22 Q15 18 12 22z" fill="currentColor"/><path d="M12 22 Q12 8 6 4 Q4 12 6 22 Q9 18 12 22z" fill="currentColor" opacity="0.65"/></svg></span>米
            </button>
            <button className="sb-item"    id="sb-wood"  onClick={(e) => pcSbCat(e.currentTarget, 'wood')}>
              <span className="sbi"><svg viewBox="0 0 24 24"><circle cx="7" cy="16" r="5.5"/><circle cx="7" cy="16" r="3"/><circle cx="17" cy="16" r="5.5"/><circle cx="17" cy="16" r="3"/><circle cx="12" cy="8" r="5.5"/><circle cx="12" cy="8" r="3"/></svg></span>薪・木材
            </button>
            <button className="sb-item"    id="sb-herb"  onClick={(e) => pcSbCat(e.currentTarget, 'herb')}>
              <span className="sbi"><svg viewBox="0 0 24 24"><line x1="12" y1="22" x2="12" y2="14"/><path d="M12 16 Q6 14 4 9 Q6 5 10 8 Q11 12 12 16z"/><path d="M12 16 Q18 14 20 9 Q18 5 14 8 Q13 12 12 16z"/><path d="M12 12 Q10 6 12 2 Q14 6 12 12z"/></svg></span>山菜
            </button>
            <button className="sb-item"    id="sb-other" onClick={(e) => pcSbCat(e.currentTarget, 'other')}>
              <span className="sbi"><svg viewBox="0 0 24 24"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/><line x1="12" y1="12" x2="12" y2="17"/><line x1="9.5" y1="14.5" x2="14.5" y2="14.5"/></svg></span>加工品
            </button>
            <button className="sb-item"    id="sb-land" onClick={(e) => pcSbCat(e.currentTarget, 'land')}>
              <span className="sbi"><svg viewBox="0 0 24 24"><path d="M3 21 L9 11 L14 15 L21 6 L21 21 Z" fill="currentColor" opacity="0.2"/><path d="M3 21 L21 21" stroke="currentColor" strokeWidth="1.5" fill="none"/></svg></span>土地・農地
            </button>
            <button className="sb-item"    id="sb-misc" onClick={(e) => pcSbCat(e.currentTarget, 'misc')}>
              <span className="sbi"><svg viewBox="0 0 24 24"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg></span>なんでも
            </button>
            <p className="sb-section">マイページ</p>
            <button type="button" className="sb-item sb-item--chat" onClick={() => pcGo('chatlist')}>
              <span className="sbi"><svg viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg></span>やりとり
              <span className="sb-unread-dot" id="pc-sb-chat-unread" aria-hidden="true" />
            </button>
            <button className="sb-item" onClick={() => pcSubPage('mylistings')}>
              <span className="sbi"><svg viewBox="0 0 24 24"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg></span>出品中のもの
            </button>
            <button className="sb-item" onClick={() => pcSubPage('txhistory')}>
              <span className="sbi"><svg viewBox="0 0 24 24"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg></span>取引履歴
            </button>
            <button className="sb-item" onClick={() => pcSubPage('profedit')}>
              <span className="sbi"><svg viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></span>プロフィール編集
            </button>
          </aside>

          {/* Main */}
          <main className="pc-main" id="pc-main">

            {/* LISTING */}
            <div id="pc-pg-listing">
              <div className="pc-ph">
                <div>
                  <h1 className="pc-ph-title">
                    <button id="pc-area-btn" className="area-name-btn" onClick={showAreaModal}>
                      <span id="pc-area-display">駒ヶ根市</span>
                      <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="6 9 12 15 18 9"/></svg>
                    </button>
                    の余りもの
                  </h1>
                  <div className="area-tog-row" style={{ marginTop: '9px', flexWrap: 'wrap', alignItems: 'center' }}>
                    <button id="pc-area-tog-local" className="area-tog on" onClick={() => toggleAreaFilter('local')}>このエリア</button>
                    <button id="pc-area-tog-all" className="area-tog" onClick={() => toggleAreaFilter('all')}>長野県全体</button>
                    <button type="button" id="pc-sold-tog-listing" className="home-sold-tog on" onClick={() => toggleHomeSoldFilter('listing')}>出品中</button>
                    <button type="button" id="pc-sold-tog-delivered" className="home-sold-tog" onClick={() => toggleHomeSoldFilter('delivered')}>渡し済み</button>
                  </div>
                </div>
                <select className="sort-sel" onChange={(e) => pcSort(e.target.value)}>
                  <option value="new">新着順</option>
                  <option value="free">無料のみ</option>
                  <option value="cheap">価格が安い順</option>
                  <option value="expensive">価格が高い順</option>
                  <option value="soon">受取可能日が近い順</option>
                </select>
              </div>
              <div className="pc-searchbar" style={{maxWidth:'480px'}}>
                <svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><line x1="16.5" y1="16.5" x2="22" y2="22"/></svg>
                <input id="pc-search-inp" placeholder="キーワードで検索…" onChange={pcSearch} autoComplete="off" />
              </div>
              <div className="filter-msg" id="pc-filter-msg" style={{display:'none'}}></div>
              <div className="pc-grid" id="pc-grid"></div>
            </div>

            {/* REQUESTS（欲しいもの） */}
            <div id="pc-pg-requests" style={{ display: 'none' }}>
              <div className="pc-ph">
                <div>
                  <h1 className="pc-ph-title">欲しいものリクエスト</h1>
                  <p className="pc-ph-sub">譲ってほしいものを投稿したり、「提供できます」からチャットで返答できます。</p>
                </div>
              </div>
              <div style={{ maxWidth: '720px', display: 'flex', flexDirection: 'column', gap: '22px', paddingBottom: '36px' }}>
                <section className="req-form-panel">
                  <p style={{ fontSize: '.9rem', fontWeight: 600, color: '#2D5A27', marginBottom: '14px' }}>リクエストを投稿</p>
                  <div className="fg">
                    <label className="lbl">カテゴリ <em>*</em></label>
                    <select className="inp" id="pc-req-cat" style={{ maxWidth: '320px' }} defaultValue="veg">
                      {REQUEST_FORM_CATEGORIES.map((c) => (
                        <option key={c.value} value={c.value}>{c.label}</option>
                      ))}
                    </select>
                  </div>
                  <div className="fg">
                    <label className="lbl">欲しいもの・詳細 <em>*</em></label>
                    <textarea className="txta" id="pc-req-desc" placeholder="品目・数量の目安・状態の希望など" style={{ maxWidth: '560px', minHeight: '100px' }} />
                  </div>
                  <div className="fg">
                    <label className="lbl">エリア <em>*</em></label>
                    <div className="loc-sel-row" style={{ alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                      <span className="req-pref-fixed">{NAGANO_PREF}</span>
                      <select className="inp loc-sel" id="pc-req-loc-city" style={{ flex: '1', minWidth: '200px', maxWidth: '360px' }}>
                        <option value="">市区町村を選択</option>
                      </select>
                    </div>
                  </div>
                  <div className="fg">
                    <label className="lbl">希望価格 <small>任意</small></label>
                    <input className="inp" id="pc-req-price" placeholder="例：無料希望・100円以内など" style={{ maxWidth: '400px' }} />
                  </div>
                  <div className="fg">
                    <label className="lbl">受け取り希望時期 <small>任意</small></label>
                    <input className="inp" id="pc-req-when" placeholder="例：今月中・今週末など" style={{ maxWidth: '400px' }} />
                  </div>
                  <button type="button" className="req-submit-btn" id="pc-req-submit" onClick={() => void submitRequestForm('pc')}>
                    投稿する
                  </button>
                </section>
                <div className="req-filters-row">
                  <label className="req-filter-lbl">
                    カテゴリ
                    <select
                      className="inp req-filter-sel"
                      id="pc-req-filter-cat"
                      defaultValue="all"
                      onChange={(e) => {
                        reqListCatFilter = e.target.value
                        renderRequestLists()
                      }}
                    >
                      <option value="all">すべて</option>
                      {REQUEST_FORM_CATEGORIES.map((c) => (
                        <option key={c.value} value={c.value}>{c.label}</option>
                      ))}
                    </select>
                  </label>
                  <label className="req-filter-lbl">
                    エリア
                    <select
                      className="inp req-filter-sel"
                      id="pc-req-filter-area"
                      defaultValue={REQ_AREA_FILTER_ALL}
                      onChange={(e) => {
                        reqListAreaFilter = e.target.value
                        renderRequestLists()
                      }}
                    >
                      <option value={REQ_AREA_FILTER_ALL}>すべて</option>
                      <option value={REQ_AREA_FILTER_NAGANO}>長野県全域</option>
                      {NAGANO_MUNICIPALITIES.map((m) => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                  </label>
                </div>
                <div id="pc-req-list" className="req-list" />
              </div>
            </div>

            {/* USER PROFILE（出品者・自分） */}
            <div id="pc-pg-userprofile" style={{display:'none'}}>
              <div className="pc-det-topbar" style={{marginBottom:'8px'}}>
                <button type="button" className="pc-det-back" onClick={() => pcGo('listing')} aria-label="戻る">
                  <svg viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg>
                </button>
                <h1 className="pc-ph-title" style={{margin:0,flex:1}}>プロフィール</h1>
              </div>
              <div className="pc-userprofile-head">
                <div className="pc-up-avt" id="pc-up-avt">🧑</div>
                <div className="pc-up-meta">
                  <p className="pc-up-name" id="pc-up-name">—</p>
                  <p className="pc-up-tagline" id="pc-up-tagline" style={{ display: 'none', fontSize: '.84rem', color: '#C4581A', fontWeight: 600, marginTop: '5px', lineHeight: 1.5 }}>
                    —
                  </p>
                  <p className="pc-up-area" id="pc-up-area">—</p>
                  <div className="pc-up-rating" id="pc-up-rating" />
                  <div id="pc-up-cat-wrap" style={{ display: 'none', marginTop: '12px', maxWidth: '560px' }}>
                    <p style={{ fontSize: '.7rem', fontWeight: 700, color: '#2D5A27', letterSpacing: '.08em', marginBottom: '8px' }}>主に出品するもの</p>
                    <div id="pc-up-cat-badges" className="prof-cat-badge-row" />
                  </div>
                  <div id="pc-up-handoff-wrap" style={{ display: 'none', marginTop: '12px', maxWidth: '560px', fontSize: '.84rem', color: 'var(--ink2)', lineHeight: 1.65 }}>
                    <span style={{ fontWeight: 700, color: '#2D5A27', display: 'block', fontSize: '.7rem', letterSpacing: '.08em', marginBottom: '6px' }}>受け渡し可能な時間帯</span>
                    <span id="pc-up-handoff-text" />
                  </div>
                  <p className="pc-up-bio" id="pc-up-bio">—</p>
                </div>
              </div>
              <p className="pc-up-sec">出品中の商品</p>
              <div className="pc-grid" id="pc-up-grid" />
            </div>

            {/* POST */}
            <div id="pc-pg-post" style={{ display: 'none' }}>
              <div className="pc-ph">
                <div>
                  <h1 className="pc-ph-title">余りものを出品する</h1>
                  <p className="pc-ph-sub">まずカテゴリを選び、内容を入力します。</p>
                </div>
              </div>
              <div style={{ maxWidth: '720px', display: 'flex', flexDirection: 'column', gap: '18px', paddingBottom: '28px' }}>
                <div id="pc-post-step-cat">
                  <p style={{ fontSize: '.9rem', fontWeight: 600, color: '#2D5A27', marginBottom: '14px' }}>ステップ1：カテゴリを選択</p>
                  <div className="post-cat-grid">
                    {POST_CATEGORY_PICKS.map((c) => (
                      <button key={c.key} type="button" className="post-cat-card" onClick={() => pickPostCategory('pc', c.key)}>
                        <span className="post-cat-emoji" aria-hidden>{c.emoji}</span>
                        <span className="post-cat-label">{c.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div id="pc-post-step-form" style={{ display: 'none' }}>
                  <button type="button" className="post-cat-back" onClick={() => showPostCategoryStep('pc')}>
                    ← カテゴリ選択に戻る
                  </button>
                  <p id="pc-post-cat-banner" className="post-cat-banner" />
                  <input type="file" id="pc-photo-file" accept="image/*" multiple style={{ display: 'none' }} onChange={(e) => addPhotos(e.currentTarget, 'pc')} />

                  <div className="fg">
                    <label className="lbl" id="pc-post-photo-lbl">
                      商品写真 <em>*</em> <small>最大5枚・1枚目がメイン</small>
                    </label>
                    <div id="pc-photo-grid" className="pf-imgs">
                      <button type="button" className="pf-img-add" onClick={() => (document.getElementById('pc-photo-file') as HTMLInputElement)?.click()}>
                        <svg viewBox="0 0 24 24" stroke="currentColor" fill="none" strokeWidth="1.8" strokeLinecap="round">
                          <line x1="12" y1="5" x2="12" y2="19" />
                          <line x1="5" y1="12" x2="19" y2="12" />
                        </svg>
                        <span>0/5</span>
                      </button>
                    </div>
                  </div>

                  <div className="fg">
                    <label className="lbl" id="pc-post-name-lbl">
                      商品名 <em>*</em>
                    </label>
                    <input className="inp" id="pc-post-name" style={{ maxWidth: '480px' }} />
                  </div>

                  <div className="fg" id="pc-post-block-produce-qty" style={{ display: 'none' }}>
                    <label className="lbl">
                      数量・単位 <small>例：3kg、1袋</small>
                    </label>
                    <input className="inp" id="pc-post-qty" placeholder="例：約3kg、1袋、10本" style={{ maxWidth: '400px' }} />
                  </div>

                  <div className="fg" id="pc-post-block-wood-qty" style={{ display: 'none' }}>
                    <label className="lbl">量の目安</label>
                    <input className="inp" id="pc-post-wood-qty" placeholder="例：軽トラ1台分、袋で5袋" style={{ maxWidth: '400px' }} />
                  </div>

                  <div id="pc-post-block-land-fields" style={{ display: 'none' }}>
                    <div className="fg">
                      <label className="lbl">土地の種類</label>
                      <select className="inp" id="pc-post-land-type" style={{ maxWidth: '320px' }}>
                        <option value="">選択してください</option>
                        <option value="農地">農地</option>
                        <option value="山林">山林</option>
                        <option value="空き地">空き地</option>
                        <option value="その他">その他</option>
                      </select>
                    </div>
                    <div className="fg">
                      <label className="lbl">面積</label>
                      <div className="price-row" style={{ maxWidth: '380px' }}>
                        <input className="inp" id="pc-post-land-area" inputMode="decimal" placeholder="数値" />
                        <select className="inp" id="pc-post-land-area-unit" style={{ maxWidth: '100px' }}>
                          <option value="㎡">㎡</option>
                          <option value="畝">畝</option>
                        </select>
                      </div>
                    </div>
                    <div className="fg">
                      <label className="lbl">貸出条件</label>
                      <select className="inp" id="pc-post-land-lend" style={{ maxWidth: '400px' }} onChange={() => onLandLendChange('pc')}>
                        <option value="">選択してください</option>
                        <option value="無償貸与">無償貸与</option>
                        <option value="有償">有償</option>
                        <option value="管理してくれるなら無料">管理してくれるなら無料</option>
                        <option value="応相談">応相談</option>
                      </select>
                    </div>
                    <div className="fg" id="pc-post-block-land-price" style={{ display: 'none' }}>
                      <label className="lbl">価格（円） <em>*</em></label>
                      <input className="inp" type="number" id="pc-post-land-price" placeholder="金額" style={{ maxWidth: '240px' }} />
                    </div>
                    <div className="fg">
                      <label className="lbl">希望する使用目的</label>
                      <select className="inp" id="pc-post-land-purpose" style={{ maxWidth: '360px' }}>
                        <option value="">選択してください</option>
                        <option value="農業">農業</option>
                        <option value="家庭菜園">家庭菜園</option>
                        <option value="薪割り場">薪割り場</option>
                        <option value="その他">その他</option>
                      </select>
                    </div>
                    <div className="fg">
                      <label className="lbl">契約期間</label>
                      <select className="inp" id="pc-post-land-period" style={{ maxWidth: '320px' }}>
                        <option value="">選択してください</option>
                        <option value="単発">単発</option>
                        <option value="年間">年間</option>
                        <option value="応相談">応相談</option>
                      </select>
                    </div>
                    <div className="fg">
                      <label className="lbl">現在の状態</label>
                      <select className="inp" id="pc-post-land-status" style={{ maxWidth: '360px' }}>
                        <option value="">選択してください</option>
                        <option value="すぐ使える">すぐ使える</option>
                        <option value="整備が必要">整備が必要</option>
                      </select>
                    </div>
                  </div>

                  <div className="fg" id="pc-post-block-condition" style={{ display: 'none' }}>
                    <label className="lbl">商品の状態</label>
                    <div className="sel-opts">
                      {(['良好', '普通', '傷あり'] as const).map((c) => (
                        <button key={c} type="button" className="sel-opt" data-v={c} onClick={(e) => selectCondition(e.currentTarget, 'pc')}>
                          {c}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="fg" id="pc-post-block-wood-only" style={{ display: 'none' }}>
                    <label className="lbl">乾燥済みか</label>
                    <div className="sel-opts">
                      {(['済み', '未乾燥', '不明'] as const).map((c) => (
                        <button key={c} type="button" className="sel-opt" data-v={c} onClick={(e) => selectWoodDry(e.currentTarget, 'pc')}>
                          {c}
                        </button>
                      ))}
                    </div>
                    <label className="lbl" style={{ marginTop: '14px', display: 'block' }}>
                      樹種
                    </label>
                    <div className="sel-opts">
                      {(['スギ', 'ヒノキ', 'ナラ', 'その他', '不明'] as const).map((c) => (
                        <button key={c} type="button" className="sel-opt" data-v={c} onClick={(e) => selectWoodTree(e.currentTarget, 'pc')}>
                          {c}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="fg">
                    <label className="lbl" id="pc-post-desc-lbl">
                      商品の説明 <small>任意</small>
                    </label>
                    <textarea className="txta" id="pc-post-desc" placeholder="状態や受け渡しの希望など" style={{ maxWidth: '560px', minHeight: '88px' }} />
                  </div>

                  <div id="pc-post-block-standard-price">
                    <div className="fg">
                      <label className="lbl">価格</label>
                      <div className="price-row" style={{ maxWidth: '280px' }}>
                        <input className="inp" type="number" id="pc-post-price" placeholder="金額（円）" />
                      </div>
                      <div className="free-row" id="pc-free-row" onClick={() => toggleFree('pc')}>
                        <div className="tog" />
                        <span style={{ fontSize: '.8rem', fontWeight: 500, color: 'var(--ink2)' }}>無料で譲る</span>
                      </div>
                    </div>
                  </div>

                  <hr className="pf-section" />

                  <div className="fg" id="pc-post-block-loc">
                    <label className="lbl" id="pc-post-loc-lbl">
                      受け渡し場所（長野県）
                    </label>
                    <div className="loc-sel-row">
                      <select className="inp loc-sel" id="pc-post-loc-pref" onChange={(e) => onPostLocPrefChange(e.target as HTMLSelectElement)}>
                        <option value="">都道府県</option>
                      </select>
                      <select className="inp loc-sel" id="pc-post-loc-city" disabled onChange={(e) => onPostLocCityChange(e.target as HTMLSelectElement)}>
                        <option value="">市区町村</option>
                      </select>
                      <select className="inp loc-sel" id="pc-post-loc-dist" disabled>
                        <option value="">地区（任意）</option>
                      </select>
                    </div>
                  </div>

                  <div id="pc-post-block-handoff">
                    <hr className="pf-section" />
                    <div className="fg">
                      <label className="lbl">受渡可能曜日・時間帯</label>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <div>
                          <p style={{ fontSize: '.74rem', color: 'var(--mu)', marginBottom: '7px', fontWeight: 500 }}>曜日</p>
                          <div className="pickup-row">
                            <label className="chk-lbl">
                              <input type="checkbox" id="pc-day-wd" />
                              <span>平日</span>
                            </label>
                            <label className="chk-lbl">
                              <input type="checkbox" id="pc-day-sat" />
                              <span>土曜</span>
                            </label>
                            <label className="chk-lbl">
                              <input type="checkbox" id="pc-day-sun" />
                              <span>日曜</span>
                            </label>
                          </div>
                        </div>
                        <div>
                          <p style={{ fontSize: '.74rem', color: 'var(--mu)', marginBottom: '7px', fontWeight: 500 }}>時間帯</p>
                          <div className="pickup-row">
                            <label className="chk-lbl">
                              <input type="checkbox" id="pc-time-am" />
                              <span>午前</span>
                            </label>
                            <label className="chk-lbl">
                              <input type="checkbox" id="pc-time-pm" />
                              <span>午後</span>
                            </label>
                            <label className="chk-lbl">
                              <input type="checkbox" id="pc-time-ev" />
                              <span>夜</span>
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="fg">
                      <label className="lbl">受け取り期限 <small>任意</small></label>
                      <input className="inp" type="date" id="pc-post-expiry" style={{ maxWidth: '200px' }} />
                    </div>
                  </div>

                  <div className="fg" id="pc-post-block-pesticide" style={{ display: 'none' }}>
                    <label className="lbl">農薬の使用 <em>*</em></label>
                    <div className="sel-opts">
                      {(['なし', 'あり', '不明'] as const).map((p) => (
                        <button key={p} type="button" className="sel-opt" data-v={p} onClick={(e) => selectPesticide(e.currentTarget, 'pc')}>
                          {p}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="hint">
                    <span style={{ fontSize: '.95rem', flexShrink: 0 }}>💡</span>
                    <p>詳しい住所はチャットで直接決めてOKです。掲示板には住所は出ません。</p>
                  </div>
                  <div className="pc-post-actions">
                    <button type="button" className="pc-cancel" onClick={() => pcGo('listing')}>
                      キャンセル
                    </button>
                    <button type="button" id="pc-post-submit-btn" className="pc-submit" onClick={() => void submitPost('pc')}>
                      出品する →
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* DETAIL */}
            <div id="pc-pg-detail" style={{display:'none'}}>
              <div className="pc-det-page">
                {/* 戻るバー */}
                <div className="pc-det-topbar">
                  <button className="pc-det-back" onClick={() => pcGo('listing')}>
                    <svg viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg>
                    一覧に戻る
                  </button>
                </div>
                <div className="pc-det-layout">
                  {/* 左60%：画像ギャラリー */}
                  <div className="pc-det-gallery">
                    {/* サムネイル縦列 */}
                    <div id="pc-det-thumbs" className="pc-det-thumbs-col"></div>
                    {/* メイン画像 */}
                    <div className="pc-det-main-wrap">
                      <div className="pc-det-main" id="pc-det-main"></div>
                      <span className="pc-det-counter" id="pc-det-counter" style={{display:'none'}}>1/1</span>
                      <button id="pc-det-prev" className="pc-det-prev" style={{display:'none'}} onClick={() => detImgNav(-1,'pc')}>
                        <svg viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg>
                      </button>
                      <button id="pc-det-next" className="pc-det-next" style={{display:'none'}} onClick={() => detImgNav(1,'pc')}>
                        <svg viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg>
                      </button>
                    </div>
                  </div>
                  {/* 右40%：商品情報 */}
                  <div className="pc-det-info">
                    {/* 出品者 */}
                    <div className="pc-det-seller">
                      <div className="pc-det-avt-wrap" id="pc-det-avt">👴</div>
                      <div className="pc-det-seller-texts">
                        <p className="pc-det-seller-name" id="pc-det-sname">—</p>
                        <p className="pc-det-seller-sub" id="pc-det-sloc">—</p>
                      </div>
                      <div className="pc-det-rating" id="pc-det-rating">
                        <svg viewBox="0 0 24 24" width="12" height="12" fill="var(--k)"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                        —
                      </div>
                    </div>
                    <hr className="pc-det-divider" />
                    {/* 商品名・価格 */}
                    <h2 className="pc-det-title" id="pc-det-title">—</h2>
                    <p className="pc-det-price" id="pc-det-price">—</p>
                    {/* SOLDバナー */}
                    <div className="det-sold-banner" id="pc-det-sold-banner" style={{display:'none'}}>
                      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#888" strokeWidth="2" strokeLinecap="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                      <span>この商品は取引済みです</span>
                    </div>
                    {/* アクション */}
                    <div className="pc-det-actions">
                      <button type="button" className="pc-det-fav" id="pc-det-fav-btn" onClick={() => toggleFav('pc')}>🤍</button>
                      <div className="pc-det-actions-cta">
                        <button type="button" className="pc-det-chat pc-det-want" id="pc-det-chat-btn" onClick={() => void openChatWithSupabase('pc')}>
                          <svg viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                          連絡する
                        </button>
                        <button type="button" className="pc-det-line-share" id="pc-det-line-share-btn" onClick={() => openLineShareForCurrentItem()}>
                          <svg className="pc-det-line-share-ico" viewBox="0 0 24 24" aria-hidden>
                            <path
                              fill="currentColor"
                              d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.022.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.63.629M24 10.314C24 4.943 18.615.572 12 .572 5.385.572 0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.816-4.011 9.315-6.52 1.351-1.365 2.709-3.027 2.709-5.128"
                            />
                          </svg>
                          LINEでシェア
                        </button>
                      </div>
                    </div>
                    <hr className="pc-det-divider" />
                    {/* 説明 */}
                    <p className="pc-det-sect-lbl">商品の説明</p>
                    <p className="pc-det-desc-box" id="pc-det-desc">—</p>
                    <div id="pc-det-land-wrap" style={{ display: 'none' }}>
                      <div id="pc-det-land-box" />
                    </div>
                    {/* 商品情報テーブル */}
                    <p className="pc-det-sect-lbl">商品情報</p>
                    <table className="pc-det-table">
                      <tbody>
                        <tr><td>カテゴリ</td><td id="pc-det-cat-tag">—</td></tr>
                        <tr><td>場所</td><td id="pc-det-loc">—</td></tr>
                        <tr><td>受け渡し</td><td>手渡し（駒ヶ根市内）</td></tr>
                        <tr><td>受取期限</td><td id="pc-det-expiry" style={{color:'var(--mu)'}}>未設定</td></tr>
                        <tr><td>出品日</td><td id="pc-det-date">本日</td></tr>
                      </tbody>
                    </table>
                    {/* 注意書き */}
                    <p className="pc-det-fee-note">
                      詳しい住所はチャットで直接確認します<br />
                      手数料は取引成立時のみ 12%
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* COMPLETE */}
            <div id="pc-pg-complete" style={{display:'none'}}>
              <div className="pc-complete">
                <div className="pc-comp-ring">🌿</div>
                <h2 className="pc-comp-title">出品しました！</h2>
                <p className="pc-comp-sub">地域の掲示板に載りました。欲しい人からチャットが届いたらお知らせします。</p>
                <div className="pc-comp-card" style={{ textAlign: 'center', padding: '20px 18px' }}>
                  <p id="pc-cc-name" style={{ fontSize: '1.05rem', fontWeight: 700, color: '#2D5A27', margin: '0 0 10px', lineHeight: 1.45 }}>
                    —
                  </p>
                  <p id="pc-cc-price" style={{ fontSize: '0.98rem', fontWeight: 600, color: '#2D5A27', margin: 0 }}>
                    —
                  </p>
                </div>
                <div className="pc-comp-btns">
                  <button
                    type="button"
                    className="pc-comp-main"
                    style={{ background: '#2D5A27' }}
                    onClick={() => {
                      void refreshItemGridsFromSupabaseThen(() => pcGo('listing'))
                    }}
                  >
                    一覧に戻る
                  </button>
                  <button
                    type="button"
                    className="pc-comp-sec"
                    style={{ borderColor: '#2D5A27', color: '#2D5A27' }}
                    onClick={() => pcGo('post')}
                  >
                    続けて出品する
                  </button>
                </div>
              </div>
            </div>

            {/* NOTIF */}
            <div id="pc-pg-notif" style={{display:'none'}}>
              <div className="pc-ph"><div><h1 className="pc-ph-title">お知らせ</h1></div></div>
              <div id="pc-notif-list"></div>
            </div>

            {/* MYPAGE */}
            <div id="pc-pg-mypage" style={{display:'none'}}>
              <div className="pc-mypage-header">
                <div className="pc-mp-avt" id="pc-mp-avt-el" style={{overflow:'hidden'}}>🧑</div>
                <div>
                  <p className="pc-mp-name" id="pc-mp-name-el">田中 拓也</p>
                  <p className="pc-mp-sub" id="pc-mp-area-el">駒ヶ根市赤穂 · 2025年から利用中</p>
                </div>
                <div className="pc-mp-stats">
                  <div className="pc-mp-stat"><div className="pc-mp-stat-num" id="pc-mp-cnt">—</div><div className="pc-mp-stat-lbl">出品中</div></div>
                  <div className="pc-mp-stat"><div className="pc-mp-stat-num" id="pc-mp-tx-cnt">0</div><div className="pc-mp-stat-lbl">取引完了</div></div>
                  <div className="pc-mp-stat"><div className="pc-mp-stat-num" id="pc-mp-rev-num">—</div><div className="pc-mp-stat-lbl" id="pc-mp-rev-lbl">評価</div></div>
                </div>
              </div>
              <p className="pc-mp-sec">出品・取引</p>
              <div className="pc-mp-grid">
                <div className="pc-mp-row" onClick={() => pcSubPage('mylistings')}><div className="pc-mp-row-icon mp-ico-wrap" aria-hidden><svg viewBox="0 0 24 24"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg></div><div><div className="pc-mp-row-label">出品中のもの</div><div className="pc-mp-row-sub" id="pc-mp-sub">—</div></div><span className="pc-mp-arrow">›</span></div>
                <div className="pc-mp-row" onClick={() => pcSubPage('txhistory')}><div className="pc-mp-row-icon mp-ico-wrap" aria-hidden><svg viewBox="0 0 24 24"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="8" y1="16" x2="14" y2="16"/></svg></div><div><div className="pc-mp-row-label">取引履歴</div><div className="pc-mp-row-sub" id="pc-mp-tx-row-sub">完了0件</div></div><span className="pc-mp-arrow">›</span></div>
                <div className="pc-mp-row" onClick={() => void showFavs('pc')}><div className="pc-mp-row-icon mp-ico-wrap" aria-hidden><svg viewBox="0 0 24 24" className="mp-ico-fill"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg></div><div><div className="pc-mp-row-label">お気に入り</div><div className="pc-mp-row-sub" id="pc-fav-sub">0件</div></div><span className="pc-mp-arrow">›</span></div>
                <div className="pc-mp-row" onClick={() => { if (!CURRENT_USER_ID) { showToast('ログインしてください'); return } void openPublicProfile(CURRENT_USER_ID, 'pc') }}><div className="pc-mp-row-icon mp-ico-wrap" aria-hidden><svg viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg></div><div><div className="pc-mp-row-label">プロフィールを表示</div><div className="pc-mp-row-sub">公開ページ（出品・評価）</div></div><span className="pc-mp-arrow">›</span></div>
                <div className="pc-mp-row" onClick={() => pcSubPage('profedit')}><div className="pc-mp-row-icon mp-ico-wrap" aria-hidden><svg viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></div><div className="pc-mp-row-label">プロフィール編集</div><span className="pc-mp-arrow">›</span></div>
                <div className="pc-mp-row" onClick={() => pcSubPage('settings')}><div className="pc-mp-row-icon mp-ico-wrap" aria-hidden><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg></div><div className="pc-mp-row-label">設定</div><span className="pc-mp-arrow">›</span></div>
                <div className="pc-mp-row" onClick={() => pcSubPage('about')}><div className="pc-mp-row-icon mp-ico-wrap" aria-hidden><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg></div><div className="pc-mp-row-label">MEGURUについて</div><span className="pc-mp-arrow">›</span></div>
                <div className="pc-mp-row" onClick={handleLogout} style={{color:'#c0392b'}}><div className="pc-mp-row-icon" style={{background:'#fef2f2',borderRadius:'10px',padding:'8px',display:'flex',alignItems:'center',justifyContent:'center'}}><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#c0392b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg></div><div className="pc-mp-row-label" style={{color:'#c0392b'}}>ログアウト</div><span className="pc-mp-arrow" style={{color:'#c0392b'}}>›</span></div>
              </div>
            </div>

            {/* CHAT LIST */}
            <div id="pc-pg-chatlist" style={{display:'none'}}>
              <div className="pc-ph"><div><h1 className="pc-ph-title">やりとり</h1><p className="pc-ph-sub">相手を選んでチャットを開始</p></div></div>
              <div id="pc-chatlist-items" style={{border:'1px solid var(--bd)',borderRadius:'12px',overflow:'hidden',maxWidth:'600px'}}></div>
            </div>

            {/* MY LISTINGS */}
            <div id="pc-pg-mylistings" style={{display:'none'}}>
              <div className="pc-ph"><div><h1 className="pc-ph-title" id="pc-mylistings-title">出品中のもの</h1></div></div>
              <div className="pc-grid" id="pc-mylistings-grid"></div>
            </div>

            {/* TX HISTORY */}
            <div id="pc-pg-txhistory" style={{display:'none'}}>
              <div className="pc-ph"><div><h1 className="pc-ph-title">取引履歴</h1></div></div>
              <div id="pc-tx-list" style={{maxWidth:'620px'}}></div>
            </div>

            {/* PROF EDIT */}
            <div id="pc-pg-profedit" style={{display:'none'}}>
              <div className="pc-ph">
                <div><h1 className="pc-ph-title" style={{fontFamily:'var(--sf)'}}>プロフィール編集</h1></div>
                <button type="button" style={{padding:'9px 22px',background:'#C4581A',color:'#fff',border:'none',borderRadius:'8px',fontSize:'.84rem',fontWeight:700,letterSpacing:'.06em'}} onClick={() => void saveProfile()}>保存する</button>
              </div>
              <div className="pc-prof-head">
                <div className="pc-prof-avt" style={{cursor:'pointer'}} onClick={() => (document.getElementById('pc-avatar-file') as HTMLInputElement)?.click()}>
                  <span id="pc-avt-display" style={{display:'flex',alignItems:'center',justifyContent:'center',width:'100%',height:'100%',fontSize:'2rem',borderRadius:'50%',overflow:'hidden',background:'#F8F4EE'}} />
                  <div className="pc-prof-edit">
                    <svg viewBox="0 0 24 24" width="12" height="12" stroke="#fff" fill="none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
                  </div>
                  <input type="file" id="pc-avatar-file" accept="image/*" style={{display:'none'}} onChange={(e) => {
                    const file = e.currentTarget.files?.[0]
                    if (!file) return
                    applyAvatarFileToPreviews(file)
                  }} />
                </div>
                <p className="pc-prof-name" style={{fontFamily:'var(--sf)'}}>—</p>
                <p id="pc-prof-rev-summary" style={{display:'none',fontSize:'.78rem',color:'var(--k)',fontWeight:600,marginTop:'6px',letterSpacing:'.02em'}} />
              </div>
              <div className="pc-form-full">
                <div className="fg">
                  <label className="lbl">名前（必須）</label>
                  <input className="inp" id="pc-prof-name" maxLength={PROF_NAME_MAX} style={{maxWidth:'360px'}} onInput={(e) => { const c = document.getElementById('pc-prof-name-cnt'); if (c) c.textContent = `${e.currentTarget.value.length}/${PROF_NAME_MAX}` }} />
                  <p className="prof-fg-hint" id="pc-prof-name-cnt">0/{PROF_NAME_MAX}</p>
                </div>
                <div className="fg">
                  <label className="lbl">お住まいのエリア（必須）</label>
                  <div className="prof-pref-fixed" style={{marginBottom:'8px'}}>{NAGANO_PREF}</div>
                  <select className="inp prof-muni-sel" id="pc-prof-muni" defaultValue="">
                    <option value="">市区町村を選択</option>
                    {(AREA_DATA['長野県'] || []).map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>
                <div className="fg">
                  <label className="lbl">自己紹介 <small>任意</small></label>
                  <textarea className="txta" id="pc-prof-bio" maxLength={PROF_BIO_MAX} style={{maxWidth:'560px',minHeight:'88px'}} onInput={(e) => { const c = document.getElementById('pc-prof-bio-cnt'); if (c) c.textContent = `${e.currentTarget.value.length}/${PROF_BIO_MAX}` }} />
                  <p className="prof-fg-hint" id="pc-prof-bio-cnt">0/{PROF_BIO_MAX}</p>
                </div>
                <div className="fg">
                  <label className="lbl">主に出品するもの <small>任意</small></label>
                  <div className="pickup-row" style={{ flexWrap: 'wrap', maxWidth: '560px' }}>
                    {PROFILE_CATEGORY_OPTIONS.map((label, i) => (
                      <label key={label} className="chk-lbl">
                        <input type="checkbox" id={`pc-prof-cat-${i}`} />
                        <span>{label}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div className="fg">
                  <label className="lbl">受け渡し可能な時間帯 <small>任意</small></label>
                  <div className="pickup-row" style={{ flexWrap: 'wrap', maxWidth: '560px' }}>
                    {PROFILE_HANDOFF_TIME_OPTIONS.map((label, i) => (
                      <label key={label} className="chk-lbl">
                        <input type="checkbox" id={`pc-prof-time-${i}`} />
                        <span>{label}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div className="fg">
                  <label className="lbl">一言メッセージ <small>任意・{PROF_TAGLINE_MAX}文字まで</small></label>
                  <input
                    className="inp"
                    id="pc-prof-tagline"
                    maxLength={PROF_TAGLINE_MAX}
                    style={{ maxWidth: '560px' }}
                    placeholder="例：駒ヶ根の柿が自慢です！"
                    onInput={(e) => {
                      const c = document.getElementById('pc-prof-tagline-cnt')
                      if (c) c.textContent = `${e.currentTarget.value.length}/${PROF_TAGLINE_MAX}`
                    }}
                  />
                  <p className="prof-fg-hint" id="pc-prof-tagline-cnt">0/{PROF_TAGLINE_MAX}</p>
                </div>
              </div>
            </div>

            {/* SETTINGS */}
            <div id="pc-pg-settings" style={{ display: 'none' }}>
              <div className="pc-ph">
                <div><h1 className="pc-ph-title" style={{ fontFamily: 'var(--sf)' }}>設定</h1></div>
              </div>
              <div style={{ maxWidth: '560px', padding: '0 4px 28px' }}>
                <p className="pc-mp-sec" style={{ marginTop: 0 }}>エリア設定</p>
                <div style={{ background: '#fff', border: '1px solid var(--bd)', borderRadius: '12px', padding: '14px 16px', marginBottom: '18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: '.8rem', fontWeight: 600, color: 'var(--ink)' }}>現在のエリア（市区町村）</div>
                    <div id="pc-settings-area-val" style={{ fontSize: '.9rem', marginTop: '6px', color: '#2D5A27', fontWeight: 600, fontFamily: 'var(--sf)' }}>—</div>
                  </div>
                  <button type="button" onClick={showAreaModal} style={{ padding: '9px 18px', background: '#C4581A', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '.82rem', fontWeight: 700, whiteSpace: 'nowrap', fontFamily: 'var(--sf)' }}>エリアを変更</button>
                </div>

                <p className="pc-mp-sec">アカウント</p>
                <div style={{ background: '#fff', border: '1px solid var(--bd)', borderRadius: '12px', overflow: 'hidden', marginBottom: '18px' }}>
                  <button type="button" onClick={() => router.push('/reset-password')} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', border: 'none', background: '#fff', cursor: 'pointer', textAlign: 'left', fontSize: '.88rem', fontWeight: 600, color: '#2D5A27', fontFamily: 'var(--sf)' }}>
                    パスワードを変更する
                    <span style={{ color: 'var(--mu)', fontWeight: 400 }}>›</span>
                  </button>
                  <div style={{ borderTop: '1px solid var(--bd)', padding: '14px 16px' }}>
                    <div style={{ fontSize: '.72rem', fontWeight: 600, color: 'var(--mu)', marginBottom: '6px' }}>登録中のメールアドレス</div>
                    <div id="pc-settings-email" style={{ fontSize: '.86rem', color: 'var(--ink)', wordBreak: 'break-all', fontFamily: 'var(--sf)' }}>—</div>
                  </div>
                </div>

                <p className="pc-mp-sec">通知設定</p>
                <div style={{ background: '#fff', border: '1px solid var(--bd)', borderRadius: '12px', padding: '14px 16px', marginBottom: '18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                  <span style={{ fontSize: '.88rem', fontWeight: 600, color: 'var(--ink)', fontFamily: 'var(--sf)' }}>チャットの通知</span>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '.78rem', color: 'var(--mu)', fontFamily: 'var(--sf)' }}>
                    <span id="pc-settings-chat-notif-lbl">オン</span>
                    <input id="pc-settings-chat-notif" type="checkbox" onChange={(e) => onSettingsChatNotifUserToggle(e.target.checked)} style={{ width: '18px', height: '18px', accentColor: '#2D5A27' }} />
                  </label>
                </div>

                <p className="pc-mp-sec">退会</p>
                <p style={{ fontSize: '.76rem', color: 'var(--mu)', margin: '0 0 10px', lineHeight: 1.5, fontFamily: 'var(--sf)' }}>アカウントの削除は管理者が対応します。ここではログアウトのみ行い、データは保持されます。</p>
                <button type="button" onClick={() => void handleWithdraw()} style={{ width: '100%', padding: '12px 16px', background: '#b91c1c', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '.88rem', fontWeight: 700, fontFamily: 'var(--sf)' }}>退会する</button>
              </div>
            </div>

            {/* MEGURUについて */}
            <div id="pc-pg-about" style={{ display: 'none', background: '#F8F4EE', minHeight: '100%' }}>
              <div className="pc-ph">
                <div><h1 className="pc-ph-title" style={{ fontFamily: 'var(--sf)' }}>MEGURUについて</h1></div>
              </div>
              <div style={{ maxWidth: '600px', padding: '0 4px 36px' }}>
                <p className="pc-mp-sec" style={{ marginTop: 0 }}>MEGURUとは</p>
                <div style={{ background: '#fff', border: '1px solid var(--bd)', borderRadius: '12px', padding: '16px 18px', marginBottom: '20px', fontSize: '.88rem', lineHeight: 1.75, color: 'var(--ink)', fontFamily: 'var(--sf)' }}>
                  <p style={{ margin: 0 }}>農村の余りものを、地域の人と人がつなぐプラットフォームです。</p>
                  <p style={{ margin: '12px 0 0' }}>規格外野菜・庭の柿・採りきれない山菜・作りすぎた加工品を、</p>
                  <p style={{ margin: '4px 0 0' }}>捨てずに地域の誰かに届ける仕組みです。</p>
                </div>

                <p className="pc-mp-sec">使い方</p>
                <div style={{ background: '#fff', border: '1px solid var(--bd)', borderRadius: '12px', padding: '16px 18px', marginBottom: '20px', fontSize: '.88rem', lineHeight: 1.7, color: 'var(--ink)', fontFamily: 'var(--sf)' }}>
                  <ul style={{ margin: 0, paddingLeft: '1.15em' }}>
                    <li style={{ marginBottom: '10px' }}><strong style={{ color: '#2D5A27' }}>出品する</strong>：写真と説明を入れて余りものを登録</li>
                    <li style={{ marginBottom: '10px' }}><strong style={{ color: '#2D5A27' }}>受け取る</strong>：欲しいものを見つけてチャットで連絡</li>
                    <li style={{ marginBottom: 0 }}><strong style={{ color: '#2D5A27' }}>受け渡し</strong>：直接会って手渡し、または都合のいい方法で</li>
                  </ul>
                </div>

                <p className="pc-mp-sec">手数料について</p>
                <div style={{ background: '#fff', border: '1px solid var(--bd)', borderRadius: '12px', padding: '16px 18px', marginBottom: '20px', fontSize: '.88rem', lineHeight: 1.75, color: 'var(--ink)', fontFamily: 'var(--sf)' }}>
                  <p style={{ margin: 0 }}>現在は無料期間中です。将来的に取引成立時のみ12%の手数料が発生します。</p>
                </div>

                <p className="pc-mp-sec">運営情報</p>
                <div style={{ background: '#fff', border: '1px solid var(--bd)', borderRadius: '12px', padding: '16px 18px', marginBottom: '20px', fontSize: '.88rem', lineHeight: 1.65, color: 'var(--ink)', fontFamily: 'var(--sf)' }}>
                  <p style={{ margin: '0 0 8px' }}>サービス名：MEGURU（めぐる）</p>
                  <p style={{ margin: '0 0 8px' }}>運営：片桐和真</p>
                  <p style={{ margin: '0 0 8px' }}>所在地：長野県駒ヶ根市</p>
                  <p style={{ margin: 0 }}>
                    お問い合わせ：
                    <a href="/contact" style={{ color: '#C4581A', fontWeight: 600, marginLeft: '4px' }}>お問い合わせフォーム</a>
                  </p>
                </div>

                <p className="pc-mp-sec">リンク</p>
                <div style={{ background: '#fff', border: '1px solid var(--bd)', borderRadius: '12px', overflow: 'hidden', marginBottom: '8px' }}>
                  <button type="button" onClick={() => router.push('/terms')} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', border: 'none', background: '#fff', cursor: 'pointer', textAlign: 'left', fontSize: '.88rem', fontWeight: 600, color: '#2D5A27', fontFamily: 'var(--sf)' }}>
                    利用規約・プライバシーポリシー
                    <span style={{ color: 'var(--mu)', fontWeight: 400 }}>›</span>
                  </button>
                  <div style={{ borderTop: '1px solid var(--bd)' }}>
                    <button type="button" onClick={() => router.push('/contact')} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', border: 'none', background: '#fff', cursor: 'pointer', textAlign: 'left', fontSize: '.88rem', fontWeight: 600, color: '#2D5A27', fontFamily: 'var(--sf)' }}>
                      お問い合わせ
                      <span style={{ color: 'var(--mu)', fontWeight: 400 }}>›</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

          </main>

          {/* Right Panel */}
          <aside className="pc-panel hidden" id="pc-panel">
            {/* Detail */}
            <div id="pc-panel-detail" style={{display:'flex',flexDirection:'column',height:'100%',overflow:'hidden'}}>
              <div className="panel-scroll" id="pc-panel-scroll">
                <div className="panel-hero bk" id="pc-d-hero">🍊<div className="p-badges"><span className="p-badge pb-k" id="pc-d-b">NEW</span><span className="p-badge pb-g">手渡しOK</span></div></div>
                <div className="panel-body">
                  <div className="p-seller"><div className="p-avt" id="pc-d-avt">👴</div><div><p className="p-sname" id="pc-d-sname">鈴木さん</p><p className="p-sloc" id="pc-d-sloc">駒ヶ根市赤穂</p></div><span className="p-rating" id="pc-d-rating">★ —</span></div>
                  <h2 className="p-title" id="pc-d-title">渋柿 約15kg</h2>
                  <p className="p-price" id="pc-d-price">¥500 <small>/ 箱</small></p>
                  <div className="p-tags"><span className="p-tag" id="pc-d-cat">🍊 果物</span><span className="p-tag">手渡しOK</span><span className="p-tag">今週末受取可</span></div>
                  <p className="p-desc" id="pc-d-desc">—</p>
                  <div className="p-meta">
                    <div className="p-mi"><div className="p-ml">数量</div><div className="p-mv" id="pc-d-qty">—</div></div>
                    <div className="p-mi"><div className="p-ml">受け渡し</div><div className="p-mv">手渡し（駒ヶ根）</div></div>
                    <div className="p-mi"><div className="p-ml">対応日</div><div className="p-mv">今週末〜</div></div>
                    <div className="p-mi"><div className="p-ml">出品日</div><div className="p-mv" id="pc-d-date">本日</div></div>
                  </div>
                </div>
              </div>
              <div className="panel-actions">
                <button className="p-fav" id="pc-fav-btn" onClick={() => toggleFav('pc')}>🤍</button>
                <button type="button" className="p-chat p-want" onClick={() => void openChatWithSupabase('pc')}><svg viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>連絡する</button>
              </div>
            </div>
            {/* Chat Panel */}
            <div id="pc-panel-chat" style={{display:'none',flexDirection:'column',height:'100%',overflow:'hidden'}}>
              <div className="pc-chat-head">
                <button className="pc-back" onClick={pcBackToDetail}><svg viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg></button>
                <div className="p-avt" id="pc-chat-avt">👴</div>
                <div style={{marginLeft:'7px',flex:1}}>
                  <p style={{fontFamily:'var(--sf)',fontSize:'.88rem',fontWeight:600,color:'var(--ink)'}} id="pc-chat-pname">鈴木さん</p>
                  <p style={{fontSize:'.63rem',color:'var(--mu)'}} id="pc-chat-psub">駒ヶ根市赤穂</p>
                </div>
              </div>
              <div className="pc-chat-strip">
                <div className="cis-wrap" style={{ flex: 1, minWidth: 0, alignItems: 'center', gap: '8px' }}>
                  <span className="cis-e" id="pc-cis-e">🍊</span>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <p className="cis-n" id="pc-cis-n" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>渋柿</p>
                    <p className="cis-p" id="pc-cis-p">¥500</p>
                  </div>
                  <span
                    id="pc-chat-cis-sold"
                    style={{
                      display: 'none',
                      flexShrink: 0,
                      padding: '4px 10px',
                      borderRadius: '6px',
                      background: '#2D5A27',
                      color: '#fff',
                      fontSize: '.65rem',
                      fontWeight: 800,
                      letterSpacing: '.12em',
                      fontFamily: 'var(--sf)',
                    }}
                  >
                    SOLD
                  </span>
                </div>
              </div>
              <div className="pc-chat-msgs" id="pc-chat-msgs"></div>
              <div id="pc-chat-trade-wrap" style={{ display: 'none', flexShrink: 0, width: '100%' }}>
                <div
                  id="pc-chat-sold-badge"
                  style={{
                    display: 'none',
                    margin: '0 14px 10px',
                    padding: '12px 14px',
                    background: '#F8F4EE',
                    border: '1px solid var(--bd)',
                    borderRadius: '10px',
                    fontSize: '.88rem',
                    fontWeight: 700,
                    color: '#2D5A27',
                    textAlign: 'center',
                    fontFamily: 'var(--sf)',
                  }}
                >
                  取引済み
                </div>
                <div className="pc-trade-bar" id="pc-trade-bar-btn-wrap">
                  <button
                    type="button"
                    id="pc-complete-btn"
                    className="trade-bar-btn active"
                    style={{ background: '#2D5A27', color: '#fff', width: '100%', fontFamily: 'var(--sf)' }}
                    onClick={() => requestCompleteTradePc()}
                  >
                    取引完了にする
                  </button>
                </div>
              </div>
              <div className="pc-chat-input">
                <input className="pc-chat-inp" id="pc-chat-inp" placeholder="メッセージを入力…" onKeyDown={(e) => { if(e.key==='Enter') sendMsg('pc') }} />
                <button className="pc-send" onClick={() => sendMsg('pc')}><svg viewBox="0 0 24 24"><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></svg></button>
              </div>
            </div>
          </aside>

        </div>
      </div>

      {/* ══ MOBILE ROOT ══ */}
      <div className="mob-root" id="mob-root" style={{position:'relative'}}>

        {/* HOME */}
        <div className="scn active" id="ms-home">
          <div className="m-tbar">
            <span className="m-logo">MEGURU</span>
            <div style={{marginLeft:'auto',display:'flex',gap:'7px'}}>
              <button className="ibtn" id="m-bell" onClick={() => mNav('ms-notif')} title="通知"><svg viewBox="0 0 24 24"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg><span className="ndot m-bell-ndot" style={{display:'none'}} aria-hidden /></button>
            </div>
          </div>
          <div className="m-body">
            <div className="m-banner">
              <div style={{display:'flex',alignItems:'center',gap:'4px',marginBottom:'6px'}}>
                <button id="m-area-btn" className="area-name-btn-mob" onClick={showAreaModal}>
                  <span id="m-area-display">駒ヶ根市</span>
                  <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="6 9 12 15 18 9"/></svg>
                </button>
                <span style={{fontSize:'.82rem',fontWeight:500,color:'rgba(255,255,255,.75)'}}>の余りもの</span>
              </div>
              <div className="area-tog-row-mob" style={{ flexWrap: 'wrap', alignItems: 'center' }}>
                <button id="m-area-tog-local" className="area-tog-mob on" onClick={() => toggleAreaFilter('local')}>このエリア</button>
                <button id="m-area-tog-all" className="area-tog-mob" onClick={() => toggleAreaFilter('all')}>長野県全体</button>
                <button type="button" id="m-sold-tog-listing" className="home-sold-tog-mob on" onClick={() => toggleHomeSoldFilter('listing')}>出品中</button>
                <button type="button" id="m-sold-tog-delivered" className="home-sold-tog-mob" onClick={() => toggleHomeSoldFilter('delivered')}>渡し済み</button>
              </div>
            </div>
            <div className="m-sbar-wrap"><div className="m-sbar-inner" onClick={() => mNav('ms-search')}><svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><line x1="16.5" y1="16.5" x2="22" y2="22"/></svg><input placeholder="柿、薪、野菜など…" readOnly style={{cursor:'pointer'}} /></div></div>
            <div className="m-chips" id="m-home-cats"></div>
            <div style={{display:'flex',alignItems:'center',padding:'3px 12px 9px',gap:'8px'}}>
              <p className="m-sec-title" id="m-home-title" style={{margin:0,padding:0,flex:1}}>あたらしい余りもの</p>
              <select className="sort-sel sort-sel-mob" onChange={(e) => mobSort(e.target.value)}>
                <option value="new">新着順</option>
                <option value="free">無料のみ</option>
                <option value="cheap">安い順</option>
                <option value="expensive">高い順</option>
                <option value="soon">受取が近い順</option>
              </select>
            </div>
            <div className="filter-msg" id="m-filter-msg" style={{display:'none'}}></div>
            <div className="m-grid" id="m-home-grid"></div>
          </div>
          <div className="m-nav" id="mn-home">
            <button className="m-nt on" data-t="ms-home" onClick={(e) => mTab(e.currentTarget)}><svg viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg><span>ホーム</span></button>
            <button className="m-nt" data-t="ms-search" onClick={(e) => mTab(e.currentTarget)}><svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><line x1="16.5" y1="16.5" x2="22" y2="22"/></svg><span>さがす</span></button>
            <button type="button" className="m-nt" data-t="ms-requests" onClick={(e) => mTab(e.currentTarget)}><svg viewBox="0 0 24 24" aria-hidden><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="1.7"/><path d="M8 10h8M8 14h5" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/></svg><span>求む</span></button>
            <button className="m-nt-post" onClick={() => mNav('ms-post')}><div className="fab"><svg viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg></div><span>出品</span></button>
            <button type="button" className="m-nt" data-t="ms-chatlist" onClick={(e) => mTab(e.currentTarget)}>
              <span className="m-nt-ico-wrap">
                <svg viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                <span className="m-nav-chat-unread-dot" aria-hidden="true" />
              </span>
              <span>チャット</span>
            </button>
            <button className="m-nt" data-t="ms-mypage" onClick={(e) => mTab(e.currentTarget)}><svg viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg><span>マイページ</span></button>
          </div>
        </div>

        {/* SEARCH（ホームと同構造: トップバー → スクロール本体 → ボトムナビ） */}
        <div className="scn" id="ms-search">
          <div className="m-tbar">
            <span className="m-logo">MEGURU</span>
            <div style={{ marginLeft: 'auto', display: 'flex', gap: '7px' }}>
              <button type="button" className="ibtn" onClick={() => (document.getElementById('m-search-inp') as HTMLInputElement | null)?.focus()} title="検索">
                <svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><line x1="16.5" y1="16.5" x2="22" y2="22"/></svg>
              </button>
              <button type="button" className="ibtn" onClick={() => mNav('ms-notif')} title="通知">
                <svg viewBox="0 0 24 24"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
                <span className="ndot m-bell-ndot" style={{ display: 'none' }} aria-hidden />
              </button>
            </div>
          </div>
          <div className="m-body">
            <div className="m-sbar-wrap">
              <div className="m-sfull" style={{ width: '100%', boxSizing: 'border-box' }}>
                <svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><line x1="16.5" y1="16.5" x2="22" y2="22"/></svg>
                <input id="m-search-inp" placeholder="柿、薪、野菜、地名など…" onChange={mDoSearch} autoComplete="off" />
              </div>
            </div>
            <div className="m-chips" id="m-search-cats"></div>
            <div style={{ display: 'flex', alignItems: 'center', padding: '3px 12px 9px', gap: '8px' }}>
              <p className="m-sec-title" id="m-search-title" style={{ margin: 0, padding: 0, flex: 1 }}>すべての余りもの</p>
              <select id="m-search-sort-sel" className="sort-sel sort-sel-mob" defaultValue="new" onChange={(e) => mobSort(e.target.value)}>
                <option value="new">新着順</option>
                <option value="free">無料のみ</option>
                <option value="cheap">安い順</option>
                <option value="expensive">高い順</option>
                <option value="soon">受取が近い順</option>
              </select>
            </div>
            <div className="filter-msg" id="m-search-filter-msg" style={{ display: 'none' }}></div>
            <div className="m-grid" id="m-search-grid"></div>
          </div>
          <div className="m-nav" id="mn-search">
            <button className="m-nt" data-t="ms-home" onClick={(e) => mTab(e.currentTarget)}><svg viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg><span>ホーム</span></button>
            <button className="m-nt on" data-t="ms-search" onClick={(e) => mTab(e.currentTarget)}><svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><line x1="16.5" y1="16.5" x2="22" y2="22"/></svg><span>さがす</span></button>
            <button type="button" className="m-nt" data-t="ms-requests" onClick={(e) => mTab(e.currentTarget)}><svg viewBox="0 0 24 24" aria-hidden><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="1.7"/><path d="M8 10h8M8 14h5" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/></svg><span>求む</span></button>
            <button className="m-nt-post" onClick={() => mNav('ms-post')}><div className="fab"><svg viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg></div><span>出品</span></button>
            <button type="button" className="m-nt" data-t="ms-chatlist" onClick={(e) => mTab(e.currentTarget)}>
              <span className="m-nt-ico-wrap">
                <svg viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                <span className="m-nav-chat-unread-dot" aria-hidden="true" />
              </span>
              <span>チャット</span>
            </button>
            <button className="m-nt" data-t="ms-mypage" onClick={(e) => mTab(e.currentTarget)}><svg viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg><span>マイページ</span></button>
          </div>
        </div>

        {/* REQUESTS（欲しいもの） */}
        <div className="scn" id="ms-requests">
          <div className="m-tbar">
            <span className="m-logo">MEGURU</span>
            <span style={{ fontSize: '.72rem', color: 'var(--mu)', fontWeight: 500, marginLeft: '6px' }}>欲しいもの</span>
          </div>
          <div className="m-body" style={{ paddingBottom: '20px' }}>
            <section className="req-form-panel req-form-panel--mob" style={{ margin: '0 12px 16px' }}>
              <p style={{ fontSize: '.82rem', fontWeight: 600, color: '#2D5A27', marginBottom: '12px' }}>リクエストを投稿</p>
              <div className="fg">
                <label className="lbl">カテゴリ <em>*</em></label>
                <select className="inp" id="m-req-cat" defaultValue="veg">
                  {REQUEST_FORM_CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </div>
              <div className="fg">
                <label className="lbl">欲しいもの・詳細 <em>*</em></label>
                <textarea className="txta" id="m-req-desc" placeholder="品目・数量の目安など" style={{ minHeight: '88px' }} />
              </div>
              <div className="fg">
                <label className="lbl">エリア <em>*</em></label>
                <div className="req-mob-loc-row">
                  <span className="req-pref-fixed">{NAGANO_PREF}</span>
                  <select className="inp loc-sel" id="m-req-loc-city" style={{ width: '100%', marginTop: '8px' }}>
                    <option value="">市区町村を選択</option>
                  </select>
                </div>
              </div>
              <div className="fg">
                <label className="lbl">希望価格 <small>任意</small></label>
                <input className="inp" id="m-req-price" placeholder="例：無料希望など" />
              </div>
              <div className="fg">
                <label className="lbl">受け取り希望時期 <small>任意</small></label>
                <input className="inp" id="m-req-when" placeholder="例：今月中など" />
              </div>
              <button type="button" className="req-submit-btn" id="m-req-submit" onClick={() => void submitRequestForm('mob')}>
                投稿する
              </button>
            </section>
            <div className="req-filters-row req-filters-row--mob" style={{ padding: '0 12px 12px' }}>
              <label className="req-filter-lbl">
                カテゴリ
                <select
                  className="inp req-filter-sel"
                  id="m-req-filter-cat"
                  defaultValue="all"
                  onChange={(e) => {
                    reqListCatFilter = e.target.value
                    renderRequestLists()
                  }}
                >
                  <option value="all">すべて</option>
                  {REQUEST_FORM_CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </label>
              <label className="req-filter-lbl">
                エリア
                <select
                  className="inp req-filter-sel"
                  id="m-req-filter-area"
                  defaultValue={REQ_AREA_FILTER_ALL}
                  onChange={(e) => {
                    reqListAreaFilter = e.target.value
                    renderRequestLists()
                  }}
                >
                  <option value={REQ_AREA_FILTER_ALL}>すべて</option>
                  <option value={REQ_AREA_FILTER_NAGANO}>長野県全域</option>
                  {NAGANO_MUNICIPALITIES.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </label>
            </div>
            <div id="m-req-list" className="req-list" style={{ padding: '0 12px 24px' }} />
          </div>
          <div className="m-nav" id="mn-requests">
            <button className="m-nt" data-t="ms-home" onClick={(e) => mTab(e.currentTarget)}><svg viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg><span>ホーム</span></button>
            <button className="m-nt" data-t="ms-search" onClick={(e) => mTab(e.currentTarget)}><svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><line x1="16.5" y1="16.5" x2="22" y2="22"/></svg><span>さがす</span></button>
            <button type="button" className="m-nt on" data-t="ms-requests" onClick={(e) => mTab(e.currentTarget)}><svg viewBox="0 0 24 24" aria-hidden><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="1.7"/><path d="M8 10h8M8 14h5" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/></svg><span>求む</span></button>
            <button className="m-nt-post" onClick={() => mNav('ms-post')}><div className="fab"><svg viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg></div><span>出品</span></button>
            <button type="button" className="m-nt" data-t="ms-chatlist" onClick={(e) => mTab(e.currentTarget)}>
              <span className="m-nt-ico-wrap">
                <svg viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                <span className="m-nav-chat-unread-dot" aria-hidden="true" />
              </span>
              <span>チャット</span>
            </button>
            <button className="m-nt" data-t="ms-mypage" onClick={(e) => mTab(e.currentTarget)}><svg viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg><span>マイページ</span></button>
          </div>
        </div>

        {/* NOTIF */}
        <div className="scn" id="ms-notif">
          <div className="m-tbar"><button className="m-back" onClick={mBack}><svg viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg></button><span className="m-title">お知らせ</span></div>
          <div className="m-body" id="m-notif-body"></div>
        </div>

        {/* MYPAGE */}
        <div className="scn" id="ms-mypage">
          <div className="m-body">
            <div className="m-mp-head">
              <div className="m-mp-avt" id="m-mp-avt-el" style={{overflow:'hidden'}}>🧑</div>
              <p className="m-mp-name" id="m-mp-name-el">田中 拓也</p>
              <p className="m-mp-sub" id="m-mp-area-el">駒ヶ根市赤穂 · 2025年から利用中</p>
            </div>
            <div className="m-mp-stats">
              <div className="m-mp-stat"><div className="m-mp-stat-n" id="m-mp-cnt">—</div><div className="m-mp-stat-l">出品中</div></div>
              <div className="m-mp-stat"><div className="m-mp-stat-n" id="m-mp-tx-cnt">0</div><div className="m-mp-stat-l">取引完了</div></div>
              <div className="m-mp-stat"><div className="m-mp-stat-n" id="m-mp-rev-num">—</div><div className="m-mp-stat-l" id="m-mp-rev-lbl">評価</div></div>
            </div>
            <p className="m-mp-sec">出品・取引</p>
            <div style={{background:'#fff'}}>
              <div className="m-mp-row" onClick={() => { mNav('ms-mylistings'); renderMyListings('mob', '出品中のもの', ITEMS.filter((i) => i.mine)) }}><div className="m-mp-row-icon mp-ico-wrap" aria-hidden><svg viewBox="0 0 24 24"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg></div><div style={{flex:1}}><div className="m-mp-row-label">出品中のもの</div><div className="m-mp-row-sub" id="m-mp-sub">—</div></div><span className="m-mp-arrow">›</span></div>
              <div className="m-mp-row" onClick={() => mNav('ms-txhistory')}><div className="m-mp-row-icon mp-ico-wrap" aria-hidden><svg viewBox="0 0 24 24"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="8" y1="16" x2="14" y2="16"/></svg></div><div style={{flex:1}}><div className="m-mp-row-label">取引履歴</div><div className="m-mp-row-sub" id="m-mp-tx-row-sub">完了0件</div></div><span className="m-mp-arrow">›</span></div>
              <div className="m-mp-row" onClick={() => void showFavs('mob')}><div className="m-mp-row-icon mp-ico-wrap" aria-hidden><svg viewBox="0 0 24 24" className="mp-ico-fill"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg></div><div style={{flex:1}}><div className="m-mp-row-label">お気に入り</div><div className="m-mp-row-sub" id="m-fav-sub">0件</div></div><span className="m-mp-arrow">›</span></div>
              <div className="m-mp-row" onClick={() => { if (!CURRENT_USER_ID) { showToast('ログインしてください'); return } void openPublicProfile(CURRENT_USER_ID, 'mob') }}><div className="m-mp-row-icon mp-ico-wrap" aria-hidden><svg viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg></div><div style={{flex:1}}><div className="m-mp-row-label">プロフィールを表示</div><div className="m-mp-row-sub">公開ページ</div></div><span className="m-mp-arrow">›</span></div>
            </div>
            <p className="m-mp-sec">アカウント</p>
            <div style={{background:'#fff'}}>
              <div className="m-mp-row" onClick={() => mNav('ms-profedit')}><div className="m-mp-row-icon mp-ico-wrap" aria-hidden><svg viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></div><div className="m-mp-row-label">プロフィール編集</div><span className="m-mp-arrow">›</span></div>
              <div className="m-mp-row" onClick={() => mNav('ms-settings')}><div className="m-mp-row-icon mp-ico-wrap" aria-hidden><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg></div><div className="m-mp-row-label">設定</div><span className="m-mp-arrow">›</span></div>
              <div className="m-mp-row" onClick={() => mNav('ms-about')}><div className="m-mp-row-icon mp-ico-wrap" aria-hidden><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg></div><div className="m-mp-row-label">MEGURUについて</div><span className="m-mp-arrow">›</span></div>
              <div className="m-mp-row" onClick={handleLogout} style={{color:'#c0392b'}}><div className="m-mp-row-icon" style={{background:'#fef2f2',borderRadius:'10px',padding:'8px',display:'flex',alignItems:'center',justifyContent:'center'}}><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#c0392b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg></div><div className="m-mp-row-label" style={{color:'#c0392b'}}>ログアウト</div><span className="m-mp-arrow" style={{color:'#c0392b'}}>›</span></div>
            </div>
            <div style={{padding:'24px 14px',textAlign:'center'}}><p style={{fontSize:'.69rem',color:'var(--mu)',fontWeight:300,lineHeight:2.2}}>MEGURU v1.0.0 · 長野県駒ヶ根市 · 2025<br /><span style={{color:'var(--g)',fontWeight:500}}>農村の余りものを、誰かの暮らしへ。</span></p></div>
          </div>
          <div className="m-nav">
            <button className="m-nt" data-t="ms-home" onClick={(e) => mTab(e.currentTarget)}><svg viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg><span>ホーム</span></button>
            <button className="m-nt" data-t="ms-search" onClick={(e) => mTab(e.currentTarget)}><svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><line x1="16.5" y1="16.5" x2="22" y2="22"/></svg><span>さがす</span></button>
            <button type="button" className="m-nt" data-t="ms-requests" onClick={(e) => mTab(e.currentTarget)}><svg viewBox="0 0 24 24" aria-hidden><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="1.7"/><path d="M8 10h8M8 14h5" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/></svg><span>求む</span></button>
            <button className="m-nt-post" onClick={() => mNav('ms-post')}><div className="fab"><svg viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg></div><span>出品</span></button>
            <button type="button" className="m-nt" data-t="ms-chatlist" onClick={(e) => mTab(e.currentTarget)}>
              <span className="m-nt-ico-wrap">
                <svg viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                <span className="m-nav-chat-unread-dot" aria-hidden="true" />
              </span>
              <span>チャット</span>
            </button>
            <button className="m-nt on" data-t="ms-mypage" onClick={(e) => mTab(e.currentTarget)}><svg viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg><span>マイページ</span></button>
          </div>
        </div>

        {/* POST */}
        <div className="scn" id="ms-post">
          <div className="m-tbar">
            <button className="m-back" onClick={mBack}>
              <svg viewBox="0 0 24 24">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
            <span className="m-title">余りものを出品する</span>
          </div>
          <div className="m-body">
            <div className="m-post-body">
              <div id="m-post-step-cat">
                <p style={{ fontSize: '.82rem', fontWeight: 600, color: '#2D5A27', marginBottom: '12px' }}>ステップ1：カテゴリを選択</p>
                <div className="post-cat-grid post-cat-grid--mob">
                  {POST_CATEGORY_PICKS.map((c) => (
                    <button key={c.key} type="button" className="post-cat-card" onClick={() => pickPostCategory('mob', c.key)}>
                      <span className="post-cat-emoji" aria-hidden>
                        {c.emoji}
                      </span>
                      <span className="post-cat-label">{c.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div id="m-post-step-form" style={{ display: 'none' }}>
                <button type="button" className="post-cat-back" style={{ marginBottom: '12px' }} onClick={() => showPostCategoryStep('mob')}>
                  ← カテゴリ選択に戻る
                </button>
                <p id="m-post-cat-banner" className="post-cat-banner" />
                <input type="file" id="m-photo-file" accept="image/*" multiple style={{ display: 'none' }} onChange={(e) => addPhotos(e.currentTarget, 'mob')} />

                <div className="fg" style={{ marginBottom: '16px' }}>
                  <label className="lbl" id="m-post-photo-lbl">
                    商品写真 <em>*</em> <small>最大5枚</small>
                  </label>
                  <div id="m-photo-grid" className="pf-imgs">
                    <button type="button" className="pf-img-add" onClick={() => (document.getElementById('m-photo-file') as HTMLInputElement)?.click()}>
                      <svg viewBox="0 0 24 24" stroke="currentColor" fill="none" strokeWidth="1.8" strokeLinecap="round">
                        <line x1="12" y1="5" x2="12" y2="19" />
                        <line x1="5" y1="12" x2="19" y2="12" />
                      </svg>
                      <span>0/5</span>
                    </button>
                  </div>
                </div>

                <div className="fg" style={{ marginBottom: '16px' }}>
                  <label className="lbl" id="m-post-name-lbl">
                    商品名 <em>*</em>
                  </label>
                  <input className="inp" id="m-post-name" />
                </div>

                <div className="fg" id="m-post-block-produce-qty" style={{ display: 'none', marginBottom: '16px' }}>
                  <label className="lbl">
                    数量・単位 <small>例：3kg、1袋</small>
                  </label>
                  <input className="inp" id="m-post-qty" placeholder="例：約3kg、1袋" />
                </div>

                <div className="fg" id="m-post-block-wood-qty" style={{ display: 'none', marginBottom: '16px' }}>
                  <label className="lbl">量の目安</label>
                  <input className="inp" id="m-post-wood-qty" placeholder="例：軽トラ1台分" />
                </div>

                <div id="m-post-block-land-fields" style={{ display: 'none' }}>
                  <div className="fg" style={{ marginBottom: '16px' }}>
                    <label className="lbl">土地の種類</label>
                    <select className="inp" id="m-post-land-type">
                      <option value="">選択してください</option>
                      <option value="農地">農地</option>
                      <option value="山林">山林</option>
                      <option value="空き地">空き地</option>
                      <option value="その他">その他</option>
                    </select>
                  </div>
                  <div className="fg" style={{ marginBottom: '16px' }}>
                    <label className="lbl">面積</label>
                    <div className="price-row">
                      <input className="inp" id="m-post-land-area" inputMode="decimal" placeholder="数値" />
                      <select className="inp" id="m-post-land-area-unit" style={{ maxWidth: '100px' }}>
                        <option value="㎡">㎡</option>
                        <option value="畝">畝</option>
                      </select>
                    </div>
                  </div>
                  <div className="fg" style={{ marginBottom: '16px' }}>
                    <label className="lbl">貸出条件</label>
                    <select className="inp" id="m-post-land-lend" onChange={() => onLandLendChange('mob')}>
                      <option value="">選択してください</option>
                      <option value="無償貸与">無償貸与</option>
                      <option value="有償">有償</option>
                      <option value="管理してくれるなら無料">管理してくれるなら無料</option>
                      <option value="応相談">応相談</option>
                    </select>
                  </div>
                  <div className="fg" id="m-post-block-land-price" style={{ display: 'none', marginBottom: '16px' }}>
                    <label className="lbl">価格（円） <em>*</em></label>
                    <input className="inp" type="number" id="m-post-land-price" placeholder="金額" />
                  </div>
                  <div className="fg" style={{ marginBottom: '16px' }}>
                    <label className="lbl">希望する使用目的</label>
                    <select className="inp" id="m-post-land-purpose">
                      <option value="">選択してください</option>
                      <option value="農業">農業</option>
                      <option value="家庭菜園">家庭菜園</option>
                      <option value="薪割り場">薪割り場</option>
                      <option value="その他">その他</option>
                    </select>
                  </div>
                  <div className="fg" style={{ marginBottom: '16px' }}>
                    <label className="lbl">契約期間</label>
                    <select className="inp" id="m-post-land-period">
                      <option value="">選択してください</option>
                      <option value="単発">単発</option>
                      <option value="年間">年間</option>
                      <option value="応相談">応相談</option>
                    </select>
                  </div>
                  <div className="fg" style={{ marginBottom: '16px' }}>
                    <label className="lbl">現在の状態</label>
                    <select className="inp" id="m-post-land-status">
                      <option value="">選択してください</option>
                      <option value="すぐ使える">すぐ使える</option>
                      <option value="整備が必要">整備が必要</option>
                    </select>
                  </div>
                </div>

                <div className="fg" id="m-post-block-condition" style={{ display: 'none', marginBottom: '16px' }}>
                  <label className="lbl">商品の状態</label>
                  <div className="sel-opts">
                    {(['良好', '普通', '傷あり'] as const).map((c) => (
                      <button key={c} type="button" className="sel-opt" data-v={c} onClick={(e) => selectCondition(e.currentTarget, 'mob')}>
                        {c}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="fg" id="m-post-block-wood-only" style={{ display: 'none', marginBottom: '16px' }}>
                  <label className="lbl">乾燥済みか</label>
                  <div className="sel-opts">
                    {(['済み', '未乾燥', '不明'] as const).map((c) => (
                      <button key={c} type="button" className="sel-opt" data-v={c} onClick={(e) => selectWoodDry(e.currentTarget, 'mob')}>
                        {c}
                      </button>
                    ))}
                  </div>
                  <label className="lbl" style={{ marginTop: '12px', display: 'block' }}>
                    樹種
                  </label>
                  <div className="sel-opts">
                    {(['スギ', 'ヒノキ', 'ナラ', 'その他', '不明'] as const).map((c) => (
                      <button key={c} type="button" className="sel-opt" data-v={c} onClick={(e) => selectWoodTree(e.currentTarget, 'mob')}>
                        {c}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="fg" style={{ marginBottom: '16px' }}>
                  <label className="lbl" id="m-post-desc-lbl">
                    商品の説明 <small>任意</small>
                  </label>
                  <textarea className="txta" id="m-post-desc" placeholder="状態や受け渡しの希望など" />
                </div>

                <div id="m-post-block-standard-price">
                  <div className="fg" style={{ marginBottom: '16px' }}>
                    <label className="lbl">価格</label>
                    <div className="price-row">
                      <input className="inp" type="number" id="m-post-price" placeholder="金額（円）" />
                    </div>
                    <div className="free-row" id="m-free-row" onClick={() => toggleFree('mob')}>
                      <div className="tog" />
                      <span style={{ fontSize: '.8rem', fontWeight: 500, color: 'var(--ink2)' }}>無料で譲る</span>
                    </div>
                  </div>
                </div>

                <hr className="pf-section" />

                <div className="fg" id="m-post-block-loc" style={{ marginBottom: '16px' }}>
                  <label className="lbl" id="m-post-loc-lbl">
                    受け渡し場所（長野県）
                  </label>
                  <div className="loc-sel-row">
                    <select className="inp loc-sel" id="m-post-loc-pref" onChange={(e) => onPostLocPrefChange(e.target as HTMLSelectElement)}>
                      <option value="">都道府県</option>
                    </select>
                    <select className="inp loc-sel" id="m-post-loc-city" disabled onChange={(e) => onPostLocCityChange(e.target as HTMLSelectElement)}>
                      <option value="">市区町村</option>
                    </select>
                    <select className="inp loc-sel" id="m-post-loc-dist" disabled>
                      <option value="">地区（任意）</option>
                    </select>
                  </div>
                </div>

                <div id="m-post-block-handoff">
                  <hr className="pf-section" />
                  <div className="fg" style={{ marginBottom: '16px' }}>
                    <label className="lbl">受渡可能曜日・時間帯</label>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <div>
                        <p style={{ fontSize: '.74rem', color: 'var(--mu)', marginBottom: '7px', fontWeight: 500 }}>曜日</p>
                        <div className="pickup-row">
                          <label className="chk-lbl">
                            <input type="checkbox" id="m-day-wd" />
                            <span>平日</span>
                          </label>
                          <label className="chk-lbl">
                            <input type="checkbox" id="m-day-sat" />
                            <span>土曜</span>
                          </label>
                          <label className="chk-lbl">
                            <input type="checkbox" id="m-day-sun" />
                            <span>日曜</span>
                          </label>
                        </div>
                      </div>
                      <div>
                        <p style={{ fontSize: '.74rem', color: 'var(--mu)', marginBottom: '7px', fontWeight: 500 }}>時間帯</p>
                        <div className="pickup-row">
                          <label className="chk-lbl">
                            <input type="checkbox" id="m-time-am" />
                            <span>午前</span>
                          </label>
                          <label className="chk-lbl">
                            <input type="checkbox" id="m-time-pm" />
                            <span>午後</span>
                          </label>
                          <label className="chk-lbl">
                            <input type="checkbox" id="m-time-ev" />
                            <span>夜</span>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="fg" style={{ marginBottom: '16px' }}>
                    <label className="lbl">受け取り期限 <small>任意</small></label>
                    <input className="inp" type="date" id="m-post-expiry" />
                  </div>
                </div>

                <div className="fg" id="m-post-block-pesticide" style={{ display: 'none', marginBottom: '16px' }}>
                  <label className="lbl">農薬の使用 <em>*</em></label>
                  <div className="sel-opts">
                    {(['なし', 'あり', '不明'] as const).map((p) => (
                      <button key={p} type="button" className="sel-opt" data-v={p} onClick={(e) => selectPesticide(e.currentTarget, 'mob')}>
                        {p}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="hint" style={{ marginBottom: '20px' }}>
                  <span style={{ fontSize: '.95rem', flexShrink: 0 }}>💡</span>
                  <p>詳しい住所はチャットで直接決めてOKです。掲示板には住所は出ません。</p>
                </div>
                <button
                  type="button"
                  id="m-post-submit-btn"
                  style={{
                    width: '100%',
                    padding: '16px',
                    background: '#2D5A27',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '13px',
                    fontSize: '.92rem',
                    fontWeight: 700,
                    letterSpacing: '.08em',
                    boxShadow: '0 5px 17px rgba(45,90,39,.28)',
                  }}
                  onClick={() => void submitPost('mob')}
                >
                  出品する →
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* COMPLETE */}
        <div className="scn" id="ms-complete">
          <div className="m-tbar"><span className="m-logo">MEGURU</span></div>
          <div className="m-body">
            <div className="m-comp-wrap">
              <div className="m-comp-ring">🌿</div>
              <h2 className="m-comp-title">出品しました！</h2>
              <p className="m-comp-sub">地域の掲示板に載りました。欲しい人からチャットが届いたらお知らせします。</p>
              <div className="m-comp-card" style={{ textAlign: 'center', padding: '18px 16px' }}>
                <p id="m-cc-name" style={{ fontSize: '1.02rem', fontWeight: 700, color: '#2D5A27', margin: '0 0 10px', lineHeight: 1.45 }}>
                  —
                </p>
                <p id="m-cc-price" style={{ fontSize: '0.94rem', fontWeight: 600, color: '#2D5A27', margin: 0 }}>
                  —
                </p>
              </div>
              <button
                type="button"
                className="btn-main"
                style={{ background: '#2D5A27' }}
                onClick={() => {
                  void mobCompleteBackToHomeWithReload()
                }}
              >
                一覧に戻る
              </button>
              <button
                type="button"
                className="btn-sec"
                style={{ borderColor: '#2D5A27', color: '#2D5A27' }}
                onClick={() => mobReturnToPostForm()}
              >
                続けて出品する
              </button>
            </div>
          </div>
        </div>

        {/* DETAIL */}
        <div className="scn" id="ms-detail">
          <div className="m-tbar"><button className="m-back" onClick={mBack}><svg viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg></button><span style={{flex:1}}></span><button className="ibtn" onClick={() => showToast('リンクをコピーしました')}><svg viewBox="0 0 24 24"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg></button></div>
          <div className="m-body">
            {/* 画像ギャラリー */}
            <div className="m-det-gallery">
              <div className="m-det-main" id="m-det-main"></div>
              <div id="m-det-arr-row" className="m-det-arr-row" style={{display:'none'}}>
                <button className="m-det-arr" onClick={() => detImgNav(-1,'mob')}>
                  <svg viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg>
                </button>
                <button className="m-det-arr" onClick={() => detImgNav(1,'mob')}>
                  <svg viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg>
                </button>
              </div>
              <div id="m-det-thumbs" className="m-det-thumbs" style={{display:'none'}}></div>
            </div>
            <div className="m-det-body">
              <div className="m-d-seller"><div className="m-d-avt" id="m-d-avt">👴</div><div><p className="m-d-name" id="m-d-sname">鈴木さん</p><p className="m-d-loc" id="m-d-sloc">駒ヶ根市赤穂</p></div><span className="m-d-rating" id="m-det-rating">★ —</span></div>
              <h2 className="m-d-title" id="m-d-title">渋柿 約15kg</h2>
              <p className="m-d-price" id="m-d-price">¥500 <small>/ 箱</small></p>
              <div className="m-d-tags"><span className="m-d-tag" id="m-d-cat">🍊 果物</span><span className="m-d-tag">手渡しOK</span><span className="m-d-tag">今週末受取可</span></div>
              <p className="m-d-desc" id="m-d-desc">—</p>
              <div id="m-det-land-wrap" style={{ display: 'none', margin: '0 0 12px' }}>
                <div id="m-det-land-box" />
              </div>
              <div className="m-d-meta">
                <div className="m-d-mi"><div className="m-d-ml">数量</div><div className="m-d-mv" id="m-d-qty">—</div></div>
                <div className="m-d-mi"><div className="m-d-ml">受け渡し</div><div className="m-d-mv">手渡し（駒ヶ根）</div></div>
                <div className="m-d-mi"><div className="m-d-ml">受取期限</div><div className="m-d-mv" id="m-det-expiry" style={{color:'var(--mu)'}}>未設定</div></div>
                <div className="m-d-mi"><div className="m-d-ml">対応日</div><div className="m-d-mv">今週末〜</div></div>
                <div className="m-d-mi"><div className="m-d-ml">出品日</div><div className="m-d-mv" id="m-d-date">本日</div></div>
              </div>
            </div>
          </div>
          <div className="det-sold-banner" id="m-det-sold-banner" style={{display:'none',margin:'0 0 8px'}}>
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#888" strokeWidth="2" strokeLinecap="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
            <span>この商品は取引済みです</span>
          </div>
          <div className="m-det-actions">
            <button type="button" className="m-fav" id="m-fav-btn" onClick={() => toggleFav('mob')}>🤍</button>
            <div className="m-det-actions-cta">
              <button type="button" className="m-chat m-det-want" id="m-det-chat-btn" onClick={() => void openChatWithSupabase('mob')}>
                <svg viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                連絡する
              </button>
              <button type="button" className="m-det-line-share" id="m-det-line-share-btn" onClick={() => openLineShareForCurrentItem()}>
                <svg className="m-det-line-share-ico" viewBox="0 0 24 24" aria-hidden>
                  <path
                    fill="currentColor"
                    d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.022.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.63.629M24 10.314C24 4.943 18.615.572 12 .572 5.385.572 0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.816-4.011 9.315-6.52 1.351-1.365 2.709-3.027 2.709-5.128"
                  />
                </svg>
                LINEでシェア
              </button>
            </div>
          </div>
        </div>

        {/* USER PROFILE */}
        <div className="scn" id="ms-userprofile">
          <div className="m-tbar">
            <button type="button" className="m-back" onClick={mBack} aria-label="戻る"><svg viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg></button>
            <span className="m-title">プロフィール</span>
          </div>
          <div className="m-body" style={{padding:0}}>
            <div className="m-up-head">
              <div className="m-up-avt" id="m-up-avt">🧑</div>
              <p className="m-up-name" id="m-up-name">—</p>
              <p id="m-up-tagline" style={{ display: 'none', fontSize: '.8rem', color: '#C4581A', fontWeight: 600, marginTop: '6px', textAlign: 'center', lineHeight: 1.45, padding: '0 14px' }}>
                —
              </p>
              <p className="m-up-area" id="m-up-area">—</p>
              <div className="m-up-rating" id="m-up-rating" />
              <div id="m-up-cat-wrap" style={{ display: 'none', marginTop: '12px', padding: '0 14px' }}>
                <p style={{ fontSize: '.68rem', fontWeight: 700, color: '#2D5A27', letterSpacing: '.08em', marginBottom: '8px' }}>主に出品するもの</p>
                <div id="m-up-cat-badges" className="prof-cat-badge-row" style={{ justifyContent: 'center' }} />
              </div>
              <div id="m-up-handoff-wrap" style={{ display: 'none', marginTop: '10px', padding: '0 14px', fontSize: '.78rem', color: 'var(--ink2)', lineHeight: 1.65, textAlign: 'left' }}>
                <span style={{ fontWeight: 700, color: '#2D5A27', display: 'block', fontSize: '.68rem', letterSpacing: '.08em', marginBottom: '4px' }}>受け渡し可能な時間帯</span>
                <span id="m-up-handoff-text" />
              </div>
              <p className="m-up-bio" id="m-up-bio">—</p>
            </div>
            <p className="m-up-sec">出品中の商品</p>
            <div className="m-grid" id="m-up-grid" style={{padding:'0 12px 20px'}} />
          </div>
        </div>

        {/* CHAT LIST */}
        <div className="scn" id="ms-chatlist">
          <div className="m-tbar"><span className="m-logo">MEGURU</span><span style={{fontSize:'.7rem',color:'var(--mu)',fontWeight:300,marginLeft:'5px'}}>やりとり</span></div>
          <div className="m-body" id="m-chatlist-body"></div>
          <div className="m-nav">
            <button className="m-nt" data-t="ms-home" onClick={(e) => mTab(e.currentTarget)}><svg viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg><span>ホーム</span></button>
            <button className="m-nt" data-t="ms-search" onClick={(e) => mTab(e.currentTarget)}><svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><line x1="16.5" y1="16.5" x2="22" y2="22"/></svg><span>さがす</span></button>
            <button type="button" className="m-nt" data-t="ms-requests" onClick={(e) => mTab(e.currentTarget)}><svg viewBox="0 0 24 24" aria-hidden><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="1.7"/><path d="M8 10h8M8 14h5" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/></svg><span>求む</span></button>
            <button className="m-nt-post" onClick={() => mNav('ms-post')}><div className="fab"><svg viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg></div><span>出品</span></button>
            <button type="button" className="m-nt on" data-t="ms-chatlist" onClick={(e) => mTab(e.currentTarget)}>
              <span className="m-nt-ico-wrap">
                <svg viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                <span className="m-nav-chat-unread-dot" aria-hidden="true" />
              </span>
              <span>チャット</span>
            </button>
            <button className="m-nt" data-t="ms-mypage" onClick={(e) => mTab(e.currentTarget)}><svg viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg><span>マイページ</span></button>
          </div>
        </div>

        {/* CHAT VIEW */}
        <div className="scn" id="ms-chat">
          <div className="m-chat-tbar">
            <button className="m-back" onClick={mBack}><svg viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg></button>
            <div className="m-d-avt" id="m-chat-avt" style={{width:'32px',height:'32px',fontSize:'.88rem'}}>👴</div>
            <div style={{marginLeft:'7px',flex:1}}>
              <p style={{fontFamily:'var(--sf)',fontSize:'.9rem',fontWeight:600,color:'var(--ink)'}} id="m-chat-pname">鈴木さん</p>
              <p style={{fontSize:'.63rem',color:'var(--mu)'}} id="m-chat-psub">駒ヶ根市赤穂</p>
            </div>
            <button type="button" className="ibtn" title="プロフィール" onClick={() => {
              const c = CHATS[curChatId]
              if (!CURRENT_USER_ID) { showToast('ログインしてください'); return }
              const oid = c?.buyerId && c?.sellerId ? (CURRENT_USER_ID === c.buyerId ? c.sellerId : c.buyerId) : null
              if (oid) void openPublicProfile(oid, 'mob')
              else showToast('プロフィールを表示できません')
            }}><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg></button>
          </div>
          <div className="m-chat-strip"><div className="cis-wrap" style={{flex:1,minWidth:0}}><span className="cis-e" id="m-cis-e">🍊</span><div style={{minWidth:0}}><p className="cis-n" id="m-cis-n" style={{overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>渋柿</p><p className="cis-p" id="m-cis-p">¥500</p></div></div></div>
          <div className="m-chat-msgs" id="m-chat-msgs"></div>
          <div className="m-trade-bar">
            <button id="m-complete-btn" className="trade-bar-btn active" onClick={() => openTradeModal('mob')}>取引完了にする</button>
          </div>
          <div className="m-chat-input"><input className="m-chat-inp" id="m-chat-inp" placeholder="メッセージを入力…" onKeyDown={(e) => { if(e.key==='Enter') sendMsg('mob') }} /><button className="m-send" onClick={() => sendMsg('mob')}><svg viewBox="0 0 24 24"><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></svg></button></div>
        </div>

        {/* MY LISTINGS */}
        <div className="scn" id="ms-mylistings">
          <div className="m-tbar"><button className="m-back" onClick={mBack}><svg viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg></button><span className="m-title" id="m-mylistings-title">出品中のもの</span></div>
          <div className="m-body"><div className="m-grid" id="m-mylistings-grid" style={{paddingTop:'13px'}}></div></div>
        </div>

        {/* TX HISTORY */}
        <div className="scn" id="ms-txhistory">
          <div className="m-tbar"><button className="m-back" onClick={mBack}><svg viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg></button><span className="m-title">取引履歴</span></div>
          <div className="m-body" id="m-tx-body"></div>
        </div>

        {/* PROF EDIT */}
        <div className="scn" id="ms-profedit">
          <div className="m-tbar" style={{background:'#2D5A27'}}>
            <button type="button" className="m-back" style={{background:'rgba(255,255,255,.2)'}} onClick={mBack}><svg viewBox="0 0 24 24" style={{stroke:'#fff'}}><polyline points="15 18 9 12 15 6"/></svg></button>
            <span className="m-title" style={{color:'#fff',fontFamily:'var(--sf)'}}>プロフィール編集</span>
            <button type="button" style={{fontSize:'.78rem',fontWeight:700,color:'#fff',padding:'6px 13px',background:'#C4581A',borderRadius:'8px',marginLeft:'auto',border:'none'}} onClick={() => void saveProfile()}>保存</button>
          </div>
          <div className="m-body" style={{background:'#F8F4EE'}}>
            <div style={{background:'linear-gradient(135deg,#2D5A27,#3d7a34)',padding:'22px 16px 18px',display:'flex',flexDirection:'column',alignItems:'center',gap:'9px'}}>
              <div style={{width:'64px',height:'64px',borderRadius:'50%',background:'#F8F4EE',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'1.9rem',border:'3px solid rgba(255,255,255,.35)',cursor:'pointer',position:'relative',overflow:'hidden'}} onClick={() => (document.getElementById('m-avatar-file') as HTMLInputElement)?.click()}>
                <span id="m-avt-display" style={{display:'flex',alignItems:'center',justifyContent:'center',width:'100%',height:'100%',fontSize:'1.9rem',borderRadius:'50%',overflow:'hidden'}} />
                <div style={{position:'absolute',bottom:'0',right:'0',width:'20px',height:'20px',borderRadius:'50%',background:'#C4581A',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                  <svg viewBox="0 0 24 24" width="11" height="11" stroke="#fff" fill="none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
                </div>
                <input type="file" id="m-avatar-file" accept="image/*" style={{display:'none'}} onChange={(e) => {
                  const file = e.currentTarget.files?.[0]
                  if (!file) return
                  applyAvatarFileToPreviews(file)
                }} />
              </div>
              <p id="m-prof-preview-name" style={{fontFamily:'var(--sf)',fontSize:'1rem',fontWeight:700,color:'#fff'}}>—</p>
              <p id="m-prof-preview-rating" style={{display:'none',fontSize:'.72rem',color:'rgba(255,255,255,.88)',fontWeight:500,marginTop:'4px'}} />
            </div>
            <div style={{padding:'18px 14px',display:'flex',flexDirection:'column',gap:'15px'}}>
              <div>
                <label className="lbl">名前（必須）</label>
                <input className="inp" id="m-prof-name" maxLength={PROF_NAME_MAX} onInput={(e) => { const c = document.getElementById('m-prof-name-cnt'); if (c) c.textContent = `${e.currentTarget.value.length}/${PROF_NAME_MAX}` }} />
                <p className="prof-fg-hint" id="m-prof-name-cnt">0/{PROF_NAME_MAX}</p>
              </div>
              <div>
                <label className="lbl">お住まいのエリア（必須）</label>
                <div className="prof-pref-fixed" style={{marginBottom:'8px'}}>{NAGANO_PREF}</div>
                <select className="inp prof-muni-sel" id="m-prof-muni" defaultValue="">
                  <option value="">市区町村を選択</option>
                  {(AREA_DATA['長野県'] || []).map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="lbl">自己紹介 <small>任意</small></label>
                <textarea className="txta" id="m-prof-bio" maxLength={PROF_BIO_MAX} style={{minHeight:'72px'}} onInput={(e) => { const c = document.getElementById('m-prof-bio-cnt'); if (c) c.textContent = `${e.currentTarget.value.length}/${PROF_BIO_MAX}` }} />
                <p className="prof-fg-hint" id="m-prof-bio-cnt">0/{PROF_BIO_MAX}</p>
              </div>
              <div>
                <label className="lbl">主に出品するもの <small>任意</small></label>
                <div className="pickup-row" style={{ flexWrap: 'wrap' }}>
                  {PROFILE_CATEGORY_OPTIONS.map((label, i) => (
                    <label key={label} className="chk-lbl">
                      <input type="checkbox" id={`m-prof-cat-${i}`} />
                      <span>{label}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="lbl">受け渡し可能な時間帯 <small>任意</small></label>
                <div className="pickup-row" style={{ flexWrap: 'wrap' }}>
                  {PROFILE_HANDOFF_TIME_OPTIONS.map((label, i) => (
                    <label key={label} className="chk-lbl">
                      <input type="checkbox" id={`m-prof-time-${i}`} />
                      <span>{label}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="lbl">一言メッセージ <small>任意・{PROF_TAGLINE_MAX}文字まで</small></label>
                <input
                  className="inp"
                  id="m-prof-tagline"
                  maxLength={PROF_TAGLINE_MAX}
                  placeholder="例：お気軽にどうぞ"
                  onInput={(e) => {
                    const c = document.getElementById('m-prof-tagline-cnt')
                    if (c) c.textContent = `${e.currentTarget.value.length}/${PROF_TAGLINE_MAX}`
                  }}
                />
                <p className="prof-fg-hint" id="m-prof-tagline-cnt">0/{PROF_TAGLINE_MAX}</p>
              </div>
            </div>
          </div>
        </div>

        {/* SETTINGS */}
        <div className="scn" id="ms-settings">
          <div className="m-tbar" style={{ background: '#2D5A27' }}>
            <button type="button" className="m-back" style={{ background: 'rgba(255,255,255,.2)' }} onClick={mBack}><svg viewBox="0 0 24 24" style={{ stroke: '#fff' }}><polyline points="15 18 9 12 15 6" /></svg></button>
            <span className="m-title" style={{ color: '#fff', fontFamily: 'var(--sf)' }}>設定</span>
          </div>
          <div className="m-body" style={{ background: '#F8F4EE', paddingBottom: '28px' }}>
            <p className="m-mp-sec" style={{ padding: '14px 14px 8px', margin: 0 }}>エリア設定</p>
            <div style={{ margin: '0 14px 16px', background: '#fff', borderRadius: '12px', padding: '14px 14px', border: '1px solid var(--bd)' }}>
              <div style={{ fontSize: '.75rem', fontWeight: 600, color: 'var(--mu)' }}>現在のエリア（市区町村）</div>
              <div id="m-settings-area-val" style={{ fontSize: '.9rem', marginTop: '8px', color: '#2D5A27', fontWeight: 700, fontFamily: 'var(--sf)' }}>—</div>
              <button type="button" onClick={showAreaModal} style={{ marginTop: '12px', width: '100%', padding: '10px 14px', background: '#C4581A', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '.82rem', fontWeight: 700, fontFamily: 'var(--sf)' }}>エリアを変更</button>
            </div>

            <p className="m-mp-sec" style={{ padding: '0 14px 8px', margin: 0 }}>アカウント</p>
            <div style={{ margin: '0 14px 16px', background: '#fff', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--bd)' }}>
              <button type="button" onClick={() => router.push('/reset-password')} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 14px', border: 'none', background: '#fff', cursor: 'pointer', textAlign: 'left', fontSize: '.86rem', fontWeight: 600, color: '#2D5A27', fontFamily: 'var(--sf)' }}>
                パスワードを変更する
                <span className="m-mp-arrow" style={{ margin: 0 }}>›</span>
              </button>
              <div style={{ borderTop: '1px solid var(--bd)', padding: '14px 14px' }}>
                <div style={{ fontSize: '.7rem', fontWeight: 600, color: 'var(--mu)', marginBottom: '6px' }}>登録中のメールアドレス</div>
                <div id="m-settings-email" style={{ fontSize: '.84rem', color: 'var(--ink)', wordBreak: 'break-all', fontFamily: 'var(--sf)' }}>—</div>
              </div>
            </div>

            <p className="m-mp-sec" style={{ padding: '0 14px 8px', margin: 0 }}>通知設定</p>
            <div style={{ margin: '0 14px 16px', background: '#fff', borderRadius: '12px', padding: '14px 14px', border: '1px solid var(--bd)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
              <span style={{ fontSize: '.86rem', fontWeight: 600, color: 'var(--ink)', fontFamily: 'var(--sf)' }}>チャットの通知</span>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '.74rem', color: 'var(--mu)', fontFamily: 'var(--sf)', flexShrink: 0 }}>
                <span id="m-settings-chat-notif-lbl">オン</span>
                <input id="m-settings-chat-notif" type="checkbox" onChange={(e) => onSettingsChatNotifUserToggle(e.target.checked)} style={{ width: '18px', height: '18px', accentColor: '#2D5A27' }} />
              </label>
            </div>

            <p className="m-mp-sec" style={{ padding: '0 14px 8px', margin: 0 }}>退会</p>
            <p style={{ fontSize: '.72rem', color: 'var(--mu)', margin: '0 14px 10px', lineHeight: 1.5, fontFamily: 'var(--sf)' }}>アカウントの削除は管理者が対応します。ここではログアウトのみ行い、データは保持されます。</p>
            <div style={{ padding: '0 14px' }}>
              <button type="button" onClick={() => void handleWithdraw()} style={{ width: '100%', padding: '12px 14px', background: '#b91c1c', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '.86rem', fontWeight: 700, fontFamily: 'var(--sf)' }}>退会する</button>
            </div>
          </div>
        </div>

        {/* MEGURUについて */}
        <div className="scn" id="ms-about">
          <div className="m-tbar" style={{ background: '#2D5A27' }}>
            <button type="button" className="m-back" style={{ background: 'rgba(255,255,255,.2)' }} onClick={mBack}><svg viewBox="0 0 24 24" style={{ stroke: '#fff' }}><polyline points="15 18 9 12 15 6" /></svg></button>
            <span className="m-title" style={{ color: '#fff', fontFamily: 'var(--sf)' }}>MEGURUについて</span>
          </div>
          <div className="m-body" style={{ background: '#F8F4EE', paddingBottom: '28px' }}>
            <p className="m-mp-sec" style={{ padding: '14px 14px 8px', margin: 0 }}>MEGURUとは</p>
            <div style={{ margin: '0 14px 16px', background: '#fff', borderRadius: '12px', padding: '14px 14px', border: '1px solid var(--bd)', fontSize: '.84rem', lineHeight: 1.75, color: 'var(--ink)', fontFamily: 'var(--sf)' }}>
              <p style={{ margin: 0 }}>農村の余りものを、地域の人と人がつなぐプラットフォームです。</p>
              <p style={{ margin: '10px 0 0' }}>規格外野菜・庭の柿・採りきれない山菜・作りすぎた加工品を、</p>
              <p style={{ margin: '4px 0 0' }}>捨てずに地域の誰かに届ける仕組みです。</p>
            </div>

            <p className="m-mp-sec" style={{ padding: '0 14px 8px', margin: 0 }}>使い方</p>
            <div style={{ margin: '0 14px 16px', background: '#fff', borderRadius: '12px', padding: '14px 14px', border: '1px solid var(--bd)', fontSize: '.84rem', lineHeight: 1.65, color: 'var(--ink)', fontFamily: 'var(--sf)' }}>
              <ul style={{ margin: 0, paddingLeft: '1.1em' }}>
                <li style={{ marginBottom: '8px' }}><strong style={{ color: '#2D5A27' }}>出品する</strong>：写真と説明を入れて余りものを登録</li>
                <li style={{ marginBottom: '8px' }}><strong style={{ color: '#2D5A27' }}>受け取る</strong>：欲しいものを見つけてチャットで連絡</li>
                <li style={{ marginBottom: 0 }}><strong style={{ color: '#2D5A27' }}>受け渡し</strong>：直接会って手渡し、または都合のいい方法で</li>
              </ul>
            </div>

            <p className="m-mp-sec" style={{ padding: '0 14px 8px', margin: 0 }}>手数料について</p>
            <div style={{ margin: '0 14px 16px', background: '#fff', borderRadius: '12px', padding: '14px 14px', border: '1px solid var(--bd)', fontSize: '.84rem', lineHeight: 1.75, color: 'var(--ink)', fontFamily: 'var(--sf)' }}>
              <p style={{ margin: 0 }}>現在は無料期間中です。将来的に取引成立時のみ12%の手数料が発生します。</p>
            </div>

            <p className="m-mp-sec" style={{ padding: '0 14px 8px', margin: 0 }}>運営情報</p>
            <div style={{ margin: '0 14px 16px', background: '#fff', borderRadius: '12px', padding: '14px 14px', border: '1px solid var(--bd)', fontSize: '.84rem', lineHeight: 1.6, color: 'var(--ink)', fontFamily: 'var(--sf)' }}>
              <p style={{ margin: '0 0 6px' }}>サービス名：MEGURU（めぐる）</p>
              <p style={{ margin: '0 0 6px' }}>運営：片桐和真</p>
              <p style={{ margin: '0 0 6px' }}>所在地：長野県駒ヶ根市</p>
              <p style={{ margin: 0 }}>
                お問い合わせ：
                <a href="/contact" style={{ color: '#C4581A', fontWeight: 600 }}>お問い合わせフォーム</a>
              </p>
            </div>

            <p className="m-mp-sec" style={{ padding: '0 14px 8px', margin: 0 }}>リンク</p>
            <div style={{ margin: '0 14px', background: '#fff', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--bd)' }}>
              <button type="button" onClick={() => router.push('/terms')} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 14px', border: 'none', background: '#fff', cursor: 'pointer', textAlign: 'left', fontSize: '.86rem', fontWeight: 600, color: '#2D5A27', fontFamily: 'var(--sf)' }}>
                利用規約・プライバシーポリシー
                <span className="m-mp-arrow" style={{ margin: 0 }}>›</span>
              </button>
              <div style={{ borderTop: '1px solid var(--bd)' }}>
                <button type="button" onClick={() => router.push('/contact')} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 14px', border: 'none', background: '#fff', cursor: 'pointer', textAlign: 'left', fontSize: '.86rem', fontWeight: 600, color: '#2D5A27', fontFamily: 'var(--sf)' }}>
                  お問い合わせ
                  <span className="m-mp-arrow" style={{ margin: 0 }}>›</span>
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* TRADE COMPLETE MODAL */}
      {/* ── AREA MODAL ── */}
      <div className="area-modal-overlay hidden" id="area-modal-overlay">
        <div className="area-modal-box">
          <div className="area-modal-header">
            <p className="area-modal-ttl">エリアを変更する</p>
            <button type="button" className="area-modal-close" onClick={closeAreaModal} aria-label="閉じる">✕</button>
          </div>
          <div className="area-modal-scroll">
            <div className="area-field">
              <p className="area-field-lbl">都道府県</p>
              <div className="area-modal-pref-fixed">{NAGANO_PREF}</div>
            </div>
            <div className="area-field">
              <p className="area-field-lbl">市区町村</p>
              <div className="area-card-grid area-card-grid-city" id="area-city-cards" />
            </div>
            <div id="area-dist-wrap" style={{display:'none'}}>
              <p className="area-field-lbl">地区 <span className="area-field-sub">（任意・複数タップで選べます）</span></p>
              <p className="area-dist-note">選ばない場合は市区町村全体を表示します</p>
              <div id="area-dist-list" className="area-dist-chips" />
            </div>
          </div>
          <div className="area-modal-footer">
            <button type="button" className="area-apply-btn" onClick={selectAreaApply}>
              この地域で探す
            </button>
          </div>
        </div>
      </div>

      <div className="trade-modal-overlay hidden" id="trade-modal">
        <div className="trade-modal-box">
          <p className="trade-modal-title">取引を完了しますか？</p>
          <p className="trade-modal-desc">相手と直接会って、商品を受け取りましたか？<br />受け取り確認後に完了してください。</p>
          <div className="trade-modal-btns">
            <button type="button" className="trade-modal-cancel" onClick={closeTradeModal}>キャンセル</button>
            <button type="button" className="trade-modal-confirm" onClick={confirmCompleteTrade}>完了する</button>
          </div>
        </div>
      </div>

      <div className="trade-modal-overlay hidden" id="review-modal">
        <div className="trade-modal-box review-modal-box">
          <p className="trade-modal-title">取引の評価</p>
          <p className="trade-modal-desc" id="review-modal-desc">相手を1〜5で評価してください。</p>
          <div className="review-star-row" role="group" aria-label="1から5の評価">
            {([1, 2, 3, 4, 5] as const).map((n) => (
              <button
                key={n}
                type="button"
                className="review-star-btn"
                aria-label={`星${n}`}
                onClick={() => void submitReviewRating(n)}
              >
                ★
              </button>
            ))}
          </div>
          <button type="button" className="review-skip-btn" onClick={closeReviewModal}>
            スキップ
          </button>
        </div>
      </div>

      {/* TOAST */}
      <div className="toast" id="toast"></div>
    </>
  )
}
