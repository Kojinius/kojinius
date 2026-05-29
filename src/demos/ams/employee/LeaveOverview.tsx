// 2026-04-22 claude-sonnet-4-6 セッションターン数：3
import { Link } from 'react-router-dom'
import { LEAVE_REQUESTS, SELF_LEAVE_BALANCE } from '../mockData'

const LEAVE_TYPE_LABELS: Record<string, string> = {
  full: '有休（全日）', half_am: '午前休', half_pm: '午後休', hourly: '時間休',
}
const STATUS_COLORS: Record<string, string> = {
  pending:  'bg-amber-100 text-amber-700',
  approved: 'bg-matsu/10 text-matsu',
  rejected: 'bg-shu/10 text-shu',
}
const STATUS_LABELS: Record<string, string> = { pending: '承認待ち', approved: '承認済み', rejected: '却下' }

function Badge({ className, children }: { className?: string; children: React.ReactNode }) {
  return <span className={`inline-flex px-1.5 py-0.5 text-[10px] font-bold rounded-sm ${className}`}>{children}</span>
}

export default function LeaveOverview() {
  const myLeaves = LEAVE_REQUESTS.filter(r => r.uid === LEAVE_REQUESTS[0].uid)
  const bal = SELF_LEAVE_BALANCE

  return (
    <div className="animate-fade-in-up space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-heading font-black uppercase text-bauhaus-black">
          有給休暇<span className="text-bauhaus-red">.</span>
        </h2>
        <Link to="/demo/ams/leave/request"
          className="px-4 py-2 bg-bauhaus-black text-white text-xs font-heading font-black uppercase border-2 border-bauhaus-black shadow-bauhaus-sm hover:shadow-bauhaus hover:-translate-x-0.5 hover:-translate-y-0.5 active:shadow-none transition-all">
          申請する
        </Link>
      </div>

      {/* 残日数カード */}
      <div className="bg-white border-2 border-bauhaus-black shadow-bauhaus p-5">
        <h3 className="font-heading font-black text-[10px] uppercase text-sumi-400 mb-4">残日数サマリー</h3>
        <div className="grid grid-cols-3 gap-4 text-center">
          {[
            { label: '付与', value: bal.grantedDays, color: 'text-bauhaus-black' },
            { label: '使用', value: bal.usedDays,    color: 'text-shu' },
            { label: '残残', value: bal.remainingDays, color: 'text-matsu' },
          ].map(({ label, value, color }) => (
            <div key={label}>
              <p className="text-[10px] font-heading font-black uppercase text-sumi-400 mb-1">{label}</p>
              <p className={`text-3xl font-mono font-black ${color}`}>{value}</p>
              <p className="text-[10px] text-sumi-400">日</p>
            </div>
          ))}
        </div>
        {/* プログレスバー */}
        <div className="mt-4 h-2 bg-sumi-100 border border-sumi-200">
          <div className="h-full bg-matsu transition-all" style={{ width: `${(bal.remainingDays / bal.grantedDays) * 100}%` }} />
        </div>
        <div className="flex justify-between mt-1 text-[9px] text-sumi-400">
          <span>有効期限: {bal.grantedAt} 付与</span>
          <span>〜 {bal.expiresAt}</span>
        </div>
      </div>

      {/* 申請一覧 */}
      <div className="bg-white border-2 border-bauhaus-black shadow-bauhaus overflow-hidden">
        <div className="px-4 py-2 border-b-2 border-bauhaus-black bg-bauhaus-black">
          <h3 className="font-heading font-black text-[11px] text-white uppercase">申請履歴</h3>
        </div>
        {myLeaves.length === 0 ? (
          <div className="text-center py-8 text-sumi-400 text-[10px] font-heading font-black uppercase">申請なし</div>
        ) : (
          <div className="divide-y divide-sumi-100">
            {myLeaves.map(r => (
              <div key={r.id} className="flex items-start gap-3 px-4 py-3 hover:bg-sumi-50 transition-colors">
                <div className="w-10 h-10 border-3 border-matsu rounded-full flex items-center justify-center shrink-0 font-heading font-black text-matsu text-xs">
                  {r.leaveType === 'full' ? '有' : r.leaveType === 'half_am' ? 'A' : r.leaveType === 'half_pm' ? 'P' : '時'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <Badge className={STATUS_COLORS[r.status]}>{STATUS_LABELS[r.status]}</Badge>
                    <span className="text-[10px] font-heading font-bold text-sumi-700">{LEAVE_TYPE_LABELS[r.leaveType]}</span>
                  </div>
                  <p className="text-xs font-mono text-sumi-700">{r.targetDate}</p>
                  <p className="text-[10px] text-sumi-400 line-clamp-1">{r.reason}</p>
                  {r.approverName && (
                    <p className="text-[9px] text-sumi-300 mt-0.5">承認者: {r.approverName}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
