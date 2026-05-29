// 2026-05-20 claude-opus-4-7[1m] セッションターン数：1
// チャット吹き出し — user/assistant のスタイル分岐

import type { ChatMessage } from '../types'

function renderContent(text: string) {
  // 改行 + 単純なマークダウン: **bold** と `code`
  const lines = text.split('\n')
  return lines.map((line, li) => {
    const parts: React.ReactNode[] = []
    let rest = line
    let idx = 0
    while (rest.length > 0) {
      const boldMatch = rest.match(/\*\*(.+?)\*\*/)
      const codeMatch = rest.match(/`([^`]+)`/)
      const firstBold = boldMatch?.index ?? Infinity
      const firstCode = codeMatch?.index ?? Infinity
      if (firstBold === Infinity && firstCode === Infinity) {
        parts.push(rest)
        break
      }
      if (firstBold < firstCode) {
        parts.push(rest.slice(0, firstBold))
        parts.push(<strong key={`b-${li}-${idx++}`} style={{ fontWeight: 700, color: 'var(--ink)' }}>{boldMatch![1]}</strong>)
        rest = rest.slice(firstBold + boldMatch![0].length)
      } else {
        parts.push(rest.slice(0, firstCode))
        parts.push(<code key={`c-${li}-${idx++}`} style={{
          background: 'var(--paper-2)', padding: '1px 6px', borderRadius: 4, fontSize: '0.92em', fontFamily: 'monospace',
        }}>{codeMatch![1]}</code>)
        rest = rest.slice(firstCode + codeMatch![0].length)
      }
    }
    return <div key={li} style={{ minHeight: '1.5em' }}>{parts.length === 0 ? <>&nbsp;</> : parts}</div>
  })
}

export function ChatBubble({ message, userInitial, userColor }: {
  message: ChatMessage
  userInitial: string
  userColor: string
}) {
  const isUser = message.role === 'user'
  return (
    <div style={{
      display: 'flex', gap: 10,
      flexDirection: isUser ? 'row-reverse' : 'row',
      marginBottom: 14,
    }}>
      <div style={{
        width: 32, height: 32, borderRadius: '50%',
        background: isUser ? userColor : 'var(--clay)',
        color: '#fff',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 13, fontWeight: 700, flexShrink: 0,
      }}>
        {isUser ? userInitial : '🪴'}
      </div>
      <div style={{
        maxWidth: '76%',
        padding: '10px 14px',
        borderRadius: isUser ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
        background: isUser ? 'var(--clay)' : 'var(--paper-2)',
        color: isUser ? '#fff' : 'var(--ink)',
        fontSize: 14, lineHeight: 1.7,
      }}>
        {renderContent(message.content)}
      </div>
    </div>
  )
}
