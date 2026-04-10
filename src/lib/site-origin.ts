/** パスワードリセットの redirectTo 用（クライアントでは window、サーバーでは環境変数） */
export function getPasswordUpdateRedirectUrl(): string {
  if (typeof window !== 'undefined') {
    return `${window.location.origin}/update-password`
  }
  const base = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') ?? ''
  return base ? `${base}/update-password` : '/update-password'
}
