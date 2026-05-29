// 2026-04-22 claude-sonnet-4-6 セッションターン数：3
import { useState } from 'react'

export default function ChatworkTab() {
  const [token, setToken] = useState('xxxxxxxx-demo-api-token-xxxxxxxx')
  const [roomId, setRoomId] = useState('123456789')
  const [notifyShift, setNotifyShift] = useState(true)
  const [notifyLeave, setNotifyLeave] = useState(true)
  const [notifyCorr, setNotifyCorr] = useState(false)
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState<'ok' | 'error' | null>(null)
  const [saved, setSaved] = useState(false)

  function handleTest() {
    setTesting(true)
    setTestResult(null)
    setTimeout(() => { setTesting(false); setTestResult('ok') }, 1200)
  }
  function handleSave() { setSaved(true); setTimeout(() => setSaved(false), 2000) }

  return (
    <div className="space-y-4">
      <h3 className="font-heading font-black text-sm uppercase text-bauhaus-black">
        Chatwork連携<span className="text-bauhaus-red">.</span>
      </h3>

      {saved && (
        <div className="bg-matsu/10 border-2 border-matsu px-3 py-2 text-xs font-heading font-bold text-matsu">
          設定を保存しました
        </div>
      )}

      <div className="bg-white border-2 border-bauhaus-black shadow-bauhaus p-5 space-y-4">
        <div>
          <label className="block text-[10px] font-heading font-black uppercase text-sumi-500 mb-1">APIトークン</label>
          <div className="flex gap-2">
            <input type="password" value={token} onChange={e => setToken(e.target.value)}
              className="flex-1 border-2 border-sumi-200 px-3 py-2 text-sm font-mono focus:border-bauhaus-black outline-none" />
            <button type="button" onClick={handleTest} disabled={testing}
              className="px-3 py-2 border-2 border-bauhaus-black text-[10px] font-heading font-black uppercase hover:bg-sumi-50 disabled:opacity-40 transition-colors">
              {testing ? '接続中...' : '接続テスト'}
            </button>
          </div>
          {testResult === 'ok' && <p className="text-[10px] text-matsu font-heading font-black mt-1">✓ 接続成功</p>}
          {testResult === 'error' && <p className="text-[10px] text-shu font-heading font-black mt-1">✗ 接続失敗</p>}
        </div>

        <div>
          <label className="block text-[10px] font-heading font-black uppercase text-sumi-500 mb-1">通知先ルームID</label>
          <input type="text" value={roomId} onChange={e => setRoomId(e.target.value)}
            className="w-full border-2 border-sumi-200 px-3 py-2 text-sm font-mono focus:border-bauhaus-black outline-none" />
        </div>

        <div className="border-t-2 border-sumi-100 pt-4">
          <p className="text-[10px] font-heading font-black uppercase text-sumi-500 mb-3">通知タイミング</p>
          {[
            { label: 'シフト申請時',   value: notifyShift, set: setNotifyShift },
            { label: '有給申請時',     value: notifyLeave, set: setNotifyLeave },
            { label: '修正申請時',     value: notifyCorr,  set: setNotifyCorr  },
          ].map(({ label, value, set }) => (
            <label key={label} className="flex items-center gap-3 py-2 cursor-pointer border-b border-sumi-100 last:border-0">
              <button type="button" role="switch" aria-checked={value} onClick={() => set(v => !v)}
                className={`relative inline-flex h-5 w-9 shrink-0 border-2 border-transparent transition-colors rounded-full ${value ? 'bg-matsu' : 'bg-sumi-300'}`}>
                <span className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${value ? 'translate-x-4' : 'translate-x-0'}`} />
              </button>
              <span className="text-sm font-heading font-bold text-sumi-700">{label}</span>
            </label>
          ))}
        </div>

        <button type="button" onClick={handleSave}
          className="w-full py-3 bg-bauhaus-black text-white border-2 border-bauhaus-black font-heading font-black text-sm uppercase shadow-bauhaus-sm hover:shadow-bauhaus hover:-translate-x-0.5 hover:-translate-y-0.5 active:shadow-none transition-all">
          設定を保存
        </button>
      </div>
    </div>
  )
}
