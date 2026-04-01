'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

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
type Chat = { name: string; sub: string; avt: string; ie: string; in_: string; ip: string; unread: number; itemId: number; msgs: ChatMsg[]; lastAt: number; supabaseId?: string }
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
const CATMAP: Record<string,string> = {fruit:'🍊 果物',veg:'🥒 野菜',wood:'🪵 薪・木材',herb:'🌿 山菜',other:'🧴 加工品',misc:'📦 その他'}
const EMOJIMAP: Record<string,string> = {fruit:'🍊',veg:'🥒',wood:'🪵',herb:'🌿',other:'🧴',misc:'📦'}
const BGMAP: Record<string,string> = {fruit:'bk',veg:'bg',wood:'bb',herb:'bg',other:'by',misc:'by'}

/* ── AREA DATA ── */
const AREA_DATA: Record<string, string[]> = {
  '北海道':['札幌市','函館市','旭川市','釧路市','帯広市','北見市','小樽市','苫小牧市','千歳市','江別市'],
  '青森県':['青森市','弘前市','八戸市','五所川原市','十和田市','黒石市','むつ市'],
  '岩手県':['盛岡市','花巻市','北上市','一関市','宮古市','釜石市','大船渡市'],
  '宮城県':['仙台市','石巻市','気仙沼市','名取市','多賀城市','塩竈市','白石市'],
  '秋田県':['秋田市','横手市','大館市','能代市','大仙市','湯沢市','由利本荘市'],
  '山形県':['山形市','米沢市','鶴岡市','酒田市','新庄市','天童市','上山市'],
  '福島県':['福島市','郡山市','いわき市','会津若松市','白河市','須賀川市','南相馬市'],
  '茨城県':['水戸市','つくば市','日立市','土浦市','古河市','ひたちなか市','取手市'],
  '栃木県':['宇都宮市','足利市','栃木市','小山市','日光市','鹿沼市','真岡市'],
  '群馬県':['前橋市','高崎市','桐生市','伊勢崎市','太田市','渋川市','富岡市'],
  '埼玉県':['さいたま市','川越市','熊谷市','川口市','所沢市','越谷市','春日部市','志木市','新座市'],
  '千葉県':['千葉市','船橋市','松戸市','市川市','柏市','市原市','習志野市','流山市','成田市'],
  '東京都':['千代田区','中央区','港区','新宿区','渋谷区','世田谷区','品川区','目黒区','大田区','杉並区','中野区','練馬区','足立区','八王子市','立川市'],
  '神奈川県':['横浜市','川崎市','相模原市','横須賀市','鎌倉市','藤沢市','平塚市','小田原市','茅ヶ崎市','厚木市','大和市'],
  '新潟県':['新潟市','長岡市','上越市','三条市','柏崎市','新発田市','燕市','十日町市','佐渡市'],
  '富山県':['富山市','高岡市','魚津市','氷見市','黒部市','砺波市','射水市','小矢部市'],
  '石川県':['金沢市','白山市','小松市','加賀市','七尾市','輪島市','羽咋市','能美市'],
  '福井県':['福井市','敦賀市','越前市','坂井市','小浜市','大野市','鯖江市'],
  '山梨県':['甲府市','甲斐市','笛吹市','南アルプス市','甲州市','都留市','大月市','山梨市'],
  '長野県':['長野市','松本市','上田市','岡谷市','飯田市','諏訪市','須坂市','小諸市','伊那市','駒ヶ根市','中野市','大町市','飯山市','茅野市','塩尻市','佐久市','千曲市','東御市','安曇野市','辰野町','箕輪町','南箕輪村','飯島町','中川村','宮田村','松川町','高森町','阿南町'],
  '岐阜県':['岐阜市','大垣市','高山市','各務原市','多治見市','関市','中津川市','可児市','土岐市'],
  '静岡県':['静岡市','浜松市','沼津市','富士市','磐田市','焼津市','掛川市','富士宮市','伊東市'],
  '愛知県':['名古屋市','豊橋市','岡崎市','一宮市','春日井市','豊田市','安城市','刈谷市','西尾市','小牧市'],
  '三重県':['津市','四日市市','伊勢市','松阪市','桑名市','鈴鹿市','名張市','亀山市'],
  '滋賀県':['大津市','草津市','彦根市','長浜市','近江八幡市','守山市','栗東市','甲賀市'],
  '京都府':['京都市','宇治市','亀岡市','長岡京市','城陽市','向日市','八幡市','京田辺市'],
  '大阪府':['大阪市','堺市','豊中市','高槻市','枚方市','吹田市','茨木市','八尾市','東大阪市','寝屋川市'],
  '兵庫県':['神戸市','姫路市','尼崎市','明石市','西宮市','宝塚市','加古川市','伊丹市','芦屋市'],
  '奈良県':['奈良市','橿原市','生駒市','大和郡山市','天理市','桜井市','香芝市','大和高田市'],
  '和歌山県':['和歌山市','田辺市','海南市','橋本市','有田市','御坊市','新宮市'],
  '鳥取県':['鳥取市','米子市','倉吉市','境港市'],
  '島根県':['松江市','出雲市','浜田市','益田市','大田市','安来市','雲南市'],
  '岡山県':['岡山市','倉敷市','津山市','総社市','玉野市','笠岡市','高梁市','真庭市'],
  '広島県':['広島市','福山市','呉市','尾道市','三原市','三次市','廿日市市','東広島市'],
  '山口県':['山口市','下関市','宇部市','周南市','防府市','岩国市','萩市','光市'],
  '徳島県':['徳島市','阿南市','鳴門市','吉野川市','小松島市','阿波市','三好市'],
  '香川県':['高松市','丸亀市','坂出市','観音寺市','三豊市','さぬき市','善通寺市'],
  '愛媛県':['松山市','今治市','新居浜市','西条市','宇和島市','大洲市','四国中央市'],
  '高知県':['高知市','南国市','四万十市','須崎市','香南市','安芸市','香美市'],
  '福岡県':['福岡市','北九州市','久留米市','飯塚市','春日市','大野城市','太宰府市','糸島市','筑紫野市'],
  '佐賀県':['佐賀市','唐津市','鳥栖市','伊万里市','武雄市','小城市','嬉野市'],
  '長崎県':['長崎市','佐世保市','諫早市','大村市','島原市','対馬市','五島市'],
  '熊本県':['熊本市','八代市','荒尾市','玉名市','山鹿市','菊池市','宇城市','阿蘇市','天草市'],
  '大分県':['大分市','別府市','中津市','日田市','佐伯市','由布市','臼杵市','宇佐市'],
  '宮崎県':['宮崎市','都城市','延岡市','日南市','小林市','日向市','西都市'],
  '鹿児島県':['鹿児島市','霧島市','薩摩川内市','鹿屋市','姶良市','出水市','指宿市','枕崎市'],
  '沖縄県':['那覇市','沖縄市','うるま市','浦添市','名護市','糸満市','豊見城市','宮古島市','石垣市'],
}

/* 市区町村 → 地区一覧（登録されている市のみ）*/
const DISTRICT_DATA: Record<string, string[]> = {
  '駒ヶ根市': ['東伊那', '赤穂', '中沢', '福岡', '北割', '小町屋', '飯坂'],
  '伊那市': ['伊那', '高遠', '長谷'],
  '箕輪町': ['木下', '沢', '松島', '中箕輪', '富田', '三日町'],
  '飯島町': ['七久保', '飯島', '田切'],
  '中川村': ['大草', '片桐'],
  '宮田村': ['宮田'],
  '松本市': ['松本', '波田', '四賀', '梓川', '安曇'],
  '長野市': ['長野', '松代', '篠ノ井', '豊野', '戸隠', '鬼無里', '信更'],
}
const LS_DISTRICTS_KEY = 'meguru_user_districts'
const LS_CHAT_READ_PREFIX = 'meguru_chat_read_'

function markSupabaseChatRead(supabaseChatId: string) {
  localStorage.setItem(LS_CHAT_READ_PREFIX + supabaseChatId, new Date().toISOString())
}
function getSupabaseChatLastReadMs(supabaseChatId: string): number {
  const raw = localStorage.getItem(LS_CHAT_READ_PREFIX + supabaseChatId)
  return raw ? new Date(raw).getTime() : 0
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
  misc: `<svg class="cat-icon" viewBox="0 0 48 48"><path d="M6 18 L24 8 L42 18 L42 40 Q42 44 38 44 L10 44 Q6 44 6 40z" fill="#8a8478"/><path d="M6 18 L24 28 L42 18" stroke="#6a6468" stroke-width="2" fill="none"/><line x1="24" y1="28" x2="24" y2="44" stroke="#6a6468" stroke-width="2"/></svg>`,
}
const NOTIFS = [
  {icon:'💬',cls:'ni-c',title:'田中さんからメッセージが届きました',sub:'「土曜日の午前中にお伺いします！」',time:'3分前',unread:true,chatKey:'tanaka'},
  {icon:'💬',cls:'ni-c',title:'佐藤さんが渋柿に興味を持っています',sub:'「はじめまして！渋柿をぜひ分けていただけますか？」',time:'18分前',unread:true,chatKey:'sato'},
  {icon:'🍊',cls:'ni-k',title:'あなたの出品が15人に見られました',sub:'「渋柿 約15kg」の閲覧数が増えています。',time:'1時間前',unread:false,chatKey:null},
  {icon:'💬',cls:'ni-c',title:'山本さんとの取引が完了しました',sub:'「薪 乾燥済み」の取引ありがとうございました！',time:'昨日',unread:false,chatKey:'yamamoto'},
  {icon:'📣',cls:'ni-s',title:'MEGURUへようこそ！',sub:'農村の余りものを地域でつなぐプラットフォームです。',time:'3日前',unread:false,chatKey:null},
]

/* ── GLOBAL USER STATE ── */
const USER = { name: '田中 拓也', area: '駒ヶ根市赤穂', bio: 'よろしくお願いします。', avt: '' }

/* ── MODULE-LEVEL STATE ── */
let curItem: Item = ITEMS[0]
let curDetailImgIdx = 0
let curChatId = 'suzuki'
const favSet = new Set<number>()
let pcFreeTog = false, mobFreeTog = false, pcPostCat = 'veg', mobPostCat = 'veg'
let pcSortMode = 'new', pcCatFilter = 'all'
let mobSortMode = 'new', mobCatFilter = 'all'
let pcImages: string[] = [], mobImages: string[] = []
let pcCondition = '', mobCondition = '', pcPesticide = '', mobPesticide = ''
let CURRENT_USER_ID: string | null = null
let pcDragIdx = -1, mobDragIdx = -1
let mStk: string[] = ['ms-home']
let mSearchCatKey = 'all'
let areaFilterMode: 'local' | 'all' = 'local'
let selectedPref = ''
let selectedCity = ''
let activeDistricts: string[] = []
let filterMessage = ''

/* ── TOAST ── */
let _tt: ReturnType<typeof setTimeout>
function showToast(msg: string) {
  const e = document.getElementById('toast')
  if (!e) return
  e.textContent = msg; e.classList.add('on')
  clearTimeout(_tt); _tt = setTimeout(() => e.classList.remove('on'), 2200)
}

