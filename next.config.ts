import type { NextConfig } from "next";

/** 全レスポンスに付与する防御的セキュリティヘッダ */
const securityHeaders = [
  // クリックジャッキング防止（他サイトの iframe への埋め込み禁止）
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  // MIME スニッフィング防止
  { key: "X-Content-Type-Options", value: "nosniff" },
  // リファラ漏洩の抑制
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // 常時 HTTPS を強制（2年）
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  // 不要なブラウザ機能を無効化
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), interest-cohort=()" },
  // レガシー XSS フィルタ（保険）
  { key: "X-XSS-Protection", value: "1; mode=block" },
];

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
