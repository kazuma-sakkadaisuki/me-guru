import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: '利用規約・プライバシーポリシー | MEGURU',
  description: 'MEGURU（めぐる）の利用規約およびプライバシーポリシー',
}

const FF = "'Noto Sans JP', sans-serif"
const GREEN = '#2D5A27'
const KAKI = '#C4581A'
const CREAM = '#F8F4EE'

export default function TermsPage() {
  return (
    <div
      style={{
        minHeight: '100dvh',
        background: CREAM,
        fontFamily: FF,
        color: '#333',
        lineHeight: 1.75,
      }}
    >
      <header
        style={{
          background: GREEN,
          color: '#fff',
          padding: '16px 20px',
          fontFamily: FF,
        }}
      >
        <div
          style={{
            maxWidth: 720,
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 12,
          }}
        >
          <span style={{ fontWeight: 700, fontSize: '1rem', letterSpacing: '0.06em' }}>MEGURU</span>
          <Link
            href="/login"
            style={{
              color: '#fff',
              fontSize: '.85rem',
              textDecoration: 'underline',
              textUnderlineOffset: 3,
              fontFamily: FF,
            }}
          >
            ログインへ戻る
          </Link>
        </div>
      </header>

      <main
        style={{
          maxWidth: 720,
          margin: '0 auto',
          padding: '28px 20px 48px',
          fontFamily: FF,
        }}
      >
        <h1
          style={{
            fontSize: '1.35rem',
            fontWeight: 700,
            color: GREEN,
            margin: '0 0 8px',
            fontFamily: FF,
          }}
        >
          利用規約・プライバシーポリシー
        </h1>
        <p style={{ fontSize: '.85rem', color: '#666', margin: '0 0 32px', fontFamily: FF }}>
          サービス名：MEGURU（めぐる）
        </p>

        <section style={{ marginBottom: 40 }}>
          <h2
            style={{
              fontSize: '1.1rem',
              fontWeight: 700,
              color: GREEN,
              margin: '0 0 16px',
              paddingBottom: 8,
              borderBottom: `2px solid ${KAKI}`,
              fontFamily: FF,
            }}
          >
            利用規約
          </h2>

          <h3 style={{ fontSize: '.95rem', fontWeight: 700, color: GREEN, margin: '20px 0 8px', fontFamily: FF }}>
            第1条（運営者）
          </h3>
          <p style={{ margin: '0 0 12px', fontSize: '.9rem', fontFamily: FF }}>
            本サービス「MEGURU（めぐる）」（以下「本サービス」といいます。）は、片桐和真（長野県駒ヶ根市）により運営されます。
          </p>

          <h3 style={{ fontSize: '.95rem', fontWeight: 700, color: GREEN, margin: '20px 0 8px', fontFamily: FF }}>
            第2条（サービスの性質）
          </h3>
          <p style={{ margin: '0 0 12px', fontSize: '.9rem', fontFamily: FF }}>
            本サービスは、地域における食品等の余りものの情報を共有し、利用者同士が手渡し・対面での受け渡しを基本としてやり取りできるよう支援するためのプラットフォームです。
          </p>

          <h3 style={{ fontSize: '.95rem', fontWeight: 700, color: GREEN, margin: '20px 0 8px', fontFamily: FF }}>
            第3条（禁止事項）
          </h3>
          <p style={{ margin: '0 0 8px', fontSize: '.9rem', fontFamily: FF }}>
            利用者は、以下の行為をしてはなりません。
          </p>
          <ul style={{ margin: '0 0 12px', paddingLeft: '1.25em', fontSize: '.9rem', fontFamily: FF }}>
            <li>虚偽の出品、詐欺行為</li>
            <li>他の利用者に対する嫌がらせ、誹謗中傷、脅迫</li>
            <li>法令または公序良俗に反する行為、不適切なコンテンツの投稿</li>
            <li>本サービスの運営を妨害する行為</li>
          </ul>

          <h3 style={{ fontSize: '.95rem', fontWeight: 700, color: GREEN, margin: '20px 0 8px', fontFamily: FF }}>
            第4条（免責事項）
          </h3>
          <p style={{ margin: '0 0 12px', fontSize: '.9rem', fontFamily: FF }}>
            利用者間で生じたトラブル、損害等については、当事者間で解決するものとし、運営者は責任を負いません。取引の内容・安全性については、各自の判断と責任においてご利用ください。
          </p>

          <h3 style={{ fontSize: '.95rem', fontWeight: 700, color: GREEN, margin: '20px 0 8px', fontFamily: FF }}>
            第5条（手数料）
          </h3>
          <p style={{ margin: '0 0 12px', fontSize: '.9rem', fontFamily: FF }}>
            取引が成立した場合、手数料として取引額の12％が発生する場合があります。ただし、現在は無料期間中であり、実際の課金開始時期・条件は本サービス上のお知らせ等で別途定めます。
          </p>

          <h3 style={{ fontSize: '.95rem', fontWeight: 700, color: GREEN, margin: '20px 0 8px', fontFamily: FF }}>
            第6条（規約の変更）
          </h3>
          <p style={{ margin: 0, fontSize: '.9rem', fontFamily: FF }}>
            運営者は、必要に応じて本規約を変更できるものとし、変更後の規約は本サービス上に掲示した時点から効力を生じます。
          </p>
        </section>

        <section>
          <h2
            style={{
              fontSize: '1.1rem',
              fontWeight: 700,
              color: GREEN,
              margin: '0 0 16px',
              paddingBottom: 8,
              borderBottom: `2px solid ${KAKI}`,
              fontFamily: FF,
            }}
          >
            プライバシーポリシー
          </h2>

          <h3 style={{ fontSize: '.95rem', fontWeight: 700, color: GREEN, margin: '20px 0 8px', fontFamily: FF }}>
            1. 収集する情報
          </h3>
          <p style={{ margin: '0 0 12px', fontSize: '.9rem', fontFamily: FF }}>
            本サービスでは、次の情報を取得・保存する場合があります。メールアドレス、お名前（表示名）、お住まいのエリアに関する情報、および出品に関する情報（商品名、説明、画像等）。
          </p>

          <h3 style={{ fontSize: '.95rem', fontWeight: 700, color: GREEN, margin: '20px 0 8px', fontFamily: FF }}>
            2. 利用目的
          </h3>
          <p style={{ margin: '0 0 12px', fontSize: '.9rem', fontFamily: FF }}>
            収集した情報は、本サービスの提供・運営・改善、利用者への連絡、および不正利用の防止のために利用します。
          </p>

          <h3 style={{ fontSize: '.95rem', fontWeight: 700, color: GREEN, margin: '20px 0 8px', fontFamily: FF }}>
            3. 第三者への提供
          </h3>
          <p style={{ margin: '0 0 12px', fontSize: '.9rem', fontFamily: FF }}>
            運営者は、法令に基づく場合を除き、ご本人の同意なく個人情報を第三者に提供しません。
          </p>

          <h3 style={{ fontSize: '.95rem', fontWeight: 700, color: GREEN, margin: '20px 0 8px', fontFamily: FF }}>
            4. お問い合わせ
          </h3>
          <p style={{ margin: 0, fontSize: '.9rem', fontFamily: FF }}>
            本ポリシーに関するお問い合わせは、メールにて受け付けます。お問い合わせ用のメールアドレスは、後日本ページにて掲載いたします。
          </p>
        </section>

      </main>
    </div>
  )
}
