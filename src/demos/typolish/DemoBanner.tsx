// 2026-04-22 claude-sonnet-4-6 セッションターン数：1
import { Link } from 'react-router-dom'

export function DemoBanner() {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#1A1210] text-[#F5E8D0] text-xs font-mono py-2 px-4 flex items-center justify-between gap-4">
      <span>✍️ Typolish デモ — モックデータで動作中</span>
      <Link to="/" className="underline opacity-60 hover:opacity-100 transition-opacity">← ポートフォリオに戻る</Link>
    </div>
  )
}
