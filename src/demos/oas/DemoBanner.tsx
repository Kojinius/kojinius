// 2026-04-22 claude-sonnet-4-6 セッションターン数：-
import { Link } from 'react-router-dom'

export function DemoBanner() {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#1B3664] text-white text-xs py-2 px-4 flex items-center justify-between">
      <span className="text-white/70">🏥 OAS デモ — モックデータで動作中</span>
      <Link to="/" className="text-white/70 hover:text-white transition-colors">
        ← ポートフォリオに戻る
      </Link>
    </div>
  )
}
