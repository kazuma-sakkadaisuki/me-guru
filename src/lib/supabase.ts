import { createBrowserClient } from '@supabase/ssr'

/**
 * ブラウザ用 Supabase クライアント。
 * 開発は HTTP（localhost / LAN IP）のため secure は常に false。
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookieOptions: {
        path: '/',
        sameSite: 'lax',
        secure: false,
      },
    }
  )
}
