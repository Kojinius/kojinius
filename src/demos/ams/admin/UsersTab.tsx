// 2026-04-22 claude-sonnet-4-6 セッションターン数：3
import { useState } from 'react'
import { EMPLOYEES } from '../mockData'
import type { Employee } from '../types'

const ROLE_LABELS: Record<string, string> = { admin: '管理者', manager: 'マネージャー', staff: 'スタッフ', user: '一般' }
const ROLE_COLORS: Record<string, string> = {
  admin:   'bg-bauhaus-red/10 text-bauhaus-red',
  manager: 'bg-matsu/10 text-matsu',
  staff:   'bg-sumi-100 text-sumi-600',
  user:    'bg-sumi-100 text-sumi-400',
}

function Badge({ className, children }: { className?: string; children: React.ReactNode }) {
  return <span className={`inline-flex px-1.5 py-0.5 text-[10px] font-bold rounded-sm ${className}`}>{children}</span>
}

function EditModal({ emp, onClose }: { emp: Employee; onClose: () => void }) {
  const [name, setName] = useState(emp.displayName)
  const [dept, setDept] = useState(emp.dept)
  const [role, setRole] = useState(emp.role)
  const [active, setActive] = useState(emp.isActive)
  const [saved, setSaved] = useState(false)

  if (saved) return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white border-2 border-bauhaus-black shadow-bauhaus p-6 max-w-sm w-full mx-4 text-center">
        <p className="font-heading font-black text-base mb-4">更新しました</p>
        <button type="button" onClick={onClose} className="px-6 py-2 bg-bauhaus-black text-white font-heading font-black text-sm uppercase border-2 border-bauhaus-black">閉じる</button>
      </div>
    </div>
  )

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white border-2 border-bauhaus-black shadow-bauhaus p-5 max-w-sm w-full mx-4">
        <h3 className="font-heading font-black text-sm uppercase mb-3">ユーザー編集<span className="text-bauhaus-red">.</span></h3>
        <div className="space-y-3 text-sm">
          <div>
            <label className="block text-[10px] font-heading font-black uppercase text-sumi-500 mb-1">氏名</label>
            <input value={name} onChange={e => setName(e.target.value)} className="w-full border-2 border-sumi-200 px-2 py-1.5 text-sm focus:border-bauhaus-black outline-none" />
          </div>
          <div>
            <label className="block text-[10px] font-heading font-black uppercase text-sumi-500 mb-1">部署</label>
            <input value={dept} onChange={e => setDept(e.target.value)} className="w-full border-2 border-sumi-200 px-2 py-1.5 text-sm focus:border-bauhaus-black outline-none" />
          </div>
          <div>
            <label className="block text-[10px] font-heading font-black uppercase text-sumi-500 mb-1">ロール</label>
            <select value={role} onChange={e => setRole(e.target.value as Employee['role'])} className="w-full border-2 border-sumi-200 px-2 py-1.5 text-sm focus:border-bauhaus-black outline-none">
              {Object.entries(ROLE_LABELS).map(([v,l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={active} onChange={e => setActive(e.target.checked)} className="w-4 h-4 border-2 border-sumi-300" />
            <span className="text-sm font-heading font-bold">アクティブ</span>
          </label>
          <div className="flex gap-2 pt-1">
            <button type="button" onClick={onClose} className="flex-1 py-2 border-2 border-bauhaus-black font-heading font-black text-xs uppercase hover:bg-sumi-50">キャンセル</button>
            <button type="button" onClick={() => setSaved(true)} className="flex-1 py-2 bg-bauhaus-black text-white border-2 border-bauhaus-black font-heading font-black text-xs uppercase">保存</button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function UsersTab() {
  const [editing, setEditing] = useState<Employee | null>(null)

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-heading font-black text-sm uppercase text-bauhaus-black">ユーザー管理<span className="text-bauhaus-red">.</span></h3>
        <button type="button" className="px-3 py-1 bg-bauhaus-black text-white text-[10px] font-heading font-black uppercase border-2 border-bauhaus-black shadow-bauhaus-sm hover:shadow-bauhaus hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all">
          ＋ 追加
        </button>
      </div>

      <div className="bg-white border-2 border-bauhaus-black shadow-bauhaus overflow-hidden">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-bauhaus-black text-white">
              {['氏名','部署','雇用形態','ロール','状態','操作'].map(h => (
                <th key={h} className="px-3 py-2 text-left font-heading font-black uppercase text-[10px]">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-sumi-100">
            {EMPLOYEES.map((emp, i) => (
              <tr key={emp.id} className={i % 2 === 0 ? 'bg-white' : 'bg-sumi-50'}>
                <td className="px-3 py-2.5 font-heading font-bold text-sumi-800">{emp.displayName}</td>
                <td className="px-3 py-2.5 text-sumi-600">{emp.dept}</td>
                <td className="px-3 py-2.5 text-sumi-600">{emp.employmentType}</td>
                <td className="px-3 py-2.5">
                  <Badge className={ROLE_COLORS[emp.role]}>{ROLE_LABELS[emp.role]}</Badge>
                </td>
                <td className="px-3 py-2.5">
                  <Badge className={emp.isActive ? 'bg-matsu/10 text-matsu' : 'bg-sumi-100 text-sumi-400'}>
                    {emp.isActive ? '在籍' : '退職'}
                  </Badge>
                </td>
                <td className="px-3 py-2.5">
                  <button type="button" onClick={() => setEditing(emp)}
                    className="text-[10px] font-heading font-black uppercase text-matsu hover:underline">
                    編集
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editing && <EditModal emp={editing} onClose={() => setEditing(null)} />}
    </div>
  )
}