/* ── PC NAV ── */
const PC_PAGES = ['listing','post','complete','notif','mypage','chatlist','mylistings','txhistory','profedit','detail']
function pcGo(page: string) {
  PC_PAGES.forEach(p => { const el = document.getElementById('pc-pg-'+p); if (el) el.style.display='none' })
  const el = document.getElementById('pc-pg-'+page); if (el) el.style.display=''
  if (!['listing','chatlist','mylistings'].includes(page)) document.getElementById('pc-panel')?.classList.add('hidden')
  document.querySelectorAll('.pc-nav-tab').forEach(t => t.classList.remove('on'))
  const tab = document.getElementById('pct-'+page); if (tab) tab.classList.add('on')
  document.querySelectorAll('.sb-item').forEach(t => t.classList.remove('on'))
  if (page==='notif') renderPcNotifs()
  if (page==='mypage') { updateMypage('pc'); (document.getElementById('pc-pg-mypage') as HTMLElement).style.display='' }
  if (page==='chatlist') renderChatList('pc')
  if (page==='mylistings') renderMyListings('pc','出品中のもの',ITEMS.filter(i=>i.mine))
  if (page==='txhistory') renderTxHistory('pc')
  const main = document.getElementById('pc-main'); if (main) main.scrollTop=0
}
function pcSubPage(p: string) { pcGo(p) }

/* ── SORT & FILTER ── */
/* ── AREA ── */
const LS_AREA_KEY = 'meguru_user_area'

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

function updateAreaDisplay() {
  const city = USER.area ? (getUserCity() || USER.area) : 'エリア未設定'
  const distLabel = activeDistricts.length > 0 ? `（${activeDistricts.join('・')}）` : ''
  ;(['pc-area-display','m-area-display'] as const).forEach(id => {
    const el = document.getElementById(id); if (el) el.textContent = city + distLabel
  })
}

function _areaPrefHtml(currentPref: string) {
  const grid = document.getElementById('area-pref-cards')
  if (!grid) return
  grid.innerHTML = Object.keys(AREA_DATA).map(p =>
    `<button type="button" class="area-card-btn${p === currentPref ? ' on' : ''}" onclick="window.onSelectAreaPref('${p.replace(/'/g, "\\'")}')">${p}</button>`
  ).join('')
}

