// 2026-04-22 claude-sonnet-4-6 セッションターン数：3
import { useState } from 'react'
import { AUDIT_LOGS } from '../mockData'

const ACTION_COLORS: Record<string, string> = {
  '出勤打刻':   'bg-matsu/10 text-matsu',
  '退勤打刻':   'bg-matsu/10 text-matsu',
  'シフト申請': 'bg-amber-100 text-amber-700',
  'シフト承認': 'bg-matsu/10 text-matsu',
  'シフト却下': 'bg-shu/10 text-shu',
  '有給承認':   'bg-matsu/10 text-matsu',
  '修正申請':   'bg-amber-100 text-amber-700',
  '修正承認':   'bg-matsu/10 text-matsu',
  'ユーザー更新': 'bg-bauhaus-yellow/20 text-yellow-700',
}

function Badge({ className, children }: { className?: string; children: React.ReactNode }) {
  return <span className={`inline-flex px-1.5 py-0.5 text-[10px] font-bold rounded-sm ${className}`}>{children}</span>
}

export default function AuditLogTab() {
  const [keyword, setKeyword] = useState('')

  const filtered = AUDIT_LOGS
    .filter(l => !keyword || l.displayName.includes(keyword) || l.action.includes(keyword) || l.detail.includes(keyword))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))

  return (
    <div className="space-y-3">
      <h3 className="font-heading font-black text-sm uppercase text-bauhaus-black">
        監査ログ<span className="text-bauhaus-red">.</span>
      </h3>

      <div className="flex gap-2">
        <input
          type="text"
          value={keyword}
          onChange={e => setKeyword(e.target.value)}
          placeholder="氏名・操作・詳細でフィルター"
          className="flex-1 border-2 border-sumi-200 px-3 py-1.5 text-xs focus:border-bauhaus-black outline-none"
        />
        {keyword && (
          <button type="button" onClick={() => setKeyword('')}
            className="px-2 py-1.5 border-2 border-bauhaus-black text-[10px] font-heading font-black uppercase hover:bg-sumi-50">
            クリア
          </button>
        )}
      </div>

      <div className="bg-white border-2 border-bauhaus-black shadow-bauhaus overflow-hidden">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-bauhaus-black text-white">
              {['日時','操作者','操作','対象','詳細'].map(h => (
                <th key={h} className="px-3 py-2 text-left font-heading font-black uppercase text-[10px] whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-sumi-100">
            {filtered.length === 0 ? (
              <tr><td colSpan={5} className="text-center py-8 text-sumi-400 font-heading font-black uppercase text-[10px]">ログなし</td></tr>
            ) : filtered.map((log, i) => (
              <tr key={log.id} className={`hover:bg-sumi-50 transition-colors ${i % 2 === 0 ? 'bg-white' : 'bg-sumi-50/50'}`}>
                <td className="px-3 py-2 font-mono text-sumi-400 whitespace-nowrap text-[10px]">
                  {log.createdAt.replace('T', ' ').slice(0, 16)}
                </td>
                <td className="px-3 py-2 font-heading font-bold text-sumi-800 whitespace-nowrap">{log.displayName}</td>
                <td className="px-3 py-2 whitespace-nowrap">
                  <Badge className={ACTION_COLORS[log.action] || 'bg-sumi-100 text-sumi-600'}>{log.action}</Badge>
                </td>
                <td className="px-3 py-2 text-sumi-500 whitespace-nowrap">{log.target}</td>
                <td className="px-3 py-2 text-sumi-600 max-w-[200px] truncate">{log.detail}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
