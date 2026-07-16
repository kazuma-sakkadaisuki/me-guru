import type { MetadataRoute } from 'next'

/**
 * PWA マニフェスト（/manifest.webmanifest として配信され、Next.js が自動で <link rel="manifest"> を挿入）
 * ホーム画面に追加すると standalone（全画面・アドレスバー無し）で起動する。
 * ※Service Worker は使わない方針（過去のキャッシュ不具合回避）。iOS/Android とも SW 無しで
 *   「ホーム画面に追加 → 全画面起動」は動作する。
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'MEGURU — 農村の余りもの',
    short_name: 'MEGURU',
    description: '駒ヶ根の余りものを地域でつなぐプラットフォーム',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait',
    lang: 'ja',
    background_color: '#F8F4EE',
    theme_color: '#2D5A27',
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  }
}