function _areaDistHtml(city: string) {
  const districts = city ? (DISTRICT_DATA[city] || []) : []
  const wrap = document.getElementById('area-dist-wrap')
  if (!wrap) return
  if (districts.length === 0) { wrap.style.display = 'none'; return }
  wrap.style.display = 'block'
  const list = document.getElementById('area-dist-list')
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
  if (!pref || !AREA_DATA[pref]) {
    grid.innerHTML = '<p class="area-cards-hint">まず都道府県を選んでください</p>'
    grid.classList.add('area-cards-muted')
    const dw = document.getElementById('area-dist-wrap'); if (dw) dw.style.display = 'none'
    return
  }
  grid.classList.remove('area-cards-muted')
  grid.innerHTML = AREA_DATA[pref].map(c => {
    const esc = c.replace(/'/g, "\\'")
    return `<button type="button" class="area-card-btn area-card-btn-city${c === (current ?? '') ? ' on' : ''}" onclick="window.onSelectAreaCity('${esc}')">${c}</button>`
  }).join('')
}

function showAreaModal() {
  const currentPref = USER.area.split(' ')[0] || ''
  const currentCity = getUserCity()
  selectedPref = currentPref
  selectedCity = currentCity
  _areaPrefHtml(currentPref)
  _areaCityHtml(currentPref, currentCity)
  _areaDistHtml(currentCity)
  document.getElementById('area-modal-overlay')?.classList.remove('hidden')
}

function closeAreaModal() {
  document.getElementById('area-modal-overlay')?.classList.add('hidden')
}

function onSelectAreaPref(pref: string) {
  selectedPref = pref
  selectedCity = ''
  activeDistricts = []
  _areaPrefHtml(pref)
  _areaCityHtml(pref, '')
  _areaDistHtml('')
}

function onSelectAreaCity(city: string) {
  selectedCity = city
  activeDistricts = []
  _areaPrefHtml(selectedPref)
  _areaCityHtml(selectedPref, city)
  _areaDistHtml(city)
}

function toggleAreaDistrict(d: string) {
  if (activeDistricts.includes(d)) activeDistricts = activeDistricts.filter(x => x !== d)
  else activeDistricts.push(d)
  _areaDistHtml(selectedCity)
}

async function selectAreaApply() {
  const pref = selectedPref
  const city = selectedCity
  if (!pref || !city) { showToast('都道府県と市区町村を選択してください'); return }
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

// 後方互換性のため残す（初回ログイン時モーダル用）
function selectAreaPref(pref: string) { onSelectAreaPref(pref) }
async function selectAreaCity(city: string) {
  const area = `${selectedPref} ${city}`
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
function applyAreaFilter(items: Item[]): Item[] {
  filterMessage = ''
  if (areaFilterMode !== 'local' || !USER.area) return items
  const city = getUserCity()
  if (!city) return items
  let cityFiltered = items.filter(i => i.loc.includes(city))

  // 地区フィルター
  if (activeDistricts.length > 0) {
    const distFiltered = cityFiltered.filter(i => activeDistricts.some(d => i.loc.includes(d)))
    if (distFiltered.length > 0) return distFiltered
    // 地区0件 → 市全体にフォールバック
    filterMessage = `${activeDistricts.join('・')}には出品がありません。${city}全体を表示しています。`
    return cityFiltered
  }

  if (cityFiltered.length === 0) {
    // 市0件 → 都道府県にフォールバック
    const pref = USER.area.split(' ')[0] || ''
    const prefFiltered = pref ? items.filter(i => i.loc.includes(pref.replace(/[都道府県]$/, ''))) : []
    if (prefFiltered.length > 0) {
      filterMessage = `${city}には出品がありません。${pref}全体を表示しています。`
      return prefFiltered
    }
    filterMessage = `${city}には出品がありません。全国の商品を表示しています。`
    return items
  }
  return cityFiltered
}

function _showFilterMsg(gridId: string) {
  const msgId = gridId === 'pc-grid' ? 'pc-filter-msg' : 'm-filter-msg'
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
  const catFiltered = pcCatFilter === 'all' ? ITEMS : ITEMS.filter(i => i.cat === pcCatFilter)
  const base = applyAreaFilter(catFiltered)
  renderGrid(applySortFilter(base, pcSortMode), 'pc-grid', 'pc')
  _showFilterMsg('pc-grid')
}
function applyMobFilter() {
  const catFiltered = mobCatFilter === 'all' ? ITEMS : ITEMS.filter(i => i.cat === mobCatFilter)
  const base = applyAreaFilter(catFiltered)
  renderGrid(applySortFilter(base, mobSortMode), 'm-home-grid', 'mob')
  _showFilterMsg('m-home-grid')
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
  let list = [...ITEMS]
  if (kw) list = list.filter(i => i.name.toLowerCase().includes(kw)||i.loc.toLowerCase().includes(kw))
  renderGrid(list,'pc-grid','pc')
}

/* ── CHIP SVG ICONS (same paths as sidebar) ── */
const CHIP_SVG_PATHS: Record<string,string> = {
  all:   '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
  fruit: '<circle cx="12" cy="14" r="7"/><path d="M12 7V4"/><path d="M9.5 4.5C10.5 3 13.5 3 14.5 4.5"/>',
  veg:   '<path d="M8 9 Q12 7 16 9 Q15 17 12 23 Q9 17 8 9z"/><path d="M9 13 Q12 12 15 13"/><path d="M10 17 Q12 16 14 17"/><path d="M12 9 Q11 4 9 2 Q11 5 12 9"/><path d="M12 9 Q13 4 15 2 Q13 5 12 9"/><path d="M12 9 Q8 5 7 3 Q9 6 12 9"/><path d="M12 9 Q16 5 17 3 Q15 6 12 9"/>',
  wood:  '<circle cx="7" cy="16" r="5.5"/><circle cx="7" cy="16" r="3"/><circle cx="17" cy="16" r="5.5"/><circle cx="17" cy="16" r="3"/><circle cx="12" cy="8" r="5.5"/><circle cx="12" cy="8" r="3"/>',
  herb:  '<line x1="12" y1="22" x2="12" y2="14"/><path d="M12 16 Q6 14 4 9 Q6 5 10 8 Q11 12 12 16z"/><path d="M12 16 Q18 14 20 9 Q18 5 14 8 Q13 12 12 16z"/><path d="M12 12 Q10 6 12 2 Q14 6 12 12z"/>',
  other: '<rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/><line x1="12" y1="12" x2="12" y2="17"/><line x1="9.5" y1="14.5" x2="14.5" y2="14.5"/>',
  misc:  '<path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/>',
}
function chipSvg(cat: string): string {
  const p = CHIP_SVG_PATHS[cat] ?? CHIP_SVG_PATHS.misc
  return `<svg class="chip-icon" viewBox="0 0 24 24">${p}</svg>`
}

/* ── PC CATS ── */
function initPcCats() {
  const fcats = [{v:'fruit',l:'果物'},{v:'veg',l:'野菜'},{v:'wood',l:'薪・木材'},{v:'herb',l:'山菜・ハーブ'},{v:'other',l:'加工品'},{v:'misc',l:'その他'}]
  const pcFormCats = document.getElementById('pc-form-cats')
  if (pcFormCats) pcFormCats.innerHTML = fcats.map(c=>`<button class="fchip${c.v==='veg'?' on':''}" data-v="${c.v}" onclick="selCat(this,'pc')">${chipSvg(c.v)}${c.l}</button>`).join('')
}

/* ── MOBILE NAV ── */
function mNav(id: string) {
  const cur = document.querySelector('#mob-root .scn.active')
  if (cur) cur.classList.remove('active')
  mStk.push(id)
  const next = document.getElementById(id)
  if (!next) return
  next.classList.remove('back'); next.classList.add('active')
  if (id==='ms-chatlist') renderChatList('mob')
  if (id==='ms-search') { setTimeout(()=>(document.getElementById('m-search-inp') as HTMLInputElement)?.focus(),280); renderGrid(ITEMS,'m-search-grid','mob') }
  if (id==='ms-notif') renderMobNotifs()
  if (id==='ms-mypage') updateMypage('mob')
  if (id==='ms-txhistory') renderTxHistory('mob')
  if (id==='ms-mylistings') { const t=document.getElementById('m-mylistings-title'); if(t)t.textContent='出品中のもの'; renderMyListings('mob','出品中のもの',ITEMS.filter(i=>i.mine)) }
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
  const cats = [{k:'all',l:'すべて'},{k:'fruit',l:'果物'},{k:'veg',l:'野菜'},{k:'wood',l:'薪・木材'},{k:'herb',l:'山菜'},{k:'other',l:'加工品'}]
  const homeCats = document.getElementById('m-home-cats')
  if (homeCats) homeCats.innerHTML = cats.map(c=>`<div class="m-chip${c.k==='all'?' on':''}" onclick="mHomeCat(this,'${c.k}','${c.l}')">${chipSvg(c.k)}${c.l}</div>`).join('')
  const searchCats = document.getElementById('m-search-cats')
  if (searchCats) searchCats.innerHTML = cats.map(c=>`<div class="m-chip${c.k==='all'?' on':''}" onclick="mSearchCat(this,'${c.k}')">${chipSvg(c.k)}${c.l}</div>`).join('')
  const fcats = [{v:'fruit',l:'果物'},{v:'veg',l:'野菜'},{v:'wood',l:'薪・木材'},{v:'herb',l:'山菜・ハーブ'},{v:'other',l:'加工品'},{v:'misc',l:'その他'}]
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
function mDoSearch() {
  const inp = document.getElementById('m-search-inp') as HTMLInputElement
  const kw = inp?.value.toLowerCase().trim() ?? ''
  let list = mSearchCatKey==='all' ? [...ITEMS] : ITEMS.filter(i=>i.cat===mSearchCatKey)
  if (kw) list = list.filter(i=>i.name.toLowerCase().includes(kw)||i.loc.toLowerCase().includes(kw))
  const t = document.getElementById('m-search-title')
  if (t) t.textContent = kw?`「${kw}」の検索結果 ${list.length}件`:`すべての余りもの (${ITEMS.length}件)`
  renderGrid(list,'m-search-grid','mob')
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
  g.innerHTML = list.length ? list.map(i=>cardHTML(i,mode)).join('') : `<div class="empty-state" style="grid-column:1/-1"><div class="ei">🔍</div><p>見つかりませんでした。<br>別のキーワードで試してみてください。</p></div>`
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
    const desc=document.getElementById('pc-det-desc'); if(desc) desc.textContent=curItem.desc
    const loc=document.getElementById('pc-det-loc'); if(loc) loc.textContent=curItem.loc
    const date=document.getElementById('pc-det-date'); if(date) date.textContent='本日'
    const pcExp = document.getElementById('pc-det-expiry')
    if (pcExp) { const r=formatExpiry(curItem.expiry); pcExp.textContent=r.text; pcExp.style.color=r.color; pcExp.style.fontWeight=r.color?'600':'' }
    setAvt(document.getElementById('pc-det-avt') as HTMLElement|null)
    const sname=document.getElementById('pc-det-sname'); if(sname) sname.textContent=sellerName
    const sloc=document.getElementById('pc-det-sloc'); if(sloc) sloc.textContent=sellerLoc
    const fb=document.getElementById('pc-det-fav-btn'); if(fb){ fb.textContent=favSet.has(curItem.id)?'❤️':'🤍'; fb.classList.toggle('on',favSet.has(curItem.id)) }
    const main=document.getElementById('pc-main'); if(main) main.scrollTop=0
    // SOLD状態の反映
    const pcSoldBanner=document.getElementById('pc-det-sold-banner'); if(pcSoldBanner) pcSoldBanner.style.display=curItem.sold?'flex':'none'
    const pcChatBtn=document.getElementById('pc-det-chat-btn'); if(pcChatBtn) pcChatBtn.style.display=curItem.sold?'none':'flex'
  } else {
    renderDetailGallery(curItem, 'mob')
    setAvt(document.getElementById('m-d-avt') as HTMLElement|null)
    const sname=document.getElementById('m-d-sname'); if(sname) sname.textContent=sellerName
    const sloc=document.getElementById('m-d-sloc'); if(sloc) sloc.textContent=sellerLoc
    const title=document.getElementById('m-d-title'); if(title) title.textContent=curItem.name
    const price=document.getElementById('m-d-price'); if(price) price.innerHTML=`${curItem.price} <small>${curItem.unit}</small>`
    const desc=document.getElementById('m-d-desc'); if(desc) desc.textContent=curItem.desc
    const qty=document.getElementById('m-d-qty'); if(qty) qty.textContent=curItem.unit||'記載なし'
    const cat=document.getElementById('m-d-cat'); if(cat) cat.textContent=CATMAP[curItem.cat]||curItem.cat
    const date=document.getElementById('m-d-date'); if(date) date.textContent='本日'
    const mExp = document.getElementById('m-det-expiry')
    if (mExp) { const r=formatExpiry(curItem.expiry); mExp.textContent=r.text; mExp.style.color=r.color; mExp.style.fontWeight=r.color?'600':'' }
    const fb=document.getElementById('m-fav-btn'); if(fb){ fb.textContent=favSet.has(curItem.id)?'❤️':'🤍'; fb.classList.toggle('on',favSet.has(curItem.id)) }
    // SOLD状態の反映
    const mSoldBanner=document.getElementById('m-det-sold-banner'); if(mSoldBanner) mSoldBanner.style.display=curItem.sold?'flex':'none'
    const mChatBtn=document.getElementById('m-det-chat-btn'); if(mChatBtn) mChatBtn.style.display=curItem.sold?'none':'flex'
    mNav('ms-detail')
  }
}

/* ── FAV ── */
function toggleFav(mode: string) {
  const btn = document.getElementById(mode==='pc'?'pc-det-fav-btn':'m-fav-btn')
  if (!btn) return
  if (favSet.has(curItem.id)) { favSet.delete(curItem.id); btn.textContent='🤍'; btn.classList.remove('on'); showToast('お気に入りから外しました') }
  else { favSet.add(curItem.id); btn.textContent='❤️'; btn.classList.add('on'); showToast('お気に入りに追加しました') }
  const pfs=document.getElementById('pc-fav-sub'); if(pfs) pfs.textContent=`${favSet.size}件`
  const mfs=document.getElementById('m-fav-sub'); if(mfs) mfs.textContent=`${favSet.size}件`
}
function showFavs(mode: string) {
  const favItems = ITEMS.filter(i=>favSet.has(i.id))
  if (mode==='pc') { renderMyListings('pc','お気に入り',favItems); pcGo('mylistings') }
  else { renderMyListings('mob','お気に入り',favItems); mNav('ms-mylistings') }
}

/* ── CHAT ── */
const BG_STYLES: Record<string,string> = {
  bk:'linear-gradient(135deg,#fff3e0,#ffe0b2)',
  bg:'linear-gradient(135deg,#f1f8e9,#dcedc8)',
  bb:'linear-gradient(135deg,#f0ebe3,#e0d5c0)',
  by:'linear-gradient(135deg,#fdf8e8,#fdf0cc)',
}
function setCisIcon(elId: string, chatId: string) {
  const el = document.getElementById(elId)
  if (!el) return
  const chat = CHATS[chatId]
  if (!chat) return
  const item = ITEMS.find(x => x.id === chat.itemId)
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
}
function mOpenChatFromDetail() {
  const key = getOrCreateChatKey(curItem)
  if (!key) return
  openChat(key,'mob')
  renderChatList('mob')
}
function openChat(chatId: string, mode: string) {
  openChatCore(chatId); const c=CHATS[chatId]
  if (c?.supabaseId && CURRENT_USER_ID) subscribeToChat(c.supabaseId, chatId)
  else unsubscribeFromChat()
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
/* ── TRADE COMPLETE ── */
let tradeModalMode = 'pc'
function openTradeModal(mode: string) {
  const chat = CHATS[curChatId]
  if (!chat) return
  const item = ITEMS.find(x => x.id === chat.itemId)
  if (!item || item.sold) return
  tradeModalMode = mode
  document.getElementById('trade-modal')?.classList.remove('hidden')
}
function closeTradeModal() {
  document.getElementById('trade-modal')?.classList.add('hidden')
}
function confirmCompleteTrade() {
  const chat = CHATS[curChatId]
  if (!chat) { closeTradeModal(); return }
  const item = ITEMS.find(x => x.id === chat.itemId)
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
  closeTradeModal()
  showToast('取引が完了しました！')
}
function updateCompleteBtn(mode: string) {
  const chat = CHATS[curChatId]
  const item = chat ? ITEMS.find(x => x.id === chat.itemId) : null
  const isSold = item?.sold ?? false
  const btn = document.getElementById(mode==='pc'?'pc-complete-btn':'m-complete-btn') as HTMLButtonElement|null
  if (!btn) return
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
    seller: row.profiles?.name || '出品者',
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

/* ── REALTIME CHAT ── */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let activeRealtimeChannel: any = null

function unsubscribeFromChat() {
  if (activeRealtimeChannel) {
    createClient().removeChannel(activeRealtimeChannel)
    activeRealtimeChannel = null
  }
}

function subscribeToChat(supabaseChatId: string, chatKey: string) {
  unsubscribeFromChat()
  const supabase = createClient()
  const channel = supabase
    .channel(`messages-${supabaseChatId}`)
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'messages',
      filter: `chat_id=eq.${supabaseChatId}`,
    }, (payload) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const m = payload.new as any
      const mid = m.id as string | undefined
      if (!CHATS[chatKey] || !mid) return
      if (CHATS[chatKey].msgs.some((x) => x.id === mid)) return
      const t = new Date(m.created_at)
      const time = t.getHours() + ':' + String(t.getMinutes()).padStart(2, '0')
      const from = m.sender_id === CURRENT_USER_ID ? 'me' : 'them'
      CHATS[chatKey].msgs.push({ from, text: m.text, time, id: mid, createdAt: m.created_at })
      CHATS[chatKey].lastAt = new Date(m.created_at).getTime()
      if (from === 'them' && curChatId !== chatKey) CHATS[chatKey].unread = (CHATS[chatKey].unread || 0) + 1
      if (curChatId === chatKey) {
        const pcChatVisible = (document.getElementById('pc-panel-chat')?.style.display || '') !== 'none'
        renderMsgs(pcChatVisible ? 'pc' : 'mob')
      }
      renderChatList('pc')
      renderChatList('mob')
    })
    .subscribe((status) => {
      console.log('[meguru] realtime:', status, supabaseChatId.slice(0, 8))
    })
  activeRealtimeChannel = channel
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

async function loadChatsFromSupabase() {
  if (!CURRENT_USER_ID) return
  try {
    const supabase = createClient()
    const { data: chatsData, error } = await supabase
      .from('chats')
      .select(`id, created_at, buyer_id, seller_id, item_id,
        buyer:buyer_id(id, name, area),
        seller:seller_id(id, name, area),
        item:item_id(id, name, price, unit, category, images)`)
      .or(`buyer_id.eq.${CURRENT_USER_ID},seller_id.eq.${CURRENT_USER_ID}`)
      .order('created_at', { ascending: false })
    if (error) { console.error('[meguru] loadChats error:', error.message, error.code); return }
    Object.keys(CHATS).forEach((k) => { if (k.startsWith('sb_')) delete CHATS[k] })
    if (!chatsData || chatsData.length === 0) {
      console.log('[meguru] loadChats: 0 chats')
      renderChatList('pc')
      renderChatList('mob')
      return
    }

    // 全チャットのメッセージを一括取得
    const chatIds = (chatsData as any[]).map((c) => c.id)
    const { data: allMsgs } = await supabase
      .from('messages')
      .select('id, chat_id, sender_id, text, created_at')
      .in('chat_id', chatIds)
      .order('created_at', { ascending: true })

    for (const chat of chatsData as any[]) {
      const key = `sb_${chat.id}`
      const other = chat.buyer_id === CURRENT_USER_ID ? chat.seller : chat.buyer
      const item = chat.item
      const myMsgs = (allMsgs || []).filter((m: any) => m.chat_id === chat.id)
      const lastMsg = myMsgs[myMsgs.length - 1]
      const readMs = getSupabaseChatLastReadMs(chat.id)
      const unread = myMsgs.filter(
        (m: any) => m.sender_id !== CURRENT_USER_ID && new Date(m.created_at).getTime() > readMs
      ).length
      const inMemItem = ITEMS.find(i => (i as Item).supabaseId === item?.id)
      CHATS[key] = {
        name: other?.name || '出品者',
        sub: other?.area || '駒ヶ根市',
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
      }
    }
    console.log('[meguru] loadChats: loaded', chatsData.length, 'chats from Supabase')
    renderChatList('pc')
    renderChatList('mob')
  } catch (e) { console.error('[meguru] loadChatsFromSupabase error:', e) }
}

async function openChatWithSupabase(mode: string) {
  if (curItem.mine) { showToast('自分の出品にはチャットできません'); return }
  if (!CURRENT_USER_ID || !curItem.supabaseId || !curItem.userId) {
    // 未ログインまたはデモアイテムはモック動作
    if (mode === 'pc') pcOpenChatFromDetail(); else mOpenChatFromDetail()
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
      }
    } else {
      const row = CHATS[key]
      row.name = curItem.seller.replace(/（[^）]*）/g, '').trim()
      row.sub = curItem.sloc
      row.ie = curItem.emoji
      row.in_ = curItem.name
      row.ip = `${curItem.price}${curItem.unit ? ' ' + curItem.unit : ''}`.trim()
      row.itemId = curItem.id
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
    const { data, error } = await supabase
      .from('items')
      .select('*, profiles(name, area)')
      .order('created_at', { ascending: false })
    if (error) { console.error('[meguru] Supabase load error:', error); return false }
    if (!data || data.length === 0) { console.log('[meguru] Supabase: 0 items'); return false }
    const mapped = data.map((row) => mapSupabaseItem(row, userId))
    ITEMS.splice(0, ITEMS.length, ...mapped)
    console.log('[meguru] Supabase: loaded', ITEMS.length, 'items')
    return true
  } catch (e) {
    console.error('[meguru] loadItemsFromSupabase error:', e)
    return false
  }
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
}

/* ── NOTIF ── */
function renderPcNotifs() {
  const el=document.getElementById('pc-notif-list')
  if (el) el.innerHTML=NOTIFS.map((n,i)=>`<div class="n-item${n.unread?' unread':''}" onclick="notifTap(${i},'pc')"><div class="n-icon ${n.cls}">${n.icon}</div><div style="flex:1"><p class="n-title">${n.title}</p><p class="n-sub">${n.sub}</p></div><span class="n-time">${n.time}</span>${n.unread?'<div class="n-dot"></div>':''}</div>`).join('')
}
function renderMobNotifs() {
  const el=document.getElementById('m-notif-body')
  if (el) el.innerHTML=NOTIFS.map((n,i)=>`<div class="m-n-item${n.unread?' unread':''}" onclick="notifTap(${i},'mob')"><div class="m-n-icon ${n.cls}">${n.icon}</div><div style="flex:1"><p class="m-n-title">${n.title}</p><p class="m-n-sub">${n.sub}</p></div><span class="m-n-time">${n.time}</span>${n.unread?'<div class="m-n-dot"></div>':''}</div>`).join('')
  const dot=document.getElementById('m-notif-dot'); if(dot) dot.style.display='none'
}
function notifTap(i: number, mode: string) {
  NOTIFS[i].unread=false
  const key=NOTIFS[i].chatKey; if(key) openChat(key,mode)
}

/* ── MYPAGE ── */
function updateMypage(mode: string) {
  const mine=ITEMS.filter(i=>i.mine)
  if (mode==='pc') {
    const cnt=document.getElementById('pc-mp-cnt'); if(cnt) cnt.textContent=String(mine.length)
    const sub=document.getElementById('pc-mp-sub'); if(sub) sub.textContent=`${mine.length}件出品中`
    const fs=document.getElementById('pc-fav-sub'); if(fs) fs.textContent=`${favSet.size}件`
  } else {
    const cnt=document.getElementById('m-mp-cnt'); if(cnt) cnt.textContent=String(mine.length)
    const sub=document.getElementById('m-mp-sub'); if(sub) sub.textContent=`${mine.length}件出品中`
    const fs=document.getElementById('m-fav-sub'); if(fs) fs.textContent=`${favSet.size}件`
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
  const add = imgs.length<10
    ? `<button class="pf-img-add" onclick="document.getElementById('${fileInputId}').click()"><svg viewBox="0 0 24 24" stroke="currentColor" fill="none" stroke-width="1.8" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg><span>${imgs.length}/10</span></button>`
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
function addPhotos(input: HTMLInputElement, mode: string) {
  const imgs = mode==='pc' ? pcImages : mobImages
  const files = Array.from(input.files||[]).slice(0, 10-imgs.length)
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
    if (distSel && currentCity && DISTRICT_DATA[currentCity]) {
      distSel.innerHTML = '<option value="">地区（任意）</option>' +
        DISTRICT_DATA[currentCity].map(d => `<option value="${d}">${d}</option>`).join('')
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
  const districts = city ? (DISTRICT_DATA[city] || []) : []
  if (districts.length === 0) {
    distSel.innerHTML = '<option value="">地区（任意）</option>'; distSel.disabled = true
  } else {
    distSel.innerHTML = '<option value="">地区（任意）</option>' +
      districts.map(d => `<option value="${d}">${d}</option>`).join('')
    distSel.disabled = false
  }
}

function submitPost(mode: string) {
  const isPC=mode==='pc'
  const name=(document.getElementById(isPC?'pc-post-name':'m-post-name') as HTMLInputElement)?.value.trim()
  const price=(document.getElementById(isPC?'pc-post-price':'m-post-price') as HTMLInputElement)?.value.trim()
  const unit=(document.getElementById(isPC?'pc-post-unit':'m-post-unit') as HTMLInputElement)?.value.trim()
  const pre = isPC ? 'pc' : 'm'
  const locCity=(document.getElementById(`${pre}-post-loc-city`) as HTMLSelectElement)?.value||''
  const locDist=(document.getElementById(`${pre}-post-loc-dist`) as HTMLSelectElement)?.value||''
  const loc=[locCity, locDist].filter(Boolean).join(' ')  
  const isFree=isPC?pcFreeTog:mobFreeTog
  const cat=isPC?pcPostCat:mobPostCat
  if (!name) { showToast('余りものの名前を入力してください'); return }
  if (!isFree&&!price) { showToast('価格を入力するか、無料に設定してください'); return }
  const allImgs = isPC ? [...pcImages] : [...mobImages]
  const expiry = (document.getElementById(isPC?'pc-post-expiry':'m-post-expiry') as HTMLInputElement)?.value || ''
  const newItem: Item = {id:Date.now(),name,cat,price:isFree?'無料':`¥${Number(price).toLocaleString()}`,unit:unit?`/ ${unit}`:'',emoji:EMOJIMAP[cat]||'📦',bg:BGMAP[cat]||'by',loc:loc||(getUserCity()||'駒ヶ根市'),badge:isFree?'free':'new',seller:USER.name,sloc:USER.area,savt:'🧑',desc:(document.getElementById(isPC?'pc-post-desc':'m-post-desc') as HTMLTextAreaElement)?.value||'詳細は出品者にお問い合わせください。',mine:true,chatKey:'',imgSrc:allImgs[0]||'',images:allImgs,expiry:expiry||undefined}
  ITEMS.unshift(newItem)
  saveItems()

  // Supabase に保存（ログイン済みの場合）
  console.log('[meguru] CURRENT_USER_ID at submitPost:', CURRENT_USER_ID)
  if (CURRENT_USER_ID) {
    const pre2 = isPC ? 'pc' : 'm'
    const getCheckedVals = (ids: string[], labels: string[]) =>
      ids.reduce<string[]>((acc, id, i) => {
        if ((document.getElementById(id) as HTMLInputElement|null)?.checked) acc.push(labels[i])
        return acc
      }, [])
    const availDays = getCheckedVals(
      [`${pre2}-day-wd`,`${pre2}-day-sat`,`${pre2}-day-sun`],
      ['平日','土曜','日曜']
    )
    const availTimes = getCheckedVals(
      [`${pre2}-time-am`,`${pre2}-time-pm`,`${pre2}-time-ev`],
      ['午前','午後','夜']
    )
    ;(async () => {
      const supabase = createClient()

      // セッション確認
      const { data: { user }, error: userErr } = await supabase.auth.getUser()
      console.log('[meguru] auth.getUser:', user?.id, '| error:', userErr?.message)
      if (!user) {
        console.error('[meguru] not authenticated – skipping Supabase insert')
        return
      }

      // profiles 行を確認・なければ作成（外部キー対策）
      const { error: profErr } = await supabase
        .from('profiles')
        .upsert({ id: user.id }, { onConflict: 'id', ignoreDuplicates: true })
      if (profErr) console.warn('[meguru] profiles upsert warn:', profErr.message, profErr.code)

      const payload = {
        user_id: user.id,
        name: newItem.name,
        category: newItem.cat,
        price: newItem.price,
        unit: unit || '',
        is_free: isFree,
        description: newItem.desc,
        location: newItem.loc,
        images: allImgs,
        condition: isPC ? pcCondition : mobCondition,
        pesticide: isPC ? pcPesticide : mobPesticide,
        available_days: availDays,
        available_times: availTimes,
        deadline: expiry || null,
        is_sold: false,
      }
      console.log('[meguru] inserting to items:', {
        ...payload,
        images: `[${payload.images.length} images]`,
      })

      const { error } = await supabase.from('items').insert(payload)
      if (error) {
        console.error('[meguru] Supabase save failed:', {
          message: error.message,
          code:    error.code,
          details: error.details,
          hint:    error.hint,
        })
      } else {
        console.log('[meguru] Supabase: item saved successfully')
      }
    })()
  } else {
    console.warn('[meguru] CURRENT_USER_ID is null – item saved to localStorage only')
  }

  const cce=document.getElementById(`${pre}-cc-emoji`); if(cce) cce.textContent=newItem.emoji
  const ccn=document.getElementById(`${pre}-cc-name`); if(ccn) ccn.textContent=name
  const ccp=document.getElementById(`${pre}-cc-price`); if(ccp) ccp.textContent=isFree?'無料':`¥${Number(price).toLocaleString()} / ${unit}`
  const ccl=document.getElementById(`${pre}-cc-loc`); if(ccl) ccl.textContent=loc||'駒ヶ根市内';
  (['name','desc','price','unit','loc'] as const).forEach(f=>{const el=document.getElementById(`${isPC?'pc':'m'}-post-${f}`) as HTMLInputElement; if(el){el.value='';el.disabled=false}})
  if (isPC) {
    pcFreeTog=false; pcImages=[]; pcCondition=''; pcPesticide=''
    document.getElementById('pc-free-row')?.classList.remove('on')
    renderPhotoGrid('pc')
    document.querySelectorAll('#pc-pg-post .sel-opt').forEach(o=>o.classList.remove('on'));
    (['pc-post-qty','pc-post-expiry'] as const).forEach(id=>{const el=document.getElementById(id) as HTMLInputElement|null;if(el)el.value=''})
    ;(['pc-day-wd','pc-day-sat','pc-day-sun','pc-time-am','pc-time-pm','pc-time-ev'] as const).forEach(id=>{const el=document.getElementById(id) as HTMLInputElement|null;if(el)el.checked=false})
  } else {
    mobFreeTog=false; mobImages=[]; mobCondition=''; mobPesticide=''
    document.getElementById('m-free-row')?.classList.remove('on')
    renderPhotoGrid('mob')
    document.querySelectorAll('#ms-post .sel-opt').forEach(o=>o.classList.remove('on'));
    (['m-post-qty','m-post-expiry'] as const).forEach(id=>{const el=document.getElementById(id) as HTMLInputElement|null;if(el)el.value=''})
    ;(['m-day-wd','m-day-sat','m-day-sun','m-time-am','m-time-pm','m-time-ev'] as const).forEach(id=>{const el=document.getElementById(id) as HTMLInputElement|null;if(el)el.checked=false})
  }
  applyPcFilter(); applyMobFilter()
  if (isPC) { pcGo('complete') } else { mStk=['ms-home']; mNav('ms-complete') }
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

/* ── GLOBAL USER UPDATE ── */
function updateAllUserRefs() {
  const avHtml = USER.avt
    ? `<img src="${USER.avt}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;" />`
    : null
  // Mypage headers
  ;(['pc-mp-name-el','m-mp-name-el'] as const).forEach(id => { const el=document.getElementById(id); if(el) el.textContent=USER.name })
  ;(['pc-mp-area-el','m-mp-area-el'] as const).forEach(id => { const el=document.getElementById(id); if(el) el.textContent=`${USER.area} · 2025年から利用中` })
  if (avHtml) {
    ;(['pc-mp-avt-el','m-mp-avt-el'] as const).forEach(id => { const el=document.getElementById(id) as HTMLElement|null; if(el){el.style.fontSize='0';el.innerHTML=avHtml} })
  }
  // Profile form previews
  ;(['pc-prof-name','m-prof-name'] as const).forEach(id => { const el=document.getElementById(id) as HTMLInputElement|null; if(el) el.value=USER.name })
  ;(['pc-prof-area','m-prof-area'] as const).forEach(id => { const el=document.getElementById(id) as HTMLInputElement|null; if(el) el.value=USER.area })
  const pcPN=document.querySelector('.pc-prof-name') as HTMLElement|null; if(pcPN) pcPN.textContent=USER.name
  const mPN=document.getElementById('m-prof-preview-name') as HTMLElement|null; if(mPN) mPN.textContent=USER.name
  // Update mine items seller data
  ITEMS.filter(i=>i.mine).forEach(i => { i.seller=USER.name; i.sloc=USER.area })
  // Re-render grids so mine cards reflect updated name
  updateAreaDisplay()
  applyPcFilter(); applyMobFilter()
  // If detail page is showing a mine item, re-populate seller section
  if (curItem.mine) {
    const avtEl=document.getElementById('pc-det-avt') as HTMLElement|null
    if (avtEl) { if(avHtml){avtEl.style.fontSize='0';avtEl.innerHTML=avHtml}else{avtEl.style.fontSize='';avtEl.textContent='🧑'} }
    const snEl=document.getElementById('pc-det-sname'); if(snEl) snEl.textContent=USER.name
    const slEl=document.getElementById('pc-det-sloc'); if(slEl) slEl.textContent=USER.area
    const mAvt=document.getElementById('m-d-avt') as HTMLElement|null
    if (mAvt) { if(avHtml){mAvt.style.fontSize='0';mAvt.innerHTML=avHtml}else{mAvt.style.fontSize='';mAvt.textContent='🧑'} }
    const mSn=document.getElementById('m-d-sname'); if(mSn) mSn.textContent=USER.name
    const mSl=document.getElementById('m-d-sloc'); if(mSl) mSl.textContent=USER.area
  }
}

/* ── PROFILE ── */
function saveProfile() {
  const isPC = window.innerWidth >= 768
  const name = ((document.getElementById(isPC ? 'pc-prof-name' : 'm-prof-name') as HTMLInputElement)?.value || USER.name).trim()
  const area = ((document.getElementById(isPC ? 'pc-prof-area' : 'm-prof-area') as HTMLInputElement)?.value || USER.area).trim()
  const bio  = ((document.getElementById(isPC ? 'pc-prof-bio'  : 'm-prof-bio')  as HTMLTextAreaElement)?.value || '').trim()

  // アバター画像
  const pcImg = document.querySelector('#pc-avt-display img') as HTMLImageElement|null
  const mImg  = document.querySelector('#m-avt-display img')  as HTMLImageElement|null
  const newAvt = pcImg?.src || mImg?.src || USER.avt

  // グローバルステートを更新
  USER.name = name
  USER.area = area
  USER.bio  = bio
  USER.avt  = newAvt

  // アバター表示を両フォームに同期
  if (newAvt) {
    const avHtml = `<img src="${newAvt}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;" />`
    ;(['pc-avt-display','m-avt-display'] as const).forEach(id => {
      const el = document.getElementById(id) as HTMLElement|null
      if (el && !el.querySelector('img')) { el.style.fontSize='0'; el.innerHTML=avHtml }
    })
  }

  // 全箇所に即時反映
  updateAllUserRefs()

  showToast('プロフィールを保存しました')
  if (isPC) pcGo('mypage'); else mBack()
}

/* ══════════════════ COMPONENT ══════════════════ */
export default function Page() {
  const router = useRouter()
  const [userEmail, setUserEmail] = useState<string | null>(null)

  async function handleLogout() {
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
    w.toggleAreaFilter= toggleAreaFilter

    // ── 認証状態変化の監視
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      CURRENT_USER_ID = session?.user?.id ?? null
      setUserEmail(session?.user?.email ?? null)
      if (!session?.user) {
        unsubscribeFromChat()
        Object.keys(CHATS).forEach((k) => { if (k.startsWith('sb_')) delete CHATS[k] })
      }
      loadChatsFromSupabase().then(() => {
        renderChatList('pc')
        renderChatList('mob')
      })
    })

    // ── 非同期初期化
    async function init() {
      // 初期セッション取得（未ログインはログインへ）
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        window.location.href = '/login'
        return
      }
      const userId = session.user.id
      CURRENT_USER_ID = userId
      setUserEmail(session.user.email ?? null)

      // スケルトン表示
      renderSkeletonGrid('pc-grid')
      renderSkeletonGrid('m-home-grid')

      // エリア設定を復元
      const hasArea = initAreaFromStorage()
      updateAreaDisplay()

      // Supabase からアイテムを読み込み（失敗時は localStorage にフォールバック）
      const loaded = await loadItemsFromSupabase(userId)
      if (!loaded) initItemsFromStorage()

      // グリッド・各UIを初期化
      initPcCats()
      applyPcFilter()
      applyMobFilter()
      initPostLocSelects()

      // ログイン済みでエリア未設定なら選択モーダルを表示
      if (userId && !hasArea) setTimeout(showAreaModal, 800)
      initMobCats()

      // Supabase チャット一覧を読み込み（非同期 - UIブロックなし）
      loadChatsFromSupabase().then(() => {
        renderChatList('pc')
        renderChatList('mob')
      })
      renderChatList('pc')
      renderChatList('mob')
      renderTxHistory('pc')
      renderTxHistory('mob')
      const hasUnread = NOTIFS.some(n=>n.unread)
      const dot = document.getElementById('m-notif-dot')
      if (dot) dot.style.display = hasUnread ? 'block' : 'none'
    }

    init()

    return () => subscription.unsubscribe()
  }, [])

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
            <button className="sb-item"    id="sb-wood"  onClick={(e) => pcSbCat(e.currentTarget, 'wood')}>
              <span className="sbi"><svg viewBox="0 0 24 24"><circle cx="7" cy="16" r="5.5"/><circle cx="7" cy="16" r="3"/><circle cx="17" cy="16" r="5.5"/><circle cx="17" cy="16" r="3"/><circle cx="12" cy="8" r="5.5"/><circle cx="12" cy="8" r="3"/></svg></span>薪・木材
            </button>
            <button className="sb-item"    id="sb-herb"  onClick={(e) => pcSbCat(e.currentTarget, 'herb')}>
              <span className="sbi"><svg viewBox="0 0 24 24"><line x1="12" y1="22" x2="12" y2="14"/><path d="M12 16 Q6 14 4 9 Q6 5 10 8 Q11 12 12 16z"/><path d="M12 16 Q18 14 20 9 Q18 5 14 8 Q13 12 12 16z"/><path d="M12 12 Q10 6 12 2 Q14 6 12 12z"/></svg></span>山菜
            </button>
            <button className="sb-item"    id="sb-other" onClick={(e) => pcSbCat(e.currentTarget, 'other')}>
              <span className="sbi"><svg viewBox="0 0 24 24"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/><line x1="12" y1="12" x2="12" y2="17"/><line x1="9.5" y1="14.5" x2="14.5" y2="14.5"/></svg></span>加工品・その他
            </button>
            <p className="sb-section">マイページ</p>
            <button className="sb-item" onClick={() => pcGo('chatlist')}>
              <span className="sbi"><svg viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg></span>やりとり
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
                  <div className="area-tog-row" style={{marginTop:'9px'}}>
                    <button id="pc-area-tog-local" className="area-tog on" onClick={() => toggleAreaFilter('local')}>このエリアのみ</button>
                    <button id="pc-area-tog-all" className="area-tog" onClick={() => toggleAreaFilter('all')}>全国を見る</button>
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

            {/* POST */}
            <div id="pc-pg-post" style={{display:'none'}}>
              <div className="pc-ph"><div><h1 className="pc-ph-title">余りものを出品する</h1><p className="pc-ph-sub">写真を撮って、情報を入力するだけ。</p></div></div>
              <div style={{maxWidth:'680px',display:'flex',flexDirection:'column',gap:'18px'}}>
                {/* 写真 */}
                <div className="fg">
                  <label className="lbl">写真 <small>最大10枚・1枚目がメイン画像</small></label>
                  <input type="file" id="pc-photo-file" accept="image/*" multiple style={{display:'none'}} onChange={(e)=>addPhotos(e.currentTarget,'pc')} />
                  <div id="pc-photo-grid" className="pf-imgs">
                    <button className="pf-img-add" onClick={()=>(document.getElementById('pc-photo-file') as HTMLInputElement)?.click()}>
                      <svg viewBox="0 0 24 24" stroke="currentColor" fill="none" strokeWidth="1.8" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                      <span>0/10</span>
                    </button>
                  </div>
                </div>
                {/* カテゴリ */}
                <div className="fg"><label className="lbl">カテゴリ <em>*</em></label><div className="fchips" id="pc-form-cats"></div></div>
                {/* 名前 */}
                <div className="fg"><label className="lbl">余りものの名前 <em>*</em></label><input className="inp" id="pc-post-name" placeholder="例：渋柿" style={{maxWidth:'440px'}} /></div>
                {/* 数量 */}
                <div className="fg"><label className="lbl">数量 <small>任意</small></label><input className="inp" id="pc-post-qty" placeholder="例：約15kg・10袋・ひとかご分" style={{maxWidth:'360px'}} /></div>
                {/* 商品の状態 */}
                <div className="fg">
                  <label className="lbl">商品の状態</label>
                  <div className="sel-opts">
                    {(['未使用','良好','やや傷あり','傷あり'] as const).map(c=>(
                      <button key={c} className="sel-opt" data-v={c} onClick={(e)=>selectCondition(e.currentTarget,'pc')}>{c}</button>
                    ))}
                  </div>
                </div>
                {/* 説明 */}
                <div className="fg"><label className="lbl">説明 <small>任意</small></label><textarea className="txta" id="pc-post-desc" placeholder="形は悪いけど味は最高！受け取りは土日OK など" style={{maxWidth:'560px',height:'80px'}}></textarea></div>
                <hr className="pf-section" />
                {/* 価格 */}
                <div className="fg">
                  <label className="lbl">希望価格 <em>*</em></label>
                  <div className="price-row" style={{maxWidth:'440px'}}><input className="inp" type="number" id="pc-post-price" placeholder="金額（円）" /><input className="inp" id="pc-post-unit" placeholder="単位（袋・kgなど）" /></div>
                  <div className="free-row" id="pc-free-row" onClick={()=>toggleFree('pc')}><div className="tog"></div><span style={{fontSize:'.8rem',fontWeight:500,color:'var(--ink2)'}}>無料でおすそわけする</span></div>
                </div>
                {/* 受け渡し場所 */}
                <div className="fg">
                  <label className="lbl">受け渡し場所 <small>任意</small></label>
                  <div className="loc-sel-row">
                    <select className="inp loc-sel" id="pc-post-loc-pref" onChange={(e) => onPostLocPrefChange(e.target as HTMLSelectElement)}><option value="">都道府県（任意）</option></select>
                    <select className="inp loc-sel" id="pc-post-loc-city" disabled onChange={(e) => onPostLocCityChange(e.target as HTMLSelectElement)}><option value="">市区町村</option></select>
                    <select className="inp loc-sel" id="pc-post-loc-dist" disabled><option value="">地区（任意）</option></select>
                  </div>
                </div>
                <hr className="pf-section" />
                {/* 受け渡し可能日時 */}
                <div className="fg">
                  <label className="lbl">受け渡し可能日時 <small>任意</small></label>
                  <div style={{display:'flex',flexDirection:'column',gap:'10px'}}>
                    <div>
                      <p style={{fontSize:'.74rem',color:'var(--mu)',marginBottom:'7px',fontWeight:500}}>曜日</p>
                      <div className="pickup-row">
                        <label className="chk-lbl"><input type="checkbox" id="pc-day-wd" /><span>平日</span></label>
                        <label className="chk-lbl"><input type="checkbox" id="pc-day-sat" /><span>土曜</span></label>
                        <label className="chk-lbl"><input type="checkbox" id="pc-day-sun" /><span>日曜</span></label>
                      </div>
                    </div>
                    <div>
                      <p style={{fontSize:'.74rem',color:'var(--mu)',marginBottom:'7px',fontWeight:500}}>時間帯</p>
                      <div className="pickup-row">
                        <label className="chk-lbl"><input type="checkbox" id="pc-time-am" /><span>午前</span></label>
                        <label className="chk-lbl"><input type="checkbox" id="pc-time-pm" /><span>午後</span></label>
                        <label className="chk-lbl"><input type="checkbox" id="pc-time-ev" /><span>夜</span></label>
                      </div>
                    </div>
                  </div>
                </div>
                {/* 農薬 */}
                <div className="fg">
                  <label className="lbl">農薬の使用</label>
                  <div className="sel-opts">
                    {(['使用なし','使用あり','不明'] as const).map(p=>(
                      <button key={p} className="sel-opt" data-v={p} onClick={(e)=>selectPesticide(e.currentTarget,'pc')}>{p}</button>
                    ))}
                  </div>
                </div>
                {/* 受け取り期限 */}
                <div className="fg"><label className="lbl">受け取り期限 <small>任意</small></label><input className="inp" type="date" id="pc-post-expiry" style={{maxWidth:'200px'}} /></div>
                <div className="hint"><span style={{fontSize:'.95rem',flexShrink:0}}>💡</span><p>詳しい住所はチャットで直接決めてOKです。掲示板には住所は出ません。</p></div>
                <div className="pc-post-actions">
                  <button className="pc-cancel" onClick={()=>pcGo('listing')}>キャンセル</button>
                  <button className="pc-submit" onClick={()=>submitPost('pc')}>出品する →</button>
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
                      <div className="pc-det-rating">
                        <svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                        5.0
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
                      <button className="pc-det-fav" id="pc-det-fav-btn" onClick={() => toggleFav('pc')}>🤍</button>
                      <button className="pc-det-chat" id="pc-det-chat-btn" onClick={() => openChatWithSupabase('pc')}>
                        <svg viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                        チャットで相談する
                      </button>
                    </div>
                    <hr className="pc-det-divider" />
                    {/* 説明 */}
                    <p className="pc-det-sect-lbl">商品の説明</p>
                    <p className="pc-det-desc-box" id="pc-det-desc">—</p>
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
                <div className="pc-comp-ring">🎉</div>
                <h2 className="pc-comp-title">出品しました！</h2>
                <p className="pc-comp-sub">地域の掲示板に載りました。<br />欲しい人からチャットが届いたらお知らせします。</p>
                <div className="pc-comp-card">
                  <p className="pc-comp-card-label">出品した余りもの</p>
                  <div className="cc-row"><span className="cc-e" id="pc-cc-emoji">📦</span><div className="cc-t"><strong id="pc-cc-name">—</strong><br /><span id="pc-cc-price">—</span></div></div>
                  <div className="cc-row"><span className="cc-e">📍</span><div className="cc-t" id="pc-cc-loc">—</div></div>
                  <div className="cc-row"><span className="cc-e">✅</span><div className="cc-t">手数料：取引成立時のみ 12%</div></div>
                </div>
                <div className="pc-comp-btns">
                  <button className="pc-comp-main" onClick={() => pcGo('listing')}>一覧に戻る</button>
                  <button className="pc-comp-sec" onClick={() => pcGo('post')}>続けて出品する</button>
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
                  {userEmail && <p style={{fontSize:'.73rem',color:'var(--mu)',marginTop:'3px',letterSpacing:'.02em'}}>{userEmail}</p>}
                </div>
                <div className="pc-mp-stats">
                  <div className="pc-mp-stat"><div className="pc-mp-stat-num" id="pc-mp-cnt">—</div><div className="pc-mp-stat-lbl">出品中</div></div>
                  <div className="pc-mp-stat"><div className="pc-mp-stat-num">12</div><div className="pc-mp-stat-lbl">取引完了</div></div>
                  <div className="pc-mp-stat"><div className="pc-mp-stat-num">★4.9</div><div className="pc-mp-stat-lbl">評価</div></div>
                </div>
              </div>
              <p className="pc-mp-sec">出品・取引</p>
              <div className="pc-mp-grid">
                <div className="pc-mp-row" onClick={() => pcSubPage('mylistings')}><div className="pc-mp-row-icon ri-k">📦</div><div><div className="pc-mp-row-label">出品中のもの</div><div className="pc-mp-row-sub" id="pc-mp-sub">—</div></div><span className="pc-mp-arrow">›</span></div>
                <div className="pc-mp-row" onClick={() => pcSubPage('txhistory')}><div className="pc-mp-row-icon ri-g">📋</div><div><div className="pc-mp-row-label">取引履歴</div><div className="pc-mp-row-sub">完了12件</div></div><span className="pc-mp-arrow">›</span></div>
                <div className="pc-mp-row" onClick={() => showFavs('pc')}><div className="pc-mp-row-icon ri-k">❤️</div><div><div className="pc-mp-row-label">お気に入り</div><div className="pc-mp-row-sub" id="pc-fav-sub">0件</div></div><span className="pc-mp-arrow">›</span></div>
                <div className="pc-mp-row" onClick={() => pcSubPage('profedit')}><div className="pc-mp-row-icon ri-b">✏️</div><div className="pc-mp-row-label">プロフィール編集</div><span className="pc-mp-arrow">›</span></div>
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
                <div><h1 className="pc-ph-title">プロフィール編集</h1></div>
                <button style={{padding:'9px 22px',background:'var(--g)',color:'#fff',border:'none',borderRadius:'8px',fontSize:'.84rem',fontWeight:700,letterSpacing:'.06em'}} onClick={saveProfile}>保存する</button>
              </div>
              <div className="pc-prof-head">
                <div className="pc-prof-avt" style={{cursor:'pointer'}} onClick={() => (document.getElementById('pc-avatar-file') as HTMLInputElement)?.click()}>
                  <span id="pc-avt-display" style={{display:'flex',alignItems:'center',justifyContent:'center',width:'100%',height:'100%',fontSize:'2rem',borderRadius:'50%',overflow:'hidden'}}>🧑</span>
                  <div className="pc-prof-edit">
                    <svg viewBox="0 0 24 24" width="12" height="12" stroke="#fff" fill="none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
                  </div>
                  <input type="file" id="pc-avatar-file" accept="image/*" style={{display:'none'}} onChange={(e) => {
                    const file = e.currentTarget.files?.[0]
                    if (!file) return
                    const url = URL.createObjectURL(file)
                    const el = document.getElementById('pc-avt-display') as HTMLElement | null
                    if (el) { el.style.fontSize = '0'; el.innerHTML = `<img src="${url}" style="width:100%;height:100%;object-fit:cover;" />` }
                  }} />
                </div>
                <p className="pc-prof-name">田中 拓也</p>
              </div>
              <div className="pc-form-full">
                <div className="fg"><label className="lbl">名前</label><input className="inp" id="pc-prof-name" defaultValue="田中 拓也" style={{maxWidth:'360px'}} /></div>
                <div className="fg"><label className="lbl">お住まいのエリア</label><input className="inp" id="pc-prof-area" defaultValue="長野県駒ヶ根市" style={{maxWidth:'360px'}} /></div>
                <div className="fg"><label className="lbl">自己紹介 <small>任意</small></label><textarea className="txta" id="pc-prof-bio" style={{maxWidth:'560px',height:'80px'}} defaultValue="駒ヶ根で農業をしています。余ったものを気軽に分けられたら嬉しいです。"></textarea></div>
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
                  <div className="p-seller"><div className="p-avt" id="pc-d-avt">👴</div><div><p className="p-sname" id="pc-d-sname">鈴木さん</p><p className="p-sloc" id="pc-d-sloc">駒ヶ根市赤穂</p></div><span className="p-rating">★ 5.0</span></div>
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
                <button className="p-chat" onClick={() => openChatWithSupabase('pc')}><svg viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>チャットで相談する</button>
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
                <div className="cis-wrap" style={{flex:1,minWidth:0}}><span className="cis-e" id="pc-cis-e">🍊</span><div style={{minWidth:0}}><p className="cis-n" id="pc-cis-n" style={{overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>渋柿</p><p className="cis-p" id="pc-cis-p">¥500</p></div></div>
              </div>
              <div className="pc-chat-msgs" id="pc-chat-msgs"></div>
              <div className="pc-trade-bar">
                <button id="pc-complete-btn" className="trade-bar-btn active" onClick={() => openTradeModal('pc')}>取引完了にする</button>
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
          <div className="m-sbar"><span>9:41</span><span>●●● 100%</span></div>
          <div className="m-tbar">
            <span className="m-logo">MEGURU</span>
            <div style={{marginLeft:'auto',display:'flex',gap:'7px'}}>
              <button className="ibtn" onClick={() => mNav('ms-search')} title="検索"><svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><line x1="16.5" y1="16.5" x2="22" y2="22"/></svg></button>
              <button className="ibtn" id="m-bell" onClick={() => mNav('ms-notif')} title="通知"><svg viewBox="0 0 24 24"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg><span className="ndot" id="m-notif-dot" style={{display:'none'}}></span></button>
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
              <div className="area-tog-row-mob">
                <button id="m-area-tog-local" className="area-tog-mob on" onClick={() => toggleAreaFilter('local')}>このエリア</button>
                <button id="m-area-tog-all" className="area-tog-mob" onClick={() => toggleAreaFilter('all')}>全国を見る</button>
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
            <button className="m-nt-post" onClick={() => mNav('ms-post')}><div className="fab"><svg viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg></div><span>出品</span></button>
            <button className="m-nt" data-t="ms-chatlist" onClick={(e) => mTab(e.currentTarget)}><svg viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg><span>チャット</span></button>
            <button className="m-nt" data-t="ms-mypage" onClick={(e) => mTab(e.currentTarget)}><svg viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg><span>マイページ</span></button>
          </div>
        </div>

        {/* SEARCH */}
        <div className="scn" id="ms-search">
          <div className="m-sbar"><span>9:41</span><span>●●● 100%</span></div>
          <div className="m-tbar" style={{gap:'8px'}}><div className="m-sfull"><svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><line x1="16.5" y1="16.5" x2="22" y2="22"/></svg><input id="m-search-inp" placeholder="キーワードを入力…" onChange={mDoSearch} autoComplete="off" /></div><button className="m-scancel" onClick={mBack}>キャンセル</button></div>
          <div className="m-chips" id="m-search-cats" style={{paddingTop:'10px'}}></div>
          <div className="m-body"><p className="m-sec-title" id="m-search-title">すべての余りもの</p><div className="m-grid" id="m-search-grid"></div></div>
        </div>

        {/* NOTIF */}
        <div className="scn" id="ms-notif">
          <div className="m-sbar"><span>9:41</span><span>●●● 100%</span></div>
          <div className="m-tbar"><button className="m-back" onClick={mBack}><svg viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg></button><span className="m-title">お知らせ</span></div>
          <div className="m-body" id="m-notif-body"></div>
        </div>

        {/* MYPAGE */}
        <div className="scn" id="ms-mypage">
          <div className="m-sbar drk"><span>9:41</span><span>●●● 100%</span></div>
          <div className="m-body">
            <div className="m-mp-head">
              <div className="m-mp-avt" id="m-mp-avt-el" style={{overflow:'hidden'}}>🧑</div>
              <p className="m-mp-name" id="m-mp-name-el">田中 拓也</p>
              <p className="m-mp-sub" id="m-mp-area-el">駒ヶ根市赤穂 · 2025年から利用中</p>
              {userEmail && <p style={{fontSize:'.72rem',color:'var(--mu)',marginTop:'4px',letterSpacing:'.02em'}}>{userEmail}</p>}
            </div>
            <div className="m-mp-stats">
              <div className="m-mp-stat"><div className="m-mp-stat-n" id="m-mp-cnt">—</div><div className="m-mp-stat-l">出品中</div></div>
              <div className="m-mp-stat"><div className="m-mp-stat-n">12</div><div className="m-mp-stat-l">取引完了</div></div>
              <div className="m-mp-stat"><div className="m-mp-stat-n">★4.9</div><div className="m-mp-stat-l">評価</div></div>
            </div>
            <p className="m-mp-sec">出品・取引</p>
            <div style={{background:'#fff'}}>
              <div className="m-mp-row" onClick={() => mNav('ms-mylistings')}><div className="m-mp-row-icon ri-k">📦</div><div style={{flex:1}}><div className="m-mp-row-label">出品中のもの</div><div className="m-mp-row-sub" id="m-mp-sub">—</div></div><span className="m-mp-arrow">›</span></div>
              <div className="m-mp-row" onClick={() => mNav('ms-txhistory')}><div className="m-mp-row-icon ri-g">📋</div><div style={{flex:1}}><div className="m-mp-row-label">取引履歴</div><div className="m-mp-row-sub">完了12件</div></div><span className="m-mp-arrow">›</span></div>
              <div className="m-mp-row" onClick={() => showFavs('mob')}><div className="m-mp-row-icon ri-k">❤️</div><div style={{flex:1}}><div className="m-mp-row-label">お気に入り</div><div className="m-mp-row-sub" id="m-fav-sub">0件</div></div><span className="m-mp-arrow">›</span></div>
            </div>
            <p className="m-mp-sec">アカウント</p>
            <div style={{background:'#fff'}}>
              <div className="m-mp-row" onClick={() => mNav('ms-profedit')}><div className="m-mp-row-icon ri-b">✏️</div><div className="m-mp-row-label">プロフィール編集</div><span className="m-mp-arrow">›</span></div>
              <div className="m-mp-row" onClick={() => showToast('設定は準備中です')}><div className="m-mp-row-icon ri-b">⚙️</div><div className="m-mp-row-label">設定</div><span className="m-mp-arrow">›</span></div>
              <div className="m-mp-row" onClick={() => showToast('MEGURUについて')}><div className="m-mp-row-icon ri-g">🌿</div><div className="m-mp-row-label">MEGURUについて</div><span className="m-mp-arrow">›</span></div>
              <div className="m-mp-row" onClick={handleLogout} style={{color:'#c0392b'}}><div className="m-mp-row-icon" style={{background:'#fef2f2',borderRadius:'10px',padding:'8px',display:'flex',alignItems:'center',justifyContent:'center'}}><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#c0392b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg></div><div className="m-mp-row-label" style={{color:'#c0392b'}}>ログアウト</div><span className="m-mp-arrow" style={{color:'#c0392b'}}>›</span></div>
            </div>
            <div style={{padding:'24px 14px',textAlign:'center'}}><p style={{fontSize:'.69rem',color:'var(--mu)',fontWeight:300,lineHeight:2.2}}>MEGURU v1.0.0 · 長野県駒ヶ根市 · 2025<br /><span style={{color:'var(--g)',fontWeight:500}}>農村の余りものを、誰かの暮らしへ。</span></p></div>
          </div>
          <div className="m-nav">
            <button className="m-nt" data-t="ms-home" onClick={(e) => mTab(e.currentTarget)}><svg viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg><span>ホーム</span></button>
            <button className="m-nt" data-t="ms-search" onClick={(e) => mTab(e.currentTarget)}><svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><line x1="16.5" y1="16.5" x2="22" y2="22"/></svg><span>さがす</span></button>
            <button className="m-nt-post" onClick={() => mNav('ms-post')}><div className="fab"><svg viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg></div><span>出品</span></button>
            <button className="m-nt" data-t="ms-chatlist" onClick={(e) => mTab(e.currentTarget)}><svg viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg><span>チャット</span></button>
            <button className="m-nt on" data-t="ms-mypage" onClick={(e) => mTab(e.currentTarget)}><svg viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg><span>マイページ</span></button>
          </div>
        </div>

        {/* POST */}
        <div className="scn" id="ms-post">
          <div className="m-sbar"><span>9:41</span><span>●●● 100%</span></div>
          <div className="m-tbar"><button className="m-back" onClick={mBack}><svg viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg></button><span className="m-title">余りものを出品する</span></div>
          <div className="m-body">
            <div className="m-post-body">
              <input type="file" id="m-photo-file" accept="image/*" multiple style={{display:'none'}} onChange={(e)=>addPhotos(e.currentTarget,'mob')} />
              {/* 写真 */}
              <div className="fg" style={{marginBottom:'16px'}}>
                <label className="lbl">写真 <small>最大10枚・1枚目がメイン</small></label>
                <div id="m-photo-grid" className="pf-imgs">
                  <button className="pf-img-add" onClick={()=>(document.getElementById('m-photo-file') as HTMLInputElement)?.click()}>
                    <svg viewBox="0 0 24 24" stroke="currentColor" fill="none" strokeWidth="1.8" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                    <span>0/10</span>
                  </button>
                </div>
              </div>
              {/* カテゴリ */}
              <div className="fg" style={{marginBottom:'16px'}}><label className="lbl">カテゴリ <em>*</em></label><div className="fchips" id="m-form-cats"></div></div>
              {/* 名前 */}
              <div className="fg" style={{marginBottom:'16px'}}><label className="lbl">余りものの名前 <em>*</em></label><input className="inp" id="m-post-name" placeholder="例：渋柿" /></div>
              {/* 数量 */}
              <div className="fg" style={{marginBottom:'16px'}}><label className="lbl">数量 <small>任意</small></label><input className="inp" id="m-post-qty" placeholder="例：約15kg・10袋・ひとかご分" /></div>
              {/* 商品の状態 */}
              <div className="fg" style={{marginBottom:'16px'}}>
                <label className="lbl">商品の状態</label>
                <div className="sel-opts">
                  {(['未使用','良好','やや傷あり','傷あり'] as const).map(c=>(
                    <button key={c} className="sel-opt" data-v={c} onClick={(e)=>selectCondition(e.currentTarget,'mob')}>{c}</button>
                  ))}
                </div>
              </div>
              {/* 説明 */}
              <div className="fg" style={{marginBottom:'16px'}}><label className="lbl">説明 <small>任意</small></label><textarea className="txta" id="m-post-desc" placeholder="形は悪いけど味は最高！受け取りは土日OK など"></textarea></div>
              <hr className="pf-section" />
              {/* 価格 */}
              <div className="fg" style={{marginBottom:'16px'}}>
                <label className="lbl">希望価格 <em>*</em></label>
                <div className="price-row"><input className="inp" type="number" id="m-post-price" placeholder="金額（円）" /><input className="inp" id="m-post-unit" placeholder="単位（袋・kgなど）" /></div>
                <div className="free-row" id="m-free-row" onClick={()=>toggleFree('mob')}><div className="tog"></div><span style={{fontSize:'.8rem',fontWeight:500,color:'var(--ink2)'}}>無料でおすそわけする</span></div>
              </div>
              {/* 受け渡し場所 */}
              <div className="fg" style={{marginBottom:'16px'}}>
                <label className="lbl">受け渡し場所 <small>任意</small></label>
                <div className="loc-sel-row">
                  <select className="inp loc-sel" id="m-post-loc-pref" onChange={(e) => onPostLocPrefChange(e.target as HTMLSelectElement)}><option value="">都道府県（任意）</option></select>
                  <select className="inp loc-sel" id="m-post-loc-city" disabled onChange={(e) => onPostLocCityChange(e.target as HTMLSelectElement)}><option value="">市区町村</option></select>
                  <select className="inp loc-sel" id="m-post-loc-dist" disabled><option value="">地区（任意）</option></select>
                </div>
              </div>
              <hr className="pf-section" />
              {/* 受け渡し可能日時 */}
              <div className="fg" style={{marginBottom:'16px'}}>
                <label className="lbl">受け渡し可能日時 <small>任意</small></label>
                <div style={{display:'flex',flexDirection:'column',gap:'10px'}}>
                  <div>
                    <p style={{fontSize:'.74rem',color:'var(--mu)',marginBottom:'7px',fontWeight:500}}>曜日</p>
                    <div className="pickup-row">
                      <label className="chk-lbl"><input type="checkbox" id="m-day-wd" /><span>平日</span></label>
                      <label className="chk-lbl"><input type="checkbox" id="m-day-sat" /><span>土曜</span></label>
                      <label className="chk-lbl"><input type="checkbox" id="m-day-sun" /><span>日曜</span></label>
                    </div>
                  </div>
                  <div>
                    <p style={{fontSize:'.74rem',color:'var(--mu)',marginBottom:'7px',fontWeight:500}}>時間帯</p>
                    <div className="pickup-row">
                      <label className="chk-lbl"><input type="checkbox" id="m-time-am" /><span>午前</span></label>
                      <label className="chk-lbl"><input type="checkbox" id="m-time-pm" /><span>午後</span></label>
                      <label className="chk-lbl"><input type="checkbox" id="m-time-ev" /><span>夜</span></label>
                    </div>
                  </div>
                </div>
              </div>
              {/* 農薬 */}
              <div className="fg" style={{marginBottom:'16px'}}>
                <label className="lbl">農薬の使用</label>
                <div className="sel-opts">
                  {(['使用なし','使用あり','不明'] as const).map(p=>(
                    <button key={p} className="sel-opt" data-v={p} onClick={(e)=>selectPesticide(e.currentTarget,'mob')}>{p}</button>
                  ))}
                </div>
              </div>
              {/* 受け取り期限 */}
              <div className="fg" style={{marginBottom:'16px'}}><label className="lbl">受け取り期限 <small>任意</small></label><input className="inp" type="date" id="m-post-expiry" /></div>
              <div className="hint" style={{marginBottom:'20px'}}><span style={{fontSize:'.95rem',flexShrink:0}}>💡</span><p>詳しい住所はチャットで直接決めてOKです。掲示板には住所は出ません。</p></div>
              <button style={{width:'100%',padding:'16px',background:'var(--k)',color:'#fff',border:'none',borderRadius:'13px',fontSize:'.92rem',fontWeight:700,letterSpacing:'.08em',boxShadow:'0 5px 17px rgba(196,88,26,.34)',transition:'all .18s'}} onClick={()=>submitPost('mob')}>出品する →</button>
            </div>
          </div>
        </div>

        {/* COMPLETE */}
        <div className="scn" id="ms-complete">
          <div className="m-sbar"><span>9:41</span><span>●●● 100%</span></div>
          <div className="m-tbar"><span className="m-logo">MEGURU</span></div>
          <div className="m-body">
            <div className="m-comp-wrap">
              <div className="m-comp-ring">🎉</div>
              <h2 className="m-comp-title">出品しました！</h2>
              <p className="m-comp-sub">地域の掲示板に載りました。<br />欲しい人からチャットが届いたらお知らせします。</p>
              <div className="m-comp-card">
                <p className="m-comp-label">出品した余りもの</p>
                <div className="cc-row"><span className="cc-e" id="m-cc-emoji">📦</span><div className="cc-t"><strong id="m-cc-name">—</strong><br /><span id="m-cc-price">—</span></div></div>
                <div className="cc-row"><span className="cc-e">📍</span><div className="cc-t" id="m-cc-loc">—</div></div>
                <div className="cc-row"><span className="cc-e">✅</span><div className="cc-t">手数料：取引成立時のみ 12%</div></div>
              </div>
              <button className="btn-main" onClick={() => mTab(document.querySelector('[data-t="ms-home"]') as HTMLElement)}>一覧に戻る</button>
              <button className="btn-sec" onClick={() => mNav('ms-post')}>続けて出品する</button>
            </div>
          </div>
        </div>

        {/* DETAIL */}
        <div className="scn" id="ms-detail">
          <div className="m-sbar"><span>9:41</span><span>●●● 100%</span></div>
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
              <div className="m-d-seller"><div className="m-d-avt" id="m-d-avt">👴</div><div><p className="m-d-name" id="m-d-sname">鈴木さん</p><p className="m-d-loc" id="m-d-sloc">駒ヶ根市赤穂</p></div><span className="m-d-rating">★ 5.0</span></div>
              <h2 className="m-d-title" id="m-d-title">渋柿 約15kg</h2>
              <p className="m-d-price" id="m-d-price">¥500 <small>/ 箱</small></p>
              <div className="m-d-tags"><span className="m-d-tag" id="m-d-cat">🍊 果物</span><span className="m-d-tag">手渡しOK</span><span className="m-d-tag">今週末受取可</span></div>
              <p className="m-d-desc" id="m-d-desc">—</p>
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
            <button className="m-fav" id="m-fav-btn" onClick={() => toggleFav('mob')}>🤍</button>
            <button className="m-chat" id="m-det-chat-btn" onClick={() => openChatWithSupabase('mob')}><svg viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>チャットで相談する</button>
          </div>
        </div>

        {/* CHAT LIST */}
        <div className="scn" id="ms-chatlist">
          <div className="m-sbar"><span>9:41</span><span>●●● 100%</span></div>
          <div className="m-tbar"><span className="m-logo">MEGURU</span><span style={{fontSize:'.7rem',color:'var(--mu)',fontWeight:300,marginLeft:'5px'}}>やりとり</span></div>
          <div className="m-body" id="m-chatlist-body"></div>
          <div className="m-nav">
            <button className="m-nt" data-t="ms-home" onClick={(e) => mTab(e.currentTarget)}><svg viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg><span>ホーム</span></button>
            <button className="m-nt" data-t="ms-search" onClick={(e) => mTab(e.currentTarget)}><svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><line x1="16.5" y1="16.5" x2="22" y2="22"/></svg><span>さがす</span></button>
            <button className="m-nt-post" onClick={() => mNav('ms-post')}><div className="fab"><svg viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg></div><span>出品</span></button>
            <button className="m-nt on" data-t="ms-chatlist" onClick={(e) => mTab(e.currentTarget)}><svg viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg><span>チャット</span></button>
            <button className="m-nt" data-t="ms-mypage" onClick={(e) => mTab(e.currentTarget)}><svg viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg><span>マイページ</span></button>
          </div>
        </div>

        {/* CHAT VIEW */}
        <div className="scn" id="ms-chat">
          <div className="m-sbar"><span>9:41</span><span>●●● 100%</span></div>
          <div className="m-chat-tbar">
            <button className="m-back" onClick={mBack}><svg viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg></button>
            <div className="m-d-avt" id="m-chat-avt" style={{width:'32px',height:'32px',fontSize:'.88rem'}}>👴</div>
            <div style={{marginLeft:'7px',flex:1}}>
              <p style={{fontFamily:'var(--sf)',fontSize:'.9rem',fontWeight:600,color:'var(--ink)'}} id="m-chat-pname">鈴木さん</p>
              <p style={{fontSize:'.63rem',color:'var(--mu)'}} id="m-chat-psub">駒ヶ根市赤穂</p>
            </div>
            <button className="ibtn" onClick={() => showToast('相手のプロフィールを確認')}><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg></button>
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
          <div className="m-sbar"><span>9:41</span><span>●●● 100%</span></div>
          <div className="m-tbar"><button className="m-back" onClick={mBack}><svg viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg></button><span className="m-title" id="m-mylistings-title">出品中のもの</span></div>
          <div className="m-body"><div className="m-grid" id="m-mylistings-grid" style={{paddingTop:'13px'}}></div></div>
        </div>

        {/* TX HISTORY */}
        <div className="scn" id="ms-txhistory">
          <div className="m-sbar"><span>9:41</span><span>●●● 100%</span></div>
          <div className="m-tbar"><button className="m-back" onClick={mBack}><svg viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg></button><span className="m-title">取引履歴</span></div>
          <div className="m-body" id="m-tx-body"></div>
        </div>

        {/* PROF EDIT */}
        <div className="scn" id="ms-profedit">
          <div className="m-sbar drk"><span>9:41</span><span>●●● 100%</span></div>
          <div className="m-tbar" style={{background:'var(--g)'}}>
            <button className="m-back" style={{background:'rgba(255,255,255,.2)'}} onClick={mBack}><svg viewBox="0 0 24 24" style={{stroke:'#fff'}}><polyline points="15 18 9 12 15 6"/></svg></button>
            <span className="m-title" style={{color:'#fff'}}>プロフィール編集</span>
            <button style={{fontSize:'.78rem',fontWeight:700,color:'#fff',padding:'6px 13px',background:'rgba(255,255,255,.2)',borderRadius:'8px',marginLeft:'auto',border:'none'}} onClick={saveProfile}>保存</button>
          </div>
          <div className="m-body">
            <div style={{background:'linear-gradient(135deg,var(--g),#3d7a34)',padding:'22px 16px 18px',display:'flex',flexDirection:'column',alignItems:'center',gap:'9px'}}>
              <div style={{width:'64px',height:'64px',borderRadius:'50%',background:'rgba(255,255,255,.2)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'1.9rem',border:'3px solid rgba(255,255,255,.3)',cursor:'pointer',position:'relative',overflow:'hidden'}} onClick={() => (document.getElementById('m-avatar-file') as HTMLInputElement)?.click()}>
                <span id="m-avt-display" style={{display:'flex',alignItems:'center',justifyContent:'center',width:'100%',height:'100%',fontSize:'1.9rem',borderRadius:'50%',overflow:'hidden'}}>🧑</span>
                <div style={{position:'absolute',bottom:'0',right:'0',width:'20px',height:'20px',borderRadius:'50%',background:'var(--k)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                  <svg viewBox="0 0 24 24" width="11" height="11" stroke="#fff" fill="none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
                </div>
                <input type="file" id="m-avatar-file" accept="image/*" style={{display:'none'}} onChange={(e) => {
                  const file = e.currentTarget.files?.[0]
                  if (!file) return
                  const url = URL.createObjectURL(file)
                  const el = document.getElementById('m-avt-display') as HTMLElement | null
                  if (el) { el.style.fontSize = '0'; el.innerHTML = `<img src="${url}" style="width:100%;height:100%;object-fit:cover;" />` }
                }} />
              </div>
              <p id="m-prof-preview-name" style={{fontFamily:'var(--sf)',fontSize:'1rem',fontWeight:700,color:'#fff'}}>田中 拓也</p>
            </div>
            <div style={{padding:'18px 14px',display:'flex',flexDirection:'column',gap:'15px'}}>
              <div><label className="lbl">名前</label><input className="inp" id="m-prof-name" defaultValue="田中 拓也" /></div>
              <div><label className="lbl">お住まいのエリア</label><input className="inp" id="m-prof-area" defaultValue="長野県駒ヶ根市" /></div>
              <div><label className="lbl">自己紹介 <small>任意</small></label><textarea className="txta" id="m-prof-bio" style={{height:'72px'}} defaultValue="駒ヶ根で農業をしています。余ったものを気軽に分けられたら嬉しいです。"></textarea></div>
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
              <div className="area-card-grid" id="area-pref-cards" />
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
            <button className="trade-modal-cancel" onClick={closeTradeModal}>キャンセル</button>
            <button className="trade-modal-confirm" onClick={confirmCompleteTrade}>完了する</button>
          </div>
        </div>
      </div>

      {/* TOAST */}
      <div className="toast" id="toast"></div>
    </>
  )
}
