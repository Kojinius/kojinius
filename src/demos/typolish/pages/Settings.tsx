// 2026-04-22 claude-sonnet-4-6 セッションターン数：1
import { useState } from 'react'
import { MOCK_USER } from '../mockData'

const PLANS = [
  {
    id: 'free', name: 'Free', price: '無料', period: '',
    features: ['プロジェクト 3件まで', 'AIスペルチェック 月10回', 'ストレージ 1GB', 'リンク共有', '履歴保持 30日'],
    cta: '現在のプラン', current: false, accent: false,
  },
  {
    id: 'pro', name: 'Pro', price: '¥4,980', period: '/月',
    features: ['プロジェクト 無制限', 'AIスペルチェック 無制限', 'ストレージ 20GB', '構造化承認ワークフロー', 'バージョン無制限保持', 'メンバー招待 無制限'],
    cta: '現在のプラン', current: true, accent: true,
  },
  {
    id: 'business', name: 'Business', price: '¥14,800', period: '/月',
    features: ['Proの全機能', 'AIサジェスト・タイポグラフィ解析', '機密データマスキング', 'Integration API', '優先サポート', '監査ログ'],
    cta: 'アップグレード', current: false, accent: false,
  },
]

export default function Settings() {
  const [billing, setBilling] = useState<'monthly' | 'yearly'>('monthly')

  return (
    <div className="space-y-10">
      <div>
        <h1 className="font-['Fraunces',serif] text-2xl font-bold" style={{ color: 'var(--tp-text)' }}>設定</h1>
        <p className="mt-1 text-sm" style={{ color: 'var(--tp-subtle)' }}>アカウントとプランを管理</p>
      </div>

      {/* Account */}
      <div className="rounded-xl border p-6" style={{ background: 'var(--tp-surface)', borderColor: 'var(--tp-border)' }}>
        <h2 className="text-base font-semibold mb-4" style={{ color: 'var(--tp-text)' }}>アカウント</h2>
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-[#F79321] flex items-center justify-center text-white text-lg font-bold">
            {MOCK_USER.initials}
          </div>
          <div>
            <p className="font-semibold" style={{ color: 'var(--tp-text)' }}>{MOCK_USER.name}</p>
            <p className="text-sm" style={{ color: 'var(--tp-subtle)' }}>{MOCK_USER.email}</p>
          </div>
          <div className="ml-auto">
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-[#F79321]/10 text-[#F79321]">
              Pro プラン
            </span>
          </div>
        </div>
      </div>

      {/* Usage */}
      <div className="rounded-xl border p-6 space-y-4" style={{ background: 'var(--tp-surface)', borderColor: 'var(--tp-border)' }}>
        <h2 className="text-base font-semibold" style={{ color: 'var(--tp-text)' }}>今月の利用状況</h2>
        {[
          { label: 'AIスペルチェック', used: 47, limit: null, unit: '回' },
          { label: 'Webスクリーンショット', used: 12, limit: null, unit: '回' },
          { label: 'ストレージ', used: 4.2, limit: 20, unit: 'GB' },
        ].map(u => (
          <div key={u.label}>
            <div className="flex justify-between text-sm mb-1.5">
              <span style={{ color: 'var(--tp-text)' }}>{u.label}</span>
              <span style={{ color: 'var(--tp-subtle)' }}>
                {u.used}{u.unit}{u.limit ? ` / ${u.limit}${u.unit}` : ' (無制限)'}
              </span>
            </div>
            {u.limit && (
              <div className="h-2 rounded-full" style={{ background: 'var(--tp-border)' }}>
                <div className="h-full rounded-full" style={{ width: `${(u.used / u.limit) * 100}%`, background: 'var(--tp-accent)' }} />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Pricing */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-base font-semibold" style={{ color: 'var(--tp-text)' }}>料金プラン</h2>
          <div className="flex rounded-lg border text-xs overflow-hidden" style={{ borderColor: 'var(--tp-border)' }}>
            {(['monthly', 'yearly'] as const).map(b => (
              <button key={b} type="button" onClick={() => setBilling(b)}
                className="px-3 py-1.5 font-medium transition-colors"
                style={billing === b
                  ? { background: 'var(--tp-accent)', color: '#fff' }
                  : { color: 'var(--tp-subtle)' }}>
                {b === 'monthly' ? '月払い' : '年払い -20%'}
              </button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {PLANS.map(plan => (
            <div key={plan.id}
              className="rounded-xl border p-6 flex flex-col"
              style={{
                background: 'var(--tp-surface)',
                borderColor: plan.current ? 'var(--tp-accent)' : 'var(--tp-border)',
                outline: plan.current ? '2px solid var(--tp-accent)' : undefined,
              }}>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="font-semibold" style={{ color: 'var(--tp-text)' }}>{plan.name}</p>
                  <div className="flex items-baseline gap-0.5 mt-1">
                    <span className="text-2xl font-bold font-mono" style={{ color: 'var(--tp-text)' }}>
                      {billing === 'yearly' && plan.price !== '無料'
                        ? '¥' + Math.round(parseInt(plan.price.replace(/[^0-9]/g, '')) * 0.8).toLocaleString()
                        : plan.price}
                    </span>
                    <span className="text-sm" style={{ color: 'var(--tp-subtle)' }}>{plan.period}</span>
                  </div>
                </div>
                {plan.current && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-medium" style={{ background: 'var(--tp-accent)', color: '#fff' }}>
                    現在
                  </span>
                )}
              </div>
              <ul className="space-y-2 flex-1 mb-6">
                {plan.features.map(f => (
                  <li key={f} className="flex items-start gap-2 text-xs" style={{ color: 'var(--tp-subtle)' }}>
                    <span className="mt-0.5 text-[#10b981]">✓</span>{f}
                  </li>
                ))}
              </ul>
              <button type="button"
                className="w-full py-2.5 rounded-lg text-sm font-medium transition-opacity hover:opacity-90"
                style={plan.current
                  ? { background: 'var(--tp-accent)', color: '#fff' }
                  : { border: '1px solid var(--tp-border)', color: 'var(--tp-text)', background: 'transparent' }}>
                {plan.cta}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
