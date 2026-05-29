// 2026-04-22 claude-sonnet-4-6 セッションターン数：3
import { useState } from 'react'

export default function GeofenceTab() {
  const [enabled, setEnabled] = useState(true)
  const [record, setRecord] = useState(true)
  const [block, setBlock] = useState(false)
  const [radius, setRadius] = useState('100')
  const [threshold, setThreshold] = useState('100')
  const [saved, setSaved] = useState(false)

  function handleSave() { setSaved(true); setTimeout(() => setSaved(false), 2000) }

  return (
    <div className="space-y-4">
      <h3 className="font-heading font-black text-sm uppercase text-bauhaus-black">
        ジオフェンス設定<span className="text-bauhaus-red">.</span>
      </h3>

      {saved && (
        <div className="bg-matsu/10 border-2 border-matsu px-3 py-2 text-xs font-heading font-bold text-matsu">
          設定を保存しました
        </div>
      )}

      <div className="bg-white border-2 border-bauhaus-black shadow-bauhaus p-5 space-y-5">
        {/* トグル設定 */}
        {[
          { label: 'ジオフェンス機能を有効にする', desc: 'GPS位置情報で打刻エリアを管理します', value: enabled, set: setEnabled },
          { label: '位置情報を記録する', desc: '打刻時にGPS座標をログに残します', value: record, set: setRecord },
          { label: 'エリア外の打刻をブロック', desc: 'ジオフェンス外からの出勤打刻を禁止します', value: block, set: setBlock },
        ].map(({ label, desc, value, set }) => (
          <div key={label} className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-heading font-bold text-sumi-800">{label}</p>
              <p className="text-[10px] text-sumi-400 mt-0.5">{desc}</p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={value}
              onClick={() => set(v => !v)}
              className={`relative inline-flex h-6 w-11 shrink-0 border-2 border-transparent transition-colors rounded-full ${value ? 'bg-matsu' : 'bg-sumi-300'}`}
            >
              <span className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transition-transform ${value ? 'translate-x-5' : 'translate-x-0'}`} />
            </button>
          </div>
        ))}

        <div className="border-t-2 border-sumi-100 pt-4 space-y-3">
          <div>
            <label className="block text-[10px] font-heading font-black uppercase text-sumi-500 mb-1">許容半径 (m)</label>
            <input type="number" value={radius} onChange={e => setRadius(e.target.value)} min="10" max="1000"
              className="w-full border-2 border-sumi-200 px-3 py-2 text-sm focus:border-bauhaus-black outline-none font-mono" />
          </div>
          <div>
            <label className="block text-[10px] font-heading font-black uppercase text-sumi-500 mb-1">GPS精度しきい値 (m)</label>
            <input type="number" value={threshold} onChange={e => setThreshold(e.target.value)} min="10" max="500"
              className="w-full border-2 border-sumi-200 px-3 py-2 text-sm focus:border-bauhaus-black outline-none font-mono" />
            <p className="text-[10px] text-sumi-400 mt-0.5">GPS精度がこの値を超えた場合は「測定不可」として処理します</p>
          </div>
        </div>

        {/* マップモック */}
        <div className="border-2 border-sumi-200 bg-sumi-50 h-48 flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 bg-matsu/20 border-2 border-matsu rounded-full flex items-center justify-center mx-auto mb-2">
              <svg className="w-6 h-6 text-matsu" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <p className="text-[10px] font-heading font-black uppercase text-sumi-400">地図プレビュー（デモ）</p>
          </div>
        </div>

        <button type="button" onClick={handleSave}
          className="w-full py-3 bg-bauhaus-black text-white border-2 border-bauhaus-black font-heading font-black text-sm uppercase shadow-bauhaus-sm hover:shadow-bauhaus hover:-translate-x-0.5 hover:-translate-y-0.5 active:shadow-none transition-all">
          設定を保存
        </button>
      </div>
    </div>
  )
}
